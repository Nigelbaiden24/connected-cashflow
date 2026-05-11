import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Loader2, Sparkles, Search, RefreshCw, AlertTriangle,
  ShieldCheck, TrendingUp, Gauge, Target, Database, Flame,
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
  const [selectedDeal, setSelectedDeal] = useState<Promoted | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<IntelEvent | null>(null);

  const isFinance = platform === "finance";
  const accentText = isFinance ? "text-blue-700" : "text-fuchsia-700";
  const accentChip = isFinance
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200";

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
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-slate-50 ring-1 ring-slate-200 shadow-sm">
          <div className="relative p-6 md:p-10">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="space-y-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em] border ${accentChip}`}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                  </span>
                  Live Intelligence Stream
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
                  Deal Flow Intelligence
                </h1>
                <p className="text-slate-600 max-w-2xl text-sm md:text-base leading-relaxed">
                  Institutional-grade deal signals validated by the FlowPulse research desk — sourced, scored, and released to the
                  {isFinance ? " advisory" : " investor"} platform in real time.
                </p>
              </div>
              <Button onClick={load} variant="outline" className="gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8">
              {[
                { label: "Promoted Deals", value: promoted.length.toString(), icon: ShieldCheck, tint: "text-emerald-600" },
                { label: "High Conviction", value: highConviction.toString(), icon: Flame, tint: "text-orange-600" },
                { label: "Avg AI Score", value: promoted.length ? `${avgScore.toFixed(2)}/5` : "—", icon: Gauge, tint: accentText },
                { label: "New · 24h", value: last24h.toString(), icon: TrendingUp, tint: "text-cyan-600" },
              ].map((k) => (
                <div key={k.label} className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{k.label}</span>
                    <k.icon className={`h-4 w-4 ${k.tint}`} />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2 tabular-nums">{k.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full md:w-auto">
            <TabsList className="bg-slate-100 border border-slate-200 p-1 h-auto flex-wrap">
              {categories.slice(0, 8).map(c => (
                <TabsTrigger key={c} value={c} className="text-xs capitalize data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
                  {c === "all" ? "All Sectors" : c}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search deals, sources, sectors…"
              className="h-10 pl-9 w-72 bg-white border-slate-200"
            />
          </div>
        </div>

        {/* Promoted Deals */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Analyst-Promoted Deals
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Click a deal to view the full intelligence summary.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-slate-300 text-slate-600">
                {filtered.length} {filtered.length === 1 ? "deal" : "deals"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div>
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
                    score >= 4 ? "text-emerald-700 border-emerald-300 bg-emerald-50"
                    : score >= 3 ? "text-cyan-700 border-cyan-300 bg-cyan-50"
                    : score >= 2 ? "text-amber-700 border-amber-300 bg-amber-50"
                    : "text-slate-600 border-slate-300 bg-slate-50";

                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedDeal(p)}
                      className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left"
                    >
                      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${isFinance ? "from-cyan-500 via-blue-500 to-transparent" : "from-fuchsia-500 via-violet-500 to-transparent"}`} />
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge className={`text-[10px] font-semibold border ${convictionColor}`}>{conviction}</Badge>
                            {p.category && <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-600 capitalize">{p.category}</Badge>}
                          </div>
                        </div>

                        <h3 className="font-semibold text-[15px] text-slate-900 leading-snug line-clamp-2">{p.title}</h3>
                        {p.summary && <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{p.summary}</p>}

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                            <span className="flex items-center gap-1"><Target className="h-3 w-3" /> AI Conviction</span>
                            <span className="tabular-nums text-slate-700 font-semibold">{score.toFixed(2)} / 5</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${isFinance ? "from-cyan-400 to-blue-500" : "from-fuchsia-400 to-violet-500"}`}
                              style={{ width: `${scorePct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                          <span className="flex items-center gap-1.5">
                            <Database className="h-3 w-3" />
                            <span className="text-slate-600">{p.source}</span>
                          </span>
                          {p.reviewed_at && <span>{formatDistanceToNow(new Date(p.reviewed_at), { addSuffix: true })}</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Recent Intelligence Events
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Click a row to view the full event summary.
                </CardDescription>
              </div>
              {totalCapital > 0 && (
                <Badge variant="outline" className="border-slate-300 text-slate-600">
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
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="text-slate-500 text-[11px] uppercase tracking-wider">Title</TableHead>
                      <TableHead className="text-slate-500 text-[11px] uppercase tracking-wider">Type</TableHead>
                      <TableHead className="text-slate-500 text-[11px] uppercase tracking-wider">Amount</TableHead>
                      <TableHead className="text-slate-500 text-[11px] uppercase tracking-wider">Confidence</TableHead>
                      <TableHead className="text-slate-500 text-[11px] uppercase tracking-wider">Seen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((e) => {
                      const conf = e.confidence_score != null ? Math.round(Number(e.confidence_score) * 100) : null;
                      return (
                        <TableRow
                          key={e.id}
                          onClick={() => setSelectedEvent(e)}
                          className="border-slate-200 hover:bg-slate-50 cursor-pointer"
                        >
                          <TableCell className="max-w-md">
                            <div className="font-medium text-sm text-slate-900 truncate">{e.title}</div>
                            {e.summary && <div className="text-xs text-slate-500 truncate mt-0.5">{e.summary}</div>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs border-slate-300 text-slate-600 capitalize">{e.event_type}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-slate-700 tabular-nums">
                            {fmtAmount(e.amount_value, e.amount_currency)}
                          </TableCell>
                          <TableCell>
                            {conf != null ? (
                              <div className="flex items-center gap-2 min-w-[90px]">
                                <div className="h-1 flex-1 rounded-full bg-slate-200 overflow-hidden max-w-[60px]">
                                  <div
                                    className={`h-full rounded-full ${conf >= 75 ? "bg-emerald-500" : conf >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                                    style={{ width: `${conf}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-700 tabular-nums">{conf}%</span>
                              </div>
                            ) : <span className="text-xs text-slate-400">—</span>}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
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

      {/* Deal summary modal */}
      <Dialog open={!!selectedDeal} onOpenChange={(o) => !o && setSelectedDeal(null)}>
        <DialogContent className="max-w-2xl bg-white">
          {selectedDeal && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {(() => {
                    const score = Number(selectedDeal.ai_score) || 0;
                    const conviction = score >= 4 ? "Elite" : score >= 3 ? "Strong" : score >= 2 ? "Watch" : "Early";
                    const cls = score >= 4 ? "text-emerald-700 border-emerald-300 bg-emerald-50"
                      : score >= 3 ? "text-cyan-700 border-cyan-300 bg-cyan-50"
                      : score >= 2 ? "text-amber-700 border-amber-300 bg-amber-50"
                      : "text-slate-600 border-slate-300 bg-slate-50";
                    return <Badge className={`text-[10px] font-semibold border ${cls}`}>{conviction}</Badge>;
                  })()}
                  {selectedDeal.category && (
                    <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-600 capitalize">{selectedDeal.category}</Badge>
                  )}
                </div>
                <DialogTitle className="text-xl text-slate-900 leading-snug">{selectedDeal.title}</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Source: {selectedDeal.source}
                  {selectedDeal.reviewed_at && ` · ${formatDistanceToNow(new Date(selectedDeal.reviewed_at), { addSuffix: true })}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" /> AI Conviction</span>
                    <span className="tabular-nums text-slate-800 font-semibold">{(Number(selectedDeal.ai_score) || 0).toFixed(2)} / 5</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${isFinance ? "from-cyan-400 to-blue-500" : "from-fuchsia-400 to-violet-500"}`}
                      style={{ width: `${Math.min(100, ((Number(selectedDeal.ai_score) || 0) / 5) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Deal Summary</h4>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedDeal.summary || "No detailed summary has been provided for this deal yet."}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Event summary modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl bg-white">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-600 capitalize">{selectedEvent.event_type}</Badge>
                  {selectedEvent.amount_value && (
                    <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-700 tabular-nums">
                      {fmtAmount(selectedEvent.amount_value, selectedEvent.amount_currency)}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl text-slate-900 leading-snug">{selectedEvent.title || "Intelligence Event"}</DialogTitle>
                <DialogDescription className="text-slate-500">
                  {formatDistanceToNow(new Date(selectedEvent.created_at), { addSuffix: true })}
                  {selectedEvent.confidence_score != null && ` · Confidence ${Math.round(Number(selectedEvent.confidence_score) * 100)}%`}
                </DialogDescription>
              </DialogHeader>

              <div>
                <h4 className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Event Summary</h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedEvent.summary || "No detailed summary available for this event."}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
