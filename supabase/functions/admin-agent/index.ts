// FlowPulse Admin Agent — an operations copilot for /admin.
// Read tools run immediately with the admin's own token (RLS applies).
// Action tools are never executed by the model: they come back as proposals
// the admin confirms in the UI, which then calls this function with
// { execute: { tool, args } }.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { meteredFetch } from "../_shared/metered.ts";
import { identify } from "../_shared/guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MAX_STEPS = 6;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// ─── Knowledge ────────────────────────────────────────────────────────────
const PLAYBOOK = `You are FlowPulse Agent, the operations copilot inside FlowPulse's admin console (flowpulse.co.uk/admin). You are an expert in how FlowPulse works end to end and you help the admin run it: diagnose problems, explain what is happening, find records, and carry out tasks.

FLOWPULSE IN ONE PARAGRAPH
FlowPulse is a UK investment-research platform with two customer products: FlowPulse Finance (advisers and planners: research, planning, CRM, compliance, client delivery) and FlowPulse Investor (deal flow, opportunity intelligence, discovery, stocks & crypto research). The admin console sources data with scrapers and AI, reviews it, and publishes it to those products. Currency is GBP. Content must never fabricate figures, ratings or price targets, and is general research, not personal advice.

CORE WORKFLOWS
1. Data pipeline (tab "data-pipeline"): pipeline_schedule lists sources (opportunity-research, investor-finder, elite-scraper, companies-house…) with cadence, next_run_at, last_status, consecutive_failures. run-data-pipeline scrapes due sources, de-duplicates, enriches with AI and stages rows in pipeline_pending_items (status pending). An admin approves (RPC approve_pending_item → promoted into opportunity_products, shown in FlowPulse Investor › Opportunity Intelligence) or rejects. pipeline_runs records each run.
2. Analyst AI pipeline (tab "analyst-queue"): analyst-pipeline runs scrape → classify (analyst_raw_signals → analyst_signals) → score (analyst_opportunities) → generate briefs (analyst_briefs) with a compliance check. Briefs are pending, quarantined (compliance flags) , promoted (into opportunities via analyst-promote-brief) or rejected. Its cron honours analyst_pipeline_settings.autoscrape_enabled.
3. Research reports (tabs "stock-report-scraper", "crypto-report-scraper"): research_scraper_schedules drive run-research-scraper-schedules (daily cap 10 per asset type); manual runs call generate-research-report-ai. Output: generated_research_reports with status draft → promoted (visible on /research-reports) → archived. Reports are structured: executive summary, analysis sections, scenarios/catalysts/risks, sources & disclosures.
4. Intel (funding signals, "funding-signals"/"deal-flow"): intel-orchestrate (hourly cron) runs intel-ingest-firecrawl (intel_events, status new) then intel-validate (AI extraction → validated/rejected, intel_companies, intel_alerts).
5. Finders: DM Finder ("dm-finder", dm_finder_searches/contacts), Company Finder ("company-finder"), UK investor scanner ("investor-finder"), Companies House registry ("company-registry").
6. Content: newsletters, market_commentary ("commentary"), learning_content ("learning"), market_trends, alerts (investor_alerts/realtime_investment_alerts), featured_analyst_picks ("featured-picks"), purchasable_reports (lead magnets, "purchasable-reports").
7. Audience: users ("users"; user_profiles, user_roles), demo_requests, contact_submissions ("enquiries"), report_access_requests / insights requests ("insights-requests"), subscriptions (Stripe — never change billing).

COST CONTROLS (always mention when relevant)
- Master switch platform_config.auto_scraper_enabled: off stops every timed scraper (crons and browser auto-runs); manual buttons still work.
- Daily budget platform_config.ai_budget {enabled, daily_ai_calls, daily_firecrawl_calls} applies to admin sourcing functions; when reached, calls are refused with a "budget reached" message. Customer-facing AI is never blocked.
- ai_usage_log records every AI/Firecrawl call; Firecrawl results are cached (scrape 12h, search 6h). Tab "ai-usage" shows it.
- Before proposing anything that spends credits (runs, report generation), say roughly what it costs (e.g. one research report ≈ 2 searches + up to 10 page scrapes + 1 Gemini Pro call + 1 image).

ADMIN TABS you can open with open_admin_tab: users, demo-requests, enquiries, ai-usage, data-pipeline, analyst-queue, saved-scrapes, stock-report-scraper, crypto-report-scraper, research-scraper, research-engine, research-ai, opportunities, opportunity-engine, ai-scanner, flowpulse-scraper, dm-finder, company-finder, investor-finder, company-registry, company-intelligence, funding-signals, deal-flow, startup-discovery, stocks-crypto, featured-picks, reports, newsletters, commentary, learning, videos, watchlists, market-trends, alerts, risk-compliance, compliance, portfolios, fund-scoring, fund-analyst, insights-requests, purchasable-reports, crm, document-generator, pdf-generator, calendar, planner, news, push-notifications, api-management, settings.

HOW YOU WORK
- Look before you speak: use the read tools to check real data instead of guessing. Never invent records, numbers or IDs.
- Changes go through action tools. Calling one does NOT run it — it shows the admin a Confirm card. Say clearly what will happen and that it awaits their confirmation. Propose the smallest set of actions that does the job; never repeat a proposal already waiting.
- You cannot change Stripe billing, secrets, edge-function code or database schema; say what the admin should do instead.
- Be concise and practical: short paragraphs or bullets, British English, specific next steps. Use markdown.`;

