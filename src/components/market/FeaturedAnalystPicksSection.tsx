import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Star, 
  TrendingUp, 
  TrendingDown,
  Loader2,
  Calendar,
  Target,
  AlertTriangle,
  Sparkles,
  Bitcoin,
  Building2,
  BarChart3,
  ArrowUpRight,
  Clock,
  Shield
} from "lucide-react";
import { format, startOfWeek } from "date-fns";
import { TranslatedText } from "@/components/TranslatedText";

interface AnalystPick {
  id: string;
  asset_type: 'fund' | 'stock' | 'crypto' | 'alternative';
  asset_id: string;
  asset_name: string;
  asset_symbol?: string;
  analyst_rating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  conviction_score: number;
  price_target?: number;
  current_price?: number;
  upside_potential?: number;
  investment_thesis?: string;
  key_catalysts?: string[];
  risk_factors?: string[];
  time_horizon: 'short_term' | 'medium_term' | 'long_term';
  sector?: string;
  market_cap?: string;
  week_start_date: string;
  week_end_date: string;
  display_order: number;
  created_at: string;
}

export function FeaturedAnalystPicksSection() {
  const [picks, setPicks] = useState<AnalystPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedPick, setExpandedPick] = useState<string | null>(null);

  useEffect(() => {
    fetchPicks();
  }, []);

  const fetchPicks = async () => {
    try {
      const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('featured_analyst_picks')
        .select('*')
        .eq('is_active', true)
        .gte('week_end_date', currentWeekStart)
        .order('display_order', { ascending: true })
        .limit(5);

      if (error) throw error;
      setPicks((data || []) as AnalystPick[]);
    } catch (error) {
      console.error('Error fetching picks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'strong_buy': return 'bg-green-600 text-white';
      case 'buy': return 'bg-green-500 text-white';
      case 'hold': return 'bg-yellow-500 text-white';
      case 'sell': return 'bg-red-500 text-white';
      case 'strong_sell': return 'bg-red-700 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRatingLabel = (rating: string) => {
    return rating.replace('_', ' ').toUpperCase();
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'fund': return <BarChart3 className="h-5 w-5" />;
      case 'stock': return <TrendingUp className="h-5 w-5" />;
      case 'crypto': return <Bitcoin className="h-5 w-5" />;
      case 'alternative': return <Building2 className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getTimeHorizonLabel = (horizon: string) => {
    switch (horizon) {
      case 'short_term': return '<3 months';
      case 'medium_term': return '3-12 months';
      case 'long_term': return '>12 months';
      default: return horizon;
    }
  };

  const getConvictionColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredPicks = activeTab === 'all' 
    ? picks 
    : picks.filter(p => p.asset_type === activeTab);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (picks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <CardTitle><TranslatedText>Featured Analyst Picks</TranslatedText></CardTitle>
          </div>
          <CardDescription><TranslatedText>Weekly curated investment picks from our research team</TranslatedText></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p><TranslatedText>No analyst picks available this week</TranslatedText></p>
            <p className="text-sm mt-1"><TranslatedText>Check back soon for new recommendations</TranslatedText></p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50/30 to-orange-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle><TranslatedText>Featured Analyst Picks</TranslatedText></CardTitle>
              <CardDescription>
                <TranslatedText>Week of</TranslatedText> {picks[0] && format(new Date(picks[0].week_start_date), 'MMM d, yyyy')}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            <TranslatedText>Weekly Update</TranslatedText>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="fund" className="text-xs gap-1">
              <BarChart3 className="h-3 w-3" /> Funds
            </TabsTrigger>
            <TabsTrigger value="stock" className="text-xs gap-1">
              <TrendingUp className="h-3 w-3" /> Stocks
            </TabsTrigger>
            <TabsTrigger value="crypto" className="text-xs gap-1">
              <Bitcoin className="h-3 w-3" /> Crypto
            </TabsTrigger>
            <TabsTrigger value="alternative" className="text-xs gap-1">
              <Building2 className="h-3 w-3" /> Alt
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Picks Grid */}
        <div className="space-y-3">
          {filteredPicks.map((pick, index) => (
            <Card 
              key={pick.id} 
              className={`bg-white/80 backdrop-blur-sm hover:shadow-md transition-all cursor-pointer ${
                expandedPick === pick.id ? 'ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setExpandedPick(expandedPick === pick.id ? null : pick.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>

                  {/* Asset Icon */}
                  <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
                    {getAssetIcon(pick.asset_type)}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{pick.asset_name}</h3>
                          {pick.asset_symbol && (
                            <Badge variant="outline" className="text-xs">{pick.asset_symbol}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className={getRatingColor(pick.analyst_rating)}>
                            {getRatingLabel(pick.analyst_rating)}
                          </Badge>
                          {pick.sector && (
                            <Badge variant="secondary" className="text-xs">{pick.sector}</Badge>
                          )}
                        </div>
                      </div>

                      {/* Right Side Stats */}
                      <div className="text-right flex-shrink-0">
                        <div className={`text-lg font-bold ${getConvictionColor(pick.conviction_score)}`}>
                          {pick.conviction_score}/10
                        </div>
                        <div className="text-xs text-muted-foreground">Conviction</div>
                        {pick.upside_potential && (
                          <div className="flex items-center gap-1 mt-1 justify-end text-green-600">
                            <ArrowUpRight className="h-3 w-3" />
                            <span className="text-sm font-medium">{pick.upside_potential.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                      {pick.current_price && (
                        <span>Current: ${pick.current_price.toFixed(2)}</span>
                      )}
                      {pick.price_target && (
                        <span className="text-green-600">Target: ${pick.price_target.toFixed(2)}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeHorizonLabel(pick.time_horizon)}
                      </span>
                    </div>

                    {/* Expanded Content */}
                    {expandedPick === pick.id && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        {pick.investment_thesis && (
                          <div>
                            <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              <TranslatedText>Investment Thesis</TranslatedText>
                            </h4>
                            <p className="text-sm text-muted-foreground">{pick.investment_thesis}</p>
                          </div>
                        )}

                        {pick.key_catalysts && pick.key_catalysts.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-green-600">
                              <TrendingUp className="h-3 w-3" />
                              <TranslatedText>Key Catalysts</TranslatedText>
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {pick.key_catalysts.map((catalyst, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  {catalyst}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {pick.risk_factors && pick.risk_factors.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              <TranslatedText>Risk Factors</TranslatedText>
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {pick.risk_factors.map((risk, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                  {risk}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            <TranslatedText>
              These picks are for informational purposes only and do not constitute investment advice. 
              Past performance is not indicative of future results. Always conduct your own research.
            </TranslatedText>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}