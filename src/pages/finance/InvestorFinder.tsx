import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, Building2, MapPin, TrendingUp, DollarSign, Globe, 
  Filter, ChevronDown, ExternalLink, Mail, Phone, Linkedin,
  Users, Briefcase, Target, Activity, X, Download
} from "lucide-react";
import { cn } from "@/lib/utils";

const INVESTOR_TYPES = ["VC", "Angel", "PE", "Family Office", "Corporate VC", "Accelerator"];
const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Growth", "Late Stage"];
const SECTORS = [
  "Fintech", "Wealthtech", "Insurtech", "SaaS", "B2B Software", "AI/ML", 
  "Healthcare", "EdTech", "PropTech", "CleanTech", "DeepTech", "Consumer",
  "E-commerce", "Cybersecurity", "Blockchain", "IoT", "Biotech"
];
const GEOGRAPHIES = ["UK", "Europe", "US", "Global", "MENA", "Asia Pacific"];

interface InvestorProfile {
  id: string;
  investor_name: string;
  investor_type: string;
  sectors: string[];
  location: string | null;
  country: string | null;
  stage_focus: string[];
  avg_cheque_min: number | null;
  avg_cheque_max: number | null;
  total_deals: number | null;
  fund_size: number | null;
  dry_powder: number | null;
  actively_investing: boolean | null;
  recent_deals: any;
  portfolio_companies: string[];
  contact_email: string | null;
  contact_phone: string | null;
  linkedin_url: string | null;
  website: string | null;
  geography_focus: string[];
  fundraising_status: string | null;
  keywords: string[];
  last_investment_date: string | null;
  description: string | null;
}

