import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Play, Loader2 } from "lucide-react";
import PromoteToPlatformButton from "./PromoteToPlatformButton";

interface Segment {
  id: string;
  target_user_id: string;
  primary_segment: string;
  secondary_segments: string[];
  segment_confidence: number;
  risk_tolerance: string | null;
  engagement_score: number;
  behavioural_signals: any;
  recommended_assets: any[];
  recommended_portfolios: any[];
  recommended_content: any[];
  recommended_alerts: any[];
  recommended_watchlists: any[];
  summary: string | null;
  updated_at: string;
}

const segLabel: Record<string, string> = {
  growth_investor: "Growth 📈",
  dividend_investor: "Dividend 💰",
  etf_investor: "ETF 🧺",
  risk_on_trader: "Risk-on ⚡",
  long_term_holder: "Long-term 🏛️",
  income_focused: "Income 💵",
};

const riskColor = (r: string | null) => ({
  conservative: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
  moderate: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10",
  aggressive: "border-amber-500/40 text-amber-300 bg-amber-500/10",
  speculative: "border-rose-500/40 text-rose-300 bg-rose-500/10",
}[r || "moderate"] || "border-slate-600 text-slate-300");

export default function InvestorSegmentsPanel() {
  const { toast } = useToast();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("investor_segments")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);
    setSegments((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyst-investor-segments", { body: {} });
      if (error) throw error;
      toast({ title: "Segmentation complete", description: `Profiled ${data?.processed || 0} users.` });
      await load();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally { setRunning(false); }
  };

  const segmentCounts = segments.reduce((acc: Record<string, number>, s) => {
    acc[s.primary_segment] = (acc[s.primary_segment] || 0) + 1; return acc;
  }, {});

  const filtered = filter === "all" ? segments : segments.filter((s) => s.primary_segment === filter);

  return (
    <Card className="p-5 bg-slate-900/60 border-slate-700 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-400" /> Investor Behaviour Segmentation
          </h3>
          <p className="text-xs text-muted-foreground">Behavioural profiling · personalized assets, portfolios, content, alerts, watchlists.</p>
        </div>
        <Button onClick={refresh} disabled={running} className="bg-gradient-to-r from-pink-600 to-rose-600">
          {running ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
          Run segmentation
        </Button>
      </div>

      {/* Segment summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        <button onClick={() => setFilter("all")}
          className={`p-2 rounded-lg border text-xs ${filter === "all" ? "border-pink-500/60 bg-pink-500/10 text-pink-300" : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200"}`}>
          All <span className="font-bold">({segments.length})</span>
        </button>
        {Object.entries(segLabel).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`p-2 rounded-lg border text-xs ${filter === k ? "border-pink-500/60 bg-pink-500/10 text-pink-300" : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200"}`}>
            {label} <span className="font-bold">({segmentCounts[k] || 0})</span>
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No segments. Click "Run segmentation".</p>
      )}

      <div className="space-y-3">
        {filtered.map((s) => (
          <Card key={s.id} className="p-4 bg-slate-950/60 border-slate-800">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="outline" className="border-pink-500/40 text-pink-300 bg-pink-500/10">{segLabel[s.primary_segment] || s.primary_segment}</Badge>
                  {s.secondary_segments?.map((sec: string) => (
                    <Badge key={sec} variant="outline" className="border-slate-600 text-slate-300 text-[10px]">{segLabel[sec] || sec}</Badge>
                  ))}
                  <Badge variant="outline" className={riskColor(s.risk_tolerance)}>Risk: {s.risk_tolerance}</Badge>
                  <Badge variant="outline" className="border-violet-500/40 text-violet-300">Engagement {s.engagement_score}/5</Badge>
                  <Badge variant="outline" className="border-cyan-500/40 text-cyan-300">Confidence {s.segment_confidence}/5</Badge>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">{s.target_user_id.slice(0, 8)}…</p>
              </div>
              <PromoteToPlatformButton table="investor_segments" itemId={s.id} promotedStatus="promoted" onPromoted={refresh} />
            </div>

            {s.summary && <p className="text-sm text-slate-200 mt-2 p-2 rounded bg-pink-500/5 border border-pink-500/20">{s.summary}</p>}

            <div className="grid md:grid-cols-2 gap-3 mt-3">
              {s.recommended_assets?.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold mb-2">Recommended Assets</p>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {s.recommended_assets.slice(0,5).map((a: any, i: number) => (
                      <li key={i}>• <strong>{a.ticker || a.name}</strong> <span className="text-slate-400">({a.type})</span> — {a.rationale}</li>
                    ))}
                  </ul>
                </div>
              )}
              {s.recommended_portfolios?.length > 0 && (
                <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                  <p className="text-[10px] uppercase tracking-wider text-cyan-300 font-semibold mb-2">Matching Portfolios</p>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {s.recommended_portfolios.slice(0,4).map((p: any, i: number) => (
                      <li key={i}>• <strong>{p.name}</strong> — {p.fit_reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              {s.recommended_content?.length > 0 && (
                <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                  <p className="text-[10px] uppercase tracking-wider text-violet-300 font-semibold mb-2">Educational Content</p>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {s.recommended_content.slice(0,4).map((c: any, i: number) => (
                      <li key={i}>• [{c.type}] <strong>{c.title}</strong> — {c.topic}</li>
                    ))}
                  </ul>
                </div>
              )}
              {s.recommended_alerts?.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold mb-2">Relevant Alerts</p>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {s.recommended_alerts.slice(0,4).map((a: any, i: number) => (
                      <li key={i}>• <strong>{a.trigger}</strong> — {a.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              {s.recommended_watchlists?.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 md:col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-rose-300 font-semibold mb-2">Suggested Watchlists</p>
                  <div className="flex flex-wrap gap-2">
                    {s.recommended_watchlists.slice(0,5).map((w: any, i: number) => (
                      <div key={i} className="px-2 py-1 rounded bg-slate-900/60 border border-slate-800 text-xs">
                        <strong className="text-rose-300">{w.name}</strong>
                        {Array.isArray(w.tickers) && w.tickers.length > 0 && (
                          <span className="text-slate-400 ml-1">{w.tickers.slice(0,5).join(", ")}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
