import { useState, useEffect } from "react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OpportunityShowcase } from "@/components/opportunities/OpportunityShowcase";
import { ShowcaseDarkToggle } from "@/components/showcase/ShowcaseDarkToggle";
import { StarryBackground } from "@/components/showcase/StarryBackground";
import { 
  Building2, 
  Briefcase, 
  Gem, 
  Search, 
  Star, 
  TrendingUp,
  MapPin,
  Clock,
  Eye,
  LayoutGrid,
  List,
  Car,
  Globe,
  LineChart,
  Bitcoin,
  Users,
  Award,
  Package,
  Landmark,
  ChevronRight,
  Presentation
} from "lucide-react";

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
}

// Updated category configuration
const categoryConfig = {
  uk_property: {
    label: "UK Property",
    icon: Building2,
    color: "bg-blue-500/10 text-blue-500",
    subCategories: ["B2F", "B2L", "HMO", "R2R", "B2SA", "Commercial Property", "Land", "Parking Spaces"]
  },
  vehicles: {
    label: "Vehicles",
    icon: Car,
    color: "bg-orange-500/10 text-orange-500",
    subCategories: ["Classic Cars", "Luxury Vehicles", "Motorcycles", "Commercial Vehicles"]
  },
  overseas_property: {
    label: "Overseas Property & Land",
    icon: Globe,
    color: "bg-teal-500/10 text-teal-500",
    subCategories: ["Residential Overseas", "Commercial Overseas", "Land Overseas", "Development Projects"]
  },
  businesses: {
    label: "Businesses",
    icon: Briefcase,
    color: "bg-green-500/10 text-green-500",
    subCategories: ["SMEs", "Startups", "Franchises", "Established Businesses"]
  },
  stocks: {
    label: "Stocks",
    icon: LineChart,
    color: "bg-indigo-500/10 text-indigo-500",
    subCategories: ["UK Equities", "US Equities", "International Equities", "Penny Stocks"]
  },
  crypto: {
    label: "Crypto & Digital Assets",
    icon: Bitcoin,
    color: "bg-amber-500/10 text-amber-500",
    subCategories: ["Cryptocurrency", "NFTs", "Digital Tokens", "DeFi"]
  },
  private_equity: {
    label: "Private Equity",
    icon: Users,
    color: "bg-purple-500/10 text-purple-500",
    subCategories: ["Growth Equity", "Buyouts", "Venture Capital", "Mezzanine"]
  },
  memorabilia: {
    label: "Memorabilia",
    icon: Award,
    color: "bg-pink-500/10 text-pink-500",
    subCategories: ["Sports Memorabilia", "Entertainment", "Historical Items", "Signed Items"]
  },
  commodities: {
    label: "Commodities & Hard Assets",
    icon: Package,
    color: "bg-yellow-500/10 text-yellow-600",
    subCategories: ["Gold", "Silver", "Precious Metals", "Raw Materials"]
  },
  funds: {
    label: "Funds",
    icon: Landmark,
    color: "bg-slate-500/10 text-slate-500",
    subCategories: ["Mutual Funds", "ETFs", "Hedge Funds", "REITs"]
  }
};

const ratingColors: Record<string, string> = {
  Gold: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  Silver: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  Bronze: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  Neutral: "bg-slate-500/20 text-slate-600 border-slate-500/30",
  Negative: "bg-red-500/20 text-red-600 border-red-500/30"
};

