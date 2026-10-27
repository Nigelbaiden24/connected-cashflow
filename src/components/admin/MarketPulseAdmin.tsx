import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Activity, Bot, ExternalLink, Eye, EyeOff, Hand, Loader2, Pin, PinOff, Radio, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type PulseConfig, type PulseItem, DEFAULT_PULSE_CONFIG, fmtPct, loadPulseConfig, loadPulseItems } from "@/lib/marketPulse";

const db = supabase as any;
const INTERVALS = [30, 60, 120, 240, 480, 720, 1440];
const intervalLabel = (m: number) => (m < 60 ? `${m} min` : m === 1440 ? "Daily" : `${m / 60} h`);

export function MarketPulseAdmin() {
  const qc = useQueryClient();
  const [cfg, setCfg] = useState<PulseConfig>(DEFAULT_PULSE_CONFIG);
  const [items, setItems] = useState<PulseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [running, setRunning] = useState<null | "all" | "movers">(null);
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, list] = await Promise.all([loadPulseConfig(), loadPulseItems(true)]);
      setCfg(c);
      setItems(list);
      setMissing(false);
    } catch (e) {
      if (/does not exist|schema cache/i.test((e as Error).message)) setMissing(true);
      else toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const save = async (patch: Partial<PulseConfig>) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("platform_config").upsert({ key: "market_pulse", value: next as any, updated_at: new Date().toISOString(), updated_by: user?.id ?? null });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["market-pulse-config"] });
    if (patch.mode) toast.success(patch.mode === "auto" ? `Autonomous: refreshes every ${intervalLabel(next.interval_minutes)}` : "Manual: nothing runs until you refresh");
  };

  const run = async (parts: Array<"movers" | "news">) => {
    setConfirm(false);
    setRunning(parts.length === 1 ? "movers" : "all");
    try {
      const { data, error } = await supabase.functions.invoke("market-pulse-refresh", { body: { parts } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const c = (data as any)?.counts ?? {};
      toast.success(`Refreshed: ${c.news ?? 0} news, ${c.trending ?? 0} trends, ${c.article ?? 0} reads, ${c.movers ?? 0} movers`);
      if ((data as any)?.errors?.length) toast.warning((data as any).errors[0]);
      qc.invalidateQueries({ queryKey: ["market-pulse"] });
      await load();
    } catch (e) {
      toast.error((e as Error).message || "Refresh failed");
    } finally {
      setRunning(null);
    }
  };

  const patchItem = async (it: PulseItem, patch: Partial<PulseItem>) => {
    setItems((xs) => xs.map((x) => (x.id === it.id ? { ...x, ...patch } : x)));
    const { error } = await db.from("market_pulse_items").update(patch).eq("id", it.id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["market-pulse"] });
  };

  if (missing) {
    return <Card><CardContent className="py-8 text-sm text-muted-foreground">Market Pulse isn't in the database yet. Apply migration <code>20261027170000_market_pulse.sql</code> and deploy <code>market-pulse-refresh</code>, then refresh.</CardContent></Card>;
  }

  const auto = cfg.mode === "auto";
  const nextRun = auto && cfg.last_run_at ? new Date(new Date(cfg.last_run_at).getTime() + cfg.interval_minutes * 60_000) : null;
  const byKind = (k: PulseItem["kind"]) => items.filter((i) => i.kind === k);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold"><Radio className="h-6 w-6 text-orange-500" /> Market Pulse</h2>
        <p className="text-muted-foreground">The investor sidebar (news, what's trending and why, helpful reads) and the movers ticker.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className={auto ? "border-emerald-300/60" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">{auto ? <Bot className="h-4 w-4 text-emerald-600" /> : <Hand className="h-4 w-4" />} Operating mode</span>
              <Badge variant={auto ? "default" : "secondary"} className={auto ? "bg-emerald-600" : ""}>{auto ? "Autonomous" : "Manual"}</Badge>
            </CardTitle>
            <CardDescription>
              Autonomous: AI and scraping refresh on a schedule by themselves. Manual: nothing runs until you press Refresh.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <Label htmlFor="pulse-auto" className="text-sm font-medium">Run autonomously</Label>
                <p className="text-xs text-muted-foreground">Uses Firecrawl searches and one AI call per refresh (counts towards the daily AI budget).</p>
              </div>
              <Switch id="pulse-auto" checked={auto} onCheckedChange={(v) => save({ mode: v ? "auto" : "manual" })} disabled={loading} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Refresh every</Label>
                <Select value={String(cfg.interval_minutes)} onValueChange={(v) => save({ interval_minutes: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INTERVALS.map((m) => <SelectItem key={m} value={String(m)}>{intervalLabel(m)}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">≈ {Math.round(1440 / cfg.interval_minutes)} refreshes a day in Autonomous mode.</p>
              </div>
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between"><Label htmlFor="pulse-sidebar">Show sidebar</Label><Switch id="pulse-sidebar" checked={cfg.sidebar_enabled} onCheckedChange={(v) => save({ sidebar_enabled: v })} /></div>
                <div className="flex items-center justify-between"><Label htmlFor="pulse-ticker">Show footer ticker</Label><Switch id="pulse-ticker" checked={cfg.ticker_enabled} onCheckedChange={(v) => save({ ticker_enabled: v })} /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4" /> Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Last refresh</span><span>{cfg.last_run_at ? `${formatDistanceToNow(new Date(cfg.last_run_at), { addSuffix: true })} (${cfg.last_trigger ?? "—"})` : "Never"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Result</span>
              <Badge variant="outline" className={cfg.last_status === "ok" ? "border-emerald-300 text-emerald-700" : cfg.last_status === "failed" ? "border-rose-300 text-rose-700" : ""}>{cfg.last_status ?? "—"}</Badge></div>
            {cfg.last_error && <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800">{cfg.last_error}</p>}
            <div className="flex justify-between"><span className="text-muted-foreground">Next automatic run</span><span>{auto ? (nextRun ? (nextRun.getTime() < Date.now() ? "within 15 min" : formatDistanceToNow(nextRun, { addSuffix: true })) : "within 15 min") : "Off (manual)"}</span></div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={() => setConfirm(true)} disabled={!!running}>
                {running === "all" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1.5 h-4 w-4" />} Refresh everything
              </Button>
              <Button variant="outline" onClick={() => run(["movers"])} disabled={!!running}>
                {running === "movers" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Activity className="mr-1.5 h-4 w-4" />} Prices only (no AI)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What investors see</CardTitle>
          <CardDescription>Hide anything unsuitable; pin items to keep them through refreshes.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
            <Tabs defaultValue="trending">
              <TabsList>
                <TabsTrigger value="trending">Trending ({byKind("trending").length})</TabsTrigger>
                <TabsTrigger value="news">News ({byKind("news").length})</TabsTrigger>
                <TabsTrigger value="article">Reads ({byKind("article").length})</TabsTrigger>
                <TabsTrigger value="mover">Movers ({byKind("mover").length})</TabsTrigger>
              </TabsList>
              {(["trending", "news", "article", "mover"] as const).map((k) => (
                <TabsContent key={k} value={k} className="mt-4">
                  {byKind(k).length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Nothing yet. Press Refresh.</p> : (
                    <div className="divide-y rounded-xl border">
                      {byKind(k).map((it) => (
                        <div key={it.id} className={`flex items-start gap-3 p-3 ${it.hidden ? "opacity-50" : ""}`}>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              {k === "mover" ? <>{it.symbol} <span className="text-muted-foreground">{it.title}</span> <span className="ml-2 text-xs tabular-nums">1D {fmtPct(it.changes?.["1d"] ?? null)}</span></> : it.title}
                            </p>
                            {(it.why || it.summary) && <p className="mt-0.5 text-xs text-muted-foreground">{it.why || it.summary}</p>}
                            <p className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                              {it.source}
                              {it.url && <a href={it.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline">open <ExternalLink className="h-3 w-3" /></a>}
                            </p>
                          </div>
                          <Button size="icon" variant="ghost" title={it.pinned ? "Unpin" : "Pin"} onClick={() => patchItem(it, { pinned: !it.pinned })}>
                            {it.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" title={it.hidden ? "Show" : "Hide"} onClick={() => patchItem(it, { hidden: !it.hidden })}>
                            {it.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refresh Market Pulse now?</AlertDialogTitle>
            <AlertDialogDescription>
              Runs about 5 Firecrawl searches and one AI call (Gemini Flash), which count towards the daily budget, and replaces the current news, trends and reads (pinned items stay).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => run(["movers", "news"])}>Refresh</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
