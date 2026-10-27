// Market Pulse: refreshes the investor sidebar (news, what's trending and why,
// helpful reads) and the movers ticker.
//
// Callers:
//   - pg_cron (anonymous) every 15 min: runs only when platform_config
//     'market_pulse'.mode = 'auto' and interval_minutes have passed.
//   - Admins (or other edge functions): run on demand ("Refresh now").
// Body: { parts?: ("movers" | "news")[] }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { meteredFetch } from "../_shared/metered.ts";
import { identify } from "../_shared/guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const FN = "market-pulse-refresh";
type Changes = Partial<Record<"1h" | "1d" | "1w" | "1m" | "ytd" | "1y", number | null>>;
interface Mover { symbol: string; title: string; asset_type: "stock" | "crypto" | "index"; price: number | null; currency: string; changes: Changes; image_url?: string | null; source: string; tags?: string[] }

const round = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? Math.round(n * 100) / 100 : null);

// ── Movers ──────────────────────────────────────────────────────────────────
async function cryptoMovers(): Promise<Mover[]> {
  const r = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&price_change_percentage=1h,24h,7d,30d,1y");
  if (!r.ok) throw new Error(`CoinGecko ${r.status}`);
  const rows = await r.json();
  return (rows as any[]).filter((c) => !/usd|tether|dai|wrapped|staked/i.test(`${c.id} ${c.name}`)).map((c) => ({
    symbol: String(c.symbol).toUpperCase(), title: c.name, asset_type: "crypto", price: c.current_price, currency: "USD",
    image_url: c.image, source: "CoinGecko",
    changes: {
      "1h": round(c.price_change_percentage_1h_in_currency), "1d": round(c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h),
      "1w": round(c.price_change_percentage_7d_in_currency), "1m": round(c.price_change_percentage_30d_in_currency),
      "1y": round(c.price_change_percentage_1y_in_currency),
    },
  }));
}

async function alphaVantage(params: string): Promise<any | null> {
  const key = Deno.env.get("ALPHA_VANTAGE_API_KEY");
  if (!key) return null;
  try {
    const r = await fetch(`https://www.alphavantage.co/query?${params}&apikey=${key}`);
    if (!r.ok) return null;
    const j = await r.json();
    if (j?.Note || j?.Information || j?.["Error Message"]) return null; // rate limit / plan limit
    return j;
  } catch {
    return null;
  }
}

/** Today's biggest US stock moves (one Alpha Vantage call). */
async function usTopMovers(): Promise<Mover[]> {
  const j = await alphaVantage("function=TOP_GAINERS_LOSERS");
  if (!j) return [];
  const pick = (arr: any[], tag: string) => (arr ?? []).slice(0, 6).map((x: any) => ({
    symbol: x.ticker, title: x.ticker, asset_type: "stock" as const, price: Number(x.price) || null, currency: "USD",
    source: "Alpha Vantage US movers", tags: [tag], changes: { "1d": round(parseFloat(String(x.change_percentage).replace("%", ""))) },
  }));
  // Penny stocks dominate raw gainer lists; keep names trading above $5.
  return [...pick(j.top_gainers, "top_gainer"), ...pick(j.top_losers, "top_loser"), ...pick(j.most_actively_traded, "most_active")]
    .filter((m) => (m.price ?? 0) >= 5);
}

const BENCHMARKS: Array<{ symbol: string; title: string; asset_type: "index" | "stock" }> = [
  { symbol: "SPY", title: "S&P 500 (SPY)", asset_type: "index" }, { symbol: "QQQ", title: "Nasdaq 100 (QQQ)", asset_type: "index" },
  { symbol: "AAPL", title: "Apple", asset_type: "stock" }, { symbol: "MSFT", title: "Microsoft", asset_type: "stock" },
  { symbol: "NVDA", title: "Nvidia", asset_type: "stock" }, { symbol: "TSLA", title: "Tesla", asset_type: "stock" },
];

