import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Loader2, RefreshCw, ChevronDown, ChevronUp, TrendingUp, TrendingDown, X } from "lucide-react";
import PromoteToPlatformButton from "./PromoteToPlatformButton";

interface Analysis {
  id: string;
  ticker: string;
  fund_name: string;
  fund_type: string | null;
  asset_class: string | null;
  region: string | null;
  holdings_concentration: any;
  sector_exposure: any;
  historical_performance: any;
  fee_analysis: any;
  fund_flows: any;
  manager_performance: any;
  volatility_metrics: any;
  summary: string | null;
  pros: any;
  cons: any;
  suitable_investor_types: any;
  comparative_analysis: string | null;
  trend_commentary: string | null;
  overall_score: number;
  status: string;
  created_at: string;
}

const SectionLabel = ({ children }: any) => (
  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{children}</div>
);

const KV = ({ k, v }: { k: string; v: any }) => (
  <div className="flex justify-between text-xs py-0.5 border-b border-slate-800/50 last:border-0">
    <span className="text-slate-400">{k}</span>
    <span className="text-slate-200 font-mono">{typeof v === "number" ? v.toFixed(2) : String(v ?? "—")}</span>
  </div>
);

export default function ETFFundAnalysisPanel() {
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tickersInput, setTickersInput] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("etf_fund_analyses")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    else setAnalyses((data as Analysis[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const tickers = tickersInput.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean);
      const { data, error } = await supabase.functions.invoke("analyst-etf-fund-analysis", {
        body: tickers.length ? { tickers } : {},
      });
      if (error) throw error;
      toast({ title: "Analyses generated", description: `${data?.count ?? 0} new ETF/fund analyses.` });
      await load();
    } catch (e: any) {
      toast({ title: "Generation failed", description: e?.message ?? "Try again", variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  };

  const archive = async (id: string) => {
    const { error } = await supabase.from("etf_fund_analyses").update({ status: "archived" }).eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else setAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20"><LineChart className="h-5 w-5 text-cyan-300" /></div>
          <div>
            <h3 className="text-lg font-semibold text-white">ETF & Fund Analysis</h3>
            <p className="text-xs text-slate-400">Holdings concentration, sector exposure, performance, fees, flows, manager skill, volatility.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tickers (e.g. SPY,QQQ,VTI) — leave blank for defaults"
            value={tickersInput}
            onChange={(e) => setTickersInput(e.target.value)}
            className="w-[340px] bg-slate-950/60 border-slate-700 text-sm"
          />
          <Button onClick={refresh} disabled={refreshing} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Generate</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…</div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No analyses yet. Click "Generate" to produce institutional ETF/fund reports.</div>
      ) : (
        <div className="space-y-3">
          {analyses.map((a) => {
            const isOpen = expanded === a.id;
            const flow = a.fund_flows?.flow_trend ?? "neutral";
            const FlowIcon = flow === "inflow" ? TrendingUp : flow === "outflow" ? TrendingDown : LineChart;
            const flowColor = flow === "inflow" ? "text-emerald-300" : flow === "outflow" ? "text-rose-300" : "text-slate-300";
            return (
              <div key={a.id} className="rounded-lg bg-slate-950/60 border border-slate-800">
                <button onClick={() => setExpanded(isOpen ? null : a.id)} className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-900/40 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold text-white text-base">{a.ticker}</span>
                    <div className="min-w-0">
                      <div className="text-sm text-slate-200 truncate">{a.fund_name}</div>
                      <div className="text-[10px] text-slate-500 flex gap-2">
                        <span>{a.fund_type}</span><span>·</span><span>{a.asset_class}</span><span>·</span><span>{a.region}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className={`${flowColor} border-current/30`}><FlowIcon className="h-3 w-3 mr-1" />{flow}</Badge>
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">Score {Number(a.overall_score).toFixed(1)}/5</Badge>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-slate-800 pt-4 space-y-4">
                    {a.summary && <p className="text-sm text-slate-300">{a.summary}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-900/40 p-3 rounded">
                        <SectionLabel>Historical Performance</SectionLabel>
                        <KV k="YTD" v={a.historical_performance?.ytd_pct + "%"} />
                        <KV k="1Y" v={a.historical_performance?.one_yr_pct + "%"} />
                        <KV k="3Y ann." v={a.historical_performance?.three_yr_annualised_pct + "%"} />
                        <KV k="5Y ann." v={a.historical_performance?.five_yr_annualised_pct + "%"} />
                        <KV k="vs Benchmark" v={a.historical_performance?.vs_benchmark_pct + "%"} />
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded">
                        <SectionLabel>Fees</SectionLabel>
                        <KV k="Expense Ratio" v={a.fee_analysis?.expense_ratio_pct + "%"} />
                        <KV k="vs Category" v={a.fee_analysis?.vs_category_average} />
                        <KV k="Grade" v={a.fee_analysis?.fee_grade} />
                        {a.fee_analysis?.commentary && <p className="text-[11px] text-slate-400 mt-2">{a.fee_analysis.commentary}</p>}
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded">
                        <SectionLabel>Volatility</SectionLabel>
                        <KV k="Std Dev 3Y" v={a.volatility_metrics?.std_dev_3yr_pct + "%"} />
                        <KV k="Beta" v={a.volatility_metrics?.beta} />
                        <KV k="Sharpe" v={a.volatility_metrics?.sharpe_ratio} />
                        <KV k="Max Drawdown" v={a.volatility_metrics?.max_drawdown_pct + "%"} />
                        <KV k="Downside Capture" v={a.volatility_metrics?.downside_capture_pct + "%"} />
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded">
                        <SectionLabel>Holdings Concentration</SectionLabel>
                        <KV k="Top 10 %" v={a.holdings_concentration?.top_10_pct + "%"} />
                        <KV k="Risk" v={a.holdings_concentration?.concentration_risk} />
                        {Array.isArray(a.holdings_concentration?.top_holdings) && (
                          <div className="mt-2 space-y-0.5">
                            {a.holdings_concentration.top_holdings.slice(0, 5).map((h: any, i: number) => (
                              <div key={i} className="flex justify-between text-[11px]">
                                <span className="text-slate-400 truncate">{h.name}</span>
                                <span className="text-slate-200 font-mono">{h.weight_pct}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded">
                        <SectionLabel>Sector Exposure</SectionLabel>
                        <KV k="Dominant" v={a.sector_exposure?.dominant_sector} />
                        {Array.isArray(a.sector_exposure?.sectors) && (
                          <div className="mt-2 space-y-0.5">
                            {a.sector_exposure.sectors.slice(0, 6).map((s: any, i: number) => (
                              <div key={i} className="flex justify-between text-[11px]">
                                <span className="text-slate-400 truncate">{s.sector}</span>
                                <span className="text-slate-200 font-mono">{s.weight_pct}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded">
                        <SectionLabel>Flows & Manager</SectionLabel>
                        <KV k="30D Flow $M" v={a.fund_flows?.last_30d_net_flow_usd_m} />
                        <KV k="90D Flow $M" v={a.fund_flows?.last_90d_net_flow_usd_m} />
                        <KV k="YTD Flow $M" v={a.fund_flows?.ytd_net_flow_usd_m} />
                        <KV k="Mgr Tenure" v={a.manager_performance?.manager_tenure_years + "y"} />
                        <KV k="Alpha" v={a.manager_performance?.alpha_vs_benchmark_pct + "%"} />
                        <KV k="Info Ratio" v={a.manager_performance?.information_ratio} />
                        <KV k="Mgr Grade" v={a.manager_performance?.manager_grade} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <SectionLabel>Pros</SectionLabel>
                        <ul className="text-xs text-emerald-300 space-y-1">
                          {(Array.isArray(a.pros) ? a.pros : []).map((p: string, i: number) => <li key={i}>+ {p}</li>)}
                        </ul>
                      </div>
                      <div>
                        <SectionLabel>Cons</SectionLabel>
                        <ul className="text-xs text-rose-300 space-y-1">
                          {(Array.isArray(a.cons) ? a.cons : []).map((c: string, i: number) => <li key={i}>− {c}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <SectionLabel>Suitable Investor Types</SectionLabel>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(a.suitable_investor_types) ? a.suitable_investor_types : []).map((t: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-slate-700 text-slate-300 text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </div>

                    {a.comparative_analysis && (
                      <div><SectionLabel>Comparative Analysis</SectionLabel><p className="text-xs text-slate-300">{a.comparative_analysis}</p></div>
                    )}
                    {a.trend_commentary && (
                      <div><SectionLabel>Trend Commentary</SectionLabel><p className="text-xs text-slate-300">{a.trend_commentary}</p></div>
                    )}

                    <div className="flex justify-end pt-2 border-t border-slate-800 gap-2">
                      <PromoteToPlatformButton table="etf_fund_analyses" itemId={a.id} promotedStatus="promoted" onPromoted={refresh} />
                      <Button size="sm" variant="ghost" onClick={() => archive(a.id)} className="text-slate-400 hover:text-rose-300">
                        <X className="h-3 w-3 mr-1" /> Archive
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
