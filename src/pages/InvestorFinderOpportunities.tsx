import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Sparkles, TrendingUp, MapPin, Tag, ExternalLink, Target,
  Activity, Layers, Globe, Filter, Star, ArrowUpRight, Compass,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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
  if (v >= 1_000_000) return `${ccy} ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${ccy} ${(v / 1_000).toFixed(0)}k`;
  return `${ccy} ${v.toFixed(0)}`;
};

interface Props { variant?: "finance" | "investor" }

export default function InvestorFinderOpportunities({ variant = "investor" }: Props) {
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<string>("all");
  const [geo, setGeo] = useState<string>("all");
  const [stage, setStage] = useState<string>("all");
  const [selected, setSelected] = useState<InvestorFinderOpp | null>(null);

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
    return items.filter(i => {
      if (sector !== "all" && i.sector !== sector) return false;
      if (geo !== "all" && i.geography !== geo) return false;
      if (stage !== "all" && i.stage !== stage) return false;
      if (!term) return true;
      const hay = [i.title, i.short_description, i.thesis, i.sector, i.geography, ...(i.ai_tags ?? [])]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(term);
    });
  }, [items, q, sector, geo, stage]);

  const stats = useMemo(() => ({
    total: items.length,
    featured: items.filter(i => i.featured).length,
    avgScore: items.length ? (items.reduce((a, i) => a + (Number(i.conviction_score) || 0), 0) / items.length).toFixed(1) : "—",
    sectors: sectors.length,
  }), [items, sectors]);

  const accent = variant === "investor"
    ? { from: "from-violet-500", to: "to-fuchsia-600", ring: "ring-violet-500/30", text: "text-violet-300", chip: "bg-violet-500/15 border-violet-400/30 text-violet-200" }
    : { from: "from-sky-500", to: "to-blue-600", ring: "ring-sky-500/30", text: "text-sky-300", chip: "bg-sky-500/15 border-sky-400/30 text-sky-200" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className={cn("absolute -top-40 -left-32 w-[42rem] h-[42rem] rounded-full blur-3xl opacity-25 bg-gradient-to-br", accent.from, accent.to)} />
        <div className="absolute -bottom-40 -right-32 w-[34rem] h-[34rem] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-cyan-500 to-emerald-500" />
        <div className="relative max-w-[1400px] mx-auto px-6 py-10">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-400 mb-4">
            <Compass className={cn("h-4 w-4", accent.text)} />
            <span>FlowPulse Intelligence</span>
            <span className="opacity-50">/</span>
            <span className="text-slate-200">Investor Finder</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Curated investment opportunities, sourced live.
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400 text-base">
            AI-aggregated from premier deal-flow sources, scored for conviction, and reviewed by FlowPulse analysts before publishing.
          </p>

          {/* KPI strip */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Live Opportunities", value: stats.total, icon: Activity, glow: "bg-sky-500/20" },
              { label: "Avg Conviction", value: `${stats.avgScore}/5`, icon: Star, glow: "bg-amber-500/20" },
              { label: "Featured", value: stats.featured, icon: Sparkles, glow: "bg-fuchsia-500/20" },
              { label: "Sectors", value: stats.sectors, icon: Layers, glow: "bg-emerald-500/20" },
            ].map(k => (
              <div key={k.label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 hover:border-white/20 transition">
                <div className={cn("absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-60 group-hover:opacity-90 transition", k.glow)} />
                <div className="relative flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{k.label}</span>
                  <k.icon className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="relative mt-2 text-2xl font-bold tabular-nums">{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by company, sector, thesis, tag…"
              className="pl-9 bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-violet-400/40"
            />
          </div>
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-slate-200"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue placeholder="Sector" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All sectors</SelectItem>{sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={geo} onValueChange={setGeo}>
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-slate-200"><Globe className="h-3.5 w-3.5 mr-1.5" /><SelectValue placeholder="Geography" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All regions</SelectItem>{geos.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-slate-200"><Target className="h-3.5 w-3.5 mr-1.5" /><SelectValue placeholder="Stage" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All stages</SelectItem>{stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Badge variant="outline" className="border-white/10 text-slate-300 ml-auto">{filtered.length} results</Badge>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-white/[0.03] border-white/10">
            <CardContent className="p-12 text-center">
              <Sparkles className={cn("h-10 w-10 mx-auto mb-3", accent.text)} />
              <h3 className="text-lg font-semibold text-slate-100">No opportunities yet</h3>
              <p className="text-sm text-slate-400 mt-1">FlowPulse is continuously scanning. Check back shortly.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(opp => (
              <button
                key={opp.id}
                onClick={() => setSelected(opp)}
                className="group relative overflow-hidden text-left rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.015] backdrop-blur-xl hover:border-white/20 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]"
              >
                {/* Image / banner */}
                <div className="relative h-40 overflow-hidden bg-slate-800">
                  {opp.image_url ? (
                    <img src={opp.image_url} alt={opp.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className={cn("w-full h-full bg-gradient-to-br opacity-70", accent.from, accent.to)} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  {opp.featured && (
                    <Badge className="absolute top-3 left-3 bg-amber-500/90 text-slate-900 border-0 gap-1 shadow-lg"><Star className="h-3 w-3 fill-current" />Featured</Badge>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                    {opp.conviction_score != null && (
                      <Badge className={cn("border-0 backdrop-blur-md", accent.chip)}>
                        <Star className="h-3 w-3 mr-1 fill-current" />{Number(opp.conviction_score).toFixed(1)}/5
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 drop-shadow">{opp.title}</h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {opp.sector && <Badge variant="outline" className="border-white/10 text-slate-300 text-[10px]"><Tag className="h-2.5 w-2.5 mr-1" />{opp.sector}</Badge>}
                    {opp.geography && <Badge variant="outline" className="border-white/10 text-slate-300 text-[10px]"><MapPin className="h-2.5 w-2.5 mr-1" />{opp.geography}</Badge>}
                    {opp.stage && <Badge variant="outline" className="border-white/10 text-slate-300 text-[10px]"><Target className="h-2.5 w-2.5 mr-1" />{opp.stage}</Badge>}
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 min-h-[40px]">{opp.short_description ?? opp.thesis ?? "—"}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500">Ticket</div>
                      <div className="text-xs font-semibold text-slate-100 tabular-nums">
                        {opp.ticket_size_min || opp.ticket_size_max
                          ? `${formatMoney(opp.ticket_size_min, opp.currency ?? "GBP")} – ${formatMoney(opp.ticket_size_max, opp.currency ?? "GBP")}`
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500">IRR</div>
                      <div className="text-xs font-semibold text-emerald-300 tabular-nums">{opp.expected_irr ? `${opp.expected_irr}%` : "—"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500">MOIC</div>
                      <div className="text-xs font-semibold text-sky-300 tabular-nums">{opp.expected_moic ? `${opp.expected_moic}x` : "—"}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                    <span>{formatDistanceToNow(new Date(opp.created_at), { addSuffix: true })}</span>
                    <span className={cn("inline-flex items-center gap-1 font-medium group-hover:gap-1.5 transition-all", accent.text)}>
                      View detail <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative ml-auto w-full max-w-2xl h-full bg-slate-950 border-l border-white/10 shadow-2xl">
            <ScrollArea className="h-full">
              <div className="relative h-56 overflow-hidden">
                {selected.image_url ? (
                  <img src={selected.image_url} alt={selected.title} className="w-full h-full object-cover" />
                ) : (
                  <div className={cn("w-full h-full bg-gradient-to-br", accent.from, accent.to)} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="absolute top-3 right-3 text-white hover:bg-white/10">Close</Button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selected.sector && <Badge className={accent.chip}>{selected.sector}</Badge>}
                    {selected.geography && <Badge variant="outline" className="border-white/10 text-slate-300">{selected.geography}</Badge>}
                    {selected.stage && <Badge variant="outline" className="border-white/10 text-slate-300">{selected.stage}</Badge>}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selected.title}</h2>
                  <p className="text-sm text-slate-400 mt-2">{selected.short_description}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">Conviction</div>
                    <div className="text-xl font-bold text-amber-300 tabular-nums">{Number(selected.conviction_score ?? 0).toFixed(1)}/5</div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">Target IRR</div>
                    <div className="text-xl font-bold text-emerald-300 tabular-nums">{selected.expected_irr ? `${selected.expected_irr}%` : "—"}</div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">MOIC</div>
                    <div className="text-xl font-bold text-sky-300 tabular-nums">{selected.expected_moic ? `${selected.expected_moic}x` : "—"}</div>
                  </div>
                </div>

                {selected.thesis && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" />Investment thesis</h3>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{selected.thesis}</p>
                  </section>
                )}

                {selected.full_description && selected.full_description !== selected.thesis && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Overview</h3>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{selected.full_description}</p>
                  </section>
                )}

                {selected.highlights && selected.highlights.length > 0 && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Highlights</h3>
                    <ul className="space-y-1.5">
                      {selected.highlights.map((h, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-200"><span className="text-emerald-400 mt-0.5">●</span>{h}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {selected.risks && selected.risks.length > 0 && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Key risks</h3>
                    <ul className="space-y-1.5">
                      {selected.risks.map((r, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-200"><span className="text-rose-400 mt-0.5">●</span>{r}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {selected.ai_tags && selected.ai_tags.length > 0 && (
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.ai_tags.map(t => (
                        <Badge key={t} variant="outline" className="border-white/10 text-slate-300 text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  </section>
                )}

                {selected.source_url && (
                  <a href={selected.source_url} target="_blank" rel="noopener noreferrer"
                     className={cn("inline-flex items-center gap-2 text-sm font-medium hover:underline", accent.text)}>
                    Original source <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
