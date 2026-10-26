// Shared AI research report generator used by both
// `generate-research-report-ai` (manual) and `run-research-scraper-schedules` (autopilot).
import { type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { meteredFetch } from "./metered.ts";
import { type AnalystReport, type ReportSource, composeReport, escapeHtml } from "./reportComposer.ts";

const CURATED_STOCK = [
  // Mainstream / mega-cap coverage
  "https://finance.yahoo.com",
  "https://www.marketwatch.com/latest-news",
  "https://seekingalpha.com",
  "https://www.ft.com/markets",
  "https://www.bloomberg.com/markets",
  // Small-cap, micro-cap, penny-stock, and high-potential discovery sources
  "https://www.benzinga.com/small-cap",
  "https://www.smallcaps.com.au",
  "https://www.stockhouse.com/news/penny-stock-news",
  "https://www.proactiveinvestors.co.uk/companies/news",
  "https://www.investorshub.advfn.com",
  "https://www.streetinsider.com/Small+Cap+News.html",
  "https://www.fool.com/investing/small-cap-stocks/",
  "https://www.nasdaq.com/market-activity/stocks/screener",
];
const CURATED_CRYPTO = [
  // Major coverage
  "https://www.coindesk.com",
  "https://decrypt.co",
  "https://cointelegraph.com",
  "https://messari.io/research",
  "https://defillama.com",
  // Low-cap, micro-cap, memecoin and high-potential discovery sources
  "https://www.coingecko.com/en/categories/small-cap",
  "https://www.coingecko.com/en/new-cryptocurrencies",
  "https://dexscreener.com/new-pairs",
  "https://www.coinmarketcap.com/new/",
  "https://www.coinmarketcap.com/gainers-losers/",
  "https://cryptoslate.com/coins/",
  "https://birdeye.so/find-gems",
  "https://www.bankless.com",
];

interface ScrapedSource {
  url: string;
  title?: string;
  excerpt?: string;
  markdown?: string;
}

async function firecrawlSearch(query: string, limit: number): Promise<ScrapedSource[]> {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) return [];
  try {
    const r = await meteredFetch("research-report-generator", "https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit, scrapeOptions: { formats: ["markdown"] } }),
    });
    const d = await r.json();
    const list = d?.data ?? d?.web?.results ?? [];
    return (Array.isArray(list) ? list : []).slice(0, limit).map((x: any) => ({
      url: x.url, title: x.title, excerpt: x.description, markdown: x.markdown,
    }));
  } catch (_) { return []; }
}

async function firecrawlScrape(url: string): Promise<ScrapedSource | null> {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) return null;
  try {
    const r = await meteredFetch("research-report-generator", "https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
    });
    const d = await r.json();
    const doc = d?.data ?? d;
    return { url, title: doc?.metadata?.title, markdown: (doc?.markdown ?? "").slice(0, 8000) };
  } catch (_) { return null; }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)
    + "-" + Math.random().toString(36).slice(2, 7);
}

function imageBytesFromDataUrl(dataUrl: string): { bytes: Uint8Array; contentType: string } | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, contentType: match[1] };
}

