import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OpportunityShowcase } from "@/components/opportunities/OpportunityShowcase";
import { SectorFolderGrid } from "@/components/opportunities/SectorFolderGrid";
import { AdvancedFilters, type FilterState } from "@/components/opportunities/AdvancedFilters";
import { OpportunityWorldMap } from "@/components/opportunities/OpportunityWorldMap";
import { ShowcaseDarkToggle } from "@/components/showcase/ShowcaseDarkToggle";
import { StarryBackground } from "@/components/showcase/StarryBackground";
import { MorningstarDetailPanel } from "@/components/market/MorningstarDetailPanel";
import { 
  Building2, Briefcase, Gem, Search, Star, TrendingUp, MapPin, Clock, Eye,
  LayoutGrid, List, Globe, Users, Award, Package,
  Landmark, ChevronRight, Presentation, ArrowLeft, Banknote, HandCoins,
  Zap, Factory, Shield, Music, Leaf, Repeat, Layers, PieChart,
  Palette, Wine, Plane, Trophy, Film, HeartHandshake, Map, KeyRound, Hotel
} from "lucide-react";

// Category default thumbnail images
import thumbRealEstate from "@/assets/opportunities/real_estate.jpg";
import thumbCommodities from "@/assets/opportunities/commodities.jpg";
import thumbAlternatives from "@/assets/opportunities/alternatives.jpg";
import thumbEsg from "@/assets/opportunities/esg.jpg";
import thumbFractionalPeVc from "@/assets/opportunities/fractional_pe_vc.jpg";
import thumbPrivateMarketPlatforms from "@/assets/opportunities/private_market_platforms.jpg";
import thumbCapitalProtectedNotes from "@/assets/opportunities/capital_protected_notes.jpg";
import thumbThematicsPackaged from "@/assets/opportunities/thematics_packaged.jpg";
import thumbCopyTrading from "@/assets/opportunities/copy_trading.jpg";
import thumbRoyalties from "@/assets/opportunities/royalties.jpg";
import thumbBusinesses from "@/assets/opportunities/businesses.jpg";
import thumbMiniBonds from "@/assets/opportunities/mini_bonds.jpg";
import thumbTimepieces from "@/assets/opportunities/timepieces.jpg";
import thumbFineWine from "@/assets/opportunities/fine_wine.jpg";
import thumbArt from "@/assets/opportunities/art.jpg";
import thumbCollectibles from "@/assets/opportunities/collectibles.jpg";
import thumbLuxuryAssets from "@/assets/opportunities/luxury_assets.jpg";
import thumbEntertainmentFinance from "@/assets/opportunities/entertainment_finance.jpg";
import thumbInsuranceInvestments from "@/assets/opportunities/insurance_investments.jpg";
import thumbSportsInvestments from "@/assets/opportunities/sports_investments.jpg";
import thumbLand from "@/assets/opportunities/land.jpg";
import thumbRentToRent from "@/assets/opportunities/rent_to_rent.jpg";
import thumbRentToSa from "@/assets/opportunities/rent_to_sa.jpg";

const categoryThumbnailMap: Record<string, string> = {
  real_estate: thumbRealEstate,
  land: thumbLand,
  rent_to_rent: thumbRentToRent,
  rent_to_sa: thumbRentToSa,
  commodities: thumbCommodities,
  alternatives: thumbAlternatives,
  esg: thumbEsg,
  fractional_pe_vc: thumbFractionalPeVc,
  private_market_platforms: thumbPrivateMarketPlatforms,
  capital_protected_notes: thumbCapitalProtectedNotes,
  thematics_packaged: thumbThematicsPackaged,
  copy_trading: thumbCopyTrading,
  royalties: thumbRoyalties,
  businesses: thumbBusinesses,
  mini_bonds: thumbMiniBonds,
  timepieces: thumbTimepieces,
  fine_wine: thumbFineWine,
  art: thumbArt,
  collectibles: thumbCollectibles,
  luxury_assets: thumbLuxuryAssets,
  entertainment_finance: thumbEntertainmentFinance,
  insurance_investments: thumbInsuranceInvestments,
  sports_investments: thumbSportsInvestments,
};

interface OpportunityProduct {
  id: string;
  title: string;
  short_description: string;
  category: string;
  sub_category: string;
  price: number;
  price_currency: string;
  location: string;
  country: string;
  thumbnail_url: string;
  analyst_rating: string;
  overall_conviction_score: number;
  status: string;
  featured: boolean;
  created_at: string;
  expected_irr: number | null;
  minimum_investment: number | null;
  deal_stage: string | null;
  geography: string | null;
  liquidity_horizon: string | null;
  risk_score: number | null;
}

