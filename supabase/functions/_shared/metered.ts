// Metered fetch for paid providers (Lovable AI gateway, Firecrawl).
// Drop-in replacement for fetch(): every call is logged to ai_usage_log,
// Firecrawl scrape/search answers are cached in provider_cache, and a daily
// budget (platform_config key "ai_budget") stops runaway spend.
// Every DB step is best-effort: if the tables are missing the call still runs.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

export type Provider = "ai" | "firecrawl" | "other";

export interface MeterOptions {
  // Cache the response for this many hours. Firecrawl scrape/search default
  // to 12h/6h; AI calls are only cached when this is set.
  cacheHours?: number;
  // Skip the cache for this call (still logged and budgeted).
  noCache?: boolean;
}

export interface Budget {
  enabled: boolean;
  daily_ai_calls: number;
  daily_firecrawl_calls: number;
}

export const DEFAULT_BUDGET: Budget = { enabled: true, daily_ai_calls: 600, daily_firecrawl_calls: 300 };

// Admin scraping/sourcing functions share the daily budget. Customer-facing
// features (chat, analyst, translations…) are logged but never blocked by it.
export const BUDGETED_FUNCTIONS = new Set([
  "admin-research-chat", "ai-finance-picks", "analyst-benchmark-trends", "analyst-discovery-engine",
  "analyst-dynamic-watchlist", "analyst-etf-fund-analysis", "analyst-investor-segments",
  "analyst-market-commentary", "analyst-pipeline", "analyst-realtime-alerts", "company-finder-search",
  "dm-finder-search", "elite-scraper-analyst", "fetch-financial-news", "financial-research-scraper",
  "firecrawl-scrape", "generate-about-content", "generate-opportunity-thumbnail", "generate-research-report",
  "intel-ingest-firecrawl", "intel-validate", "investor-finder-scraper", "opportunity-research",
  "orchestrate-report", "research-report-generator", "run-data-pipeline", "run-research-scraper-schedules",
  "stocks-crypto-elite-scan", "admin-agent", "portfolio-review-ai", "opportunity-reprice", "market-pulse-refresh",
]);

