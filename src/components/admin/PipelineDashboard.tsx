import { useEffect, useMemo, useState, useCallback, useRef, useTransition } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Activity, CheckCircle2, XCircle, RefreshCw, Clock, Database,
  AlertTriangle, Sparkles, Loader2, Eye, TrendingUp, Search, Zap,
  Radio, Filter, ExternalLink, Layers, Cpu, GaugeCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrapeItemView } from "./ScrapeItemView";

type TargetTable = "investor_finder_opportunities" | "opportunity_products" | "opportunities" | "intel_events";
type TargetPlatform = "finance" | "investor" | "both";

const TARGET_OPTIONS: { value: TargetTable; label: string; sidebar: string; platforms: TargetPlatform[] }[] = [
  { value: "investor_finder_opportunities", label: "Investor Finder", sidebar: "Investor Finder tab", platforms: ["finance", "investor", "both"] },
  { value: "opportunity_products",          label: "Opportunity Intelligence", sidebar: "Opportunity Intelligence tab", platforms: ["finance", "investor", "both"] },
  { value: "opportunities",                 label: "Business Opportunities", sidebar: "Opportunities (Business) tab", platforms: ["finance", "investor", "both"] },
  { value: "intel_events",                  label: "Intelligence Events", sidebar: "Company Intelligence tab", platforms: ["both"] },
];

const defaultTargetFor = (p: Pending): TargetTable => {
  if (p.source === "opportunity-research") return "investor_finder_opportunities";
  const t = (p.target_table as TargetTable) ?? "opportunity_products";
  return (TARGET_OPTIONS.find(o => o.value === t)?.value) ?? "opportunity_products";
};
const defaultPlatformFor = (p: Pending): TargetPlatform => {
  if (p.target_platform === "finance" || p.target_platform === "investor") return p.target_platform;
  return "both";
};

interface Schedule {
  source: string; enabled: boolean; cadence_minutes: number; next_run_at: string;
  last_run_at: string | null; last_status: string | null;
  consecutive_failures: number; last_error: string | null;
}
interface Run {
  id: string; source: string; status: string; started_at: string; finished_at: string | null;
  records_fetched: number; records_staged: number; records_new: number; errors: any;
}
interface Pending {
  id: string; source: string; target_table: string; target_platform: string | null;
  title: string; summary: string | null; category: string | null; source_url: string | null;
  ai_score: number | null; ai_tags: string[] | null; status: string; created_at: string;
  raw_payload: any; enriched_payload: any;
}

const STATUS_STYLES: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-500/40 shadow-[0_0_12px_-4px_rgba(16,185,129,0.5)]",
  partial: "bg-amber-50 text-amber-700 border-amber-500/40 shadow-[0_0_12px_-4px_rgba(245,158,11,0.5)]",
  failed:  "bg-rose-50 text-rose-700 border-rose-500/40 shadow-[0_0_12px_-4px_rgba(244,63,94,0.5)]",
  running: "bg-sky-50 text-sky-300 border-sky-500/40 shadow-[0_0_12px_-4px_rgba(56,189,248,0.5)]",
};

