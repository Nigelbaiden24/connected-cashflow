// Client helpers for the Analyst Portfolio Review add-on (FlowPulse Investor).
import { supabase } from "@/integrations/supabase/client";
import { notifyEvent } from "@/lib/pushEvents";
import {
  type Holding, type ParseResult, type PortfolioAnalytics, type PortfolioReview,
  analysePortfolio, parseHoldingRows, parseHoldingText,
} from "../../supabase/functions/_shared/portfolioAnalytics";

export * from "../../supabase/functions/_shared/portfolioAnalytics";

export const PORTFOLIO_REVIEW_ADDON = "portfolio_review";

export type ReviewStatus = "submitted" | "in_review" | "delivered" | "cancelled";

export interface ReviewRequest {
  id: string;
  user_id: string;
  title: string;
  status: ReviewStatus;
  objectives: string | null;
  risk_profile: "cautious" | "balanced" | "growth" | "adventurous" | null;
  time_horizon: string | null;
  income_need: string | null;
  constraints: string | null;
  base_currency: string;
  holdings: Holding[];
  total_value: number | null;
  source_file_name: string | null;
  assigned_to: string | null;
  analyst_name: string | null;
  review: PortfolioReview | null;
  delivered_at: string | null;
  user_rating: number | null;
  user_feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewMessage {
  id: string;
  request_id: string;
  sender_id: string;
  sender_role: "client" | "analyst";
  body: string;
  created_at: string;
}

export interface Entitlement {
  id: string;
  user_id: string;
  addon: string;
  status: "active" | "revoked";
  reviews_included: number | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
}

export const STATUS_LABEL: Record<ReviewStatus, string> = {
  submitted: "Submitted",
  in_review: "With an analyst",
  delivered: "Review delivered",
  cancelled: "Cancelled",
};

const db = supabase as any; // new tables are not in the generated types yet

/** Reads a CSV / Excel / TSV file into holdings. */
export async function parsePortfolioFile(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx")) {
    const { default: readXlsxFile } = await import("read-excel-file");
    const rows = await readXlsxFile(file);
    return parseHoldingRows(rows as unknown[][]);
  }
  if (name.endsWith(".xls")) {
    return { holdings: [], warnings: ["Old .xls files aren't supported — save the file as .xlsx or .csv and try again."], weightsOnly: false };
  }
  return parseHoldingText(await file.text());
}

export async function getMyEntitlement(): Promise<Entitlement | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await db.from("enterprise_addons").select("*")
    .eq("user_id", user.id).eq("addon", PORTFOLIO_REVIEW_ADDON).maybeSingle();
  if (!data || data.status !== "active") return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  return data as Entitlement;
}

export async function listMyReviews(): Promise<ReviewRequest[]> {
  const { data, error } = await db.from("portfolio_review_requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReviewRequest[];
}

export async function submitReview(input: {
  title: string; objectives: string; risk_profile: ReviewRequest["risk_profile"]; time_horizon: string;
  income_need: string; constraints: string; base_currency: string; holdings: Holding[]; source_file_name?: string;
}): Promise<ReviewRequest> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in again.");
  const total = input.holdings.reduce((s, h) => s + (Number.isFinite(h.value) ? h.value : 0), 0);
  const { data, error } = await db.from("portfolio_review_requests").insert({
    ...input,
    user_id: user.id,
    total_value: total,
    source_file_name: input.source_file_name ?? null,
  }).select().single();
  if (error) {
    if (/row-level security/i.test(error.message)) throw new Error("Your account has no Portfolio Review add-on, or no reviews left in your allowance.");
    throw error;
  }
  return data as ReviewRequest;
}

export async function cancelReview(id: string) {
  const { data, error } = await db.rpc("cancel_portfolio_review", { _id: id });
  if (error) throw error;
  if (!data) throw new Error("Only reviews that haven't been picked up can be cancelled.");
}

