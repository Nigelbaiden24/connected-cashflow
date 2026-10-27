import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import {
  Loader2, Search, Clock, ArrowLeft, Download, Share2, Star, ChevronLeft, ChevronRight,
  Bookmark, BookmarkCheck, Sparkles, Flame, ArrowUpRight, ListOrdered,
  LayoutGrid, Rows3, Printer, CheckCircle2, RefreshCw, X, FileText, Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { ConvictionRing, ReportCover, scoreTone } from "@/components/research/ReportCover";
import {
  type ConvictionBand, type PromotedReport, convictionBand, isNew, loadBookmarks, loadReadIds, markRead,
  prefetchReport, reportDate, saveBookmarks, useFullReport, usePrefetchOtherDesk, useResearchList,
} from "@/lib/researchFeed";

interface Props {
  assetType: "stock" | "crypto";
}

type Period = "all" | "7" | "30" | "90";
const PAGE_SIZE = 24;

const BAND_LABEL: Record<ConvictionBand | "all", string> = {
  all: "All", high: "High ≥4", medium: "Moderate 3–4", low: "Low <3", unrated: "Unrated",
};

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: Array<{ value: T; label: string }> }) {
  return (
    <div className="inline-flex shrink-0 rounded-xl border bg-muted/40 p-1">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${value === o.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function CryptonaryReportsFeed({ assetType }: Props) {
  const qc = useQueryClient();
  const { data: items = [], isLoading, isFetching, error, refetch, dataUpdatedAt } = useResearchList(assetType);
  const prefetchOther = usePrefetchOtherDesk(assetType);

  const [activeId, setActiveId] = useState<string | null>(() => new URLSearchParams(window.location.search).get("report"));
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "score" | "az">("recent");
  const [band, setBand] = useState<ConvictionBand | "all">("all");
  const [period, setPeriod] = useState<Period>("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [layout, setLayout] = useState<"grid" | "list">(() => (localStorage.getItem("fp_research_layout") === "list" ? "list" : "grid"));
  const [bookmarks, setBookmarks] = useState<string[]>(loadBookmarks);
  const [readIds, setReadIds] = useState<string[]>(loadReadIds);
  const [shown, setShown] = useState(PAGE_SIZE);
  const searchRef = useRef<HTMLInputElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Warm the other desk once this one has painted.
  useEffect(() => {
    if (!isLoading) { const t = setTimeout(prefetchOther, 1500); return () => clearTimeout(t); }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (error) toast.error((error as Error).message || "Couldn't refresh reports"); }, [error]);

  // "/" focuses search, Esc clears it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement)?.tagName ?? "");
      if (e.key === "/" && !typing && !activeId) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape" && document.activeElement === searchRef.current) setQuery("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  const listed = items.find((r) => r.id === activeId) ?? null;
  const full = useFullReport(activeId);
  const active: PromotedReport | null = useMemo(() => {
    if (!activeId) return null;
    const f = full.data ?? {};
    if (!listed && !full.data) return null;
    return {
      ...(listed ?? ({} as PromotedReport)),
      ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== null && v !== undefined)),
      id: activeId,
    } as PromotedReport;
  }, [activeId, listed, full.data]);

  const setUrlReport = (id: string | null) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("report", id); else url.searchParams.delete("report");
    window.history.replaceState(window.history.state, "", url.toString());
  };

  const openReport = useCallback((r: PromotedReport) => {
    setActiveId(r.id);
    setUrlReport(r.id);
    markRead(r.id);
    setReadIds(loadReadIds());
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }, []);

  const closeReport = () => { setActiveId(null); setUrlReport(null); };

  const hover = useCallback((r: PromotedReport) => { void prefetchReport(qc, r.id); }, [qc]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveBookmarks(next);
      return next;
    });
  };

  const allTags = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((r) => (r.ai_tags ?? []).forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 14);
  }, [items]);

  const filtered = useMemo(() => {
    const since = period === "all" ? 0 : Date.now() - Number(period) * 86_400_000;
    const q = query.trim().toLowerCase();
    const list = items.filter((r) => {
      if (tagFilter !== "all" && !(r.ai_tags ?? []).includes(tagFilter)) return false;
      if (band !== "all" && convictionBand(r.ai_score) !== band) return false;
      if (since && reportDate(r).getTime() < since) return false;
      if (savedOnly && !bookmarks.includes(r.id)) return false;
      if (!q) return true;
      return r.title.toLowerCase().includes(q) || (r.ticker ?? "").toLowerCase().includes(q) ||
        (r.excerpt ?? "").toLowerCase().includes(q) || (r.ai_tags ?? []).some((t) => t.toLowerCase().includes(q));
    });
    return list.sort((a, b) => {
      if (sort === "score") return (b.ai_score ?? -1) - (a.ai_score ?? -1);
      if (sort === "az") return a.title.localeCompare(b.title);
      return reportDate(b).getTime() - reportDate(a).getTime();
    });
  }, [items, query, tagFilter, band, period, savedOnly, bookmarks, sort]);

  useEffect(() => { setShown(PAGE_SIZE); }, [query, tagFilter, band, period, savedOnly, sort, assetType]);

  // Load more as the end of the list comes into view.
  useEffect(() => {
    const el = moreRef.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) setShown((n) => n + PAGE_SIZE); }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length, shown, layout]);

  const filtersOn = !!query.trim() || tagFilter !== "all" || band !== "all" || period !== "all" || savedOnly;
  const clearFilters = () => { setQuery(""); setTagFilter("all"); setBand("all"); setPeriod("all"); setSavedOnly(false); };

  const featured = !filtersOn && sort === "recent" ? filtered[0] : undefined;
  const archive = featured ? filtered.slice(1) : filtered;
  const visible = archive.slice(0, shown);
  const groups = useMemo(() => {
    if (sort !== "recent") return [{ key: "all", label: "", items: visible }];
    const m = new Map<string, PromotedReport[]>();
    visible.forEach((r) => {
      const k = format(reportDate(r), "MMMM yyyy");
      m.set(k, [...(m.get(k) ?? []), r]);
    });
    return Array.from(m.entries()).map(([k, v]) => ({ key: k, label: k, items: v }));
  }, [visible, sort]);

  const topConviction = useMemo(() => [...items].filter((r) => typeof r.ai_score === "number").sort((a, b) => (b.ai_score ?? 0) - (a.ai_score ?? 0)).slice(0, 5), [items]);
  const scored = items.filter((r) => typeof r.ai_score === "number");
  const avg = scored.length ? scored.reduce((s, r) => s + (r.ai_score ?? 0), 0) / scored.length : null;
  const highCount = items.filter((r) => convictionBand(r.ai_score) === "high").length;
  const unread = items.filter((r) => !readIds.includes(r.id)).length;
  const latest = items.length ? items.reduce((a, b) => (reportDate(a) > reportDate(b) ? a : b)) : null;

  const handleDownloadPdf = async (r: PromotedReport) => {
    try {
      const html2pdf = (await import("html2pdf.js")).default as any;
      const pages = r.pages?.length ? r.pages : [{ title: r.title, html: r.html_content }];
      const dateStr = r.report_date ? format(new Date(r.report_date), "PPP") : (r.promoted_at ? format(new Date(r.promoted_at), "PPP") : format(new Date(), "PPP"));
      const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
          .article ul, .article ol { padding-left: 20px; margin: 10px 0; }
          .article sup a { color: #1d4ed8; text-decoration: none; font-family: Arial, sans-serif; font-size: 9px; font-weight: 700; }
          .article a { color: #1d4ed8; word-break: break-word; }
          .article .note { font-size: 11px; color: #64748b; }
          .article table.data-table tr, .article .stat-grid, .article .callout { page-break-inside: avoid; }
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
          ${r.ticker ? `<div class="ticker">${esc(r.ticker)}</div>` : ""}
          <h1>${esc(r.title)}</h1>
          ${r.excerpt ? `<p class="lede">${esc(r.excerpt)}</p>` : ""}
          ${r.hero_image_url ? `<img src="${esc(r.hero_image_url)}" style="width:100%;height:240px;object-fit:cover;border-radius:6px;margin-top:18px" />` : ""}
          <div class="kv">
            <div>Conviction <span>${typeof r.ai_score === "number" ? r.ai_score.toFixed(1) : "—"} / 5</span></div>
            <div>Pages <span>${pages.length}</span></div>
            <div>Reading <span>${r.reading_time_minutes ?? 6} min</span></div>
            <div>Date <span>${dateStr}</span></div>
          </div>
          <div class="footer"><span>FlowPulse Research · For information only, not personal investment advice</span><span>Cover</span></div>
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
            <div class="footer"><span>FlowPulse Research · For information only, not personal investment advice</span><span>Page ${i + 1} of ${pages.length}</span></div>
          </div>
        `).join("")}
      `;
      await html2pdf().from(container).set({
        margin: 0,
        filename: `${r.slug}.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".stat-grid", ".callout"] },
      }).save();
    } catch (e: any) {
      toast.error("PDF export failed: " + (e.message ?? "unknown"));
    }
  };

  if (activeId) {
    if (!active) {
      return (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          {full.isError ? (
            <div className="text-center space-y-3">
              <p>This report couldn't be loaded.</p>
              <Button variant="outline" onClick={closeReport}><ArrowLeft className="h-4 w-4 mr-2" /> Back to reports</Button>
            </div>
          ) : <><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading report…</>}
        </div>
      );
    }
    const related = items.filter((x) => x.id !== active.id && (x.ai_tags ?? []).some((t) => (active.ai_tags ?? []).includes(t))).slice(0, 4);
    return (
      <ReportReader
        report={active}
        loadingBody={full.isFetching && !active.pages?.length && !active.html_content}
        related={related.length ? related : items.filter((x) => x.id !== active.id).slice(0, 4)}
        onOpenRelated={openReport}
        onBack={closeReport}
        onDownload={() => handleDownloadPdf(active)}
        bookmarked={bookmarks.includes(active.id)}
        onBookmark={() => toggleBookmark(active.id)}
      />
    );
  }

  const label = assetType === "crypto" ? "Digital Asset" : "Equity";
  const cardProps = (r: PromotedReport) => ({
    report: r,
    onClick: () => openReport(r),
    onHover: () => hover(r),
    onBookmark: () => toggleBookmark(r.id),
    bookmarked: bookmarks.includes(r.id),
    read: readIds.includes(r.id),
  });

  return (
    <div className="space-y-6">
      {/* ============ MASTHEAD ============ */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#070b16] p-6 text-white md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_0%_0%,rgba(59,130,246,0.25),transparent_60%),radial-gradient(40%_70%_at_100%_100%,rgba(245,158,11,0.14),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">
                <img src={flowpulseLogo} alt="" className="h-3.5 w-3.5 rounded" /> FlowPulse Research · {label} Desk
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                {isFetching ? <RefreshCw className="h-3 w-3 animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />}
                {isFetching ? "Syncing" : dataUpdatedAt ? `Synced ${formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}` : "Live"}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {assetType === "crypto" ? "Digital Asset Intelligence" : "Equity Research Terminal"}
            </h1>
            <p className="text-sm leading-relaxed text-slate-300/90 md:text-base">
              Every {label.toLowerCase()} dossier published by the FlowPulse analyst desk, with conviction scoring, multi-page deep dives and PDF export.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Kpi label="In archive" value={items.length} />
            <Kpi label="High conviction" value={highCount} accent="text-emerald-300" />
            <Kpi label="Avg conviction" value={avg !== null ? avg.toFixed(1) : "–"} suffix={avg !== null ? "/5" : ""} />
            <Kpi label="Unread" value={unread} accent="text-sky-300" sub={latest ? `latest ${formatDistanceToNow(reportDate(latest))} ago` : undefined} />
          </div>
        </div>
      </div>

      {/* ============ CONTROL BAR ============ */}
      <div className="sticky top-0 z-20 -mx-1 space-y-3 border-b bg-background/85 px-1 py-3 backdrop-blur-xl">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${items.length} ${label.toLowerCase()} reports, tickers, themes…`}
              className="h-11 rounded-xl border-border/60 bg-card/60 pl-10 pr-12" />
            {query ? (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            ) : (
              <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:block">/</kbd>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            <Segmented value={band} onChange={(v) => setBand(v)} options={(["all", "high", "medium", "low"] as const).map((v) => ({ value: v, label: BAND_LABEL[v] }))} />
            <Segmented value={period} onChange={(v) => setPeriod(v)} options={[{ value: "all", label: "All time" }, { value: "7", label: "7d" }, { value: "30", label: "30d" }, { value: "90", label: "90d" }]} />
          </div>
          <div className="flex gap-2">
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="h-11 w-[170px] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="score">Highest conviction</SelectItem>
                <SelectItem value="az">Title A–Z</SelectItem>
              </SelectContent>
            </Select>
            <Button variant={savedOnly ? "default" : "outline"} className="h-11 rounded-xl" onClick={() => setSavedOnly((v) => !v)} title="Saved reports only">
              <Bookmark className="h-4 w-4" /><span className="ml-1.5 hidden xl:inline">Saved</span>{bookmarks.length > 0 && <span className="ml-1.5 text-xs opacity-70">{bookmarks.length}</span>}
            </Button>
            <div className="inline-flex rounded-xl border bg-muted/40 p-1">
              {(["grid", "list"] as const).map((l) => (
                <button key={l} onClick={() => { setLayout(l); try { localStorage.setItem("fp_research_layout", l); } catch { /* ignore */ } }}
                  aria-label={l === "grid" ? "Grid view" : "List view"}
                  className={`rounded-lg px-2.5 transition ${layout === l ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
                  {l === "grid" ? <LayoutGrid className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {allTags.map(([tag, count]) => (
              <button key={tag} onClick={() => setTagFilter(tag === tagFilter ? "all" : tag)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs transition ${tag === tagFilter ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}>
                {tag} <span className="opacity-60">{count}</span>
              </button>
            ))}
          </div>
        )}
        {filtersOn && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{filtered.length} of {items.length} reports match</span>
            <button onClick={clearFilters} className="font-medium text-primary hover:underline">Clear filters</button>
          </div>
        )}
      </div>

      {/* ============ BODY ============ */}
      {isLoading && !items.length ? (
        <FeedSkeleton />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border bg-muted/30 py-20 text-center">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-semibold">{items.length ? "No reports match these filters" : "No research reports yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length ? "Try widening the period or conviction filter." : `${label} reports appear here as soon as the analyst desk publishes them.`}
          </p>
          {items.length > 0 && <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear filters</Button>}
          {error && !items.length && <Button variant="outline" className="mt-4" onClick={() => refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Retry</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-8">
            {featured && <FeaturedCard {...cardProps(featured)} assetType={assetType} />}

            {groups.map((g) => (
              <section key={g.key}>
                {g.label && (
                  <div className="mb-3 flex items-baseline justify-between border-b pb-2">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">{g.label}</h2>
                    <span className="text-xs text-muted-foreground">{g.items.length} report{g.items.length === 1 ? "" : "s"}</span>
                  </div>
                )}
                {layout === "grid" ? (
                  <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                    {g.items.map((r) => <GridCard key={r.id} {...cardProps(r)} />)}
                  </div>
                ) : (
                  <div className="divide-y overflow-hidden rounded-2xl border bg-card">
                    {g.items.map((r) => <ListRow key={r.id} {...cardProps(r)} />)}
                  </div>
                )}
              </section>
            ))}

            {shown < archive.length ? (
              <div ref={moreRef} className="flex justify-center">
                <Button variant="outline" onClick={() => setShown((n) => n + PAGE_SIZE)}>
                  Show more <span className="ml-1.5 text-muted-foreground">({archive.length - shown} remaining)</span>
                </Button>
              </div>
            ) : archive.length > PAGE_SIZE ? (
              <p className="text-center text-xs text-muted-foreground">You've reached the start of the archive · {filtered.length} reports</p>
            ) : null}
          </div>

          {/* ============ SIDEBAR ============ */}
          <aside className="space-y-5 lg:sticky lg:top-40 lg:self-start">
            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Top conviction</h3>
              </div>
              <ol className="space-y-3.5">
                {topConviction.map((r) => (
                  <li key={r.id}>
                    <button onClick={() => openReport(r)} onMouseEnter={() => hover(r)} className="group flex w-full items-center gap-3 text-left">
                      <div className="rounded-full bg-[#070b16] p-0.5"><ConvictionRing score={r.ai_score} size={38} stroke={3.5} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-primary">{r.title}</div>
                        {r.ticker && <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{r.ticker}</div>}
                      </div>
                    </button>
                  </li>
                ))}
                {topConviction.length === 0 && <p className="text-xs italic text-muted-foreground">No scored reports yet.</p>}
              </ol>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Saved</h3>
                </div>
                {bookmarks.length > 0 && <button onClick={() => setSavedOnly(true)} className="text-[11px] text-primary hover:underline">View all</button>}
              </div>
              {bookmarks.length > 0 ? (
                <div className="space-y-1.5">
                  {items.filter((r) => bookmarks.includes(r.id)).slice(0, 5).map((r) => (
                    <button key={r.id} onClick={() => openReport(r)} className="block w-full truncate text-left text-xs transition hover:text-primary">{r.title}</button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Use the bookmark on any report to keep it here.</p>
              )}
            </div>

            <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-5 text-xs text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 text-foreground"><Layers className="h-4 w-4 text-primary" /><span className="font-bold uppercase tracking-wider">Conviction scale</span></div>
              <div className="space-y-1.5">
                <p><span className="font-semibold text-emerald-600">4.0–5.0</span> High conviction</p>
                <p><span className="font-semibold text-amber-600">3.0–3.9</span> Moderate</p>
                <p><span className="font-semibold text-rose-600">below 3.0</span> Low / cautious</p>
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

function Kpi({ label, value, suffix, accent = "text-white", sub }: { label: string; value: number | string; suffix?: string; accent?: string; sub?: string }) {
  return (
    <div className="min-w-[120px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${accent}`}>{value}<span className="ml-0.5 text-xs font-medium text-slate-400">{suffix}</span></div>
      {sub && <div className="mt-0.5 truncate text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}

interface CardProps {
  report: PromotedReport;
  onClick: () => void;
  onHover: () => void;
  onBookmark: () => void;
  bookmarked: boolean;
  read: boolean;
}

const shortDate = (r: PromotedReport) => format(reportDate(r), "d MMM yyyy");

function BookmarkButton({ bookmarked, onBookmark, dark = false }: { bookmarked: boolean; onBookmark: () => void; dark?: boolean }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onBookmark(); }} aria-label={bookmarked ? "Remove bookmark" : "Bookmark report"}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition ${dark ? "border border-white/15 bg-black/30 backdrop-blur hover:bg-black/50" : "hover:bg-muted"}`}>
      {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className={`h-4 w-4 ${dark ? "text-white" : "text-muted-foreground"}`} />}
    </button>
  );
}

function Pills({ r, read }: { r: PromotedReport; read: boolean }) {
  return (
    <>
      {isNew(r) && <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">New</span>}
      {read && <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur"><CheckCircle2 className="h-3 w-3" /> Read</span>}
    </>
  );
}

function FeaturedCard({ report: r, onClick, onHover, onBookmark, bookmarked, read, assetType }: CardProps & { assetType: string }) {
  const tone = scoreTone(r.ai_score);
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#070b16] transition-all duration-500 hover:border-primary/50 hover:shadow-[0_30px_80px_-30px_rgba(37,99,235,0.45)]">
      <button onClick={onClick} onMouseEnter={onHover} onFocus={onHover} className="grid w-full text-left lg:grid-cols-[1.1fr_1fr]">
        <ReportCover report={r} size="lg" className="h-64 lg:h-full lg:min-h-[380px]" />
        <div className="relative flex flex-col justify-center p-7 lg:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">Latest</span>
            <Pills r={r} read={read} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{assetType === "crypto" ? "Digital asset" : "Equity"} · {shortDate(r)}</span>
          </div>
          <h2 className="text-2xl font-bold leading-[1.15] tracking-tight text-white transition group-hover:text-sky-200 lg:text-[2rem]">{r.title}</h2>
          {r.excerpt && <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-slate-300/90">{r.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-5 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">{r.author_name ?? "FlowPulse Research"}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{r.reading_time_minutes ?? 6} min</span>
            <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" />{r.page_count ?? 1} pages</span>
            <span className={`font-semibold ${tone.text}`}>{tone.label}</span>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 transition-all group-hover:gap-3">
            Read the dossier <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </button>
      <div className="absolute right-4 top-4"><BookmarkButton bookmarked={bookmarked} onBookmark={onBookmark} dark /></div>
    </div>
  );
}

function GridCard({ report: r, onClick, onHover, onBookmark, bookmarked, read }: CardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)]">
      <button onClick={onClick} onMouseEnter={onHover} onFocus={onHover} className="flex flex-1 flex-col text-left">
        <div className="relative">
          <ReportCover report={r} className="h-40" />
          <div className="absolute left-3 top-3 flex gap-1.5"><Pills r={r} read={read} /></div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug transition group-hover:text-primary">{r.title}</h3>
          {r.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.excerpt}</p>}
          {(r.ai_tags ?? []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {(r.ai_tags ?? []).slice(0, 3).map((t) => <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>)}
            </div>
          )}
          <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground" style={{ marginTop: "auto", paddingTop: "0.75rem" }}>
            <span>{shortDate(r)}</span>
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" />{r.page_count ?? 1}p</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{r.reading_time_minutes ?? 6}m</span>
            </span>
          </div>
        </div>
      </button>
      <div className="absolute right-3 top-3"><BookmarkButton bookmarked={bookmarked} onBookmark={onBookmark} dark /></div>
    </div>
  );
}

function ListRow({ report: r, onClick, onHover, onBookmark, bookmarked, read }: CardProps) {
  const tone = scoreTone(r.ai_score);
  return (
    <div className="group flex items-center gap-4 p-3 transition hover:bg-muted/40">
      <button onClick={onClick} onMouseEnter={onHover} onFocus={onHover} className="flex min-w-0 flex-1 items-center gap-4 text-left">
        <ReportCover report={r} size="sm" showRing={false} className="h-16 w-20 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            {r.ticker && <span className="font-mono text-[11px] font-semibold text-muted-foreground">{r.ticker}</span>}
            {isNew(r) && <span className="rounded-full bg-sky-500 px-1.5 text-[9px] font-bold uppercase text-white">New</span>}
            {read && <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" aria-label="Read" />}
          </div>
          <h3 className="line-clamp-1 text-sm font-semibold transition group-hover:text-primary">{r.title}</h3>
          {r.excerpt && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{r.excerpt}</p>}
        </div>
        <div className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
          <div className={`font-semibold ${tone.text.replace("300", "600")}`}>{typeof r.ai_score === "number" ? `${r.ai_score.toFixed(1)}/5` : "–"}</div>
          <div>{shortDate(r)}</div>
        </div>
      </button>
      <BookmarkButton bookmarked={bookmarked} onBookmark={onBookmark} />
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-[380px] animate-pulse rounded-3xl bg-muted/40" />
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted/40" />)}
      </div>
    </div>
  );
}

/* =============================================================
   REPORT READER (enterprise reading experience)
============================================================== */

function ReportReader({
  report, related, onBack, onDownload, bookmarked, onBookmark, onOpenRelated, loadingBody = false,
}: {
  report: PromotedReport;
  loadingBody?: boolean;
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

  useEffect(() => { setPageIdx(0); }, [report.id]);

  // ← / → turn pages.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/input|textarea|select/i.test((e.target as HTMLElement)?.tagName ?? "")) return;
      if (e.key === "ArrowRight" && pageIdx < pages.length - 1) goPage(pageIdx + 1);
      if (e.key === "ArrowLeft" && pageIdx > 0) goPage(pageIdx - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pageIdx, pages.length]);

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

            {safe && !loadingBody ? (
              <div className="cryptonary-article prose prose-lg prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: safe }} />
            ) : (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading report…
              </div>
            )}
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
                    <ReportCover report={r} size="sm" showRing={false} className="h-20 w-24 shrink-0 rounded-lg" />
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
