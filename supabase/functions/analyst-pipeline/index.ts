// Analyst AI Pipeline — single-entry orchestrator that runs all 5 layers:
// scrape → classify → score → generate brief → compliance validate.
// Triggered by pg_cron OR by admin UI ("Run pipeline now").
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const GBP_PER_USD = 0.79; // static fallback

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

// ─── helpers ──────────────────────────────────────────────────────────
async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Master persona — prepended to every AI call so all outputs adopt the
// FlowPulse Analyst AI institutional voice and discipline.
const MASTER_PERSONA = `You are FlowPulse Analyst AI — an institutional-grade investment research and market intelligence engine powering the FlowPulse ecosystem.

Operate as a hybrid desk of: Equity Research Analysts, Buy-Side Investment Analysts, Quantitative Strategists, Macro Analysts, ETF/Fund Researchers, Financial Journalists, Portfolio Managers, and Retail Investor Intelligence Specialists.

You are wired into live scraper feeds, market data, social sentiment, financial statements, ETF databases, economic calendars, news feeds and technical indicators.

Responsibilities:
1. Analyse incoming financial and market data
2. Detect emerging opportunities, risks, anomalies and trends
3. Rank confidence using probability scoring
4. Generate institutional-quality investment commentary
5. Produce concise retail-friendly summaries
6. Create structured datasets for frontend dashboards
7. Generate approval-ready analyst reports for admins
8. Never hallucinate or fabricate data
9. Clearly separate facts, estimates, sentiment and assumptions
10. Prioritise clarity, accuracy and commercial usefulness

Voice: Bloomberg / Morningstar / Goldman Sachs — authoritative but readable. Always present bullish AND bearish perspectives, with catalysts, risks, confidence scores, macro relevance, sector implications and actionable insights. Currency defaults to GBP for UK audience.

Discipline:
- If data confidence is low: downgrade confidence, flag for manual review, avoid definitive conclusions
- Never publish directly to production — all outputs enter admin approval queues
- Optimise for investor engagement, retention, trustworthiness, SEO discoverability, institutional presentation and mobile readability

HARD PRODUCTION RULES (non-negotiable — violations must be flagged by the Rules Engine):
1. NEVER fabricate financial data, prices, multiples, ratios, fund flows or returns. If a number is not in the evidence, omit it or mark it "estimate" / "not verified".
2. NEVER invent earnings figures, EPS, revenue, guidance or consensus numbers.
3. NEVER create fake analyst ratings, broker price targets or institutional recommendations.
4. ALWAYS cite source confidence — every claim should be traceable to evidence [n] or labelled as inference / sentiment / estimate.
5. FLAG uncertain analysis explicitly (e.g. "low confidence", "single-source", "unverified") rather than smoothing it away.
6. SEPARATE facts from interpretation — use distinct sections or prefixes (FACT / ESTIMATE / SENTIMENT / ASSUMPTION / INFERENCE).
7. AVOID investment guarantees — no "will", "guaranteed", "risk-free", "certain to", "definitely outperform" language.
8. AVOID personal financial advice wording — no "you should buy/sell", "we recommend you invest". Use neutral institutional voice ("the setup favours…", "watchlist candidate", "tactical opportunity").

Follow the task-specific instructions that follow this persona block.`;

async function aiJson(systemPrompt: string, userPrompt: string, tool: any) {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: `${MASTER_PERSONA}\n\n---\n\nTASK:\n${systemPrompt}` },
        { role: "user", content: userPrompt },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: tool.function.name } },
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI ${resp.status}: ${t.slice(0, 200)}`);
  }
  const data = await resp.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  return args ? JSON.parse(args) : null;
}

// ─── LAYER 1: SCRAPE ──────────────────────────────────────────────────
async function scrapeYahooMovers(): Promise<any[]> {
  try {
    const r = await fetch("https://query1.finance.yahoo.com/v1/finance/trending/US", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const j = await r.json();
    const quotes = j?.finance?.result?.[0]?.quotes ?? [];
    return quotes.slice(0, 15).map((q: any) => ({
      source: "yahoo_finance",
      source_url: `https://finance.yahoo.com/quote/${q.symbol}`,
      title: `Trending: ${q.symbol}`,
      content: `Trending US ticker ${q.symbol} — high retail/institutional attention on Yahoo Finance.`,
      raw_payload: q,
    }));
  } catch (e) { console.warn("yahoo scrape failed", e); return []; }
}