// ─── Tool definitions ─────────────────────────────────────────────────────
const fn = (name: string, description: string, properties: Record<string, unknown> = {}, required: string[] = []) => ({
  type: "function",
  function: { name, description, parameters: { type: "object", properties, required, additionalProperties: false } },
});

const READ_TABLES = [
  "pipeline_schedule", "pipeline_runs", "pipeline_pending_items", "opportunity_products", "opportunities", "opportunity_inquiries",
  "analyst_briefs", "analyst_opportunities", "analyst_signals", "analyst_pipeline_runs", "analyst_pipeline_settings",
  "generated_research_reports", "research_scraper_schedules", "research_generation_queue", "orchestrated_reports",
  "intel_events", "intel_companies", "intel_alerts", "intel_sources", "intel_source_runs",
  "dm_finder_searches", "dm_finder_contacts", "company_finder_searches", "company_finder_results", "companies_house_scrapes",
  "investor_finder_opportunities", "investor_finder_profiles", "admin_scrape_history", "startup_discovery",
  "newsletters", "market_commentary", "learning_content", "market_trends", "investor_alerts", "realtime_investment_alerts",
  "featured_analyst_picks", "purchasable_reports", "report_purchases", "report_access_requests",
  "user_profiles", "user_roles", "demo_requests", "contact_submissions", "subscriptions", "newsletter_subscriptions",
  "platform_config", "ai_usage_log", "stocks_crypto", "etf_fund_analyses", "crm_contacts", "audit_logs",
];

const EDITABLE_TABLES = [
  "opportunity_products", "opportunities", "generated_research_reports", "pipeline_pending_items", "analyst_briefs",
  "newsletters", "market_commentary", "learning_content", "market_trends", "featured_analyst_picks",
  "research_scraper_schedules", "pipeline_schedule", "demo_requests", "contact_submissions", "report_access_requests",
];

const filterSchema = {
  type: "array",
  description: "Filters, all must match",
  items: {
    type: "object",
    properties: {
      column: { type: "string" },
      op: { type: "string", enum: ["eq", "neq", "gt", "gte", "lt", "lte", "ilike", "is", "in"] },
      value: { description: "Value; for 'in' an array; for 'is' null/true/false; for 'ilike' a pattern like %term%" },
    },
    required: ["column", "op", "value"],
  },
};

