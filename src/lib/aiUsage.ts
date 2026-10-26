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
