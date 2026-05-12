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

async function aiJson(systemPrompt: string, userPrompt: string, tool: any) {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
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
  const subs = ["wallstreetbets", "stocks", "investing"];
  const items: any[] = [];
  for (const sub of subs) {
    try {
      const r = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=10`, {
        headers: { "User-Agent": "FlowPulse-Analyst/1.0" },
      });
      const j = await r.json();
      const posts = j?.data?.children ?? [];
      for (const p of posts) {
        const d = p.data;
        if (!d?.title) continue;
        items.push({
          source: `reddit_${sub}`,
          source_url: `https://reddit.com${d.permalink}`,
          title: d.title.slice(0, 240),
          content: (d.selftext || d.title).slice(0, 2000),
          raw_payload: { score: d.score, comments: d.num_comments, sub },
        });
      }
    } catch (e) { console.warn(`reddit ${sub} failed`, e); }
  }
  return items;
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
    while ((m = entryRe.exec(xml)) && count < 15) {
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

async function scrapeFirecrawlNews(): Promise<any[]> {
  if (!FIRECRAWL_API_KEY) return [];
  try {
    const r = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "stock market UK FTSE earnings deal announcement today",
        limit: 10,
        tbs: "qdr:d",
      }),
    });
    const j = await r.json();
    const results = j?.data?.web ?? j?.data ?? [];
    return results.slice(0, 10).map((res: any) => ({
      source: "firecrawl_news",
      source_url: res.url,
      title: (res.title || "Untitled").slice(0, 240),
      content: (res.description || res.markdown || "").slice(0, 2500),
      raw_payload: { firecrawl: true },
    }));
  } catch (e) { console.warn("firecrawl news failed", e); return []; }
}

async function runScrape(): Promise<number> {
  const all = [
    ...(await scrapeYahooMovers()),
    ...(await scrapeRedditFinance()),
    ...(await scrapeSecEdgar()),
    ...(await scrapeFirecrawlNews()),
  ];
  let inserted = 0;
  for (const item of all) {
    const hash = await sha256((item.source_url || item.title) + item.source);
    const { error } = await sb.from("analyst_raw_signals").insert({
      source: item.source,
      source_url: item.source_url,
      title: item.title,
      content: item.content,
      raw_payload: item.raw_payload,
      dedup_hash: hash,
    });
    if (!error) inserted++;
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

  let count = 0;
  for (const [key, group] of groups) {
    const sources = new Set(group.map((g) => g.raw_signal_id));
    const avgSent = group.reduce((a, g) => a + (Number(g.sentiment) || 0), 0) / group.length;
    const avgUrg = group.reduce((a, g) => a + (Number(g.urgency) || 0), 0) / group.length;
    const sentimentScore = Math.round(((avgSent + 1) / 2) * 100); // 0-100
    const urgencyScore = Math.round((avgUrg / 5) * 100);
    const diversityScore = Math.min(100, sources.size * 25);
    const opportunity_score = Math.round(sentimentScore * 0.35 + urgencyScore * 0.35 + diversityScore * 0.30);
    const conviction = Math.round((opportunity_score / 100) * 5 * 10) / 10; // 0-5 with 1 decimal
    const risk_score = Math.round(Math.max(0, Math.min(100, (1 - Math.abs(avgSent)) * 60 + (avgUrg * 8))));

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
      metadata: { tickers: group[0].tickers, sectors: group[0].sectors, signal_count: group.length },
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
        `You are a ${opp.persona} writing a buy-side research brief. Cite evidence by [n] reference. Never invent figures. All currency must be GBP. Add an FCA-style "Not advice — for information only" footer.`,
        `OPPORTUNITY: ${opp.title}\nCATEGORY: ${opp.category}\nCONVICTION: ${opp.conviction}/5\nSCORE: ${opp.opportunity_score}/100\nRISK: ${opp.risk_score}/100\nHORIZON: ${opp.time_horizon}\n\nEVIDENCE:\n${evidenceText}\n\nProduce the brief.`,
        {
          type: "function",
          function: {
            name: "generate_brief",
            description: "Generate analyst brief",
            parameters: {
              type: "object",
              properties: {
                thesis: { type: "string", description: "3-5 sentence investment thesis" },
                catalyst: { type: "string", description: "Near-term catalyst" },
                key_levels: { type: "string", description: "Price levels / support / resistance, GBP if applicable" },
                risks: { type: "string", description: "Top 3 risks" },
                action: { type: "string", description: "Suggested action: Watch / Accumulate / Avoid" },
                full_markdown: { type: "string", description: "Full brief in markdown with all sections + FCA footer" },
              },
              required: ["thesis", "catalyst", "risks", "action", "full_markdown"],
              additionalProperties: false,
            },
          },
        }
      );

      if (!brief) continue;

      // Compliance pass
      const compliance = await aiJson(
        `You are a compliance officer reviewing a buy-side brief for hallucination / unverifiable claims. Be strict.`,
        `BRIEF:\n${brief.full_markdown}\n\nEVIDENCE:\n${evidenceText}`,
        {
          type: "function",
          function: {
            name: "review",
            description: "Compliance review",
            parameters: {
              type: "object",
              properties: {
                pass: { type: "boolean" },
                flags: { type: "array", items: { type: "string" } },
              },
              required: ["pass", "flags"],
              additionalProperties: false,
            },
          },
        }
      );

      const compPass = compliance?.pass !== false;
      const flags = compliance?.flags || [];

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
        compliance_flags: flags,
        status: compPass ? "pending" : "quarantined",
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
