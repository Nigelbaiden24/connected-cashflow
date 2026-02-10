import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Car,
  Globe,
  Briefcase,
  LineChart,
  Bitcoin,
  Users,
  Award,
  Package,
  Landmark,
  MapPin,
  TrendingUp,
  Star,
  Calendar,
  Shield,
  Target,
  Eye,
} from "lucide-react";

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  uk_property: { label: "UK Property", icon: Building2, color: "bg-blue-500/10 text-blue-500" },
  vehicles: { label: "Vehicles", icon: Car, color: "bg-orange-500/10 text-orange-500" },
  overseas_property: { label: "Overseas Property & Land", icon: Globe, color: "bg-teal-500/10 text-teal-500" },
  businesses: { label: "Businesses", icon: Briefcase, color: "bg-green-500/10 text-green-500" },
  stocks: { label: "Stocks", icon: LineChart, color: "bg-indigo-500/10 text-indigo-500" },
  crypto: { label: "Crypto & Digital Assets", icon: Bitcoin, color: "bg-amber-500/10 text-amber-500" },
  private_equity: { label: "Private Equity", icon: Users, color: "bg-purple-500/10 text-purple-500" },
  memorabilia: { label: "Memorabilia", icon: Award, color: "bg-pink-500/10 text-pink-500" },
  commodities: { label: "Commodities & Hard Assets", icon: Package, color: "bg-yellow-500/10 text-yellow-600" },
  funds: { label: "Funds", icon: Landmark, color: "bg-slate-500/10 text-slate-500" },
};

const ratingColors: Record<string, string> = {
  Gold: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  Silver: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  Bronze: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  Neutral: "bg-slate-500/20 text-slate-600 border-slate-500/30",
  Negative: "bg-red-500/20 text-red-600 border-red-500/30",
};

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("opportunity_products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        toast.error("Failed to load opportunity");
      } else {
        setOpportunity(data);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto p-6 text-center space-y-4">
        <h2 className="text-xl font-semibold">Opportunity not found</h2>
        <Button onClick={() => navigate("/investor/opportunities")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Opportunities
        </Button>
      </div>
    );
  }

  const config = categoryConfig[opportunity.category] || { label: opportunity.category, icon: Building2, color: "" };
  const Icon = config.icon;

  const scoreItems = [
    { label: "Risk", value: opportunity.risk_score, commentary: opportunity.risk_commentary },
    { label: "Liquidity", value: opportunity.liquidity_score, commentary: opportunity.liquidity_commentary },
    { label: "Value", value: opportunity.value_score },
    { label: "Quality", value: opportunity.quality_score },
    { label: "Market Sentiment", value: opportunity.market_sentiment_score, commentary: opportunity.market_sentiment_commentary },
    { label: "Transparency", value: opportunity.transparency_score, commentary: opportunity.transparency_commentary },
    { label: "Complexity", value: opportunity.complexity_score, commentary: opportunity.complexity_commentary },
    { label: "Geographic/Regulatory", value: opportunity.geographic_regulatory_score, commentary: opportunity.geographic_regulatory_commentary },
  ].filter((s) => s.value != null);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/investor/opportunities")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Opportunities
      </Button>

      {/* Hero */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              {opportunity.thumbnail_url ? (
                <img src={opportunity.thumbnail_url} alt={opportunity.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              {opportunity.featured && (
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" /> Featured
                </Badge>
              )}
            </div>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={config.color}>
                      {config.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{opportunity.sub_category}</span>
                  </div>
                </div>
                {opportunity.analyst_rating && (
                  <Badge className={`text-sm ${ratingColors[opportunity.analyst_rating] || ""}`}>
                    {opportunity.analyst_rating}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{opportunity.short_description}</p>
              {opportunity.full_description && (
                <>
                  <Separator />
                  <div className="prose prose-sm max-w-none text-foreground">
                    <p className="whitespace-pre-wrap">{opportunity.full_description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Investment Thesis */}
          {opportunity.investment_thesis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Investment Thesis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{opportunity.investment_thesis}</p>
              </CardContent>
            </Card>
          )}

          {/* Strengths / Risks / Watchpoints */}
          <div className="grid gap-4 md:grid-cols-2">
            {opportunity.strengths && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-green-600">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{opportunity.strengths}</p>
                </CardContent>
              </Card>
            )}
            {opportunity.risks && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-red-600">Risks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{opportunity.risks}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {opportunity.key_watchpoints && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-amber-600 flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Key Watchpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{opportunity.key_watchpoints}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Price */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {opportunity.price && (
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(opportunity.price, opportunity.price_currency)}
                  </p>
                </div>
              )}
              {opportunity.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {opportunity.location}
                    {opportunity.country && `, ${opportunity.country}`}
                  </span>
                </div>
              )}
              {opportunity.overall_conviction_score && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">{opportunity.overall_conviction_score.toFixed(1)}/5</span>
                  <span className="text-sm text-muted-foreground">Conviction Score</span>
                </div>
              )}
              <Separator />
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Listed {new Date(opportunity.created_at).toLocaleDateString()}
              </div>
              {opportunity.suitable_investor_type && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Suitable for: {opportunity.suitable_investor_type}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property-specific */}
          {(opportunity.bedrooms || opportunity.bathrooms || opportunity.square_footage || opportunity.rental_yield) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {opportunity.bedrooms && <div className="flex justify-between"><span className="text-muted-foreground">Bedrooms</span><span>{opportunity.bedrooms}</span></div>}
                {opportunity.bathrooms && <div className="flex justify-between"><span className="text-muted-foreground">Bathrooms</span><span>{opportunity.bathrooms}</span></div>}
                {opportunity.square_footage && <div className="flex justify-between"><span className="text-muted-foreground">Sq. Footage</span><span>{opportunity.square_footage.toLocaleString()}</span></div>}
                {opportunity.rental_yield && <div className="flex justify-between"><span className="text-muted-foreground">Rental Yield</span><span>{opportunity.rental_yield}%</span></div>}
                {opportunity.year_built && <div className="flex justify-between"><span className="text-muted-foreground">Year Built</span><span>{opportunity.year_built}</span></div>}
              </CardContent>
            </Card>
          )}

          {/* Scores */}
          {scoreItems.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Analyst Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scoreItems.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium">{s.value}/10</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${((s.value as number) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Gallery */}
      {opportunity.gallery_images && opportunity.gallery_images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {opportunity.gallery_images.map((img: string, i: number) => (
                <div key={i} className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
