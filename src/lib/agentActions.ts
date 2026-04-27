// Generic Agent Action system for Theodore.
// AI emits a fenced ```agent-action ... ``` block with JSON; we parse, render
// a confirmation card, and execute on user approval.

import { supabase } from "@/integrations/supabase/client";
import type { NavigateFunction } from "react-router-dom";

export type AgentAction =
  | { kind: "navigate"; path: string; label?: string }
  | { kind: "open_search"; query?: string }
  | { kind: "create_crm_contact"; contact: Record<string, any> }
  | { kind: "create_watchlist"; name: string; description?: string; category?: string }
  | { kind: "add_watchlist_item"; watchlist_name: string; symbol: string; name?: string; notes?: string }
  | { kind: "create_advisor_goal"; goal_type: string; target_value: number; period_start: string; period_end: string }
  | { kind: "create_task"; title: string; description?: string; due_date?: string; priority?: string }
  | { kind: "create_calendar_event"; title: string; start: string; end?: string; description?: string }
  | { kind: "trigger_scrape"; scraper: "financial-research" | "elite" | "uk-investor" | "investor-finder" | "companies-house" | "ai-auto"; params?: Record<string, any> }
  | { kind: "generate_report"; report_type: string; subject?: string; payload?: Record<string, any> }
  | { kind: "send_notification"; title: string; message: string; target_platform?: string };

export interface ParsedAgentAction {
  raw: string;
  action: AgentAction;
  destructive: boolean;
  adminOnly: boolean;
  description: string;
}

const DESTRUCTIVE_KINDS = new Set([
  "create_crm_contact",
  "create_watchlist",
  "add_watchlist_item",
  "create_advisor_goal",
  "create_task",
  "create_calendar_event",
  "trigger_scrape",
  "generate_report",
  "send_notification",
]);

const ADMIN_ONLY_KINDS = new Set(["trigger_scrape", "send_notification"]);

const ACTION_BLOCK_RE = /```agent-action\s*([\s\S]*?)```/i;

export function parseAgentAction(content: string): ParsedAgentAction | null {
  const match = content.match(ACTION_BLOCK_RE);
  if (!match) return null;
  try {
    const json = JSON.parse(match[1].trim());
    if (!json || typeof json !== "object" || !json.kind) return null;
    const action = json as AgentAction;
    return {
      raw: match[0],
      action,
      destructive: DESTRUCTIVE_KINDS.has(action.kind),
      adminOnly: ADMIN_ONLY_KINDS.has(action.kind),
      description: describe(action),
    };
  } catch {
    return null;
  }
}

export function stripAgentActionBlock(content: string): string {
  return content.replace(ACTION_BLOCK_RE, "").trim();
}

export function describe(a: AgentAction): string {
  switch (a.kind) {
    case "navigate": return `Open ${a.label || a.path}`;
    case "open_search": return `Open global search${a.query ? `: "${a.query}"` : ""}`;
    case "create_crm_contact": return `Add CRM contact: ${a.contact?.name || "(unnamed)"}`;
    case "create_watchlist": return `Create watchlist "${a.name}"`;
    case "add_watchlist_item": return `Add ${a.symbol} to watchlist "${a.watchlist_name}"`;
    case "create_advisor_goal": return `Create ${a.goal_type} goal (target ${a.target_value})`;
    case "create_task": return `Create task: "${a.title}"`;
    case "create_calendar_event": return `Schedule event: "${a.title}" on ${a.start}`;
    case "trigger_scrape": return `Run ${a.scraper} scraper`;
    case "generate_report": return `Generate ${a.report_type} report`;
    case "send_notification": return `Send notification: "${a.title}"`;
  }
}

export interface ExecuteContext {
  userId: string | null;
  isAdmin: boolean;
  navigate: NavigateFunction;
}

