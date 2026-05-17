import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, Shield, TrendingUp, Layers } from "lucide-react";

interface Segment {
  id: string;
  primary_segment: string;
  secondary_segments: any;
  segment_confidence: number | null;
  behavioural_signals: any;
  risk_tolerance: string | null;
  engagement_score: number | null;
  recommended_assets: any;
  recommended_portfolios: any;
  recommended_content: any;
  recommended_alerts: any;
  recommended_watchlists: any;
  summary: string | null;
  promoted_at: string;
}

interface Props {
  platform: "finance" | "investor";
}

const accent = (p: "finance" | "investor") =>
  p === "finance"
    ? { ring: "from-blue-500/20 to-cyan-500/10", chip: "border-blue-500/40 text-blue-300", title: "text-blue-300", glow: "from-blue-600 to-cyan-600" }
    : { ring: "from-violet-500/20 to-fuchsia-500/10", chip: "border-violet-500/40 text-violet-300", title: "text-violet-300", glow: "from-violet-600 to-fuchsia-600" };

const arr = (v: any): any[] => (Array.isArray(v) ? v : []);

export default function InvestorSegmentsPage({ platform }: Props) {
  const a = accent(platform);
  const [rows, setRows] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("platform_investor_segments")
        .select("*")
        .eq("status", "active")
        .or(`platform.eq.${platform},platform.eq.both,platform.is.null`)
        .order("segment_confidence", { ascending: false })
        .order("promoted_at", { ascending: false })
        .limit(80);
      setRows((data as Segment[]) || []);
      setLoading(false);
    })();
  }, [platform]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className={`relative border-b border-slate-800 bg-gradient-to-br ${a.ring} backdrop-blur-xl`}>
        <div className="px-6 py-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${a.glow} shadow-lg`}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <Badge variant="outline" className={`uppercase tracking-wider text-[10px] ${a.chip}`}>AI Behavioural Intelligence</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Investor Segments</h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            AI-generated investor archetypes mapping behavioural signals, risk tolerance and engagement to recommended
            asset allocations, content tracks and watchlists.
          </p>
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto space-y-5">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading segments…
          </div>
        )}
        {!loading && rows.length === 0 && (
          <Card className="p-10 bg-slate-900/60 border-slate-800 text-center">
            <Layers className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No investor segments promoted yet. New AI archetypes appear here as soon as the analyst desk promotes them.</p>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {rows.map((s) => {
            const conf = Number(s.segment_confidence ?? 0);
            const pct = Math.min(100, (conf / 5) * 100);
            return (
              <Card key={s.id} className="p-5 bg-slate-900/70 border-slate-800 hover:border-slate-700 transition shadow-xl shadow-black/20">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className={`font-bold text-lg ${a.title}`}>{s.primary_segment}</h3>
                    {Array.isArray(s.secondary_segments) && s.secondary_segments.length > 0 && (
                      <p className="text-xs text-slate-400">also: {s.secondary_segments.slice(0, 3).map((x: any) => String(x)).join(", ")}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-500 tracking-wider">Confidence</p>
                    <p className="text-xl font-bold text-white tabular-nums">{conf.toFixed(1)}<span className="text-xs text-slate-500">/5</span></p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">
                  <div className={`h-full bg-gradient-to-r ${a.glow}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {s.risk_tolerance && <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-300 flex items-center gap-1"><Shield className="w-3 h-3"/>{s.risk_tolerance}</Badge>}
                  {s.engagement_score != null && <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-300 flex items-center gap-1"><TrendingUp className="w-3 h-3"/>Engagement {Number(s.engagement_score).toFixed(1)}/5</Badge>}
                </div>
                {s.summary && <p className="text-xs text-slate-200 leading-relaxed">{s.summary}</p>}

                {arr(s.recommended_assets).length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Recommended assets</p>
                    <div className="flex flex-wrap gap-1">{arr(s.recommended_assets).slice(0, 8).map((x: any, i: number) => <Badge key={i} variant="outline" className="text-[10px] border-slate-700 text-slate-200">{String(x?.symbol || x?.name || x)}</Badge>)}</div>
                  </div>
                )}
                {arr(s.recommended_portfolios).length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Recommended portfolios</p>
                    <div className="flex flex-wrap gap-1">{arr(s.recommended_portfolios).slice(0, 6).map((x: any, i: number) => <Badge key={i} variant="outline" className="text-[10px] border-slate-700 text-slate-200">{String(x?.name || x)}</Badge>)}</div>
                  </div>
                )}
                {arr(s.behavioural_signals).length > 0 && (
                  <ul className="mt-3 space-y-0.5 text-[11px] text-slate-300">
                    {arr(s.behavioural_signals).slice(0, 4).map((b: any, i: number) => <li key={i}>• {String(b?.label || b?.text || b)}</li>)}
                  </ul>
                )}
                <p className="text-[10px] text-slate-500 mt-3">Promoted {new Date(s.promoted_at).toLocaleDateString()}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
