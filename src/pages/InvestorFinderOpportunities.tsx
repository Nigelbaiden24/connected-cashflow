import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Sparkles, TrendingUp, MapPin, Tag, ExternalLink, Target,
  Activity, Layers, Globe, Filter, Star, ArrowUpRight, Compass,
  LayoutGrid, Rows, Bookmark, BookmarkCheck, Download, X, Building2,
  ChevronDown, BarChart3, Shield, Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InvestorFinderOpp {
  id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  sector: string | null;
  sub_sector: string | null;
  geography: string | null;
  country: string | null;
  stage: string | null;
  ticket_size_min: number | null;
  ticket_size_max: number | null;
  currency: string | null;
  return_potential: string | null;
  expected_irr: number | null;
  expected_moic: number | null;
  conviction_score: number | null;
  ai_score: number | null;
  ai_tags: string[] | null;
  highlights: string[] | null;
  risks: string[] | null;
  thesis: string | null;
  image_url: string | null;
  source_url: string | null;
  source: string | null;
  category: string | null;
  status: string;
  featured: boolean;
  created_at: string;
}

const formatMoney = (v: number | null, ccy = "GBP") => {
  if (!v) return "—";
  const sym = ccy === "GBP" ? "£" : ccy === "USD" ? "$" : ccy === "EUR" ? "€" : `${ccy} `;
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(0)}k`;
  return `${sym}${v.toFixed(0)}`;
};

const SAVED_KEY = "investor-finder-saved";
const loadSaved = (): string[] => {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]"); } catch { return []; }
};

interface Props { variant?: "finance" | "investor" }

export default function InvestorFinderOpportunities({ variant = "investor" }: Props) {
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<string>("all");
  const [geo, setGeo] = useState<string>("all");
  const [stage, setStage] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<"conviction" | "newest" | "irr" | "ticket">("conviction");
  const [tab, setTab] = useState<"all" | "featured" | "saved">("all");
  const [saved, setSaved] = useState<string[]>(loadSaved);
  const [selected, setSelected] = useState<InvestorFinderOpp | null>(null);

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      toast.success(prev.includes(id) ? "Removed from shortlist" : "Saved to shortlist");
      return next;
    });
  };

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["investor-finder-opps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investor_finder_opportunities" as any)
        .select("*")
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("conviction_score", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as unknown as InvestorFinderOpp[];
    },
    staleTime: 60_000,
  });

  const sectors = useMemo(() => Array.from(new Set(items.map(i => i.sector).filter(Boolean))) as string[], [items]);
  const geos = useMemo(() => Array.from(new Set(items.map(i => i.geography).filter(Boolean))) as string[], [items]);
  const stages = useMemo(() => Array.from(new Set(items.map(i => i.stage).filter(Boolean))) as string[], [items]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = items.filter(i => {
      if (tab === "featured" && !i.featured) return false;
      if (tab === "saved" && !saved.includes(i.id)) return false;
      if (sector !== "all" && i.sector !== sector) return false;
      if (geo !== "all" && i.geography !== geo) return false;
      if (stage !== "all" && i.stage !== stage) return false;
      if (!term) return true;
      const hay = [i.title, i.short_description, i.thesis, i.sector, i.geography, ...(i.ai_tags ?? [])]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(term);
    });
    list = [...list].sort((a, b) => {
      if (sort === "newest") return +new Date(b.created_at) - +new Date(a.created_at);
      if (sort === "irr") return (Number(b.expected_irr) || 0) - (Number(a.expected_irr) || 0);
      if (sort === "ticket") return (Number(b.ticket_size_max) || 0) - (Number(a.ticket_size_max) || 0);
      return (Number(b.conviction_score) || 0) - (Number(a.conviction_score) || 0);
    });
    return list;
  }, [items, q, sector, geo, stage, tab, saved, sort]);

  const stats = useMemo(() => ({
    total: items.length,
    featured: items.filter(i => i.featured).length,
    avgScore: items.length ? (items.reduce((a, i) => a + (Number(i.conviction_score) || 0), 0) / items.length).toFixed(1) : "—",
    sectors: sectors.length,
    avgIrr: (() => {
      const xs = items.map(i => Number(i.expected_irr)).filter(x => x > 0);
      return xs.length ? `${(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1)}%` : "—";
    })(),
  }), [items, sectors]);

  const accentText = "text-slate-900";
  const accentRing = "ring-slate-900/10";
  const accentBtn = "bg-slate-900 hover:bg-slate-800 text-white";
  const accentSoft = "bg-slate-100 text-slate-700 border-slate-200";

  const exportCsv = () => {
    const rows = [
      ["Title", "Sector", "Geography", "Stage", "Ticket Min", "Ticket Max", "IRR", "MOIC", "Conviction", "Source"],
      ...filtered.map(o => [
        o.title, o.sector ?? "", o.geography ?? "", o.stage ?? "",
        o.ticket_size_min ?? "", o.ticket_size_max ?? "",
        o.expected_irr ?? "", o.expected_moic ?? "", o.conviction_score ?? "", o.source_url ?? "",
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `investor-finder-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,_#0f172a_1px,_transparent_0)] [background-size:24px_24px]" />
        
        <div className="relative max-w-[1400px] mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">
            <Compass className={cn("h-4 w-4", accentText)} />
            <span>FlowPulse Intelligence</span>
            <span className="opacity-40">/</span>
            <span className="text-slate-700">Investor Finder</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Curated investment opportunities,<br />
                <span className={accentText}>sourced live.</span>
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                AI-aggregated from premier deal-flow sources, scored for conviction, and reviewed by FlowPulse analysts before publishing.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportCsv} className="border-slate-300">
                <Download className="h-4 w-4 mr-2" />Export CSV
              </Button>
              <Button className={accentBtn}>
                <Zap className="h-4 w-4 mr-2" />Subscribe to alerts
              </Button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Live Opportunities", value: stats.total, icon: Activity, color: "text-slate-700", bg: "bg-slate-100" },
              { label: "Avg Conviction", value: `${stats.avgScore}/5`, icon: Star, color: "text-slate-700", bg: "bg-slate-100" },
              { label: "Avg Target IRR", value: stats.avgIrr, icon: TrendingUp, color: "text-slate-700", bg: "bg-slate-100" },
              { label: "Featured", value: stats.featured, icon: Sparkles, color: "text-slate-700", bg: "bg-slate-100" },
              { label: "Sectors", value: stats.sectors, icon: Layers, color: "text-slate-700", bg: "bg-slate-100" },
            ].map(k => (
              <div key={k.label} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{k.label}</span>
                  <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", k.bg)}>
                    <k.icon className={cn("h-3.5 w-3.5", k.color)} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter / Tabs bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 py-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="bg-slate-100">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="featured" className="gap-1"><Star className="h-3 w-3" />Featured</TabsTrigger>
                <TabsTrigger value="saved" className="gap-1"><Bookmark className="h-3 w-3" />Saved {saved.length > 0 && <span className="ml-1 text-[10px] px-1.5 rounded-full bg-slate-900 text-white">{saved.length}</span>}</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="border-slate-200 text-slate-600 bg-white">{filtered.length} results</Badge>
              <div className="flex rounded-md border border-slate-200 bg-white overflow-hidden">
                <button onClick={() => setView("grid")} className={cn("p-1.5", view === "grid" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}><LayoutGrid className="h-4 w-4" /></button>
                <button onClick={() => setView("list")} className={cn("p-1.5", view === "list" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}><Rows className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search by company, sector, thesis, tag…"
                className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger className="w-[160px] bg-white border-slate-200"><Filter className="h-3.5 w-3.5 mr-1.5 text-slate-500" /><SelectValue placeholder="Sector" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All sectors</SelectItem>{sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={geo} onValueChange={setGeo}>
              <SelectTrigger className="w-[160px] bg-white border-slate-200"><Globe className="h-3.5 w-3.5 mr-1.5 text-slate-500" /><SelectValue placeholder="Geography" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All regions</SelectItem>{geos.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="w-[160px] bg-white border-slate-200"><Target className="h-3.5 w-3.5 mr-1.5 text-slate-500" /><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All stages</SelectItem>{stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as any)}>
              <SelectTrigger className="w-[180px] bg-white border-slate-200"><ChevronDown className="h-3.5 w-3.5 mr-1.5 text-slate-500" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="conviction">Sort: Conviction</SelectItem>
                <SelectItem value="newest">Sort: Newest</SelectItem>
                <SelectItem value="irr">Sort: Target IRR</SelectItem>
                <SelectItem value="ticket">Sort: Ticket size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-white border-slate-200">
            <CardContent className="p-12 text-center">
              <Sparkles className={cn("h-10 w-10 mx-auto mb-3", accentText)} />
              <h3 className="text-lg font-semibold text-slate-900">No opportunities match</h3>
              <p className="text-sm text-slate-500 mt-1">Adjust filters or check back shortly — FlowPulse is continuously scanning.</p>
            </CardContent>
          </Card>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(opp => {
              const isSaved = saved.includes(opp.id);
              return (
                <article key={opp.id} className={cn("group relative overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ring-1 ring-transparent hover:ring-2", accentRing)}>
                  <button onClick={() => setSelected(opp)} className="block w-full text-left">
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      {opp.image_url ? (
                        <img src={opp.image_url} alt={opp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <Building2 className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      {opp.featured && (
                        <Badge className="absolute top-3 left-3 bg-amber-400 text-slate-900 border-0 gap-1 shadow"><Star className="h-3 w-3 fill-current" />Featured</Badge>
                      )}
                      {opp.conviction_score != null && (
                        <Badge className="absolute top-3 right-3 bg-white/95 text-slate-900 border-0 backdrop-blur shadow">
                          <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />{Number(opp.conviction_score).toFixed(1)}/5
                        </Badge>
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 leading-tight line-clamp-2">{opp.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1 min-h-[40px]">{opp.short_description ?? opp.thesis ?? "—"}</p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {opp.sector && <Badge variant="outline" className={cn("text-[10px] border", accentSoft)}><Tag className="h-2.5 w-2.5 mr-1" />{opp.sector}</Badge>}
                        {opp.geography && <Badge variant="outline" className="border-slate-200 text-slate-600 text-[10px]"><MapPin className="h-2.5 w-2.5 mr-1" />{opp.geography}</Badge>}
                        {opp.stage && <Badge variant="outline" className="border-slate-200 text-slate-600 text-[10px]"><Target className="h-2.5 w-2.5 mr-1" />{opp.stage}</Badge>}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-slate-400">Ticket</div>
                          <div className="text-xs font-semibold text-slate-900 tabular-nums">
                            {opp.ticket_size_min || opp.ticket_size_max
                              ? `${formatMoney(opp.ticket_size_min, opp.currency ?? "GBP")}–${formatMoney(opp.ticket_size_max, opp.currency ?? "GBP")}`
                              : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-slate-400">IRR</div>
                          <div className="text-xs font-semibold text-emerald-600 tabular-nums">{opp.expected_irr ? `${opp.expected_irr}%` : "—"}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-slate-400">MOIC</div>
                          <div className="text-xs font-semibold text-sky-600 tabular-nums">{opp.expected_moic ? `${opp.expected_moic}x` : "—"}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                        <span>{formatDistanceToNow(new Date(opp.created_at), { addSuffix: true })}</span>
                        <span className={cn("inline-flex items-center gap-1 font-medium group-hover:gap-1.5 transition-all", accentText)}>
                          View detail <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSave(opp.id); }}
                    className={cn("absolute bottom-3 right-3 h-8 w-8 rounded-full flex items-center justify-center border transition",
                      isSaved ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900")}
                    aria-label={isSaved ? "Remove from shortlist" : "Save to shortlist"}
                  >
                    {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          // List view
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 bg-slate-50">
              <div className="col-span-5">Opportunity</div>
              <div className="col-span-2">Sector / Geo</div>
              <div className="col-span-1">Stage</div>
              <div className="col-span-2">Ticket</div>
              <div className="col-span-1 text-right">IRR</div>
              <div className="col-span-1 text-right">Score</div>
            </div>
            {filtered.map(opp => {
              const isSaved = saved.includes(opp.id);
              return (
                <button key={opp.id} onClick={() => setSelected(opp)}
                  className="w-full grid grid-cols-12 items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 transition border-b border-slate-100 last:border-b-0">
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                      {opp.image_url
                        ? <img src={opp.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center"><Building2 className="h-4 w-4 text-slate-400" /></div>}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900 truncate">{opp.title}</span>
                        {opp.featured && <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{opp.short_description ?? opp.thesis ?? "—"}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-slate-600 truncate">
                    <div>{opp.sector ?? "—"}</div>
                    <div className="text-slate-400">{opp.geography ?? "—"}</div>
                  </div>
                  <div className="col-span-1 text-xs text-slate-600 truncate">{opp.stage ?? "—"}</div>
                  <div className="col-span-2 text-xs font-medium text-slate-900 tabular-nums">
                    {opp.ticket_size_min || opp.ticket_size_max
                      ? `${formatMoney(opp.ticket_size_min, opp.currency ?? "GBP")}–${formatMoney(opp.ticket_size_max, opp.currency ?? "GBP")}`
                      : "—"}
                  </div>
                  <div className="col-span-1 text-xs font-semibold text-emerald-600 text-right tabular-nums">{opp.expected_irr ? `${opp.expected_irr}%` : "—"}</div>
                  <div className="col-span-1 flex items-center justify-end gap-1.5">
                    <span className="text-xs font-bold text-slate-900 tabular-nums">{opp.conviction_score != null ? Number(opp.conviction_score).toFixed(1) : "—"}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); toggleSave(opp.id); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); toggleSave(opp.id); } }}
                      className={cn("ml-1 cursor-pointer", isSaved ? "text-slate-900" : "text-slate-300 hover:text-slate-900")}
                    >
                      {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative ml-auto w-full max-w-2xl h-full bg-white border-l border-slate-200 shadow-2xl">
            <ScrollArea className="h-full">
              <div className="relative h-56 overflow-hidden bg-slate-100">
                {selected.image_url ? (
                  <img src={selected.image_url} alt={selected.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <Building2 className="h-16 w-16 text-slate-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                <Button variant="secondary" size="icon" onClick={() => setSelected(null)} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selected.sector && <Badge className={accentSoft}>{selected.sector}</Badge>}
                    {selected.geography && <Badge variant="outline" className="border-slate-200 text-slate-600">{selected.geography}</Badge>}
                    {selected.stage && <Badge variant="outline" className="border-slate-200 text-slate-600">{selected.stage}</Badge>}
                    {selected.featured && <Badge className="bg-amber-400 text-slate-900 border-0"><Star className="h-3 w-3 mr-1 fill-current" />Featured</Badge>}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{selected.title}</h2>
                  <p className="text-sm text-slate-600 mt-2">{selected.short_description}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-amber-700">Conviction</div>
                    <div className="text-xl font-bold text-amber-700 tabular-nums">{Number(selected.conviction_score ?? 0).toFixed(1)}/5</div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700">Target IRR</div>
                    <div className="text-xl font-bold text-emerald-700 tabular-nums">{selected.expected_irr ? `${selected.expected_irr}%` : "—"}</div>
                  </div>
                  <div className="rounded-xl bg-sky-50 border border-sky-100 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-sky-700">MOIC</div>
                    <div className="text-xl font-bold text-sky-700 tabular-nums">{selected.expected_moic ? `${selected.expected_moic}x` : "—"}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => toggleSave(selected.id)} variant="outline" className="flex-1 border-slate-300">
                    {saved.includes(selected.id) ? <><BookmarkCheck className="h-4 w-4 mr-2" />Saved</> : <><Bookmark className="h-4 w-4 mr-2" />Save to shortlist</>}
                  </Button>
                  {selected.source_url && (
                    <Button asChild className={cn("flex-1", accentBtn)}>
                      <a href={selected.source_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />Open source
                      </a>
                    </Button>
                  )}
                </div>

                {selected.thesis && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" />Investment thesis</h3>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{selected.thesis}</p>
                  </section>
                )}

                {selected.full_description && selected.full_description !== selected.thesis && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"><BarChart3 className="h-3.5 w-3.5" />Overview</h3>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{selected.full_description}</p>
                  </section>
                )}

                {selected.highlights && selected.highlights.length > 0 && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Highlights</h3>
                    <ul className="space-y-1.5">
                      {selected.highlights.map((h, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-700"><span className="text-emerald-500 mt-0.5">●</span>{h}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {selected.risks && selected.risks.length > 0 && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"><Shield className="h-3.5 w-3.5" />Key risks</h3>
                    <ul className="space-y-1.5">
                      {selected.risks.map((r, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-700"><span className="text-rose-500 mt-0.5">●</span>{r}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {selected.ai_tags && selected.ai_tags.length > 0 && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.ai_tags.map(t => (
                        <Badge key={t} variant="outline" className="border-slate-200 text-slate-600 text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
