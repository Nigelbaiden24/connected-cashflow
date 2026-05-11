import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek } from "date-fns";

type Mode = "picks" | "score_stocks" | "score_funds";

interface Props {
  mode: Mode;
  title: string;
  description: string;
  count?: number;
  onComplete?: () => void;
}

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

const storageKey = (mode: Mode) => `ai_elite_picks_auto_${mode}`;
const lastRunKey = (mode: Mode) => `ai_elite_picks_last_${mode}`;

async function applyResult(mode: Mode, data: any) {
  if (mode === "picks") {
    const aiPicks: any[] = data?.picks ?? [];
    if (!aiPicks.length) throw new Error("AI returned no picks");
    const ws = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const we = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const rows = aiPicks.map((p, i) => ({
      asset_type: p.kind === "fund" ? "fund" : p.kind === "crypto" ? "crypto" : "stock",
      asset_id: p.id,
      asset_name: p.name,
      asset_symbol: p.symbol ?? null,
      analyst_rating: ["strong_buy","buy","hold","sell","strong_sell"].includes(p.analyst_rating) ? p.analyst_rating : "buy",
      conviction_score: Math.max(1, Math.min(10, Number(p.conviction_score) || 7)),
      investment_thesis: [p.investment_thesis, p.why_picked && `\n\nWhy picked: ${p.why_picked}`].filter(Boolean).join(""),
      key_catalysts: Array.isArray(p.key_catalysts) ? p.key_catalysts : [],
      risk_factors: Array.isArray(p.risk_factors) ? p.risk_factors : [],
      time_horizon: ["short_term","medium_term","long_term"].includes(p.time_horizon) ? p.time_horizon : "medium_term",
      sector: p.sector ?? null,
      week_start_date: ws,
      week_end_date: we,
      display_order: i + 1,
      is_active: true,
    }));
    const { error } = await supabase.from("featured_analyst_picks").insert(rows as any);
    if (error) throw error;
    return rows.length;
  }

  const scores: any[] = data?.scores ?? [];
  if (!scores.length) throw new Error("AI returned no scores");
  const table = mode === "score_stocks" ? "stocks_crypto" : "fund_analyst_activity";
  let updated = 0;
  for (const s of scores) {
    const thesis = [s.investment_thesis, s.why_picked && `\n\nWhy picked: ${s.why_picked}`].filter(Boolean).join("");
    const payload: any = {
      analyst_rating: s.analyst_rating ?? null,
      overall_score: typeof s.overall_score === "number" ? s.overall_score : null,
      investment_thesis: thesis || null,
      strengths: s.strengths ?? null,
      risks: s.risks ?? null,
    };
    if (mode === "score_stocks") {
      Object.assign(payload, {
        score_fundamentals: s.score_fundamentals ?? null,
        score_technicals: s.score_technicals ?? null,
        score_momentum: s.score_momentum ?? null,
        score_risk: s.score_risk ?? null,
      });
    } else {
      Object.assign(payload, {
        score_fundamentals: s.score_fundamentals ?? null,
        score_performance: s.score_performance ?? null,
        score_risk: s.score_risk ?? null,
        score_cost: s.score_cost ?? null,
        score_esg: s.score_esg ?? null,
      });
    }
    const { error } = await supabase.from(table as any).update(payload).eq("id", s.id);
    if (!error) updated++;
  }
  return updated;
}

export function AIElitePicksPanel({ mode, title, description, count = 5, onComplete }: Props) {
  const [running, setRunning] = useState(false);
  const [autoOn, setAutoOn] = useState<boolean>(() => localStorage.getItem(storageKey(mode)) === "1");
  const [lastRun, setLastRun] = useState<string | null>(() => localStorage.getItem(lastRunKey(mode)));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = async (silent = false) => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-finance-picks", { body: { mode, count } });
      if (error) throw error;
      if (!(data as any)?.ok) throw new Error((data as any)?.error ?? "AI run failed");
      const n = await applyResult(mode, data);
      const ts = new Date().toISOString();
      localStorage.setItem(lastRunKey(mode), ts);
      setLastRun(ts);
      if (!silent) toast.success(`AI ${mode === "picks" ? "picked" : "scored"} ${n} items (universe ${(data as any).universe_size})`);
      onComplete?.();
    } catch (e: any) {
      if (!silent) toast.error(e.message ?? "AI run failed");
      console.error("AIElitePicksPanel", mode, e);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (!autoOn) return;
    const last = lastRun ? new Date(lastRun).getTime() : 0;
    const elapsed = Date.now() - last;
    const initial = Math.max(5_000, SIX_HOURS_MS - elapsed);
    const t = setTimeout(() => {
      run(true);
      timerRef.current = setInterval(() => run(true), SIX_HOURS_MS);
    }, initial);
    return () => { clearTimeout(t); if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOn]);

  const toggleAuto = (on: boolean) => {
    setAutoOn(on);
    localStorage.setItem(storageKey(mode), on ? "1" : "0");
    toast.message(on ? "Auto-run enabled (every 6 hours)" : "Auto-run disabled");
  };

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50/60 to-orange-50/40">
      <CardContent className="pt-5 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <Badge variant="outline" className="text-xs">Elite AI · 0–5 scoring</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
              {lastRun && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Last run {new Date(lastRun).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-amber-200">
              <span className="text-xs font-medium">Auto every 6h</span>
              <Switch checked={autoOn} onCheckedChange={toggleAuto} />
            </div>
            <Button onClick={() => run(false)} disabled={running} className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Run AI Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
