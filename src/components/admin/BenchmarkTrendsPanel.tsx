import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Play, Check, X, Loader2, TrendingUp, TrendingDown, AlertTriangle, ArrowLeftRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Status = "pending" | "approved" | "rejected";

interface Report {
  id: string;
  headline: string;
  executive_summary: string | null;
  mobile_summary: string | null;
  push_summary: string | null;
  full_commentary: string | null;
  rankings: any;
  outperformers: any[];
  underperformers: any[];
  capital_flows: any[];
  momentum_shifts: any[];
  trend_reversals: any[];
  anomalies: any[];
  sector_analysis: any;
  regional_analysis: any;
  growth_vs_value: any;
  sentiment_analysis: any;
  sources: any[];
  confidence_score: number;
  status: Status;
  created_at: string;
}

const conv = (c: number) =>
  c >= 4 ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
  : c >= 2.5 ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
  : "text-rose-400 border-rose-500/40 bg-rose-500/10";

export default function BenchmarkTrendsPanel() {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("analyst_benchmark_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setReports((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setRunning(true);
    try {
      const { error } = await supabase.functions.invoke("analyst-benchmark-trends", { body: {} });
      if (error) throw error;
      toast({ title: "Benchmark report generated", description: "Pending admin review." });
      await load();
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    } finally { setRunning(false); }
  };

  const review = async (id: string, status: Status) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("analyst_benchmark_reports")
      .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: status === "approved" ? "Approved" : "Rejected" }); await load(); }
  };

  return (
    <Card className="p-5 bg-slate-900/60 border-slate-700 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" /> Cross-Asset Benchmarking & Trends
          </h3>
          <p className="text-xs text-muted-foreground">Sector / ETF / fund / region rankings · momentum · flows · anomalies.</p>
        </div>
        <Button onClick={generate} disabled={running} className="bg-gradient-to-r from-cyan-600 to-blue-600">
          {running ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
          Generate report
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && reports.length === 0 && (
        <p className="text-sm text-muted-foreground">No reports yet. Generate the first one.</p>
      )}

      <div className="space-y-3">
        {reports.map((r) => (
          <Card key={r.id} className="p-4 bg-slate-950/60 border-slate-800">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="outline" className={conv(r.confidence_score)}>Confidence {r.confidence_score}/5</Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 capitalize">{r.status}</Badge>
                  {r.sentiment_analysis?.retail && <Badge variant="outline" className="border-amber-500/40 text-amber-300">Retail: {r.sentiment_analysis.retail}</Badge>}
                  {r.sentiment_analysis?.institutional && <Badge variant="outline" className="border-violet-500/40 text-violet-300">Inst: {r.sentiment_analysis.institutional}</Badge>}
                  {r.growth_vs_value?.leader && <Badge variant="outline" className="border-cyan-500/40 text-cyan-300">{r.growth_vs_value.leader} leads</Badge>}
                </div>
                <h4 className="font-semibold">{r.headline}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleString()}</p>
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => review(r.id, "approved")} className="bg-emerald-600 hover:bg-emerald-700">
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => review(r.id, "rejected")} className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10">
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>

            {r.mobile_summary && (
              <p className="text-sm text-slate-200 leading-relaxed mt-2 p-2 rounded bg-cyan-500/5 border border-cyan-500/20">{r.mobile_summary}</p>
            )}

            <div className="grid md:grid-cols-2 gap-3 mt-3">
              {r.outperformers?.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-300 mb-2 font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Outperformers</p>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {r.outperformers.slice(0,5).map((o: any, i: number) => <li key={i}>• <strong>{o.name}</strong> <span className="text-slate-400">({o.type})</span> — {o.reason}</li>)}
                  </ul>
                </div>
              )}
              {r.underperformers?.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                  <p className="text-[10px] uppercase tracking-wider text-rose-300 mb-2 font-semibold flex items-center gap-1"><TrendingDown className="w-3 h-3"/> Underperformers</p>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {r.underperformers.slice(0,5).map((o: any, i: number) => <li key={i}>• <strong>{o.name}</strong> <span className="text-slate-400">({o.type})</span> — {o.reason}</li>)}
                  </ul>
                </div>
              )}
              {r.capital_flows?.length > 0 && (
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-[10px] uppercase tracking-wider text-blue-300 mb-2 font-semibold flex items-center gap-1"><ArrowLeftRight className="w-3 h-3"/> Capital Flows</p>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {r.capital_flows.slice(0,5).map((f: any, i: number) => <li key={i}>• <strong>{f.asset}</strong> — {f.direction} ({f.magnitude}) {f.note}</li>)}
                  </ul>
                </div>
              )}
              {r.trend_reversals?.length > 0 && (
                <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                  <p className="text-[10px] uppercase tracking-wider text-violet-300 mb-2 font-semibold">Trend Reversals</p>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {r.trend_reversals.slice(0,5).map((t: any, i: number) => <li key={i}>• <strong>{t.asset}</strong>: {t.prior_trend} → {t.new_trend}</li>)}
                  </ul>
                </div>
              )}
              {r.anomalies?.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 md:col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-amber-300 mb-2 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Anomaly Alerts</p>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {r.anomalies.map((a: any, i: number) => <li key={i}>• <strong>{a.asset}</strong> [{a.severity}] — {a.anomaly} {a.note}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {r.rankings && Object.keys(r.rankings).length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-cyan-300 hover:text-cyan-200 font-semibold uppercase tracking-wider">Ranking tables ▾</summary>
                <div className="mt-3 grid md:grid-cols-2 gap-3">
                  {Object.entries(r.rankings).map(([key, rows]: any) => Array.isArray(rows) && rows.length > 0 && (
                    <div key={key} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-semibold">{key}</p>
                      <table className="w-full text-xs">
                        <tbody>
                          {rows.slice(0,8).map((row: any, i: number) => (
                            <tr key={i} className="border-b border-slate-800/50 last:border-0">
                              <td className="py-1 text-slate-200">{row.name || row.ticker}</td>
                              <td className="py-1 text-right text-slate-300">{row.performance_pct != null ? `${row.performance_pct > 0 ? '+' : ''}${row.performance_pct}%` : ''}</td>
                              {row.flow && <td className="py-1 text-right text-xs text-slate-400">{row.flow}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {r.full_commentary && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-cyan-300 hover:text-cyan-200 font-semibold uppercase tracking-wider">Full analyst commentary ▾</summary>
                <div className="prose prose-invert prose-sm max-w-none text-slate-200 mt-3 pt-3 border-t border-slate-700/50">
                  <ReactMarkdown>{r.full_commentary}</ReactMarkdown>
                </div>
              </details>
            )}
          </Card>
        ))}
      </div>
    </Card>
  );
}
