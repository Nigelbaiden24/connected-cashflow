import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Activity, CheckCircle2, XCircle, RefreshCw, Play, Clock, Database,
  AlertTriangle, Sparkles, Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
}

export const PipelineDashboard = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySource, setBusySource] = useState<string | null>(null);
  const [busyItem, setBusyItem] = useState<string | null>(null);

  const load = async () => {
    const [{ data: s }, { data: r }, { data: p }] = await Promise.all([
      supabase.from("pipeline_schedule").select("*").order("source"),
      supabase.from("pipeline_runs").select("*").order("started_at", { ascending: false }).limit(15),
      supabase.from("pipeline_pending_items").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(50),
    ]);
    setSchedules((s as any) ?? []);
    setRuns((r as any) ?? []);
    setPending((p as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("pipeline-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_pending_items" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_runs" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_schedule" }, load)
      .subscribe();
    const t = setInterval(load, 60000);
    return () => { supabase.removeChannel(ch); clearInterval(t); };
  }, []);

  const triggerRun = async (source?: string) => {
    setBusySource(source ?? "all");
    try {
      const { data, error } = await supabase.functions.invoke("run-data-pipeline", {
        body: source ? { source, triggered_by: "manual" } : { triggered_by: "manual" },
      });
      if (error) throw error;
      toast({ title: source ? `Triggered ${source}` : "Triggered all due sources", description: `Processed ${data?.ran ?? 0} source(s)` });
      load();
    } catch (e: any) {
      toast({ title: "Pipeline error", description: e.message ?? String(e), variant: "destructive" });
    } finally {
      setBusySource(null);
    }
  };

  const toggleEnabled = async (source: string, enabled: boolean) => {
    const { error } = await supabase.from("pipeline_schedule").update({ enabled }).eq("source", source);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else load();
  };

  const approveItem = async (id: string) => {
    setBusyItem(id);
    try {
      const { data, error } = await supabase.rpc("approve_pending_item" as any, { _item_id: id });
      if (error) throw error;
      const res = data as any;
      if (res?.ok) {
        toast({ title: "Promoted to live dashboard", description: "Item now visible to users." });
      } else {
        toast({ title: "Could not promote", description: res?.error ?? "Unknown", variant: "destructive" });
      }
      load();
    } catch (e: any) {
      toast({ title: "Approval failed", description: e.message, variant: "destructive" });
    } finally { setBusyItem(null); }
  };

  const rejectItem = async (id: string) => {
    setBusyItem(id);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("pipeline_pending_items").update({
      status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user?.id,
    }).eq("id", id);
    if (error) toast({ title: "Reject failed", description: error.message, variant: "destructive" });
    else load();
    setBusyItem(null);
  };

  const statusBadge = (s: string | null) => {
    if (!s) return <Badge variant="outline">—</Badge>;
    if (s === "success") return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">success</Badge>;
    if (s === "partial") return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">partial</Badge>;
    if (s === "failed")  return <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">failed</Badge>;
    if (s === "running") return <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30">running</Badge>;
    return <Badge variant="outline">{s}</Badge>;
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading pipeline…
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-fuchsia-400" /> Automated Data Pipeline
          </h2>
          <p className="text-sm text-muted-foreground">
            Scrape → AI enrich → stage for review → promote to live dashboards. Runs every 6h per source (staggered).
          </p>
        </div>
        <Button onClick={() => triggerRun()} disabled={busySource === "all"} className="bg-fuchsia-600 hover:bg-fuchsia-700">
          {busySource === "all" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          Run all due now
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
          <div className="text-xs text-muted-foreground">Pending review</div>
          <div className="text-2xl font-bold text-amber-300">{pending.length}</div>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
          <div className="text-xs text-muted-foreground">Active sources</div>
          <div className="text-2xl font-bold text-emerald-300">{schedules.filter(s => s.enabled).length}/{schedules.length}</div>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
          <div className="text-xs text-muted-foreground">Recent runs (24h)</div>
          <div className="text-2xl font-bold text-sky-300">{runs.length}</div>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
          <div className="text-xs text-muted-foreground">Failures</div>
          <div className="text-2xl font-bold text-rose-300">{schedules.reduce((a, s) => a + (s.consecutive_failures || 0), 0)}</div>
        </Card>
      </div>

      {/* Schedule */}
      <Card className="p-5 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Schedule</h3>
        <div className="space-y-2">
          {schedules.map(s => (
            <div key={s.source} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800/60">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{s.source}</span>
                  {statusBadge(s.last_status)}
                  {s.consecutive_failures > 0 && (
                    <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />{s.consecutive_failures} fails</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Next: {formatDistanceToNow(new Date(s.next_run_at), { addSuffix: true })} · Last: {s.last_run_at ? formatDistanceToNow(new Date(s.last_run_at), { addSuffix: true }) : "never"}
                </div>
                {s.last_error && <div className="text-xs text-rose-400 mt-1 truncate">{s.last_error}</div>}
              </div>
              <Switch checked={s.enabled} onCheckedChange={(v) => toggleEnabled(s.source, v)} />
              <Button size="sm" variant="outline" onClick={() => triggerRun(s.source)} disabled={busySource === s.source}>
                {busySource === s.source ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Pending review */}
      <Card className="p-5 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" /> Pending Review ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">No items awaiting review.</div>
        ) : (
          <ScrollArea className="h-[420px] pr-3">
            <div className="space-y-2">
              {pending.map(p => (
                <div key={p.id} className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{p.title}</span>
                        {p.ai_score != null && (
                          <Badge variant="outline" className="text-xs">★ {Number(p.ai_score).toFixed(1)}/5</Badge>
                        )}
                        <Badge className="text-xs bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30">{p.source}</Badge>
                        <Badge variant="outline" className="text-xs">{p.target_table}</Badge>
                        {p.target_platform && <Badge variant="outline" className="text-xs">{p.target_platform}</Badge>}
                      </div>
                      {p.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.summary}</p>}
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        {(p.ai_tags ?? []).map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                      </div>
                      {p.source_url && (
                        <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:underline mt-1 inline-block truncate max-w-full">
                          {p.source_url}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button size="sm" onClick={() => approveItem(p.id)} disabled={busyItem === p.id} className="bg-emerald-600 hover:bg-emerald-700">
                        {busyItem === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => rejectItem(p.id)} disabled={busyItem === p.id}>
                        <XCircle className="h-3 w-3" />
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
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Database className="h-4 w-4" /> Recent Runs</h3>
        <div className="space-y-1.5">
          {runs.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-3 text-sm py-2 border-b border-slate-800/40 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                {statusBadge(r.status)}
                <span className="font-medium truncate">{r.source}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                <span>fetched {r.records_fetched ?? 0}</span>
                <span>new {r.records_new ?? 0}</span>
                <span>staged {r.records_staged ?? 0}</span>
                <span>{formatDistanceToNow(new Date(r.started_at), { addSuffix: true })}</span>
              </div>
            </div>
          ))}
          {runs.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">No runs yet.</div>}
        </div>
      </Card>
    </div>
  );
};

export default PipelineDashboard;
