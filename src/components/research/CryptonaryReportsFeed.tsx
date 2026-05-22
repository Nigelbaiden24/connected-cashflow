import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { Loader2, Search, Clock, ArrowLeft, Download, Share2, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface PromotedReport {
  id: string;
  asset_type: "stock" | "crypto";
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
      setItems((data ?? []) as unknown as PromotedReport[]);
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
      const pages = r.pages?.length ? r.pages : [{ title: r.title, html: r.html_content }];
      const dateStr = r.report_date ? format(new Date(r.report_date), "PPP") : (r.promoted_at ? format(new Date(r.promoted_at), "PPP") : format(new Date(), "PPP"));
      const container = document.createElement("div");
      container.innerHTML = `
        <style>
          body { font-family: Georgia, 'Times New Roman', serif; color: #0f172a; }
          .pg { padding: 28px 32px; page-break-after: always; min-height: 1050px; position: relative; }
          .pg:last-child { page-break-after: auto; }
          .brand-header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #0c2340; padding-bottom: 10px; margin-bottom: 18px; }
          .brand-header img { height: 36px; width: 36px; object-fit: contain; border-radius: 4px; }
          .brand-name { font-family: Arial, sans-serif; font-weight: 800; color: #0c2340; letter-spacing: 1px; font-size: 14px; }
          .brand-meta { font-family: Arial, sans-serif; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; }
          .cover h1 { font-size: 32px; margin: 30px 0 10px; color: #0c2340; line-height: 1.2; }
          .cover .ticker { display: inline-block; background: #0c2340; color: #fff; padding: 4px 10px; border-radius: 4px; font-family: Arial; font-size: 12px; letter-spacing: 1px; margin-bottom: 14px; }
          .cover .lede { font-size: 16px; color: #334155; line-height: 1.6; margin-top: 14px; }
          .cover .kv { display: flex; gap: 24px; margin-top: 22px; font-family: Arial, sans-serif; font-size: 11px; color: #64748b; }
          .cover .kv span { display: block; color: #0c2340; font-weight: 700; font-size: 14px; }
          .page-title { font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; color: #3b82f6; text-transform: uppercase; margin-bottom: 6px; }
          h2.section { font-size: 22px; margin: 0 0 18px; color: #0c2340; }
          .article { line-height: 1.7; font-size: 13.5px; }
          .article h2 { font-size: 18px; margin-top: 22px; color: #0c2340; }
          .article h3 { font-size: 15px; margin-top: 16px; color: #1e3a5f; }
          .article p { margin: 10px 0; }
          .article blockquote { border-left: 4px solid #3b82f6; padding: 6px 14px; color: #334155; font-style: italic; margin: 12px 0; background: #f8fafc; }
          .article .stat-grid { display: flex; gap: 8px; flex-wrap: wrap; margin: 14px 0; }
          .article .stat { background: #f1f5f9; padding: 10px 14px; border-radius: 6px; flex: 1 1 130px; }
          .article .stat .label { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
          .article .stat .value { display: block; font-size: 18px; font-weight: 700; color: #0c2340; font-family: Arial, sans-serif; }
          .article table.data-table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 12px; }
          .article table.data-table th, .article table.data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          .article table.data-table th { background: #0c2340; color: #fff; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 0.5px; }
          .article .callout { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin: 14px 0; }
          .footer { position: absolute; bottom: 12px; left: 32px; right: 32px; display: flex; justify-content: space-between; font-family: Arial, sans-serif; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 6px; }
        </style>
        <div class="pg cover">
          <div class="brand-header">
            <img src="${flowpulseLogo}" alt="FlowPulse" />
            <div style="flex:1">
              <div class="brand-name">FLOWPULSE RESEARCH</div>
              <div class="brand-meta">${assetType === "crypto" ? "Digital Asset" : "Equity"} Research · ${dateStr}</div>
            </div>
          </div>
          ${r.ticker ? `<div class="ticker">${r.ticker}</div>` : ""}
          <h1>${r.title}</h1>
          ${r.excerpt ? `<p class="lede">${r.excerpt}</p>` : ""}
          ${r.hero_image_url ? `<img src="${r.hero_image_url}" style="width:100%;height:240px;object-fit:cover;border-radius:6px;margin-top:18px" />` : ""}
          <div class="kv">
            <div>Conviction <span>${typeof r.ai_score === "number" ? r.ai_score.toFixed(1) : "—"} / 5</span></div>
            <div>Pages <span>${pages.length}</span></div>
            <div>Reading <span>${r.reading_time_minutes ?? 6} min</span></div>
            <div>Date <span>${dateStr}</span></div>
          </div>
          <div class="footer"><span>FlowPulse Research · Confidential</span><span>Cover</span></div>
        </div>
        ${pages.map((p, i) => `
          <div class="pg">
            <div class="brand-header">
              <img src="${flowpulseLogo}" alt="FlowPulse" />
              <div style="flex:1">
                <div class="brand-name">FLOWPULSE RESEARCH</div>
                <div class="brand-meta">${r.title.replace(/</g, "&lt;").slice(0, 80)} · ${dateStr}</div>
              </div>
            </div>
            <div class="page-title">Section ${i + 1}</div>
            <h2 class="section">${p.title.replace(/</g, "&lt;")}</h2>
            <div class="article">${DOMPurify.sanitize(p.html)}</div>
            <div class="footer"><span>FlowPulse Research · Confidential</span><span>Page ${i + 1} of ${pages.length}</span></div>
          </div>
        `).join("")}
      `;
      await html2pdf().from(container).set({
        margin: 0,
        filename: `${r.slug}.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      }).save();
    } catch (e: any) {
      toast.error("PDF export failed: " + (e.message ?? "unknown"));
    }
  };

  if (active) {
    return <ReportReader report={active} onBack={() => setActive(null)} onDownload={() => handleDownloadPdf(active)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${assetType === "crypto" ? "crypto" : "stock"} research…`} className="pl-10 h-11" />
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
            <button onClick={() => setActive(featured)}
              className="group block w-full text-left relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 hover:border-white/20 transition">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-full min-h-[320px] overflow-hidden">
                  <img src={featured.hero_image_url ?? "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80"}
                    alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-900/90 to-transparent" />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <img src={flowpulseLogo} alt="" className="h-5 w-5 rounded" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-300">FlowPulse Research</span>
                    <Badge className="bg-primary/90 ml-2">Featured</Badge>
                    {featured.ticker && <Badge variant="outline" className="border-white/20 text-white">{featured.ticker}</Badge>}
                    <Badge variant="outline" className="border-white/20 text-white">{featured.page_count ?? 1} pages</Badge>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight group-hover:text-primary transition">
                    {featured.title}
                  </h2>
                  {featured.excerpt && <p className="text-slate-300 mt-4 line-clamp-3">{featured.excerpt}</p>}
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-6">
                    <span>{featured.author_name ?? "FlowPulse Research"}</span>
                    <span>•</span>
                    <span>{featured.report_date ? format(new Date(featured.report_date), "PP") : (featured.promoted_at && format(new Date(featured.promoted_at), "PP"))}</span>
                    {typeof featured.ai_score === "number" && (
                      <span className="inline-flex items-center gap-1 text-amber-300"><Star className="h-3 w-3 fill-amber-300" /> {featured.ai_score.toFixed(1)}/5</span>
                    )}
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.reading_time_minutes ?? 6} min</span>
                  </div>
                </div>
              </div>
            </button>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((r) => (
              <button key={r.id} onClick={() => setActive(r)}
                className="group text-left rounded-xl overflow-hidden bg-card border hover:shadow-2xl hover:-translate-y-1 transition duration-300">
                <div className="relative h-44 overflow-hidden">
                  <img src={r.hero_image_url ?? "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80"}
                    alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {r.ticker && <Badge className="bg-black/70 text-white border-0">{r.ticker}</Badge>}
                    <Badge className="bg-black/70 text-white border-0">{r.page_count ?? 1}p</Badge>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <img src={flowpulseLogo} alt="" className="h-3.5 w-3.5 rounded" />
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground">FlowPulse Research</span>
                  </div>
                  <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition line-clamp-2">{r.title}</h3>
                  {r.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.excerpt}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                    <span>{r.report_date ? format(new Date(r.report_date), "PP") : (r.promoted_at && format(new Date(r.promoted_at), "PP"))}</span>
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
  const pages = useMemo(
    () => (report.pages?.length ? report.pages : [{ title: report.title, html: report.html_content }]),
    [report]
  );
  const [pageIdx, setPageIdx] = useState(0);
  const safe = useMemo(() => DOMPurify.sanitize(pages[pageIdx]?.html ?? ""), [pages, pageIdx]);
  const dateStr = report.report_date ? format(new Date(report.report_date), "PPP") : (report.promoted_at && format(new Date(report.promoted_at), "PPP"));

  return (
    <article className="max-w-3xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4 -ml-3">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to reports
      </Button>

      <div className="space-y-4">
        {/* Branded header */}
        <div className="flex items-center gap-3 border-b-2 border-primary/80 pb-3">
          <img src={flowpulseLogo} alt="FlowPulse" className="h-10 w-10 rounded object-contain" />
          <div className="flex-1">
            <div className="text-[10px] font-bold tracking-[0.25em] text-primary">FLOWPULSE RESEARCH</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {report.asset_type === "crypto" ? "Digital Asset" : "Equity"} Research · {dateStr}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
            <Button size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {report.ticker && <Badge>{report.ticker}</Badge>}
          <Badge variant="outline">{pages.length} pages</Badge>
          {(report.ai_tags ?? []).map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">{report.title}</h1>
        {report.excerpt && <p className="text-xl text-muted-foreground leading-relaxed">{report.excerpt}</p>}
        <div className="flex items-center gap-4 text-sm text-muted-foreground py-3 border-y">
          <div>
            <div className="font-semibold text-foreground">{report.author_name ?? "FlowPulse Research"}</div>
            <div className="text-xs">{dateStr} · {report.reading_time_minutes ?? 6} min read</div>
          </div>
          {typeof report.ai_score === "number" && (
            <div className="ml-auto inline-flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="h-4 w-4 fill-amber-500" /> {report.ai_score.toFixed(1)}/5 Conviction
            </div>
          )}
        </div>

        {report.hero_image_url && (
          <img src={report.hero_image_url} alt="" className="w-full rounded-xl aspect-video object-cover" />
        )}

        {/* Page navigation */}
        {pages.length > 1 && (
          <div className="flex items-center justify-between gap-2 sticky top-0 bg-background z-10 py-3 border-b">
            <Button size="sm" variant="outline" disabled={pageIdx === 0} onClick={() => setPageIdx((i) => Math.max(0, i - 1))}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <div className="text-sm font-medium text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Page {pageIdx + 1} of {pages.length}</div>
              <div>{pages[pageIdx]?.title}</div>
            </div>
            <Button size="sm" variant="outline" disabled={pageIdx >= pages.length - 1} onClick={() => setPageIdx((i) => Math.min(pages.length - 1, i + 1))}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        <div className="cryptonary-article prose prose-lg prose-slate dark:prose-invert max-w-none mt-6"
          dangerouslySetInnerHTML={{ __html: safe }} />

        {/* Page pill nav */}
        {pages.length > 1 && (
          <div className="flex flex-wrap gap-1.5 pt-6 border-t">
            {pages.map((p, i) => (
              <button key={i} onClick={() => { setPageIdx(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${i === pageIdx ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}>
                {i + 1}. {p.title}
              </button>
            ))}
          </div>
        )}

        {pageIdx === pages.length - 1 && report.sources && report.sources.length > 0 && (
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

        {/* Branded footer */}
        <div className="mt-12 pt-4 border-t text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          FlowPulse Research · Institutional-grade {report.asset_type === "crypto" ? "digital asset" : "equity"} intelligence · {dateStr}
        </div>
      </div>
    </article>
  );
}