export default function OpportunityIntelligence() {
  const navigate = useNavigate();
  const location = useLocation();
  const isFinancePlatform = location.pathname.startsWith("/finance");
  const detailBasePath = isFinancePlatform ? "/finance/opportunities" : "/investor/opportunities";
  const [opportunities, setOpportunities] = useState<OpportunityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "showcase">("grid");

  useEffect(() => {
    fetchOpportunities();
  }, [activeCategory]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("opportunity_products")
        .select("*")
        .in("status", ["active", "draft"]) // Show both active and draft opportunities
        .order("featured", { ascending: false });

      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities
    .filter(opp => 
      searchQuery === "" || 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "price_high":
          return (b.price || 0) - (a.price || 0);
        case "price_low":
          return (a.price || 0) - (b.price || 0);
        case "rating":
          return (b.overall_conviction_score || 0) - (a.overall_conviction_score || 0);
        default:
          return 0;
      }
    });

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const OpportunityCard = ({ opportunity }: { opportunity: OpportunityProduct }) => {
    const config = categoryConfig[opportunity.category as keyof typeof categoryConfig];
    const Icon = config?.icon || Building2;

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border-border/50 hover:border-primary/30">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {opportunity.thumbnail_url ? (
            <img 
              src={opportunity.thumbnail_url} 
              alt={opportunity.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
              <Icon className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
          {opportunity.featured && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1" /> Featured
            </Badge>
          )}
          {opportunity.analyst_rating && (
            <Badge className={`absolute top-2 right-2 ${ratingColors[opportunity.analyst_rating]}`}>
              {opportunity.analyst_rating}
            </Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{opportunity.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={config?.color}>
                  {config?.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{opportunity.sub_category}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {opportunity.short_description}
          </p>
          
          <div className="flex items-center justify-between">
            {opportunity.price && (
              <span className="text-lg font-bold text-primary">
                {formatPrice(opportunity.price, opportunity.price_currency)}
              </span>
            )}
            {opportunity.overall_conviction_score && (
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">{opportunity.overall_conviction_score.toFixed(1)}/5</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {opportunity.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{opportunity.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <Button className="w-full" variant="outline" size="sm" onClick={() => navigate(`${detailBasePath}/${opportunity.id}`)}>
            <Eye className="h-4 w-4 mr-2" /> View Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  // List View Row Component
  const OpportunityRow = ({ opportunity }: { opportunity: OpportunityProduct }) => {
    const config = categoryConfig[opportunity.category as keyof typeof categoryConfig];
    const Icon = config?.icon || Building2;

    return (
      <TableRow className="cursor-pointer hover:bg-muted/50 group transition-colors border-b border-border/30" onClick={() => navigate(`${detailBasePath}/${opportunity.id}`)}>
        <TableCell className="pl-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
              {opportunity.thumbnail_url ? (
                <img 
                  src={opportunity.thumbnail_url} 
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="h-5 w-5 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1">
                {opportunity.title}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {opportunity.short_description}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <Badge variant="outline" className={`text-xs ${config?.color}`}>
              {config?.label || opportunity.category}
            </Badge>
            <div className="text-xs text-muted-foreground">{opportunity.sub_category}</div>
          </div>
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          {opportunity.price ? (
            <span className="font-semibold text-primary">
              {formatPrice(opportunity.price, opportunity.price_currency)}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="text-center whitespace-nowrap">
          {opportunity.analyst_rating ? (
            <Badge className={`${ratingColors[opportunity.analyst_rating]} border`}>
              {opportunity.analyst_rating}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">Not rated</span>
          )}
        </TableCell>
        <TableCell className="text-center whitespace-nowrap">
          {opportunity.overall_conviction_score ? (
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="font-medium text-sm">{opportunity.overall_conviction_score.toFixed(1)}/5</span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="whitespace-nowrap">
          {opportunity.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{opportunity.location}</span>
            </div>
          )}
        </TableCell>
        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
          {new Date(opportunity.created_at).toLocaleDateString()}
        </TableCell>
        <TableCell>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-primary/10 hover:text-primary">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <StarryBackground className="min-h-screen">
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Live Deal Alerts</h1>
        <p className="text-muted-foreground">
          Real-time investment opportunities across multiple asset classes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="rating">Highest Rating</SelectItem>
          </SelectContent>
        </Select>
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list" | "showcase")}>
          <ToggleGroupItem value="showcase" aria-label="Showcase view">
            <Presentation className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <ShowcaseDarkToggle />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
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
            viewMode === "grid" ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-video" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </Card>
            )
          ) : filteredOpportunities.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No Opportunities Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "Try adjusting your search criteria" 
                    : "New opportunities will be added soon. Check back later!"}
                </p>
              </div>
            </Card>
          ) : viewMode === "showcase" ? (
            <OpportunityShowcase
              opportunities={filteredOpportunities}
              categoryConfig={categoryConfig}
              detailBasePath={detailBasePath}
            />
          ) : viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          ) : (
            <Card className="border-border/50 overflow-hidden bg-gradient-to-br from-background to-muted/10">
              <ScrollArea className="h-[650px]">
                <div className="overflow-x-auto">
                  <Table className="min-w-[900px]">
                    <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="min-w-[300px] font-semibold text-foreground whitespace-nowrap pl-4">Opportunity</TableHead>
                        <TableHead className="min-w-[120px] font-semibold text-foreground whitespace-nowrap">Category</TableHead>
                        <TableHead className="min-w-[100px] text-right font-semibold text-foreground whitespace-nowrap">Price</TableHead>
                        <TableHead className="min-w-[80px] text-center font-semibold text-foreground whitespace-nowrap">Rating</TableHead>
                        <TableHead className="min-w-[80px] text-center font-semibold text-foreground whitespace-nowrap">Score</TableHead>
                        <TableHead className="min-w-[100px] font-semibold text-foreground whitespace-nowrap">Location</TableHead>
                        <TableHead className="min-w-[90px] font-semibold text-foreground whitespace-nowrap">Date</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOpportunities.map((opportunity) => (
                        <OpportunityRow key={opportunity.id} opportunity={opportunity} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </StarryBackground>
  );
}