// Reusable KPI tile w/ glow accent
const KpiTile = ({
  label, value, accent, icon: Icon, sub,
}: { label: string; value: React.ReactNode; accent: string; icon: any; sub?: string }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 backdrop-blur-xl p-4 hover:border-slate-200 transition-all">
    <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity ${accent}`} />
    <div className="relative flex items-center justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <Icon className="h-3.5 w-3.5 text-slate-500" />
    </div>
    <div className="relative mt-2 text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
    {sub && <div className="relative mt-0.5 text-[11px] text-slate-500">{sub}</div>}
  </div>
);

export const PipelineDashboard = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySource, setBusySource] = useState<string | null>(null);
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [reviewItem, setReviewItem] = useState<Pending | null>(null);
  const [query, setQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<"all" | "finance" | "investor" | "both">("all");
  const [autoScrapeEnabled, setAutoScrapeEnabled] = useState<boolean>(false);
  const [savingMaster, setSavingMaster] = useState(false);
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();

  const load = useCallback(async () => {
    const [{ data: s }, { data: r }, { data: p }] = await Promise.all([
      supabase.from("pipeline_schedule" as any).select("*").order("source"),
      supabase.from("pipeline_runs" as any).select("*").order("started_at", { ascending: false }).limit(20),
      supabase.from("pipeline_pending_items" as any).select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(80),
    ]);
    startTransition(() => {
      setSchedules((s as any) ?? []);
      setRuns((r as any) ?? []);
      setPending((p as any) ?? []);
      setLoading(false);
    });
  }, []);

  // Tighter debounce for snappier realtime
  const scheduleReload = useCallback(() => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current);
    reloadTimer.current = setTimeout(() => { void load(); }, 120);
  }, [load]);

  useEffect(() => {
    void load();
    // Load master kill switch
    void supabase.from("platform_config" as any).select("value").eq("key", "auto_scraper_enabled").maybeSingle()
      .then(({ data }) => setAutoScrapeEnabled(((data as any)?.value?.enabled) === true));
    const ch = supabase
      .channel("pipeline-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_pending_items" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_runs" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_schedule" }, scheduleReload)
      .subscribe();
    return () => { supabase.removeChannel(ch); if (reloadTimer.current) clearTimeout(reloadTimer.current); };
  }, [load, scheduleReload]);

  const setMasterAutoScrape = async (enabled: boolean) => {
    setSavingMaster(true);
    setAutoScrapeEnabled(enabled);
    const { error } = await supabase.from("platform_config" as any).upsert({
      key: "auto_scraper_enabled",
      value: { enabled } as any,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });
    setSavingMaster(false);
    if (error) {
      setAutoScrapeEnabled(!enabled);
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: enabled ? "Auto-scraper ON" : "Auto-scraper OFF", description: enabled ? "Scheduled scrapes will run." : "All scheduled scrapes are paused." });
    }
  };

  const triggerRun = async (source?: string) => {
    setBusySource(source ?? "all");
    try {
      const { data, error } = await supabase.functions.invoke("run-data-pipeline", {
        body: source ? { source, triggered_by: "manual" } : { triggered_by: "manual" },
      });
      if (error) throw error;
      toast({ title: source ? `Triggered ${source}` : "Triggered all due sources", description: `Processed ${data?.ran ?? 0} source(s)` });
      void load();
    } catch (e: any) {
      toast({ title: "Pipeline error", description: e.message ?? String(e), variant: "destructive" });
    } finally { setBusySource(null); }
  };

  const toggleEnabled = async (source: string, enabled: boolean) => {
    setSchedules(prev => prev.map(s => s.source === source ? { ...s, enabled } : s));
    const { error } = await supabase.from("pipeline_schedule" as any).update({ enabled }).eq("source", source);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); void load(); }
  };

  const [routing, setRouting] = useState<Record<string, { target: TargetTable; platform: TargetPlatform }>>({});
  const getRouting = (p: Pending) => routing[p.id] ?? { target: defaultTargetFor(p), platform: defaultPlatformFor(p) };
  const setItemRouting = (id: string, patch: Partial<{ target: TargetTable; platform: TargetPlatform }>) =>
    setRouting(r => ({ ...r, [id]: { ...(r[id] ?? { target: "opportunity_products" as TargetTable, platform: "both" as TargetPlatform }), ...patch } }));

  const approveItem = async (id: string, override?: { target?: TargetTable; platform?: TargetPlatform }) => {
    setBusyItem(id);
    const prev = pending;
    const item = pending.find(x => x.id === id);
    const r = item ? getRouting(item) : { target: "opportunity_products" as TargetTable, platform: "both" as TargetPlatform };
    const target = override?.target ?? r.target;
    const platform = override?.platform ?? r.platform;
    setPending(p => p.filter(x => x.id !== id));
    try {
      const { data, error } = await supabase.rpc("approve_pending_item" as any, {
        _item_id: id,
        _target_table: target,
        _platform: platform,
      } as any);
      if (error) throw error;
      const res = data as any;
      if (res?.ok) toast({ title: "Promoted", description: `Routed to ${TARGET_OPTIONS.find(o=>o.value===target)?.label} (${platform}).` });
      else { setPending(prev); toast({ title: "Could not promote", description: res?.error ?? "Unknown", variant: "destructive" }); }
    } catch (e: any) {
      setPending(prev);
      toast({ title: "Approval failed", description: e.message, variant: "destructive" });
    } finally { setBusyItem(null); }
  };

  const rejectItem = async (id: string) => {
    setBusyItem(id);
    const prev = pending;
    setPending(p => p.filter(x => x.id !== id));
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("pipeline_pending_items" as any).update({
      status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user?.id,
    }).eq("id", id);
    if (error) { setPending(prev); toast({ title: "Reject failed", description: error.message, variant: "destructive" }); }
    setBusyItem(null);
  };

  const statusBadge = (s: string | null) => {
    if (!s) return <Badge variant="outline" className="text-[10px]">—</Badge>;
    const cls = STATUS_STYLES[s];
    return <Badge className={`${cls ?? "bg-slate-100 text-slate-600 border-slate-600"} text-[10px] capitalize`}>{s}</Badge>;
  };

  const filteredPending = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pending.filter(p => {
      if (filterPlatform !== "all" && p.target_platform !== filterPlatform) return false;
      if (!q) return true;
      return (
        p.title?.toLowerCase().includes(q) ||
        p.summary?.toLowerCase().includes(q) ||
        p.source?.toLowerCase().includes(q) ||
        (p.ai_tags ?? []).some(t => t.toLowerCase().includes(q))
      );
    });
  }, [pending, query, filterPlatform]);

  const kpis = useMemo(() => ({
    pending: pending.length,
    active: schedules.filter(s => s.enabled).length,
    total: schedules.length,
    runs: runs.length,
    failures: schedules.reduce((a, s) => a + (s.consecutive_failures || 0), 0),
    successRate: runs.length ? Math.round((runs.filter(r => r.status === "success").length / runs.length) * 100) : 0,
    avgScore: pending.length ? (pending.reduce((a, p) => a + (Number(p.ai_score) || 0), 0) / pending.length).toFixed(1) : "—",
  }), [pending, schedules, runs]);

  if (loading) return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center rounded-[28px] border border-slate-200 bg-white p-12 text-slate-500 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.28)]">
      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading pipeline…
    </div>
  );

  return (
    <section className="min-h-[calc(100vh-3rem)] space-y-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.28)]">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.35)]">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <div className="absolute -top-32 right-0 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] text-cyan-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
              </span>
              Live · realtime sync · 120ms coalescing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-cyan-700 to-violet-700 bg-clip-text text-transparent">
              Automated Data Pipeline
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl">
              Scrape · enrich · stage · promote. Sources rotate continuously and feed both Finance and Investor opportunity intelligence.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-2 ${autoScrapeEnabled ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Auto-Scraper Master</span>
                <span className={`text-xs font-semibold ${autoScrapeEnabled ? "text-emerald-700" : "text-slate-600"}`}>
                  {autoScrapeEnabled ? "ON · Scheduled scrapes active" : "OFF · All schedules paused"}
                </span>
              </div>
              <Switch checked={autoScrapeEnabled} onCheckedChange={setMasterAutoScrape} disabled={savingMaster} />
            </div>
            <Button
              onClick={() => triggerRun()}
              disabled={busySource === "all"}
              className="relative overflow-hidden bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 hover:opacity-95 border-0 shadow-[0_8px_32px_-8px_rgba(56,189,248,0.6)]"
            >
              {busySource === "all" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              Run all due now
            </Button>
          </div>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-5 gap-3 mt-7">
          <KpiTile label="Pending review" value={kpis.pending} accent="bg-amber-500/40" icon={Sparkles} sub={kpis.avgScore !== "—" ? `avg AI ${kpis.avgScore}/5` : undefined} />
          <KpiTile label="Active sources" value={`${kpis.active}/${kpis.total}`} accent="bg-emerald-500/40" icon={Activity} />
          <KpiTile label="Recent runs" value={kpis.runs} accent="bg-sky-500/40" icon={Database} />
          <KpiTile label="Success rate" value={`${kpis.successRate}%`} accent="bg-cyan-500/40" icon={GaugeCircle} />
          <KpiTile label="Failures" value={kpis.failures} accent={kpis.failures ? "bg-rose-500/40" : "bg-slate-500/30"} icon={AlertTriangle} />
        </div>
      </div>

      {/* Schedule */}
      <Card className="p-5 bg-white border-slate-200 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2 text-slate-900">
            <Layers className="h-4 w-4 text-cyan-400" /> Source Schedule
            <Badge className="ml-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px]">{schedules.length}</Badge>
          </h3>
          <span className="text-[11px] text-slate-500 inline-flex items-center gap-1.5">
            <Cpu className="h-3 w-3" /> auto-rotating workers
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {schedules.map(s => {
            const failing = s.consecutive_failures > 0;
            return (
              <div
                key={s.source}
                className={`group relative overflow-hidden rounded-2xl border p-4 transition-all bg-gradient-to-br from-white to-slate-50 ${failing ? "border-rose-500/30 hover:border-rose-500/60" : "border-slate-200 hover:border-cyan-400/40"} hover:shadow-[0_10px_40px_-15px_rgba(56,189,248,0.4)]`}
              >
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${failing ? "from-transparent via-rose-400/60 to-transparent" : "from-transparent via-cyan-400/50 to-transparent"} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 truncate">{s.source}</span>
                      {statusBadge(s.last_status)}
                      {failing && (
                        <Badge variant="destructive" className="text-[10px]">
                          <AlertTriangle className="h-3 w-3 mr-1" />{s.consecutive_failures}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
                      <div><span className="text-slate-500">Next</span> <span className="text-slate-700">{formatDistanceToNow(new Date(s.next_run_at), { addSuffix: true })}</span></div>
                      <div><span className="text-slate-500">Last</span> <span className="text-slate-700">{s.last_run_at ? formatDistanceToNow(new Date(s.last_run_at), { addSuffix: true }) : "never"}</span></div>
                      <div className="col-span-2"><span className="text-slate-500">Cadence</span> <span className="text-slate-700">{s.cadence_minutes}m</span></div>
                    </div>
                    {s.last_error && <div className="text-[11px] text-rose-400 mt-2 line-clamp-2">{s.last_error}</div>}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Switch checked={s.enabled} onCheckedChange={(v) => toggleEnabled(s.source, v)} />
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-slate-200 bg-white hover:border-cyan-400/50 hover:text-cyan-600" onClick={() => triggerRun(s.source)} disabled={busySource === s.source}>
                      {busySource === s.source ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pending review */}
      <Card className="p-5 bg-white border-slate-200 backdrop-blur-xl">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="font-semibold flex items-center gap-2 text-slate-900">
            <Sparkles className="h-4 w-4 text-amber-400" /> Pending Review
            <Badge className="bg-amber-50 text-amber-700 border-amber-500/40 ml-1 text-[10px]">{filteredPending.length}</Badge>
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, source, tag…"
                className="h-8 pl-8 w-60 bg-white border-slate-200 text-sm focus-visible:ring-cyan-500/40 focus-visible:border-cyan-400/40"
              />
            </div>
            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5">
              {(["all","finance","investor","both"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPlatform(p)}
                  className={`px-2.5 py-1 text-[11px] rounded-md capitalize transition-all ${filterPlatform === p ? "bg-gradient-to-r from-cyan-500/30 to-violet-500/30 text-cyan-700 shadow-inner" : "text-slate-500 hover:text-slate-700"}`}
                >{p}</button>
              ))}
            </div>
          </div>
        </div>

        {filteredPending.length === 0 ? (
          <div className="text-sm text-slate-500 py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <Filter className="h-8 w-8 mx-auto mb-2 text-slate-700" />
            No items awaiting review.
          </div>
        ) : (
          <ScrollArea className="h-[520px] pr-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredPending.map(p => {
                const score = Number(p.ai_score) || 0;
                const scoreTone = score >= 4 ? "from-emerald-500/30 to-emerald-400/10 text-emerald-700 border-emerald-400/40"
                  : score >= 3 ? "from-amber-500/30 to-amber-400/10 text-amber-700 border-amber-400/40"
                  : "from-slate-100 to-slate-50 text-slate-600 border-slate-200";
                return (
                  <div key={p.id} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-cyan-400/40 hover:shadow-[0_12px_50px_-15px_rgba(56,189,248,0.45)] transition-all p-4">
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-cyan-500/5 blur-2xl group-hover:bg-cyan-50 transition-colors" />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <button onClick={() => setReviewItem(p)} className="font-semibold text-left text-slate-900 hover:text-cyan-700 transition line-clamp-2">
                          {p.title}
                        </button>
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          {p.ai_score != null && (
                            <Badge className={`text-[10px] bg-gradient-to-r ${scoreTone} border`}>★ {score.toFixed(1)}</Badge>
                          )}
                          <Badge className="text-[10px] bg-violet-50 text-violet-700 border-violet-400/30">{p.source}</Badge>
                          <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-600">→ {p.target_table}</Badge>
                          {p.target_platform && <Badge variant="outline" className="text-[10px] border-cyan-400/30 text-cyan-700 bg-cyan-500/5">{p.target_platform}</Badge>}
                        </div>
                        {p.summary && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{p.summary}</p>}
                        {(p.ai_tags ?? []).length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mt-2">
                            {(p.ai_tags ?? []).slice(0, 4).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500">#{t}</span>)}
                          </div>
                        )}
                        {p.source_url && (
                          <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-sky-400 hover:underline mt-2 inline-flex items-center gap-1 truncate max-w-full">
                            <ExternalLink className="h-3 w-3" /> {p.source_url}
                          </a>
                        )}
                        {(() => { const r = getRouting(p); const tgt = TARGET_OPTIONS.find(o=>o.value===r.target)!; return (
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70">
                            <div>
                              <label className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">Destination tab</label>
                              <Select value={r.target} onValueChange={(v) => setItemRouting(p.id, { target: v as TargetTable, platform: TARGET_OPTIONS.find(o=>o.value===v)?.platforms.includes(r.platform) ? r.platform : "both" })}>
                                <SelectTrigger className="h-8 text-xs mt-1 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {TARGET_OPTIONS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <div className="text-[10px] text-slate-500 mt-1">→ {tgt.sidebar}</div>
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">Platform</label>
                              <Select value={r.platform} onValueChange={(v) => setItemRouting(p.id, { platform: v as TargetPlatform })}>
                                <SelectTrigger className="h-8 text-xs mt-1 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {tgt.platforms.map(pl => <SelectItem key={pl} value={pl} className="text-xs capitalize">{pl === "both" ? "Both platforms" : pl}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ); })()}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button size="icon" variant="secondary" className="h-7 w-7 bg-slate-100 hover:bg-slate-200 border border-slate-200" onClick={() => setReviewItem(p)} title="Review full data">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" onClick={() => approveItem(p.id)} disabled={busyItem === p.id} className="h-7 w-7 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-[0_4px_12px_-2px_rgba(16,185,129,0.5)]" title="Approve & promote to selected tab/platform">
                          {busyItem === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="icon" variant="outline" className="h-7 w-7 border-slate-200 bg-white hover:border-rose-500/50 hover:text-rose-700" onClick={() => rejectItem(p.id)} disabled={busyItem === p.id} title="Reject">
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </Card>

      {/* Run history */}
      <Card className="p-5 bg-white border-slate-200 backdrop-blur-xl">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-slate-900">
          <Database className="h-4 w-4 text-sky-400" /> Recent Runs
          <Badge className="ml-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px]">{runs.length}</Badge>
        </h3>
        <div className="space-y-1">
          {runs.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-3 text-sm py-2.5 px-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 border border-transparent hover:border-slate-200 transition-all">
              <div className="flex items-center gap-2 min-w-0">
                {statusBadge(r.status)}
                <span className="font-medium text-slate-700 truncate">{r.source}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0 tabular-nums">
                <span><span className="text-slate-700 font-semibold">{r.records_fetched ?? 0}</span> fetched</span>
                <span><span className="text-emerald-700 font-semibold">{r.records_new ?? 0}</span> new</span>
                <span><span className="text-cyan-600 font-semibold">{r.records_staged ?? 0}</span> staged</span>
                <span className="text-slate-500">{formatDistanceToNow(new Date(r.started_at), { addSuffix: true })}</span>
              </div>
            </div>
          ))}
          {runs.length === 0 && <div className="text-sm text-slate-500 py-6 text-center">No runs yet.</div>}
        </div>
      </Card>

      {/* Review dialog */}
      <Dialog open={!!reviewItem} onOpenChange={(o) => !o && setReviewItem(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap text-slate-900">
              <Sparkles className="h-4 w-4 text-amber-400" />
              {reviewItem?.title}
              {reviewItem?.ai_score != null && (
                <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-500/40">★ {Number(reviewItem.ai_score).toFixed(1)}/5</Badge>
              )}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 flex-wrap text-xs">
              <Badge className="bg-violet-50 text-violet-700 border-violet-400/30">{reviewItem?.source}</Badge>
              <Badge variant="outline" className="border-slate-200">→ {reviewItem?.target_table}</Badge>
              {reviewItem?.target_platform && <Badge variant="outline" className="border-cyan-400/30 text-cyan-700">{reviewItem.target_platform}</Badge>}
              {reviewItem?.source_url && (
                <a href={reviewItem.source_url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline truncate inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />{reviewItem.source_url}
                </a>
              )}
            </DialogDescription>
          </DialogHeader>

          {reviewItem && (
            <div className="space-y-4">
              {reviewItem.summary && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700">
                  {reviewItem.summary}
                </div>
              )}
              <ScrapeItemView
                payload={reviewItem.enriched_payload ?? reviewItem.raw_payload}
                source={reviewItem.source}
                filenameStem={`pipeline-${reviewItem.source}-${reviewItem.id.slice(0, 8)}`}
              />
            </div>
          )}

          <DialogFooter className="gap-2 flex-wrap sm:flex-nowrap items-stretch sm:items-center">
            {reviewItem && (() => { const r = getRouting(reviewItem); const tgt = TARGET_OPTIONS.find(o=>o.value===r.target)!; return (
              <div className="flex-1 grid grid-cols-2 gap-2 mr-auto">
                <Select value={r.target} onValueChange={(v) => setItemRouting(reviewItem.id, { target: v as TargetTable, platform: TARGET_OPTIONS.find(o=>o.value===v)?.platforms.includes(r.platform) ? r.platform : "both" })}>
                  <SelectTrigger className="h-9 text-xs bg-white border-slate-200"><SelectValue placeholder="Destination tab" /></SelectTrigger>
                  <SelectContent>{TARGET_OPTIONS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label} — {o.sidebar}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={r.platform} onValueChange={(v) => setItemRouting(reviewItem.id, { platform: v as TargetPlatform })}>
                  <SelectTrigger className="h-9 text-xs bg-white border-slate-200"><SelectValue placeholder="Platform" /></SelectTrigger>
                  <SelectContent>{tgt.platforms.map(pl => <SelectItem key={pl} value={pl} className="text-xs capitalize">{pl === "both" ? "Both platforms" : pl}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ); })()}
            <Button variant="outline" className="border-slate-200" onClick={() => reviewItem && rejectItem(reviewItem.id)} disabled={!reviewItem || busyItem === reviewItem?.id}>
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-95 shadow-[0_6px_20px_-6px_rgba(16,185,129,0.6)]"
              onClick={async () => { if (reviewItem) { await approveItem(reviewItem.id); setReviewItem(null); } }}
              disabled={!reviewItem || busyItem === reviewItem?.id}
            >
              {busyItem === reviewItem?.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
              Approve & promote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PipelineDashboard;
