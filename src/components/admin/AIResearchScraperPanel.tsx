import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Eye, CheckCircle2, Trash2, RefreshCw, Clock, Play, Pause, Plus, Bot, ChevronDown, Zap } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

type AssetType = "stock" | "crypto";

interface GeneratedReport {
  id: string;
  asset_type: AssetType;
  title: string;
  slug: string;
  ticker: string | null;
  excerpt: string | null;
  hero_image_url: string | null;
  html_content: string;
  pages: Array<{ title: string; html: string }> | null;
  page_count: number | null;
  report_date: string | null;
  ai_score: number | null;
  ai_tags: string[] | null;
  status: "draft" | "promoted" | "archived";
  sources: Array<{ url: string; title?: string | null }> | null;
  reading_time_minutes: number | null;
  created_at: string;
  promoted_at: string | null;
}

interface Schedule {
  id: string;
  asset_type: AssetType;
  topic: string;
  ticker: string | null;
  extra_urls: string[];
  frequency_hours: number;
  enabled: boolean;
  last_run_at: string | null;
  last_run_status: string | null;
  last_run_error: string | null;
  next_run_at: string;
}

interface Props {
  assetType: AssetType;
  title: string;
  description: string;
  iconGradient: string;
  Icon: React.ElementType;
}

const FREQ_OPTIONS = [
  { v: 1, l: "Every hour" },
  { v: 3, l: "Every 3 hours" },
  { v: 6, l: "Every 6 hours" },
  { v: 12, l: "Every 12 hours" },
  { v: 24, l: "Daily" },
  { v: 72, l: "Every 3 days" },
  { v: 168, l: "Weekly" },
];

