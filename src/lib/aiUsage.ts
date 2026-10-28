// Admin helpers for AI/Firecrawl spend: the master auto-scraper switch, the
// daily budget (platform_config "ai_budget") and the usage summary.
import { supabase } from "@/integrations/supabase/client";

export interface AiBudget {
  enabled: boolean;
  daily_ai_calls: number;
  daily_firecrawl_calls: number;
}

export const DEFAULT_AI_BUDGET: AiBudget = { enabled: true, daily_ai_calls: 600, daily_firecrawl_calls: 300 };

export interface AiUsageRow {
  day: string;
  fn: string;
  provider: "ai" | "firecrawl" | "other";
  calls: number;
  cached: number;
  blocked: number;
  failed: number;
  prompt_tokens: number;
  completion_tokens: number;
}

export async function autoScraperEnabled(): Promise<boolean> {
  const { data } = await supabase
    .from("platform_config" as any)
    .select("value")
    .eq("key", "auto_scraper_enabled")
    .maybeSingle();
  return (data as any)?.value?.enabled === true;
}

export async function setAutoScraperEnabled(enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from("platform_config" as any)
    .upsert({ key: "auto_scraper_enabled", value: { enabled }, updated_at: new Date().toISOString() } as any);
  if (error) throw error;
}

export async function loadAiBudget(): Promise<AiBudget> {
  const { data } = await supabase
    .from("platform_config" as any)
    .select("value")
    .eq("key", "ai_budget")
    .maybeSingle();
  return { ...DEFAULT_AI_BUDGET, ...((data as any)?.value ?? {}) };
}

export async function saveAiBudget(budget: AiBudget): Promise<void> {
  const { error } = await supabase
    .from("platform_config" as any)
    .upsert({ key: "ai_budget", value: budget, updated_at: new Date().toISOString() } as any);
  if (error) throw error;
}

export async function loadAiUsage(days = 14): Promise<AiUsageRow[]> {
  const { data, error } = await supabase.rpc("ai_usage_summary" as any, { _days: days });
  if (error) throw error;
  return ((data as any[]) ?? []).map((r) => ({
    ...r,
    calls: Number(r.calls), cached: Number(r.cached), blocked: Number(r.blocked), failed: Number(r.failed),
    prompt_tokens: Number(r.prompt_tokens), completion_tokens: Number(r.completion_tokens),
  }));
}

// Automation switchboard (migration 20261028120000): every timed job is off until an admin turns it on.
export interface AutomationJob {
  jobname: string;
  label: string | null;
  description: string | null;
  schedule: string;
  uses_ai: boolean;
  enabled: boolean;
  scheduled: boolean;
  updated_at: string;
}

export async function loadAutomationJobs(): Promise<AutomationJob[]> {
  const { data, error } = await supabase.rpc("automation_status" as any);
  if (error) throw error;
  return (data as any[]) ?? [];
}

export async function setAutomationJob(jobname: string, enabled: boolean): Promise<void> {
  const { error } = await supabase.rpc("set_automation_job" as any, { _jobname: jobname, _enabled: enabled });
  if (error) throw error;
}

export async function setAllAutomation(enabled: boolean): Promise<number> {
  const { data, error } = await supabase.rpc("set_all_automation" as any, { _enabled: enabled });
  if (error) throw error;
  return Number(data ?? 0);
}

/** "*\/30 * * * *" → "every 30 min"; falls back to the raw cron text. */
export function describeSchedule(cron: string): string {
  const [m, h, dom, mon, dow] = cron.trim().split(/\s+/);
  if (dom !== "*" || mon !== "*") return cron;
  const step = m?.match(/^\*\/(\d+)$/);
  if (step && h === "*" && dow === "*") return `every ${step[1]} min`;
  if (m === "*" && h === "*" && dow === "*") return "every minute";
  if (/^\d+$/.test(m ?? "") && h === "*" && dow === "*") return "hourly";
  if (/^\d+$/.test(m ?? "") && /^\d+$/.test(h ?? "")) {
    const at = `${h!.padStart(2, "0")}:${m!.padStart(2, "0")} UTC`;
    return dow === "*" ? `daily at ${at}` : `weekly at ${at}`;
  }
  return cron;
}
