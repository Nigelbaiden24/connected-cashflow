import { useState, useMemo } from "react";
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

// Realistic simplified continent SVG paths (Natural Earth inspired)
const CONTINENTS = [
  {
    name: "North America",
    path: "M55,65 L80,50 L120,42 L160,38 L200,35 L240,40 L265,55 L280,70 L295,90 L305,115 L310,140 L315,160 L325,175 L330,195 L310,210 L290,230 L270,248 L252,260 L240,268 L225,275 L210,272 L195,258 L185,242 L178,225 L172,210 L160,198 L148,188 L135,180 L120,175 L108,170 L95,162 L82,150 L70,135 L60,118 L55,100 L52,82 L55,65Z",
    fills: ["#5a8f4e", "#6b9e5c", "#4d7a42"],  // Rich forests/grasslands
    stroke: "#3d6b34",
  },
  {
    name: "Greenland",
    path: "M310,28 L340,18 L370,20 L390,30 L395,48 L388,65 L375,78 L358,85 L340,82 L325,72 L315,58 L308,42 L310,28Z",
    fills: ["#c8d8e8", "#b8ccd8", "#d0e0ec"],  // Ice/snow
    stroke: "#98afc0",
  },
  {
    name: "South America",
    path: "M240,278 L260,272 L278,275 L295,285 L310,300 L320,320 L328,345 L332,370 L330,395 L322,418 L310,435 L295,448 L278,455 L262,452 L250,442 L242,425 L238,405 L235,385 L232,360 L230,335 L228,310 L232,290 L240,278Z",
    fills: ["#4d8c3f", "#6ba85a", "#3a7530"],  // Tropical green/Amazon
    stroke: "#2d5c24",
  },
  {
    name: "Europe",
    path: "M435,108 L455,98 L478,92 L500,90 L522,95 L542,105 L558,118 L568,135 L575,155 L578,175 L575,195 L568,212 L555,225 L540,235 L522,242 L505,245 L488,242 L472,235 L458,225 L448,212 L440,195 L435,178 L432,158 L430,138 L432,120 L435,108Z",
    fills: ["#6a9e5e", "#7aaa6a", "#5c8f50"],  // Mixed green terrain
    stroke: "#4a7a40",
  },
  {
    name: "Africa",
    path: "M448,248 L468,240 L492,238 L518,242 L540,252 L555,268 L565,290 L572,315 L575,342 L570,370 L560,395 L545,418 L525,435 L505,445 L485,442 L468,432 L455,415 L448,395 L442,370 L440,342 L438,315 L440,290 L442,268 L448,248Z",
    fills: ["#c4a84a", "#a8943c", "#dab85a"],  // Sahara gold/savanna
    stroke: "#8a7830",
  },
  {
    name: "Asia",
    path: "M558,78 L590,68 L625,60 L665,58 L705,62 L740,72 L770,88 L792,110 L805,138 L810,168 L808,200 L800,228 L785,252 L765,272 L740,288 L712,298 L685,305 L658,308 L632,305 L608,295 L588,278 L572,258 L560,235 L552,210 L548,185 L545,158 L548,130 L552,105 L558,78Z",
    fills: ["#7a9e65", "#8aaa72", "#5c8850"],  // Mixed terrain: forests, steppes
    stroke: "#4a7540",
  },
  {
    name: "Oceania",
    path: "M712,348 L738,335 L768,330 L798,335 L822,348 L838,368 L845,392 L840,415 L828,432 L810,442 L788,445 L765,440 L745,428 L730,412 L720,392 L715,370 L712,348Z",
    fills: ["#c89850", "#b88a42", "#d4a55c"],  // Outback/desert
    stroke: "#a07838",
  },
];

// Islands & detail shapes
const ISLAND_PATHS = [
  // Japan
  { path: "M755,175 L762,168 L770,170 L775,180 L772,192 L765,198 L758,195 L755,185 L755,175Z", fill: "#6a9e5e" },
  // Indonesia archipelago
  { path: "M698,318 L710,315 L722,318 L730,322 L738,320 L745,325 L748,330 L742,335 L730,332 L718,330 L708,328 L700,325 L698,318Z", fill: "#4d8c3f" },
  // UK/Ireland detail
  { path: "M452,158 L458,152 L466,148 L472,150 L476,158 L478,168 L475,178 L470,185 L462,182 L456,175 L452,168 L452,158Z", fill: "#5a9050" },
  // Madagascar
  { path: "M560,385 L565,378 L570,380 L572,390 L568,400 L562,402 L558,395 L560,385Z", fill: "#5c8f50" },
  // Sri Lanka
  { path: "M658,298 L664,295 L668,300 L666,308 L660,310 L656,305 L658,298Z", fill: "#4d8c3f" },
  // New Zealand
  { path: "M832,415 L838,410 L842,415 L840,425 L835,430 L830,425 L832,415Z", fill: "#5a9050" },
  // Iceland
  { path: "M410,100 L420,95 L430,98 L432,108 L425,112 L415,110 L410,100Z", fill: "#8aaa72" },
  // Cuba/Caribbean
  { path: "M238,258 L250,255 L262,258 L268,262 L265,268 L252,270 L240,268 L235,264 L238,258Z", fill: "#4d8c3f" },
];

