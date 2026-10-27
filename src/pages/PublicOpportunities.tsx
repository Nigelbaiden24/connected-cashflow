import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { OpportunityPrice, money, priceInfo } from "@/components/opportunities/OpportunityPrice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Layers as ExLayers, Scale as ExScale, Gauge as ExGauge, ExternalLink as ExLink } from "lucide-react";
import { PageExplainer } from "@/components/home/PageExplainer";
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
  price: number | null;
  price_currency: string | null;
  product_details: any;
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
  land: "Land",
  rent_to_rent: "Rent to Rent",
  rent_to_sa: "Rent to Serviced Accommodation",
  royalties: "Royalties",
  fine_wine: "Fine Wine",
  art: "Art",
  collectibles: "Collectibles",
  luxury_assets: "Luxury Assets",
  entertainment_finance: "Entertainment Finance",
  insurance_investments: "Insurance-Based",
  sports_investments: "Sports",
  overseas_property: "Overseas Property",
  uk_property: "UK Property",
  vehicles: "Vehicles",
};

// The 23 Live Deal Alert categories, always offered as filters.
const LIVE_CATEGORIES = [
  "real_estate", "land", "rent_to_rent", "rent_to_sa", "commodities", "alternatives", "esg", "fractional_pe_vc",
  "private_market_platforms", "capital_protected_notes", "thematics_packaged", "copy_trading", "royalties", "businesses",
  "mini_bonds", "timepieces", "fine_wine", "art", "collectibles", "luxury_assets", "entertainment_finance",
  "insurance_investments", "sports_investments",
];

// Older category keys still on some deals, shown under the matching live category.
const LEGACY_CATEGORY: Record<string, string> = {
  overseas_property: "real_estate", uk_property: "real_estate", music_royalties: "royalties",
  collectibles_luxury: "collectibles", vehicles: "luxury_assets", private_equity: "fractional_pe_vc",
  private_business: "businesses", memorabilia: "collectibles", funds: "alternatives",
};
const categoryOf = (c: string | null) => (c ? LEGACY_CATEGORY[c] ?? c : "alternatives");

const REGIONS: Array<{ key: string; label: string; re: RegExp }> = [
  { key: "uk", label: "United Kingdom", re: /\b(uk|united kingdom|england|scotland|wales|london|manchester|birmingham|leeds|bristol|edinburgh|glasgow)\b/i },
  { key: "europe", label: "Europe", re: /\b(europe|eu|spain|portugal|france|germany|italy|greece|netherlands|ireland|switzerland|lisbon|madrid|marbella|paris|berlin|athens|cyprus|malta|poland|sweden|norway|denmark)\b/i },
  { key: "na", label: "North America", re: /\b(usa|us|united states|america|canada|new york|florida|texas|california|toronto)\b/i },
  { key: "me", label: "Middle East", re: /\b(uae|dubai|abu dhabi|saudi|qatar|israel|bahrain|oman|middle east)\b/i },
  { key: "africa", label: "Africa", re: /\b(africa|nigeria|kenya|ghana|egypt|morocco|tanzania|rwanda|lagos|nairobi|cape town)\b/i },
  { key: "apac", label: "Asia-Pacific", re: /\b(asia|japan|singapore|hong kong|china|australia|india|thailand|vietnam|indonesia|philippines|malaysia|bali)\b/i },
  { key: "latam", label: "Latin America", re: /\b(latin america|brazil|mexico|colombia|chile|argentina|peru|costa rica)\b/i },
];
const regionOf = (o: { location: string | null; country: string | null; geography: string | null }) => {
  const text = [o.location, o.country, o.geography].filter(Boolean).join(" ");
  return REGIONS.find((r) => r.re.test(text))?.key ?? "global";
};

const PRICE_BANDS: Array<{ key: string; label: string; min: number; max: number }> = [
  { key: "lt10k", label: "Under £10k", min: 0, max: 10_000 },
  { key: "10k-100k", label: "£10k – £100k", min: 10_000, max: 100_000 },
  { key: "100k-1m", label: "£100k – £1m", min: 100_000, max: 1_000_000 },
  { key: "1m-10m", label: "£1m – £10m", min: 1_000_000, max: 10_000_000 },
  { key: "gt10m", label: "£10m+", min: 10_000_000, max: Infinity },
];