/** 1d / 1w / 1m / YTD / 1y for benchmark names from daily closes (once a day). */
async function benchmarkMovers(): Promise<Mover[]> {
  const out: Mover[] = [];
  for (const b of BENCHMARKS) {
    const j = await alphaVantage(`function=TIME_SERIES_DAILY&symbol=${b.symbol}&outputsize=full`);
    const series = j?.["Time Series (Daily)"];
    if (!series) continue;
    const days = Object.keys(series).sort().reverse(); // newest first
    const close = (d: string) => Number(series[d]["4. close"]);
    const last = close(days[0]);
    const lastDate = new Date(days[0]);
    const onOrBefore = (msAgo: number) => days.find((d) => new Date(d).getTime() <= lastDate.getTime() - msAgo);
    const pct = (d?: string) => (d ? round(((last - close(d)) / close(d)) * 100) : null);
    const ytdBase = days.find((d) => d < `${lastDate.getUTCFullYear()}-01-01`);
    out.push({
      symbol: b.symbol, title: b.title, asset_type: b.asset_type, price: last, currency: "USD", source: "Alpha Vantage daily closes",
      changes: { "1d": pct(days[1]), "1w": pct(onOrBefore(7 * 86_400_000)), "1m": pct(onOrBefore(30 * 86_400_000)), ytd: pct(ytdBase), "1y": pct(onOrBefore(365 * 86_400_000)) },
    });
    await new Promise((r) => setTimeout(r, 1200)); // stay under the per-minute limit
  }
  return out;
}

/** FlowPulse's own stock data, used when Alpha Vantage is unavailable. */
async function fallbackStocks(sb: any): Promise<Mover[]> {
  const { data } = await sb.from("stocks_crypto")
    .select("symbol,name,asset_type,current_price,price_currency,price_change_24h,price_change_7d,price_change_30d,price_change_1y,logo_url,updated_at")
    .eq("asset_type", "stock").not("price_change_24h", "is", null).order("market_cap", { ascending: false, nullsFirst: false }).limit(20);
  return ((data ?? []) as any[]).map((s) => ({
    symbol: s.symbol, title: s.name ?? s.symbol, asset_type: "stock", price: s.current_price, currency: s.price_currency ?? "USD",
    image_url: s.logo_url, source: "FlowPulse data",
    changes: { "1d": round(s.price_change_24h), "1w": round(s.price_change_7d), "1m": round(s.price_change_30d), "1y": round(s.price_change_1y) },
  }));
}

// ── News, trends and reads ───────────────────────────────────────────────────
interface Hit { title: string; url: string; description: string; source: string }

async function search(query: string, tbs: string, limit = 8): Promise<Hit[]> {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) return [];
  const r = await meteredFetch(FN, "https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit, tbs }),
  }, { cacheHours: 1 });
  if (!r.ok) return [];
  const j = await r.json();
  return ((j?.data ?? []) as any[]).filter((x) => x?.url && x?.title).map((x) => {
    let host = "";
    try { host = new URL(x.url).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
    return { title: String(x.title).slice(0, 200), url: x.url, description: String(x.description ?? "").slice(0, 400), source: host };
  });
}

const pulseTool = {
  type: "function",
  function: {
    name: "market_pulse",
    description: "Return the curated market pulse.",
    parameters: {
      type: "object",
      properties: {
        news: { type: "array", description: "Up to 10 most important, distinct stories, newest/most market-moving first", items: {
          type: "object", properties: { i: { type: "integer" }, summary: { type: "string", description: "≤ 180 chars, factual" }, tags: { type: "array", items: { type: "string" } } }, required: ["i", "summary"] } },
        trending: { type: "array", description: "Up to 6 themes moving markets now", items: {
          type: "object", properties: {
            title: { type: "string", description: "≤ 60 chars" }, why: { type: "string", description: "≤ 240 chars: what is happening and why it matters, grounded in the cited stories/moves" },
            symbols: { type: "array", items: { type: "string" } }, sources: { type: "array", items: { type: "integer" }, description: "indices of news hits used" },
          }, required: ["title", "why", "sources"] } },
        mover_reasons: { type: "array", description: "Only for movers where a cited story explains the move", items: {
          type: "object", properties: { symbol: { type: "string" }, why: { type: "string", description: "≤ 160 chars" }, sources: { type: "array", items: { type: "integer" } } }, required: ["symbol", "why", "sources"] } },
        articles: { type: "array", description: "Up to 6 genuinely useful explainers/guides for investors, relevant to today's themes", items: {
          type: "object", properties: { i: { type: "integer" }, summary: { type: "string", description: "≤ 160 chars: what the reader will learn" } }, required: ["i", "summary"] } },
      },
      required: ["news", "trending", "articles"],
    },
  },
};

