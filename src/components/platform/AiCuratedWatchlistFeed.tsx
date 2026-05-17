import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Activity, Loader2 } from "lucide-react";

interface Row {
  id: string;
  symbol: string;
  asset_name: string | null;
  asset_type: string | null;
  trigger_type: string | null;
  watchlist_reason: string | null;
  catalyst_summary: string | null;
  entry_risk_level: string | null;
  momentum_score: number | null;
  alert_urgency_score: number | null;
  confidence_score: number | null;
  signals: any;
  expires_at: string | null;
  promoted_at: string;
}

const riskTone = (r?: string | null) => ({
  low: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
  medium: "border-amber-500/40 text-amber-300 bg-amber-500/10",
  high: "border-orange-500/40 text-orange-300 bg-orange-500/10",
  extreme: "border-rose-500/40 text-rose-300 bg-rose-500/10",
}[r || "medium"] || "border-slate-600 text-slate-300");

export default function AiCuratedWatchlistFeed({ platform }: { platform: "finance" | "investor" }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("platform_curated_watchlist")
        .select("*")
        .eq("status", "active")
        .or(`platform.eq.${platform},platform.eq.both,platform.is.null`)
        .order("alert_urgency_score", { ascending: false })
        .order("promoted_at", { ascending: false })
        .limit(40);
      setRows((data as Row[]) || []);
      setLoading(false);
    })();
  }, [platform]);

  return (
    <Card className="p-5 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-amber-400" />
        <div>
          <h3 className="font-semibold text-base">AI Curated Watchlist</h3>
          <p className="text-xs text-muted-foreground">Real-time tickers surfaced and promoted by the analyst engine.</p>
        </div>
      </div>
      {loading && <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin"/>Loading…</div>}
      {!loading && rows.length === 0 && <p className="text-sm text-muted-foreground">No AI-curated tickers yet. New picks appear here as soon as an admin promotes them.</p>}
      <div className="grid md:grid-cols-2 gap-3">
        {rows.map((r) => (
          <Card key={r.id} className="p-4 bg-slate-950/60 border-slate-800 hover:border-amber-500/40 transition">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <div>
                <h4 className="font-bold text-lg text-amber-300">{r.symbol}</h4>
                {r.asset_name && <p className="text-xs text-slate-400">{r.asset_name}</p>}
              </div>
              <Badge variant="outline" className={`text-[10px] ${riskTone(r.entry_risk_level)}`}>Risk: {r.entry_risk_level || "—"}</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {r.trigger_type && <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 text-[10px]">{r.trigger_type}</Badge>}
              {r.momentum_score != null && <Badge variant="outline" className="border-violet-500/40 text-violet-300 text-[10px]">Momentum {r.momentum_score}/5</Badge>}
              {r.alert_urgency_score != null && <Badge variant="outline" className="border-rose-500/40 text-rose-300 text-[10px] flex items-center gap-1"><Activity className="w-3 h-3"/>Urgency {r.alert_urgency_score}/5</Badge>}
            </div>
            {r.catalyst_summary && <p className="text-xs text-slate-200 mt-1">{r.catalyst_summary}</p>}
            <p className="text-[10px] text-slate-500 mt-2">Promoted {new Date(r.promoted_at).toLocaleDateString()}</p>
          </Card>
        ))}
      </div>
    </Card>
  );
}