export async function rateReview(id: string, rating: number, feedback: string) {
  const { error } = await db.rpc("rate_portfolio_review", { _id: id, _rating: rating, _feedback: feedback || null });
  if (error) throw error;
}

export async function listMessages(requestId: string): Promise<ReviewMessage[]> {
  const { data, error } = await db.from("portfolio_review_messages").select("*").eq("request_id", requestId).order("created_at");
  if (error) throw error;
  return (data ?? []) as ReviewMessage[];
}

export async function sendMessage(requestId: string, body: string, role: "client" | "analyst") {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in again.");
  const { error } = await db.from("portfolio_review_messages").insert({ request_id: requestId, body, sender_role: role, sender_id: user.id });
  if (error) throw error;
  if (role === "analyst") notifyEvent({ event: "portfolio_message", id: requestId });
}

export const analyticsFor = (r: Pick<ReviewRequest, "holdings">): PortfolioAnalytics => analysePortfolio(r.holdings ?? []);

export const money = (n: number, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: /^[A-Z]{3}$/.test(currency) ? currency : "GBP", maximumFractionDigits: 0 }).format(n || 0);

export const pct = (n: number, dp = 1) => `${((n || 0) * 100).toFixed(dp)}%`;

// ── Admin ──────────────────────────────────────────────────────────────────
export async function adminListRequests(): Promise<ReviewRequest[]> {
  const { data, error } = await db.from("portfolio_review_requests").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  return (data ?? []) as ReviewRequest[];
}

export async function adminGetDraft(requestId: string) {
  const { data } = await db.from("portfolio_review_drafts").select("*").eq("request_id", requestId).maybeSingle();
  return data as { analytics: PortfolioAnalytics | null; ai_draft: any; working: Partial<PortfolioReview> | null; internal_notes: string | null } | null;
}

export async function adminSaveWorking(requestId: string, working: Partial<PortfolioReview>, internal_notes: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await db.from("portfolio_review_drafts").upsert({
    request_id: requestId, working, internal_notes, updated_by: user?.id, updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function adminGenerateDraft(requestId: string) {
  const { data, error } = await supabase.functions.invoke("portfolio-review-ai", { body: { request_id: requestId } });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as { draft: any; analytics: PortfolioAnalytics; kept_working_copy: boolean };
}

export async function adminUpdateRequest(id: string, patch: Partial<ReviewRequest>) {
  const { error } = await db.from("portfolio_review_requests").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function adminDeliver(id: string, review: PortfolioReview, analystName: string) {
  await adminUpdateRequest(id, { review, analyst_name: analystName, status: "delivered", delivered_at: new Date().toISOString() } as any);
  notifyEvent({ event: "portfolio_review_delivered", id });
}

export async function adminListEntitlements(): Promise<Entitlement[]> {
  const { data, error } = await db.from("enterprise_addons").select("*").eq("addon", PORTFOLIO_REVIEW_ADDON).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Entitlement[];
}

export async function adminGrant(userId: string, opts: { reviews_included?: number | null; expires_at?: string | null; notes?: string | null }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await db.from("enterprise_addons").upsert({
    user_id: userId, addon: PORTFOLIO_REVIEW_ADDON, status: "active",
    reviews_included: opts.reviews_included ?? null, expires_at: opts.expires_at ?? null, notes: opts.notes ?? null,
    granted_by: user?.id, updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,addon" });
  if (error) throw error;
}

export async function adminRevoke(id: string) {
  const { error } = await db.from("enterprise_addons").update({ status: "revoked", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function findUsers(query: string) {
  const term = query.replace(/[%,()]/g, " ").trim();
  if (term.length < 2) return [];
  const { data } = await supabase.from("user_profiles").select("user_id,email,full_name")
    .or(`email.ilike.%${term}%,full_name.ilike.%${term}%`).limit(10);
  return (data ?? []) as Array<{ user_id: string; email: string | null; full_name: string | null }>;
}