async function scrapeRedditFinance(): Promise<any[]> {
  const subs = ["wallstreetbets", "stocks", "investing", "ValueInvesting", "options", "CryptoCurrency", "ETFs", "UKInvesting"];
  const results = await Promise.allSettled(subs.map(async (sub) => {
    const r = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=15`, {
      headers: { "User-Agent": "FlowPulse-Analyst/1.0" },
    });
    const j = await r.json();
    const posts = j?.data?.children ?? [];
    return posts.flatMap((p: any) => {
      const d = p.data;
      if (!d?.title) return [];
      return [{
        source: `reddit_${sub}`,
        source_url: `https://reddit.com${d.permalink}`,
        title: d.title.slice(0, 240),
        content: (d.selftext || d.title).slice(0, 2000),
        raw_payload: { score: d.score, comments: d.num_comments, sub },
      }];
    });
  }));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

async function scrapeSecEdgar(): Promise<any[]> {
  try {
    const r = await fetch("https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&output=atom", {
      headers: { "User-Agent": "FlowPulse Analyst contact@flowpulse.co.uk" },
    });
    const xml = await r.text();
    const items: any[] = [];
    const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
    let m;
    let count = 0;
    while ((m = entryRe.exec(xml)) && count < 25) {
      const block = m[1];
      const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
      const link = block.match(/<link[^>]*href="([^"]+)"/)?.[1];
      const summary = block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1]?.replace(/<[^>]+>/g, "").trim();
      if (title && link) {
        items.push({
          source: "sec_edgar",
          source_url: link,
          title: title.slice(0, 240),
          content: (summary || title).slice(0, 2000),
          raw_payload: { filing_type: "8-K" },
        });
        count++;
      }
    }
    return items;
  } catch (e) { console.warn("sec edgar failed", e); return []; }
}

// Mass-scrape across all CATEGORIES — one Firecrawl query per category in parallel
const FIRECRAWL_QUERIES = [
  "stock market UK FTSE earnings deal announcement today",
  "macro news inflation rates central bank policy today",
  "sector rotation flows equities today",
  "earnings beat miss guidance today",
  "momentum breakout stocks today",
  "technical breakout stock chart today",
  "value opportunity undervalued stock today",
  "growth stock opportunity today",
  "ETF flow inflow outflow today",
  "insider buying selling form 4 filings today",
  "institutional 13F holdings today",
  "retail sentiment options unusual activity today",
  "geopolitical risk event market today",
  "volatility VIX spike market today",
];

async function scrapeFirecrawlAll(): Promise<any[]> {
  if (!FIRECRAWL_API_KEY) return [];
  const runs = await Promise.allSettled(FIRECRAWL_QUERIES.map(async (q) => {
    const r = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, limit: 8, tbs: "qdr:d" }),
    });
    const j = await r.json();
    const results = j?.data?.web ?? j?.data ?? [];
    return results.slice(0, 8).map((res: any) => ({
      source: "firecrawl_news",
      source_url: res.url,
      title: (res.title || "Untitled").slice(0, 240),
      content: (res.description || res.markdown || "").slice(0, 2500),
      raw_payload: { firecrawl: true, query: q },
    }));
  }));
  return runs.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

