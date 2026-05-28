import { useEffect, useMemo, useState, useRef } from "react";
import DOMPurify from "dompurify";
import {
  Loader2, Search, Clock, ArrowLeft, Download, Share2, Star, ChevronLeft, ChevronRight,
  TrendingUp, Bookmark, BookmarkCheck, Eye, Sparkles, Flame, ArrowUpRight, ListOrdered,
  Filter as FilterIcon, LayoutGrid, Rows3, Printer
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
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

const BOOKMARK_KEY = "flowpulse_research_bookmarks";
const fallbackImg = (i = 0) =>
  [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80",
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1600&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80",
    "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=1600&q=80",
    "https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=1600&q=80",
  ][i % 5];

export function CryptonaryReportsFeed({ assetType }: Props) {
  const [items, setItems] = useState<PromotedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<PromotedReport | null>(null);
  const [sort, setSort] = useState<"recent" | "score" | "az">("recent");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    try { setBookmarks(JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]")); } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (active) {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch { /* noop */ }
    }
  }, [active?.id]);

  const openReport = (r: PromotedReport) => {
    setActive(r);
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch { /* noop */ }
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const { data, error } = await supabase.functions.invoke("public-research-previews", {
        body: { asset_types: [assetType], limit: 60, include_full: true },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      if (!mounted) return;
      if (error) toast.error(error.message);
      setItems(((data?.reports ?? []) as PromotedReport[]).filter((report) => report.asset_type === assetType));
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [assetType]);

  const allTags = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((r) => (r.ai_tags ?? []).forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (tagFilter !== "all") list = list.filter((r) => (r.ai_tags ?? []).includes(tagFilter));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        (r.ticker ?? "").toLowerCase().includes(q) ||
        (r.excerpt ?? "").toLowerCase().includes(q) ||
        (r.ai_tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    list = [...list].sort((a, b) => {
      if (sort === "score") return (b.ai_score ?? 0) - (a.ai_score ?? 0);
      if (sort === "az") return a.title.localeCompare(b.title);
      const ad = new Date(a.promoted_at ?? a.created_at).getTime();
      const bd = new Date(b.promoted_at ?? b.created_at).getTime();
      return bd - ad;
    });
    return list;
  }, [items, query, tagFilter, sort]);

  const featured = filtered[0];
  const secondary = filtered.slice(1, 3);
  const rest = filtered.slice(3);
  const trending = useMemo(
    () => [...items].sort((a, b) => (b.ai_score ?? 0) - (a.ai_score ?? 0)).slice(0, 5),
    [items]
  );

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
    const related = items.filter((x) => x.id !== active.id).slice(0, 4);
    return (
      <ReportReader
        report={active}
        related={related}
        onOpenRelated={(r) => setActive(r)}
        onBack={() => setActive(null)}
        onDownload={() => handleDownloadPdf(active)}
        bookmarked={bookmarks.includes(active.id)}
        onBookmark={() => toggleBookmark(active.id)}
      />
    );
  }

  const label = assetType === "crypto" ? "Digital Asset" : "Equity";

  return (
    <div className="space-y-8">
      {/* ============ HERO MASTHEAD ============ */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-[#0c1733] to-slate-900 p-6 md:p-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur">
              <img src={flowpulseLogo} alt="" className="h-4 w-4 rounded" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-slate-300">FlowPulse Research · {label} Desk</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              {assetType === "crypto" ? "Digital Asset Intelligence" : "Equity Research Terminal"}
            </h1>
            <p className="text-slate-300/90 text-sm md:text-base leading-relaxed">
              Institutional-grade {label.toLowerCase()} research, multi-page deep dives, and real-time conviction scoring — curated and approved by the FlowPulse research desk.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            <StatTile label="Reports" value={items.length} />
            <StatTile label="Avg Conviction" value={(items.reduce((s, r) => s + (r.ai_score ?? 0), 0) / Math.max(items.length, 1)).toFixed(1)} suffix="/5" />
            <StatTile label="Updated" value={items[0] ? formatDistanceToNow(new Date(items[0].promoted_at ?? items[0].created_at), { addSuffix: false }) : "—"} />
          </div>
        </div>
      </div>

      {/* ============ CONTROL BAR ============ */}
      <div className="sticky top-0 z-20 -mx-1 px-1 py-3 bg-background/85 backdrop-blur-xl border-b">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()} research, tickers, themes…`}
              className="pl-10 h-11 bg-card/60 border-border/60"
            />
          </div>
          <Select value={sort} onValueChange={(v: any) => setSort(v)}>
            <SelectTrigger className="w-[170px] h-11">
              <FilterIcon className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="score">Highest Conviction</SelectItem>
              <SelectItem value="az">Title A–Z</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={layout} onValueChange={(v: any) => setLayout(v)}>
            <TabsList className="h-11">
              <TabsTrigger value="grid" className="h-9"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="list" className="h-9"><Rows3 className="h-4 w-4" /></TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setTagFilter("all")}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${tagFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted border-border"}`}
            >
              All themes
            </button>
            {allTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag === tagFilter ? "all" : tag)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition whitespace-nowrap ${tag === tagFilter ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted border-border"}`}
              >
                #{tag} <span className="opacity-60">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============ BODY ============ */}
      {loading ? (
        <FeedSkeleton />
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center border rounded-2xl bg-muted/30">
          <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-semibold">No research reports yet</p>
          <p className="text-sm text-muted-foreground mt-1">Admin-generated {label.toLowerCase()} reports will appear here once promoted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-8">
            {featured && (
              <FeaturedCard
                report={featured}
                onClick={() => setActive(featured)}
                onBookmark={() => toggleBookmark(featured.id)}
                bookmarked={bookmarks.includes(featured.id)}
                assetType={assetType}
              />
            )}
            {secondary.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {secondary.map((r, i) => (
                  <SecondaryCard
                    key={r.id} report={r} idx={i + 1}
                    onClick={() => setActive(r)}
                    onBookmark={() => toggleBookmark(r.id)}
                    bookmarked={bookmarks.includes(r.id)}
                  />
                ))}
              </div>
            )}
            {rest.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold tracking-tight">Latest Research</h2>
                  <span className="text-xs text-muted-foreground">{rest.length} more reports</span>
                </div>
                {layout === "grid" ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {rest.map((r, i) => (
                      <GridCard
                        key={r.id} report={r} idx={i}
                        onClick={() => setActive(r)}
                        onBookmark={() => toggleBookmark(r.id)}
                        bookmarked={bookmarks.includes(r.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rest.map((r, i) => (
                      <ListRow
                        key={r.id} report={r} idx={i}
                        onClick={() => setActive(r)}
                        onBookmark={() => toggleBookmark(r.id)}
                        bookmarked={bookmarks.includes(r.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* ============ SIDEBAR ============ */}
          <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Top Conviction</h3>
              </div>
              <ol className="space-y-3">
                {trending.map((r, i) => (
                  <li key={r.id}>
                    <button onClick={() => setActive(r)} className="group flex items-start gap-3 text-left w-full">
                      <span className="text-2xl font-black text-muted-foreground/40 leading-none w-6">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition">{r.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                          {r.ticker && <span className="font-mono">{r.ticker}</span>}
                          <span className="inline-flex items-center gap-0.5 text-amber-500"><Star className="h-3 w-3 fill-current" />{(r.ai_score ?? 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-blue-500/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Bookmark className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Saved Reports</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{bookmarks.length} {bookmarks.length === 1 ? "report" : "reports"} bookmarked</p>
              {bookmarks.length > 0 ? (
                <div className="space-y-2">
                  {items.filter((r) => bookmarks.includes(r.id)).slice(0, 4).map((r) => (
                    <button key={r.id} onClick={() => setActive(r)} className="block w-full text-left text-xs hover:text-primary transition line-clamp-1">
                      → {r.title}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Tap the bookmark icon on any report to save it.</p>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Active Themes</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allTags.slice(0, 10).map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag === tagFilter ? "all" : tag)}
                    className={`text-[11px] px-2 py-1 rounded border transition ${tag === tagFilter ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 hover:bg-muted border-transparent"}`}
                  >
                    #{tag} <span className="opacity-60">{count}</span>
                  </button>
                ))}
                {allTags.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No themes yet.</span>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* =============================================================
   FEED CARD COMPONENTS
============================================================== */

function StatTile({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur px-3 py-3 md:px-4 md:py-4 text-center">
      <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="text-lg md:text-2xl font-bold text-white mt-1">
        {value}<span className="text-xs text-slate-400 font-medium ml-0.5">{suffix}</span>
      </div>
    </div>
  );
}

interface CardProps {
  report: PromotedReport;
  onClick: () => void;
  onBookmark: () => void;
  bookmarked: boolean;
}

function FeaturedCard({ report, onClick, onBookmark, bookmarked, assetType }: CardProps & { assetType: string }) {
  const r = report;
  const date = r.report_date ? format(new Date(r.report_date), "PP") : (r.promoted_at && format(new Date(r.promoted_at), "PP"));
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 hover:border-primary/50 transition-all duration-500">
      <button onClick={onClick} className="block w-full text-left">
        <div className="grid lg:grid-cols-2 gap-0">
          <div className="relative h-72 lg:h-[460px] overflow-hidden">
            <img src={r.hero_image_url ?? fallbackImg(0)} alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/95 via-slate-900/40 to-transparent" />
            <div className="absolute top-5 left-5 flex gap-2">
              <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">★ FEATURED</Badge>
              {r.ticker && <Badge className="bg-white/15 backdrop-blur text-white border-white/20 font-mono">{r.ticker}</Badge>}
            </div>
          </div>
          <div className="p-7 lg:p-10 flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-950">
            <div className="flex items-center gap-2 mb-4">
              <img src={flowpulseLogo} alt="" className="h-5 w-5 rounded" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-slate-300 font-semibold">FlowPulse Research</span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400">{assetType === "crypto" ? "Digital Asset" : "Equity"}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight group-hover:text-primary transition">
              {r.title}
            </h2>
            {r.excerpt && <p className="text-slate-300/90 mt-4 text-base leading-relaxed line-clamp-3">{r.excerpt}</p>}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 mt-6 pt-6 border-t border-white/10">
              <span className="text-slate-200 font-semibold">{r.author_name ?? "FlowPulse Research"}</span>
              <span>{date}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{r.reading_time_minutes ?? 6} min</span>
              <span className="inline-flex items-center gap-1">{r.page_count ?? 1} pages</span>
              {typeof r.ai_score === "number" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold">
                  <Star className="h-3 w-3 fill-amber-400" /> {r.ai_score.toFixed(1)}/5
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-6">
              <span className="inline-flex items-center gap-2 text-sm text-primary font-semibold group-hover:gap-3 transition-all">
                Read deep dive <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </button>
      <button onClick={(e) => { e.stopPropagation(); onBookmark(); }}
        className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 flex items-center justify-center transition">
        {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4 text-white" />}
      </button>
    </div>
  );
}

function SecondaryCard({ report, idx, onClick, onBookmark, bookmarked }: CardProps & { idx: number }) {
  const r = report;
  const date = r.report_date ? format(new Date(r.report_date), "PP") : (r.promoted_at && format(new Date(r.promoted_at), "PP"));
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <button onClick={onClick} className="block w-full text-left">
        <div className="relative h-56 overflow-hidden">
          <img src={r.hero_image_url ?? fallbackImg(idx)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            {r.ticker && <Badge className="bg-black/60 backdrop-blur text-white border-white/10 font-mono">{r.ticker}</Badge>}
            <Badge className="bg-black/60 backdrop-blur text-white border-white/10">{r.page_count ?? 1} pages</Badge>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-xl font-bold text-white leading-snug line-clamp-2 group-hover:text-primary-foreground transition">{r.title}</h3>
          </div>
        </div>
        <div className="p-5">
          {r.excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{r.excerpt}</p>}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{date}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{r.reading_time_minutes ?? 6}m</span>
            {typeof r.ai_score === "number" && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold"><Star className="h-3 w-3 fill-amber-500" />{r.ai_score.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>
      </button>
      <button onClick={(e) => { e.stopPropagation(); onBookmark(); }}
        className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur border border-white/10 hover:bg-black/60 flex items-center justify-center transition">
        {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5 text-white" />}
      </button>
    </div>
  );
}

function GridCard({ report, idx, onClick, onBookmark, bookmarked }: CardProps & { idx: number }) {
  const r = report;
  const date = r.report_date ? format(new Date(r.report_date), "PP") : (r.promoted_at && format(new Date(r.promoted_at), "PP"));
  return (
    <div className="group relative text-left rounded-xl overflow-hidden bg-card border hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <button onClick={onClick} className="block w-full text-left">
        <div className="relative h-44 overflow-hidden">
          <img src={r.hero_image_url ?? fallbackImg(idx + 2)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {r.ticker && <Badge className="bg-black/70 backdrop-blur text-white border-0 font-mono text-[10px]">{r.ticker}</Badge>}
            <Badge className="bg-black/70 backdrop-blur text-white border-0 text-[10px]">{r.page_count ?? 1}p</Badge>
          </div>
          {typeof r.ai_score === "number" && (
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-amber-950 text-[11px] font-bold backdrop-blur">
              <Star className="h-3 w-3 fill-current" />{r.ai_score.toFixed(1)}
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-1.5 mb-2">
            <img src={flowpulseLogo} alt="" className="h-3 w-3 rounded" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">FlowPulse</span>
          </div>
          <h3 className="font-bold text-base leading-snug group-hover:text-primary transition line-clamp-2">{r.title}</h3>
          {r.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.excerpt}</p>}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{date}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{r.reading_time_minutes ?? 6}m</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>
      </button>
      <button onClick={(e) => { e.stopPropagation(); onBookmark(); }}
        className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur border border-white/10 hover:bg-black/60 flex items-center justify-center transition">
        {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5 text-white" />}
      </button>
    </div>
  );
}

function ListRow({ report, idx, onClick, onBookmark, bookmarked }: CardProps & { idx: number }) {
  const r = report;
  const date = r.report_date ? format(new Date(r.report_date), "PP") : (r.promoted_at && format(new Date(r.promoted_at), "PP"));
  return (
    <div className="group relative flex gap-4 items-center bg-card border rounded-xl p-3 hover:border-primary/40 hover:shadow-lg transition-all">
      <button onClick={onClick} className="flex gap-4 items-center flex-1 text-left">
        <div className="relative h-24 w-32 shrink-0 rounded-lg overflow-hidden">
          <img src={r.hero_image_url ?? fallbackImg(idx + 4)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {r.ticker && <Badge variant="outline" className="font-mono text-[10px]">{r.ticker}</Badge>}
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{r.page_count ?? 1} pages</span>
          </div>
          <h3 className="font-bold text-base leading-snug group-hover:text-primary transition line-clamp-1">{r.title}</h3>
          {r.excerpt && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{r.excerpt}</p>}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{date}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{r.reading_time_minutes ?? 6}m</span>
            {typeof r.ai_score === "number" && (
              <span className="inline-flex items-center gap-1 text-amber-600 font-semibold"><Star className="h-3 w-3 fill-amber-500" />{r.ai_score.toFixed(1)}/5</span>
            )}
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
      </button>
      <button onClick={onBookmark} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center shrink-0">
        {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
      </button>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-[460px] rounded-3xl bg-muted/40 animate-pulse" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-80 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => <div key={i} className="h-80 rounded-xl bg-muted/40 animate-pulse" />)}
      </div>
    </div>
  );
}

/* =============================================================
   REPORT READER (enterprise reading experience)
============================================================== */

function ReportReader({
  report, related, onBack, onDownload, bookmarked, onBookmark, onOpenRelated,
}: {
  report: PromotedReport;
  related: PromotedReport[];
  onBack: () => void;
  onDownload: () => void;
  bookmarked: boolean;
  onBookmark: () => void;
  onOpenRelated: (r: PromotedReport) => void;
}) {
  const pages = useMemo(
    () => (report.pages?.length ? report.pages : [{ title: report.title, html: report.html_content }]),
    [report]
  );
  const [pageIdx, setPageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);
  const safe = useMemo(() => DOMPurify.sanitize(pages[pageIdx]?.html ?? ""), [pages, pageIdx]);
  const dateStr = report.report_date ? format(new Date(report.report_date), "PPP") : (report.promoted_at && format(new Date(report.promoted_at), "PPP"));

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / Math.max(h.scrollHeight - h.clientHeight, 1);
      setProgress(Math.min(100, Math.max(0, scrolled * 100)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goPage = (i: number) => {
    setPageIdx(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
        <div className="h-full bg-gradient-to-r from-primary via-blue-500 to-cyan-400 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <Button variant="ghost" onClick={onBack} className="mb-4 -ml-3">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to reports
      </Button>

      {/* ============ HERO ============ */}
      <div className="relative overflow-hidden rounded-3xl mb-10 bg-gradient-to-br from-slate-950 via-[#0c1733] to-slate-900">
        {report.hero_image_url && (
          <>
            <img src={report.hero_image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/40" />
          </>
        )}
        <div className="relative p-7 md:p-12 lg:p-16">
          <div className="flex items-center gap-3 mb-5">
            <img src={flowpulseLogo} alt="FlowPulse" className="h-10 w-10 rounded-lg bg-white/10 p-1.5 backdrop-blur" />
            <div>
              <div className="text-[10px] font-bold tracking-[0.3em] text-primary">FLOWPULSE RESEARCH</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                {report.asset_type === "crypto" ? "Digital Asset" : "Equity"} Intelligence · {dateStr}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {report.ticker && <Badge className="bg-primary text-primary-foreground font-mono text-sm px-3 py-1">{report.ticker}</Badge>}
            <Badge variant="outline" className="border-white/30 text-white">{pages.length} pages</Badge>
            {(report.ai_tags ?? []).slice(0, 4).map((t) => (
              <Badge key={t} variant="outline" className="border-white/20 text-white/90">#{t}</Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white max-w-4xl">
            {report.title}
          </h1>
          {report.excerpt && (
            <p className="text-lg md:text-xl text-slate-200/90 leading-relaxed mt-6 max-w-3xl">{report.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8 pt-6 border-t border-white/10">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">Analyst</div>
              <div className="text-sm font-semibold text-white mt-0.5">{report.author_name ?? "FlowPulse Research"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">Published</div>
              <div className="text-sm font-semibold text-white mt-0.5">{dateStr}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">Reading time</div>
              <div className="text-sm font-semibold text-white mt-0.5">{report.reading_time_minutes ?? 6} minutes</div>
            </div>
            {typeof report.ai_score === "number" && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400">Conviction</div>
                <div className="inline-flex items-center gap-1 mt-0.5 text-amber-300 font-bold">
                  <Star className="h-4 w-4 fill-amber-300" />{report.ai_score.toFixed(1)}<span className="text-slate-400 font-medium">/5</span>
                </div>
              </div>
            )}
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
              <Button size="sm" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10" onClick={onBookmark}>
                {bookmarked ? <><BookmarkCheck className="h-4 w-4 mr-2" />Saved</> : <><Bookmark className="h-4 w-4 mr-2" />Save</>}
              </Button>
              <Button size="sm" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
              <Button size="sm" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" /> PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ BODY ============ */}
      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        {/* TOC sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ListOrdered className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Contents</h3>
              </div>
              <nav className="space-y-1">
                {pages.map((p, i) => (
                  <button key={i} onClick={() => goPage(i)}
                    className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition leading-snug ${i === pageIdx ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}>
                    <span className="text-[10px] opacity-60 block">PAGE {i + 1}</span>
                    {p.title}
                  </button>
                ))}
              </nav>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Reading progress</div>
              <Progress value={progress} className="h-1.5 mt-2" />
              <div className="text-xs text-muted-foreground mt-2">{Math.round(progress)}% complete</div>
            </div>
          </div>
        </aside>

        {/* Article */}
        <main className="min-w-0">
          {/* page chip nav (mobile) */}
          {pages.length > 1 && (
            <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-3 mb-6 sticky top-0 bg-background/90 backdrop-blur z-10 py-2">
              {pages.map((p, i) => (
                <button key={i} onClick={() => goPage(i)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${i === pageIdx ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}>
                  {i + 1}. {p.title}
                </button>
              ))}
            </div>
          )}

          <div ref={articleRef}>
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold">Section {pageIdx + 1}</div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{pages[pageIdx]?.title}</h2>
              </div>
              <div className="hidden md:block text-xs text-muted-foreground">
                {pageIdx + 1} / {pages.length}
              </div>
            </div>

            <div className="cryptonary-article prose prose-lg prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: safe }} />
          </div>

          {/* Page nav (bottom) */}
          {pages.length > 1 && (
            <div className="mt-12 flex items-center justify-between gap-3 border-t pt-6">
              <Button variant="outline" disabled={pageIdx === 0} onClick={() => goPage(pageIdx - 1)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="text-left">
                  <span className="block text-[10px] uppercase tracking-widest opacity-60">Previous</span>
                  <span className="block text-sm truncate max-w-[180px]">{pages[pageIdx - 1]?.title ?? "—"}</span>
                </span>
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">{pageIdx + 1} / {pages.length}</span>
              <Button disabled={pageIdx >= pages.length - 1} onClick={() => goPage(pageIdx + 1)}>
                <span className="text-right">
                  <span className="block text-[10px] uppercase tracking-widest opacity-80">Next</span>
                  <span className="block text-sm truncate max-w-[180px]">{pages[pageIdx + 1]?.title ?? "—"}</span>
                </span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Sources (last page) */}
          {pageIdx === pages.length - 1 && report.sources && report.sources.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="font-bold text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Sources & Citations</h3>
              <ol className="space-y-2 text-sm list-decimal pl-5">
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

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-16 pt-10 border-t">
              <h3 className="text-xl font-bold mb-5">Continue reading</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {related.map((r) => (
                  <button key={r.id} onClick={() => onOpenRelated(r)}
                    className="group flex gap-4 text-left p-3 rounded-xl border bg-card hover:border-primary/40 hover:shadow-lg transition">
                    <img src={r.hero_image_url ?? fallbackImg(0)} alt="" className="h-20 w-24 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      {r.ticker && <Badge variant="outline" className="font-mono text-[10px] mb-1">{r.ticker}</Badge>}
                      <div className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition">{r.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <Clock className="h-3 w-3" />{r.reading_time_minutes ?? 6}m
                        {typeof r.ai_score === "number" && (<><span>·</span><span className="inline-flex items-center gap-0.5 text-amber-600"><Star className="h-3 w-3 fill-amber-500" />{r.ai_score.toFixed(1)}</span></>)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Branded footer */}
          <div className="mt-16 pt-6 border-t text-center space-y-2">
            <div className="inline-flex items-center gap-2">
              <img src={flowpulseLogo} alt="" className="h-4 w-4 rounded" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">FlowPulse Research</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
              Institutional-grade {report.asset_type === "crypto" ? "digital asset" : "equity"} intelligence · {dateStr}
            </div>
            <p className="text-[10px] text-muted-foreground/60 max-w-xl mx-auto pt-2">
              This research is for informational purposes only and does not constitute investment advice. All analysis is model-assisted and should be independently verified.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
