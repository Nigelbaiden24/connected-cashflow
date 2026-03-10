import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, Building2, Car, Globe, Briefcase, LineChart, Bitcoin, Users, Award, Package, Landmark,
  MapPin, TrendingUp, Star, Calendar, Shield, Target, Eye, DollarSign, Clock, BarChart3, AlertTriangle,
  ArrowUpRight, Scale, Layers
} from "lucide-react";
import { OpportunityAnalyticsCharts } from "@/components/opportunities/OpportunityAnalyticsCharts";

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
  timepieces: { label: "Timepieces", icon: Clock, color: "bg-amber-600/10 text-amber-600" },
  mini_bonds: { label: "Mini Bonds", icon: Landmark, color: "bg-cyan-500/10 text-cyan-600" },
  private_credit: { label: "Private Credit & Lending", icon: Briefcase, color: "bg-emerald-500/10 text-emerald-600" },
  infrastructure_energy: { label: "Infrastructure & Energy", icon: Building2, color: "bg-lime-500/10 text-lime-600" },
  bonds: { label: "Bonds", icon: Landmark, color: "bg-sky-500/10 text-sky-600" },
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
    const fetchOpp = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("opportunity_products").select("*").eq("id", id).single();
      if (error) { console.error(error); toast.error("Failed to load opportunity"); }
      else setOpportunity(data);
      setLoading(false);
    };
    fetchOpp();
  }, [id]);

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: currency || "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  if (loading) return <div className="container mx-auto p-6 space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /><Skeleton className="h-48 w-full" /></div>;
  if (!opportunity) return (
    <div className="container mx-auto p-6 text-center space-y-4">
      <h2 className="text-xl font-semibold">Opportunity not found</h2>
      <Button onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Back to Opportunities</Button>
    </div>
  );

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

  const hasSnapshot = opportunity.expected_irr || opportunity.minimum_investment || opportunity.liquidity_horizon || opportunity.deal_stage;
  const hasFinancials = opportunity.annual_revenue || opportunity.ebitda || opportunity.growth_rate || opportunity.valuation;
  const hasComparables = opportunity.comparable_deals || opportunity.comparable_valuations;
  const hasDownside = opportunity.downside_analysis || opportunity.sensitivity_analysis;
  const hasExit = opportunity.exit_scenarios || opportunity.exit_timeline;

  const PitchbookSection = ({ icon: SectionIcon, title, children, accent }: { icon: any; title: string; children: React.ReactNode; accent: string }) => (
    <Card className="border-border/50 overflow-hidden">
      <div className={`h-1 ${accent}`} />
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <SectionIcon className="h-4 w-4 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Back to Opportunities</Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image & Info */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              {opportunity.thumbnail_url ? <img src={opportunity.thumbnail_url} alt={opportunity.title} className="w-full h-full object-cover" /> :
                <div className="w-full h-full flex items-center justify-center"><Icon className="h-16 w-16 text-muted-foreground/30" /></div>}
              {opportunity.featured && <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground"><Star className="h-3 w-3 mr-1" /> Featured</Badge>}
            </div>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={config.color}>{config.label}</Badge>
                    <span className="text-sm text-muted-foreground">{opportunity.sub_category}</span>
                  </div>
                </div>
                {opportunity.analyst_rating && <Badge className={`text-sm ${ratingColors[opportunity.analyst_rating] || ""}`}>{opportunity.analyst_rating}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{opportunity.short_description}</p>
              {opportunity.full_description && (<><Separator /><div className="prose prose-sm max-w-none text-foreground"><p className="whitespace-pre-wrap">{opportunity.full_description}</p></div></>)}
            </CardContent>
          </Card>

          {/* Opportunity Snapshot */}
          {hasSnapshot && (
            <PitchbookSection icon={Target} title="Opportunity Snapshot" accent="bg-gradient-to-r from-blue-500 to-cyan-500">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {opportunity.expected_irr != null && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/30 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Expected IRR</p>
                    <p className="text-2xl font-bold text-green-500">{opportunity.expected_irr}%</p>
                  </div>
                )}
                {opportunity.minimum_investment != null && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/30 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Min. Investment</p>
                    <p className="text-2xl font-bold text-primary">{formatPrice(opportunity.minimum_investment, opportunity.price_currency)}</p>
                  </div>
                )}
                {opportunity.liquidity_horizon && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/30 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Liquidity Horizon</p>
                    <p className="text-lg font-bold">{opportunity.liquidity_horizon}</p>
                  </div>
                )}
                {opportunity.deal_stage && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/30 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Deal Stage</p>
                    <Badge variant="secondary" className="text-sm capitalize">{opportunity.deal_stage.replace(/-/g, " ")}</Badge>
                  </div>
                )}
              </div>
            </PitchbookSection>
          )}

          {/* Investment Thesis */}
          {(opportunity.investment_thesis || opportunity.catalysts || opportunity.market_dynamics) && (
            <PitchbookSection icon={Layers} title="Investment Thesis" accent="bg-gradient-to-r from-purple-500 to-pink-500">
              <div className="space-y-4">
                {opportunity.investment_thesis && (
                  <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Why the opportunity exists</p><p className="text-sm whitespace-pre-wrap">{opportunity.investment_thesis}</p></div>
                )}
                {opportunity.catalysts && (
                  <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Catalysts</p><p className="text-sm whitespace-pre-wrap">{opportunity.catalysts}</p></div>
                )}
                {opportunity.market_dynamics && (
                  <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Market Dynamics</p><p className="text-sm whitespace-pre-wrap">{opportunity.market_dynamics}</p></div>
                )}
              </div>
            </PitchbookSection>
          )}

          {/* Financial Summary */}
          {hasFinancials && (
            <PitchbookSection icon={BarChart3} title="Financial Summary" accent="bg-gradient-to-r from-green-500 to-emerald-500">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {opportunity.annual_revenue != null && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Revenue</p>
                    <p className="text-lg font-bold">{formatPrice(opportunity.annual_revenue, opportunity.price_currency)}</p>
                  </div>
                )}
                {opportunity.ebitda != null && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">EBITDA</p>
                    <p className="text-lg font-bold">{formatPrice(opportunity.ebitda, opportunity.price_currency)}</p>
                  </div>
                )}
                {opportunity.growth_rate != null && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Growth Rate</p>
                    <p className="text-lg font-bold text-green-500">{opportunity.growth_rate}%</p>
                  </div>
                )}
                {opportunity.valuation && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Valuation</p>
                    <p className="text-lg font-bold">{opportunity.valuation}</p>
                  </div>
                )}
              </div>
            </PitchbookSection>
          )}

          {/* Comparable Deals */}
          {hasComparables && (
            <PitchbookSection icon={Scale} title="Comparable Deals" accent="bg-gradient-to-r from-amber-500 to-orange-500">
              <div className="space-y-4">
                {opportunity.comparable_deals && <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Similar Transactions</p><p className="text-sm whitespace-pre-wrap">{opportunity.comparable_deals}</p></div>}
                {opportunity.comparable_valuations && <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Comparable Valuations</p><p className="text-sm whitespace-pre-wrap">{opportunity.comparable_valuations}</p></div>}
              </div>
            </PitchbookSection>
          )}

          {/* Downside Analysis */}
          {hasDownside && (
            <PitchbookSection icon={AlertTriangle} title="Downside Analysis" accent="bg-gradient-to-r from-red-500 to-rose-500">
              <div className="space-y-4">
                {opportunity.downside_analysis && <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">What Could Go Wrong</p><p className="text-sm whitespace-pre-wrap">{opportunity.downside_analysis}</p></div>}
                {opportunity.sensitivity_analysis && <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Sensitivity Analysis</p><p className="text-sm whitespace-pre-wrap">{opportunity.sensitivity_analysis}</p></div>}
              </div>
            </PitchbookSection>
          )}

          {/* Exit Scenarios */}
          {hasExit && (
            <PitchbookSection icon={ArrowUpRight} title="Exit Scenarios" accent="bg-gradient-to-r from-indigo-500 to-violet-500">
              <div className="space-y-4">
                {opportunity.exit_scenarios && <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Likely Exits</p><p className="text-sm whitespace-pre-wrap">{opportunity.exit_scenarios}</p></div>}
                {opportunity.exit_timeline && <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Expected Timeline</p><p className="text-sm whitespace-pre-wrap">{opportunity.exit_timeline}</p></div>}
              </div>
            </PitchbookSection>
          )}

          {/* Interactive Analytics Charts */}
          <OpportunityAnalyticsCharts opportunity={opportunity} />

          {/* Strengths / Risks */}
          <div className="grid gap-4 md:grid-cols-2">
            {opportunity.strengths && (
              <Card><CardHeader className="pb-2"><CardTitle className="text-base text-green-600">Strengths</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{opportunity.strengths}</p></CardContent></Card>
            )}
            {opportunity.risks && (
              <Card><CardHeader className="pb-2"><CardTitle className="text-base text-red-600">Risks</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{opportunity.risks}</p></CardContent></Card>
            )}
          </div>

          {opportunity.key_watchpoints && (
            <Card><CardHeader className="pb-2"><CardTitle className="text-base text-amber-600 flex items-center gap-2"><Eye className="h-4 w-4" /> Key Watchpoints</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{opportunity.key_watchpoints}</p></CardContent></Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {opportunity.price && <div><p className="text-sm text-muted-foreground">Price</p><p className="text-3xl font-bold text-primary">{formatPrice(opportunity.price, opportunity.price_currency)}</p></div>}
              {opportunity.location && <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /><span>{opportunity.location}{opportunity.country && `, ${opportunity.country}`}</span></div>}
              {opportunity.overall_conviction_score && <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /><span className="font-semibold">{opportunity.overall_conviction_score.toFixed(1)}/5</span><span className="text-sm text-muted-foreground">Conviction Score</span></div>}
              <Separator />
              <div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Listed {new Date(opportunity.created_at).toLocaleDateString()}</div>
              {opportunity.suitable_investor_type && <div className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Suitable for: {opportunity.suitable_investor_type}</div>}
            </CardContent>
          </Card>

          {(opportunity.bedrooms || opportunity.bathrooms || opportunity.square_footage || opportunity.rental_yield) && (
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Property Details</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {opportunity.bedrooms && <div className="flex justify-between"><span className="text-muted-foreground">Bedrooms</span><span>{opportunity.bedrooms}</span></div>}
                {opportunity.bathrooms && <div className="flex justify-between"><span className="text-muted-foreground">Bathrooms</span><span>{opportunity.bathrooms}</span></div>}
                {opportunity.square_footage && <div className="flex justify-between"><span className="text-muted-foreground">Sq. Footage</span><span>{opportunity.square_footage.toLocaleString()}</span></div>}
                {opportunity.rental_yield && <div className="flex justify-between"><span className="text-muted-foreground">Rental Yield</span><span>{opportunity.rental_yield}%</span></div>}
                {opportunity.year_built && <div className="flex justify-between"><span className="text-muted-foreground">Year Built</span><span>{opportunity.year_built}</span></div>}
              </CardContent></Card>
          )}

          {scoreItems.length > 0 && (
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Analyst Scores</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {scoreItems.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">{s.label}</span><span className="font-medium">{s.value}/10</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((s.value as number) / 10) * 100}%` }} /></div>
                  </div>
                ))}
              </CardContent></Card>
          )}
        </div>
      </div>

      {opportunity.gallery_images && opportunity.gallery_images.length > 0 && (
        <Card><CardHeader><CardTitle className="text-lg">Gallery</CardTitle></CardHeader>
          <CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {opportunity.gallery_images.map((img: string, i: number) => (
              <div key={i} className="aspect-video rounded-lg overflow-hidden bg-muted"><img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" /></div>
            ))}
          </div></CardContent></Card>
      )}
    </div>
  );
}