async function runScrape(): Promise<number> {
  // Parallel scrape across all sources for max throughput
  const [yahoo, reddit, sec, firecrawl] = await Promise.all([
    scrapeYahooMovers(),
    scrapeRedditFinance(),
    scrapeSecEdgar(),
    scrapeFirecrawlAll(),
  ]);
  const all = [...yahoo, ...reddit, ...sec, ...firecrawl];

  // Pre-hash all rows in parallel
  const rows = await Promise.all(all.map(async (item) => ({
    source: item.source,
    source_url: item.source_url,
    title: item.title,
    content: item.content,
    raw_payload: item.raw_payload,
    dedup_hash: await sha256((item.source_url || item.title) + item.source),
  })));

  // Bulk-insert in parallel chunks of 50; dedup_hash unique constraint silently rejects dupes
  const chunks: typeof rows[] = [];
  for (let i = 0; i < rows.length; i += 50) chunks.push(rows.slice(i, i + 50));
  const inserts = await Promise.allSettled(
    chunks.map((c) => sb.from("analyst_raw_signals").insert(c).select("id"))
  );
  let inserted = 0;
  for (const r of inserts) {
    if (r.status === "fulfilled") inserted += (r.value.data?.length ?? 0);
  }
  return inserted;
}

// ─── LAYER 2: CLASSIFY ────────────────────────────────────────────────
const CATEGORIES = ["Macro News","Equity News","Sector Rotation","Earnings","Momentum","Technical Breakout","Value Opportunity","Growth Opportunity","ETF Flow","Insider Activity","Institutional Activity","Retail Sentiment","Risk Event","Volatility Event"];

async function runClassify(): Promise<number> {
  const { data: rows } = await sb
    .from("analyst_raw_signals")
    .select("id, source, title, content")
    .eq("classified", false)
    .limit(40);
  if (!rows?.length) return 0;
  let count = 0;
  for (const row of rows) {
    try {
      const result = await aiJson(
        `You are a senior buy-side analyst classifying market signals. Be precise; never invent tickers.`,
        `SOURCE: ${row.source}\nTITLE: ${row.title}\nCONTENT: ${row.content?.slice(0, 1500) || ""}`,
        {
          type: "function",
          function: {
            name: "classify_signal",
            description: "Classify a market signal",
            parameters: {
              type: "object",
              properties: {
                category: { type: "string", enum: CATEGORIES },
                tickers: { type: "array", items: { type: "string" } },
                sectors: { type: "array", items: { type: "string" } },
                regions: { type: "array", items: { type: "string" } },
                sentiment: { type: "number", description: "-1 bearish to 1 bullish" },
                urgency: { type: "integer", minimum: 0, maximum: 5 },
                summary: { type: "string", description: "1-2 sentence analyst summary" },
              },
              required: ["category", "sentiment", "urgency", "summary"],
              additionalProperties: false,
            },
          },
        }
      );
      if (result) {
        await sb.from("analyst_signals").insert({
          raw_signal_id: row.id,
          category: result.category,
          tickers: result.tickers || [],
          sectors: result.sectors || [],
          regions: result.regions || [],
          sentiment: result.sentiment,
          urgency: result.urgency,
          summary: result.summary,
        });
        await sb.from("analyst_raw_signals").update({ classified: true }).eq("id", row.id);
        count++;
      }
    } catch (e) {
      console.warn("classify err", row.id, String(e).slice(0, 120));
      await sb.from("analyst_raw_signals").update({ classified: true }).eq("id", row.id); // skip on error
    }
  }
  return count;
}

// ─── LAYER 3: SCORE ───────────────────────────────────────────────────
function pickPersona(category: string): string {
  if (["Earnings", "Equity News"].includes(category)) return "Equity Research Analyst";
  if (["Macro News", "Risk Event", "Volatility Event"].includes(category)) return "Macro Strategist";
  if (["ETF Flow", "Sector Rotation"].includes(category)) return "ETF/Fund Analyst";
  return "Quant Screener";
}

