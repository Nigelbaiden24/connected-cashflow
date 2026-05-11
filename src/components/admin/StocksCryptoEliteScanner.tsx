import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Send, Trash2, Pencil, Save, Bot, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ScanItem {
  id: string;
  symbol: string;
  name: string;
  asset_type: string;
  headline: string;
  summary: string | null;
  analyst_rating: string | null;
  conviction_score: number | null;
  past_performance: string | null;
  future_outlook: string | null;
  catalysts: string[] | null;
  risks: string[] | null;
  scan_date: string;
  source: string;
  is_promoted: boolean;
  platform: string | null;
  created_at: string;
}

const RATINGS = ["Gold", "Silver", "Bronze", "Neutral", "Negative"];

export function StocksCryptoEliteScanner() {
  const [items, setItems] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(8);
  const [autoPromote, setAutoPromote] = useState(true);
  const [platform, setPlatform] = useState<string>("both");
  const [editing, setEditing] = useState<Record<string, Partial<ScanItem>>>({});

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stocks_crypto_analyst_activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) toast.error(error.message);
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const runScan = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("stocks-crypto-elite-scan", {
        body: { count, promote: autoPromote, platform: platform === "both" ? null : platform },
      });
      if (error) throw error;
      if (!(data as any)?.ok) throw new Error((data as any)?.error || "Scan failed");
      toast.success(`AI generated ${(data as any).count} dated picks (universe ${(data as any).universe_size})`);
      fetchItems();
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setRunning(false);
    }
  };

  const togglePromote = async (it: ScanItem) => {
    const { error } = await supabase
      .from("stocks_crypto_analyst_activity")
      .update({ is_promoted: !it.is_promoted })
      .eq("id", it.id);
    if (error) return toast.error(error.message);
    toast.success(it.is_promoted ? "Withdrawn from platforms" : "Promoted live to platforms");
    fetchItems();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this scan item?")) return;
    const { error } = await supabase.from("stocks_crypto_analyst_activity").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const saveEdit = async (id: string) => {
    const patch = editing[id];
    if (!patch) return;
    const { error } = await supabase.from("stocks_crypto_analyst_activity").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing((e) => { const n = { ...e }; delete n[id]; return n; });
    fetchItems();
  };

  const updateField = (id: string, field: keyof ScanItem, value: any) => {
    setEditing((e) => ({ ...e, [id]: { ...e[id], [field]: value } }));
  };

  // Group by scan_date
  const grouped = items.reduce<Record<string, ScanItem[]>>((acc, it) => {
    (acc[it.scan_date] = acc[it.scan_date] || []).push(it);
    return acc;
  }, {});

  return (
    <Card className="border-violet-200 shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-violet-50 via-fuchsia-50 to-amber-50">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow">
            <Bot className="h-5 w-5" />
          </div>
          Elite AI Stocks &amp; Crypto Scanner
          <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px]">Daily · 0–5 conviction</Badge>
        </CardTitle>
        <CardDescription>
          Scores the day's top stocks &amp; crypto from the live universe — judging past and future performance — and lets you promote directly to the Analyst Activity feed on Finance and Investor platforms, or manually edit before promoting.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {/* Run controls */}
        <div className="flex flex-wrap items-end gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="space-y-1">
            <Label className="text-xs">Picks</Label>
            <Input type="number" min={3} max={20} value={count} onChange={(e) => setCount(Math.max(3, Math.min(20, Number(e.target.value) || 8)))} className="w-20" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Target platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both platforms</SelectItem>
                <SelectItem value="finance">Finance only</SelectItem>
                <SelectItem value="investor">Investor only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-200">
            <Switch checked={autoPromote} onCheckedChange={setAutoPromote} />
            <span className="text-xs font-medium">Auto-promote to platforms</span>
          </div>
          <Button onClick={runScan} disabled={running} className="ml-auto gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Run Daily Scan
          </Button>
        </div>

        {/* Dated results */}
        <ScrollArea className="h-[640px] pr-3">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              No scans yet — run the daily scan to generate institutional-grade picks.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, group]) => (
                <div key={date}>
                  <div className="sticky top-0 bg-white/95 backdrop-blur z-10 py-2 mb-2 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">📅 {format(new Date(date), "EEEE, dd MMM yyyy")}</h3>
                    <Badge variant="outline" className="text-[10px]">{group.length} items</Badge>
                  </div>
                  <div className="space-y-2">
                    {group.map((it) => {
                      const e = editing[it.id];
                      const merged = { ...it, ...e };
                      const isEditing = !!e;
                      return (
                        <Card key={it.id} className={`border ${it.is_promoted ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-white"}`}>
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm">{it.symbol}</span>
                                  <span className="text-xs text-slate-500">· {it.name}</span>
                                  <Badge variant="outline" className="text-[10px]">{it.asset_type}</Badge>
                                  {it.source === "ai_scan" && <Badge className="text-[10px] bg-violet-100 text-violet-700 border-0">AI</Badge>}
                                  {it.is_promoted ? <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0">Live on platforms</Badge> : <Badge className="text-[10px] bg-slate-200 text-slate-700 border-0">Draft</Badge>}
                                </div>
                                {isEditing ? (
                                  <Input className="mt-1 h-8 text-sm font-semibold" value={merged.headline ?? ""} onChange={(ev) => updateField(it.id, "headline", ev.target.value)} />
                                ) : (
                                  <p className="text-sm font-semibold mt-1">{it.headline}</p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                {isEditing ? (
                                  <Select value={merged.analyst_rating ?? "Neutral"} onValueChange={(v) => updateField(it.id, "analyst_rating", v)}>
                                    <SelectTrigger className="h-7 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>{RATINGS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                  </Select>
                                ) : (
                                  <Badge className="text-[10px] bg-amber-100 text-amber-800 border-0">{it.analyst_rating}</Badge>
                                )}
                                {isEditing ? (
                                  <Input type="number" min={0} max={5} step={0.1} className="h-7 w-[80px] text-xs" value={Number(merged.conviction_score) || 0} onChange={(ev) => updateField(it.id, "conviction_score", Number(ev.target.value))} />
                                ) : (
                                  <span className="text-xs font-bold">{(Number(it.conviction_score) || 0).toFixed(1)}/5</span>
                                )}
                              </div>
                            </div>

                            {isEditing ? (
                              <>
                                <Textarea rows={2} placeholder="Summary" value={merged.summary ?? ""} onChange={(ev) => updateField(it.id, "summary", ev.target.value)} className="text-xs" />
                                <div className="grid grid-cols-2 gap-2">
                                  <Textarea rows={2} placeholder="Past performance" value={merged.past_performance ?? ""} onChange={(ev) => updateField(it.id, "past_performance", ev.target.value)} className="text-xs" />
                                  <Textarea rows={2} placeholder="Future outlook" value={merged.future_outlook ?? ""} onChange={(ev) => updateField(it.id, "future_outlook", ev.target.value)} className="text-xs" />
                                </div>
                              </>
                            ) : (
                              <>
                                {it.summary && <p className="text-xs text-slate-700">{it.summary}</p>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                  {it.past_performance && <div className="p-2 rounded bg-slate-50 border border-slate-100"><b className="text-slate-600">Past:</b> {it.past_performance}</div>}
                                  {it.future_outlook && <div className="p-2 rounded bg-emerald-50 border border-emerald-100"><b className="text-emerald-700">Outlook:</b> {it.future_outlook}</div>}
                                </div>
                              </>
                            )}

                            <div className="flex items-center justify-end gap-1 pt-1">
                              {isEditing ? (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => setEditing((e0) => { const n = { ...e0 }; delete n[it.id]; return n; })}>Cancel</Button>
                                  <Button size="sm" onClick={() => saveEdit(it.id)} className="gap-1"><Save className="h-3 w-3" /> Save</Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing((e0) => ({ ...e0, [it.id]: {} }))}>
                                    <Pencil className="h-3 w-3" /> Edit
                                  </Button>
                                  <Button size="sm" variant={it.is_promoted ? "outline" : "default"} className={`gap-1 ${!it.is_promoted ? "bg-emerald-600 hover:bg-emerald-700" : ""}`} onClick={() => togglePromote(it)}>
                                    <Send className="h-3 w-3" /> {it.is_promoted ? "Withdraw" : "Promote live"}
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => remove(it.id)} className="text-rose-600 hover:text-rose-700"><Trash2 className="h-3 w-3" /></Button>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
