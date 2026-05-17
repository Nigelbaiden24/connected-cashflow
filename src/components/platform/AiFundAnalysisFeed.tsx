import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart as LineIcon, Loader2 } from "lucide-react";

interface Row {
  id: string;
  ticker: string;
  fund_name: string;
  fund_type: string | null;
  asset_class: string | null;
  region: string | null;
  summary: string | null;
  pros: any;
  cons: any;
  overall_score: number | null;
  trend_commentary: string | null;
  promoted_at: string;
}

export default function AiFundAnalysisFeed({ platform }: { platform: "finance" | "investor" }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("platform_fund_analyses")
        .select("*")
        .eq("status", "active")
        .or(`platform.eq.${platform},platform.eq.both,platform.is.null`)
        .order("overall_score", { ascending: false })
        .order("promoted_at", { ascending: false })
        .limit(40);
      setRows((data as Row[]) || []);
      setLoading(false);
    })();
  }, [platform]);

  return (
    <Card className="p-5 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <LineIcon className="w-5 h-5 text-sky-400" />
        <div>
          <h3 className="font-semibold text-base">AI Fund & ETF Analyses</h3>
          <p className="text-xs text-muted-foreground">Institutional-grade fund and ETF deep dives, promoted by the analyst desk.</p>
        </div>
      </div>
      {loading && <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin"/>Loading…</div>}
      {!loading && rows.length === 0 && <p className="text-sm text-muted-foreground">No AI analyses promoted yet.</p>}
      <div className="grid md:grid-cols-2 gap-3">
        {rows.map((r) => (
          <Card key={r.id} className="p-4 bg-slate-950/60 border-slate-800">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <div>
                <h4 className="font-bold text-base text-sky-300">{r.ticker}</h4>
                <p className="text-xs text-slate-400">{r.fund_name}</p>
              </div>
              {r.overall_score != null && (
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">Score {Number(r.overall_score).toFixed(1)}/5</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {r.fund_type && <Badge variant="outline" className="text-[10px]">{r.fund_type}</Badge>}
              {r.asset_class && <Badge variant="outline" className="text-[10px]">{r.asset_class}</Badge>}
              {r.region && <Badge variant="outline" className="text-[10px]">{r.region}</Badge>}
            </div>
            {r.summary && <p className="text-xs text-slate-200 line-clamp-3">{r.summary}</p>}
            {Array.isArray(r.pros) && r.pros.length > 0 && (
              <ul className="mt-2 text-[11px] text-emerald-300 space-y-0.5">{r.pros.slice(0,3).map((p:any,i:number)=><li key={i}>+ {String(p)}</li>)}</ul>
            )}
            {Array.isArray(r.cons) && r.cons.length > 0 && (
              <ul className="mt-1 text-[11px] text-rose-300 space-y-0.5">{r.cons.slice(0,3).map((c:any,i:number)=><li key={i}>− {String(c)}</li>)}</ul>
            )}
            <p className="text-[10px] text-slate-500 mt-2">Promoted {new Date(r.promoted_at).toLocaleDateString()}</p>
          </Card>
        ))}
      </div>
    </Card>
  );
}