const READ_TOOLS = [
  fn("platform_status", "Snapshot of FlowPulse operations: master switch, AI budget and today's usage, pipeline sources and recent runs, research schedules, analyst pipeline, and review queues. Use first when asked how things are going or what needs attention."),
  fn("ai_usage", "AI and Firecrawl usage per function per day.", { days: { type: "integer", minimum: 1, maximum: 60 } }),
  fn("query_table", "Read rows from a FlowPulse table.", {
    table: { type: "string", enum: READ_TABLES },
    columns: { type: "string", description: "Comma-separated columns (default *). Prefer a few useful columns." },
    filters: filterSchema,
    order_by: { type: "string" },
    ascending: { type: "boolean" },
    limit: { type: "integer", minimum: 1, maximum: 50 },
  }, ["table"]),
  fn("count_rows", "Count rows in a table matching filters.", { table: { type: "string", enum: READ_TABLES }, filters: filterSchema }, ["table"]),
  fn("find_users", "Search users by name or email.", { query: { type: "string" } }, ["query"]),
  fn("open_admin_tab", "Open an admin tab for the admin (no confirmation needed).", { tab: { type: "string" } }, ["tab"]),
];

const ACTION_TOOLS = [
  fn("set_auto_scraper", "Switch the master auto-scraper switch on or off.", { enabled: { type: "boolean" } }, ["enabled"]),
  fn("set_ai_budget", "Change the daily AI/Firecrawl limits.", {
    enabled: { type: "boolean" }, daily_ai_calls: { type: "integer", minimum: 1 }, daily_firecrawl_calls: { type: "integer", minimum: 1 },
  }),
  fn("run_pipeline_source", "Run one data-pipeline source now (spends credits).", { source: { type: "string" } }, ["source"]),
  fn("run_analyst_pipeline", "Run the analyst AI pipeline now (spends credits).", {
    stages: { type: "array", items: { type: "string", enum: ["scrape", "classify", "score", "generate"] } },
  }),
  fn("set_schedule_enabled", "Enable or disable a pipeline source or a research report schedule.", {
    kind: { type: "string", enum: ["pipeline", "research"] },
    key: { type: "string", description: "pipeline: source name; research: schedule id" },
    enabled: { type: "boolean" },
  }, ["kind", "key", "enabled"]),
  fn("approve_pending_item", "Approve a staged pipeline item and publish it to Opportunity Intelligence.", {
    item_id: { type: "string" }, platform: { type: "string", enum: ["investor", "finance", "both"] },
  }, ["item_id"]),
  fn("reject_pending_item", "Reject a staged pipeline item.", { item_id: { type: "string" } }, ["item_id"]),
  fn("set_report_status", "Promote (publish), archive or return a research report to draft.", {
    report_id: { type: "string" }, status: { type: "string", enum: ["promoted", "archived", "draft"] },
  }, ["report_id", "status"]),
  fn("generate_research_report", "Generate a new stock or crypto research report as a draft (spends credits, ~1–3 minutes).", {
    asset_type: { type: "string", enum: ["stock", "crypto"] }, topic: { type: "string" }, ticker: { type: "string" },
  }, ["asset_type", "topic"]),
  fn("promote_analyst_brief", "Promote an analyst brief into Opportunities.", {
    brief_id: { type: "string" }, platform: { type: "string", enum: ["investor", "finance", "both"] },
  }, ["brief_id"]),
  fn("reject_analyst_brief", "Reject an analyst brief.", { brief_id: { type: "string" } }, ["brief_id"]),
  fn("post_newsletter", "Publish a newsletter to users.", {
    title: { type: "string" }, content: { type: "string", description: "Markdown" },
    platform: { type: "string", enum: ["finance", "investor", "all"] },
  }, ["title", "content"]),
  fn("post_alert", "Send an alert/notification to users.", {
    title: { type: "string" }, description: { type: "string" },
    severity: { type: "string", enum: ["info", "warning", "critical"] },
    alert_type: { type: "string", enum: ["market_update", "deal_alert", "regulatory", "portfolio_alert", "risk_alert"] },
    platform: { type: "string", enum: ["finance", "investor", "all"] },
  }, ["title", "description"]),
  fn("update_record", "Change fields on one record (for fixing data).", {
    table: { type: "string", enum: EDITABLE_TABLES }, id: { type: "string" },
    changes: { type: "object", description: "Column → new value" },
  }, ["table", "id", "changes"]),
];

const ACTION_NAMES = new Set(ACTION_TOOLS.map((t) => t.function.name));

