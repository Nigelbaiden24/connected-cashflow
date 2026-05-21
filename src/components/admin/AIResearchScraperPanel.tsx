import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Sparkles, Eye, CheckCircle2, Trash2, Globe, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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
  ai_score: number | null;
  ai_tags: string[] | null;
  status: "draft" | "promoted" | "archived";
  sources: Array<{ url: string; title?: string | null }> | null;
  reading_time_minutes: number | null;
  created_at: string;
  promoted_at: string | null;
}

interface Props {
  assetType: AssetType;
  title: string;
  description: string;
  iconGradient: string;
  Icon: React.ElementType;
}

export function AIResearchScraperPanel({ assetType, title, description, iconGradient, Icon }: Props) {
  const [topic, setTopic] = useState("");
  const [ticker, setTicker] = useState("");
  const [extraUrls, setExtraUrls] = useState("");
  const [generating, setGenerating] = useState(false);

  const [items, setItems] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"draft" | "promoted" | "archived">("draft");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<GeneratedReport | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("generated_research_reports")
      .select("*")
      .eq("asset_type", assetType)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setItems((data ?? []) as GeneratedReport[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetType]);

  const filtered = useMemo(() => items.filter((i) => i.status === tab), [items, tab]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic, ticker, or company name");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-research-report-ai", {
        body: {
          assetType,
          topic: topic.trim(),
          ticker: ticker.trim() || undefined,
          extraUrls: extraUrls
            .split(/[\n,]/)
            .map((s) => s.trim())
            .filter((s) => /^https?:\/\//.test(s)),
        },
      });
      if (error) throw error;
      if (!(data as any)?.success) throw new Error((data as any)?.error || "Generation failed");
      toast.success(`Report drafted from ${(data as any).sourceCount} sources`);
      setTopic("");
      setTicker("");
      setExtraUrls("");
      setTab("draft");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (ids: string[], status: "promoted" | "archived" | "draft") => {
    const patch: any = { status };
    if (status === "promoted") {
      patch.promoted_at = new Date().toISOString();
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) patch.promoted_by = u.user.id;
    }
    const { error } = await supabase
      .from("generated_research_reports")
      .update(patch)
      .in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`${ids.length} report${ids.length > 1 ? "s" : ""} ${status}`);
    setSelected(new Set());
    await load();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this report permanently?")) return;
    const { error } = await supabase.from("generated_research_reports").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    await load();
  };

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconGradient} shadow-md`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Topic / Company / Theme</label>
              <Input
                placeholder={assetType === "crypto" ? "e.g. Ethereum L2 ecosystem 2026" : "e.g. NVIDIA AI infrastructure thesis"}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ticker (optional)</label>
              <Input
                placeholder={assetType === "crypto" ? "ETH" : "NVDA"}
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Extra source URLs (optional, one per line — added to curated + broad web sweep)
            </label>
            <Textarea
              rows={2}
              value={extraUrls}
              onChange={(e) => setExtraUrls(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleGenerate} disabled={generating} size="lg" className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Scraping + Generating…" : "Scrape & Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Report Queue</CardTitle>
            <CardDescription>Review AI-generated reports, then promote to {assetType === "crypto" ? "Crypto" : "Stock"} Research Reports on the Investor sidebar.</CardDescription>
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
                  {tab === "draft" ? "No drafts yet — generate one above." : `No ${tab} reports.`}
                </div>
              ) : (
                <div className="divide-y border rounded-lg">
                  {filtered.map((r) => (
                    <div key={r.id} className="p-4 flex gap-3 items-start hover:bg-muted/40 transition">
                      <Checkbox
                        checked={selected.has(r.id)}
                        onCheckedChange={() => toggleSel(r.id)}
                        className="mt-1"
                      />
                      {r.hero_image_url && (
                        <img src={r.hero_image_url} alt="" className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold truncate">{r.title}</h4>
                          {r.ticker && <Badge variant="secondary">{r.ticker}</Badge>}
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
                        <Button size="icon" variant="ghost" onClick={() => setPreview(r)} title="Preview">
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
            <DialogTitle>{preview?.title}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              {preview.hero_image_url && (
                <img src={preview.hero_image_url} alt="" className="w-full h-64 object-cover rounded-lg" />
              )}
              <div className="flex gap-2 flex-wrap">
                {preview.ai_tags?.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
              <div
                className="cryptonary-article prose prose-slate dark:prose-invert max-w-none"
                // sanitized
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(preview.html_content) }}
              />
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