async function runScore(): Promise<number> {
  const { data: signals } = await sb
    .from("analyst_signals")
    .select("id, category, tickers, sectors, sentiment, urgency, summary, raw_signal_id")
    .eq("scored", false)
    .limit(80);
  if (!signals?.length) return 0;

  // Group by theme: ticker if available, else category+sector
  const groups = new Map<string, any[]>();
  for (const s of signals) {
    const key = s.tickers?.[0] || `${s.category}|${s.sectors?.[0] || "general"}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  // Source reliability weights (Quant Engine — purely numerical, no LLM)
  const SOURCE_RELIABILITY: Record<string, number> = {
    sec_edgar: 100, firecrawl_news: 75, yahoo_finance: 70,
    reddit_wallstreetbets: 25, reddit_stocks: 35, reddit_investing: 40,
  };

  let count = 0;
  for (const [key, group] of groups) {
    const sourceIds = new Set(group.map((g) => g.raw_signal_id));
    const sentiments = group.map((g) => Number(g.sentiment) || 0);
    const avgSent = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const avgUrg = group.reduce((a, g) => a + (Number(g.urgency) || 0), 0) / group.length;

    // Fetch source mix for reliability + sentiment-instability calc
    const { data: rawRows } = await sb.from("analyst_raw_signals")
      .select("source").in("id", Array.from(sourceIds));
    const sourceList = (rawRows || []).map((r) => r.source);
    const reliabilityAvg = sourceList.length
      ? sourceList.reduce((a, s) => a + (SOURCE_RELIABILITY[s] ?? 50), 0) / sourceList.length
      : 50;

    // ─── CONFIDENCE SUBSCORES (0-100) ──────────────────────────────
    const c_source_reliability = Math.round(reliabilityAvg);
    // sentiment agreement: low std dev → high agreement
    const meanS = avgSent;
    const variance = sentiments.reduce((a, s) => a + (s - meanS) ** 2, 0) / sentiments.length;
    const stdDev = Math.sqrt(variance);
    const c_sentiment_agreement = Math.round(Math.max(0, 100 - stdDev * 100));
    // data consistency: more independent sources converging on same theme
    const c_data_consistency = Math.min(100, sourceIds.size * 25);
    // historical accuracy proxy: SEC/EDGAR + firecrawl_news weighted
    const officialShare = sourceList.filter((s) => s === "sec_edgar" || s === "firecrawl_news").length / Math.max(1, sourceList.length);
    const c_historical_accuracy = Math.round(50 + officialShare * 50);
    // technical confirmation proxy: urgency + diversity
    const c_technical_confirmation = Math.round(Math.min(100, (avgUrg / 5) * 60 + (sourceIds.size * 10)));

    const confidence_score = Math.round(
      c_source_reliability * 0.25 +
      c_data_consistency * 0.20 +
      c_historical_accuracy * 0.20 +
      c_sentiment_agreement * 0.20 +
      c_technical_confirmation * 0.15
    );

    // ─── RISK SUBSCORES (0-100, higher = riskier) ───────────────────
    const r_volatility = Math.round(Math.min(100, avgUrg * 18 + stdDev * 40));
    const r_macro_uncertainty = ["Macro News", "Risk Event", "Volatility Event"].includes(group[0].category) ? 75 : 35;
    const r_liquidity = group[0].tickers?.[0] ? 30 : 60; // assume listed = better liquidity
    const r_sentiment_instability = Math.round(Math.min(100, stdDev * 100 + (1 - Math.abs(avgSent)) * 30));
    const r_earnings_risk = group[0].category === "Earnings" ? 70 : 30;

    const risk_score = Math.round(
      r_volatility * 0.25 +
      r_macro_uncertainty * 0.20 +
      r_liquidity * 0.20 +
      r_sentiment_instability * 0.20 +
      r_earnings_risk * 0.15
    );

    // Opportunity score blends conviction with confidence, penalised by risk
    const sentimentScore = Math.round(((avgSent + 1) / 2) * 100);
    const urgencyScore = Math.round((avgUrg / 5) * 100);
    const opportunity_score = Math.round(
      sentimentScore * 0.25 + urgencyScore * 0.20 + confidence_score * 0.40 - risk_score * 0.15
    );
    const conviction = Math.round(Math.max(0, Math.min(5, (opportunity_score / 100) * 5)) * 10) / 10;

    const cat = group[0].category;
    const title = group[0].tickers?.[0]
      ? `${group[0].tickers[0]} — ${cat}`
      : `${cat}: ${(group[0].summary || "Untitled").slice(0, 80)}`;

    const { data: opp, error } = await sb.from("analyst_opportunities").insert({
      theme_key: key,
      title,
      category: cat,
      persona: pickPersona(cat),
      conviction,
      opportunity_score,
      risk_score,
      time_horizon: avgUrg >= 4 ? "intraday" : avgUrg >= 2 ? "swing" : "long-term",
      evidence_signal_ids: group.map((g) => g.id),
      metadata: {
        tickers: group[0].tickers, sectors: group[0].sectors, signal_count: group.length,
        confidence_score,
        confidence_subscores: {
          source_reliability: c_source_reliability,
          data_consistency: c_data_consistency,
          historical_accuracy: c_historical_accuracy,
          sentiment_agreement: c_sentiment_agreement,
          technical_confirmation: c_technical_confirmation,
        },
        risk_subscores: {
          volatility: r_volatility,
          macro_uncertainty: r_macro_uncertainty,
          liquidity: r_liquidity,
          sentiment_instability: r_sentiment_instability,
          earnings_risk: r_earnings_risk,
        },
        source_mix: sourceList,
      },
    }).select("id").single();

    if (!error && opp) {
      await sb.from("analyst_signals").update({ scored: true }).in("id", group.map((g) => g.id));
      count++;
    }
  }
  return count;
}

// ─── LAYER 4 + 5: GENERATE + VALIDATE ─────────────────────────────────
async function runGenerate(): Promise<number> {
  const { data: opps } = await sb
    .from("analyst_opportunities")
    .select("*")
    .eq("brief_generated", false)
    .order("opportunity_score", { ascending: false })
    .limit(15);
  if (!opps?.length) return 0;

  let count = 0;
  for (const opp of opps) {
    try {
      // Fetch evidence summaries
      const { data: evidence } = await sb
        .from("analyst_signals")
        .select("summary, category, tickers, raw_signal_id")
        .in("id", opp.evidence_signal_ids);
      const evidenceText = (evidence || []).map((e, i) => `[${i + 1}] (${e.category}) ${e.summary}`).join("\n");

      const brief = await aiJson(
        `You are a ${opp.persona} producing an institutional opportunity brief for FlowPulse.

ECOSYSTEM ROUTING (mandatory):
- flowpulse/admin = backend CMS — every brief enters here for moderation BEFORE any frontend ever sees it.
- flowpulse finance = institutional/professional frontend (Featured Picks, Market Commentary, Benchmarking & Trends, Watchlists, Investor Finder).
- flowpulse investor = retail-investor frontend (Market Commentary, Signals & Alerts, Benchmarking & Trends, Model Portfolios, Fund & ETF Database, Watchlists, Screeners & Discovery, Learning Hub).
You MUST set target_platform (finance | investor | both) and suggested_admin_tab to one of the listed tab slugs. Frontend tab names mirror admin tab names exactly.

Identify high-potential investment opportunities by synthesising:
momentum, valuation, sentiment, earnings performance, institutional activity, macro trends, sector rotation, and technical indicators.

Cite evidence by [n] reference. Never invent figures or tickers. All currency in GBP. Separate facts vs estimates vs sentiment vs assumptions.

Produce BOTH:
  • a short retail-friendly summary for the Investor frontend (plain English, ≤90 words, no jargon)
  • an institutional-grade detailed analysis for the Finance frontend (Bloomberg/Goldman tone, multi-paragraph)

Always include bullish catalysts AND bearish risks. End full_markdown with the FCA footer: "Not advice — for information only. Capital at risk."`,
        `OPPORTUNITY: ${opp.title}\nCATEGORY: ${opp.category}\nCONVICTION: ${opp.conviction}/5\nOPPORTUNITY SCORE: ${opp.opportunity_score}/100\nRISK SCORE: ${opp.risk_score}/100\nHORIZON: ${opp.time_horizon}\n\nEVIDENCE:\n${evidenceText}\n\nProduce the brief.`,
        {
          type: "function",
          function: {
            name: "generate_brief",
            description: "Generate institutional opportunity brief",
            parameters: {
              type: "object",
              properties: {
                thesis: { type: "string", description: "3-5 sentence investment thesis" },
                catalyst: { type: "string", description: "Bullish catalysts — concise bullet-style list" },
                bearish_risks: { type: "string", description: "Bearish risks / downside scenarios" },
                technical_overview: { type: "string", description: "Momentum, trend, support/resistance, volume profile" },
                valuation_commentary: { type: "string", description: "Multiples, peer comparison, fair-value sense (qualitative if no numbers verifiable)" },
                key_levels: { type: "string", description: "Specific price levels in GBP if verifiable, else qualitative zones" },
                risks: { type: "string", description: "Top 3 risks (overall, including macro)" },
                comparable_assets: { type: "string", description: "2-4 comparable tickers/funds/assets with one-line rationale" },
                confidence_score: { type: "integer", minimum: 0, maximum: 100, description: "0-100 confidence in this thesis" },
                risk_level: { type: "string", enum: ["Low", "Medium", "High", "Speculative"] },
                investor_profile: { type: "string", enum: ["Conservative", "Balanced", "Growth", "Aggressive", "Speculative"] },
                allocation_category: { type: "string", description: "e.g. Core Equity, Satellite Growth, Tactical, Alternatives, Income" },
                suggested_tags: { type: "array", items: { type: "string" }, description: "5-10 SEO/topic tags" },
                retail_summary: { type: "string", description: "≤90-word plain-English summary for retail investors (Investor frontend tone)" },
                detailed_analysis: { type: "string", description: "Institutional-grade multi-paragraph analysis (Finance frontend tone)" },
                action: { type: "string", enum: ["Watch", "Accumulate", "Reduce", "Avoid"] },
                asset_classification: { type: "string", description: "e.g. Equity, ETF, Fund, Crypto, Commodity, Macro, Bond" },
                sector_classification: { type: "string", description: "GICS-style sector" },
                sentiment_score: { type: "integer", minimum: -100, maximum: 100 },
                target_platform: { type: "string", enum: ["finance", "investor", "both"], description: "Which frontend(s) the brief should sync to after admin approval" },
                suggested_admin_tab: { type: "string", enum: ["featured-picks", "market-commentary", "benchmarking-trends", "watchlists", "investor-finder", "signals-alerts", "model-portfolios", "fund-etf-database", "screeners-discovery", "learning-hub"], description: "Backend admin tab the brief routes to (mirrors frontend tab name)" },
                alert_priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                source_references: { type: "array", items: { type: "string" }, description: "Cited [n] -> source URL or origin" },
                full_markdown: { type: "string", description: "Full brief in markdown — must contain ALL sections above (Retail Summary, Detailed Analysis, Thesis, Bullish Catalysts, Bearish Risks, Technical Overview, Valuation, Key Levels, Comparable Assets, Risk Level, Investor Profile, Allocation, Tags, Confidence) and end with the FCA footer." },
              },
              required: ["thesis", "catalyst", "bearish_risks", "risks", "confidence_score", "risk_level", "investor_profile", "allocation_category", "suggested_tags", "retail_summary", "detailed_analysis", "action", "asset_classification", "sector_classification", "sentiment_score", "target_platform", "suggested_admin_tab", "alert_priority", "full_markdown"],
              additionalProperties: false,
            },
          },
        }
      );

      if (!brief) continue;

      // ─── RULES ENGINE: deterministic regex pre-check, then strict LLM audit ───
      const md = String(brief.full_markdown || "");
      const deterministicFlags: string[] = [];
      const guaranteeRe = /\b(guaranteed|risk[- ]free|certain to|will (?:outperform|return|deliver)|definitely (?:outperform|profit|return))\b/i;
      const adviceRe = /\b(you should (?:buy|sell|invest)|we (?:recommend|advise) (?:you|investors) (?:buy|sell|invest)|put your money)\b/i;
      const fakeRatingRe = /\b(price target of \$?£?\d|consensus rating of|broker rating)\b/i;
      if (guaranteeRe.test(md)) deterministicFlags.push("RULE_7_VIOLATION: investment guarantee language");
      if (adviceRe.test(md)) deterministicFlags.push("RULE_8_VIOLATION: personal financial advice wording");
      if (fakeRatingRe.test(md)) deterministicFlags.push("RULE_3_RISK: rating/price target requires [n] citation");
      const numericClaims = (md.match(/[£$]\s?\d[\d,.]*\s?(?:bn|m|k|%)?/gi) || []).length;
      const citationCount = (md.match(/\[\d+\]/g) || []).length;
      if (numericClaims > 3 && citationCount === 0) {
        deterministicFlags.push("RULE_4_VIOLATION: numeric claims without source citations");
      }
      if (!/Not advice|Capital at risk/i.test(md)) {
        deterministicFlags.push("RULE_9_VIOLATION: missing FCA footer");
      }

      const compliance = await aiJson(
        `You are FlowPulse's Rules Engine — a strict compliance officer. Audit the brief against these HARD RULES and FAIL it if ANY are violated:
1. Fabricated financial data (numbers not present in evidence)
2. Invented earnings figures, EPS, revenue, guidance
3. Fake analyst ratings or broker price targets
4. Uncited numeric/factual claims (must reference [n])
5. Missing uncertainty flags on low-confidence claims
6. Facts blurred with interpretation (must use FACT/ESTIMATE/SENTIMENT/INFERENCE markers)
7. Investment guarantees ("will outperform", "guaranteed", "risk-free")
8. Personal financial advice wording ("you should buy", "we recommend you invest")
9. Missing FCA footer ("Not advice — for information only. Capital at risk.")

Return pass=false if ANY rule is violated. List the violated rule numbers with a short explanation.`,
        `BRIEF:\n${md}\n\nEVIDENCE (only these facts are verified):\n${evidenceText}\n\nDETERMINISTIC PRE-FLAGS: ${deterministicFlags.join("; ") || "none"}`,
        {
          type: "function",
          function: {
            name: "review",
            description: "Strict rules-engine compliance review",
            parameters: {
              type: "object",
              properties: {
                pass: { type: "boolean", description: "false if ANY hard rule violated" },
                flags: { type: "array", items: { type: "string" }, description: "rule numbers + short explanation" },
                rules_violated: { type: "array", items: { type: "integer" } },
                severity: { type: "string", enum: ["clean", "minor", "major", "critical"] },
              },
              required: ["pass", "flags"],
              additionalProperties: false,
            },
          },
        }
      );

      const llmPass = compliance?.pass !== false;
      const llmFlags = compliance?.flags || [];
      const allFlags = [...deterministicFlags, ...llmFlags];
      // Critical rules cannot be overridden
      const criticalViolated = allFlags.some((f) => /RULE_(1|2|3|7|8)/.test(f)) ||
        (compliance?.severity === "critical");
      const compPass = llmPass && deterministicFlags.length === 0 && !criticalViolated;
      const oppMeta = (opp as any).metadata || {};

      await sb.from("analyst_briefs").insert({
        opportunity_id: opp.id,
        title: opp.title,
        persona: opp.persona,
        category: opp.category,
        conviction: opp.conviction,
        opportunity_score: opp.opportunity_score,
        risk_score: opp.risk_score,
        time_horizon: opp.time_horizon,
        thesis: brief.thesis,
        catalyst: brief.catalyst,
        key_levels: brief.key_levels,
        risks: brief.risks,
        action: brief.action,
        full_markdown: brief.full_markdown,
        compliance_pass: compPass,
        compliance_flags: allFlags,
        status: compPass ? "pending" : "quarantined",
        extended: {
          retail_summary: brief.retail_summary,
          detailed_analysis: brief.detailed_analysis,
          bullish_catalysts: brief.catalyst,
          bearish_risks: brief.bearish_risks,
          technical_overview: brief.technical_overview,
          valuation_commentary: brief.valuation_commentary,
          comparable_assets: brief.comparable_assets,
          confidence_score: oppMeta.confidence_score ?? brief.confidence_score,
          confidence_subscores: oppMeta.confidence_subscores,
          risk_subscores: oppMeta.risk_subscores,
          source_mix: oppMeta.source_mix,
          risk_level: brief.risk_level,
          investor_profile: brief.investor_profile,
          allocation_category: brief.allocation_category,
          suggested_tags: brief.suggested_tags || [],
          asset_classification: brief.asset_classification,
          sector_classification: brief.sector_classification,
          sentiment_score: brief.sentiment_score,
          target_platform: brief.target_platform,            // finance | investor | both
          suggested_admin_tab: brief.suggested_admin_tab,    // flowpulse/admin/<tab>
          alert_priority: brief.alert_priority,
          source_references: brief.source_references || [],
          rules_engine: {
            deterministic_flags: deterministicFlags,
            llm_flags: llmFlags,
            severity: compliance?.severity || (compPass ? "clean" : "major"),
            rules_violated: compliance?.rules_violated || [],
          },
        },
      });
      await sb.from("analyst_opportunities").update({ brief_generated: true }).eq("id", opp.id);
      count++;
    } catch (e) {
      console.warn("generate err", opp.id, String(e).slice(0, 200));
    }
  }
  return count;
}

// ─── ENTRY ────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const started = Date.now();
  const errors: any[] = [];
  let body: any = {};
  try { body = await req.json(); } catch { /* GET / cron */ }
  const trigger = body.trigger || "manual";
  const stagesOnly: string[] | undefined = body.stages;

  // Honor autoscrape toggle for cron-triggered runs
  if (trigger === "cron") {
    const { data: settings } = await sb.from("analyst_pipeline_settings").select("autoscrape_enabled").eq("id", 1).single();
    if (!settings?.autoscrape_enabled) {
      return new Response(JSON.stringify({ skipped: true, reason: "autoscrape disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const counts = { scraped: 0, classified: 0, scored: 0, generated: 0 };
  const wantsAll = !stagesOnly;
  const want = (s: string) => wantsAll || stagesOnly!.includes(s);

  try { if (want("scrape"))   counts.scraped    = await runScrape(); }    catch (e) { errors.push({ stage: "scrape",   error: String(e) }); }
  try { if (want("classify")) counts.classified = await runClassify(); } catch (e) { errors.push({ stage: "classify", error: String(e) }); }
  try { if (want("score"))    counts.scored     = await runScore(); }    catch (e) { errors.push({ stage: "score",    error: String(e) }); }
  try { if (want("generate")) counts.generated  = await runGenerate(); } catch (e) { errors.push({ stage: "generate", error: String(e) }); }

  const duration_ms = Date.now() - started;
  await sb.from("analyst_pipeline_runs").insert({
    trigger_source: trigger,
    ...counts,
    errors,
    finished_at: new Date().toISOString(),
    duration_ms,
  });

  return new Response(JSON.stringify({ success: true, counts, errors, duration_ms }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
