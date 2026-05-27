import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Lock,
  ArrowRight,
  Sparkles,
  Loader2,
  ShieldCheck,
  Activity,
  Gauge,
  ChevronRight,
  TrendingUp,
  MapPin,
  Building2,
} from "lucide-react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { ResearchAuthDialog } from "@/components/research/ResearchAuthDialog";
import { HomepageNavLinks } from "@/components/home/HomepageNavLinks";

interface OpportunityPreview {
  id: string;
  title: string;
  short_description: string | null;
  category: string | null;
  sub_category: string | null;
  location: string | null;
  country: string | null;
  thumbnail_url: string | null;
  analyst_rating: string | null;
  overall_conviction_score: number | null;
  expected_irr: number | null;
  minimum_investment: number | null;
  deal_stage: string | null;
  geography: string | null;
  featured: boolean | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  real_estate: "Real Estate",
  commodities: "Commodities",
  alternatives: "Alternatives",
  esg: "ESG",
  fractional_pe_vc: "Fractional PE/VC",
  private_market_platforms: "Private Markets",
  capital_protected_notes: "Capital Protected Notes",
  thematics_packaged: "Thematics",
  copy_trading: "Copy Trading",
  music_royalties: "Music Royalties",
  businesses: "Businesses",
  mini_bonds: "Mini Bonds",
  timepieces: "Timepieces",
};

export default function PublicOpportunities() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [items, setItems] = useState<OpportunityPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [authTitle, setAuthTitle] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("opportunity_products")
        .select(
          "id,title,short_description,category,sub_category,location,country,thumbnail_url,analyst_rating,overall_conviction_score,expected_irr,minimum_investment,deal_stage,geography,featured"
        )
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) {
        console.error("Failed to load opportunities", error);
        setItems([]);
      } else {
        setItems((data ?? []) as OpportunityPreview[]);
      }
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.category && set.add(i.category));
    return ["all", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(
    () => (activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory)),
    [items, activeCategory]
  );

  const openAuth = (mode: "signin" | "signup", title?: string) => {
    setAuthMode(mode);
    setAuthTitle(title);
    setAuthOpen(true);
  };

  const handleOpen = (o: OpportunityPreview) => {
    openAuth("signup", o.title);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-400/30">
      {/* Ambient gradient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[1200px] rounded-full bg-gradient-to-br from-indigo-500/[0.07] via-sky-400/[0.04] to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[800px] rounded-full bg-gradient-to-tl from-amber-400/[0.06] to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
            <span className="font-semibold tracking-tight text-slate-900">FlowPulse</span>
            <Badge variant="outline" className="ml-2 border-slate-200 text-[10px] uppercase tracking-widest text-slate-500">
              Intelligence
            </Badge>
          </button>
          <HomepageNavLinks />
          <div className="flex items-center gap-2">
            {!isAuthed && (
              <>
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100" onClick={() => openAuth("signin")}>
                  Sign in
                </Button>
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 font-semibold"
                  onClick={() => openAuth("signup")}
                >
                  Get access <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs text-slate-600 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          FlowPulse Intelligence · Curated opportunities desk
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
          Institutional{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
            Opportunities
          </span>
        </h1>
        <p className="text-slate-500 mt-5 max-w-2xl mx-auto text-lg leading-relaxed">
          Real estate, private markets, alternatives, businesses and more — every opportunity vetted on a 0–5 conviction
          framework by the FlowPulse analyst desk.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Vetted by analysts
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <Activity className="h-3.5 w-3.5 text-sky-500" /> Updated continuously
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <Gauge className="h-3.5 w-3.5 text-indigo-500" /> 0–5 conviction scoring
          </span>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="container mx-auto px-4 pb-24">
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide border transition-all ${
                activeCategory === c
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {c === "all" ? "All" : CATEGORY_LABEL[c] ?? c}
            </button>
          ))}
        </div>

        {loading || authLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="py-20 text-center">
              <Building2 className="h-12 w-12 mx-auto text-slate-400 mb-3" />
              <p className="text-slate-500">No opportunities published yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((o) => (
                <OpportunityCard key={o.id} item={o} onOpen={() => handleOpen(o)} />
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-400/30 mb-4">
                <Lock className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                Unlock the full Intelligence desk
              </h3>
              <p className="text-slate-500 mb-6 leading-relaxed max-w-xl mx-auto">
                Create a free account to view full opportunity dossiers, conviction scoring, IRR forecasts, downside
                analysis and exit scenarios.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 font-semibold"
                  onClick={() => openAuth("signup")}
                >
                  Create free account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                  onClick={() => openAuth("signin")}
                >
                  Sign in
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      <ResearchAuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        redirectPath="/investor/opportunities"
        reportTitle={authTitle}
        initialMode={authMode}
      />
    </div>
  );
}

function OpportunityCard({ item, onOpen }: { item: OpportunityPreview; onOpen: () => void }) {
  const score = typeof item.overall_conviction_score === "number" ? item.overall_conviction_score : null;
  const confidenceColor =
    score !== null && score >= 4
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : score !== null && score >= 3
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : score !== null
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-50 text-slate-600 border-slate-200";

  const categoryLabel = item.category ? CATEGORY_LABEL[item.category] ?? item.category : "Opportunity";
  const locationLabel = [item.location, item.country].filter(Boolean).join(", ");

  const description =
    item.short_description?.trim() ||
    `${categoryLabel}${item.sub_category ? ` · ${item.sub_category}` : ""}${locationLabel ? ` · ${locationLabel}` : ""}. Vetted on FlowPulse's 0–5 conviction framework.`;

  return (
    <HoverCard openDelay={150} closeDelay={80}>
      <HoverCardTrigger asChild>
        <Card
          onClick={onOpen}
          onMouseDown={(e) => e.preventDefault()}
          className="group relative overflow-hidden cursor-pointer border-slate-200 bg-white shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] select-none"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent z-10" />

          {/* Lock overlay covers whole card to enforce paywall */}
          <button
            type="button"
            aria-label={`Sign in or create account to view ${item.title}`}
            className="absolute inset-0 z-30 cursor-pointer bg-transparent"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpen();
            }}
          />

          {/* Image / preview */}
          <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt={item.title}
                className="h-full w-full object-cover blur-md scale-110"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <Building2 className="h-10 w-10" />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-slate-900/30 backdrop-blur-[2px]">
              <div className="flex items-center gap-2 rounded-full border border-indigo-300/40 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur-sm">
                <Lock className="h-3.5 w-3.5" /> Sign in to view
              </div>
            </div>
            {item.featured && (
              <Badge className="absolute top-3 left-3 z-20 bg-indigo-600 text-white border-0">Featured</Badge>
            )}
          </div>

          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">{categoryLabel}</div>
                <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                {locationLabel && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" /> {locationLabel}
                  </div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${confidenceColor}`}>
                {score !== null ? `${score.toFixed(1)}/5 conviction` : "Analyst review"}
              </Badge>
              {typeof item.expected_irr === "number" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                  <TrendingUp className="h-3 w-3 text-emerald-500" /> {item.expected_irr.toFixed(1)}% IRR
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="center" className="w-80 border-slate-200 bg-white text-slate-700 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400">{categoryLabel}</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</h4>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-5">{description}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-slate-500">
            {locationLabel && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{locationLabel}</span>
            )}
            {typeof item.expected_irr === "number" && (
              <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-500" />{item.expected_irr.toFixed(1)}% IRR</span>
            )}
            <span>{score !== null ? `${score.toFixed(1)}/5 conviction` : "Analyst review"}</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