function cleanForPrompt(value: unknown, limit = 700): string {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

async function createReportThumbnail(opts: {
  assetType: "stock" | "crypto";
  topic: string;
  ticker?: string;
  title: string;
  excerpt?: string;
  tags?: string[];
  firstPageHtml?: string;
  slug: string;
  admin: SupabaseClient;
}): Promise<string | null> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return null;

  const visualBrief = [
    `Report title: ${cleanForPrompt(opts.title, 220)}`,
    `Original topic: ${cleanForPrompt(opts.topic, 180)}`,
    opts.ticker ? `Ticker / asset: ${cleanForPrompt(opts.ticker, 40)}` : "",
    opts.excerpt ? `Report summary: ${cleanForPrompt(opts.excerpt, 360)}` : "",
    opts.tags?.length ? `Themes: ${opts.tags.slice(0, 6).map((t) => cleanForPrompt(t, 40)).join(", ")}` : "",
    opts.firstPageHtml ? `Evidence from report: ${cleanForPrompt(opts.firstPageHtml, 650)}` : "",
  ].filter(Boolean).join("\n");

  const prompt = `Create a bespoke 16:9 editorial thumbnail image for a FlowPulse institutional ${opts.assetType === "stock" ? "stock equity" : "crypto asset"} research report.

${visualBrief}

Image direction:
- Make the subject matter visibly specific to this report, not a generic finance background.
- Translate the company, sector, asset, catalyst, or macro theme into concrete visual symbols.
- Premium institutional research aesthetic: dark slate/black base, deep blue accents for stocks, refined purple/blue accents for crypto, realistic cinematic lighting.
- No readable text, no captions, no UI mockups, no brand logos, no watermarks.
- Sharp, high-end thumbnail composition with clear focal point and enough contrast for a report card image.`;

  try {
    const response = await meteredFetch("research-report-generator", "https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });
    if (!response.ok) throw new Error(`image gateway ${response.status}: ${(await response.text()).slice(0, 180)}`);
    const data = await response.json();
    const imageUrl: string | undefined = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const decoded = imageUrl ? imageBytesFromDataUrl(imageUrl) : null;
    if (!decoded) throw new Error("image gateway returned no usable image");

    const extension = decoded.contentType.includes("jpeg") || decoded.contentType.includes("jpg") ? "jpg" : "png";
    const filePath = `research-thumbnails/${opts.assetType}/${opts.slug}.${extension}`;
    const { error: uploadError } = await opts.admin.storage
      .from("reports")
      .upload(filePath, decoded.bytes, { contentType: decoded.contentType, upsert: true });
    if (uploadError) throw uploadError;

    const { data: publicUrl } = opts.admin.storage.from("reports").getPublicUrl(filePath);
    return publicUrl?.publicUrl ?? null;
  } catch (error) {
    console.error("AI thumbnail generation failed:", (error as Error).message);
    return null;
  }
}

export async function runGeneration(opts: {
  assetType: "stock" | "crypto";
  topic: string;
  ticker?: string;
  extraUrls?: string[];
  createdBy: string;
  admin: SupabaseClient;
}) {
  const { assetType, topic, ticker = "", extraUrls = [], createdBy, admin } = opts;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const year = new Date().getFullYear();
  const baseQuery = `${topic} ${assetType === "crypto" ? "cryptocurrency on-chain fundamentals analyst report" : "stock equity research earnings outlook"} ${year}`;
  const discoveryQuery = assetType === "crypto"
    ? `${topic} low cap altcoin micro-cap memecoin high potential ${year}`
    : `${topic} small-cap micro-cap penny stock catalyst breakout ${year}`;
  const curated = assetType === "crypto" ? CURATED_CRYPTO : CURATED_STOCK;
  // Rotate curated sources so low-cap / discovery domains are picked up across runs
  const shuffled = [...curated].sort(() => Math.random() - 0.5);
  const tasks: Promise<any>[] = [
    firecrawlSearch(baseQuery, 6),
    firecrawlSearch(discoveryQuery, 6),
    ...shuffled.slice(0, 5).map((u) => firecrawlScrape(u)),
    ...extraUrls.slice(0, 5).map((u) => firecrawlScrape(u)),
  ];
  const results = await Promise.all(tasks);
  const [mainSearch, discoverySearch, ...rest] = results;
  const sources: ScrapedSource[] = [
    ...((mainSearch as ScrapedSource[]) ?? []),
    ...((discoverySearch as ScrapedSource[]) ?? []),
    ...(rest.filter(Boolean) as ScrapedSource[]),
  ].filter((s) => s && (s.markdown || s.excerpt)).slice(0, 16);

  const context = sources.map((s, i) =>
    `### Source ${i + 1}: ${s.title ?? s.url}\nURL: ${s.url}\n${(s.markdown || s.excerpt || "").slice(0, 2800)}`
  ).join("\n\n---\n\n");

  const reportDate = new Date().toISOString().slice(0, 10);
  const assetWord = assetType === "crypto" ? "digital-asset" : "equity";
  const systemPrompt = `You are the lead ${assetWord} analyst at FlowPulse Research, writing an institutional research report for professional and sophisticated investors. The standard is a tier-1 sell-side or independent research house: precise, evidence-led, balanced and readable.

EVIDENCE RULES (non-negotiable):
- Every figure (price, market cap, revenue, growth, multiples, supply, TVL, dates) must come from the numbered RESEARCH CONTEXT and carry its source marker, e.g. "revenue rose 12% [3]". Cite with plain [n] markers only — never write links or URLs.
- If a number is not in the context, do not state it. Give a qualitative view instead, or list it under data_gaps.
- Never invent analyst ratings, broker price targets, consensus figures or guidance. Do not set your own price target; discuss valuation relative to peers and history using cited figures only.
- Separate fact from interpretation: write "The data shows…" for facts and "We think…" / "In our view…" for judgement.
- Present the bear case as seriously as the bull case. No hype, no emojis, no marketing language, no guarantees, no personal advice ("you should buy").

CURRENCY: express money in GBP (£) with UK conventions (£1.25, £3.4m, £12bn). Convert foreign-currency figures at a recent indicative rate and keep the source marker.

SECTIONS: write 4–8 analysis sections, each 350–800 words of substantive analysis (no filler). Choose titles that fit the evidence; typically: Investment Thesis; Market & Macro Context; ${assetType === "crypto" ? "Network, Tokenomics & On-chain Fundamentals" : "Business Model & Financial Performance"}; Competitive Position; Valuation Context; Outlook. Do not write separate executive-summary, scenarios, risks, catalysts or sources sections — those are built from your structured fields.

SECTION HTML: inner markup only, using <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>, <table class='data-table'> (with <thead>/<tbody>) for comparisons, <div class='callout'> for one key point per section at most, and <div class='stat-grid'><div class='stat'><span class='label'>…</span><span class='value'>…</span></div></div> for 3–6 cited KPI tiles. No <h1>/<h2>, no inline styles, no scripts.

Call the publish_report tool with the complete report.`;

  const userPrompt = `ASSET TYPE: ${assetType}
TOPIC / COMPANY / THEME: ${topic}${ticker ? ` (${ticker})` : ""}
REPORT DATE: ${reportDate}

RESEARCH CONTEXT (${sources.length} numbered sources):
${context || "(no external sources could be retrieved — keep the report short, qualitative and say so in data_gaps)"}`;

  const publishTool = {
    type: "function",
    function: {
      name: "publish_report",
      description: "Publish the finished FlowPulse Research report.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Institutional headline, max 90 characters" },
          subtitle: { type: "string", description: "One-line standfirst" },
          excerpt: { type: "string", description: "Two-sentence summary for the report card, max 240 characters" },
          stance: { type: "string", enum: ["Positive", "Neutral", "Cautious", "Negative"] },
          conviction: { type: "number", description: "0–5, one decimal: strength of evidence behind the stance" },
          horizon: { type: "string", description: "e.g. '6–12 months'" },
          key_takeaways: { type: "array", items: { type: "string" }, description: "3–6 crisp takeaways with [n] markers where factual" },
          key_metrics: {
            type: "array",
            description: "Up to 8 headline metrics taken from the sources",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "string" },
                source: { type: "integer", description: "Source number the value comes from" },
                basis: { type: "string", enum: ["reported", "estimate", "calculated"] },
              },
              required: ["label", "value", "basis"],
            },
          },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: { title: { type: "string" }, html: { type: "string" } },
              required: ["title", "html"],
            },
          },
          scenarios: {
            type: "array",
            description: "Exactly three: bull, base, bear",
            items: {
              type: "object",
              properties: {
                case: { type: "string", enum: ["bull", "base", "bear"] },
                probability: { type: "number", description: "Subjective weighting in %, the three summing to 100" },
                summary: { type: "string" },
                drivers: { type: "array", items: { type: "string" } },
              },
              required: ["case", "summary"],
            },
          },
          catalysts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                event: { type: "string" },
                timing: { type: "string" },
                direction: { type: "string", enum: ["positive", "negative", "uncertain"] },
              },
              required: ["event"],
            },
          },
          risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk: { type: "string" },
                likelihood: { type: "string", enum: ["low", "medium", "high"] },
                impact: { type: "string", enum: ["low", "medium", "high"] },
                mitigant: { type: "string" },
              },
              required: ["risk", "likelihood", "impact"],
            },
          },
          data_gaps: { type: "array", items: { type: "string" }, description: "What could not be verified from the sources" },
          tags: { type: "array", items: { type: "string" }, description: "3–6 short tags" },
        },
        required: ["title", "excerpt", "stance", "conviction", "key_takeaways", "key_metrics", "sections", "scenarios", "risks"],
      },
    },
  };

  // Gemini 2.5 Pro writes the report (quality matters most here); if it fails
  // or returns nothing usable, one cheaper Flash attempt is made.
  const callAnalyst = async (model: string): Promise<AnalystReport | null> => {
    const aiRes = await meteredFetch("research-report-generator", "https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [publishTool],
        tool_choice: { type: "function", function: { name: "publish_report" } },
      }),
    });
    if (aiRes.status === 402 || aiRes.status === 429) {
      const t = await aiRes.text();
      throw new Error(`AI gateway ${aiRes.status}: ${t.slice(0, 200)}`);
    }
    if (!aiRes.ok) {
      console.warn(`[report] ${model} returned ${aiRes.status}`);
      return null;
    }
    const aiJson = await aiRes.json();
    const args = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? (() => { try { return JSON.parse(args); } catch { return null; } })() : null;
    if (!parsed?.title || !Array.isArray(parsed?.sections) || parsed.sections.length === 0) return null;
    return parsed as AnalystReport;
  };

  const parsed = (await callAnalyst("google/gemini-2.5-pro")) ?? (await callAnalyst("google/gemini-2.5-flash"));
  if (!parsed) throw new Error("AI did not return a usable report");

  const reportSources: ReportSource[] = sources.map((s) => ({ url: s.url, title: s.title ?? null }));
  const pages = composeReport(parsed, { assetType, topic, ticker, reportDate }, reportSources);
  if (pages.length < 3) throw new Error("AI returned no usable analysis sections");

  const title = String(parsed.title).slice(0, 200);
  const slug = slugify(title);
  const excerpt = String(parsed.excerpt ?? "").slice(0, 500);
  const aiTags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8).map(String) : [];

  const generatedHero = await createReportThumbnail({
    assetType,
    topic,
    ticker,
    title,
    excerpt,
    tags: aiTags,
    firstPageHtml: pages[0]?.html,
    slug,
    admin,
  });

  // Curated, verified Unsplash photo IDs (no ixid/ix params — those expire and 404).
  // Safety fallback only. Primary thumbnails are AI-generated from the actual report.
  const STOCK_HEROES = [
    "photo-1611974789855-9c2a0a7236a3", // bull statue
    "photo-1590283603385-17ffb3a7f29f", // trading floor
    "photo-1554260570-9140fd3b7614",   // financial district
    "photo-1590283603385-17ffb3a7f29f",
    "photo-1559526324-4b87b5e36e44",   // charts
    "photo-1604594849809-dfedbc827105", // skyscrapers
    "photo-1611324586060-04bcc4eee1b9", // ticker
    "photo-1642784353700-3aef5f8b9396", // candlesticks
    "photo-1591696205602-2f950c417cb9", // wall street
    "photo-1607968565043-36af90dde238", // boardroom
  ];
  const CRYPTO_HEROES = [
    "photo-1518546305927-5a555bb7020d", // bitcoin
    "photo-1639762681485-074b7f938ba0", // crypto chart
    "photo-1640340434855-6084b1f4901c", // eth coin
    "photo-1621932953986-15fcfb2d6669", // crypto neon
    "photo-1620321023374-d1a68fbc720d", // chart blue
    "photo-1641932969982-21a13d4a8b14", // crypto data
    "photo-1622630998477-20aa696ecb05", // bitcoin city
    "photo-1518544866330-95a2bec01dc3", // chains
    "photo-1639825988283-39e5408b75e8", // server
    "photo-1640161339155-3d76a3b3a1c8", // tokens
  ];
  const pool = assetType === "crypto" ? CRYPTO_HEROES : STOCK_HEROES;
  let hashSeed = 0;
  for (const ch of title) hashSeed = (hashSeed * 31 + ch.charCodeAt(0)) >>> 0;
  const heroId = pool[hashSeed % pool.length];
  const heroFallback = `https://images.unsplash.com/${heroId}?w=1600&q=80&auto=format&fit=crop`;

  const combinedHtml = pages.map((p: any, i: number) =>
    `<section class="report-page" data-page="${i + 1}">
       <header class="report-page-header"><span class="page-number">Page ${i + 1} of ${pages.length}</span><h2 class="page-title">${escapeHtml(p.title)}</h2></header>
       <div class="report-page-body">${p.html}</div>
     </section>`
  ).join("\n");

  const { data: inserted, error: insErr } = await admin
    .from("generated_research_reports")
    .insert({
      asset_type: assetType,
      title,
      slug,
      ticker: ticker || null,
      excerpt,
      hero_image_url: generatedHero ?? heroFallback,
      html_content: combinedHtml,
      pages,
      page_count: pages.length,
      report_date: reportDate,
      ai_score: Math.max(0, Math.min(5, Number(parsed.conviction ?? 3))),
      ai_tags: aiTags,
      sources: sources.map((s) => ({ url: s.url, title: s.title ?? null })),
      reading_time_minutes: Math.max(5, Math.round(pages.reduce((n: number, p: any) => n + p.html.replace(/<[^>]+>/g, " ").split(/\s+/).length, 0) / 220)),
      status: "draft",
      created_by: createdBy,
    })
    .select("id, slug, page_count")
    .single();
  if (insErr) throw insErr;

  return { report: inserted, sourceCount: sources.length, pageCount: pages.length };
}