export function AIResearchScraperPanel({ assetType, title, description, iconGradient, Icon }: Props) {
  // Manual generation form
  const [topic, setTopic] = useState("");
  const [ticker, setTicker] = useState("");
  const [extraUrls, setExtraUrls] = useState("");
  const [generating, setGenerating] = useState(false);

  // Reports queue
  const [items, setItems] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"draft" | "promoted" | "archived">("draft");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<GeneratedReport | null>(null);
  const [pageIdx, setPageIdx] = useState(0);

  // Schedules
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [newTicker, setNewTicker] = useState("");
  const [newFreq, setNewFreq] = useState(24);
  const [addingSched, setAddingSched] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [autopilotBusy, setAutopilotBusy] = useState(false);

  const autopilot = useMemo(
    () => schedules.find((s) => (s.topic || "").startsWith("__AUTOPILOT__")) ?? null,
    [schedules],
  );
  const autopilotCount = useMemo(() => {
    const m = autopilot?.topic?.match(/__AUTOPILOT__(?::(\d+))?/);
    return Math.min(5, Math.max(1, Number(m?.[1]) || 3));
  }, [autopilot]);
  const customSchedules = useMemo(
    () => schedules.filter((s) => !(s.topic || "").startsWith("__AUTOPILOT__")),
    [schedules],
  );

  const load = async () => {
    setLoading(true);
    const [reports, sched] = await Promise.all([
      supabase.from("generated_research_reports").select("*").eq("asset_type", assetType).order("created_at", { ascending: false }).limit(200),
      supabase.from("research_scraper_schedules").select("*").eq("asset_type", assetType).order("created_at", { ascending: false }),
    ]);
    if (reports.error) toast.error(reports.error.message);
    if (sched.error) toast.error(sched.error.message);
    setItems((reports.data ?? []) as unknown as GeneratedReport[]);
    setSchedules((sched.data ?? []) as unknown as Schedule[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [assetType]);

  // Auto-provision an AI Autopilot schedule on first load so scraping is never
  // dependent on a human entering topics. Manual scraping remains an option.
  useEffect(() => {
    if (loading) return;
    if (schedules.length === 0) {
      (async () => {
        const { data: u } = await supabase.auth.getUser();
        if (!u?.user) return;
        await supabase.from("research_scraper_schedules").insert({
          asset_type: assetType,
          topic: "__AUTOPILOT__:3",
          ticker: null,
          frequency_hours: 12,
          enabled: true,
          created_by: u.user.id,
          next_run_at: new Date(Date.now() + 60 * 1000).toISOString(),
        });
        await load();
      })();
    }
    // eslint-disable-next-line
  }, [loading]);

  const setAutopilotEnabled = async (enabled: boolean) => {
    setAutopilotBusy(true);
    try {
      if (autopilot) {
        const { error } = await supabase
          .from("research_scraper_schedules")
          .update({ enabled, next_run_at: enabled ? new Date(Date.now() + 60 * 1000).toISOString() : autopilot.next_run_at })
          .eq("id", autopilot.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        if (!u?.user) throw new Error("Not authenticated");
        const { error } = await supabase.from("research_scraper_schedules").insert({
          asset_type: assetType,
          topic: "__AUTOPILOT__:3",
          frequency_hours: 12,
          enabled,
          created_by: u.user.id,
          next_run_at: new Date(Date.now() + 60 * 1000).toISOString(),
        });
        if (error) throw error;
      }
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setAutopilotBusy(false); }
  };

  const updateAutopilot = async (patch: { frequency_hours?: number; count?: number }) => {
    if (!autopilot) return;
    const update: any = {};
    if (patch.frequency_hours) update.frequency_hours = patch.frequency_hours;
    if (patch.count) update.topic = `__AUTOPILOT__:${patch.count}`;
    const { error } = await supabase.from("research_scraper_schedules").update(update).eq("id", autopilot.id);
    if (error) return toast.error(error.message);
    await load();
  };

  const runAutopilotNow = async () => {
    if (!autopilot) return;
    setAutopilotBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("run-research-scraper-schedules", {
        body: { scheduleId: autopilot.id },
      });
      if (error) throw error;
      toast.success((data as any)?.message || "AI Autopilot started — drafts will appear in a minute or two.");
      // Refresh after a delay to pick up newly drafted reports
      setTimeout(() => { load(); }, 8000);
    } catch (e: any) { toast.error(e.message || "Autopilot failed"); }
    finally { setAutopilotBusy(false); }
  };

  const filtered = useMemo(() => items.filter((i) => i.status === tab), [items, tab]);

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error("Enter a topic, ticker, or company name");
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-research-report-ai", {
        body: {
          assetType, topic: topic.trim(), ticker: ticker.trim() || undefined,
          extraUrls: extraUrls.split(/[\n,]/).map((s) => s.trim()).filter((s) => /^https?:\/\//.test(s)),
        },
      });
      if (error) throw error;
      if (!(data as any)?.success) throw new Error((data as any)?.error || "Generation failed");
      toast.success(`Report drafted: ${(data as any).pageCount} pages from ${(data as any).sourceCount} sources`);
      setTopic(""); setTicker(""); setExtraUrls(""); setTab("draft");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally { setGenerating(false); }
  };

  const addSchedule = async () => {
    if (!newTopic.trim()) return toast.error("Enter a topic for the schedule");
    setAddingSched(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) throw new Error("Not authenticated");
      const { error } = await supabase.from("research_scraper_schedules").insert({
        asset_type: assetType,
        topic: newTopic.trim(),
        ticker: newTicker.trim() || null,
        frequency_hours: newFreq,
        enabled: true,
        created_by: u.user.id,
        next_run_at: new Date(Date.now() + 60 * 1000).toISOString(),
      });
      if (error) throw error;
      toast.success("Auto-scraper scheduled");
      setNewTopic(""); setNewTicker(""); setNewFreq(24);
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setAddingSched(false); }
  };

  const toggleSchedule = async (s: Schedule) => {
    const { error } = await supabase.from("research_scraper_schedules").update({ enabled: !s.enabled }).eq("id", s.id);
    if (error) return toast.error(error.message);
    await load();
  };
  const runScheduleNow = async (s: Schedule) => {
    const { error } = await supabase.from("research_scraper_schedules").update({ next_run_at: new Date().toISOString() }).eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Will run within 15 minutes (or trigger Run Due now)");
  };
  const deleteSchedule = async (id: string) => {
    if (!confirm("Delete this auto-scraper schedule?")) return;
    const { error } = await supabase.from("research_scraper_schedules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await load();
  };
  const runAllDueNow = async () => {
    const { data, error } = await supabase.functions.invoke("run-research-scraper-schedules", { body: {} });
    if (error) return toast.error(error.message);
    toast.success(`Processed ${(data as any)?.processed ?? 0} due schedule(s)`);
    await load();
  };

  const updateStatus = async (ids: string[], status: "promoted" | "archived" | "draft") => {
    const patch: any = { status };
    if (status === "promoted") {
      patch.promoted_at = new Date().toISOString();
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) patch.promoted_by = u.user.id;
    }
    const { error } = await supabase.from("generated_research_reports").update(patch).in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`${ids.length} report${ids.length > 1 ? "s" : ""} ${status}`);
    setSelected(new Set()); await load();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this report permanently?")) return;
    const { error } = await supabase.from("generated_research_reports").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); await load();
  };

  const toggleSel = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const previewPages = preview?.pages?.length ? preview.pages : (preview ? [{ title: preview.title, html: preview.html_content }] : []);

  return (
    <div className="space-y-6">
      {/* AI Autopilot — primary mode */}
      <Card className="relative overflow-hidden border-primary/30">
        <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${iconGradient} pointer-events-none`} />
        <CardHeader className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconGradient} shadow-lg`}>
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Autopilot
                  <Badge variant="secondary" className="gap-1"><Zap className="h-3 w-3" /> Always-on</Badge>
                </CardTitle>
                <CardDescription>
                  AI selects the most timely {assetType === "crypto" ? "digital-asset" : "equity"} topics, scrapes the web, and drafts enterprise reports — no manual input required.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{autopilot?.enabled ? "Enabled" : "Paused"}</span>
              <Switch
                checked={!!autopilot?.enabled}
                disabled={autopilotBusy}
                onCheckedChange={(v) => setAutopilotEnabled(!!v)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Cadence</label>
              <Select
                value={String(autopilot?.frequency_hours ?? 12)}
                onValueChange={(v) => updateAutopilot({ frequency_hours: Number(v) })}
                disabled={!autopilot}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQ_OPTIONS.map((o) => <SelectItem key={o.v} value={String(o.v)}>{o.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Reports per run</label>
              <Select
                value={String(autopilotCount)}
                onValueChange={(v) => updateAutopilot({ count: Number(v) })}
                disabled={!autopilot}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n} report{n>1?"s":""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={runAutopilotNow} disabled={!autopilot || autopilotBusy} className="w-full gap-2">
                {autopilotBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Run AI Autopilot Now
              </Button>
            </div>
          </div>
          {autopilot && (
            <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />
                {autopilot.last_run_at ? `Last run ${formatDistanceToNow(new Date(autopilot.last_run_at), { addSuffix: true })}` : "Awaiting first run"}
              </span>
              <span>·</span>
              <span>Next run {formatDistanceToNow(new Date(autopilot.next_run_at), { addSuffix: true })}</span>
              {autopilot.last_run_status === "error" && (
                <Badge variant="destructive">Last run failed: {autopilot.last_run_error?.slice(0, 80)}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual scrape (collapsed by default) */}
      <Card>
        <Collapsible open={manualOpen} onOpenChange={setManualOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/40 transition">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Manual Scrape (optional)</CardTitle>
                    <CardDescription>Override the AI and generate a one-off report for a specific topic.</CardDescription>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${manualOpen ? "rotate-180" : ""}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Topic / Company / Theme</label>
                  <Input placeholder={assetType === "crypto" ? "e.g. Ethereum L2 ecosystem 2026" : "e.g. NVIDIA AI infrastructure thesis"}
                    value={topic} onChange={(e) => setTopic(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Ticker (optional)</label>
                  <Input placeholder={assetType === "crypto" ? "ETH" : "NVDA"} value={ticker} onChange={(e) => setTicker(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Extra source URLs (optional, one per line — added to curated + broad web sweep)
                </label>
                <Textarea rows={2} value={extraUrls} onChange={(e) => setExtraUrls(e.target.value)} placeholder="https://..." />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleGenerate} disabled={generating} size="lg" className="gap-2">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? "Scraping + Generating multi-page report…" : "Manual Scrape & Generate Report"}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Custom auto schedules (pinned topics) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Pinned Auto-Scrape Topics</CardTitle>
            <CardDescription>Optional. Force the scraper to cover specific topics on a fixed cadence in addition to Autopilot.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={runAllDueNow} className="gap-1">
            <Play className="h-4 w-4" /> Run Due Now
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-[1fr_160px_180px_auto] gap-2 items-end p-3 border rounded-lg bg-muted/30">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Topic</label>
              <Input placeholder={assetType === "crypto" ? "Bitcoin halving cycle" : "S&P 500 earnings season"} value={newTopic} onChange={(e) => setNewTopic(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ticker</label>
              <Input placeholder="Optional" value={newTicker} onChange={(e) => setNewTicker(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Frequency</label>
              <Select value={String(newFreq)} onValueChange={(v) => setNewFreq(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQ_OPTIONS.map((o) => <SelectItem key={o.v} value={String(o.v)}>{o.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addSchedule} disabled={addingSched} className="gap-1">
              {addingSched ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
            </Button>
          </div>

          {customSchedules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No pinned topics. Autopilot is handling discovery automatically.</p>
          ) : (
            <div className="divide-y border rounded-lg">
              {customSchedules.map((s) => (
                <div key={s.id} className="p-3 flex items-center gap-3 flex-wrap">
                  <Switch checked={s.enabled} onCheckedChange={() => toggleSchedule(s)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{s.topic}</span>
                      {s.ticker && <Badge variant="secondary">{s.ticker}</Badge>}
                      <Badge variant="outline">{FREQ_OPTIONS.find((o) => o.v === s.frequency_hours)?.l ?? `${s.frequency_hours}h`}</Badge>
                      {s.last_run_status === "error" && <Badge variant="destructive">Last run failed</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {s.last_run_at ? `Last run ${formatDistanceToNow(new Date(s.last_run_at), { addSuffix: true })}` : "Never run"}
                      {" · "}Next run {formatDistanceToNow(new Date(s.next_run_at), { addSuffix: true })}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => runScheduleNow(s)} title="Queue for next cycle">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteSchedule(s.id)} title="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Report Queue</CardTitle>
            <CardDescription>Review AI-generated multi-page reports, then promote to {assetType === "crypto" ? "Crypto" : "Stock"} Research Reports on the Investor sidebar.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => { setTab(v as any); setSelected(new Set()); }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <TabsList>
                <TabsTrigger value="draft">Drafts ({items.filter((i) => i.status === "draft").length})</TabsTrigger>
                <TabsTrigger value="promoted">Promoted ({items.filter((i) => i.status === "promoted").length})</TabsTrigger>
                <TabsTrigger value="archived">Archived ({items.filter((i) => i.status === "archived").length})</TabsTrigger>
              </TabsList>
              {selected.size > 0 && (
                <div className="flex gap-2">
                  {tab === "draft" && (
                    <Button size="sm" onClick={() => updateStatus(Array.from(selected), "promoted")} className="gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Approve {selected.size}
                    </Button>
                  )}
                  {tab !== "archived" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(Array.from(selected), "archived")}>
                      Archive {selected.size}
                    </Button>
                  )}
                  {tab === "archived" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(Array.from(selected), "draft")}>
                      Restore {selected.size}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <TabsContent value={tab} className="mt-4">
              {loading ? (
                <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  {tab === "draft" ? "No drafts yet — generate one above or add an auto-scraper." : `No ${tab} reports.`}
                </div>
              ) : (
                <div className="divide-y border rounded-lg">
                  {filtered.map((r) => (
                    <div key={r.id} className="p-4 flex gap-3 items-start hover:bg-muted/40 transition">
                      <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleSel(r.id)} className="mt-1" />
                      {r.hero_image_url && (
                        <img src={r.hero_image_url} alt="" className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold truncate">{r.title}</h4>
                          {r.ticker && <Badge variant="secondary">{r.ticker}</Badge>}
                          <Badge variant="outline">{r.page_count ?? 1} pages</Badge>
                          {typeof r.ai_score === "number" && (
                            <Badge variant="outline" className="gap-1">★ {r.ai_score.toFixed(1)}/5</Badge>
                          )}
                        </div>
                        {r.excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{r.excerpt}</p>}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                          <span>{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                          <span>•</span>
                          <span>{r.sources?.length ?? 0} sources</span>
                          <span>•</span>
                          <span>{r.reading_time_minutes ?? 5} min read</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => { setPreview(r); setPageIdx(0); }} title="Preview">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {r.status === "draft" && (
                          <Button size="icon" variant="ghost" onClick={() => updateStatus([r.id], "promoted")} title="Promote">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => deleteItem(r.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 pb-3 border-b">
              <img src={flowpulseLogo} alt="FlowPulse" className="h-9 w-9 rounded object-contain" />
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">FlowPulse Research · {preview?.report_date ?? ""}</div>
                <DialogTitle className="text-left">{preview?.title}</DialogTitle>
              </div>
            </div>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              {preview.hero_image_url && (
                <img src={preview.hero_image_url} alt="" className="w-full h-56 object-cover rounded-lg" />
              )}
              <div className="flex gap-2 flex-wrap">
                {preview.ai_tags?.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
              {previewPages.length > 1 && (
                <div className="flex items-center justify-between gap-2 sticky top-0 bg-background z-10 py-2 border-b">
                  <Button size="sm" variant="outline" disabled={pageIdx === 0} onClick={() => setPageIdx((i) => Math.max(0, i - 1))}>← Prev</Button>
                  <div className="text-sm font-medium">Page {pageIdx + 1} of {previewPages.length} · {previewPages[pageIdx]?.title}</div>
                  <Button size="sm" variant="outline" disabled={pageIdx >= previewPages.length - 1} onClick={() => setPageIdx((i) => Math.min(previewPages.length - 1, i + 1))}>Next →</Button>
                </div>
              )}
              <div className="cryptonary-article prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewPages[pageIdx]?.html ?? "") }} />
              {preview.status === "draft" && (
                <div className="flex justify-end gap-2 sticky bottom-0 bg-background py-3 border-t">
                  <Button variant="outline" onClick={() => { updateStatus([preview.id], "archived"); setPreview(null); }}>Archive</Button>
                  <Button onClick={() => { updateStatus([preview.id], "promoted"); setPreview(null); }} className="gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Promote to Investor frontend
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
