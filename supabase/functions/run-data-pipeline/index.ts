// run-data-pipeline
// Orchestrates: scheduler check → scraper invoke → AI enrichment → dedup → stage in pipeline_pending_items
// Runs once per invocation; pg_cron triggers it every 30 min. Picks any source whose next_run_at <= now().
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// Map scheduler source key → scraper edge function + target table
const SOURCE_MAP: Record<string, { fn: string; targetTable: string; platform: string }> = {
  "financial-research":   { fn: "financial-research-scraper", targetTable: "opportunity_products", platform: "finance"  },
  "investor-research":    { fn: "financial-research-scraper", targetTable: "opportunity_products", platform: "investor" },
  "intel-orchestrate":    { fn: "intel-orchestrate",          targetTable: "intel_events",         platform: "both"     },
  "opportunity-research": { fn: "opportunity-research",       targetTable: "opportunity_products", platform: "both"     },
  "investor-finder":      { fn: "investor-finder-scraper",    targetTable: "opportunities",        platform: "investor" },
  "elite-scraper":        { fn: "elite-scraper-analyst",      targetTable: "opportunities",        platform: "finance"  },
  "companies-house":      { fn: "companies-house-scraper",    targetTable: "opportunities",        platform: "both"     },
};

// Finance platform investment categories (Opportunity Intelligence — Finance)
const FINANCE_RESEARCH_CATEGORIES = [
  "stocks-equities","crypto-digital","real-estate","fixed-income","commodities","fx",
  "funds-etfs","alternatives","esg","private-equity","venture-capital","infrastructure",
  "sme-acquisitions","distressed","debt-lending",
];
// Investor platform investment categories (Opportunity Intelligence — Investor)
const INVESTOR_RESEARCH_CATEGORIES = [
  "stocks-equities","crypto-digital","real-estate","fixed-income","commodities","fx",
  "funds-etfs","alternatives","esg","fractional-pe-vc","private-market-platforms",
  "derivatives","capital-protected-notes","savings-cash-yield","pensions-tax-wrappers",
  "thematics-packaged","copy-trading",
];
const OPPORTUNITY_RESEARCH_CATEGORIES = [
  "uk_property","overseas_property","vehicles","businesses","timepieces",
];
const COMPANIES_HOUSE_QUERIES = [
  "investment","capital","ventures","holdings","partners","equity","property","fintech","biotech","energy",
];
function rotate<T>(arr: T[]): T {
  // Rotate every 3h tick so each run picks a fresh category
  const idx = Math.floor(Date.now() / (3 * 60 * 60 * 1000)) % arr.length;
  return arr[idx];
}
// Pick N distinct categories per run (broader coverage)
function pickN<T>(arr: T[], n: number): T[] {
  const out: T[] = [];
  const base = Math.floor(Date.now() / (3 * 60 * 60 * 1000));
  for (let i = 0; i < Math.min(n, arr.length); i++) {
    out.push(arr[(base + i) % arr.length]);
  }
  return out;
}
function buildScraperBody(source: string, baseConfig: Record<string, unknown> = {}): Record<string, unknown> {
  switch (source) {
    case "financial-research":
      return { categoryKey: rotate(FINANCE_RESEARCH_CATEGORIES), platform: "finance", ...baseConfig };
    case "investor-research":
      return { categoryKey: rotate(INVESTOR_RESEARCH_CATEGORIES), platform: "investor", ...baseConfig };
    case "opportunity-research":
      return { category: rotate(OPPORTUNITY_RESEARCH_CATEGORIES), ...baseConfig };
    case "elite-scraper":
      return { mode: "explain", platform: "finance", categoryLabel: "Multi-asset Investment Opportunities", scrapedData: "Auto-pipeline run: gather and structure current investment opportunities across asset classes.", ...baseConfig };
    case "companies-house":
      return { action: "full_scrape", query: rotate(COMPANIES_HOUSE_QUERIES), searchType: "companies", maxPages: 1, ...baseConfig };
    default:
      return baseConfig;
  }
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function callScraper(fn: string, body: unknown): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  let data: any = null;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`scraper ${fn} returned ${res.status}: ${text.slice(0, 300)}`);
  return data;
}