async function curate(newsHits: Hit[], readHits: Hit[], movers: Mover[]) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key || (!newsHits.length && !readHits.length)) return null;
  const big = [...movers].filter((m) => typeof m.changes["1d"] === "number")
    .sort((a, b) => Math.abs(b.changes["1d"]!) - Math.abs(a.changes["1d"]!)).slice(0, 15)
    .map((m) => `${m.symbol} (${m.title}, ${m.asset_type}) ${m.changes["1d"]! > 0 ? "+" : ""}${m.changes["1d"]}% 1d`).join("; ");
  const r = await meteredFetch(FN, "https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: `You are the markets editor for FlowPulse, a UK investment research platform. Curate today's market pulse for investors from the numbered search results only.
Rules: cite results by their numbers; never invent stories, figures or links; skip press releases, adverts, paywall stubs and duplicates; prefer reputable outlets; British English; neutral, factual tone; no investment advice. "why" must explain the driver using the cited stories. If a mover has no supporting story, leave it out of mover_reasons.` },
        { role: "user", content: `Date: ${new Date().toISOString().slice(0, 10)}
BIGGEST MOVES: ${big || "n/a"}

NEWS RESULTS:
${newsHits.map((h, i) => `[${i}] ${h.title} — ${h.source}\n${h.description}`).join("\n")}

EXPLAINER/GUIDE RESULTS (for "articles", numbered separately):
${readHits.map((h, i) => `[${i}] ${h.title} — ${h.source}\n${h.description}`).join("\n")}` },
      ],
      tools: [pulseTool],
      tool_choice: { type: "function", function: { name: "market_pulse" } },
    }),
  });
  if (!r.ok) throw new Error(r.status === 402 ? "AI budget or credits exhausted" : `AI error ${r.status}`);
  const data = await r.json();
  const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  return args ? JSON.parse(args) : null;
}

// ── Handler ──────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const caller = await identify(req);
  if (caller.kind === "user") return json({ error: "Admin access required" }, 403);

  const { data: cfgRow } = await sb.from("platform_config").select("value").eq("key", "market_pulse").maybeSingle();
  const cfg: any = cfgRow?.value ?? { mode: "manual", interval_minutes: 120 };
  const now = Date.now();

  if (caller.kind === "anonymous") {
    if (cfg.mode !== "auto") return json({ skipped: "manual mode" });
    const due = !cfg.last_run_at || now - new Date(cfg.last_run_at).getTime() >= (Number(cfg.interval_minutes) || 120) * 60_000 - 60_000;
    if (!due) return json({ skipped: "not due" });
  }

  const body = await req.json().catch(() => ({}));
  const parts: string[] = Array.isArray(body.parts) && body.parts.length ? body.parts : ["movers", "news"];
  const batch = crypto.randomUUID();
  const counts: Record<string, number> = {};
  const errors: string[] = [];
  const saveCfg = (patch: Record<string, unknown>) =>
    sb.from("platform_config").upsert({ key: "market_pulse", value: { ...cfg, ...patch }, updated_at: new Date().toISOString() });

  // Mark the run first so overlapping cron ticks don't double-spend.
  await saveCfg({ last_run_at: new Date(now).toISOString(), last_status: "running" });

  let movers: Mover[] = [];
  try {
    if (parts.includes("movers")) {
      const results = await Promise.allSettled([cryptoMovers()]);
      if (results[0].status === "fulfilled") movers.push(...results[0].value); else errors.push(String(results[0].reason));

      // Alpha Vantage free tier is 25 calls/day: top movers at most every 4h,
      // benchmark history once a day.
      const fourHours = 4 * 3600_000;
      if (!cfg.us_movers_at || now - new Date(cfg.us_movers_at).getTime() >= fourHours) {
        const us = await usTopMovers();
        if (us.length) { movers.push(...us); cfg.us_movers_at = new Date(now).toISOString(); }
      }
      const today = new Date(now).toISOString().slice(0, 10);
      if (cfg.benchmarks_on !== today) {
        const bm = await benchmarkMovers();
        if (bm.length) { movers.push(...bm); cfg.benchmarks_on = today; }
      }
      if (!movers.some((m) => m.asset_type !== "crypto")) {
        // Keep previous stock rows if this run fetched none; else fall back.
        const { count } = await sb.from("market_pulse_items").select("id", { count: "exact", head: true })
          .eq("kind", "mover").neq("asset_type", "crypto");
        if (!count) movers.push(...await fallbackStocks(sb));
      }

      if (movers.length) {
        const rows = movers.map((m, rank) => ({
          kind: "mover", title: m.title, symbol: m.symbol, asset_type: m.asset_type, price: m.price, currency: m.currency,
          changes: m.changes, image_url: m.image_url ?? null, source: m.source, tags: m.tags ?? null, rank, batch_id: batch,
          published_at: new Date(now).toISOString(),
        }));
        const { error } = await sb.from("market_pulse_items").insert(rows);
        if (error) throw error;
        // Replace earlier rows of the asset types refreshed in this run.
        const refreshed = [...new Set(movers.map((m) => `${m.asset_type}:${m.source}`))];
        for (const key of refreshed) {
          const [asset, source] = key.split(":");
          await sb.from("market_pulse_items").delete().eq("kind", "mover").eq("asset_type", asset).eq("source", source)
            .eq("pinned", false).neq("batch_id", batch);
        }
        counts.movers = rows.length;
      }
    }

    if (parts.includes("news")) {
      const [n1, n2, n3, r1, r2] = await Promise.all([
        search("stock market news today", "qdr:d"),
        search("cryptocurrency market news today", "qdr:d"),
        search("FTSE UK markets economy news today", "qdr:d"),
        search("investing explained guide for investors", "qdr:m", 6),
        search("how to analyse stocks crypto risk diversification guide", "qdr:y", 6),
      ]);
      const seen = new Set<string>();
      const dedupe = (hs: Hit[]) => hs.filter((h) => { const k = h.url.split("?")[0]; if (seen.has(k)) return false; seen.add(k); return true; });
      const newsHits = dedupe([...n1, ...n2, ...n3]).slice(0, 24);
      const readHits = dedupe([...r1, ...r2]).slice(0, 12);

      const curated = await curate(newsHits, readHits, movers.length ? movers : []);
      if (curated) {
        const at = new Date(now).toISOString();
        const rows: any[] = [];
        (curated.news ?? []).slice(0, 10).forEach((n: any, rank: number) => {
          const h = newsHits[n.i]; if (!h) return;
          rows.push({ kind: "news", title: h.title, summary: String(n.summary ?? "").slice(0, 240), url: h.url, source: h.source, tags: (n.tags ?? []).slice(0, 4), rank, batch_id: batch, published_at: at });
        });
        (curated.trending ?? []).slice(0, 6).forEach((t: any, rank: number) => {
          const cited = (t.sources ?? []).map((i: number) => newsHits[i]).filter(Boolean);
          if (!cited.length) return; // ungrounded themes are dropped
          rows.push({ kind: "trending", title: String(t.title).slice(0, 80), why: String(t.why ?? "").slice(0, 300), url: cited[0].url, source: cited.map((c: Hit) => c.source).slice(0, 3).join(", "), tags: (t.symbols ?? []).slice(0, 5), rank, batch_id: batch, published_at: at });
        });
        (curated.articles ?? []).slice(0, 6).forEach((a: any, rank: number) => {
          const h = readHits[a.i]; if (!h) return;
          rows.push({ kind: "article", title: h.title, summary: String(a.summary ?? "").slice(0, 200), url: h.url, source: h.source, rank, batch_id: batch, published_at: at });
        });
        if (rows.length) {
          const { error } = await sb.from("market_pulse_items").insert(rows);
          if (error) throw error;
          for (const kind of ["news", "trending", "article"]) {
            if (rows.some((r) => r.kind === kind)) {
              await sb.from("market_pulse_items").delete().eq("kind", kind).eq("pinned", false).neq("batch_id", batch);
              counts[kind] = rows.filter((r) => r.kind === kind).length;
            }
          }
        }
        // Attach "why" to movers the cited news explains.
        for (const m of curated.mover_reasons ?? []) {
          const cited = (m.sources ?? []).map((i: number) => newsHits[i]).filter(Boolean);
          if (!cited.length || !m.symbol) continue;
          await sb.from("market_pulse_items").update({ why: String(m.why).slice(0, 200), url: cited[0].url })
            .eq("kind", "mover").eq("batch_id", batch).ilike("symbol", String(m.symbol));
        }
      } else if (!newsHits.length) {
        errors.push("No news results (Firecrawl unavailable or over budget)");
      }
    }

    await saveCfg({ last_run_at: new Date(now).toISOString(), last_status: errors.length ? "partial" : "ok", last_counts: counts, last_error: errors[0] ?? null, last_trigger: caller.kind === "anonymous" ? "auto" : "manual", us_movers_at: cfg.us_movers_at ?? null, benchmarks_on: cfg.benchmarks_on ?? null });
    return json({ ok: true, counts, errors });
  } catch (e) {
    const msg = (e as Error).message;
    await saveCfg({ last_status: "failed", last_error: msg, last_counts: counts });
    console.error(`${FN} error:`, e);
    return json({ error: msg }, 500);
  }
});