// Investor-curated opportunity taxonomy. Each category mirrors the admin
// Data Pipeline scrape topics and groups granular sub-categories.
const categoryConfig = {
  real_estate: { label: "Real Estate", icon: Building2, color: "bg-blue-500/10 text-blue-500", subCategories: ["Residential Property", "Commercial Property", "Industrial Property", "Student Housing", "Holiday Rentals", "Build-to-Rent", "International Property"] },
  land: { label: "Land", icon: Map, color: "bg-emerald-600/10 text-emerald-600", subCategories: ["Land Banking", "Farmland", "Development Land", "Strategic Land", "Forestry"] },
  rent_to_rent: { label: "Rent to Rent", icon: KeyRound, color: "bg-indigo-500/10 text-indigo-500", subCategories: ["HMO Rent to Rent", "Single Let R2R", "Corporate Lets", "Guaranteed Rent Schemes"] },
  rent_to_sa: { label: "Rent to Serviced Accommodation", icon: Hotel, color: "bg-cyan-600/10 text-cyan-600", subCategories: ["Short-Term Lets", "Corporate Stays", "Airbnb R2SA", "Aparthotel Conversions"] },
  commodities: { label: "Commodities", icon: Package, color: "bg-yellow-500/10 text-yellow-600", subCategories: ["Oil", "Natural Gas", "Wheat", "Coffee", "Livestock"] },
  alternatives: { label: "Alternative Investments", icon: Gem, color: "bg-purple-500/10 text-purple-500", subCategories: ["Hedge Funds", "Multi-Strategy", "Structured Alternatives"] },
  esg: { label: "ESG & Impact Investing", icon: Leaf, color: "bg-emerald-500/10 text-emerald-500", subCategories: ["Renewable Energy", "Social Impact", "Green Bonds", "Sustainable Funds", "Carbon Credits"] },
  fractional_pe_vc: { label: "Fractional PE / VC", icon: PieChart, color: "bg-violet-500/10 text-violet-500", subCategories: ["Crowdfunding", "Syndicates", "Fractional Deals", "Angel Co-Investment"] },
  private_market_platforms: { label: "Private Market Platforms", icon: Layers, color: "bg-cyan-500/10 text-cyan-500", subCategories: ["Pre-IPO", "Secondary Shares", "Tender Offers", "Marketplace Deals"] },
  capital_protected_notes: { label: "Capital-Protected & Income Notes", icon: Shield, color: "bg-rose-500/10 text-rose-500", subCategories: ["Structured Notes", "Capital Protection", "Autocallables", "Income Notes"] },
  thematics_packaged: { label: "Thematics & Packaged Investing", icon: Landmark, color: "bg-orange-500/10 text-orange-500", subCategories: ["Thematic Baskets", "Smart Beta", "Robo Portfolios", "Model Portfolios"] },
  copy_trading: { label: "Copy Trading", icon: Repeat, color: "bg-teal-500/10 text-teal-500", subCategories: ["Mirror Trading", "Social Trading", "Lead Traders", "Strategy Following"] },
  royalties: { label: "Royalties", icon: Music, color: "bg-fuchsia-500/10 text-fuchsia-500", subCategories: ["Music Royalties", "Film Royalties", "Publishing Royalties", "Patent Royalties"] },
  businesses: { label: "Businesses", icon: Briefcase, color: "bg-green-500/10 text-green-500", subCategories: ["SMEs", "Startups", "Franchises", "Established Businesses"] },
  mini_bonds: { label: "Mini Bonds & Loan Notes", icon: Banknote, color: "bg-lime-500/10 text-lime-600", subCategories: ["Corporate Mini Bonds", "Property Mini Bonds", "Green Mini Bonds", "Loan Notes"] },
  timepieces: { label: "Timepieces", icon: Clock, color: "bg-amber-600/10 text-amber-600", subCategories: ["Rolex", "Patek Philippe", "Audemars Piguet", "Vintage", "Limited Editions"] },
  fine_wine: { label: "Fine Wine", icon: Wine, color: "bg-red-700/10 text-red-700", subCategories: ["Bordeaux", "Burgundy", "Champagne", "Rare Whisky"] },
  art: { label: "Art", icon: Palette, color: "bg-pink-500/10 text-pink-500", subCategories: ["Fine Art", "Contemporary", "Blue Chip Artists", "Editions"] },
  collectibles: { label: "Collectibles", icon: Award, color: "bg-indigo-500/10 text-indigo-500", subCategories: ["Rare Whisky", "Sneakers", "Comics", "Trading Cards", "Memorabilia"] },
  luxury_assets: { label: "Luxury Assets", icon: Plane, color: "bg-amber-500/10 text-amber-500", subCategories: ["Yachts", "Jets", "Supercars", "Rare Handbags", "Jewelry"] },
  entertainment_finance: { label: "Entertainment Finance", icon: Film, color: "bg-purple-600/10 text-purple-600", subCategories: ["Film Financing", "TV Production Finance", "Sports Rights", "Esports Organizations"] },
  insurance_investments: { label: "Insurance-Based Investments", icon: HeartHandshake, color: "bg-sky-500/10 text-sky-600", subCategories: ["Annuities", "Whole Life Insurance", "Universal Life Policies", "Premium Finance Structures", "Life Settlements"] },
  sports_investments: { label: "Sports Investments", icon: Trophy, color: "bg-orange-600/10 text-orange-600", subCategories: ["Football Clubs", "Athlete-Backed Ventures", "Sports Trading Cards", "Racehorses"] },
};

