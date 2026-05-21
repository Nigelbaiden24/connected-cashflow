// AI-powered research report generator.
// Scrapes the web (broad search + curated finance/crypto sources) via Firecrawl,
// then asks Lovable AI to produce a Cryptonary-style branded HTML article and
// stores it in `generated_research_reports` as a `draft` for admin review.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CURATED_STOCK = [
  "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=10-K&dateb=&owner=include&count=10",
  "https://finance.yahoo.com",
  "https://www.marketwatch.com/latest-news",
  "https://seekingalpha.com",
  "https://www.ft.com/markets",
];
const CURATED_CRYPTO = [
  "https://www.coindesk.com",
  "https://decrypt.co",
  "https://cointelegraph.com",
  "https://messari.io/research",
  "https://defillama.com",
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
      url: x.url,
      title: x.title,
      excerpt: x.description,
      markdown: x.markdown,
    }));
  } catch (_) {
    return [];
  }
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
  } catch (_) {
    return null;
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) + "-" + Math.random().toString(36).slice(2, 7);
}

function extractJsonBlock(text: string): any | null {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try { return JSON.parse(raw.slice(start, end + 1)); } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Admin auth via caller's JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin } = await admin.rpc("is_admin", { _user_id: user.id });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const assetType: "stock" | "crypto" = body.assetType === "crypto" ? "crypto" : "stock";
    const topic: string = (body.topic || body.ticker || "").trim();
    const ticker: string = (body.ticker || "").trim().toUpperCase();
    const extraUrls: string[] = Array.isArray(body.extraUrls) ? body.extraUrls.slice(0, 5) : [];
    if (!topic) throw new Error("topic is required");

    // 1) Gather sources
    const searchQuery = `${topic} ${assetType === "crypto" ? "cryptocurrency analysis on-chain fundamentals" : "stock analysis earnings fundamentals outlook"} ${new Date().getFullYear()}`;
    const curated = assetType === "crypto" ? CURATED_CRYPTO : CURATED_STOCK;
    const [searchResults, ...curatedScrapes] = await Promise.all([
      firecrawlSearch(searchQuery, 6),
      ...curated.slice(0, 3).map((u) => firecrawlScrape(`${u} ${topic}`.startsWith("http") ? u : u)),
      ...extraUrls.map((u) => firecrawlScrape(u)),
    ]);
    const sources: ScrapedSource[] = [
      ...searchResults,
      ...curatedScrapes.filter(Boolean) as ScrapedSource[],
    ].filter((s) => s && (s.markdown || s.excerpt)).slice(0, 10);

    // 2) Build context bundle
    const context = sources.map((s, i) =>
      `### Source ${i + 1}: ${s.title ?? s.url}\nURL: ${s.url}\n${(s.markdown || s.excerpt || "").slice(0, 2500)}`
    ).join("\n\n---\n\n");

    // 3) Ask Lovable AI for branded HTML article (Cryptonary-style)
    const systemPrompt = `You are FlowPulse Research, an institutional-grade ${assetType === "crypto" ? "digital-asset" : "equity"} analyst. Produce a Cryptonary-style premium research article.

OUTPUT STRICT JSON only, no commentary, with this shape:
{
  "title": "string (concise headline, <= 90 chars)",
  "excerpt": "string (compelling 2-sentence summary, <= 220 chars)",
  "hero_image_url": "string (unsplash URL relevant to the topic)",
  "ai_score": number 0-5 (conviction),
  "ai_tags": ["3-6 short tags"],
  "reading_time_minutes": number,
  "html": "string (full article HTML, see rules below)"
}

HTML RULES (Cryptonary aesthetic):
- Use semantic tags: <article>, <h2>, <h3>, <p>, <ul>, <li>, <blockquote>, <table>, <figure>, <figcaption>.
- Open with a 2-paragraph lede in <p class='lede'> tone.
- Sections: "Executive Summary", "Market Context", "Fundamental / On-chain Analysis", "Catalysts", "Risks", "Valuation & Price Targets", "Conviction & Positioning", "Sources".
- Use <div class='callout'> for key takeaways.
- Use <div class='stat-grid'><div class='stat'><span class='label'>...</span><span class='value'>...</span></div></div> for KPIs.
- Use <table class='data-table'> for comparable metrics.
- Cite sources inline as superscript <sup><a href='URL'>[n]</a></sup>.
- End with a "Sources" <ol> listing each cited URL.
- Do NOT include <html>, <head>, <body>, scripts, or external CSS — only the inner article markup.
- Branded FlowPulse voice: confident, data-driven, institutional. No hype.`;

    const userPrompt = `ASSET TYPE: ${assetType}
TOPIC / TICKER: ${topic}${ticker ? ` (${ticker})` : ""}
CURRENT DATE: ${new Date().toISOString().slice(0, 10)}

RESEARCH CONTEXT:
${context || "(no external context available — rely on general institutional knowledge and clearly mark assumptions)"}

Produce the JSON now.`;

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
    if (!parsed?.html || !parsed?.title) throw new Error("AI did not return required fields");

    const title = String(parsed.title).slice(0, 200);
    const slug = slugify(title);
    const heroFallback = assetType === "crypto"
      ? "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1600&q=80"
      : "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80";

    const { data: inserted, error: insErr } = await admin
      .from("generated_research_reports")
      .insert({
        asset_type: assetType,
        title,
        slug,
        ticker: ticker || null,
        excerpt: String(parsed.excerpt ?? "").slice(0, 500),
        hero_image_url: String(parsed.hero_image_url || heroFallback),
        html_content: String(parsed.html),
        ai_score: Math.max(0, Math.min(5, Number(parsed.ai_score ?? 3))),
        ai_tags: Array.isArray(parsed.ai_tags) ? parsed.ai_tags.slice(0, 8).map(String) : [],
        sources: sources.map((s) => ({ url: s.url, title: s.title ?? null })),
        reading_time_minutes: Number(parsed.reading_time_minutes ?? 6),
        status: "draft",
        created_by: user.id,
      })
      .select("id, slug")
      .single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ success: true, report: inserted, sourceCount: sources.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-research-report-ai error:", e);
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