export default function InvestorFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedGeo, setSelectedGeo] = useState<string[]>([]);
  const [chequeRange, setChequeRange] = useState<[number, number]>([0, 50]);
  const [activeOnly, setActiveOnly] = useState(false);
  const [minDeals, setMinDeals] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: investors = [], isLoading } = useQuery({
    queryKey: ["investor-finder-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investor_finder_profiles")
        .select("*")
        .order("investor_name");
      if (error) throw error;
      return (data || []) as InvestorProfile[];
    },
  });

  const filtered = useMemo(() => {
    return investors.filter((inv) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          inv.investor_name, inv.location, inv.description,
          ...(inv.sectors || []), ...(inv.keywords || []), ...(inv.portfolio_companies || [])
        ].filter(Boolean).join(" ").toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (selectedTypes.length && !selectedTypes.includes(inv.investor_type)) return false;
      if (selectedStages.length && !inv.stage_focus?.some(s => selectedStages.includes(s))) return false;
      if (selectedSectors.length && !inv.sectors?.some(s => selectedSectors.includes(s))) return false;
      if (selectedGeo.length && !inv.geography_focus?.some(g => selectedGeo.includes(g))) return false;
      if (activeOnly && !inv.actively_investing) return false;
      if (minDeals > 0 && (inv.total_deals || 0) < minDeals) return false;
      const minCheque = chequeRange[0] * 100000;
      const maxCheque = chequeRange[1] * 100000;
      if (minCheque > 0 && inv.avg_cheque_max && inv.avg_cheque_max < minCheque) return false;
      if (maxCheque < 5000000 && inv.avg_cheque_min && inv.avg_cheque_min > maxCheque) return false;
      return true;
    });
  }, [investors, searchQuery, selectedTypes, selectedStages, selectedSectors, selectedGeo, chequeRange, activeOnly, minDeals]);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedStages([]);
    setSelectedSectors([]);
    setSelectedGeo([]);
    setChequeRange([0, 50]);
    setActiveOnly(false);
    setMinDeals(0);
    setSearchQuery("");
  };

  const activeFilterCount = [selectedTypes, selectedStages, selectedSectors, selectedGeo].filter(a => a.length > 0).length + (activeOnly ? 1 : 0) + (minDeals > 0 ? 1 : 0);

  const formatCurrency = (v: number | null) => {
    if (!v) return "—";
    if (v >= 1e9) return `£${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `£${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `£${(v / 1e3).toFixed(0)}K`;
    return `£${v}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Users className="h-6 w-6" />
          </div>
          Investor Finder
        </h1>
        <p className="text-muted-foreground">
          Discover VCs, angels, PE firms and family offices. Filter by stage, sector, geography and cheque size.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search investors, sectors, portfolio companies, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={filtersOpen ? "default" : "outline"}
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">{activeFilterCount}</Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Panel */}
        {filtersOpen && (
          <Card className="lg:w-80 shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-6 pr-4">
                  {/* Investor Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Investor Type</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {INVESTOR_TYPES.map(t => (
                        <Badge
                          key={t}
                          variant={selectedTypes.includes(t) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleFilter(selectedTypes, t, setSelectedTypes)}
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Stage Focus */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Investment Stage</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {STAGES.map(s => (
                        <Badge
                          key={s}
                          variant={selectedStages.includes(s) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleFilter(selectedStages, s, setSelectedStages)}
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Sector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Sector / Industry</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {SECTORS.map(s => (
                        <Badge
                          key={s}
                          variant={selectedSectors.includes(s) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleFilter(selectedSectors, s, setSelectedSectors)}
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Geography */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Geography</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {GEOGRAPHIES.map(g => (
                        <Badge
                          key={g}
                          variant={selectedGeo.includes(g) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleFilter(selectedGeo, g, setSelectedGeo)}
                        >
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Cheque Size */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      Avg. Cheque Size: £{(chequeRange[0] * 100).toLocaleString()}K – £{(chequeRange[1] * 100).toLocaleString()}K
                    </Label>
                    <Slider
                      value={chequeRange}
                      onValueChange={(v) => setChequeRange(v as [number, number])}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </div>

                  <Separator />

                  {/* Min Deals */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Min. Previous Deals</Label>
                    <Input
                      type="number"
                      value={minDeals || ""}
                      onChange={(e) => setMinDeals(Number(e.target.value) || 0)}
                      placeholder="0"
                      min={0}
                    />
                  </div>

                  <Separator />

                  {/* Active Only */}
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Actively Investing Only</Label>
                    <Switch checked={activeOnly} onCheckedChange={setActiveOnly} />
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${filtered.length} investor${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {filtered.length === 0 && !isLoading && (
            <Card className="py-16 text-center">
              <CardContent className="space-y-4">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/40" />
                <div>
                  <p className="text-lg font-semibold">No investors found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {investors.length === 0
                      ? "Investor profiles haven't been added yet. Use the admin scraper to populate data."
                      : "Try adjusting your filters or search query."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {filtered.map((inv) => (
              <Card
                key={inv.id}
                className={cn(
                  "transition-all hover:shadow-md cursor-pointer",
                  expandedId === inv.id && "ring-2 ring-primary/20"
                )}
                onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
              >
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base">{inv.investor_name}</h3>
                        <Badge variant="secondary" className="text-xs">{inv.investor_type}</Badge>
                        {inv.actively_investing && (
                          <Badge className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-200">
                            <Activity className="h-3 w-3 mr-1" /> Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
                        {inv.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {inv.location}
                          </span>
                        )}
                        {(inv.avg_cheque_min || inv.avg_cheque_max) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(inv.avg_cheque_min)} – {formatCurrency(inv.avg_cheque_max)}
                          </span>
                        )}
                        {inv.total_deals != null && inv.total_deals > 0 && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> {inv.total_deals} deals
                          </span>
                        )}
                        {inv.fund_size && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> Fund: {formatCurrency(inv.fund_size)}
                          </span>
                        )}
                      </div>
                      {inv.sectors && inv.sectors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {inv.sectors.slice(0, 5).map(s => (
                            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                          {inv.sectors.length > 5 && (
                            <Badge variant="outline" className="text-xs">+{inv.sectors.length - 5}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronDown className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform shrink-0",
                      expandedId === inv.id && "rotate-180"
                    )} />
                  </div>

                  {/* Expanded Details */}
                  {expandedId === inv.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {inv.description && (
                        <p className="text-sm text-muted-foreground">{inv.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase">Stage Focus</Label>
                          <div className="flex flex-wrap gap-1">
                            {(inv.stage_focus || []).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                            {(!inv.stage_focus || inv.stage_focus.length === 0) && <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase">Geography</Label>
                          <div className="flex flex-wrap gap-1">
                            {(inv.geography_focus || []).map(g => <Badge key={g} variant="outline" className="text-xs">{g}</Badge>)}
                            {(!inv.geography_focus || inv.geography_focus.length === 0) && <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase">Dry Powder</Label>
                          <p className="text-sm font-medium">{formatCurrency(inv.dry_powder)}</p>
                        </div>
                      </div>

                      {inv.portfolio_companies && inv.portfolio_companies.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase">Portfolio Companies</Label>
                          <div className="flex flex-wrap gap-1">
                            {inv.portfolio_companies.slice(0, 10).map(c => (
                              <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                            ))}
                            {inv.portfolio_companies.length > 10 && (
                              <Badge variant="secondary" className="text-xs">+{inv.portfolio_companies.length - 10} more</Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact */}
                      <div className="flex flex-wrap gap-3">
                        {inv.contact_email && (
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={(e) => { e.stopPropagation(); window.open(`mailto:${inv.contact_email}`); }}>
                            <Mail className="h-3 w-3" /> Email
                          </Button>
                        )}
                        {inv.linkedin_url && (
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={(e) => { e.stopPropagation(); window.open(inv.linkedin_url!, "_blank"); }}>
                            <Linkedin className="h-3 w-3" /> LinkedIn
                          </Button>
                        )}
                        {inv.website && (
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={(e) => { e.stopPropagation(); window.open(inv.website!, "_blank"); }}>
                            <ExternalLink className="h-3 w-3" /> Website
                          </Button>
                        )}
                        {inv.contact_phone && (
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={(e) => { e.stopPropagation(); window.open(`tel:${inv.contact_phone}`); }}>
                            <Phone className="h-3 w-3" /> Call
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