// ─── Read tool implementations ────────────────────────────────────────────
function applyFilters(q: any, filters: any[] = []) {
  for (const f of filters ?? []) {
    if (!f?.column || !/^[a-z_][a-z0-9_]*$/i.test(f.column)) continue;
    switch (f.op) {
      case "eq": q = q.eq(f.column, f.value); break;
      case "neq": q = q.neq(f.column, f.value); break;
      case "gt": q = q.gt(f.column, f.value); break;
      case "gte": q = q.gte(f.column, f.value); break;
      case "lt": q = q.lt(f.column, f.value); break;
      case "lte": q = q.lte(f.column, f.value); break;
      case "ilike": q = q.ilike(f.column, String(f.value)); break;
      case "is": q = q.is(f.column, f.value); break;
      case "in": q = q.in(f.column, Array.isArray(f.value) ? f.value : [f.value]); break;
    }
  }
  return q;
}

function trimRows(rows: any[]): any[] {
  // Keep tool results small: truncate long strings and drop big blobs.
  return rows.map((r) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r ?? {})) {
      if (typeof v === "string") out[k] = v.length > 400 ? v.slice(0, 400) + "…" : v;
      else if (v && typeof v === "object") {
        const s = JSON.stringify(v);
        out[k] = s.length > 400 ? s.slice(0, 400) + "…" : v;
      } else out[k] = v;
    }
    return out;
  });
}

async function count(sb: SupabaseClient, table: string, filters: any[] = []) {
  const { count, error } = await applyFilters(sb.from(table).select("*", { count: "exact", head: true }), filters);
  return error ? null : count;
}

async function runRead(sb: SupabaseClient, name: string, args: any): Promise<unknown> {
  switch (name) {
    case "platform_status": {
      const since = new Date(Date.now() - 24 * 3600_000).toISOString();
      const [cfg, usage, schedules, runs, research, analystSettings, analystRuns] = await Promise.all([
        sb.from("platform_config").select("key,value,updated_at").in("key", ["auto_scraper_enabled", "ai_budget"]),
        sb.rpc("ai_usage_summary", { _days: 1 }),
        sb.from("pipeline_schedule").select("source,enabled,cadence_minutes,next_run_at,last_run_at,last_status,consecutive_failures,last_error"),
        sb.from("pipeline_runs").select("source,status,started_at,records_fetched,records_staged,errors").order("started_at", { ascending: false }).limit(8),
        sb.from("research_scraper_schedules").select("id,asset_type,topic,enabled,frequency_hours,next_run_at,last_run_status,last_run_error"),
        sb.from("analyst_pipeline_settings").select("*").limit(1),
        sb.from("analyst_pipeline_runs").select("trigger_source,scraped,classified,scored,generated,errors,finished_at").order("finished_at", { ascending: false }).limit(5),
      ]);
      const [pendingItems, briefsPending, briefsQuarantined, draftReports, newDemo, newContacts] = await Promise.all([
        count(sb, "pipeline_pending_items", [{ column: "status", op: "eq", value: "pending" }]),
        count(sb, "analyst_briefs", [{ column: "status", op: "eq", value: "pending" }]),
        count(sb, "analyst_briefs", [{ column: "status", op: "eq", value: "quarantined" }]),
        count(sb, "generated_research_reports", [{ column: "status", op: "eq", value: "draft" }]),
        count(sb, "demo_requests", [{ column: "created_at", op: "gte", value: since }]),
        count(sb, "contact_submissions", [{ column: "created_at", op: "gte", value: since }]),
      ]);
      const usageRows = (usage.data as any[]) ?? [];
      const sum = (p: string) => usageRows.filter((r) => r.provider === p).reduce((n, r) => n + Number(r.calls), 0);
      return {
        config: cfg.data,
        usage_today: usage.error ? "usage log not available yet (migration not applied)" : { ai_calls: sum("ai"), firecrawl_calls: sum("firecrawl"), by_function: usageRows.slice(0, 15) },
        pipeline_sources: schedules.data,
        recent_pipeline_runs: trimRows(runs.data ?? []),
        research_schedules: trimRows(research.data ?? []),
        analyst_pipeline: { settings: analystSettings.data?.[0], recent_runs: trimRows(analystRuns.data ?? []) },
        queues: {
          pipeline_items_pending: pendingItems, analyst_briefs_pending: briefsPending, analyst_briefs_quarantined: briefsQuarantined,
          research_reports_draft: draftReports, demo_requests_24h: newDemo, contact_submissions_24h: newContacts,
        },
      };
    }
    case "ai_usage": {
      const { data, error } = await sb.rpc("ai_usage_summary", { _days: Math.min(60, Math.max(1, Number(args?.days) || 7)) });
      if (error) return { error: "Usage log not available yet: migration 20261026210000_ai_usage_metering.sql needs applying." };
      return data;
    }
    case "query_table": {
      if (!READ_TABLES.includes(args?.table)) return { error: "Table not allowed" };
      const columns = typeof args.columns === "string" && /^[a-z0-9_,\s*]+$/i.test(args.columns) ? args.columns : "*";
      let q = applyFilters(sb.from(args.table).select(columns), args.filters);
      if (args.order_by && /^[a-z_][a-z0-9_]*$/i.test(args.order_by)) q = q.order(args.order_by, { ascending: args.ascending === true });
      const { data, error } = await q.limit(Math.min(50, Math.max(1, Number(args.limit) || 15)));
      return error ? { error: error.message } : { rows: trimRows(data ?? []), count: data?.length ?? 0 };
    }
    case "count_rows": {
      if (!READ_TABLES.includes(args?.table)) return { error: "Table not allowed" };
      return { count: await count(sb, args.table, args.filters) };
    }
    case "find_users": {
      const term = String(args?.query ?? "").replace(/[%,()]/g, " ").trim();
      const { data, error } = await sb.from("user_profiles")
        .select("user_id,email,full_name,created_at")
        .or(`email.ilike.%${term}%,full_name.ilike.%${term}%`)
        .limit(20);
      return error ? { error: error.message } : data;
    }
  }
  return { error: `Unknown tool ${name}` };
}