export default function PublicOpportunities() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [items, setItems] = useState<OpportunityPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [subCategory, setSubCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [priceBand, setPriceBand] = useState("all");
  const [priceType, setPriceType] = useState<"all" | "listed">("all");
  const [conviction, setConviction] = useState("all");
  const [sort, setSort] = useState("newest");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [authTitle, setAuthTitle] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("opportunity_products")
        .select(
          "id,title,short_description,category,sub_category,location,country,thumbnail_url,analyst_rating,overall_conviction_score,expected_irr,minimum_investment,deal_stage,geography,featured,price,price_currency,product_details"
        )
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) {
        console.error("Failed to load opportunities", error);
        setItems([]);
      } else {
        setItems((data ?? []) as OpportunityPreview[]);
      }
      setLoading(false);
    })();
  }, []);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    items.forEach((i) => { const c = categoryOf(i.category); m[c] = (m[c] ?? 0) + 1; });
    return m;
  }, [items]);

  const subCategories = useMemo(() => {
    if (activeCategory === "all") return [];
    const m = new Map<string, number>();
    items.filter((i) => categoryOf(i.category) === activeCategory && i.sub_category && i.sub_category !== "General")
      .forEach((i) => m.set(i.sub_category!, (m.get(i.sub_category!) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items, activeCategory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const band = PRICE_BANDS.find((b) => b.key === priceBand);
    const list = items.filter((i) => {
      if (activeCategory !== "all" && categoryOf(i.category) !== activeCategory) return false;
      if (subCategory !== "all" && i.sub_category !== subCategory) return false;
      if (region !== "all" && regionOf(i) !== region) return false;
      if (band && !(i.price != null && i.price >= band.min && i.price < band.max)) return false;
      if (priceType === "listed" && priceInfo(i).source !== "listed") return false;
      if (conviction !== "all" && !((i.overall_conviction_score ?? 0) >= Number(conviction))) return false;
      if (q && ![i.title, i.short_description, i.location, i.country, i.sub_category].some((v) => v?.toLowerCase().includes(q))) return false;
      return true;
    });
    const by = (f: (x: OpportunityPreview) => number) => (a: OpportunityPreview, b: OpportunityPreview) => f(a) - f(b);
    if (sort === "price_low") list.sort(by((x) => x.price ?? Infinity));
    if (sort === "price_high") list.sort(by((x) => -(x.price ?? -1)));
    if (sort === "conviction") list.sort(by((x) => -(x.overall_conviction_score ?? 0)));
    return list;
  }, [items, activeCategory, subCategory, region, priceBand, priceType, conviction, query, sort]);

  const filtersOn = !!query.trim() || region !== "all" || priceBand !== "all" || priceType !== "all" || conviction !== "all" || subCategory !== "all";
  const clearFilters = () => { setQuery(""); setRegion("all"); setPriceBand("all"); setPriceType("all"); setConviction("all"); setSubCategory("all"); };
  const pickCategory = (c: string) => { setActiveCategory(c); setSubCategory("all"); };
  const activeLabel = activeCategory === "all" ? "" : CATEGORY_LABEL[activeCategory] ?? activeCategory;

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
            <Badge variant="outline" className="ml-2 hidden border-slate-200 text-[10px] uppercase tracking-widest text-slate-500 sm:inline-flex">
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

      <PageExplainer
        eyebrow="What is Opportunity Intelligence?"
        title="Investment opportunities beyond the stock market, in one place"
        intro={<>
          <p>FlowPulse brings together publicly listed opportunities across 23 asset classes, from property, land and private markets to fine wine, art and royalties, and reviews them before they are published here.</p>
          <p>Each one shows what it is, where it is, what it costs and how strongly our framework rates it, so you can quickly decide which deserve a closer look.</p>
        </>}
        points={[
          { icon: ExLayers, title: "23 asset classes, one search", text: "Filter by category, region, price and conviction instead of trawling dozens of sites." },
          { icon: ExScale, title: "Prices you can trust", text: "Listed prices come straight from the source. Where none is published, we show a clearly labelled estimate with its range." },
          { icon: ExGauge, title: "A consistent way to compare", text: "Every opportunity is scored 0–5 on the same conviction framework, whatever the asset." },
          { icon: ExLink, title: "Straight to the source", text: "Members can open the original listing to check the details and speak to the provider directly." },
        ]}
        note="Opportunities are listed by third parties and are not recommendations. Always carry out your own due diligence; capital is at risk."
        accent="indigo"
      />

      {/* Filters + Grid */}
      <section className="container mx-auto px-4 pb-24">
        {/* Categories: all 23, always available */}
        <div className="mb-5 -mx-4 overflow-x-auto px-4 pb-2">
          <div className="flex w-max gap-2 md:w-auto md:flex-wrap md:justify-center">
            {["all", ...LIVE_CATEGORIES].map((c) => {
              const n = c === "all" ? items.length : counts[c] ?? 0;
              const on = activeCategory === c;
              return (
                <button key={c} onClick={() => pickCategory(c)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                    on ? "border-slate-900 bg-slate-900 text-white" : n ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900" : "border-dashed border-slate-200 bg-white/60 text-slate-400 hover:text-slate-600"}`}>
                  {c === "all" ? "All categories" : CATEGORY_LABEL[c] ?? c}
                  <span className={`rounded-full px-1.5 text-[10px] ${on ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))]">
            <div className="relative col-span-2 md:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search deals, places…" className="h-10 rounded-xl border-slate-200 pl-9" />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {REGIONS.map((r) => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}
                <SelectItem value="global">Global / other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priceBand} onValueChange={setPriceBand}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue placeholder="Price" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any price</SelectItem>
                {PRICE_BANDS.map((b) => <SelectItem key={b.key} value={b.key}>{b.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priceType} onValueChange={(v) => setPriceType(v as "all" | "listed")}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All price types</SelectItem>
                <SelectItem value="listed">Listed prices only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conviction} onValueChange={setConviction}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any conviction</SelectItem>
                <SelectItem value="4">4.0+ high conviction</SelectItem>
                <SelectItem value="3">3.0+ and above</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200"><SlidersHorizontal className="mr-1 h-3.5 w-3.5 text-slate-400" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price_low">Price: low to high</SelectItem>
                <SelectItem value="price_high">Price: high to low</SelectItem>
                <SelectItem value="conviction">Highest conviction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {subCategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
              {[["all", 0] as [string, number], ...subCategories].map(([sc, n]) => (
                <button key={sc} onClick={() => setSubCategory(sc)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${subCategory === sc ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {sc === "all" ? `All ${activeLabel.toLowerCase()}` : `${sc} · ${n}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {!loading && (
          <div className="mb-6 flex items-center justify-between text-sm text-slate-500">
            <span><span className="font-semibold text-slate-900">{filtered.length}</span> {filtered.length === 1 ? "opportunity" : "opportunities"}{activeLabel ? ` in ${activeLabel}` : ""}</span>
            {filtersOn && <button onClick={clearFilters} className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"><X className="h-3.5 w-3.5" /> Clear filters</button>}
          </div>
        )}

        {loading || authLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="py-20 text-center">
              <Building2 className="h-12 w-12 mx-auto text-slate-400 mb-3" />
              {filtersOn ? (
                <>
                  <p className="font-medium text-slate-700">No deals match these filters.</p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear filters</Button>
                </>
              ) : activeLabel ? (
                <>
                  <p className="font-medium text-slate-700">No live {activeLabel.toLowerCase()} deals right now.</p>
                  <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">New {activeLabel.toLowerCase()} opportunities appear here as soon as the analyst desk publishes them.</p>
                  <Button variant="outline" className="mt-5" onClick={() => pickCategory("all")}>Browse all categories</Button>
                </>
              ) : (
                <p className="text-slate-500">No opportunities published yet.</p>
              )}
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
  // Location and country often repeat each other ("UK, London" + "UK"); show each part once.
  const locationLabel = [...new Set([item.location, item.country].filter(Boolean).join(", ").split(/\s*,\s*/).filter(Boolean))].join(", ");

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

            <div className="mb-3">
              <OpportunityPrice opportunity={item} />
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
          {item.price ? (
            <p className="text-sm font-bold text-slate-900">
              {priceInfo(item).source === "listed" ? "" : "≈ "}{money(item.price, item.price_currency || "GBP")}
              <span className="ml-1.5 text-[11px] font-medium text-slate-500">{priceInfo(item).source === "listed" ? priceInfo(item).kind ?? "Listed price" : "FlowPulse estimate"}</span>
            </p>
          ) : null}
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
