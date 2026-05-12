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
  { value: "pending", label: "Pending review", dot: "bg-amber-400" },
  { value: "quarantined", label: "Quarantined", dot: "bg-rose-400" },
  { value: "promoted", label: "Promoted", dot: "bg-emerald-400" },
  { value: "rejected", label: "Rejected", dot: "bg-slate-500" },
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
  c >= 4 ? { accent: "border-l-emerald-400", text: "text-emerald-300", bar: "bg-emerald-400", chip: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" }
  : c >= 2.5 ? { accent: "border-l-amber-400", text: "text-amber-300", bar: "bg-amber-400", chip: "bg-amber-500/10 text-amber-300 border-amber-500/30" }
  : { accent: "border-l-rose-400", text: "text-rose-300", bar: "bg-rose-400", chip: "bg-rose-500/10 text-rose-300 border-rose-500/30" };

function StatTile({
  label, value, hint, icon: Icon, delta,
}: { label: string; value: string | number; hint?: string; icon: any; delta?: string }) {
  return (
    <div className="group relative flex items-center gap-3 px-4 py-3 border-r border-slate-800/60 last:border-r-0 hover:bg-slate-900/40 transition-colors">
      <div className="rounded-md bg-slate-900 p-2 ring-1 ring-slate-800">
        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-medium">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <p className="text-lg font-semibold tracking-tight text-slate-50 tabular-nums leading-tight">{value}</p>
          {delta && <span className="text-[10px] text-emerald-400 tabular-nums">{delta}</span>}
        </div>
        {hint && <p className="text-[10px] text-slate-600 leading-tight">{hint}</p>}
      </div>
    </div>
  );
}

function MetricBar({ label, value, max = 100, tone }: { label: string; value: number; max?: number; tone: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.12em] text-slate-500">
        <span className="font-medium">{label}</span>
        <span className="text-slate-200 tabular-nums font-semibold">{value}{max === 5 ? "" : ""}<span className="text-slate-600 ml-0.5">/{max === 5 ? "5" : "100"}</span></span>
      </div>
      <div className="h-1 rounded-full bg-slate-800/80 overflow-hidden">
        <div className={`h-full ${tone} transition-all duration-500`} style={{ width: `${pct}%` }} />
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
    <div className="space-y-6 text-slate-200">
      {/* ─── Hero header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_top_right,_theme(colors.purple.500),transparent_60%)]" />
        <div className="relative p-6 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 ring-1 ring-purple-500/30 p-2.5">
                <Brain className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-purple-300/70 font-semibold">Orchestration Layer</p>
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">flowpulse / admin</p>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-50">Analyst AI Queue</h2>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Autonomous research pipeline — scrape, classify, score, generate, validate, then route to the
                  matching frontend tab on approval.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                <div className={`h-1.5 w-1.5 rounded-full ${autoscrape ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                <span className="text-xs text-slate-400">Autoscraper</span>
                <Switch checked={autoscrape} onCheckedChange={toggleAutoscrape} />
              </div>
              <Button variant="outline" size="sm" onClick={load}
                className="border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-300">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
              </Button>
              <Button onClick={runPipeline} disabled={running} size="sm"
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-lg shadow-purple-900/30">
                {running ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
                Run pipeline
              </Button>
            </div>
          </div>

          {/* KPI row */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatTile label="Scraped"    value={lastRun?.scraped ?? 0}    icon={Database}    accent="from-blue-500/0 via-blue-500 to-blue-500/0" />
            <StatTile label="Classified" value={lastRun?.classified ?? 0} icon={Cpu}         accent="from-cyan-500/0 via-cyan-500 to-cyan-500/0" />
            <StatTile label="Scored"     value={lastRun?.scored ?? 0}     icon={Gauge}       accent="from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
            <StatTile label="Briefs"     value={lastRun?.generated ?? 0}  icon={FileText}    accent="from-amber-500/0 via-amber-500 to-amber-500/0" />
            <StatTile label="Pending"    value={counts.pending}           icon={Clock}       accent="from-amber-500/0 via-amber-400 to-amber-500/0" />
            <StatTile label="Promoted"   value={counts.promoted}          icon={ShieldCheck} accent="from-emerald-500/0 via-emerald-400 to-emerald-500/0" />
            <StatTile
              label="Last run"
              value={lastRun?.duration_ms ? `${(lastRun.duration_ms / 1000).toFixed(1)}s` : "—"}
              hint={lastRun ? new Date(lastRun.started_at).toLocaleTimeString() : "no runs yet"}
              icon={Activity}
              accent="from-purple-500/0 via-purple-500 to-purple-500/0"
            />
          </div>

          {lastRun?.errors && Array.isArray(lastRun.errors) && lastRun.errors.length > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-900/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              {lastRun.errors.length} error(s) in last run.
            </div>
          )}
        </div>
      </div>

      {/* ─── Operational modules (grouped under sub-tabs) ─── */}
      <Card className="border-slate-800/80 bg-slate-950/40 backdrop-blur-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">Intelligence modules</h3>
            <span className="text-[11px] text-slate-500">· feed the approval queue</span>
          </div>
        </div>
        <Tabs value={moduleTab} onValueChange={setModuleTab}>
          <div className="px-4 pt-3 overflow-x-auto">
            <TabsList className="bg-slate-900/60 border border-slate-800 h-9 p-1 inline-flex w-auto">
              {MODULE_TABS.map((m) => (
                <TabsTrigger key={m.value} value={m.value}
                  className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400 px-3 h-7">
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
      <Card className="border-slate-800/80 bg-slate-950/40 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <h3 className="text-sm font-semibold text-slate-200">Approval queue</h3>
            <span className="text-[11px] text-slate-500">· review · promote · reject</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search briefs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 w-56 bg-slate-900/60 border-slate-800 text-slate-200 placeholder:text-slate-600"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-[180px] bg-slate-900/60 border-slate-800 text-slate-300">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={minConviction} onValueChange={setMinConviction}>
              <SelectTrigger className="h-9 w-[150px] bg-slate-900/60 border-slate-800 text-slate-300"><SelectValue /></SelectTrigger>
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
            <TabsList className="bg-slate-900/60 border border-slate-800 h-9 p-1 inline-flex w-auto">
              {STATUS_TABS.map((s) => (
                <TabsTrigger key={s.value} value={s.value}
                  className="text-xs px-3 h-7 text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100">
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
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 px-6 py-12 text-center">
                  <FileText className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No {s.label.toLowerCase()} briefs match your filters.</p>
                  {s.value === "pending" && (
                    <p className="text-xs text-slate-600 mt-1">Click "Run pipeline" to generate the first batch.</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {filtered.map((b) => {
                  const tone = convictionTone(b.conviction);
                  return (
                    <div key={b.id}
                      className={`group relative rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-5 ring-1 ring-inset ${tone.ring} hover:border-slate-700 transition`}>
                      {/* top row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-slate-700 bg-slate-900/60 text-slate-300 font-medium">
                              {b.category}
                            </Badge>
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-purple-500/30 bg-purple-500/10 text-purple-300">
                              {b.persona}
                            </Badge>
                            {b.time_horizon && (
                              <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-slate-700 text-slate-400">
                                <Clock className="w-2.5 h-2.5 mr-1" />{b.time_horizon}
                              </Badge>
                            )}
                            {!b.compliance_pass && (
                              <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-rose-500/40 bg-rose-500/10 text-rose-300">
                                <AlertTriangle className="w-2.5 h-2.5 mr-1" /> Flagged
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-[15px] leading-snug text-slate-50 line-clamp-2">{b.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {new Date(b.created_at).toLocaleString()}
                          </p>
                        </div>

                        {(b.status === "pending" || b.status === "quarantined") && (
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" disabled={promotingId === b.id}
                                  className="h-7 px-2.5 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs">
                                  {promotingId === b.id
                                    ? <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    : <Check className="w-3 h-3 mr-1" />}
                                  Promote <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52 bg-slate-950 border-slate-800 text-slate-200">
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-500">
                                  Publish to platform
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem onClick={() => promote(b, "finance")} className="focus:bg-slate-900 cursor-pointer">
                                  <Landmark className="w-3.5 h-3.5 mr-2 text-blue-400" />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium">FlowPulse Finance</span>
                                    <span className="text-[10px] text-slate-500">Adviser & finance frontend</span>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => promote(b, "investor")} className="focus:bg-slate-900 cursor-pointer">
                                  <Briefcase className="w-3.5 h-3.5 mr-2 text-purple-400" />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium">FlowPulse Investor</span>
                                    <span className="text-[10px] text-slate-500">Investor experience frontend</span>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem onClick={() => promote(b, "both")} className="focus:bg-slate-900 cursor-pointer">
                                  <Globe2 className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium">Both platforms</span>
                                    <span className="text-[10px] text-slate-500">Publish to Finance + Investor</span>
                                  </div>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button size="sm" variant="outline" onClick={() => reject(b)}
                              className="h-7 px-2.5 border-slate-700 bg-slate-900/60 hover:bg-rose-950/40 text-rose-300 text-xs">
                              <X className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* metric bars */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <MetricBar label="Conviction" value={b.conviction} max={5} tone={tone.bar} />
                        <MetricBar label="Opportunity" value={b.opportunity_score} tone="bg-cyan-400" />
                        <MetricBar label="Risk" value={b.risk_score} tone="bg-rose-400" />
                      </div>

                      {/* retail summary */}
                      {b.extended?.retail_summary && (
                        <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 px-3 py-2.5 mb-3">
                          <p className="text-[9px] uppercase tracking-[0.14em] text-purple-400/80 mb-1 font-semibold">
                            Retail summary
                          </p>
                          <p className="text-[13px] text-slate-300 leading-relaxed line-clamp-3">
                            {b.extended.retail_summary}
                          </p>
                        </div>
                      )}

                      {/* meta chips */}
                      {b.extended && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {b.extended.risk_level && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-rose-500/30 text-rose-300/90 bg-rose-500/5">
                              Risk · {b.extended.risk_level}
                            </span>
                          )}
                          {b.extended.investor_profile && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-300/90 bg-cyan-500/5">
                              {b.extended.investor_profile}
                            </span>
                          )}
                          {b.extended.allocation_category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-300/90 bg-emerald-500/5">
                              {b.extended.allocation_category}
                            </span>
                          )}
                          {typeof b.extended.confidence_score === "number" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-violet-500/30 text-violet-300/90 bg-violet-500/5 tabular-nums">
                              Confidence {b.extended.confidence_score}/100
                            </span>
                          )}
                          {Array.isArray(b.extended.suggested_tags) && b.extended.suggested_tags.slice(0, 5).map((t: string, i: number) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 bg-slate-900/40">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* full brief disclosure */}
                      {b.full_markdown && (
                        <details className="group/details mt-3 border-t border-slate-800/60 pt-3">
                          <summary className="cursor-pointer list-none flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 font-medium uppercase tracking-wider">
                            <ChevronDown className="w-3 h-3 transition-transform group-open/details:rotate-180" />
                            Full institutional brief
                          </summary>
                          <div className="prose prose-invert prose-sm max-w-none mt-3 text-slate-300 prose-headings:text-slate-100 prose-strong:text-slate-100">
                            <ReactMarkdown>{b.full_markdown}</ReactMarkdown>
                          </div>
                        </details>
                      )}

                      {Array.isArray(b.compliance_flags) && b.compliance_flags.length > 0 && (
                        <div className="mt-3 rounded-lg border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-[11px] text-rose-300">
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
