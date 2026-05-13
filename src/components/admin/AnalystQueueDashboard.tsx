import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Brain, Play, Check, X, AlertTriangle, Loader2, RefreshCw, Activity,
  Search, Filter, Clock, Database, Cpu, Gauge, FileText, ShieldCheck,
  TrendingUp, BarChart3, Eye, Users, Bell, LineChart, Compass, ChevronDown,
  Briefcase, Landmark, Globe2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import MarketCommentaryPanel from "./MarketCommentaryPanel";
import BenchmarkTrendsPanel from "./BenchmarkTrendsPanel";
import DynamicWatchlistPanel from "./DynamicWatchlistPanel";
import InvestorSegmentsPanel from "./InvestorSegmentsPanel";
import RealtimeAlertsPanel from "./RealtimeAlertsPanel";
import ETFFundAnalysisPanel from "./ETFFundAnalysisPanel";
import DiscoveryEnginePanel from "./DiscoveryEnginePanel";

type BriefStatus = "pending" | "promoted" | "rejected" | "quarantined";

interface Brief {
  id: string;
  title: string;
  persona: string;
  category: string;
  conviction: number;
  opportunity_score: number;
  risk_score: number;
  time_horizon: string | null;
  thesis: string | null;
  catalyst: string | null;
  key_levels: string | null;
  risks: string | null;
  action: string | null;
  full_markdown: string | null;
  extended: any;
  compliance_pass: boolean;
  compliance_flags: any;
  status: BriefStatus;
  created_at: string;
}

interface PipelineRun {
  id: string;
  trigger_source: string;
  scraped: number;
  classified: number;
  scored: number;
  generated: number;
  errors: any;
  started_at: string;
  duration_ms: number | null;
}

const STATUS_TABS: { value: BriefStatus; label: string; dot: string }[] = [
  { value: "pending", label: "Pending review", dot: "bg-amber-500" },
  { value: "quarantined", label: "Quarantined", dot: "bg-rose-500" },
  { value: "promoted", label: "Promoted", dot: "bg-emerald-500" },
  { value: "rejected", label: "Rejected", dot: "bg-slate-400" },
];

const MODULE_TABS = [
  { value: "commentary", label: "Market Commentary", icon: TrendingUp },
  { value: "benchmarks", label: "Benchmarks & Trends", icon: BarChart3 },
  { value: "watchlist", label: "Dynamic Watchlist", icon: Eye },
  { value: "segments", label: "Investor Segments", icon: Users },
  { value: "alerts", label: "Real-Time Alerts", icon: Bell },
  { value: "etf", label: "ETF & Fund Analysis", icon: LineChart },
  { value: "discovery", label: "Discovery Engine", icon: Compass },
];

