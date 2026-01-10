import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Building2, 
  Briefcase, 
  Gem, 
  Search, 
  Star, 
  TrendingUp,
  MapPin,
  Clock,
  Eye
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

const categoryConfig = {
  real_estate: {
    label: "Real Estate",
    icon: Building2,
    color: "bg-blue-500/10 text-blue-500",
    subCategories: ["Residential UK", "Residential Overseas", "Commercial", "Offices", "Retail", "Land", "Development Plots"]
  },
  private_business: {
    label: "Private Businesses",
    icon: Briefcase,
    color: "bg-green-500/10 text-green-500",
    subCategories: ["SMEs", "Startups", "Family-owned Businesses"]
  },
  collectibles_luxury: {
    label: "Collectibles & Luxury",
    icon: Gem,
    color: "bg-purple-500/10 text-purple-500",
    subCategories: ["Art", "Antiques", "Rare Cars", "Wine", "Watches", "Jewellery"]
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
  const [opportunities, setOpportunities] = useState<OpportunityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchOpportunities();
  }, [activeCategory]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("opportunity_products")
        .select("*")
        .eq("status", "active")
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

          <Button className="w-full" variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" /> View Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Opportunity Intelligence</h1>
        <p className="text-muted-foreground">
          Curated investment opportunities across Real Estate, Private Businesses, and Luxury Assets
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
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Opportunities</TabsTrigger>
          <TabsTrigger value="real_estate" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Real Estate</span>
          </TabsTrigger>
          <TabsTrigger value="private_business" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Private Business</span>
          </TabsTrigger>
          <TabsTrigger value="collectibles_luxury" className="flex items-center gap-2">
            <Gem className="h-4 w-4" />
            <span className="hidden sm:inline">Collectibles</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {loading ? (
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
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
