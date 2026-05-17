import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, Play, Loader2, Trash2, Activity } from "lucide-react";
import PromoteToPlatformButton from "./PromoteToPlatformButton";

interface Entry {
  id: string;
  symbol: string;
  asset_name: string | null;
  asset_type: string;
  trigger_type: string;
  watchlist_reason: string | null;
  entry_risk_level: string;
  momentum_score: number;
  catalyst_summary: string | null;
  support_resistance: string | null;
  alert_urgency_score: number;
  signals: any[];
  confidence_score: number;
  status: string;
  expires_at: string | null;
  created_at: string;
}

const riskColor = (r: string) => ({
  low: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
  medium: "border-amber-500/40 text-amber-300 bg-amber-500/10",
  high: "border-orange-500/40 text-orange-300 bg-orange-500/10",
  extreme: "border-rose-500/40 text-rose-300 bg-rose-500/10",
}[r] || "border-slate-600 text-slate-300");

const triggerLabel: Record<string, string> = {
  volatility_spike: "Volatility ⚡",
  unusual_volume: "Volume 📊",
  earnings: "Earnings 📈",
  technical_breakout: "Breakout 🚀",
  insider_trading: "Insider 🕵️",
  social_sentiment: "Social 💬",
  institutional_accumulation: "Institutional 🏦",
  macro_catalyst: "Macro 🌍",
};

export default function DynamicWatchlistPanel() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<"active" | "expired" | "removed">("active");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("analyst_dynamic_watchlist")
      .select("*")
      .order("alert_urgency_score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);
    setEntries((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyst-dynamic-watchlist", { body: {} });
      if (error) throw error;
      toast({ title: "Watchlist updated", description: `Added ${data?.count || 0} entries.` });
      await load();
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally { setRunning(false); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("analyst_dynamic_watchlist")
      .update({ status: "removed", reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Removed" }); await load(); }
  };

  const filtered = entries.filter((e) => e.status === filter);

  return (
    <Card className="p-5 bg-slate-900/60 border-slate-700 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" /> Dynamic AI Watchlist
          </h3>
          <p className="text-xs text-muted-foreground">Auto-curated tickers from volatility, volume, earnings, breakouts, insider, sentiment, institutional, macro signals.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-slate-950/60 border border-slate-800 p-1">
            {(["active", "expired", "removed"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-2 py-1 rounded ${filter === f ? "bg-amber-500/20 text-amber-300" : "text-slate-400 hover:text-slate-200"}`}>
                {f} ({entries.filter((e) => e.status === f).length})
              </button>
            ))}
          </div>
          <Button onClick={refresh} disabled={running} className="bg-gradient-to-r from-amber-600 to-orange-600">
            {running ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
            Refresh watchlist
          </Button>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No {filter} entries. Click "Refresh watchlist" to generate.</p>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((e) => (
          <Card key={e.id} className="p-4 bg-slate-950/60 border-slate-800 hover:border-amber-500/40 transition">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-bold text-lg text-amber-300">{e.symbol}</h4>
                  {e.asset_name && <span className="text-xs text-slate-400">{e.asset_name}</span>}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 text-[10px]">{triggerLabel[e.trigger_type] || e.trigger_type}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${riskColor(e.entry_risk_level)}`}>Risk: {e.entry_risk_level}</Badge>
                  <Badge variant="outline" className="border-violet-500/40 text-violet-300 text-[10px]">Momentum {e.momentum_score}/5</Badge>
                  <Badge variant="outline" className="border-rose-500/40 text-rose-300 text-[10px] flex items-center gap-1"><Activity className="w-3 h-3"/>Urgency {e.alert_urgency_score}/5</Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 text-[10px]">Conf {e.confidence_score}/5</Badge>
                </div>
              </div>
              {e.status === "active" && (
                <div className="flex items-center gap-1">
                  <PromoteToPlatformButton table="analyst_dynamic_watchlist" itemId={e.id} promotedStatus="promoted" rpcName="promote_analyst_watchlist_entry" platforms={["finance"]} onPromoted={() => refresh()} />
                  <Button size="icon" variant="ghost" onClick={() => remove(e.id)} className="text-rose-300 hover:bg-rose-500/10 h-8 w-8">
                    <Trash2 className="w-4 h-4"/>
                  </Button>
                </div>
              )}
            </div>

            {e.watchlist_reason && <p className="text-sm text-slate-200 mt-2">{e.watchlist_reason}</p>}

            {e.catalyst_summary && (
              <div className="mt-2 p-2 rounded bg-cyan-500/5 border border-cyan-500/20">
                <p className="text-[10px] uppercase tracking-wider text-cyan-300 font-semibold mb-1">Catalyst</p>
                <p className="text-xs text-slate-200">{e.catalyst_summary}</p>
              </div>
            )}

            {e.support_resistance && (
              <div className="mt-2 p-2 rounded bg-violet-500/5 border border-violet-500/20">
                <p className="text-[10px] uppercase tracking-wider text-violet-300 font-semibold mb-1">Support / Resistance</p>
                <p className="text-xs text-slate-200">{e.support_resistance}</p>
              </div>
            )}

            {Array.isArray(e.signals) && e.signals.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-[11px] text-slate-300">
                {e.signals.slice(0, 4).map((s: any, i: number) => <li key={i}>• {String(s)}</li>)}
              </ul>
            )}

            <p className="text-[10px] text-slate-500 mt-2">
              Added {new Date(e.created_at).toLocaleDateString()} {e.expires_at && `· expires ${new Date(e.expires_at).toLocaleDateString()}`}
            </p>
          </Card>
        ))}
      </div>
    </Card>
  );
}
