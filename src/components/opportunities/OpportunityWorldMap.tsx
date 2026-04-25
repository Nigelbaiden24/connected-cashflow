import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, X, SlidersHorizontal, Globe, TrendingUp, PoundSterling, Star, Loader2, Crosshair } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface OpportunityProduct {
  id: string;
  title: string;
  short_description: string;
  category: string;
  price: number;
  price_currency: string;
  location: string;
  country: string;
  city?: string;
  region?: string;
  thumbnail_url: string;
  analyst_rating: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface OpportunityWorldMapProps {
  opportunities: OpportunityProduct[];
}

// Approximate coordinates for fallback geocoding when an opportunity lacks lat/lng
const COUNTRY_COORDS: Record<string, [number, number]> = {
  "uk": [54.5, -3], "united kingdom": [54.5, -3], "england": [52.5, -1.5], "scotland": [56.8, -4.2], "wales": [52.4, -3.8],
  "ireland": [53.4, -8],
  "france": [46.2, 2.2], "germany": [51.1, 10.4], "spain": [40.4, -3.7], "italy": [42.5, 12.5], "portugal": [39.4, -8.2],
  "netherlands": [52.1, 5.3], "belgium": [50.5, 4.5], "switzerland": [46.8, 8.2], "austria": [47.5, 14.5],
  "sweden": [60.1, 18.6], "norway": [60.5, 8.5], "denmark": [56.0, 9.5], "finland": [61.9, 25.7],
  "poland": [51.9, 19.1], "russia": [61.5, 100],
  "uae": [23.4, 53.8], "dubai": [25.2, 55.3], "saudi arabia": [23.9, 45.1], "qatar": [25.4, 51.2],
  "turkey": [38.9, 35.2], "israel": [31.0, 34.9],
  "egypt": [26.8, 30.8], "morocco": [31.8, -7.1], "south africa": [-30.6, 22.9], "nigeria": [9.1, 8.7], "kenya": [-0.0, 37.9],
  "india": [20.6, 78.9], "china": [35.9, 104.2], "japan": [36.2, 138.3], "south korea": [35.9, 127.8],
  "singapore": [1.35, 103.8], "malaysia": [4.2, 101.9], "thailand": [15.9, 100.9], "vietnam": [14.1, 108.3],
  "indonesia": [-0.8, 113.9], "philippines": [12.9, 121.8], "hong kong": [22.4, 114.1], "taiwan": [23.7, 121.0],
  "australia": [-25.3, 133.8], "new zealand": [-40.9, 174.9],
  "usa": [37.1, -95.7], "united states": [37.1, -95.7], "us": [37.1, -95.7], "canada": [56.1, -106.3],
  "mexico": [23.6, -102.6], "brazil": [-14.2, -51.9], "argentina": [-38.4, -63.6], "chile": [-35.7, -71.5],
  "colombia": [4.6, -74.3], "peru": [-9.2, -75.0],
};

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: currency || "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

const ratingColor = (rating: string) => {
  if (rating === "strong_buy" || rating === "buy") return "text-emerald-400";
  if (rating === "hold") return "text-amber-400";
  return "text-red-400";
};

// Haversine distance in km
function distanceKm(a: [number, number], b: [number, number]) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function geocodeOpportunity(opp: OpportunityProduct): [number, number] | null {
  if (opp.latitude && opp.longitude) return [Number(opp.latitude), Number(opp.longitude)];
  const candidates = [opp.city, opp.country, opp.location, opp.region].filter(Boolean) as string[];
  for (const c of candidates) {
    const key = c.toLowerCase().trim();
    if (COUNTRY_COORDS[key]) return COUNTRY_COORDS[key];
    for (const k of Object.keys(COUNTRY_COORDS)) {
      if (key.includes(k)) return COUNTRY_COORDS[k];
    }
  }
  return null;
}

// Build a custom branded marker icon
function buildIcon(color: string, count: number) {
  return L.divIcon({
    className: "fp-opp-marker",
    html: `<div style="
      position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;
      border-radius:50%;
      background:radial-gradient(circle at 35% 35%, ${color}, ${color}cc);
      box-shadow:0 0 16px ${color}80, 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.3);
      border:2px solid rgba(255,255,255,0.5);color:white;font-weight:700;font-size:13px;font-family:ui-sans-serif,system-ui;">
      ${count}
      <span style="position:absolute;inset:-8px;border-radius:50%;background:${color}33;animation:fp-pulse 2.5s ease-out infinite;"></span>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Component to fly map to a location when search is set
function MapFlyTo({ position, zoom }: { position: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, zoom, { duration: 1.4 });
  }, [position, zoom, map]);
  return null;
}

interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function OpportunityWorldMap({ opportunities }: OpportunityWorldMapProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/finance") ? "/finance/opportunities" : "/investor/opportunities";

  const [mapSearch, setMapSearch] = useState("");
  const [distanceFilter, setDistanceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Location search
  const [locationQuery, setLocationQuery] = useState("");
  const [searchedPoint, setSearchedPoint] = useState<[number, number] | null>(null);
  const [searchedLabel, setSearchedLabel] = useState<string>("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(50);

  // Pre-compute coordinates for each opportunity
  const geocoded = useMemo(() => {
    return opportunities
      .map(o => ({ opp: o, coords: geocodeOpportunity(o) }))
      .filter((x): x is { opp: OpportunityProduct; coords: [number, number] } => !!x.coords);
  }, [opportunities]);

  const filteredGeocoded = useMemo(() => {
    return geocoded.filter(({ opp }) => {
      if (mapSearch && !opp.title.toLowerCase().includes(mapSearch.toLowerCase()) && !opp.location?.toLowerCase().includes(mapSearch.toLowerCase())) return false;
      if (categoryFilter !== "all" && opp.category !== categoryFilter) return false;
      if (priceFilter === "under100k" && opp.price > 100000) return false;
      if (priceFilter === "100k-500k" && (opp.price < 100000 || opp.price > 500000)) return false;
      if (priceFilter === "500k-1m" && (opp.price < 500000 || opp.price > 1000000)) return false;
      if (priceFilter === "over1m" && opp.price < 1000000) return false;
      const ukList = ["UK", "United Kingdom", "England", "Scotland", "Wales"];
      const inUK = ukList.some(c => (opp.country || opp.location || "").toLowerCase().includes(c.toLowerCase()));
      if (distanceFilter === "local" && !inUK) return false;
      return true;
    });
  }, [geocoded, mapSearch, categoryFilter, priceFilter, distanceFilter]);

  // Cluster nearby opportunities into single markers (within ~1.5° lat/lng grid)
  const clustered = useMemo(() => {
    const groups = new Map<string, { coords: [number, number]; opps: OpportunityProduct[] }>();
    filteredGeocoded.forEach(({ opp, coords }) => {
      const key = `${Math.round(coords[0] * 2) / 2}_${Math.round(coords[1] * 2) / 2}`;
      const existing = groups.get(key);
      if (existing) {
        existing.opps.push(opp);
      } else {
        groups.set(key, { coords, opps: [opp] });
      }
    });
    return Array.from(groups.values());
  }, [filteredGeocoded]);

  // Nearby opportunities relative to searched point
  const nearbyOpportunities = useMemo(() => {
    if (!searchedPoint) return [];
    return filteredGeocoded
      .map(({ opp, coords }) => ({ opp, coords, distance: distanceKm(searchedPoint, coords) }))
      .filter(x => x.distance <= radiusKm * 5) // show wider list, sorted
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 30);
  }, [filteredGeocoded, searchedPoint, radiusKm]);

  const totalFiltered = filteredGeocoded.length;
  const totalValue = filteredGeocoded.reduce((sum, { opp }) => sum + (opp.price || 0), 0);
  const categories = [...new Set(opportunities.map(o => o.category))];
  const activeFilters = [categoryFilter !== "all", priceFilter !== "all", distanceFilter !== "all"].filter(Boolean).length;

  const handleLocationSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!locationQuery.trim()) return;
    setIsGeocoding(true);
    setGeocodeError(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(locationQuery)}`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data: GeocodeResult[] = await res.json();
      if (data.length === 0) {
        setGeocodeError("No location found. Try a city, town or postcode.");
        return;
      }
      const point: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      setSearchedPoint(point);
      setSearchedLabel(data[0].display_name);
    } catch (err) {
      setGeocodeError("Search failed. Please try again.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSearchedPoint([pos.coords.latitude, pos.coords.longitude]);
        setSearchedLabel("Your location");
        setIsGeocoding(false);
      },
      () => {
        setGeocodeError("Could not get your location.");
        setIsGeocoding(false);
      }
    );
  };

  const clearSearchedPoint = () => {
    setSearchedPoint(null);
    setSearchedLabel("");
    setLocationQuery("");
    setGeocodeError(null);
  };

  return (
    <div className="space-y-4">
      <style>{`@keyframes fp-pulse {0%{transform:scale(0.95);opacity:0.7}80%,100%{transform:scale(1.6);opacity:0}}`}</style>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Globe className="h-4 w-4 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Mapped</p><p className="text-lg font-bold">{filteredGeocoded.length}</p></div>
        </div>
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-chart-1/10"><TrendingUp className="h-4 w-4 text-chart-1" /></div>
          <div><p className="text-xs text-muted-foreground">Opportunities</p><p className="text-lg font-bold">{totalFiltered}</p></div>
        </div>
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-chart-2/10"><PoundSterling className="h-4 w-4 text-chart-2" /></div>
          <div><p className="text-xs text-muted-foreground">Total Value</p><p className="text-lg font-bold">{formatPrice(totalValue, "GBP")}</p></div>
        </div>
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10"><Star className="h-4 w-4 text-amber-500" /></div>
          <div><p className="text-xs text-muted-foreground">Categories</p><p className="text-lg font-bold">{categories.length}</p></div>
        </div>
      </div>

      {/* Location Search Bar */}
      <form onSubmit={handleLocationSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          <Input
            placeholder="Enter a town, city or postcode (e.g. Manchester, M1 1AA)…"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="pl-10 bg-card/50 border-primary/30 focus-visible:ring-primary"
          />
        </div>
        <Select value={String(radiusKm)} onValueChange={(v) => setRadiusKm(Number(v))}>
          <SelectTrigger className="w-full sm:w-[140px] bg-card/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">Within 10 km</SelectItem>
            <SelectItem value="25">Within 25 km</SelectItem>
            <SelectItem value="50">Within 50 km</SelectItem>
            <SelectItem value="100">Within 100 km</SelectItem>
            <SelectItem value="500">Within 500 km</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isGeocoding} className="gap-1.5">
          {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Find Nearby
        </Button>
        <Button type="button" variant="outline" onClick={useMyLocation} className="gap-1.5">
          <Crosshair className="h-4 w-4" /> Use My Location
        </Button>
        {searchedPoint && (
          <Button type="button" variant="ghost" onClick={clearSearchedPoint} className="gap-1.5">
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </form>
      {geocodeError && <p className="text-xs text-destructive">{geocodeError}</p>}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filter opportunities by name…" value={mapSearch} onChange={e => setMapSearch(e.target.value)} className="pl-10 bg-card/50 border-border/40" />
        </div>
        <Select value={distanceFilter} onValueChange={setDistanceFilter}>
          <SelectTrigger className="w-[160px] bg-card/50 border-border/40"><SelectValue placeholder="Region" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="local">UK Only</SelectItem>
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

      {/* Interactive Satellite Map */}
      <Card className="border-border/30 overflow-hidden rounded-2xl shadow-2xl">
        <CardContent className="p-0">
          <div className="relative w-full" style={{ height: "560px" }}>
            <MapContainer
              center={[20, 0]}
              zoom={2}
              minZoom={2}
              maxZoom={19}
              scrollWheelZoom
              worldCopyJump
              style={{ height: "100%", width: "100%", background: "hsl(var(--background))" }}
            >
              {/* Esri World Imagery: deep zoom satellite — no API key required */}
              <TileLayer
                attribution='Tiles &copy; Esri, Maxar, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
              {/* Place name labels overlay for context */}
              <TileLayer
                attribution='Labels &copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />

              <MapFlyTo position={searchedPoint} zoom={11} />

              {/* Searched location marker + radius */}
              {searchedPoint ? (
                <CircleMarker
                  center={searchedPoint}
                  radius={10}
                  pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.9, weight: 2 }}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-semibold mb-0.5">Searched location</p>
                      <p className="text-muted-foreground line-clamp-2">{searchedLabel}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ) : null}

              {/* Opportunity markers */}
              {clustered.map((cluster, idx) => {
                const color = "#3b82f6";
                return (
                  <Marker key={idx} position={cluster.coords} icon={buildIcon(color, cluster.opps.length)}>
                    <Popup minWidth={260} maxWidth={320}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">
                            {cluster.opps[0].country || cluster.opps[0].location}
                          </p>
                          <Badge variant="secondary" className="text-[10px]">{cluster.opps.length} listed</Badge>
                        </div>
                        <div className="max-h-56 overflow-y-auto space-y-1.5">
                          {cluster.opps.slice(0, 6).map((opp) => (
                            <button
                              key={opp.id}
                              onClick={() => navigate(`${basePath}/${opp.id}`)}
                              className="w-full flex items-start gap-2 p-1.5 hover:bg-muted/40 rounded text-left"
                            >
                              <div className="w-9 h-9 rounded overflow-hidden bg-muted flex-shrink-0">
                                {opp.thumbnail_url ? (
                                  <img src={opp.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold line-clamp-1">{opp.title}</p>
                                <p className="text-[10px] text-muted-foreground line-clamp-1">{opp.short_description}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-bold text-primary">{formatPrice(opp.price, opp.price_currency)}</span>
                                  {opp.analyst_rating && (
                                    <span className={`text-[9px] font-medium ${ratingColor(opp.analyst_rating)}`}>
                                      ★ {opp.analyst_rating.replace(/_/g, " ").toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                          {cluster.opps.length > 6 && (
                            <p className="text-[10px] text-center text-muted-foreground pt-1">+{cluster.opps.length - 6} more</p>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Floating zoom hint */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 px-3 py-1.5 shadow-lg pointer-events-none">
              <p className="text-[10px] font-medium text-white/80">
                🛰️ Zoom in for street-level satellite detail
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Opportunities Box */}
      {searchedPoint && (
        <Card className="border-primary/40 bg-gradient-to-br from-card to-primary/5 backdrop-blur-sm shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Opportunities Near {searchedLabel.split(",")[0]}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {nearbyOpportunities.length === 0
                    ? "No opportunities mapped within range. Try widening the radius."
                    : `${nearbyOpportunities.filter(o => o.distance <= radiusKm).length} within ${radiusKm} km · showing nearest ${nearbyOpportunities.length}`}
                </p>
              </div>
            </div>

            {nearbyOpportunities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto pr-1">
                {nearbyOpportunities.map(({ opp, distance }) => (
                  <button
                    key={opp.id}
                    onClick={() => navigate(`${basePath}/${opp.id}`)}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/40 bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border/30">
                      {opp.thumbnail_url ? (
                        <img src={opp.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold line-clamp-1 group-hover:text-primary transition-colors">{opp.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{opp.city || opp.country || opp.location}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-primary">{formatPrice(opp.price, opp.price_currency)}</span>
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5">
                          {distance < 1 ? "<1 km" : `${Math.round(distance)} km`}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
