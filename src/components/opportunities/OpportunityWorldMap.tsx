import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Search, Filter, MapPin, X, SlidersHorizontal } from "lucide-react";

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

// Simplified world map regions with approximate SVG coordinates
const REGIONS: Record<string, { cx: number; cy: number; label: string; countries: string[] }> = {
  uk: { cx: 470, cy: 170, label: "United Kingdom", countries: ["UK", "United Kingdom", "England", "Scotland", "Wales"] },
  ireland: { cx: 450, cy: 175, label: "Ireland", countries: ["Ireland"] },
  western_europe: { cx: 490, cy: 200, label: "Western Europe", countries: ["France", "Germany", "Netherlands", "Belgium", "Luxembourg", "Switzerland", "Austria"] },
  southern_europe: { cx: 500, cy: 230, label: "Southern Europe", countries: ["Spain", "Portugal", "Italy", "Greece"] },
  northern_europe: { cx: 510, cy: 150, label: "Northern Europe", countries: ["Sweden", "Norway", "Denmark", "Finland", "Iceland"] },
  eastern_europe: { cx: 550, cy: 190, label: "Eastern Europe", countries: ["Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria"] },
  middle_east: { cx: 580, cy: 260, label: "Middle East", countries: ["UAE", "Dubai", "Saudi Arabia", "Qatar", "Bahrain", "Israel", "Turkey"] },
  north_africa: { cx: 490, cy: 280, label: "North Africa", countries: ["Morocco", "Egypt", "Tunisia", "Algeria", "Libya"] },
  sub_saharan_africa: { cx: 510, cy: 340, label: "Sub-Saharan Africa", countries: ["South Africa", "Nigeria", "Kenya", "Ghana", "Tanzania"] },
  south_asia: { cx: 650, cy: 280, label: "South Asia", countries: ["India", "Pakistan", "Bangladesh", "Sri Lanka"] },
  east_asia: { cx: 730, cy: 220, label: "East Asia", countries: ["China", "Japan", "South Korea", "Taiwan", "Hong Kong"] },
  southeast_asia: { cx: 710, cy: 300, label: "Southeast Asia", countries: ["Singapore", "Malaysia", "Thailand", "Vietnam", "Indonesia", "Philippines"] },
  oceania: { cx: 770, cy: 400, label: "Oceania", countries: ["Australia", "New Zealand"] },
  north_america: { cx: 230, cy: 200, label: "North America", countries: ["USA", "United States", "Canada", "US"] },
  central_america: { cx: 230, cy: 280, label: "Central America", countries: ["Mexico", "Costa Rica", "Panama"] },
  south_america: { cx: 290, cy: 370, label: "South America", countries: ["Brazil", "Argentina", "Chile", "Colombia", "Peru"] },
  caribbean: { cx: 270, cy: 270, label: "Caribbean", countries: ["Jamaica", "Bahamas", "Barbados", "Trinidad"] },
};

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: currency || "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

