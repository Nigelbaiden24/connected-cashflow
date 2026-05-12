import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Bell, Loader2, RefreshCw, TrendingUp, TrendingDown, Activity, Zap, Newspaper, X } from "lucide-react";

interface Alert {
  id: string;
  symbol: string;
  asset_name: string | null;
  asset_type: string | null;
  alert_category: string;
  classification: string;
  confidence_score: number;
  urgency_rating: string;
  catalyst_explanation: string | null;
  actionable_summary: string | null;
  risk_disclaimer: string | null;
  signals: any;
  status: string;
  expires_at: string | null;
  created_at: string;
}

const CLASS_META: Record<string, { icon: any; color: string; label: string }> = {
  bullish: { icon: TrendingUp, color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", label: "Bullish" },
  bearish: { icon: TrendingDown, color: "bg-rose-500/15 text-rose-300 border-rose-500/30", label: "Bearish" },
  neutral: { icon: Activity, color: "bg-slate-500/15 text-slate-300 border-slate-500/30", label: "Neutral" },
  high_volatility: { icon: Zap, color: "bg-amber-500/15 text-amber-300 border-amber-500/30", label: "High Vol" },
  breaking_news: { icon: Newspaper, color: "bg-sky-500/15 text-sky-300 border-sky-500/30", label: "Breaking" },
};

const URGENCY_COLOR: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-300",
  medium: "bg-blue-500/20 text-blue-300",
  high: "bg-amber-500/20 text-amber-300",
  critical: "bg-rose-500/20 text-rose-300",
};

export default function RealtimeAlertsPanel() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"active" | "expired" | "all">("active");

  const load = async () => {
    setLoading(true);
    let q = supabase.from("realtime_investment_alerts").select("*").order("created_at", { ascending: false }).limit(80);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) toast({ title: "Failed to load alerts", description: error.message, variant: "destructive" });
    else setAlerts((data as Alert[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyst-realtime-alerts");
      if (error) throw error;
      toast({ title: "Alerts generated", description: `${data?.count ?? 0} new real-time alerts.` });
      await load();
    } catch (e: any) {
      toast({ title: "Generation failed", description: e?.message ?? "Try again", variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  };

  const dismiss = async (id: string) => {
    const { error } = await supabase.from("realtime_investment_alerts").update({ status: "dismissed" }).eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    alerts.forEach((a) => { c[a.classification] = (c[a.classification] || 0) + 1; });
    return c;
  }, [alerts]);

  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20"><Bell className="h-5 w-5 text-rose-300" /></div>
          <div>
            <h3 className="text-lg font-semibold text-white">Real-Time Investment Alerts</h3>
            <p className="text-xs text-slate-400">AI-generated alerts across price, volume, earnings, technical, insider, ETF flow, macro, options & sentiment.</p>
          </div>
        </div>
        <Button onClick={refresh} disabled={refreshing} size="sm" className="bg-rose-600 hover:bg-rose-700">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Generate alerts</span>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="bg-slate-800/60">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap gap-2">
          {Object.entries(counts).map(([k, v]) => {
            const m = CLASS_META[k];
            return <Badge key={k} variant="outline" className={m?.color ?? ""}>{m?.label ?? k}: {v}</Badge>;
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No alerts yet. Click "Generate alerts" to create real-time signals.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {alerts.map((a) => {
            const meta = CLASS_META[a.classification] ?? CLASS_META.neutral;
            const Icon = meta.icon;
            const signals: string[] = Array.isArray(a.signals) ? a.signals : [];
            return (
              <div key={a.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-white">{a.symbol}</span>
                    <span className="text-xs text-slate-400 truncate">{a.asset_name}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="outline" className={meta.color}><Icon className="h-3 w-3 mr-1" />{meta.label}</Badge>
                    {a.status === "active" && (
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => dismiss(a.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] mb-2">
                  <Badge variant="outline" className="border-slate-700 text-slate-300">{a.alert_category.replace(/_/g, " ")}</Badge>
                  <Badge className={URGENCY_COLOR[a.urgency_rating] ?? ""}>{a.urgency_rating} urgency</Badge>
                  <Badge variant="outline" className="border-slate-700 text-slate-300">conf {Number(a.confidence_score).toFixed(1)}/5</Badge>
                </div>
                {a.actionable_summary && <p className="text-sm text-white font-medium mb-1">{a.actionable_summary}</p>}
                {a.catalyst_explanation && <p className="text-xs text-slate-400 mb-2">{a.catalyst_explanation}</p>}
                {signals.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {signals.map((s, i) => <Badge key={i} variant="outline" className="text-[10px] border-slate-700 text-slate-400">{s}</Badge>)}
                  </div>
                )}
                {a.risk_disclaimer && <p className="text-[10px] text-slate-500 italic border-t border-slate-800 pt-2 mt-2">{a.risk_disclaimer}</p>}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
