import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Brain, Play, Check, X, AlertTriangle, Loader2, RefreshCw, Activity, Sparkles } from "lucide-react";
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

const STATUS_TABS: { value: BriefStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "quarantined", label: "Quarantined" },
  { value: "promoted", label: "Promoted" },
  { value: "rejected", label: "Rejected" },
];

const convictionColor = (c: number) =>
  c >= 4 ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
  : c >= 2.5 ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
  : "text-rose-400 border-rose-500/40 bg-rose-500/10";

export default function AnalystQueueDashboard() {
  const { toast } = useToast();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [autoscrape, setAutoscrape] = useState(true);
  const [tab, setTab] = useState<BriefStatus>("pending");
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

  const promote = async (brief: Brief) => {
    try {
      const { data, error } = await supabase.functions.invoke("analyst-promote-brief", { body: { brief_id: brief.id } });
      if (error) throw error;
      toast({ title: "Promoted", description: "Live in Opportunity Intelligence." });
      await load();
    } catch (e: any) {
      toast({ title: "Promote failed", description: e.message, variant: "destructive" });
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

  return (
    <div className="space-y-6 text-foreground">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" /> Analyst AI Queue
          </h2>
          <p className="text-sm text-muted-foreground">
            Autonomous research pipeline · scrape → classify → score → generate → validate → approve.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-muted-foreground">Autoscraper</span>
            <Switch checked={autoscrape} onCheckedChange={toggleAutoscrape} />
          </div>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
          <Button onClick={runPipeline} disabled={running} className="bg-gradient-to-r from-purple-600 to-fuchsia-600">
            {running ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
            Run pipeline now
          </Button>
        </div>
      </div>

      {/* Pipeline run stats */}
      <Card className="p-4 bg-slate-900/60 border-slate-700 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-sm">Last run {lastRun ? `· ${new Date(lastRun.started_at).toLocaleString()}` : ""}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          {[
            ["Scraped", lastRun?.scraped ?? 0, "from-blue-500 to-cyan-500"],
            ["Classified", lastRun?.classified ?? 0, "from-cyan-500 to-emerald-500"],
            ["Scored", lastRun?.scored ?? 0, "from-emerald-500 to-amber-500"],
            ["Briefs", lastRun?.generated ?? 0, "from-amber-500 to-purple-500"],
            ["Duration", lastRun?.duration_ms ? `${(lastRun.duration_ms / 1000).toFixed(1)}s` : "—", "from-purple-500 to-fuchsia-500"],
          ].map(([label, val, grad]) => (
            <div key={label as string} className={`rounded-lg p-3 bg-gradient-to-br ${grad} text-white`}>
              <div className="text-2xl font-bold">{val}</div>
              <div className="text-xs opacity-80">{label}</div>
            </div>
          ))}
        </div>
        {lastRun?.errors && Array.isArray(lastRun.errors) && lastRun.errors.length > 0 && (
          <div className="mt-3 text-xs text-rose-400">
            {lastRun.errors.length} error(s) in last run.
          </div>
        )}
      </Card>

      {/* Market Commentary */}
      <MarketCommentaryPanel />

      {/* Benchmarking & Trends */}
      <BenchmarkTrendsPanel />

      {/* Dynamic AI Watchlist */}
      <DynamicWatchlistPanel />

      {/* Investor Behaviour Segmentation */}
      <InvestorSegmentsPanel />

      {/* Real-Time Investment Alerts */}
      <RealtimeAlertsPanel />

      {/* ETF & Fund Analysis */}
      <ETFFundAnalysisPanel />

      {/* Dynamic Discovery Engine */}
      <DiscoveryEnginePanel />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search briefs…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs bg-slate-900/60 border-slate-700" />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px] bg-slate-900/60 border-slate-700"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={minConviction} onValueChange={setMinConviction}>
          <SelectTrigger className="w-[160px] bg-slate-900/60 border-slate-700"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Conviction ≥ 0</SelectItem>
            <SelectItem value="2">Conviction ≥ 2</SelectItem>
            <SelectItem value="3">Conviction ≥ 3</SelectItem>
            <SelectItem value="4">Conviction ≥ 4</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as BriefStatus)}>
        <TabsList className="bg-slate-900/60 border border-slate-700">
          {STATUS_TABS.map((s) => {
            const count = briefs.filter((b) => b.status === s.value).length;
            return (
              <TabsTrigger key={s.value} value={s.value} className="data-[state=active]:bg-purple-600/30">
                {s.label} <span className="ml-1.5 text-xs opacity-60">({count})</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {STATUS_TABS.map((s) => (
          <TabsContent key={s.value} value={s.value} className="mt-4 space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!loading && filtered.length === 0 && (
              <Card className="p-8 text-center bg-slate-900/40 border-slate-800">
                <p className="text-sm text-muted-foreground">No {s.label.toLowerCase()} briefs match your filters.</p>
                {s.value === "pending" && <p className="text-xs text-muted-foreground mt-2">Click "Run pipeline now" to generate the first batch.</p>}
              </Card>
            )}
            {filtered.map((b) => (
              <Card key={b.id} className="p-5 bg-slate-900/60 border-slate-700 backdrop-blur-xl hover:border-purple-500/40 transition">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-[260px]">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className={convictionColor(b.conviction)}>Conviction {b.conviction}/5</Badge>
                      <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-500/10">Score {b.opportunity_score}</Badge>
                      <Badge variant="outline" className="border-rose-500/40 text-rose-300 bg-rose-500/10">Risk {b.risk_score}</Badge>
                      <Badge variant="outline" className="border-slate-500/40 text-slate-300">{b.category}</Badge>
                      <Badge variant="outline" className="border-purple-500/40 text-purple-300">{b.persona}</Badge>
                      {b.time_horizon && <Badge variant="outline" className="border-amber-500/40 text-amber-300">{b.time_horizon}</Badge>}
                      {!b.compliance_pass && (
                        <Badge variant="outline" className="border-rose-500/60 text-rose-300 bg-rose-500/10">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Compliance flagged
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{b.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Generated {new Date(b.created_at).toLocaleString()}</p>
                  </div>
                  {(b.status === "pending" || b.status === "quarantined") && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => promote(b)} className="bg-emerald-600 hover:bg-emerald-700">
                        <Check className="w-4 h-4 mr-1" /> Promote
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => reject(b)} className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10">
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>

                {b.extended?.retail_summary && (
                  <div className="mt-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <p className="text-[10px] uppercase tracking-wider text-purple-300 mb-1 font-semibold">Retail Summary</p>
                    <p className="text-sm text-slate-200 leading-relaxed">{b.extended.retail_summary}</p>
                  </div>
                )}

                {b.extended && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.extended.risk_level && <Badge variant="outline" className="border-rose-500/40 text-rose-300">Risk: {b.extended.risk_level}</Badge>}
                    {b.extended.investor_profile && <Badge variant="outline" className="border-cyan-500/40 text-cyan-300">Profile: {b.extended.investor_profile}</Badge>}
                    {b.extended.allocation_category && <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">{b.extended.allocation_category}</Badge>}
                    {typeof b.extended.confidence_score === "number" && <Badge variant="outline" className="border-violet-500/40 text-violet-300">Confidence {b.extended.confidence_score}/100</Badge>}
                    {Array.isArray(b.extended.suggested_tags) && b.extended.suggested_tags.slice(0, 8).map((t: string, i: number) => (
                      <Badge key={i} variant="outline" className="border-slate-600 text-slate-300 text-[10px]">#{t}</Badge>
                    ))}
                  </div>
                )}

                {b.full_markdown && (
                  <details className="mt-3 group">
                    <summary className="cursor-pointer text-xs text-purple-300 hover:text-purple-200 font-semibold uppercase tracking-wider">View full institutional brief ▾</summary>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-200 mt-3 pt-3 border-t border-slate-700/50">
                      <ReactMarkdown>{b.full_markdown}</ReactMarkdown>
                    </div>
                  </details>
                )}

                {Array.isArray(b.compliance_flags) && b.compliance_flags.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 text-xs text-rose-300">
                    <strong>Compliance flags:</strong>
                    <ul className="list-disc ml-4 mt-1">{b.compliance_flags.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul>
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
