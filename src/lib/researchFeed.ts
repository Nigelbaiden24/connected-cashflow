// Data layer for the investor research feeds (Stock / Crypto Research).
// Lists are cached (memory + localStorage) so tabs paint instantly and then
// refresh in the background; full reports load on hover/open and are cached.
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { applyPaywall, resolveViewer } from "@/lib/researchAccess";

export type ResearchAsset = "stock" | "crypto";

export interface PromotedReport {
  id: string;
  asset_type: ResearchAsset;
  title: string;
  slug: string;
  ticker: string | null;
  excerpt: string | null;
  hero_image_url: string | null;
  html_content: string;
  pages: Array<{ title: string; html: string }> | null;
  page_count: number | null;
  report_date: string | null;
  ai_score: number | null;
  ai_tags: string[] | null;
  reading_time_minutes: number | null;
  author_name: string | null;
  sources: Array<{ url: string; title?: string | null }> | null;
  promoted_at: string | null;
  created_at: string;
  // Set for viewers without a subscription: no excerpt or pages, just a teaser.
  locked?: boolean;
  teaser?: string | null;
  first_page_title?: string | null;
  preview_images?: Array<{ page: number; width: number; height: number; data: string }>;
}

const LIST_LIMIT = 500;
const CACHE_PREFIX = "fp_research_list_v2:";

// Cached lists belong to whoever was signed in: drop them when that changes.
let cachedFor: string | null | undefined;
supabase.auth.onAuthStateChange((_event, session) => {
  const uid = session?.user?.id ?? null;
  if (cachedFor !== undefined && cachedFor !== uid) {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith("fp_research_list_")).forEach((k) => localStorage.removeItem(k));
    } catch { /* storage blocked */ }
  }
  cachedFor = uid;
});

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function readCache(asset: ResearchAsset): { at: number; reports: PromotedReport[] } | undefined {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + asset);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function writeCache(asset: ResearchAsset, reports: PromotedReport[]) {
  try {
    // Lists only: keep the cache small by dropping any page bodies.
    const slim = reports.map((r) => ({ ...r, pages: [], html_content: "" }));
    localStorage.setItem(CACHE_PREFIX + asset, JSON.stringify({ at: Date.now(), reports: slim }));
  } catch { /* storage full or blocked */ }
}

export async function fetchResearchList(asset: ResearchAsset): Promise<PromotedReport[]> {
  const { data, error } = await supabase.functions.invoke("public-research-previews", {
    body: { asset_types: [asset], limit: LIST_LIMIT },
    headers: await authHeaders(),
  });
  if (error) throw error;
  const viewer = await resolveViewer(data?.viewer);
  const reports = applyPaywall(((data?.reports ?? []) as PromotedReport[]).filter((r) => r.asset_type === asset), viewer);
  writeCache(asset, reports);
  return reports;
}

export const listKey = (asset: ResearchAsset) => ["research-feed", asset] as const;
export const reportKey = (id: string) => ["research-report", id] as const;

export function useResearchList(asset: ResearchAsset) {
  const cached = readCache(asset);
  return useQuery({
    queryKey: listKey(asset),
    queryFn: () => fetchResearchList(asset),
    initialData: cached?.reports,
    initialDataUpdatedAt: cached?.at,
    staleTime: 2 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export async function fetchFullReport(id: string): Promise<Partial<PromotedReport> | null> {
  const { data, error } = await supabase.functions.invoke("public-research-previews", {
    body: { report_id: id },
    headers: await authHeaders(),
  });
  if (error) throw error;
  return (data?.report ?? null) as Partial<PromotedReport> | null;
}

export function prefetchReport(qc: QueryClient, id: string) {
  return qc.prefetchQuery({ queryKey: reportKey(id), queryFn: () => fetchFullReport(id), staleTime: 10 * 60_000 });
}

export function useFullReport(id: string | null) {
  return useQuery({
    queryKey: reportKey(id ?? "none"),
    queryFn: () => fetchFullReport(id!),
    enabled: !!id,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });
}

/** Warms the other research tab so switching is instant. */
export function usePrefetchOtherDesk(asset: ResearchAsset) {
  const qc = useQueryClient();
  return () => {
    const other: ResearchAsset = asset === "stock" ? "crypto" : "stock";
    void qc.prefetchQuery({ queryKey: listKey(other), queryFn: () => fetchResearchList(other), staleTime: 2 * 60_000 });
  };
}

// ── Per-user conveniences (this browser only) ───────────────────────────────
const BOOKMARK_KEY = "flowpulse_research_bookmarks";
const READ_KEY = "flowpulse_research_read";

function readIds(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function writeIds(key: string, ids: string[]) {
  try { localStorage.setItem(key, JSON.stringify(ids.slice(-1000))); } catch { /* ignore */ }
}

export const loadBookmarks = () => readIds(BOOKMARK_KEY);
export const saveBookmarks = (ids: string[]) => writeIds(BOOKMARK_KEY, ids);
export const loadReadIds = () => readIds(READ_KEY);
export function markRead(id: string) {
  const ids = readIds(READ_KEY);
  if (!ids.includes(id)) writeIds(READ_KEY, [...ids, id]);
}

export const reportDate = (r: Pick<PromotedReport, "report_date" | "promoted_at" | "created_at">) =>
  new Date(r.promoted_at ?? r.report_date ?? r.created_at);

export const isNew = (r: PromotedReport) => Date.now() - reportDate(r).getTime() < 3 * 86_400_000;

export type ConvictionBand = "high" | "medium" | "low" | "unrated";
export function convictionBand(score: number | null): ConvictionBand {
  if (typeof score !== "number") return "unrated";
  if (score >= 4) return "high";
  if (score >= 3) return "medium";
  return "low";
}