// ─── Action implementations (run only after the admin confirms) ─────────────
function describe(name: string, a: any): string {
  switch (name) {
    case "set_auto_scraper": return `Turn scheduled scraping ${a.enabled ? "ON" : "OFF"}`;
    case "set_ai_budget": return `Set daily limits: ${[a.daily_ai_calls && `${a.daily_ai_calls} AI calls`, a.daily_firecrawl_calls && `${a.daily_firecrawl_calls} Firecrawl calls`, a.enabled === false && "limits off"].filter(Boolean).join(", ") || "no change"}`;
    case "run_pipeline_source": return `Run pipeline source "${a.source}" now (uses credits)`;
    case "run_analyst_pipeline": return `Run the analyst pipeline${a.stages?.length ? ` (${a.stages.join(", ")})` : ""} now (uses credits)`;
    case "set_schedule_enabled": return `${a.enabled ? "Enable" : "Disable"} ${a.kind} schedule ${a.key}`;
    case "approve_pending_item": return `Approve and publish pipeline item ${a.item_id} to ${a.platform ?? "investor"}`;
    case "reject_pending_item": return `Reject pipeline item ${a.item_id}`;
    case "set_report_status": return `Set research report ${a.report_id} to ${a.status}${a.status === "promoted" ? " (publishes it)" : ""}`;
    case "generate_research_report": return `Generate a ${a.asset_type} research report on "${a.topic}"${a.ticker ? ` (${a.ticker})` : ""} as a draft (uses credits)`;
    case "promote_analyst_brief": return `Promote analyst brief ${a.brief_id} to Opportunities (${a.platform ?? "both"})`;
    case "reject_analyst_brief": return `Reject analyst brief ${a.brief_id}`;
    case "post_newsletter": return `Publish newsletter "${a.title}" to ${a.platform ?? "all"} users`;
    case "post_alert": return `Send ${a.severity ?? "info"} alert "${a.title}" to ${a.platform ?? "all"} users`;
    case "update_record": return `Update ${a.table} ${a.id}: ${Object.keys(a.changes ?? {}).join(", ")}`;
  }
  return name;
}

