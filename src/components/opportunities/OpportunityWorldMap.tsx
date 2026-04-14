import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Search, MapPin, X, SlidersHorizontal, Globe, TrendingUp, DollarSign, Star } from "lucide-react";
import worldMapImg from "@/assets/world-map.gif";

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

// Positions calibrated to the world-map.gif image (percentage-based for responsiveness)
const REGIONS: Record<string, { x: number; y: number; label: string; countries: string[]; color: string }> = {
  uk:              { x: 44.5, y: 22, label: "United Kingdom", countries: ["UK", "United Kingdom", "England", "Scotland", "Wales"], color: "59, 130, 246" },
  ireland:         { x: 42, y: 24, label: "Ireland", countries: ["Ireland"], color: "16, 185, 129" },
  western_europe:  { x: 47, y: 29, label: "Western Europe", countries: ["France", "Germany", "Netherlands", "Belgium", "Luxembourg", "Switzerland", "Austria"], color: "99, 102, 241" },
  southern_europe: { x: 49, y: 35, label: "Southern Europe", countries: ["Spain", "Portugal", "Italy", "Greece"], color: "245, 158, 11" },
  northern_europe: { x: 50, y: 17, label: "Northern Europe", countries: ["Sweden", "Norway", "Denmark", "Finland", "Iceland"], color: "6, 182, 212" },
  eastern_europe:  { x: 55, y: 25, label: "Eastern Europe", countries: ["Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria"], color: "168, 85, 247" },
  russia:          { x: 72, y: 14, label: "Russia", countries: ["Russia"], color: "120, 120, 180" },
  middle_east:     { x: 60, y: 42, label: "Middle East", countries: ["UAE", "Dubai", "Saudi Arabia", "Qatar", "Bahrain", "Israel", "Turkey"], color: "239, 68, 68" },
  north_africa:    { x: 47, y: 45, label: "North Africa", countries: ["Morocco", "Egypt", "Tunisia", "Algeria", "Libya"], color: "234, 179, 8" },
  sub_saharan_africa: { x: 50, y: 62, label: "Sub-Saharan Africa", countries: ["South Africa", "Nigeria", "Kenya", "Ghana", "Tanzania"], color: "34, 197, 94" },
  south_asia:      { x: 68, y: 42, label: "South Asia", countries: ["India", "Pakistan", "Bangladesh", "Sri Lanka"], color: "249, 115, 22" },
  east_asia:       { x: 78, y: 28, label: "East Asia", countries: ["China", "Japan", "South Korea", "Taiwan", "Hong Kong"], color: "236, 72, 153" },
  southeast_asia:  { x: 78, y: 50, label: "Southeast Asia", countries: ["Singapore", "Malaysia", "Thailand", "Vietnam", "Indonesia", "Philippines"], color: "20, 184, 166" },
  oceania:         { x: 85, y: 76, label: "Oceania", countries: ["Australia", "New Zealand"], color: "251, 146, 60" },
  north_america:   { x: 18, y: 28, label: "North America", countries: ["USA", "United States", "Canada", "US"], color: "37, 99, 235" },
  central_america: { x: 18, y: 48, label: "Central America", countries: ["Mexico", "Costa Rica", "Panama"], color: "22, 163, 74" },
  south_america:   { x: 28, y: 68, label: "South America", countries: ["Brazil", "Argentina", "Chile", "Colombia", "Peru"], color: "147, 51, 234" },
  caribbean:       { x: 23, y: 43, label: "Caribbean", countries: ["Jamaica", "Bahamas", "Barbados", "Trinidad"], color: "14, 165, 233" },
};

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

      {/* World Map with real image */}
      <Card className="border-border/30 overflow-hidden rounded-2xl shadow-2xl">
        <CardContent className="p-0">
          <div className="relative w-full">
            <img
              src={worldMapImg}
              alt="World Map"
              className="w-full h-auto block select-none pointer-events-none"
              draggable={false}
            />

            {/* Interactive region dots overlaid on image */}
            {Object.entries(REGIONS).map(([key, region]) => {
              const opps = filteredRegionData[key];
              const hasOpps = opps && opps.length > 0;

              if (!hasOpps) {
                return (
                  <div
                    key={key}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      left: `${region.x}%`,
                      top: `${region.y}%`,
                      transform: "translate(-50%, -50%)",
                      background: "rgba(100,160,220,0.25)",
                      border: "1px solid rgba(100,160,220,0.3)",
                    }}
                  />
                );
              }

              const dotSize = Math.min(36, 18 + opps.length * 3);

              return (
                <div
                  key={key}
                  className="absolute"
                  style={{
                    left: `${region.x}%`,
                    top: `${region.y}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                  }}
                >
                  {/* Pulse ring */}
                  <div
                    className="absolute rounded-full animate-ping"
                    style={{
                      width: dotSize + 16,
                      height: dotSize + 16,
                      left: -(dotSize + 16) / 2 + dotSize / 2,
                      top: -(dotSize + 16) / 2 + dotSize / 2,
                      background: `rgba(${region.color}, 0.2)`,
                      animationDuration: "2.5s",
                    }}
                  />

                  <HoverCard openDelay={80} closeDelay={250}>
                    <HoverCardTrigger asChild>
                      <button
                        className="relative rounded-full flex items-center justify-center text-white font-bold cursor-pointer transition-all duration-300 hover:scale-125"
                        style={{
                          width: dotSize,
                          height: dotSize,
                          fontSize: Math.max(10, dotSize * 0.35),
                          background: `radial-gradient(circle at 35% 35%, rgba(${region.color}, 1), rgba(${region.color}, 0.7))`,
                          boxShadow: `0 0 16px rgba(${region.color}, 0.5), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)`,
                          border: "2px solid rgba(255,255,255,0.4)",
                        }}
                        aria-label={`${region.label}: ${opps.length} opportunities`}
                      >
                        {opps.length}
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 p-0 z-[100] rounded-xl border-border/30 shadow-2xl overflow-hidden backdrop-blur-lg" side="top" sideOffset={12}>
                      <div className="p-3.5 border-b border-border/30" style={{ background: `linear-gradient(135deg, rgba(${region.color}, 0.15), transparent)` }}>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: `rgb(${region.color})` }} />
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
                                <span className="text-xs font-bold" style={{ color: `rgb(${region.color})` }}>{formatPrice(opp.price, opp.price_currency)}</span>
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

                  {/* Region label below dot */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none select-none"
                    style={{
                      top: dotSize + 4,
                      fontSize: "9px",
                      fontWeight: 600,
                      color: "rgba(30,30,30,0.85)",
                      textShadow: "0 0 4px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.7)",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {region.label}
                  </div>
                </div>
              );
            })}

            {/* Floating legend */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md rounded-lg border border-gray-200 p-2.5 shadow-lg">
              <p className="text-[10px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Concentration</p>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-400/40" />
                <span className="text-[9px] text-gray-500">Low</span>
                <div className="w-4 h-4 rounded-full bg-blue-500/60 border border-blue-400/50 mx-1" />
                <span className="text-[9px] text-gray-500">Medium</span>
                <div className="w-5 h-5 rounded-full bg-blue-500 border border-blue-300/60 mx-1" />
                <span className="text-[9px] text-gray-500">High</span>
              </div>
            </div>

            {/* Attribution */}
            <div className="absolute bottom-3 right-3 text-[8px] text-gray-400 font-medium bg-white/70 px-2 py-1 rounded">
              FlowPulse Global Intelligence
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
