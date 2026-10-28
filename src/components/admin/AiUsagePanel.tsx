import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw, Gauge, ShieldCheck, Power, Timer } from "lucide-react";
import { toast } from "sonner";
import {
  type AiBudget, type AiUsageRow, type AutomationJob, DEFAULT_AI_BUDGET,
  autoScraperEnabled, describeSchedule, loadAiBudget, loadAiUsage, loadAutomationJobs, saveAiBudget,
  setAllAutomation, setAutomationJob, setAutoScraperEnabled,
} from "@/lib/aiUsage";

const todayUtc = () => new Date().toISOString().slice(0, 10);

function sumBy(rows: AiUsageRow[], provider: AiUsageRow["provider"]) {
  return rows.filter((r) => r.provider === provider).reduce(
    (a, r) => ({ calls: a.calls + r.calls, cached: a.cached + r.cached, blocked: a.blocked + r.blocked, failed: a.failed + r.failed }),
    { calls: 0, cached: 0, blocked: 0, failed: 0 },
  );
}

export function AiUsagePanel() {
  const [rows, setRows] = useState<AiUsageRow[]>([]);
  const [budget, setBudget] = useState<AiBudget>(DEFAULT_AI_BUDGET);
  const [autoOn, setAutoOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [missing, setMissing] = useState(false);
  const [jobs, setJobs] = useState<AutomationJob[] | null>(null);
  const [jobBusy, setJobBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [b, a] = await Promise.all([loadAiBudget(), autoScraperEnabled()]);
      setBudget(b);
      setAutoOn(a);
      loadAutomationJobs().then(setJobs).catch(() => setJobs(null));
      try {
        setRows(await loadAiUsage(14));
        setMissing(false);
      } catch {
        setMissing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const today = useMemo(() => rows.filter((r) => r.day === todayUtc()), [rows]);
  const ai = sumBy(today, "ai");
  const fc = sumBy(today, "firecrawl");

  const byFn = useMemo(() => {
    const m = new Map<string, { fn: string; ai: number; firecrawl: number; cached: number; blocked: number; failed: number; tokens: number }>();
    for (const r of rows) {
      const e = m.get(r.fn) ?? { fn: r.fn, ai: 0, firecrawl: 0, cached: 0, blocked: 0, failed: 0, tokens: 0 };
      if (r.provider === "ai") e.ai += r.calls;
      if (r.provider === "firecrawl") e.firecrawl += r.calls;
      e.cached += r.cached; e.blocked += r.blocked; e.failed += r.failed;
      e.tokens += r.prompt_tokens + r.completion_tokens;
      m.set(r.fn, e);
    }
    return [...m.values()].sort((a, b) => b.ai + b.firecrawl - (a.ai + a.firecrawl));
  }, [rows]);

  const daily = useMemo(() => {
    const m = new Map<string, { day: string; ai: number; firecrawl: number; cached: number }>();
    for (const r of rows) {
      const e = m.get(r.day) ?? { day: r.day, ai: 0, firecrawl: 0, cached: 0 };
      if (r.provider === "ai") e.ai += r.calls;
      if (r.provider === "firecrawl") e.firecrawl += r.calls;
      e.cached += r.cached;
      m.set(r.day, e);
    }
    return [...m.values()].sort((a, b) => b.day.localeCompare(a.day));
  }, [rows]);

  const save = async () => {
    setSaving(true);
    try {
      await saveAiBudget(budget);
      toast.success("AI budget saved");
    } catch (e: any) {
      toast.error(e.message ?? "Could not save budget");
    } finally {
      setSaving(false);
    }
  };

  const toggleAuto = async (on: boolean) => {
    try {
      await setAutoScraperEnabled(on);
      setAutoOn(on);
      toast.success(on ? "Scheduled scraping switched on" : "Scheduled scraping switched off");
    } catch (e: any) {
      toast.error(e.message ?? "Could not change the switch");
    }
  };

  const toggleJob = async (jobname: string, on: boolean) => {
    setJobBusy(jobname);
    try {
      if (jobname === "*") {
        const n = await setAllAutomation(on);
        toast.success(on ? `${n} automatic jobs switched on` : `All ${n} automatic jobs switched off`);
      } else {
        await setAutomationJob(jobname, on);
        toast.success(on ? "Job switched on" : "Job switched off");
      }
      setJobs(await loadAutomationJobs());
    } catch (e: any) {
      toast.error(e.message ?? "Could not change the job");
    } finally {
      setJobBusy(null);
    }
  };

  const pct = (used: number, cap: number) => Math.min(100, cap > 0 ? Math.round((used / cap) * 100) : 0);
  const savedShare = (s: { calls: number; cached: number }) =>
    s.calls + s.cached > 0 ? Math.round((s.cached / (s.calls + s.cached)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2"><Gauge className="h-6 w-6" /> AI usage &amp; budget</h2>
          <p className="text-sm text-muted-foreground">Every AI and Firecrawl call made by the platform, with cache savings and the daily spending limit.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {missing && (
        <Card className="border-amber-500/50">
          <CardContent className="pt-6 text-sm">
            Usage logging isn't live yet: the database migration <code>20261026210000_ai_usage_metering.sql</code> still needs applying.
            The budget and switch below already work.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>AI calls today (UTC)</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{ai.calls}<span className="text-base text-muted-foreground"> / {budget.daily_ai_calls}</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={pct(ai.calls, budget.daily_ai_calls)} />
            <p className="text-xs text-muted-foreground">{ai.cached} served from cache · {ai.blocked} blocked · {ai.failed} failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Firecrawl calls today (UTC)</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{fc.calls}<span className="text-base text-muted-foreground"> / {budget.daily_firecrawl_calls}</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={pct(fc.calls, budget.daily_firecrawl_calls)} />
            <p className="text-xs text-muted-foreground">{savedShare(fc)}% saved by the cache · {fc.blocked} blocked · {fc.failed} failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1"><Power className="h-3.5 w-3.5" /> Scheduled scraping</CardDescription>
            <CardTitle className="text-xl">{autoOn ? "On" : "Off"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch checked={autoOn} onCheckedChange={toggleAuto} id="auto-scraper" />
              <Label htmlFor="auto-scraper" className="text-sm">Master switch for every timed scraper</Label>
            </div>
            <p className="text-xs text-muted-foreground">Off stops all cron and browser auto-runs. Buttons you press by hand still work.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-lg flex items-center gap-2"><Timer className="h-5 w-5" /> Automatic jobs</CardTitle>
            <CardDescription>Timed jobs that run on their own and can spend AI credits. All start off; nothing runs until you switch it on here.</CardDescription>
          </div>
          {jobs && jobs.length > 0 && (
            <Button variant="outline" size="sm" disabled={jobBusy !== null || !jobs.some((j) => j.scheduled)} onClick={() => toggleJob("*", false)}>
              Switch all off
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {jobs === null ? (
            <p className="text-sm text-muted-foreground">
              Not live yet: the database migration <code>20261028120000_automation_switchboard.sql</code> needs applying.
            </p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No automatic jobs saved.</p>
          ) : (
            <div className="divide-y">
              {jobs.map((j) => (
                <div key={j.jobname} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">{j.label ?? j.jobname}</span>
                      <Badge variant="secondary" className="text-[10px]">{describeSchedule(j.schedule)}</Badge>
                      {j.uses_ai && <Badge variant="outline" className="text-[10px]">uses AI</Badge>}
                      {j.enabled !== j.scheduled && <Badge variant="destructive" className="text-[10px]">out of sync, switch again</Badge>}
                    </div>
                    {j.description && <p className="text-xs text-muted-foreground mt-0.5">{j.description}</p>}
                  </div>
                  <Switch
                    checked={j.scheduled}
                    disabled={jobBusy !== null}
                    onCheckedChange={(v) => toggleJob(j.jobname, v)}
                    aria-label={`Run ${j.label ?? j.jobname} automatically`}
                  />
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Scheduled scraping (above) and Market Pulse's operating mode are extra switches inside some jobs; turn those on too for a job to do work.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Daily limit</CardTitle>
          <CardDescription>Once a limit is reached, further calls that day are refused with a clear message instead of spending credits.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={budget.enabled} onCheckedChange={(v) => setBudget({ ...budget, enabled: v })} id="budget-on" />
            <Label htmlFor="budget-on">Enforce limits</Label>
          </div>
          <div className="space-y-1">
            <Label htmlFor="ai-cap">AI calls per day</Label>
            <Input id="ai-cap" type="number" min={1} className="w-36" value={budget.daily_ai_calls}
              onChange={(e) => setBudget({ ...budget, daily_ai_calls: Math.max(1, Number(e.target.value) || 1) })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fc-cap">Firecrawl calls per day</Label>
            <Input id="fc-cap" type="number" min={1} className="w-36" value={budget.daily_firecrawl_calls}
              onChange={(e) => setBudget({ ...budget, daily_firecrawl_calls: Math.max(1, Number(e.target.value) || 1) })} />
          </div>
          <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save limits</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">By function · last 14 days</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Function</TableHead>
                  <TableHead className="text-right">AI</TableHead>
                  <TableHead className="text-right">Firecrawl</TableHead>
                  <TableHead className="text-right">Cached</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byFn.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No calls recorded yet.</TableCell></TableRow>
                )}
                {byFn.map((r) => (
                  <TableRow key={r.fn}>
                    <TableCell className="font-mono text-xs">{r.fn}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.ai}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.firecrawl}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.cached}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.tokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {r.blocked > 0 && <Badge variant="secondary" className="mr-1">{r.blocked} blocked</Badge>}
                      {r.failed > 0 && <Badge variant="destructive">{r.failed} failed</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By day</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead className="text-right">AI</TableHead>
                  <TableHead className="text-right">Firecrawl</TableHead>
                  <TableHead className="text-right">Cached</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daily.map((d) => (
                  <TableRow key={d.day}>
                    <TableCell className="tabular-nums">{d.day}</TableCell>
                    <TableCell className="text-right tabular-nums">{d.ai}</TableCell>
                    <TableCell className="text-right tabular-nums">{d.firecrawl}</TableCell>
                    <TableCell className="text-right tabular-nums">{d.cached}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AiUsagePanel;
