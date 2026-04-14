import { useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Search, MapPin, X, SlidersHorizontal, Globe, TrendingUp, DollarSign, Star } from "lucide-react";

interface OpportunityProduct {
  id: string;
  title: string;
  short_description: string;
  category: string;
  price: number;
  price_currency: string;
  location: string;
  country: string;
  thumbnail_url: string;
  analyst_rating: string;
}

interface OpportunityWorldMapProps {
  opportunities: OpportunityProduct[];
}

const REGIONS: Record<string, { cx: number; cy: number; label: string; countries: string[]; color: string }> = {
  uk: { cx: 470, cy: 165, label: "United Kingdom", countries: ["UK", "United Kingdom", "England", "Scotland", "Wales"], color: "59, 130, 246" },
  ireland: { cx: 448, cy: 172, label: "Ireland", countries: ["Ireland"], color: "16, 185, 129" },
  western_europe: { cx: 490, cy: 198, label: "Western Europe", countries: ["France", "Germany", "Netherlands", "Belgium", "Luxembourg", "Switzerland", "Austria"], color: "99, 102, 241" },
  southern_europe: { cx: 502, cy: 228, label: "Southern Europe", countries: ["Spain", "Portugal", "Italy", "Greece"], color: "245, 158, 11" },
  northern_europe: { cx: 510, cy: 140, label: "Northern Europe", countries: ["Sweden", "Norway", "Denmark", "Finland", "Iceland"], color: "6, 182, 212" },
  eastern_europe: { cx: 545, cy: 185, label: "Eastern Europe", countries: ["Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria"], color: "168, 85, 247" },
  middle_east: { cx: 585, cy: 255, label: "Middle East", countries: ["UAE", "Dubai", "Saudi Arabia", "Qatar", "Bahrain", "Israel", "Turkey"], color: "239, 68, 68" },
  north_africa: { cx: 490, cy: 278, label: "North Africa", countries: ["Morocco", "Egypt", "Tunisia", "Algeria", "Libya"], color: "234, 179, 8" },
  sub_saharan_africa: { cx: 510, cy: 345, label: "Sub-Saharan Africa", countries: ["South Africa", "Nigeria", "Kenya", "Ghana", "Tanzania"], color: "34, 197, 94" },
  south_asia: { cx: 650, cy: 275, label: "South Asia", countries: ["India", "Pakistan", "Bangladesh", "Sri Lanka"], color: "249, 115, 22" },
  east_asia: { cx: 730, cy: 210, label: "East Asia", countries: ["China", "Japan", "South Korea", "Taiwan", "Hong Kong"], color: "236, 72, 153" },
  southeast_asia: { cx: 710, cy: 298, label: "Southeast Asia", countries: ["Singapore", "Malaysia", "Thailand", "Vietnam", "Indonesia", "Philippines"], color: "20, 184, 166" },
  oceania: { cx: 775, cy: 395, label: "Oceania", countries: ["Australia", "New Zealand"], color: "251, 146, 60" },
  north_america: { cx: 225, cy: 195, label: "North America", countries: ["USA", "United States", "Canada", "US"], color: "37, 99, 235" },
  central_america: { cx: 225, cy: 278, label: "Central America", countries: ["Mexico", "Costa Rica", "Panama"], color: "22, 163, 74" },
  south_america: { cx: 290, cy: 365, label: "South America", countries: ["Brazil", "Argentina", "Chile", "Colombia", "Peru"], color: "147, 51, 234" },
  caribbean: { cx: 268, cy: 268, label: "Caribbean", countries: ["Jamaica", "Bahamas", "Barbados", "Trinidad"], color: "14, 165, 233" },
};

// Refined continent paths for a premium map feel
const CONTINENT_PATHS = [
  // North America
  "M100,100 C120,70 200,60 260,80 C290,95 320,120 330,160 C335,190 320,220 290,250 C260,275 230,290 210,280 C180,260 155,230 140,200 C125,175 110,145 100,100Z",
  // South America
  "M230,290 C260,275 295,280 315,310 C335,345 330,385 320,415 C305,445 280,460 260,455 C245,445 235,420 230,390 C225,355 220,330 230,290Z",
  // Europe
  "M435,115 C460,100 500,95 540,105 C565,120 580,145 585,175 C580,205 560,225 535,240 C510,250 485,245 465,230 C445,215 435,190 430,165 C428,145 430,130 435,115Z",
  // Africa
  "M455,248 C480,238 525,240 550,260 C570,285 575,320 565,360 C550,400 530,425 505,440 C480,435 465,415 458,385 C450,350 448,310 448,280 C448,265 450,255 455,248Z",
  // Asia
  "M555,85 C600,70 670,65 730,85 C775,110 800,155 795,200 C790,245 765,275 730,295 C695,310 655,315 620,305 C585,290 560,260 550,225 C540,190 540,150 545,120 C548,100 550,90 555,85Z",
  // Oceania
  "M715,350 C745,335 790,335 820,355 C840,375 845,400 830,425 C815,440 790,445 760,435 C735,420 715,395 715,350Z",
  // Greenland
  "M310,50 C340,40 370,45 380,60 C385,75 375,90 360,95 C345,100 325,95 315,80 C305,65 305,55 310,50Z",
];

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: currency || "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

