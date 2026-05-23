// Shared AI research report generator used by both
// `generate-research-report-ai` (manual) and `run-research-scraper-schedules` (autopilot).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const r = await fetch("https://api.firecrawl.dev/v2/search", {
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
    const r = await fetch("https://api.firecrawl.dev/v2/scrape", {
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

function extractJsonBlock(text: string): any | null {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try { return JSON.parse(raw.slice(start, end + 1)); } catch { return null; }
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
  admin: ReturnType<typeof createClient>;
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
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
  admin: ReturnType<typeof createClient>;
}) {
  const { assetType, topic, ticker = "", extraUrls = [], createdBy, admin } = opts;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const year = new Date().getFullYear();
  const searchQuery = `${topic} ${assetType === "crypto" ? "cryptocurrency on-chain fundamentals analyst report" : "stock equity research earnings outlook"} ${year}`;
  const curated = assetType === "crypto" ? CURATED_CRYPTO : CURATED_STOCK;
  const tasks: Promise<any>[] = [
    firecrawlSearch(searchQuery, 8),
    ...curated.slice(0, 3).map((u) => firecrawlScrape(u)),
    ...extraUrls.slice(0, 5).map((u) => firecrawlScrape(u)),
  ];
  const results = await Promise.all(tasks);
  const [searchResults, ...rest] = results;
  const sources: ScrapedSource[] = [
    ...(searchResults as ScrapedSource[]),
    ...(rest.filter(Boolean) as ScrapedSource[]),
  ].filter((s) => s && (s.markdown || s.excerpt)).slice(0, 12);

  const context = sources.map((s, i) =>
    `### Source ${i + 1}: ${s.title ?? s.url}\nURL: ${s.url}\n${(s.markdown || s.excerpt || "").slice(0, 2800)}`
  ).join("\n\n---\n\n");

  const reportDate = new Date().toISOString().slice(0, 10);
  const systemPrompt = `You are FlowPulse Research, an institutional-grade ${assetType === "crypto" ? "digital-asset" : "equity"} analyst producing elite enterprise research reports for sophisticated investors.

OUTPUT STRICT JSON only, no commentary, with this exact shape:
{
  "title": "concise institutional headline (<= 90 chars)",
  "excerpt": "compelling 2-sentence summary (<= 240 chars)",
  "hero_image_url": "https unsplash URL relevant to the topic",
  "ai_score": number 0-5 (conviction; one decimal),
  "ai_tags": ["3-6 short tags"],
  "reading_time_minutes": number,
  "pages": [ { "title": "Page title", "html": "page HTML body" }, ... ]
}

PAGE COUNT RULES (CRITICAL):
- Decide the number of pages based on information load, depth, and relevance of the gathered context.
- Minimum 3 pages, maximum 12 pages. Use more pages only when there is genuinely meaningful additional analysis to add — no padding, no filler.
- Each page should be a coherent, fully-developed section of ~400-900 words of substantive analysis.

REQUIRED SECTION FLOW (combine or expand into pages as the content warrants):
1. Executive Summary & Key Takeaways
2. Market Context & Macro Backdrop
3. ${assetType === "crypto" ? "Fundamental & On-chain Analysis" : "Fundamental & Financial Analysis"}
4. Competitive Landscape
5. Catalysts & Roadmap
6. Risks & Bear Case
7. Valuation & Price Targets
8. Scenario Analysis (Bull / Base / Bear)
9. Conviction, Positioning & Recommendations
10. Appendix & Methodology

HTML RULES PER PAGE (Cryptonary-quality, enterprise grade):
- Use ONLY inner article markup: <h2>, <h3>, <p>, <ul>, <li>, <blockquote>, <table>, <figure>, <figcaption>, <div>, <span>, <sup>, <a>, <strong>, <em>.
- NEVER include <html>, <head>, <body>, <script>, <link>, or external CSS.
- First page opens with a <p class='lede'> 2-paragraph lede.
- Use <div class='callout'> for key takeaways.
- Use <div class='stat-grid'><div class='stat'><span class='label'>...</span><span class='value'>...</span></div></div> for KPI tiles (3-6 per use).
- Use <table class='data-table'> for comparable metrics, financials, on-chain stats.
- Cite sources inline as <sup><a href='URL'>[n]</a></sup>.
- Final page MUST end with a "Sources" <ol> listing every cited URL.
- Brand voice: confident, data-driven, institutional. No hype, no emojis, no marketing fluff.

CURRENCY RULES (CRITICAL):
- ALL monetary figures MUST be expressed in GBP (£ pound sterling). Never use $, USD, US$, or dollar amounts anywhere in the report (titles, excerpt, tables, KPIs, valuations, price targets, market cap, revenue, anything).
- If a source quotes USD, convert to GBP using a reasonable recent FX rate and present as £ (e.g. "£1.2bn"). You may add "(approx.)" once where appropriate.
- Use £ symbol with UK conventions: £1.25, £3.4m, £12bn, £450k. Do not write "GBP" alongside the symbol.`;

  const userPrompt = `ASSET TYPE: ${assetType}
TOPIC / COMPANY / THEME: ${topic}${ticker ? ` (${ticker})` : ""}
REPORT DATE: ${reportDate}
PUBLISHER: FlowPulse Research

RESEARCH CONTEXT (${sources.length} sources):
${context || "(no external context available — rely on general institutional knowledge and clearly mark assumptions)"}

Decide the appropriate page count (3-12) based on the depth and richness of the above context. Produce the JSON now.`;

  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!aiRes.ok) {
    const t = await aiRes.text();
    throw new Error(`AI gateway ${aiRes.status}: ${t.slice(0, 200)}`);
  }
  const aiJson = await aiRes.json();
  const content: string = aiJson?.choices?.[0]?.message?.content ?? "";
  const parsed = extractJsonBlock(content);
  if (!parsed?.title || !Array.isArray(parsed?.pages) || parsed.pages.length === 0) {
    throw new Error("AI did not return required fields (title + pages[])");
  }

  const pages = parsed.pages
    .slice(0, 12)
    .map((p: any, i: number) => ({
      title: String(p?.title ?? `Page ${i + 1}`).slice(0, 200),
      html: String(p?.html ?? ""),
    }))
    .filter((p: any) => p.html.trim().length > 0);
  if (pages.length === 0) throw new Error("AI returned no usable pages");

  const title = String(parsed.title).slice(0, 200);
  const slug = slugify(title);
  const excerpt = String(parsed.excerpt ?? "").slice(0, 500);
  const aiTags = Array.isArray(parsed.ai_tags) ? parsed.ai_tags.slice(0, 8).map(String) : [];

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
       <header class="report-page-header"><span class="page-number">Page ${i + 1} of ${pages.length}</span><h2 class="page-title">${p.title}</h2></header>
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
      ai_score: Math.max(0, Math.min(5, Number(parsed.ai_score ?? 3))),
      ai_tags: aiTags,
      sources: sources.map((s) => ({ url: s.url, title: s.title ?? null })),
      reading_time_minutes: Number(parsed.reading_time_minutes ?? Math.max(5, pages.length * 3)),
      status: "draft",
      created_by: createdBy,
    })
    .select("id, slug, page_count")
    .single();
  if (insErr) throw insErr;

  return { report: inserted, sourceCount: sources.length, pageCount: pages.length };
}