const ratingColors: Record<string, string> = {
  Gold: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  Silver: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  Bronze: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  Neutral: "bg-slate-500/20 text-slate-600 border-slate-500/30",
  Negative: "bg-red-500/20 text-red-600 border-red-500/30"
};

export default function OpportunityIntelligence() {
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const isFinancePlatform = location.pathname.startsWith("/finance");
  const detailBasePath = isFinancePlatform ? "/finance/opportunities" : "/investor/opportunities";
  const [opportunities, setOpportunities] = useState<OpportunityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "showcase" | "map">("grid");
  const [showFolders, setShowFolders] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    geography: "all", ticketMin: "", ticketMax: "", expectedReturn: "all", riskRating: "all", dealStage: "all"
  });
  const [selectedAnalysisAsset, setSelectedAnalysisAsset] = useState<OpportunityProduct | null>(null);

  const handleOpportunityClick = (opportunity: OpportunityProduct) => {
    if (opportunity.category === "stocks" || opportunity.category === "crypto") {
      setSelectedAnalysisAsset(opportunity);
    } else {
      navigate(`${detailBasePath}/${opportunity.id}`);
    }
  };

  useEffect(() => { fetchCategoryCounts(); }, []);
  useEffect(() => { fetchOpportunities(); }, [activeCategory]);

  const fetchCategoryCounts = async () => {
    try {
      const { data, error } = await supabase.from("opportunity_products").select("category").in("status", ["active", "draft"]);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((item: any) => { counts[item.category] = (counts[item.category] || 0) + 1; });
      setCategoryCounts(counts);
    } catch (e) { console.error("Error fetching category counts:", e); }
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      let query = supabase.from("opportunity_products").select("*").in("status", ["active", "draft"]).order("featured", { ascending: false });
      if (activeCategory !== "all") query = query.eq("category", activeCategory);
      const { data, error } = await query;
      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      toast.error("Failed to load opportunities");
    } finally { setLoading(false); }
  };

  const filteredOpportunities = opportunities
    .filter(opp => {
      if (searchQuery && !opp.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !opp.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !opp.location?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Advanced filters
      if (advancedFilters.geography !== "all") {
        const geo = (opp.geography || opp.country || "").toLowerCase();
        if (!geo.includes(advancedFilters.geography.toLowerCase())) return false;
      }
      if (advancedFilters.ticketMin && opp.price < parseFloat(advancedFilters.ticketMin)) return false;
      if (advancedFilters.ticketMax && opp.price > parseFloat(advancedFilters.ticketMax)) return false;
      if (advancedFilters.riskRating !== "all" && opp.analyst_rating !== advancedFilters.riskRating) return false;
      if (advancedFilters.dealStage !== "all" && opp.deal_stage !== advancedFilters.dealStage) return false;
      if (advancedFilters.expectedReturn !== "all" && opp.expected_irr != null) {
        const irr = opp.expected_irr;
        const [min, max] = advancedFilters.expectedReturn === "50+" ? [50, Infinity] :
          advancedFilters.expectedReturn.split("-").map(Number);
        if (irr < min || irr > max) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "price_high": return (b.price || 0) - (a.price || 0);
        case "price_low": return (a.price || 0) - (b.price || 0);
        case "rating": return (b.overall_conviction_score || 0) - (a.overall_conviction_score || 0);
        default: return 0;
      }
    });

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency || 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const OpportunityCard = ({ opportunity }: { opportunity: OpportunityProduct }) => {
    const config = categoryConfig[opportunity.category as keyof typeof categoryConfig];
    const Icon = config?.icon || Building2;
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border-border/50 hover:border-primary/30">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {(opportunity.thumbnail_url || categoryThumbnailMap[opportunity.category]) ? (
            <img src={opportunity.thumbnail_url || categoryThumbnailMap[opportunity.category]} alt={opportunity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
              <Icon className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
          {opportunity.featured && <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground"><Star className="h-3 w-3 mr-1" /> Featured</Badge>}
          {opportunity.analyst_rating && <Badge className={`absolute top-2 right-2 ${ratingColors[opportunity.analyst_rating]}`}>{opportunity.analyst_rating}</Badge>}
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{opportunity.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={config?.color}>{config?.label}</Badge>
                <span className="text-xs text-muted-foreground">{opportunity.sub_category}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{opportunity.short_description}</p>
          <div className="flex items-center justify-between">
            {opportunity.price && <span className="text-lg font-bold text-primary">{formatPrice(opportunity.price, opportunity.price_currency)}</span>}
            {opportunity.overall_conviction_score && (
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">{opportunity.overall_conviction_score.toFixed(1)}/5</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {opportunity.location && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /><span>{opportunity.location}</span></div>}
            <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{new Date(opportunity.created_at).toLocaleDateString()}</span></div>
          </div>
          <Button className="w-full" variant="outline" size="sm" onClick={() => handleOpportunityClick(opportunity)}>
            <Eye className="h-4 w-4 mr-2" /> View Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev);
  };

  const OpportunityRow = ({ opportunity }: { opportunity: OpportunityProduct }) => {
    const config = categoryConfig[opportunity.category as keyof typeof categoryConfig];
    const Icon = config?.icon || Building2;
    const isCompared = compareIds.includes(opportunity.id);
    return (
      <TableRow className={cn("cursor-pointer hover:bg-muted/50 group transition-colors border-b border-border/30", isCompared && "bg-primary/5")} onClick={() => compareMode ? toggleCompare(opportunity.id) : handleOpportunityClick(opportunity)}>
        {compareMode && (
          <TableCell className="w-10 text-center">
            <input type="checkbox" checked={isCompared} onChange={() => toggleCompare(opportunity.id)} className="rounded" />
          </TableCell>
        )}
        <TableCell className="pl-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
              {(opportunity.thumbnail_url || categoryThumbnailMap[opportunity.category]) ? <img src={opportunity.thumbnail_url || categoryThumbnailMap[opportunity.category]} alt={opportunity.title} className="w-full h-full object-cover" loading="lazy" /> :
                <div className="w-full h-full flex items-center justify-center"><Icon className="h-5 w-5 text-muted-foreground/40" /></div>}
            </div>
            <div className="space-y-1">
              <div className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1">{opportunity.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{opportunity.short_description}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={`text-xs ${config?.color}`}>{config?.label || opportunity.category}</Badge>
        </TableCell>
        <TableCell className="text-center whitespace-nowrap">
          {opportunity.expected_irr != null ? <span className={`font-semibold text-sm ${opportunity.expected_irr >= 20 ? 'text-emerald-500' : opportunity.expected_irr >= 10 ? 'text-primary' : 'text-amber-500'}`}>{opportunity.expected_irr.toFixed(1)}%</span> : <span className="text-muted-foreground text-xs">—</span>}
        </TableCell>
        <TableCell className="text-center whitespace-nowrap">
          {opportunity.analyst_rating ? <Badge className={`${ratingColors[opportunity.analyst_rating]} border`}>{opportunity.analyst_rating}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          {opportunity.price ? <span className="font-semibold text-primary">{formatPrice(opportunity.price, opportunity.price_currency)}</span> : <span className="text-muted-foreground">—</span>}
        </TableCell>
        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
          {opportunity.liquidity_horizon || "—"}
        </TableCell>
        <TableCell className="whitespace-nowrap">
          {opportunity.deal_stage ? <Badge variant="outline" className="text-xs">{opportunity.deal_stage}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
        </TableCell>
        <TableCell className="text-center whitespace-nowrap">
          {opportunity.overall_conviction_score ? (
            <div className="flex items-center justify-center gap-1"><TrendingUp className="h-3 w-3 text-green-500" /><span className="font-medium text-sm">{opportunity.overall_conviction_score.toFixed(1)}</span></div>
          ) : <span className="text-muted-foreground">—</span>}
        </TableCell>
        <TableCell className="whitespace-nowrap">
          {(opportunity.geography || opportunity.location) && <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /><span>{opportunity.geography || opportunity.location}</span></div>}
        </TableCell>
        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(opportunity.created_at).toLocaleDateString()}</TableCell>
        <TableCell>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-primary/10 hover:text-primary"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  

  const handleSelectSector = (category: string) => {
    setActiveCategory(category);
    setShowFolders(false);
  };
  const handleBackToFolders = () => { setActiveCategory("all"); setShowFolders(true); };

  return (
    <StarryBackground className="min-h-screen w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Live Deal Alerts</h1>
              <p className="text-muted-foreground">Real-time investment opportunities across multiple asset classes</p>
            </div>
          </div>
          {!showFolders && (
            <Button variant="outline" onClick={handleBackToFolders} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> All Sectors
            </Button>
          )}
        </div>

        {showFolders && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground">Browse by Sector</h2>
            <SectorFolderGrid categoryConfig={categoryConfig} categoryCounts={categoryCounts} onSelectCategory={handleSelectSector} />
          </div>
        )}

        {!showFolders && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search opportunities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                </SelectContent>
              </Select>
              <div className="inline-flex items-center gap-1 rounded-md border border-border bg-muted p-1">
                {[
                  { value: "showcase", icon: Presentation, label: "Showcase" },
                  { value: "grid", icon: LayoutGrid, label: "Grid" },
                  { value: "list", icon: List, label: "List" },
                  { value: "map", icon: Globe, label: "Map" },
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={viewMode === value ? "secondary" : "ghost"}
                    size="icon"
                    className="h-9 w-9"
                    aria-label={label}
                    onClick={() => setViewMode(value as typeof viewMode)}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
              {viewMode === "list" && (
                <Button variant={compareMode ? "default" : "outline"} size="sm" onClick={() => { setCompareMode(!compareMode); setCompareIds([]); }} className="gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> {compareMode ? "Exit Compare" : "Compare"}
                </Button>
              )}
              <ShowcaseDarkToggle />
            </div>

            {/* Advanced Filters */}
            <AdvancedFilters onFiltersChange={setAdvancedFilters} activeCategory={activeCategory} />

            <Tabs value={activeCategory} onValueChange={(val) => { setActiveCategory(val); setShowFolders(false); }} className="w-full">
              <TabsList className="flex flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="all" className="flex-shrink-0">All Deals</TabsTrigger>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-1.5 flex-shrink-0">
                    <config.icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{config.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value={activeCategory} className="mt-6">
                {loading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i}><Skeleton className="aspect-video" /><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-16" /></CardContent></Card>
                    ))}
                  </div>
                ) : filteredOpportunities.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center"><Search className="h-8 w-8 text-muted-foreground" /></div>
                      <h3 className="text-lg font-semibold">No Opportunities Found</h3>
                      <p className="text-muted-foreground">{searchQuery ? "Try adjusting your search criteria" : "New opportunities will be added soon. Check back later!"}</p>
                    </div>
                  </Card>
                ) : viewMode === "map" ? (
                  <OpportunityWorldMap opportunities={filteredOpportunities} />
                ) : viewMode === "showcase" ? (
                  <OpportunityShowcase opportunities={filteredOpportunities} categoryConfig={categoryConfig} detailBasePath={detailBasePath} />
                ) : viewMode === "grid" ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredOpportunities.map((opp) => <OpportunityCard key={opp.id} opportunity={opp} />)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Compare Panel */}
                    {compareMode && compareIds.length >= 2 && (
                      <Card className="border-primary/30 bg-primary/5 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> Side-by-Side Comparison ({compareIds.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border/50">
                                <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground">Deal</th>
                                <th className="py-2 px-3 text-center text-xs font-semibold text-muted-foreground">IRR</th>
                                <th className="py-2 px-3 text-center text-xs font-semibold text-muted-foreground">Risk</th>
                                <th className="py-2 px-3 text-center text-xs font-semibold text-muted-foreground">Sector</th>
                                <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">Ticket</th>
                                <th className="py-2 px-3 text-center text-xs font-semibold text-muted-foreground">Liquidity</th>
                                <th className="py-2 px-3 text-center text-xs font-semibold text-muted-foreground">Score</th>
                                <th className="py-2 px-3 text-center text-xs font-semibold text-muted-foreground">Stage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {compareIds.map(id => {
                                const opp = filteredOpportunities.find(o => o.id === id);
                                if (!opp) return null;
                                const config = categoryConfig[opp.category as keyof typeof categoryConfig];
                                return (
                                  <tr key={id} className="border-b border-border/30 hover:bg-muted/30">
                                    <td className="py-2 px-3 font-medium text-sm cursor-pointer hover:text-primary" onClick={() => navigate(`${detailBasePath}/${opp.id}`)}>{opp.title}</td>
                                    <td className="py-2 px-3 text-center font-bold">{opp.expected_irr != null ? `${opp.expected_irr.toFixed(1)}%` : "—"}</td>
                                    <td className="py-2 px-3 text-center">{opp.analyst_rating ? <Badge className={`${ratingColors[opp.analyst_rating]} border text-xs`}>{opp.analyst_rating}</Badge> : "—"}</td>
                                    <td className="py-2 px-3 text-center"><Badge variant="outline" className="text-xs">{config?.label || opp.category}</Badge></td>
                                    <td className="py-2 px-3 text-right font-semibold text-primary">{opp.price ? formatPrice(opp.price, opp.price_currency) : "—"}</td>
                                    <td className="py-2 px-3 text-center text-xs">{opp.liquidity_horizon || "—"}</td>
                                    <td className="py-2 px-3 text-center font-medium">{opp.overall_conviction_score?.toFixed(1) || "—"}</td>
                                    <td className="py-2 px-3 text-center text-xs">{opp.deal_stage || "—"}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    )}

                    <Card className="border-border/50 overflow-hidden bg-gradient-to-br from-background to-muted/10">
                      <ScrollArea className="h-[650px]">
                        <div className="overflow-x-auto">
                          <Table className="min-w-[1200px]">
                            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border/50">
                              <TableRow className="hover:bg-transparent">
                                {compareMode && <TableHead className="w-10"></TableHead>}
                                <TableHead className="min-w-[280px] font-semibold text-foreground pl-4">Deal</TableHead>
                                <TableHead className="min-w-[100px] font-semibold text-foreground">Sector</TableHead>
                                <TableHead className="min-w-[70px] text-center font-semibold text-foreground">IRR</TableHead>
                                <TableHead className="min-w-[80px] text-center font-semibold text-foreground">Risk</TableHead>
                                <TableHead className="min-w-[100px] text-right font-semibold text-foreground">Ticket</TableHead>
                                <TableHead className="min-w-[90px] font-semibold text-foreground">Liquidity</TableHead>
                                <TableHead className="min-w-[90px] font-semibold text-foreground">Stage</TableHead>
                                <TableHead className="min-w-[70px] text-center font-semibold text-foreground">Score</TableHead>
                                <TableHead className="min-w-[100px] font-semibold text-foreground">Geography</TableHead>
                                <TableHead className="min-w-[80px] font-semibold text-foreground">Date</TableHead>
                                <TableHead className="w-10"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredOpportunities.map((opp) => <OpportunityRow key={opp.id} opportunity={opp} />)}
                            </TableBody>
                          </Table>
                        </div>
                      </ScrollArea>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Stocks/Crypto Morningstar-Style Analysis Panel */}
      {selectedAnalysisAsset && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedAnalysisAsset(null)}
          />
          <div className="relative ml-auto w-full max-w-4xl h-full">
            <MorningstarDetailPanel
              asset={{
                id: selectedAnalysisAsset.id,
                symbol: selectedAnalysisAsset.sub_category || selectedAnalysisAsset.title.split(" ")[0],
                name: selectedAnalysisAsset.title,
                assetType: selectedAnalysisAsset.category === "crypto" ? "crypto" : "stock",
                currentPrice: selectedAnalysisAsset.price || 0,
                priceChange24h: 0,
                priceChange7d: 0,
                priceChange30d: 0,
                priceChange1y: selectedAnalysisAsset.expected_irr || 0,
                marketCap: selectedAnalysisAsset.minimum_investment || 0,
                volume24h: 0,
                analystRating: selectedAnalysisAsset.analyst_rating || undefined,
                overallScore: selectedAnalysisAsset.overall_conviction_score || undefined,
                currency: selectedAnalysisAsset.price_currency || "GBP",
                sector: selectedAnalysisAsset.geography || undefined,
              }}
              onClose={() => setSelectedAnalysisAsset(null)}
            />
          </div>
        </div>
      )}
    </StarryBackground>
  );
}
