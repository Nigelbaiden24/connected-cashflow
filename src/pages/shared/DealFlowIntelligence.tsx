import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Activity, Loader2, ExternalLink, Sparkles, Search, RefreshCw, AlertTriangle,
  ShieldCheck, TrendingUp, Gauge, Target, Database, Flame, ArrowUpRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface IntelEvent {
  id: string;
  title: string | null;
  summary: string | null;
  event_type: string;
  amount_value: number | null;
  amount_currency: string | null;
  status: string;
  confidence_score: number | null;
  source_url: string | null;
  created_at: string;
}

interface Promoted {
  id: string;
  title: string;
  summary: string | null;
  category: string | null;
  source: string;
  ai_score: number | null;
  source_url: string | null;
  reviewed_at: string | null;
  target_table: string | null;
  target_platform: string | null;
}

interface Props { platform: "finance" | "investor" }

const fmtAmount = (v: number | null, c: string | null) => {
  if (!v) return "—";
  const cur = c || "GBP";
  if (v >= 1_000_000_000) return `${cur} ${(v / 1e9).toFixed(2)}B`;
  if (v >= 1_000_000) return `${cur} ${(v / 1e6).toFixed(2)}M`;
  if (v >= 1_000) return `${cur} ${(v / 1e3).toFixed(1)}K`;
  return `${cur} ${v.toLocaleString()}`;
};