const ratingColor = (rating: string) => {
  if (rating === "strong_buy" || rating === "buy") return "text-emerald-400";
  if (rating === "hold") return "text-amber-400";
  return "text-red-400";
};

export function OpportunityWorldMap({ opportunities }: OpportunityWorldMapProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/finance") ? "/finance/opportunities" : "/investor/opportunities";

  const [mapSearch, setMapSearch] = useState("");
  const [distanceFilter, setDistanceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const regionData = useMemo(() => {
    const grouped: Record<string, OpportunityProduct[]> = {};
    opportunities.forEach(opp => {
      const loc = (opp.country || opp.location || "").toLowerCase();
      for (const [key, region] of Object.entries(REGIONS)) {
        if (region.countries.some(c => loc.includes(c.toLowerCase()))) {
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(opp);
          return;
        }
      }
      if (!grouped["uk"]) grouped["uk"] = [];
      grouped["uk"].push(opp);
    });
    return grouped;
  }, [opportunities]);

  const filteredRegionData = useMemo(() => {
    const result: Record<string, OpportunityProduct[]> = {};
    for (const [key, opps] of Object.entries(regionData)) {
      const filtered = opps.filter(opp => {
        if (mapSearch && !opp.title.toLowerCase().includes(mapSearch.toLowerCase()) && !opp.location?.toLowerCase().includes(mapSearch.toLowerCase())) return false;
        if (categoryFilter !== "all" && opp.category !== categoryFilter) return false;
        if (priceFilter === "under100k" && opp.price > 100000) return false;
        if (priceFilter === "100k-500k" && (opp.price < 100000 || opp.price > 500000)) return false;
        if (priceFilter === "500k-1m" && (opp.price < 500000 || opp.price > 1000000)) return false;
        if (priceFilter === "over1m" && opp.price < 1000000) return false;
        if (distanceFilter === "local" && !REGIONS[key]?.countries.some(c => ["UK", "United Kingdom", "England", "Scotland", "Wales"].includes(c))) return false;
        if (distanceFilter === "europe" && !["uk", "ireland", "western_europe", "southern_europe", "northern_europe", "eastern_europe"].includes(key)) return false;
        return true;
      });
      if (filtered.length > 0) result[key] = filtered;
    }
    return result;
  }, [regionData, mapSearch, categoryFilter, priceFilter, distanceFilter]);

  const totalFiltered = Object.values(filteredRegionData).reduce((sum, arr) => sum + arr.length, 0);
  const totalValue = Object.values(filteredRegionData).flat().reduce((sum, o) => sum + (o.price || 0), 0);
  const categories = [...new Set(opportunities.map(o => o.category))];
  const activeFilters = [categoryFilter !== "all", priceFilter !== "all", distanceFilter !== "all"].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Premium stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Globe className="h-4 w-4 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Regions</p><p className="text-lg font-bold">{Object.keys(filteredRegionData).length}</p></div>
        </div>
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-chart-1/10"><TrendingUp className="h-4 w-4 text-chart-1" /></div>
          <div><p className="text-xs text-muted-foreground">Opportunities</p><p className="text-lg font-bold">{totalFiltered}</p></div>
        </div>
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-chart-2/10"><DollarSign className="h-4 w-4 text-chart-2" /></div>
          <div><p className="text-xs text-muted-foreground">Total Value</p><p className="text-lg font-bold">{formatPrice(totalValue, "GBP")}</p></div>
        </div>
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10"><Star className="h-4 w-4 text-amber-500" /></div>
          <div><p className="text-xs text-muted-foreground">Categories</p><p className="text-lg font-bold">{categories.length}</p></div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search opportunities by name or location..." value={mapSearch} onChange={e => setMapSearch(e.target.value)} className="pl-10 bg-card/50 border-border/40" />
        </div>
        <Select value={distanceFilter} onValueChange={setDistanceFilter}>
          <SelectTrigger className="w-[160px] bg-card/50 border-border/40"><SelectValue placeholder="Distance" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="local">UK Only</SelectItem>
            <SelectItem value="europe">Europe</SelectItem>
            <SelectItem value="global">Global</SelectItem>
          </SelectContent>
        </Select>
        <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1.5 h-10">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilters > 0 && <Badge className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center text-[10px]">{activeFilters}</Badge>}
        </Button>
      </div>

      {showFilters && (
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Price Range</label>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="under100k">Under £100k</SelectItem>
                  <SelectItem value="100k-500k">£100k – £500k</SelectItem>
                  <SelectItem value="500k-1m">£500k – £1m</SelectItem>
                  <SelectItem value="over1m">Over £1m</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter("all"); setPriceFilter("all"); setDistanceFilter("all"); setMapSearch(""); }} className="text-xs gap-1">
              <X className="h-3 w-3" /> Clear All
            </Button>
          </CardContent>
        </Card>
      )}

      {/* World Map */}
      <Card className="border-border/30 overflow-hidden rounded-2xl shadow-2xl">
        <CardContent className="p-0">
          <div className="relative w-full" style={{ paddingBottom: "52%" }}>
            <svg
              viewBox="0 0 960 500"
              className="absolute inset-0 w-full h-full"
            >
              <defs>
                {/* Ocean gradient */}
                <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="hsl(var(--primary) / 0.04)" />
                  <stop offset="50%" stopColor="hsl(var(--primary) / 0.02)" />
                  <stop offset="100%" stopColor="hsl(var(--background))" />
                </radialGradient>
                {/* Glow filters for each region */}
                {Object.entries(REGIONS).map(([key, r]) => (
                  <filter key={`glow-${key}`} id={`glow-${key}`} x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feFlood floodColor={`rgb(${r.color})`} floodOpacity="0.4" />
                    <feComposite in2="blur" operator="in" />
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
                {/* Pulse animation */}
                <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Ocean background */}
              <rect width="960" height="500" fill="url(#oceanGrad)" />

              {/* Subtle grid */}
              <g opacity="0.03" stroke="hsl(var(--foreground))">
                {Array.from({ length: 13 }, (_, i) => <line key={`lat${i}`} x1="0" y1={i * 40} x2="960" y2={i * 40} strokeDasharray="2,6" />)}
                {Array.from({ length: 25 }, (_, i) => <line key={`lng${i}`} x1={i * 40} y1="0" x2={i * 40} y2="500" strokeDasharray="2,6" />)}
              </g>

              {/* Equator */}
              <line x1="0" y1="250" x2="960" y2="250" stroke="hsl(var(--primary) / 0.08)" strokeDasharray="6,4" />

              {/* Continents with geographic colours */}
              <g>
                {CONTINENT_PATHS.map((path, i) => {
                  const fills = [
                    { fill: "rgba(76, 153, 76, 0.35)", stroke: "rgba(60, 130, 60, 0.5)" },   // North America – green
                    { fill: "rgba(180, 160, 60, 0.30)", stroke: "rgba(150, 130, 40, 0.45)" }, // South America – olive/yellow-green
                    { fill: "rgba(100, 140, 180, 0.35)", stroke: "rgba(80, 120, 160, 0.5)" }, // Europe – steel blue
                    { fill: "rgba(210, 170, 90, 0.35)", stroke: "rgba(180, 140, 60, 0.5)" },  // Africa – sandy gold
                    { fill: "rgba(190, 120, 130, 0.30)", stroke: "rgba(160, 100, 110, 0.45)" }, // Asia – rose/terracotta
                    { fill: "rgba(200, 140, 60, 0.35)", stroke: "rgba(170, 110, 40, 0.5)" },  // Oceania – burnt orange
                    { fill: "rgba(200, 210, 230, 0.40)", stroke: "rgba(170, 185, 210, 0.55)" }, // Greenland – icy blue-white
                  ];
                  const c = fills[i] || fills[0];
                  return (
                    <path key={i} d={path} fill={c.fill} stroke={c.stroke} strokeWidth="1" />
                  );
                })}
              </g>

              {/* Connection lines between active regions */}
              {(() => {
                const activeKeys = Object.keys(filteredRegionData);
                const lines: JSX.Element[] = [];
                for (let i = 0; i < activeKeys.length - 1; i++) {
                  const a = REGIONS[activeKeys[i]];
                  const b = REGIONS[activeKeys[i + 1]];
                  if (a && b) {
                    lines.push(
                      <line key={`conn-${i}`} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
                        stroke="hsl(var(--primary) / 0.08)" strokeWidth="0.5" strokeDasharray="3,5" />
                    );
                  }
                }
                return lines;
              })()}

              {/* Region dots */}
              {Object.entries(REGIONS).map(([key, region]) => {
                const opps = filteredRegionData[key];
                const isHovered = hoveredRegion === key;
                const hasOpps = opps && opps.length > 0;

                if (!hasOpps) {
                  return (
                    <g key={key}>
                      <circle cx={region.cx} cy={region.cy} r="3" fill="hsl(var(--muted-foreground) / 0.15)" />
                    </g>
                  );
                }

                const dotSize = Math.min(22, 8 + opps.length * 1.8);
                const rgbColor = region.color;

                return (
                  <g key={key}>
                    {/* Outer ripple */}
                    <circle cx={region.cx} cy={region.cy} r={dotSize + 14}
                      fill={`rgba(${rgbColor}, 0.06)`} className="animate-pulse" style={{ animationDuration: "3s" }} />
                    <circle cx={region.cx} cy={region.cy} r={dotSize + 8}
                      fill={`rgba(${rgbColor}, 0.1)`} className="animate-pulse" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />

                    {/* Interactive dot */}
                    <foreignObject x={region.cx - 28} y={region.cy - 28} width="56" height="56" className="overflow-visible">
                      <HoverCard openDelay={80} closeDelay={250} onOpenChange={(open) => { if (open) setHoveredRegion(key); else setHoveredRegion(null); }}>
                        <HoverCardTrigger asChild>
                          <button className="relative flex items-center justify-center w-full h-full group" aria-label={`${region.label}: ${opps.length} opportunities`}>
                            <span className="relative rounded-full flex items-center justify-center text-white text-[11px] font-bold cursor-pointer transition-all duration-300 group-hover:scale-[1.3] shadow-lg"
                              style={{
                                width: dotSize, height: dotSize,
                                background: `linear-gradient(135deg, rgba(${rgbColor}, 0.9), rgba(${rgbColor}, 0.7))`,
                                boxShadow: `0 0 ${isHovered ? 20 : 12}px rgba(${rgbColor}, 0.4), 0 2px 8px rgba(0,0,0,0.15)`,
                                border: "1.5px solid rgba(255,255,255,0.3)",
                              }}>
                              {opps.length}
                            </span>
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 p-0 z-[100] rounded-xl border-border/30 shadow-2xl overflow-hidden backdrop-blur-lg" side="top" sideOffset={12}>
                          {/* Header */}
                          <div className="p-3.5 border-b border-border/30" style={{ background: `linear-gradient(135deg, rgba(${rgbColor}, 0.1), transparent)` }}>
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: `rgb(${rgbColor})` }} />
                                {region.label}
                              </p>
                              <Badge variant="secondary" className="text-[10px] h-5">{opps.length} listed</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Total value: {formatPrice(opps.reduce((s, o) => s + (o.price || 0), 0), opps[0]?.price_currency || "GBP")}
                            </p>
                          </div>
                          {/* Items */}
                          <div className="max-h-56 overflow-y-auto">
                            {opps.slice(0, 6).map(opp => (
                              <button key={opp.id} onClick={() => navigate(`${basePath}/${opp.id}`)}
                                className="w-full flex items-start gap-3 p-3 hover:bg-muted/40 transition-all text-left border-b border-border/10 last:border-0 group/item">
                                <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border/20">
                                  {opp.thumbnail_url ? (
                                    <img src={opp.thumbnail_url} alt="" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                                      <MapPin className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold line-clamp-1 group-hover/item:text-primary transition-colors">{opp.title}</p>
                                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{opp.short_description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold" style={{ color: `rgb(${rgbColor})` }}>{formatPrice(opp.price, opp.price_currency)}</span>
                                    {opp.analyst_rating && (
                                      <span className={`text-[9px] font-medium ${ratingColor(opp.analyst_rating)}`}>
                                        ★ {opp.analyst_rating.replace(/_/g, " ").toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                            {opps.length > 6 && (
                              <div className="p-2.5 text-center bg-muted/20">
                                <span className="text-xs text-muted-foreground font-medium">+{opps.length - 6} more opportunities</span>
                              </div>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </foreignObject>

                    {/* Label */}
                    <text x={region.cx} y={region.cy + dotSize / 2 + 14} textAnchor="middle"
                      className="pointer-events-none select-none" style={{ fontSize: "8px", fill: "hsl(var(--muted-foreground))", fontWeight: 600, letterSpacing: "0.3px" }}>
                      {region.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating legend */}
            <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-md rounded-lg border border-border/30 p-2.5 shadow-lg">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Concentration</p>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary/30" />
                <span className="text-[9px] text-muted-foreground">Low</span>
                <div className="w-4 h-4 rounded-full bg-primary/60 mx-1" />
                <span className="text-[9px] text-muted-foreground">Medium</span>
                <div className="w-5 h-5 rounded-full bg-primary mx-1" />
                <span className="text-[9px] text-muted-foreground">High</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