async function aiEnrich(item: { title: string; summary?: string; url?: string; raw?: any }) {
  if (!LOVABLE_API_KEY) {
    return { summary: item.summary ?? item.title, tags: [], score: 3.0, category: "general" };
  }
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a financial-intelligence enrichment assistant. Reply ONLY with compact JSON: {summary, tags:[<=5], score:0-5 number, category}. score = conviction." },
          { role: "user", content: `Title: ${item.title}\nURL: ${item.url ?? ""}\nContext: ${(item.summary ?? "").slice(0, 800)}\nRaw: ${JSON.stringify(item.raw ?? {}).slice(0, 600)}` },
        ],
      }),
    });
    if (!res.ok) throw new Error(`ai ${res.status}`);
    const j = await res.json();
    const txt = j.choices?.[0]?.message?.content ?? "{}";
    const cleaned = txt.replace(/```json\s*|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      summary: String(parsed.summary ?? item.summary ?? item.title).slice(0, 1200),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5).map(String) : [],
      score: Math.max(0, Math.min(5, Number(parsed.score) || 3)),
      category: String(parsed.category ?? "general").slice(0, 64),
    };
  } catch (e) {
    console.warn("[aiEnrich] fallback:", e);
    return { summary: item.summary ?? item.title, tags: [], score: 3.0, category: "general" };
  }
}

// Normalise scraper outputs into a flat list of candidate items
function extractItems(source: string, payload: any): Array<{ title: string; summary?: string; url?: string; raw: any }> {
  if (!payload) return [];
  // Companies-House full_scrape shape: { results: [{ company: {...}, officers: [...] }] }
  if (Array.isArray(payload.results) && payload.results[0]?.company) {
    return payload.results.slice(0, 60).map((r: any) => ({
      title: String(r.company?.name ?? r.company?.companyName ?? r.company?.company_number ?? "Untitled").slice(0, 240),
      summary: [r.company?.status, r.company?.companyType, r.company?.address].filter(Boolean).join(" · "),
      url: r.company?.url ?? (r.company?.company_number ? `https://find-and-update.company-information.service.gov.uk/company/${r.company.company_number}` : null),
      raw: r,
    })).filter((x: any) => x.title && x.title !== "Untitled");
  }
  const candidates: any[] =
    payload.opportunities ?? payload.results ?? payload.items ?? payload.profiles ??
    payload.data?.opportunities ?? payload.data?.results ?? payload.data?.items ?? payload.data ?? [];
  if (Array.isArray(candidates) && candidates.length) {
    return candidates.slice(0, 60).map((c) => ({
      title: String(c.title ?? c.name ?? c.firm_name ?? c.company_name ?? c.company ?? c.headline ?? "Untitled").slice(0, 240),
      summary: c.summary ?? c.description ?? c.thesis ?? c.snippet ?? null,
      url: c.url ?? c.source_url ?? c.link ?? c.website ?? null,
      raw: c,
    })).filter(x => x.title && x.title !== "Untitled");
  }
  return [];
}