export default function DealFlowIntelligence({ platform }: Props) {
  const [promoted, setPromoted] = useState<Promoted[]>([]);
  const [events, setEvents] = useState<IntelEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const isFinance = platform === "finance";
  const heroGradient = isFinance
    ? "from-[#0b1e3f] via-[#0a2d5e] to-[#0b1e3f]"
    : "from-[#1a0b3f] via-[#3a0e6e] to-[#1a0b3f]";
  const accentRing = isFinance ? "ring-blue-500/30" : "ring-fuchsia-500/30";
  const accentText = isFinance ? "text-cyan-300" : "text-fuchsia-300";
  const accentChip = isFinance ? "bg-cyan-500/15 text-cyan-200 border-cyan-400/30" : "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/30";

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p }, { data: e }] = await Promise.all([
      supabase.from("pipeline_pending_items" as any)
        .select("id, source, target_table, target_platform, title, summary, category, source_url, ai_score, reviewed_at")
        .eq("status", "promoted")
        .or(`target_platform.eq.${platform},target_platform.is.null`)
        .order("reviewed_at", { ascending: false })
        .limit(120),
      supabase.from("intel_events" as any)
        .select("id, title, summary, event_type, amount_value, amount_currency, status, confidence_score, source_url, created_at")
        .in("status", ["validated", "verified"])
        .order("created_at", { ascending: false })
        .limit(60),
    ]);
    setPromoted(((p as any) ?? []) as Promoted[]);
    setEvents(((e as any) ?? []) as IntelEvent[]);
    setLoading(false);
  }, [platform]);

  useEffect(() => {
    void load();
    const ch = supabase
      .channel(`dealflow-${platform}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_pending_items" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "intel_events" }, () => void load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load, platform]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    promoted.forEach(p => p.category && set.add(p.category));
    return ["all", ...Array.from(set).sort()];
  }, [promoted]);

  const filtered = useMemo(() => promoted.filter(p => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (p.title?.toLowerCase().includes(q) || p.source?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
  }), [promoted, query, categoryFilter]);

  const avgScore = promoted.length
    ? promoted.reduce((a, p) => a + (Number(p.ai_score) || 0), 0) / promoted.length
    : 0;
  const highConviction = promoted.filter(p => (Number(p.ai_score) || 0) >= 4).length;
  const totalCapital = events.reduce((a, e) => a + (e.amount_value || 0), 0);
  const last24h = promoted.filter(p => p.reviewed_at && Date.now() - new Date(p.reviewed_at).getTime() < 86400000).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        {/* Hero */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${heroGradient} ring-1 ${accentRing} shadow-2xl`}>
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.25),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(217,70,239,0.18),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="relative p-6 md:p-10">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="space-y-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em] border ${accentChip} backdrop-blur`}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                  </span>
                  Live Intelligence Stream
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight flex items-center gap-3">
                  Deal Flow Intelligence
                </h1>
                <p className="text-white/70 max-w-2xl text-sm md:text-base leading-relaxed">
                  Institutional-grade deal signals validated by the FlowPulse research desk — sourced, scored, and released to the
                  {isFinance ? " advisory" : " investor"} platform in real time.
                </p>
              </div>
              <Button onClick={load} variant="secondary" className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8">
              {[
                { label: "Promoted Deals", value: promoted.length.toString(), icon: ShieldCheck, tint: "text-emerald-300" },
                { label: "High Conviction", value: highConviction.toString(), icon: Flame, tint: "text-orange-300" },
                { label: "Avg AI Score", value: promoted.length ? `${avgScore.toFixed(2)}/5` : "—", icon: Gauge, tint: accentText },
                { label: "New · 24h", value: last24h.toString(), icon: TrendingUp, tint: "text-cyan-300" },
              ].map((k) => (
                <div key={k.label} className="group relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-xl p-4 hover:bg-white/[0.09] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-white/55">{k.label}</span>
                    <k.icon className={`h-4 w-4 ${k.tint}`} />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mt-2 tabular-nums">{k.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full md:w-auto">
            <TabsList className="bg-slate-900/60 border border-slate-800 backdrop-blur p-1 h-auto flex-wrap">
              {categories.slice(0, 8).map(c => (
                <TabsTrigger key={c} value={c} className="text-xs capitalize data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
                  {c === "all" ? "All Sectors" : c}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search deals, sources, sectors…"
              className="h-10 pl-9 w-72 bg-slate-900/60 border-slate-800 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Promoted Deals */}
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-xl">
          <CardHeader className="border-b border-slate-800/60">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Analyst-Promoted Deals
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Curated and verified by the FlowPulse research desk before release.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-slate-700 text-slate-300">
                {filtered.length} {filtered.length === 1 ? "deal" : "deals"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-500" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14 text-slate-500">
                <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No promoted deals match the current filter.</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => {
                  const score = Number(p.ai_score) || 0;
                  const scorePct = Math.min(100, (score / 5) * 100);
                  const conviction = score >= 4 ? "Elite" : score >= 3 ? "Strong" : score >= 2 ? "Watch" : "Early";
                  const convictionColor =
                    score >= 4 ? "text-emerald-300 border-emerald-400/30 bg-emerald-500/10"
                    : score >= 3 ? "text-cyan-300 border-cyan-400/30 bg-cyan-500/10"
                    : score >= 2 ? "text-amber-300 border-amber-400/30 bg-amber-500/10"
                    : "text-slate-400 border-slate-700 bg-slate-800/40";

                  return (
                    <div
                      key={p.id}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${isFinance ? "from-cyan-500 via-blue-500 to-transparent" : "from-fuchsia-500 via-violet-500 to-transparent"}`} />
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge className={`text-[10px] font-semibold border ${convictionColor}`}>{conviction}</Badge>
                            {p.category && <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300 capitalize">{p.category}</Badge>}
                          </div>
                          {p.source_url && (
                            <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 text-slate-300 transition-opacity">
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          )}
                        </div>

                        <h3 className="font-semibold text-[15px] text-slate-100 leading-snug line-clamp-2">{p.title}</h3>
                        {p.summary && <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{p.summary}</p>}

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                            <span className="flex items-center gap-1"><Target className="h-3 w-3" /> AI Conviction</span>
                            <span className="tabular-nums text-slate-300 font-semibold">{score.toFixed(2)} / 5</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${isFinance ? "from-cyan-400 to-blue-500" : "from-fuchsia-400 to-violet-500"}`}
                              style={{ width: `${scorePct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                          <span className="flex items-center gap-1.5">
                            <Database className="h-3 w-3" />
                            <span className="text-slate-400">{p.source}</span>
                          </span>
                          {p.reviewed_at && <span>{formatDistanceToNow(new Date(p.reviewed_at), { addSuffix: true })}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events */}
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-xl">
          <CardHeader className="border-b border-slate-800/60">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  Recent Intelligence Events
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Latest validated deal-flow signals from the intelligence pipeline.
                </CardDescription>
              </div>
              {totalCapital > 0 && (
                <Badge variant="outline" className="border-slate-700 text-slate-300">
                  Tracked capital · {fmtAmount(totalCapital, "GBP")}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {events.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No events yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider">Title</TableHead>
                      <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider">Type</TableHead>
                      <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider">Amount</TableHead>
                      <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider">Confidence</TableHead>
                      <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider">Seen</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((e) => {
                      const conf = e.confidence_score != null ? Math.round(Number(e.confidence_score) * 100) : null;
                      return (
                        <TableRow key={e.id} className="border-slate-800/60 hover:bg-slate-800/30">
                          <TableCell className="max-w-md">
                            <div className="font-medium text-sm text-slate-100 truncate">{e.title}</div>
                            {e.summary && <div className="text-xs text-slate-500 truncate mt-0.5">{e.summary}</div>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs border-slate-700 text-slate-300 capitalize">{e.event_type}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-slate-200 tabular-nums">
                            {fmtAmount(e.amount_value, e.amount_currency)}
                          </TableCell>
                          <TableCell>
                            {conf != null ? (
                              <div className="flex items-center gap-2 min-w-[90px]">
                                <div className="h-1 flex-1 rounded-full bg-slate-800 overflow-hidden max-w-[60px]">
                                  <div
                                    className={`h-full rounded-full ${conf >= 75 ? "bg-emerald-400" : conf >= 50 ? "bg-amber-400" : "bg-rose-400"}`}
                                    style={{ width: `${conf}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-300 tabular-nums">{conf}%</span>
                              </div>
                            ) : <span className="text-xs text-slate-600">—</span>}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            {e.source_url && (
                              <a href={e.source_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