const convictionTone = (c: number) =>
  c >= 4 ? { accent: "border-l-emerald-500", text: "text-emerald-700", bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" }
  : c >= 2.5 ? { accent: "border-l-amber-500", text: "text-amber-700", bar: "bg-amber-500", chip: "bg-amber-50 text-amber-700 border-amber-200" }
  : { accent: "border-l-rose-500", text: "text-rose-700", bar: "bg-rose-500", chip: "bg-rose-50 text-rose-700 border-rose-200" };

function StatTile({
  label, value, hint, icon: Icon,
}: { label: string; value: string | number; hint?: string; icon: any }) {
  return (
    <div className="group relative flex items-center gap-3 px-4 py-3 border-r border-slate-200 last:border-r-0 hover:bg-slate-50/80 transition-colors">
      <div className="rounded-md bg-gradient-to-br from-slate-50 to-slate-100 p-2 ring-1 ring-slate-200">
        <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-600 transition-colors" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <p className="text-lg font-semibold tracking-tight text-slate-900 tabular-nums leading-tight">{value}</p>
        </div>
        {hint && <p className="text-[10px] text-slate-500 leading-tight">{hint}</p>}
      </div>
    </div>
  );
}

function MetricBar({ label, value, max = 100, tone }: { label: string; value: number; max?: number; tone: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.12em] text-slate-500">
        <span className="font-semibold">{label}</span>
        <span className="text-slate-900 tabular-nums font-semibold">{value}<span className="text-slate-400 ml-0.5">/{max === 5 ? "5" : "100"}</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${tone} transition-all duration-500 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalystQueueDashboard() {
  const { toast } = useToast();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [autoscrape, setAutoscrape] = useState(true);
  const [tab, setTab] = useState<BriefStatus>("pending");
  const [moduleTab, setModuleTab] = useState<string>("commentary");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [minConviction, setMinConviction] = useState<string>("0");

  const load = async () => {
    setLoading(true);
    const [b, r, s] = await Promise.all([
      supabase.from("analyst_briefs").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("analyst_pipeline_runs").select("*").order("started_at", { ascending: false }).limit(10),
      supabase.from("analyst_pipeline_settings").select("autoscrape_enabled").eq("id", 1).maybeSingle(),
    ]);
    setBriefs((b.data as Brief[]) || []);
    setRuns((r.data as PipelineRun[]) || []);
    setAutoscrape(s.data?.autoscrape_enabled ?? true);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  const toggleAutoscrape = async (next: boolean) => {
    setAutoscrape(next);
    const { error } = await supabase.from("analyst_pipeline_settings")
      .update({ autoscrape_enabled: next, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) {
      setAutoscrape(!next);
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: next ? "Autoscraper ON" : "Autoscraper OFF", description: next ? "Pipeline runs every 30 min." : "Scheduled runs paused." });
    }
  };

  const runPipeline = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyst-pipeline", { body: { trigger: "manual" } });
      if (error) throw error;
      const c = data?.counts || {};
      toast({ title: "Pipeline complete", description: `Scraped ${c.scraped || 0} · Classified ${c.classified || 0} · Scored ${c.scored || 0} · Generated ${c.generated || 0}` });
      await load();
    } catch (e: any) {
      toast({ title: "Pipeline failed", description: e.message || "Unknown", variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const [promotingId, setPromotingId] = useState<string | null>(null);
  const promote = async (brief: Brief, platform: "finance" | "investor" | "both") => {
    setPromotingId(brief.id);
    try {
      const { error } = await supabase.functions.invoke("analyst-promote-brief", { body: { brief_id: brief.id, platform } });
      if (error) throw error;
      const dest = platform === "both" ? "Finance + Investor" : platform === "finance" ? "FlowPulse Finance" : "FlowPulse Investor";
      toast({ title: "Promoted", description: `Published to ${dest}.` });
      await load();
    } catch (e: any) {
      toast({ title: "Promote failed", description: e.message, variant: "destructive" });
    } finally {
      setPromotingId(null);
    }
  };

  const reject = async (brief: Brief) => {
    const reason = window.prompt("Rejection reason (optional):") || "Rejected by admin";
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("analyst_briefs").update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", brief.id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Rejected" }); await load(); }
  };

  const categories = useMemo(() => Array.from(new Set(briefs.map((b) => b.category))).sort(), [briefs]);

  const filtered = briefs.filter((b) => {
    if (b.status !== tab) return false;
    if (categoryFilter !== "all" && b.category !== categoryFilter) return false;
    if (Number(minConviction) > 0 && b.conviction < Number(minConviction)) return false;
    if (search && !`${b.title} ${b.thesis} ${b.category}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const lastRun = runs[0];
  const counts = useMemo(() => ({
    pending: briefs.filter((b) => b.status === "pending").length,
    quarantined: briefs.filter((b) => b.status === "quarantined").length,
    promoted: briefs.filter((b) => b.status === "promoted").length,
    rejected: briefs.filter((b) => b.status === "rejected").length,
  }), [briefs]);

  return (
    <div className="space-y-5 text-slate-900 bg-white rounded-2xl p-1">
      {/* ─── Command bar ───────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50/60 via-fuchsia-50/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-purple-400/30 blur-md" />
              <div className="relative rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 p-2.5 shadow-lg shadow-purple-500/30 ring-1 ring-white/40">
                <Brain className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Analyst AI Queue</h2>
                <span className="text-[10px] font-mono text-slate-400">v2.4</span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-700">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Orchestration · scrape → classify → score → generate → validate → route
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <div className={`h-1.5 w-1.5 rounded-full ${autoscrape ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
              <span className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold">Autoscraper</span>
              <Switch checked={autoscrape} onCheckedChange={toggleAutoscrape} />
            </div>
            <Button variant="outline" size="sm" onClick={load}
              className="h-8 border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
            </Button>
            <Button onClick={runPipeline} disabled={running} size="sm"
              className="h-8 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-lg shadow-purple-500/30">
              {running ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
              Run pipeline
            </Button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 bg-white">
          <StatTile label="Scraped"    value={lastRun?.scraped ?? 0}    icon={Database} />
          <StatTile label="Classified" value={lastRun?.classified ?? 0} icon={Cpu} />
          <StatTile label="Scored"     value={lastRun?.scored ?? 0}     icon={Gauge} />
          <StatTile label="Briefs"     value={lastRun?.generated ?? 0}  icon={FileText} />
          <StatTile label="Pending"    value={counts.pending}           icon={Clock} hint="awaiting review" />
          <StatTile label="Promoted"   value={counts.promoted}          icon={ShieldCheck} hint="published" />
          <StatTile
            label="Last run"
            value={lastRun?.duration_ms ? `${(lastRun.duration_ms / 1000).toFixed(1)}s` : "—"}
            hint={lastRun ? new Date(lastRun.started_at).toLocaleTimeString() : "no runs yet"}
            icon={Activity}
          />
        </div>

        {lastRun?.errors && Array.isArray(lastRun.errors) && lastRun.errors.length > 0 && (
          <div className="flex items-center gap-2 border-t border-rose-100 bg-rose-50 px-5 py-2 text-[11px] text-rose-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            {lastRun.errors.length} error(s) in last pipeline run.
          </div>
        )}
      </div>

      {/* ─── Operational modules ─── */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            <h3 className="text-sm font-semibold text-slate-900">Intelligence modules</h3>
            <span className="text-[11px] text-slate-500">· feed the approval queue</span>
          </div>
        </div>
        <Tabs value={moduleTab} onValueChange={setModuleTab}>
          <div className="px-4 pt-3 overflow-x-auto">
            <TabsList className="bg-slate-100 border border-slate-200 h-9 p-1 inline-flex w-auto">
              {MODULE_TABS.map((m) => (
                <TabsTrigger key={m.value} value={m.value}
                  className="text-xs data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm text-slate-600 px-3 h-7">
                  <m.icon className="w-3.5 h-3.5 mr-1.5" /> {m.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="p-4">
            <TabsContent value="commentary" className="mt-0"><MarketCommentaryPanel /></TabsContent>
            <TabsContent value="benchmarks" className="mt-0"><BenchmarkTrendsPanel /></TabsContent>
            <TabsContent value="watchlist"  className="mt-0"><DynamicWatchlistPanel /></TabsContent>
            <TabsContent value="segments"   className="mt-0"><InvestorSegmentsPanel /></TabsContent>
            <TabsContent value="alerts"     className="mt-0"><RealtimeAlertsPanel /></TabsContent>
            <TabsContent value="etf"        className="mt-0"><ETFFundAnalysisPanel /></TabsContent>
            <TabsContent value="discovery"  className="mt-0"><DiscoveryEnginePanel /></TabsContent>
          </div>
        </Tabs>
      </Card>

      {/* ─── Approval queue ────────────────────────────────── */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <h3 className="text-sm font-semibold text-slate-900">Approval queue</h3>
            <span className="text-[11px] text-slate-500">· review · promote · reject</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search briefs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 w-56 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-[180px] bg-white border-slate-200 text-slate-700">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={minConviction} onValueChange={setMinConviction}>
              <SelectTrigger className="h-9 w-[150px] bg-white border-slate-200 text-slate-700"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Conviction ≥ 0</SelectItem>
                <SelectItem value="2">Conviction ≥ 2</SelectItem>
                <SelectItem value="3">Conviction ≥ 3</SelectItem>
                <SelectItem value="4">Conviction ≥ 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as BriefStatus)}>
          <div className="px-4 pt-4">
            <TabsList className="bg-slate-100 border border-slate-200 h-9 p-1 inline-flex w-auto">
              {STATUS_TABS.map((s) => (
                <TabsTrigger key={s.value} value={s.value}
                  className="text-xs px-3 h-7 text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                  <span className="ml-1.5 text-[10px] tabular-nums text-slate-500">
                    {counts[s.value]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {STATUS_TABS.map((s) => (
            <TabsContent key={s.value} value={s.value} className="m-0 p-4 pt-3 space-y-3">
              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-6 justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading briefs…
                </div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
                  <FileText className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">No {s.label.toLowerCase()} briefs match your filters.</p>
                  {s.value === "pending" && (
                    <p className="text-xs text-slate-500 mt-1">Click "Run pipeline" to generate the first batch.</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {filtered.map((b) => {
                  const tone = convictionTone(b.conviction);
                  return (
                    <div key={b.id}
                      className={`group relative rounded-xl border border-slate-200 bg-white border-l-4 ${tone.accent} p-4 hover:border-slate-300 hover:shadow-md transition-all`}>

                      {/* top row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-slate-200 bg-slate-50 text-slate-700 font-medium">
                              {b.category}
                            </Badge>
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-purple-200 bg-purple-50 text-purple-700">
                              {b.persona}
                            </Badge>
                            {b.time_horizon && (
                              <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-slate-200 bg-white text-slate-600">
                                <Clock className="w-2.5 h-2.5 mr-1" />{b.time_horizon}
                              </Badge>
                            )}
                            {!b.compliance_pass && (
                              <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-rose-200 bg-rose-50 text-rose-700">
                                <AlertTriangle className="w-2.5 h-2.5 mr-1" /> Flagged
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-[15px] leading-snug text-slate-900 line-clamp-2">{b.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {new Date(b.created_at).toLocaleString()}
                          </p>
                        </div>

                        {(b.status === "pending" || b.status === "quarantined") && (
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" disabled={promotingId === b.id}
                                  className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm">
                                  {promotingId === b.id
                                    ? <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    : <Check className="w-3 h-3 mr-1" />}
                                  Promote <ChevronDown className="w-3 h-3 ml-1 opacity-80" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52 bg-white border-slate-200 text-slate-800 shadow-lg">
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-500">
                                  Publish to platform
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem onClick={() => promote(b, "finance")} className="focus:bg-slate-50 cursor-pointer">
                                  <Landmark className="w-3.5 h-3.5 mr-2 text-blue-600" />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium">FlowPulse Finance</span>
                                    <span className="text-[10px] text-slate-500">Adviser & finance frontend</span>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => promote(b, "investor")} className="focus:bg-slate-50 cursor-pointer">
                                  <Briefcase className="w-3.5 h-3.5 mr-2 text-purple-600" />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium">FlowPulse Investor</span>
                                    <span className="text-[10px] text-slate-500">Investor experience frontend</span>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem onClick={() => promote(b, "both")} className="focus:bg-slate-50 cursor-pointer">
                                  <Globe2 className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium">Both platforms</span>
                                    <span className="text-[10px] text-slate-500">Publish to Finance + Investor</span>
                                  </div>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button size="sm" variant="outline" onClick={() => reject(b)}
                              className="h-7 px-2.5 border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-rose-600 text-xs">
                              <X className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* metric bars */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <MetricBar label="Conviction" value={b.conviction} max={5} tone={tone.bar} />
                        <MetricBar label="Opportunity" value={b.opportunity_score} tone="bg-cyan-500" />
                        <MetricBar label="Risk" value={b.risk_score} tone="bg-rose-500" />
                      </div>

                      {/* retail summary */}
                      {b.extended?.retail_summary && (
                        <div className="rounded-lg bg-purple-50/50 border border-purple-100 px-3 py-2.5 mb-3">
                          <p className="text-[9px] uppercase tracking-[0.14em] text-purple-700 mb-1 font-bold">
                            Retail summary
                          </p>
                          <p className="text-[13px] text-slate-700 leading-relaxed line-clamp-3">
                            {b.extended.retail_summary}
                          </p>
                        </div>
                      )}

                      {/* meta chips */}
                      {b.extended && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {b.extended.risk_level && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-rose-200 text-rose-700 bg-rose-50">
                              Risk · {b.extended.risk_level}
                            </span>
                          )}
                          {b.extended.investor_profile && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-cyan-200 text-cyan-700 bg-cyan-50">
                              {b.extended.investor_profile}
                            </span>
                          )}
                          {b.extended.allocation_category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-700 bg-emerald-50">
                              {b.extended.allocation_category}
                            </span>
                          )}
                          {typeof b.extended.confidence_score === "number" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-violet-200 text-violet-700 bg-violet-50 tabular-nums">
                              Confidence {b.extended.confidence_score}/100
                            </span>
                          )}
                          {Array.isArray(b.extended.suggested_tags) && b.extended.suggested_tags.slice(0, 5).map((t: string, i: number) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 bg-slate-50">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* full brief disclosure */}
                      {b.full_markdown && (
                        <details className="group/details mt-3 border-t border-slate-100 pt-3">
                          <summary className="cursor-pointer list-none flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-purple-700 font-semibold uppercase tracking-wider">
                            <ChevronDown className="w-3 h-3 transition-transform group-open/details:rotate-180" />
                            Full institutional brief
                          </summary>
                          <div className="prose prose-sm max-w-none mt-3 text-slate-700 prose-headings:text-slate-900 prose-strong:text-slate-900">
                            <ReactMarkdown>{b.full_markdown}</ReactMarkdown>
                          </div>
                        </details>
                      )}

                      {Array.isArray(b.compliance_flags) && b.compliance_flags.length > 0 && (
                        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                          <p className="font-semibold mb-1 uppercase tracking-wider text-[10px]">Compliance flags</p>
                          <ul className="list-disc ml-4 space-y-0.5">
                            {b.compliance_flags.map((f: string, i: number) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