export async function executeAgentAction(
  a: AgentAction,
  ctx: ExecuteContext
): Promise<{ ok: boolean; message: string }> {
  if (ADMIN_ONLY_KINDS.has(a.kind) && !ctx.isAdmin) {
    return { ok: false, message: "Admin role required for this action." };
  }
  const requiresAuth = a.kind !== "navigate" && a.kind !== "open_search";
  if (requiresAuth && !ctx.userId) {
    return { ok: false, message: "You must be signed in." };
  }

  try {
    switch (a.kind) {
      case "navigate":
        ctx.navigate(a.path);
        return { ok: true, message: `Opened ${a.path}` };

      case "open_search":
        // The platform listens for a global event for ⌘K
        window.dispatchEvent(new CustomEvent("flowpulse:open-search", { detail: { query: a.query } }));
        return { ok: true, message: "Opened global search" };

      case "create_crm_contact": {
        const { error } = await (supabase.from("crm_contacts") as any).insert({
          user_id: ctx.userId,
          ...a.contact,
        });
        if (error) throw error;
        return { ok: true, message: `Contact "${a.contact?.name}" added to CRM.` };
      }

      case "create_watchlist": {
        const { error } = await supabase.from("investment_watchlists").insert({
          user_id: ctx.userId,
          name: a.name,
          description: a.description ?? null,
          category: a.category ?? null,
          platform: "finance",
        });
        if (error) throw error;
        return { ok: true, message: `Watchlist "${a.name}" created.` };
      }

      case "add_watchlist_item": {
        const { data: wl, error: wlErr } = await supabase
          .from("investment_watchlists")
          .select("id")
          .eq("user_id", ctx.userId)
          .ilike("name", a.watchlist_name)
          .limit(1)
          .maybeSingle();
        if (wlErr) throw wlErr;
        let watchlistId = wl?.id;
        if (!watchlistId) {
          const { data: created, error: cErr } = await supabase
            .from("investment_watchlists")
            .insert({ user_id: ctx.userId, name: a.watchlist_name, platform: "finance" })
            .select("id")
            .single();
          if (cErr) throw cErr;
          watchlistId = created.id;
        }
        const { error } = await supabase.from("watchlist_items").insert({
          watchlist_id: watchlistId,
          symbol: a.symbol,
          name: a.name ?? a.symbol,
          notes: a.notes ?? null,
        });
        if (error) throw error;
        return { ok: true, message: `${a.symbol} added to "${a.watchlist_name}".` };
      }

      case "create_advisor_goal": {
        const { error } = await supabase.from("advisor_goals").insert({
          user_id: ctx.userId,
          goal_type: a.goal_type,
          target_value: a.target_value,
          period_start: a.period_start,
          period_end: a.period_end,
        });
        if (error) throw error;
        return { ok: true, message: `Goal "${a.goal_type}" created.` };
      }

      case "create_task": {
        const { error } = await supabase.from("tasks" as any).insert({
          user_id: ctx.userId,
          title: a.title,
          description: a.description ?? null,
          due_date: a.due_date ?? null,
          priority: a.priority ?? "medium",
        });
        if (error) throw error;
        return { ok: true, message: `Task "${a.title}" created.` };
      }

      case "create_calendar_event": {
        const { error } = await supabase.from("calendar_events" as any).insert({
          user_id: ctx.userId,
          title: a.title,
          start_time: a.start,
          end_time: a.end ?? a.start,
          description: a.description ?? null,
        });
        if (error) throw error;
        return { ok: true, message: `Event "${a.title}" scheduled.` };
      }

      case "trigger_scrape": {
        const map: Record<string, string> = {
          "financial-research": "financial-research-scraper",
          "elite": "elite-scraper-analyst",
          "uk-investor": "investor-finder-scraper",
          "investor-finder": "investor-finder-scraper",
          "companies-house": "companies-house-scraper",
          "ai-auto": "ai-auto-scanner",
        };
        const fn = map[a.scraper];
        if (!fn) return { ok: false, message: `Unknown scraper "${a.scraper}".` };
        const { error } = await supabase.functions.invoke(fn, { body: a.params || {} });
        if (error) throw error;
        return { ok: true, message: `${a.scraper} scrape started.` };
      }

      case "generate_report": {
        const { error } = await supabase.functions.invoke("generate-research-report", {
          body: { report_type: a.report_type, subject: a.subject, ...a.payload },
        });
        if (error) throw error;
        return { ok: true, message: `Report "${a.report_type}" generation triggered.` };
      }

      case "send_notification": {
        const { error } = await supabase.functions.invoke("send-push-notification", {
          body: {
            title: a.title,
            message: a.message,
            target_platform: a.target_platform || "finance",
          },
        });
        if (error) throw error;
        return { ok: true, message: "Notification dispatched." };
      }
    }
  } catch (e: any) {
    return { ok: false, message: e?.message || "Action failed." };
  }
}