async function callFunction(name: string, body: unknown, auth: string) {
  const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/${name}`, {
    method: "POST",
    headers: { Authorization: auth, apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: any = text;
  try { data = JSON.parse(text); } catch { /* text */ }
  if (!res.ok) throw new Error(typeof data === "object" ? data?.error ?? JSON.stringify(data).slice(0, 300) : text.slice(0, 300));
  return data;
}

async function upsertConfig(sb: SupabaseClient, key: string, value: unknown, userId: string) {
  const { error } = await sb.from("platform_config").upsert({ key, value, updated_at: new Date().toISOString(), updated_by: userId });
  if (error) throw error;
}

async function runAction(sb: SupabaseClient, name: string, a: any, auth: string, userId: string): Promise<unknown> {
  switch (name) {
    case "set_auto_scraper":
      await upsertConfig(sb, "auto_scraper_enabled", { enabled: a.enabled === true }, userId);
      return { enabled: a.enabled === true };
    case "set_ai_budget": {
      const { data } = await sb.from("platform_config").select("value").eq("key", "ai_budget").maybeSingle();
      const value = { enabled: true, daily_ai_calls: 600, daily_firecrawl_calls: 300, ...((data?.value as object) ?? {}) } as any;
      if (typeof a.enabled === "boolean") value.enabled = a.enabled;
      if (Number(a.daily_ai_calls) > 0) value.daily_ai_calls = Number(a.daily_ai_calls);
      if (Number(a.daily_firecrawl_calls) > 0) value.daily_firecrawl_calls = Number(a.daily_firecrawl_calls);
      await upsertConfig(sb, "ai_budget", value, userId);
      return value;
    }
    case "run_pipeline_source":
      return await callFunction("run-data-pipeline", { source: a.source, triggered_by: "admin-agent" }, auth);
    case "run_analyst_pipeline":
      return await callFunction("analyst-pipeline", { trigger: "manual", ...(a.stages?.length ? { stages: a.stages } : {}) }, auth);
    case "set_schedule_enabled": {
      const q = a.kind === "pipeline"
        ? sb.from("pipeline_schedule").update({ enabled: a.enabled === true }).eq("source", a.key)
        : sb.from("research_scraper_schedules").update({ enabled: a.enabled === true }).eq("id", a.key);
      const { data, error } = await q.select();
      if (error) throw error;
      if (!data?.length) throw new Error("No matching schedule");
      return { updated: data.length };
    }
    case "approve_pending_item": {
      const { data, error } = await sb.rpc("approve_pending_item", {
        _item_id: a.item_id, _target_table: "opportunity_products", _platform: a.platform ?? "investor",
      });
      if (error) throw error;
      if ((data as any)?.ok === false) throw new Error((data as any)?.error ?? "Could not promote");
      return data;
    }
    case "reject_pending_item": {
      const { data, error } = await sb.from("pipeline_pending_items")
        .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: userId })
        .eq("id", a.item_id).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("Item not found");
      return { rejected: a.item_id };
    }
    case "set_report_status": {
      const patch: Record<string, unknown> = { status: a.status };
      if (a.status === "promoted") patch.promoted_at = new Date().toISOString();
      const { data, error } = await sb.from("generated_research_reports").update(patch).eq("id", a.report_id).select("id,title,status");
      if (error) throw error;
      if (!data?.length) throw new Error("Report not found");
      return data[0];
    }
    case "generate_research_report":
      return await callFunction("generate-research-report-ai", { assetType: a.asset_type, topic: a.topic, ticker: a.ticker ?? "" }, auth);
    case "promote_analyst_brief":
      return await callFunction("analyst-promote-brief", { brief_id: a.brief_id, platform: a.platform ?? "both" }, auth);
    case "reject_analyst_brief": {
      const { data, error } = await sb.from("analyst_briefs").update({ status: "rejected" }).eq("id", a.brief_id).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("Brief not found");
      return { rejected: a.brief_id };
    }
    case "post_newsletter":
    case "post_alert":
      return await callFunction("admin-chat-actions", { action: name, params: a }, auth);
    case "update_record": {
      if (!EDITABLE_TABLES.includes(a.table)) throw new Error("Table not editable");
      const changes = Object.fromEntries(Object.entries(a.changes ?? {}).filter(([k]) => /^[a-z_][a-z0-9_]*$/i.test(k) && k !== "id"));
      if (!Object.keys(changes).length) throw new Error("No valid changes");
      const { data, error } = await sb.from(a.table).update(changes).eq("id", a.id).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("Record not found");
      return { updated: a.id, fields: Object.keys(changes) };
    }
  }
  throw new Error(`Unknown action ${name}`);
}

// ─── Entry ────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const caller = await identify(req);
  if (caller.kind !== "admin") return json({ error: "Admin access required" }, caller.kind === "user" ? 403 : 401);
  const auth = req.headers.get("Authorization") ?? "";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });

  try {
    const body = await req.json().catch(() => ({}));

    // Confirmed action from the UI.
    if (body?.execute?.tool) {
      const { tool, args } = body.execute;
      if (!ACTION_NAMES.has(tool)) return json({ ok: false, error: "Unknown action" }, 400);
      try {
        const result = await runAction(sb, tool, args ?? {}, auth, caller.userId);
        await sb.from("audit_logs").insert({ user_id: caller.userId, action: `admin_agent.${tool}`, details: { args } } as any).then(() => {}, () => {});
        return json({ ok: true, summary: describe(tool, args ?? {}), result });
      } catch (e) {
        return json({ ok: false, summary: describe(tool, args ?? {}), error: (e as Error).message });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const history = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
      .slice(-24)
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 8000) }));
    if (!history.length) return json({ error: "No message" }, 400);

    const model = body?.deep ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";
    const context = typeof body?.context === "string" ? `\n\nThe admin is currently on the "${body.context.slice(0, 60)}" tab.` : "";
    const messages: any[] = [
      { role: "system", content: `${PLAYBOOK}\n\nToday is ${new Date().toISOString().slice(0, 10)}.${context}` },
      ...history,
    ];
    const tools = [...READ_TOOLS, ...ACTION_TOOLS];
    const proposals: Array<{ id: string; tool: string; args: unknown; summary: string }> = [];
    const uiActions: Array<{ type: string; tab?: string }> = [];
    const activity: string[] = [];

    for (let step = 0; step < MAX_STEPS; step++) {
      const res = await meteredFetch("admin-agent", AI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, tools }),
      });
      if (!res.ok) {
        const t = await res.text();
        const msg = res.status === 402 ? "The AI budget or credits are exhausted — check Admin › AI Usage." :
          res.status === 429 ? "The AI service is rate-limiting; try again in a moment." : `AI error ${res.status}: ${t.slice(0, 200)}`;
        return json({ reply: msg, proposals, ui_actions: uiActions, activity }, 200);
      }
      const data = await res.json();
      const msg = data?.choices?.[0]?.message;
      const calls = msg?.tool_calls ?? [];
      if (!calls.length) {
        return json({ reply: msg?.content ?? "", proposals, ui_actions: uiActions, activity });
      }
      messages.push({ role: "assistant", content: msg.content ?? "", tool_calls: calls });
      for (const call of calls) {
        const name = call.function?.name;
        let args: any = {};
        try { args = JSON.parse(call.function?.arguments || "{}"); } catch { /* empty */ }
        let result: unknown;
        if (name === "open_admin_tab") {
          uiActions.push({ type: "open_tab", tab: String(args.tab ?? "") });
          result = { opened: args.tab };
        } else if (ACTION_NAMES.has(name)) {
          const id = `p${proposals.length + 1}`;
          proposals.push({ id, tool: name, args, summary: describe(name, args) });
          result = { status: "awaiting_admin_confirmation", proposal_id: id, note: "Not executed yet. The admin sees a Confirm card." };
        } else {
          activity.push(name);
          try { result = await runRead(sb, name, args); } catch (e) { result = { error: (e as Error).message }; }
        }
        const content = JSON.stringify(result);
        messages.push({ role: "tool", tool_call_id: call.id, content: content.length > 14000 ? content.slice(0, 14000) + "…(truncated)" : content });
      }
    }
    return json({ reply: "I ran out of steps for this request — ask me to continue or narrow it down.", proposals, ui_actions: uiActions, activity });
  } catch (e) {
    console.error("admin-agent error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});