// Mountain ranges
const MOUNTAIN_RANGES = [
  // Rockies
  { path: "M165,100 L170,95 L175,105 L180,98 L185,108 L190,102 L195,112", stroke: "#4a6838" },
  // Andes
  { path: "M262,310 L258,325 L260,340 L256,355 L258,370 L254,385 L256,400", stroke: "#3a5828" },
  // Alps
  { path: "M478,200 L485,195 L492,198 L498,194 L505,200", stroke: "#4a6838" },
  // Himalayas
  { path: "M635,230 L645,225 L655,228 L665,222 L675,226 L685,220", stroke: "#5a7848" },
  // Urals
  { path: "M572,110 L575,130 L573,150 L576,170", stroke: "#4a6838" },
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
      {/* Stats bar */}
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

      {/* Professional World Map */}
      <Card className="border-border/30 overflow-hidden rounded-2xl shadow-2xl">
        <CardContent className="p-0">
          <div className="relative w-full" style={{ paddingBottom: "52%" }}>
            <svg viewBox="0 0 960 500" className="absolute inset-0 w-full h-full">
              <defs>
                {/* Ocean gradient - deep blue realistic */}
                <radialGradient id="oceanGrad" cx="50%" cy="45%" r="65%">
                  <stop offset="0%" stopColor="#1a3a5c" />
                  <stop offset="35%" stopColor="#14314f" />
                  <stop offset="70%" stopColor="#0e2740" />
                  <stop offset="100%" stopColor="#0a1f32" />
                </radialGradient>
                {/* Land texture gradients */}
                {CONTINENTS.map((c, i) => (
                  <linearGradient key={`landgrad-${i}`} id={`landGrad${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={c.fills[0]} />
                    <stop offset="50%" stopColor={c.fills[1]} />
                    <stop offset="100%" stopColor={c.fills[2]} />
                  </linearGradient>
                ))}
                {/* Glow filters */}
                {Object.entries(REGIONS).map(([key, r]) => (
                  <filter key={`glow-${key}`} id={`glow-${key}`} x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feFlood floodColor={`rgb(${r.color})`} floodOpacity="0.5" />
                    <feComposite in2="blur" operator="in" />
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                ))}
                {/* Terrain texture filter */}
                <filter id="terrainNoise">
                  <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise"/>
                  <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
                  <feBlend in="SourceGraphic" in2="grayNoise" mode="soft-light" result="textured"/>
                </filter>
                {/* Inner shadow for continents */}
                <filter id="landShadow" x="-5%" y="-5%" width="110%" height="110%">
                  <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.25"/>
                </filter>
                {/* Coast glow */}
                <filter id="coastGlow" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="2" result="glow"/>
                  <feFlood floodColor="#4a8cb8" floodOpacity="0.15"/>
                  <feComposite in2="glow" operator="in"/>
                  <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Ocean */}
              <rect width="960" height="500" fill="url(#oceanGrad)" />

              {/* Ocean depth lines */}
              <g opacity="0.06" stroke="#4a8cb8">
                {Array.from({ length: 13 }, (_, i) => <line key={`lat${i}`} x1="0" y1={i * 40} x2="960" y2={i * 40} strokeDasharray="2,8" strokeWidth="0.5" />)}
                {Array.from({ length: 25 }, (_, i) => <line key={`lng${i}`} x1={i * 40} y1="0" x2={i * 40} y2="500" strokeDasharray="2,8" strokeWidth="0.5" />)}
              </g>

              {/* Equator */}
              <line x1="0" y1="260" x2="960" y2="260" stroke="#4a8cb8" strokeOpacity="0.12" strokeDasharray="6,4" strokeWidth="0.5" />
              {/* Tropic of Cancer */}
              <line x1="0" y1="210" x2="960" y2="210" stroke="#4a8cb8" strokeOpacity="0.06" strokeDasharray="4,6" strokeWidth="0.3" />
              {/* Tropic of Capricorn */}
              <line x1="0" y1="310" x2="960" y2="310" stroke="#4a8cb8" strokeOpacity="0.06" strokeDasharray="4,6" strokeWidth="0.3" />

              {/* Continents with terrain gradients and shadows */}
              <g filter="url(#landShadow)">
                {CONTINENTS.map((continent, i) => (
                  <g key={continent.name}>
                    {/* Coast highlight */}
                    <path d={continent.path} fill="none" stroke="#4a8cb8" strokeWidth="2" strokeOpacity="0.15" filter="url(#coastGlow)" />
                    {/* Land mass with gradient */}
                    <path d={continent.path} fill={`url(#landGrad${i})`} stroke={continent.stroke} strokeWidth="0.8" filter="url(#terrainNoise)" />
                    {/* Subtle inner highlight */}
                    <path d={continent.path} fill="rgba(255,255,255,0.05)" stroke="none" />
                  </g>
                ))}
              </g>

              {/* Islands */}
              <g filter="url(#terrainNoise)">
                {ISLAND_PATHS.map((island, i) => (
                  <path key={`island-${i}`} d={island.path} fill={island.fill} stroke="#3d6b34" strokeWidth="0.5" />
                ))}
              </g>

              {/* Mountain ranges */}
              <g>
                {MOUNTAIN_RANGES.map((range, i) => (
                  <path key={`mtn-${i}`} d={range.path} fill="none" stroke={range.stroke} strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
                ))}
              </g>

              {/* Desert shading on Africa/Middle East */}
              <ellipse cx="530" cy="270" rx="45" ry="25" fill="#d4b86a" fillOpacity="0.15" />
              {/* Amazon rainforest accent */}
              <ellipse cx="290" cy="335" rx="30" ry="22" fill="#2d7a1e" fillOpacity="0.12" />
              {/* Siberian tundra accent */}
              <ellipse cx="680" cy="95" rx="50" ry="18" fill="#8ab898" fillOpacity="0.1" />

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
                        stroke="rgba(100,180,255,0.12)" strokeWidth="0.5" strokeDasharray="3,5" />
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
                      <circle cx={region.cx} cy={region.cy} r="2.5" fill="rgba(100,160,220,0.2)" />
                    </g>
                  );
                }

                const dotSize = Math.min(22, 8 + opps.length * 1.8);
                const rgbColor = region.color;

                return (
                  <g key={key}>
                    {/* Outer ripple */}
                    <circle cx={region.cx} cy={region.cy} r={dotSize + 14}
                      fill={`rgba(${rgbColor}, 0.08)`} className="animate-pulse" style={{ animationDuration: "3s" }} />
                    <circle cx={region.cx} cy={region.cy} r={dotSize + 8}
                      fill={`rgba(${rgbColor}, 0.12)`} className="animate-pulse" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />

                    {/* Interactive dot */}
                    <foreignObject x={region.cx - 28} y={region.cy - 28} width="56" height="56" className="overflow-visible">
                      <HoverCard openDelay={80} closeDelay={250} onOpenChange={(open) => { if (open) setHoveredRegion(key); else setHoveredRegion(null); }}>
                        <HoverCardTrigger asChild>
                          <button className="relative flex items-center justify-center w-full h-full group" aria-label={`${region.label}: ${opps.length} opportunities`}>
                            <span className="relative rounded-full flex items-center justify-center text-white text-[11px] font-bold cursor-pointer transition-all duration-300 group-hover:scale-[1.3]"
                              style={{
                                width: dotSize, height: dotSize,
                                background: `radial-gradient(circle at 35% 35%, rgba(${rgbColor}, 1), rgba(${rgbColor}, 0.7))`,
                                boxShadow: `0 0 ${isHovered ? 24 : 14}px rgba(${rgbColor}, 0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)`,
                                border: "1.5px solid rgba(255,255,255,0.35)",
                              }}>
                              {opps.length}
                            </span>
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 p-0 z-[100] rounded-xl border-border/30 shadow-2xl overflow-hidden backdrop-blur-lg" side="top" sideOffset={12}>
                          <div className="p-3.5 border-b border-border/30" style={{ background: `linear-gradient(135deg, rgba(${rgbColor}, 0.15), transparent)` }}>
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
                      className="pointer-events-none select-none" style={{ fontSize: "7px", fill: "rgba(180,210,240,0.7)", fontWeight: 600, letterSpacing: "0.5px", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                      {region.label}
                    </text>
                  </g>
                );
              })}

              {/* Compass rose */}
              <g transform="translate(900, 460)" opacity="0.3">
                <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(180,210,240,0.4)" strokeWidth="0.5" />
                <line x1="0" y1="-16" x2="0" y2="16" stroke="rgba(180,210,240,0.4)" strokeWidth="0.5" />
                <line x1="-16" y1="0" x2="16" y2="0" stroke="rgba(180,210,240,0.4)" strokeWidth="0.5" />
                <text x="0" y="-20" textAnchor="middle" style={{ fontSize: "6px", fill: "rgba(180,210,240,0.6)", fontWeight: 700 }}>N</text>
              </g>
            </svg>

            {/* Floating legend */}
            <div className="absolute bottom-3 left-3 bg-[#0e2740]/90 backdrop-blur-md rounded-lg border border-[#2a5070]/40 p-2.5 shadow-lg">
              <p className="text-[10px] font-semibold text-[#7ab0d4] mb-1.5 uppercase tracking-wider">Concentration</p>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-400/30" />
                <span className="text-[9px] text-[#7ab0d4]">Low</span>
                <div className="w-4 h-4 rounded-full bg-blue-500/60 border border-blue-400/40 mx-1" />
                <span className="text-[9px] text-[#7ab0d4]">Medium</span>
                <div className="w-5 h-5 rounded-full bg-blue-500 border border-blue-300/50 mx-1" />
                <span className="text-[9px] text-[#7ab0d4]">High</span>
              </div>
            </div>

            {/* Map attribution */}
            <div className="absolute bottom-3 right-3 text-[8px] text-[#4a7a9a]/50 font-medium">
              FlowPulse Global Intelligence
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
