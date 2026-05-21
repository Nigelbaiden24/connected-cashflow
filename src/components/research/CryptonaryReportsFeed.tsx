import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { Loader2, Search, Clock, ArrowLeft, Download, Share2, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface PromotedReport {
  id: string;
  asset_type: "stock" | "crypto";
  title: string;
  slug: string;
  ticker: string | null;
  excerpt: string | null;
  hero_image_url: string | null;
  html_content: string;
  ai_score: number | null;
  ai_tags: string[] | null;
  reading_time_minutes: number | null;
  author_name: string | null;
  sources: Array<{ url: string; title?: string | null }> | null;
  promoted_at: string | null;
  created_at: string;
}

interface Props {
  assetType: "stock" | "crypto";
}

export function CryptonaryReportsFeed({ assetType }: Props) {
  const [items, setItems] = useState<PromotedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<PromotedReport | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("generated_research_reports")
        .select("*")
        .eq("status", "promoted")
        .eq("asset_type", assetType)
        .order("promoted_at", { ascending: false })
        .limit(60);
      if (!mounted) return;
      if (error) toast.error(error.message);
      setItems((data ?? []) as PromotedReport[]);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [assetType]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((r) =>
      r.title.toLowerCase().includes(q) ||
      (r.ticker ?? "").toLowerCase().includes(q) ||
      (r.excerpt ?? "").toLowerCase().includes(q) ||
      (r.ai_tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  }, [items, query]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const handleDownloadPdf = async (r: PromotedReport) => {
    try {
      const html2pdf = (await import("html2pdf.js")).default as any;
      const container = document.createElement("div");
      container.innerHTML = `
        <style>
          body { font-family: Georgia, serif; color: #0f172a; padding: 32px; }
          h1 { font-size: 28px; margin-bottom: 6px; }
          .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
          .article { line-height: 1.7; font-size: 14px; }
          .article h2 { font-size: 20px; margin-top: 24px; color: #0c2340; }
          .article h3 { font-size: 16px; margin-top: 18px; }
          .article blockquote { border-left: 4px solid #3b82f6; padding-left: 14px; color: #334155; font-style: italic; }
          .article .stat-grid { display: flex; gap: 10px; flex-wrap: wrap; margin: 14px 0; }
          .article .stat { background: #f1f5f9; padding: 10px 14px; border-radius: 6px; }
          .article .stat .label { display:block; font-size: 11px; color: #64748b; text-transform: uppercase; }
          .article .stat .value { display:block; font-size: 18px; font-weight: 700; color: #0c2340; }
          .article table.data-table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 12px; }
          .article table.data-table th, .article table.data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; }
          .article .callout { background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px 16px; border-radius: 8px; margin: 14px 0; }
        </style>
        <h1>${r.title}</h1>
        <div class="meta">FlowPulse Research · ${r.promoted_at ? format(new Date(r.promoted_at), "PPP") : ""} · ${r.reading_time_minutes ?? 6} min read</div>
        <div class="article">${DOMPurify.sanitize(r.html_content)}</div>
      `;
      await html2pdf().from(container).set({
        margin: 10,
        filename: `${r.slug}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).save();
    } catch (e: any) {
      toast.error("PDF export failed: " + (e.message ?? "unknown"));
    }
  };

  if (active) {
    return (
      <ReportReader report={active} onBack={() => setActive(null)} onDownload={() => handleDownloadPdf(active)} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${assetType === "crypto" ? "crypto" : "stock"} research…`}
            className="pl-10 h-11"
          />
        </div>
        <Badge variant="secondary" className="h-9 px-3">{filtered.length} reports</Badge>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border rounded-xl bg-muted/30">
          <p className="text-lg font-semibold">No research reports yet</p>
          <p className="text-sm text-muted-foreground mt-1">Admin-generated {assetType} reports will appear here once promoted.</p>
        </div>
      ) : (
        <>
          {featured && (
            <button
              onClick={() => setActive(featured)}
              className="group block w-full text-left relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 hover:border-white/20 transition"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-full min-h-[320px] overflow-hidden">
                  <img
                    src={featured.hero_image_url ?? "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80"}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-900/90 to-transparent" />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-primary/90">Featured</Badge>
                    {featured.ticker && <Badge variant="outline" className="border-white/20 text-white">{featured.ticker}</Badge>}
                    {typeof featured.ai_score === "number" && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-300">
                        <Star className="h-3 w-3 fill-amber-300" /> {featured.ai_score.toFixed(1)}/5
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight group-hover:text-primary transition">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="text-slate-300 mt-4 line-clamp-3">{featured.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-6">
                    <span>{featured.author_name ?? "FlowPulse Research"}</span>
                    <span>•</span>
                    <span>{featured.promoted_at && format(new Date(featured.promoted_at), "PP")}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.reading_time_minutes ?? 6} min</span>
                  </div>
                </div>
              </div>
            </button>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((r) => (
              <button
                key={r.id}
                onClick={() => setActive(r)}
                className="group text-left rounded-xl overflow-hidden bg-card border hover:shadow-2xl hover:-translate-y-1 transition duration-300"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={r.hero_image_url ?? "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80"}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {r.ticker && <Badge className="bg-black/70 text-white border-0">{r.ticker}</Badge>}
                    {(r.ai_tags ?? []).slice(0, 1).map((t) => (
                      <Badge key={t} variant="secondary" className="bg-white/90 text-slate-900">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition line-clamp-2">{r.title}</h3>
                  {r.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.excerpt}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                    <span>{r.promoted_at && format(new Date(r.promoted_at), "PP")}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {r.reading_time_minutes ?? 6} min</span>
                    {typeof r.ai_score === "number" && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-amber-600"><Star className="h-3 w-3 fill-amber-500" /> {r.ai_score.toFixed(1)}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ReportReader({ report, onBack, onDownload }: { report: PromotedReport; onBack: () => void; onDownload: () => void }) {
  const clean = useMemo(() => DOMPurify.sanitize(report.html_content), [report.html_content]);
  return (
    <article className="max-w-3xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4 -ml-3">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to reports
      </Button>

      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {report.ticker && <Badge>{report.ticker}</Badge>}
          {(report.ai_tags ?? []).map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">{report.title}</h1>
        {report.excerpt && <p className="text-xl text-muted-foreground leading-relaxed">{report.excerpt}</p>}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-y py-4">
          <div>
            <div className="font-semibold text-foreground">{report.author_name ?? "FlowPulse Research"}</div>
            <div className="text-xs">{report.promoted_at && format(new Date(report.promoted_at), "PPP")} · {report.reading_time_minutes ?? 6} min read</div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
            <Button size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </div>

        {report.hero_image_url && (
          <img src={report.hero_image_url} alt="" className="w-full rounded-xl aspect-video object-cover" />
        )}

        <div
          className="cryptonary-article prose prose-lg prose-slate dark:prose-invert max-w-none mt-6"
          dangerouslySetInnerHTML={{ __html: clean }}
        />

        {report.sources && report.sources.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Sources cited</h3>
            <ol className="space-y-1 text-sm list-decimal pl-5">
              {report.sources.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">
                    {s.title || s.url}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </article>
  );
}
