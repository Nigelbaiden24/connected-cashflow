// Market Pulse: investor sidebar (news, trending, reads) and movers ticker.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PulseKind = "news" | "trending" | "article" | "mover";
export type Timeframe = "1h" | "1d" | "1w" | "1m" | "ytd" | "1y";

export interface PulseItem {
  id: string;
  kind: PulseKind;
  title: string;
  summary: string | null;
  why: string | null;
  url: string | null;
  source: string | null;
  image_url: string | null;
  symbol: string | null;
  asset_type: "stock" | "crypto" | "index" | null;
  price: number | null;
  currency: string | null;
  changes: Partial<Record<Timeframe, number | null>> | null;
  tags: string[] | null;
  rank: number;
  published_at: string | null;
  hidden: boolean;
  pinned: boolean;
  created_at: string;
}

export interface PulseConfig {
  mode: "auto" | "manual";
  interval_minutes: number;
  sidebar_enabled: boolean;
  ticker_enabled: boolean;
  last_run_at?: string | null;
  last_status?: string | null;
  last_error?: string | null;
  last_counts?: Record<string, number> | null;
  last_trigger?: string | null;
}

export const DEFAULT_PULSE_CONFIG: PulseConfig = { mode: "manual", interval_minutes: 120, sidebar_enabled: true, ticker_enabled: true };

const db = supabase as any; // market_pulse_items is not in the generated types yet

export async function loadPulseItems(includeHidden = false): Promise<PulseItem[]> {
  let q = db.from("market_pulse_items").select("*").order("pinned", { ascending: false }).order("rank").limit(400);
  if (!includeHidden) q = q.eq("hidden", false);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as PulseItem[];
}

export async function loadPulseConfig(): Promise<PulseConfig> {
  const { data } = await supabase.from("platform_config").select("value").eq("key", "market_pulse").maybeSingle();
  return { ...DEFAULT_PULSE_CONFIG, ...((data?.value as any) ?? {}) };
}

export function useMarketPulse() {
  return useQuery({ queryKey: ["market-pulse"], queryFn: () => loadPulseItems(), staleTime: 4 * 60_000, refetchInterval: 5 * 60_000, refetchOnWindowFocus: false, retry: 1 });
}

export function usePulseConfig() {
  return useQuery({ queryKey: ["market-pulse-config"], queryFn: loadPulseConfig, staleTime: 5 * 60_000, refetchOnWindowFocus: false });
}

export const TIMEFRAMES: Array<{ key: Timeframe; label: string }> = [
  { key: "1d", label: "1D" }, { key: "1w", label: "1W" }, { key: "1m", label: "1M" }, { key: "ytd", label: "YTD" }, { key: "1y", label: "1Y" },
];

export const changeOf = (m: PulseItem, tf: Timeframe) => {
  const v = m.changes?.[tf];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
};

export const fmtPct = (v: number | null) => (v == null ? "–" : `${v > 0 ? "+" : ""}${v.toFixed(Math.abs(v) >= 100 ? 0 : 2)}%`);

export const fmtPrice = (n: number | null, ccy = "USD") =>
  n == null ? "" : new Intl.NumberFormat("en-GB", { style: "currency", currency: ccy || "USD", maximumFractionDigits: n >= 1000 ? 0 : n >= 1 ? 2 : 6 }).format(n);

export function timeAgo(iso: string | null) {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}