let client: SupabaseClient | null = null;
function db(): SupabaseClient | null {
  if (client) return client;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export function providerOf(url: string): Provider {
  if (url.includes("ai.gateway.lovable.dev")) return "ai";
  if (url.includes("api.firecrawl.dev")) return "firecrawl";
  return "other";
}

// Default cache lifetime per endpoint; 0 = never cache.
export function defaultCacheHours(url: string, provider: Provider, opts: MeterOptions): number {
  if (opts.noCache) return 0;
  if (opts.cacheHours !== undefined) return opts.cacheHours;
  if (provider !== "firecrawl") return 0;
  if (/\/scrape\b/.test(url)) return 12;
  if (/\/search\b/.test(url)) return 6;
  return 0;
}

export function parseBudget(value: unknown): Budget {
  const v = (value ?? {}) as Partial<Budget>;
  return {
    enabled: v.enabled !== false,
    daily_ai_calls: Number(v.daily_ai_calls) > 0 ? Number(v.daily_ai_calls) : DEFAULT_BUDGET.daily_ai_calls,
    daily_firecrawl_calls: Number(v.daily_firecrawl_calls) > 0 ? Number(v.daily_firecrawl_calls) : DEFAULT_BUDGET.daily_firecrawl_calls,
  };
}

export function overBudget(budget: Budget, provider: Provider, usedToday: number): boolean {
  if (!budget.enabled || provider === "other") return false;
  const cap = provider === "ai" ? budget.daily_ai_calls : budget.daily_firecrawl_calls;
  return usedToday >= cap;
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

let budgetCache: { at: number; budget: Budget } | null = null;
async function loadBudget(sb: SupabaseClient): Promise<Budget> {
  if (budgetCache && Date.now() - budgetCache.at < 60_000) return budgetCache.budget;
  try {
    const { data } = await sb.from("platform_config").select("value").eq("key", "ai_budget").maybeSingle();
    budgetCache = { at: Date.now(), budget: parseBudget(data?.value) };
  } catch {
    budgetCache = { at: Date.now(), budget: DEFAULT_BUDGET };
  }
  return budgetCache.budget;
}

async function usedToday(sb: SupabaseClient, provider: Provider): Promise<number> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const { count, error } = await sb
    .from("ai_usage_log")
    .select("id", { count: "exact", head: true })
    .eq("provider", provider)
    .eq("cached", false)
    .eq("blocked", false)
    .gte("created_at", start.toISOString());
  if (error) return 0;
  return count ?? 0;
}

interface LogRow {
  fn: string;
  provider: Provider;
  endpoint: string;
  model?: string | null;
  status: number;
  cached?: boolean;
  blocked?: boolean;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  duration_ms?: number;
}

async function log(sb: SupabaseClient | null, row: LogRow) {
  if (!sb) return;
  try {
    await sb.from("ai_usage_log").insert({ cached: false, blocked: false, ...row });
  } catch { /* logging must never break the call */ }
}

function bodyText(init: RequestInit): string {
  return typeof init.body === "string" ? init.body : "";
}

function endpointOf(url: string): string {
  try { return new URL(url).pathname; } catch { return url.slice(0, 120); }
}

export async function meteredFetch(fn: string, url: string, init: RequestInit = {}, opts: MeterOptions = {}): Promise<Response> {
  const provider = providerOf(url);
  const sb = db();
  const body = bodyText(init);
  let model: string | null = null;
  let streaming = false;
  try {
    const parsed = body ? JSON.parse(body) : null;
    model = parsed?.model ?? null;
    streaming = parsed?.stream === true;
  } catch { /* not JSON */ }
  const endpoint = endpointOf(url);
  const cacheHours = streaming ? 0 : defaultCacheHours(url, provider, opts);
  const key = cacheHours > 0 ? await sha256(`${url}\n${body}`) : null;

  if (sb && key) {
    try {
      const { data } = await sb
        .from("provider_cache")
        .select("body")
        .eq("key", key)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (data?.body) {
        await log(sb, { fn, provider, endpoint, model, status: 200, cached: true, duration_ms: 0 });
        return new Response(data.body, { status: 200, headers: { "Content-Type": "application/json", "X-FlowPulse-Cache": "hit" } });
      }
    } catch { /* cache miss */ }
  }

  if (sb && provider !== "other" && BUDGETED_FUNCTIONS.has(fn)) {
    const budget = await loadBudget(sb);
    if (budget.enabled && overBudget(budget, provider, await usedToday(sb, provider))) {
      await log(sb, { fn, provider, endpoint, model, status: 402, blocked: true });
      const name = provider === "ai" ? "AI" : "Firecrawl";
      return new Response(
        JSON.stringify({ error: `FlowPulse daily ${name} budget reached. Raise it in Admin › AI usage, or wait until midnight UTC.` }),
        { status: 402, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  const started = Date.now();
  const res = await fetch(url, init);
  const duration_ms = Date.now() - started;

  if (streaming || !sb) {
    await log(sb, { fn, provider, endpoint, model, status: res.status, duration_ms });
    return res;
  }

  let text: string | null = null;
  try { text = await res.clone().text(); } catch { /* unreadable */ }
  let usage: any = null;
  if (text && provider === "ai") {
    try { usage = JSON.parse(text)?.usage ?? null; } catch { /* not JSON */ }
  }
  await log(sb, {
    fn, provider, endpoint, model, status: res.status, duration_ms,
    prompt_tokens: usage?.prompt_tokens ?? null,
    completion_tokens: usage?.completion_tokens ?? null,
  });

  if (key && res.ok && text) {
    try {
      await sb.from("provider_cache").upsert({
        key, fn, provider, endpoint, body: text,
        expires_at: new Date(Date.now() + cacheHours * 3600_000).toISOString(),
      });
    } catch { /* cache write is optional */ }
  }
  return res;
}

// Master auto-scraper switch (platform_config.auto_scraper_enabled). Scheduled
// runs must call this first and do nothing when it is off.
export async function autoScraperEnabled(): Promise<boolean> {
  const sb = db();
  if (!sb) return false;
  try {
    const { data } = await sb.from("platform_config").select("value").eq("key", "auto_scraper_enabled").maybeSingle();
    return (data?.value as any)?.enabled === true;
  } catch {
    return false;
  }
}