// AI fallback: extract opportunities from a blob of scraped markdown/content
async function aiExtractOpportunities(source: string, payload: any): Promise<Array<{ title: string; summary?: string; url?: string; raw: any }>> {
  if (!LOVABLE_API_KEY) return [];
  const blob: string =
    payload?.content ??
    payload?.markdown ??
    payload?.combinedContent ??
    payload?.data?.content ??
    "";
  if (!blob || blob.length < 200) return [];
  const label = payload?.categoryLabel ?? payload?.category ?? source;
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Extract distinct investment opportunities from scraped content. Reply ONLY with JSON: {opportunities:[{title, summary, url, industry, location}]}. Max 12 items. Title <= 140 chars. Skip generic/news-only items." },
          { role: "user", content: `Category: ${label}\n\nContent:\n${blob.slice(0, 60000)}` },
        ],
      }),
    });
    if (!res.ok) return [];
    const j = await res.json();
    const txt = j.choices?.[0]?.message?.content ?? "{}";
    const cleaned = txt.replace(/```json\s*|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const arr = Array.isArray(parsed?.opportunities) ? parsed.opportunities : [];
    return arr.slice(0, 30).map((o: any) => ({
      title: String(o.title ?? "Untitled").slice(0, 240),
      summary: o.summary ?? null,
      url: o.url ?? null,
      raw: { ...o, _extracted_from: source, category: label },
    })).filter((x: any) => x.title && x.title !== "Untitled");
  } catch (e) {
    console.warn("[aiExtractOpportunities]", e);
    return [];
  }
}

async function notifyAdmins(supabase: any, source: string, message: string) {
  try {
    // Find admin user(s) and drop a notification
    const { data: admins } = await supabase
      .from("user_roles").select("user_id").eq("role", "admin").limit(20);
    if (!admins?.length) return;
    const rows = admins.map((a: any) => ({
      user_id: a.user_id,
      title: `Pipeline failure: ${source}`,
      message,
      type: "pipeline_failure",
      read: false,
    }));
    await supabase.from("automation_notifications").insert(rows);
  } catch (e) { console.warn("[notifyAdmins]", e); }
}

async function runOneSource(supabase: any, schedule: any): Promise<any> {
  const source: string = schedule.source;
  const def = SOURCE_MAP[source];
  if (!def) return { source, skipped: true, reason: "unknown_source" };

  const startedAt = new Date();
  const { data: runRow } = await supabase.from("pipeline_runs").insert({
    source, status: "running", attempt: 1, triggered_by: "scheduler",
    metadata: schedule.config ?? {},
  }).select("id").single();
  const runId = runRow?.id;

  const errors: any[] = [];
  let fetched = 0, staged = 0, enriched = 0, isNew = 0;

  // Retry once on failure
  let payload: any = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      payload = await callScraper(def.fn, buildScraperBody(source, (schedule.config as Record<string, unknown>) ?? {}));
      break;
    } catch (e: any) {
      errors.push({ attempt, error: String(e.message ?? e) });
      if (attempt === 2) {
        const finishedAt = new Date();
        await supabase.from("pipeline_runs").update({
          status: "failed", finished_at: finishedAt.toISOString(),
          duration_ms: finishedAt.getTime() - startedAt.getTime(),
          errors, attempt,
        }).eq("id", runId);
        await supabase.from("pipeline_schedule").update({
          last_run_at: finishedAt.toISOString(),
          next_run_at: new Date(finishedAt.getTime() + (schedule.cadence_minutes ?? 360) * 60000).toISOString(),
          last_status: "failed",
          consecutive_failures: (schedule.consecutive_failures ?? 0) + 1,
          last_error: String(e.message ?? e).slice(0, 500),
        }).eq("source", source);
        await notifyAdmins(supabase, source, `Scraper failed twice: ${String(e.message ?? e).slice(0, 200)}`);
        return { source, status: "failed", errors };
      }
      // brief backoff
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Mirror raw payload into admin_scrape_history (existing storage)
  try {
    await supabase.from("admin_scrape_history").insert({
      source: `pipeline:${source}`,
      platform: def.platform === "both" ? null : def.platform,
      title: `Auto-pipeline run: ${source}`,
      category: source,
      payload: payload as never,
      opportunities: payload?.opportunities ?? null,
      sources: payload?.sources ?? null,
      status: "auto",
      research_date: new Date().toISOString(),
    });
  } catch (e) { console.warn("[history]", e); }

  let items = extractItems(source, payload);
  if (items.length === 0) {
    items = await aiExtractOpportunities(source, payload);
  }
  fetched = items.length;

  for (const it of items) {
    try {
      const dedupBasis = `${source}::${it.url ?? it.title.toLowerCase()}`;
      const dedup_hash = await sha256(dedupBasis);

      // Skip if already pending/promoted
      const { data: existing } = await supabase
        .from("pipeline_pending_items").select("id").eq("dedup_hash", dedup_hash).limit(1).maybeSingle();
      if (existing) continue;
      isNew++;

      const ai = await aiEnrich(it);
      enriched++;

      const { error } = await supabase.from("pipeline_pending_items").insert({
        run_id: runId,
        source,
        target_table: def.targetTable,
        target_platform: def.platform,
        dedup_hash,
        title: it.title,
        summary: ai.summary,
        category: ai.category,
        source_url: it.url,
        raw_payload: it.raw as never,
        enriched_payload: { ...it.raw, ai_summary: ai.summary, ai_tags: ai.tags, ai_score: ai.score } as never,
        ai_tags: ai.tags,
        ai_score: ai.score,
      });
      if (error) errors.push({ item: it.title, error: error.message });
      else staged++;
    } catch (e: any) {
      errors.push({ item: it.title, error: String(e.message ?? e) });
    }
  }

  const finishedAt = new Date();
  const status = errors.length === 0 ? "success" : (staged > 0 ? "partial" : "failed");
  await supabase.from("pipeline_runs").update({
    status, finished_at: finishedAt.toISOString(),
    duration_ms: finishedAt.getTime() - startedAt.getTime(),
    records_fetched: fetched, records_new: isNew, records_enriched: enriched, records_staged: staged,
    errors,
  }).eq("id", runId);

  await supabase.from("pipeline_schedule").update({
    last_run_at: finishedAt.toISOString(),
    next_run_at: new Date(finishedAt.getTime() + (schedule.cadence_minutes ?? 360) * 60000).toISOString(),
    last_status: status,
    consecutive_failures: status === "failed" ? (schedule.consecutive_failures ?? 0) + 1 : 0,
    last_error: status === "failed" ? errors[0]?.error?.toString().slice(0, 500) : null,
  }).eq("source", source);

  if (status === "failed") {
    await notifyAdmins(supabase, source, `Pipeline run failed. Errors: ${JSON.stringify(errors).slice(0, 200)}`);
  }
  return { source, status, fetched, isNew, enriched, staged, errors };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const body = await req.json().catch(() => ({}));
    const forceSource: string | undefined = body.source;
    const triggeredBy: string = body.triggered_by ?? "scheduler";

    let due: any[] = [];
    if (forceSource) {
      const { data } = await supabase.from("pipeline_schedule").select("*").eq("source", forceSource);
      due = data ?? [];
    } else {
      const { data } = await supabase
        .from("pipeline_schedule").select("*")
        .eq("enabled", true)
        .lte("next_run_at", new Date().toISOString())
        .order("next_run_at", { ascending: true })
        .limit(4); // cap per tick to avoid edge fn timeout
      due = data ?? [];
    }

    const results: any[] = [];
    for (const sched of due) {
      sched.triggered_by = triggeredBy;
      results.push(await runOneSource(supabase, sched));
    }

    return new Response(JSON.stringify({ ok: true, ran: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("run-data-pipeline error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