export function OpportunityWorldMap({ opportunities }: OpportunityWorldMapProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/finance") ? "/finance/opportunities" : "/investor/opportunities";

  const [mapSearch, setMapSearch] = useState("");
  const [distanceFilter, setDistanceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Group opportunities by region
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
      // Default to UK if no match
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
        return true;
      });
      if (filtered.length > 0) result[key] = filtered;
    }
    return result;
  }, [regionData, mapSearch, categoryFilter, priceFilter]);

  const totalFiltered = Object.values(filteredRegionData).reduce((sum, arr) => sum + arr.length, 0);
  const categories = [...new Set(opportunities.map(o => o.category))];

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities by name or location..."
            value={mapSearch}
            onChange={e => setMapSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={distanceFilter} onValueChange={setDistanceFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Distance" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="local">UK Only</SelectItem>
            <SelectItem value="europe">Europe</SelectItem>
            <SelectItem value="global">Global</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5 h-10"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {(categoryFilter !== "all" || priceFilter !== "all") && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">!</Badge>
          )}
        </Button>
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <Card className="border-border/40 bg-muted/20">
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
            <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter("all"); setPriceFilter("all"); setMapSearch(""); }} className="text-xs gap-1">
              <X className="h-3 w-3" /> Clear All
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              {totalFiltered} opportunities across {Object.keys(filteredRegionData).length} regions
            </div>
          </CardContent>
        </Card>
      )}

      {/* World Map SVG */}
      <Card className="border-border/40 overflow-hidden bg-gradient-to-br from-background via-card to-muted/20">
        <CardContent className="p-0">
          <div className="relative w-full" style={{ paddingBottom: "50%" }}>
            <svg
              viewBox="0 0 960 500"
              className="absolute inset-0 w-full h-full"
              style={{ background: "linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)/0.3))" }}
            >
              {/* Simplified continent outlines */}
              <g opacity="0.12" stroke="hsl(var(--foreground))" fill="none" strokeWidth="1">
                {/* North America */}
                <path d="M120,120 Q180,80 260,100 Q300,120 310,180 Q290,220 250,260 Q220,300 200,280 Q160,240 140,200 Q120,170 120,120Z" />
                {/* South America */}
                <path d="M240,290 Q280,270 310,300 Q330,340 320,400 Q300,440 270,450 Q250,430 240,390 Q230,350 240,290Z" />
                {/* Europe */}
                <path d="M440,130 Q480,110 530,120 Q560,140 570,180 Q550,210 520,230 Q490,240 460,220 Q440,200 430,170 Q430,150 440,130Z" />
                {/* Africa */}
                <path d="M460,250 Q500,240 540,260 Q560,300 550,360 Q530,410 500,430 Q470,420 460,380 Q450,340 450,300 Q450,270 460,250Z" />
                {/* Asia */}
                <path d="M560,100 Q620,80 700,100 Q760,130 780,180 Q770,230 740,260 Q700,290 650,300 Q600,280 570,240 Q550,200 550,160 Q550,130 560,100Z" />
                {/* Oceania */}
                <path d="M720,360 Q780,340 820,370 Q830,400 810,420 Q780,430 750,420 Q720,400 720,360Z" />
              </g>

              {/* Grid lines */}
              <g opacity="0.05" stroke="hsl(var(--foreground))">
                {[0, 100, 200, 300, 400, 500].map(y => <line key={`h${y}`} x1="0" y1={y} x2="960" y2={y} />)}
                {[0, 160, 320, 480, 640, 800, 960].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" />)}
              </g>

              {/* Region dots with hover cards */}
              {Object.entries(REGIONS).map(([key, region]) => {
                const opps = filteredRegionData[key];
                if (!opps || opps.length === 0) {
                  return (
                    <g key={key}>
                      <circle cx={region.cx} cy={region.cy} r="4" fill="hsl(var(--muted-foreground))" opacity="0.2" />
                    </g>
                  );
                }

                const dotSize = Math.min(18, 6 + opps.length * 1.5);
                return (
                  <foreignObject key={key} x={region.cx - 25} y={region.cy - 25} width="50" height="50" className="overflow-visible">
                    <HoverCard openDelay={100} closeDelay={200}>
                      <HoverCardTrigger asChild>
                        <button className="relative flex items-center justify-center w-full h-full group">
                          <span
                            className="absolute rounded-full bg-primary/20 animate-ping"
                            style={{ width: dotSize + 12, height: dotSize + 12 }}
                          />
                          <span
                            className="relative rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-primary-foreground text-[10px] font-bold cursor-pointer group-hover:scale-125 transition-transform"
                            style={{ width: dotSize, height: dotSize }}
                          >
                            {opps.length}
                          </span>
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72 p-0 z-[100]" side="top" sideOffset={10}>
                        <div className="p-3 border-b border-border/50">
                          <p className="font-semibold text-sm flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {region.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{opps.length} opportunities</p>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {opps.slice(0, 5).map(opp => (
                            <button
                              key={opp.id}
                              onClick={() => navigate(`${basePath}/${opp.id}`)}
                              className="w-full flex items-start gap-2 p-2.5 hover:bg-muted/50 transition-colors text-left border-b border-border/20 last:border-0"
                            >
                              <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                                {opp.thumbnail_url ? (
                                  <img src={opp.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">📍</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium line-clamp-1">{opp.title}</p>
                                <p className="text-[10px] text-muted-foreground line-clamp-1">{opp.short_description}</p>
                                <p className="text-xs font-bold text-primary mt-0.5">{formatPrice(opp.price, opp.price_currency)}</p>
                              </div>
                            </button>
                          ))}
                          {opps.length > 5 && (
                            <div className="p-2 text-center">
                              <span className="text-xs text-muted-foreground">+{opps.length - 5} more</span>
                            </div>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </foreignObject>
                );
              })}

              {/* Region labels */}
              {Object.entries(REGIONS).map(([key, region]) => {
                const opps = filteredRegionData[key];
                if (!opps || opps.length === 0) return null;
                return (
                  <text
                    key={`label-${key}`}
                    x={region.cx}
                    y={region.cy + 22}
                    textAnchor="middle"
                    className="text-[9px] fill-muted-foreground font-medium pointer-events-none"
                  >
                    {region.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
