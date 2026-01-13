import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Target,
  Shield,
  Zap,
  BarChart3,
  Bitcoin,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Users,
  Eye
} from "lucide-react";

type AnalystRating = 'Gold' | 'Silver' | 'Bronze' | 'Neutral' | 'Negative';

interface AnalystAsset {
  id: string;
  symbol: string;
  name: string;
  asset_type: 'stock' | 'crypto';
  current_price: number;
  price_change_24h: number;
  market_cap: number;
  analyst_rating: AnalystRating;
  rating_rationale: string;
  score_fundamentals: number;
  score_technicals: number;
  score_momentum: number;
  score_risk: number;
  overall_score: number;
  investment_thesis: string;
  strengths: string;
  risks: string;
  suitable_investor_type: string;
  key_watchpoints: string;
  is_featured: boolean;
  logo_url: string | null;
  sector: string | null;
  updated_at: string;
}

export function AnalystPicksSection() {
  const [assets, setAssets] = useState<AnalystAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<AnalystAsset | null>(null);

  useEffect(() => {
    fetchAnalystPicks();
  }, []);

  const fetchAnalystPicks = async () => {
    try {
      const { data, error } = await supabase
        .from('stocks_crypto')
        .select('*')
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('overall_score', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAssets((data || []) as AnalystAsset[]);
    } catch (error) {
      console.error('Error fetching analyst picks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnalystBadgeStyle = (rating: AnalystRating) => {
    const styles: Record<AnalystRating, string> = {
      'Gold': 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/30',
      'Silver': 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-lg shadow-slate-400/30',
      'Bronze': 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30',
      'Neutral': 'bg-slate-200 text-slate-700',
      'Negative': 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30'
    };
    return styles[rating];
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-600';
    if (score >= 3) return 'text-blue-600';
    if (score >= 2) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 4) return 'bg-emerald-500';
    if (score >= 3) return 'bg-blue-500';
    if (score >= 2) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toFixed(6)}`;
  };

  const formatMarketCap = (cap: number | null) => {
    if (!cap) return 'N/A';
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  const featuredAssets = assets.filter(a => a.is_featured);
  const otherAssets = assets.filter(a => !a.is_featured);

  if (loading) {
    return (
      <Card className="border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-slate-900">Analyst Picks & Commentary</CardTitle>
              <CardDescription>Expert ratings and investment insights</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full bg-slate-100 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <Card className="border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-slate-900">Analyst Picks & Commentary</CardTitle>
              <CardDescription>Expert ratings and investment insights</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No analyst ratings available yet.</p>
          <p className="text-sm text-slate-400 mt-1">Check back soon for expert insights.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-slate-900">Analyst Picks & Commentary</CardTitle>
                <CardDescription>Expert ratings, scores, and investment insights from our research team</CardDescription>
              </div>
            </div>
            <Badge className="bg-violet-100 text-violet-700 border-0">
              {assets.length} rated assets
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Featured Picks */}
          {featuredAssets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h3 className="font-semibold text-slate-900">Featured Picks</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    featured
                    onClick={() => setSelectedAsset(asset)}
                    getAnalystBadgeStyle={getAnalystBadgeStyle}
                    getScoreColor={getScoreColor}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Rated Assets */}
          {otherAssets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-violet-500" />
                <h3 className="font-semibold text-slate-900">All Rated Assets</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {otherAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onClick={() => setSelectedAsset(asset)}
                    getAnalystBadgeStyle={getAnalystBadgeStyle}
                    getScoreColor={getScoreColor}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden bg-white">
          {selectedAsset && (
            <>
              <DialogHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {selectedAsset.logo_url ? (
                      <img src={selectedAsset.logo_url} alt={selectedAsset.name} className="h-14 w-14 rounded-xl shadow-md" />
                    ) : (
                      <div className={`h-14 w-14 rounded-xl flex items-center justify-center shadow-md ${
                        selectedAsset.asset_type === 'crypto' 
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                          : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      }`}>
                        {selectedAsset.asset_type === 'crypto' ? (
                          <Bitcoin className="h-7 w-7 text-white" />
                        ) : (
                          <BarChart3 className="h-7 w-7 text-white" />
                        )}
                      </div>
                    )}
                    <div>
                      <DialogTitle className="text-xl text-slate-900">{selectedAsset.name}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-slate-700">{selectedAsset.symbol}</span>
                        <span className="text-slate-400">•</span>
                        <span>{selectedAsset.asset_type === 'crypto' ? 'Cryptocurrency' : 'Stock'}</span>
                        {selectedAsset.sector && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span>{selectedAsset.sector}</span>
                          </>
                        )}
                      </DialogDescription>
                    </div>
                  </div>
                  <Badge className={`${getAnalystBadgeStyle(selectedAsset.analyst_rating)} text-sm px-3 py-1`}>
                    {selectedAsset.analyst_rating}
                  </Badge>
                </div>
              </DialogHeader>
              
              <ScrollArea className="max-h-[65vh] pr-4">
                <div className="space-y-6 py-4">
                  {/* Price & Overall Score */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500 mb-1">Current Price</p>
                      <p className="text-2xl font-bold text-slate-900">{formatPrice(selectedAsset.current_price)}</p>
                      <div className={`flex items-center gap-1 mt-1 ${selectedAsset.price_change_24h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {selectedAsset.price_change_24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="font-medium">{selectedAsset.price_change_24h >= 0 ? '+' : ''}{selectedAsset.price_change_24h?.toFixed(2)}%</span>
                        <span className="text-slate-400 text-sm">24h</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4">
                      <p className="text-sm text-violet-600 mb-1">Overall Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(selectedAsset.overall_score)}`}>
                        {selectedAsset.overall_score.toFixed(1)}
                        <span className="text-lg text-slate-400">/5</span>
                      </p>
                      <p className="text-sm text-slate-500 mt-1">Market Cap: {formatMarketCap(selectedAsset.market_cap)}</p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Target className="h-4 w-4 text-violet-500" />
                      Score Breakdown
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ScoreBar label="Fundamentals" score={selectedAsset.score_fundamentals} icon={BarChart3} getScoreProgressColor={getScoreProgressColor} />
                      <ScoreBar label="Technicals" score={selectedAsset.score_technicals} icon={Zap} getScoreProgressColor={getScoreProgressColor} />
                      <ScoreBar label="Momentum" score={selectedAsset.score_momentum} icon={TrendingUp} getScoreProgressColor={getScoreProgressColor} />
                      <ScoreBar label="Risk" score={selectedAsset.score_risk} icon={Shield} getScoreProgressColor={getScoreProgressColor} />
                    </div>
                  </div>

                  {/* Rating Rationale */}
                  {selectedAsset.rating_rationale && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        Rating Rationale
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed bg-amber-50 rounded-lg p-4 border border-amber-100">
                        {selectedAsset.rating_rationale}
                      </p>
                    </div>
                  )}

                  {/* Investment Thesis */}
                  {selectedAsset.investment_thesis && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                        Investment Thesis
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{selectedAsset.investment_thesis}</p>
                    </div>
                  )}

                  {/* Strengths & Risks */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedAsset.strengths && (
                      <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
                        <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Strengths
                        </h4>
                        <p className="text-sm text-emerald-700 leading-relaxed">{selectedAsset.strengths}</p>
                      </div>
                    )}
                    {selectedAsset.risks && (
                      <div className="bg-red-50 rounded-xl p-4 space-y-2">
                        <h4 className="font-semibold text-red-800 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Risks
                        </h4>
                        <p className="text-sm text-red-700 leading-relaxed">{selectedAsset.risks}</p>
                      </div>
                    )}
                  </div>

                  {/* Suitable Investor Type */}
                  {selectedAsset.suitable_investor_type && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Suitable Investor Type
                      </h4>
                      <p className="text-slate-600 text-sm">{selectedAsset.suitable_investor_type}</p>
                    </div>
                  )}

                  {/* Key Watchpoints */}
                  {selectedAsset.key_watchpoints && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-amber-500" />
                        Key Watchpoints
                      </h4>
                      <p className="text-slate-600 text-sm">{selectedAsset.key_watchpoints}</p>
                    </div>
                  )}

                  {/* Last Updated */}
                  <p className="text-xs text-slate-400 text-center pt-2">
                    Last updated: {new Date(selectedAsset.updated_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface AssetCardProps {
  asset: AnalystAsset;
  featured?: boolean;
  onClick: () => void;
  getAnalystBadgeStyle: (rating: AnalystRating) => string;
  getScoreColor: (score: number) => string;
  formatPrice: (price: number) => string;
}

function AssetCard({ asset, featured, onClick, getAnalystBadgeStyle, getScoreColor, formatPrice }: AssetCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
        featured 
          ? 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border-violet-200 hover:border-violet-300 hover:shadow-violet-100' 
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {featured && (
        <div className="absolute -top-2 -right-2">
          <Star className="h-6 w-6 text-amber-500 fill-amber-500 drop-shadow-sm" />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {asset.logo_url ? (
            <img src={asset.logo_url} alt={asset.name} className="h-10 w-10 rounded-lg shadow-sm" />
          ) : (
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              asset.asset_type === 'crypto' 
                ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            }`}>
              {asset.asset_type === 'crypto' ? (
                <Bitcoin className="h-5 w-5 text-white" />
              ) : (
                <BarChart3 className="h-5 w-5 text-white" />
              )}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900 text-sm">{asset.symbol}</p>
            <p className="text-xs text-slate-500 truncate max-w-[100px]">{asset.name}</p>
          </div>
        </div>
        <Badge className={`${getAnalystBadgeStyle(asset.analyst_rating)} text-xs`}>
          {asset.analyst_rating}
        </Badge>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-slate-900">{formatPrice(asset.current_price)}</span>
        <span className={`text-sm font-medium ${asset.price_change_24h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {asset.price_change_24h >= 0 ? '+' : ''}{asset.price_change_24h?.toFixed(2)}%
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">Score:</span>
          <span className={`font-bold ${getScoreColor(asset.overall_score)}`}>
            {asset.overall_score.toFixed(1)}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
      </div>

      {asset.rating_rationale && (
        <p className="mt-3 text-xs text-slate-500 line-clamp-2 border-t border-slate-100 pt-3">
          {asset.rating_rationale}
        </p>
      )}
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
  icon: React.ComponentType<{ className?: string }>;
  getScoreProgressColor: (score: number) => string;
}

function ScoreBar({ label, score, icon: Icon, getScoreProgressColor }: ScoreBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600 flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-slate-400" />
          {label}
        </span>
        <span className="text-sm font-semibold text-slate-900">{score.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${getScoreProgressColor(score)}`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
