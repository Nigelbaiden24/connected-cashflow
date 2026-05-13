import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Compass, Loader2, RefreshCw, Gem, Rocket, TrendingUp, Shield, Coins, X } from "lucide-react";
import PromoteToPlatformButton from "./PromoteToPlatformButton";

interface Discovery {
  id: string;
  symbol: string;
  asset_name: string | null;
  asset_type: string | null;
  discovery_bucket: string;
  sector: string | null;
  valuation_metrics: any;
  momentum_metrics: any;
  dividend_metrics: any;
  earnings_growth: any;
  analyst_sentiment: any;
  volatility_metrics: any;
  institutional_ownership: any;
  sector_performance: any;
  thesis: string | null;
  catalysts: any;
  risks: any;
  score: number;
  conviction: string;
  status: string;
  created_at: string;
}

const BUCKETS = [
  { id: "all", label: "All", icon: Compass, color: "text-slate-300" },
  { id: "undervalued", label: "Undervalued", icon: Gem, color: "text-emerald-300" },
  { id: "breakout", label: "Breakout", icon: Rocket, color: "text-orange-300" },
  { id: "high_growth", label: "High Growth", icon: TrendingUp, color: "text-violet-300" },
  { id: "defensive", label: "Defensive", icon: Shield, color: "text-sky-300" },
  { id: "high_yield", label: "High Yield", icon: Coins, color: "text-amber-300" },
];

const CONVICTION_COLOR: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-300",
  medium: "bg-blue-500/20 text-blue-300",
  high: "bg-emerald-500/20 text-emerald-300",
  very_high: "bg-fuchsia-500/20 text-fuchsia-300",
};

export default function DiscoveryEnginePanel() {
  const { toast } = useToast();
  const [items, setItems] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [bucket, setBucket] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("discovery_engine_results")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(120);
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    else setItems((data as Discovery[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const refresh = async (focus?: string) => {
    setRefreshing(focus ?? "all");
    try {
      const { data, error } = await supabase.functions.invoke("analyst-discovery-engine", {
        body: focus && focus !== "all" ? { focus } : {},
      });
      if (error) throw error;
      toast({ title: "Discoveries generated", description: `${data?.count ?? 0} new ideas surfaced.` });
      await load();
    } catch (e: any) {
      toast({ title: "Generation failed", description: e?.message ?? "Try again", variant: "destructive" });
    } finally {
      setRefreshing(null);
    }
  };

  const archive = async (id: string) => {
    const { error } = await supabase.from("discovery_engine_results").update({ status: "archived" }).eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else setItems((prev) => prev.filter((d) => d.id !== id));
  };

  const filtered = useMemo(
    () => bucket === "all" ? items : items.filter((d) => d.discovery_bucket === bucket),
    [items, bucket]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    items.forEach((d) => { c[d.discovery_bucket] = (c[d.discovery_bucket] || 0) + 1; });
    return c;
  }, [items]);

  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-fuchsia-500/20"><Compass className="h-5 w-5 text-fuchsia-300" /></div>
          <div>
            <h3 className="text-lg font-semibold text-white">Dynamic Discovery Engine</h3>
            <p className="text-xs text-slate-400">Surfaces undervalued, breakout, high-growth, defensive & high-yield ideas across sectors.</p>
          </div>
        </div>
        <Button onClick={() => refresh(bucket === "all" ? undefined : bucket)} disabled={!!refreshing} size="sm" className="bg-fuchsia-600 hover:bg-fuchsia-700">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Discover {bucket !== "all" ? `(${bucket})` : "all"}</span>
        </Button>
      </div>

      <Tabs value={bucket} onValueChange={setBucket} className="mb-4">
        <TabsList className="bg-slate-800/60 flex-wrap h-auto">
          {BUCKETS.map((b) => {
            const Icon = b.icon;
            return (
              <TabsTrigger key={b.id} value={b.id} className="data-[state=active]:bg-slate-700">
                <Icon className={`h-3 w-3 mr-1 ${b.color}`} />
                {b.label}
                {counts[b.id] != null && <span className="ml-1 text-[10px] opacity-60">({counts[b.id]})</span>}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No discoveries yet. Click "Discover" to surface ideas.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((d) => {
            const meta = BUCKETS.find((b) => b.id === d.discovery_bucket) ?? BUCKETS[0];
            const Icon = meta.icon;
            const sentiment = d.analyst_sentiment?.sentiment;
            const upside = d.analyst_sentiment?.upside_pct;
            return (
              <div key={d.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`h-4 w-4 ${meta.color} flex-shrink-0`} />
                    <span className="font-mono font-bold text-white">{d.symbol}</span>
                    <span className="text-xs text-slate-400 truncate">{d.asset_name}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="outline" className={`${meta.color} border-current/30 text-[10px]`}>{meta.label}</Badge>
                    <Badge className={CONVICTION_COLOR[d.conviction] ?? ""}>{d.conviction}</Badge>
                    <PromoteToPlatformButton table="discovery_engine_results" itemId={d.id} promotedStatus="promoted" onPromoted={() => refresh()} />
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => archive(d.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 text-[10px] mb-2">
                  {d.sector && <Badge variant="outline" className="border-slate-700 text-slate-300">{d.sector}</Badge>}
                  <Badge variant="outline" className="border-slate-700 text-slate-300">Score {Number(d.score).toFixed(1)}/5</Badge>
                  {d.valuation_metrics?.pe_ratio != null && <Badge variant="outline" className="border-slate-700 text-slate-300">P/E {d.valuation_metrics.pe_ratio}</Badge>}
                  {d.dividend_metrics?.yield_pct != null && <Badge variant="outline" className="border-amber-500/30 text-amber-300">Yield {d.dividend_metrics.yield_pct}%</Badge>}
                  {d.earnings_growth?.eps_growth_yoy_pct != null && <Badge variant="outline" className="border-violet-500/30 text-violet-300">EPS Δ {d.earnings_growth.eps_growth_yoy_pct}%</Badge>}
                  {d.momentum_metrics?.three_month_return_pct != null && <Badge variant="outline" className="border-orange-500/30 text-orange-300">3M {d.momentum_metrics.three_month_return_pct}%</Badge>}
                  {upside != null && <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">Upside {upside}%</Badge>}
                  {sentiment && <Badge variant="outline" className="border-sky-500/30 text-sky-300">{sentiment}</Badge>}
                </div>

                {d.thesis && <p className="text-xs text-slate-300 mb-2">{d.thesis}</p>}

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {Array.isArray(d.catalysts) && d.catalysts.length > 0 && (
                    <div>
                      <div className="text-emerald-400 font-semibold mb-1">Catalysts</div>
                      <ul className="text-slate-400 space-y-0.5">{d.catalysts.slice(0, 3).map((c: string, i: number) => <li key={i}>+ {c}</li>)}</ul>
                    </div>
                  )}
                  {Array.isArray(d.risks) && d.risks.length > 0 && (
                    <div>
                      <div className="text-rose-400 font-semibold mb-1">Risks</div>
                      <ul className="text-slate-400 space-y-0.5">{d.risks.slice(0, 3).map((r: string, i: number) => <li key={i}>− {r}</li>)}</ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
