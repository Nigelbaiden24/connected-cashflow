import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Activity, CheckCircle2, XCircle, RefreshCw, Play, Clock, Database,
  AlertTriangle, Sparkles, Loader2, Eye, TrendingUp, Search, Zap,
  Radio, Filter, ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrapeItemView } from "./ScrapeItemView";

interface Schedule {
  source: string;
  enabled: boolean;
  cadence_minutes: number;
  next_run_at: string;
  last_run_at: string | null;
  last_status: string | null;
  consecutive_failures: number;
  last_error: string | null;
}
interface Run {
  id: string; source: string; status: string;
  started_at: string; finished_at: string | null;
  records_fetched: number; records_staged: number; records_new: number;
  errors: any;
}
interface Pending {
  id: string; source: string; target_table: string; target_platform: string | null;
  title: string; summary: string | null; category: string | null; source_url: string | null;
  ai_score: number | null; ai_tags: string[] | null; status: string; created_at: string;
  raw_payload: any; enriched_payload: any;
}

const STATUS_STYLES: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  partial: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  failed:  "bg-rose-500/15 text-rose-300 border-rose-500/30",
  running: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

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
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced realtime reload to coalesce bursts (faster perceived UX, fewer queries)
  const scheduleReload = useCallback(() => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current);
    reloadTimer.current = setTimeout(() => { void load(); }, 250);
  }, []);

  const load = useCallback(async () => {
    const [{ data: s }, { data: r }, { data: p }] = await Promise.all([
      supabase.from("pipeline_schedule" as any).select("*").order("source"),
      supabase.from("pipeline_runs" as any).select("*").order("started_at", { ascending: false }).limit(20),
      supabase.from("pipeline_pending_items" as any).select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(80),
    ]);
    setSchedules((s as any) ?? []);
    setRuns((r as any) ?? []);
    setPending((p as any) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const ch = supabase
      .channel("pipeline-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_pending_items" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_runs" }, scheduleReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_schedule" }, scheduleReload)
      .subscribe();
    return () => { supabase.removeChannel(ch); if (reloadTimer.current) clearTimeout(reloadTimer.current); };
  }, [load, scheduleReload]);

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
    } finally {
      setBusySource(null);
    }
  };

  const toggleEnabled = async (source: string, enabled: boolean) => {
    // Optimistic UI for instant feedback
    setSchedules(prev => prev.map(s => s.source === source ? { ...s, enabled } : s));
    const { error } = await supabase.from("pipeline_schedule" as any).update({ enabled }).eq("source", source);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      void load();
    }
  };

  const approveItem = async (id: string) => {
    setBusyItem(id);
    // Optimistic remove from list
    const prev = pending;
    setPending(p => p.filter(x => x.id !== id));
    try {
      const { data, error } = await supabase.rpc("approve_pending_item" as any, { _item_id: id });
      if (error) throw error;
      const res = data as any;
      if (res?.ok) toast({ title: "Promoted to live dashboard", description: "Item now visible to users." });
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
    return <Badge className={cls ?? "bg-slate-700/30 text-slate-300 border-slate-600"}>{s}</Badge>;
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
    successRate: runs.length
      ? Math.round((runs.filter(r => r.status === "success").length / runs.length) * 100)
      : 0,
    avgScore: pending.length
      ? (pending.reduce((a, p) => a + (Number(p.ai_score) || 0), 0) / pending.length).toFixed(1)
      : "—",
  }), [pending, schedules, runs]);

  if (loading) return (
    <div className="flex items-center justify-center p-12 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading pipeline…
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-fuchsia-950/40 p-6 md:p-8">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-fuchsia-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
              <Radio className="h-3 w-3 animate-pulse" /> Live · realtime sync
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-fuchsia-100 to-purple-200 bg-clip-text text-transparent">
              Automated Data Pipeline
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Scrape · AI enrich · stage for review · promote to live dashboards. Sources rotate every 30 min and feed both Finance and Investor opportunity intelligence.
            </p>
          </div>
          <Button
            onClick={() => triggerRun()}
            disabled={busySource === "all"}
            className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-fuchsia-900/30 border-0"
          >
            {busySource === "all" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Run all due now
          </Button>
        </div>

        {/* KPI strip */}
        <div className="relative grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          {[
            { label: "Pending review", value: kpis.pending, color: "text-amber-300", icon: Sparkles },
            { label: "Active sources", value: `${kpis.active}/${kpis.total}`, color: "text-emerald-300", icon: Activity },
            { label: "Recent runs", value: kpis.runs, color: "text-sky-300", icon: Database },
            { label: "Success rate", value: `${kpis.successRate}%`, color: "text-fuchsia-300", icon: TrendingUp },
            { label: "Failures", value: kpis.failures, color: kpis.failures ? "text-rose-300" : "text-slate-400", icon: AlertTriangle },
          ].map(k => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="relative rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-xl p-4 hover:border-fuchsia-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">{k.label}</span>
                  <Icon className={`h-3.5 w-3.5 ${k.color}`} />
                </div>
                <div className={`text-2xl font-bold mt-1.5 ${k.color}`}>{k.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule grid */}
      <Card className="p-5 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2 text-slate-200">
            <Clock className="h-4 w-4 text-fuchsia-400" /> Source Schedule
          </h3>
          <span className="text-xs text-slate-500">{schedules.length} sources</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {schedules.map(s => (
            <div
              key={s.source}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-950/80 to-slate-900/60 border border-slate-800/70 hover:border-fuchsia-500/30 transition-all p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-100 truncate">{s.source}</span>
                    {statusBadge(s.last_status)}
                    {s.consecutive_failures > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        <AlertTriangle className="h-3 w-3 mr-1" />{s.consecutive_failures}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 space-y-0.5">
                    <div>Next run · <span className="text-slate-300">{formatDistanceToNow(new Date(s.next_run_at), { addSuffix: true })}</span></div>
                    <div>Last run · <span className="text-slate-300">{s.last_run_at ? formatDistanceToNow(new Date(s.last_run_at), { addSuffix: true }) : "never"}</span></div>
                  </div>
                  {s.last_error && <div className="text-xs text-rose-400 mt-2 line-clamp-2">{s.last_error}</div>}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Switch checked={s.enabled} onCheckedChange={(v) => toggleEnabled(s.source, v)} />
                  <Button size="sm" variant="outline" className="h-8 border-slate-700 hover:border-fuchsia-500/50" onClick={() => triggerRun(s.source)} disabled={busySource === s.source}>
                    {busySource === s.source ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pending review */}
      <Card className="p-5 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="font-semibold flex items-center gap-2 text-slate-200">
            <Sparkles className="h-4 w-4 text-amber-400" /> Pending Review
            <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 ml-1">{filteredPending.length}</Badge>
            {kpis.avgScore !== "—" && (
              <span className="text-[11px] text-slate-500 ml-2">avg AI score · {kpis.avgScore}/5</span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, source, tag…"
                className="h-8 pl-8 w-56 bg-slate-950/60 border-slate-800 text-sm"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 p-0.5">
              {(["all","finance","investor","both"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPlatform(p)}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${filterPlatform === p ? "bg-fuchsia-500/20 text-fuchsia-200" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredPending.length === 0 ? (
          <div className="text-sm text-slate-500 py-12 text-center border border-dashed border-slate-800 rounded-xl">
            <Filter className="h-8 w-8 mx-auto mb-2 text-slate-700" />
            No items awaiting review.
          </div>
        ) : (
          <ScrollArea className="h-[480px] pr-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredPending.map(p => (
                <div key={p.id} className="group relative rounded-xl bg-gradient-to-br from-slate-950/80 to-slate-900/40 border border-slate-800/70 hover:border-fuchsia-500/40 hover:shadow-lg hover:shadow-fuchsia-900/10 transition-all p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <button onClick={() => setReviewItem(p)} className="font-semibold text-left text-slate-100 hover:text-fuchsia-300 transition line-clamp-2">
                        {p.title}
                      </button>
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {p.ai_score != null && (
                          <Badge className="text-[10px] bg-amber-500/15 text-amber-300 border-amber-500/30">★ {Number(p.ai_score).toFixed(1)}</Badge>
                        )}
                        <Badge className="text-[10px] bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30">{p.source}</Badge>
                        <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">→ {p.target_table}</Badge>
                        {p.target_platform && <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">{p.target_platform}</Badge>}
                      </div>
                      {p.summary && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{p.summary}</p>}
                      {(p.ai_tags ?? []).length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mt-2">
                          {(p.ai_tags ?? []).slice(0, 4).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/70 text-slate-400">#{t}</span>)}
                        </div>
                      )}
                      {p.source_url && (
                        <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-sky-400 hover:underline mt-2 inline-flex items-center gap-1 truncate max-w-full">
                          <ExternalLink className="h-3 w-3" /> {p.source_url}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => setReviewItem(p)} title="Review full data">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" onClick={() => approveItem(p.id)} disabled={busyItem === p.id} className="h-7 w-7 bg-emerald-600 hover:bg-emerald-500" title="Approve & promote">
                        {busyItem === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="icon" variant="outline" className="h-7 w-7 border-slate-700 hover:border-rose-500/50 hover:text-rose-300" onClick={() => rejectItem(p.id)} disabled={busyItem === p.id} title="Reject">
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>

      {/* Run history */}
      <Card className="p-5 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-slate-200">
          <Database className="h-4 w-4 text-sky-400" /> Recent Runs
        </h3>
        <div className="space-y-1">
          {runs.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-3 text-sm py-2 px-3 rounded-lg hover:bg-slate-950/60 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                {statusBadge(r.status)}
                <span className="font-medium text-slate-200 truncate">{r.source}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
                <span><span className="text-slate-300">{r.records_fetched ?? 0}</span> fetched</span>
                <span><span className="text-emerald-300">{r.records_new ?? 0}</span> new</span>
                <span><span className="text-fuchsia-300">{r.records_staged ?? 0}</span> staged</span>
                <span>{formatDistanceToNow(new Date(r.started_at), { addSuffix: true })}</span>
              </div>
            </div>
          ))}
          {runs.length === 0 && <div className="text-sm text-slate-500 py-6 text-center">No runs yet.</div>}
        </div>
      </Card>

      {/* Review dialog */}
      <Dialog open={!!reviewItem} onOpenChange={(o) => !o && setReviewItem(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap text-slate-100">
              <Sparkles className="h-4 w-4 text-amber-400" />
              {reviewItem?.title}
              {reviewItem?.ai_score != null && (
                <Badge className="text-xs bg-amber-500/15 text-amber-300 border-amber-500/30">★ {Number(reviewItem.ai_score).toFixed(1)}/5</Badge>
              )}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 flex-wrap text-xs">
              <Badge className="bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30">{reviewItem?.source}</Badge>
              <Badge variant="outline" className="border-slate-700">→ {reviewItem?.target_table}</Badge>
              {reviewItem?.target_platform && <Badge variant="outline" className="border-slate-700">{reviewItem.target_platform}</Badge>}
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
                <div className="p-3 rounded-md bg-slate-900/60 border border-slate-800 text-sm text-slate-200">
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

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => reviewItem && rejectItem(reviewItem.id)} disabled={!reviewItem || busyItem === reviewItem?.id}>
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:opacity-90"
              onClick={async () => { if (reviewItem) { await approveItem(reviewItem.id); setReviewItem(null); } }}
              disabled={!reviewItem || busyItem === reviewItem?.id}
            >
              {busyItem === reviewItem?.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
              Approve & promote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PipelineDashboard;
