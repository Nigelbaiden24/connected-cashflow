import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { 
  Award, 
  TrendingUp, 
  Star, 
  Target,
  Shield,
  BarChart3,
  Database,
  ChevronRight,
  Sparkles,
  Bell,
  Clock,
  Radio,
  RefreshCw,
  DollarSign,
  Leaf,
  Briefcase
} from "lucide-react";

type AnalystRating = 'Gold' | 'Silver' | 'Bronze' | 'Neutral' | 'Negative';

interface FundAnalystData {
  id: string;
  isin: string;
  fund_name: string;
  fund_type: string | null;
  asset_class: string | null;
  provider: string | null;
  analyst_rating: AnalystRating;
  rating_rationale: string | null;
  score_fundamentals: number | null;
  score_performance: number | null;
  score_risk: number | null;
  score_cost: number | null;
  score_esg: number | null;
  overall_score: number | null;
  investment_thesis: string | null;
  strengths: string | null;
  risks: string | null;
  suitable_investor_type: string | null;
  key_watchpoints: string | null;
  one_year_return: number | null;
  three_year_return: number | null;
  five_year_return: number | null;
  ocf: number | null;
  aum: number | null;
  is_featured: boolean;
  updated_at: string;
  created_at: string;
}

export function FundAnalystActivityHub() {
  const [funds, setFunds] = useState<FundAnalystData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFund, setSelectedFund] = useState<FundAnalystData | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchFundAnalystActivity();

    // Set up real-time subscription
    const channel = supabase
      .channel('fund-analyst-activity')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fund_analyst_activity'
        },
        (payload) => {
          console.log('Real-time fund update:', payload);
          setLastUpdate(new Date());
          
          if (payload.eventType === 'INSERT') {
            const newFund = payload.new as FundAnalystData;
            setFunds(prev => [newFund, ...prev.filter(f => f.id !== newFund.id)].slice(0, 30));
          } else if (payload.eventType === 'UPDATE') {
            const updatedFund = payload.new as FundAnalystData;
            setFunds(prev => {
              const filtered = prev.filter(f => f.id !== updatedFund.id);
              return [updatedFund, ...filtered].slice(0, 30);
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setFunds(prev => prev.filter(f => f.id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFundAnalystActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('fund_analyst_activity')
        .select('*')
        .eq('status', 'published')
        .not('analyst_rating', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setFunds((data || []) as FundAnalystData[]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching fund analyst activity:', error);
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
    return styles[rating] || styles['Neutral'];
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 4) return 'text-emerald-600';
    if (score >= 3) return 'text-blue-600';
    if (score >= 2) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreProgressColor = (score: number | null) => {
    if (!score) return 'bg-muted';
    if (score >= 4) return 'bg-emerald-500';
    if (score >= 3) return 'bg-blue-500';
    if (score >= 2) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatAUM = (aum: number | null) => {
    if (!aum) return 'N/A';
    if (aum >= 1000) return `$${(aum / 1000).toFixed(1)}B`;
    return `$${aum.toFixed(0)}M`;
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  // Separate recent updates (last 24h) from older ones
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentFunds = funds.filter(f => new Date(f.updated_at) > oneDayAgo);
  const olderFunds = funds.filter(f => new Date(f.updated_at) <= oneDayAgo);
  const featuredFunds = funds.filter(f => f.is_featured);

  if (loading) {
    return (
      <Card className="border-border/50 bg-background/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Fund Analyst Activity Hub</CardTitle>
              <CardDescription>Real-time fund analyst ratings and insights</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (funds.length === 0) {
    return (
      <Card className="border-border/50 bg-background/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Fund Analyst Activity Hub</CardTitle>
              <CardDescription>Real-time fund analyst ratings and insights</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <Award className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No fund analyst activity yet.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Check back soon for expert fund insights.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/50 bg-background/60 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Radio className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Fund Analyst Activity Hub
                  {isLive && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Live
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Real-time fund analyst ratings, scores, and commentary updates</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdate && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                  <Clock className="h-3.5 w-3.5" />
                  Updated {getTimeAgo(lastUpdate.toISOString())}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchFundAnalystActivity}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                {funds.length} updates
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="p-6 space-y-6">
              {/* Recent Activity (Last 24h) */}
              {recentFunds.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                    <Bell className="h-4 w-4 text-emerald-500" />
                    <h3 className="font-semibold text-sm">Recent Activity (Last 24h)</h3>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-xs">
                      {recentFunds.length} new
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {recentFunds.map((fund) => (
                      <FundActivityCard
                        key={fund.id}
                        fund={fund}
                        isRecent
                        onClick={() => setSelectedFund(fund)}
                        getAnalystBadgeStyle={getAnalystBadgeStyle}
                        getScoreColor={getScoreColor}
                        formatAUM={formatAUM}
                        getTimeAgo={getTimeAgo}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Funds */}
              {featuredFunds.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <h3 className="font-semibold text-sm">Featured Funds</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {featuredFunds.slice(0, 4).map((fund) => (
                      <FeaturedFundCard
                        key={fund.id}
                        fund={fund}
                        onClick={() => setSelectedFund(fund)}
                        getAnalystBadgeStyle={getAnalystBadgeStyle}
                        getScoreColor={getScoreColor}
                        formatAUM={formatAUM}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Older Activity */}
              {olderFunds.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Earlier Updates</h3>
                  </div>
                  <div className="space-y-2">
                    {olderFunds.map((fund) => (
                      <FundActivityCard
                        key={fund.id}
                        fund={fund}
                        onClick={() => setSelectedFund(fund)}
                        getAnalystBadgeStyle={getAnalystBadgeStyle}
                        getScoreColor={getScoreColor}
                        formatAUM={formatAUM}
                        getTimeAgo={getTimeAgo}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedFund} onOpenChange={() => setSelectedFund(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          {selectedFund && (
            <>
              <DialogHeader className="pb-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br from-emerald-500 to-teal-600">
                      <Database className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedFund.fund_name}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        <span className="font-semibold">{selectedFund.isin}</span>
                        {selectedFund.fund_type && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span>{selectedFund.fund_type}</span>
                          </>
                        )}
                        {selectedFund.provider && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span>{selectedFund.provider}</span>
                          </>
                        )}
                      </DialogDescription>
                    </div>
                  </div>
                  <Badge className={`${getAnalystBadgeStyle(selectedFund.analyst_rating)} text-sm px-3 py-1`}>
                    {selectedFund.analyst_rating}
                  </Badge>
                </div>
              </DialogHeader>
              
              <ScrollArea className="max-h-[65vh] pr-4">
                <div className="space-y-6 py-4">
                  {/* Performance & Overall Score */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">1Y Return</p>
                      <p className={`text-2xl font-bold ${(selectedFund.one_year_return || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {selectedFund.one_year_return ? `${selectedFund.one_year_return >= 0 ? '+' : ''}${selectedFund.one_year_return}%` : '—'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span>AUM: {formatAUM(selectedFund.aum)}</span>
                        {selectedFund.ocf && <span>• OCF: {selectedFund.ocf}%</span>}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-4">
                      <p className="text-sm text-emerald-600 mb-1">Overall Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(selectedFund.overall_score)}`}>
                        {selectedFund.overall_score?.toFixed(1) || '—'}
                        <span className="text-lg text-muted-foreground">/5</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedFund.asset_class || 'Fund'}
                      </p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-500" />
                      Score Breakdown
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ScoreBar label="Fundamentals" score={selectedFund.score_fundamentals} icon={BarChart3} getScoreColor={getScoreColor} getScoreProgressColor={getScoreProgressColor} />
                      <ScoreBar label="Performance" score={selectedFund.score_performance} icon={TrendingUp} getScoreColor={getScoreColor} getScoreProgressColor={getScoreProgressColor} />
                      <ScoreBar label="Risk" score={selectedFund.score_risk} icon={Shield} getScoreColor={getScoreColor} getScoreProgressColor={getScoreProgressColor} />
                      <ScoreBar label="Cost" score={selectedFund.score_cost} icon={DollarSign} getScoreColor={getScoreColor} getScoreProgressColor={getScoreProgressColor} />
                      <ScoreBar label="ESG" score={selectedFund.score_esg} icon={Leaf} getScoreColor={getScoreColor} getScoreProgressColor={getScoreProgressColor} />
                    </div>
                  </div>

                  {/* Rating Rationale */}
                  {selectedFund.rating_rationale && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        Rating Rationale
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl">
                        {selectedFund.rating_rationale}
                      </p>
                    </div>
                  )}

                  {/* Investment Thesis */}
                  {selectedFund.investment_thesis && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                        Investment Thesis
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl">
                        {selectedFund.investment_thesis}
                      </p>
                    </div>
                  )}

                  {/* Strengths & Risks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedFund.strengths && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-emerald-600 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Strengths
                        </h4>
                        <p className="text-sm text-muted-foreground bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                          {selectedFund.strengths}
                        </p>
                      </div>
                    )}
                    {selectedFund.risks && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-red-600 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Risks
                        </h4>
                        <p className="text-sm text-muted-foreground bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                          {selectedFund.risks}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Suitable Investor & Watchpoints */}
                  {(selectedFund.suitable_investor_type || selectedFund.key_watchpoints) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedFund.suitable_investor_type && (
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-blue-500" />
                            Suitable For
                          </h4>
                          <p className="text-sm text-muted-foreground bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                            {selectedFund.suitable_investor_type}
                          </p>
                        </div>
                      )}
                      {selectedFund.key_watchpoints && (
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Bell className="h-4 w-4 text-amber-500" />
                            Key Watchpoints
                          </h4>
                          <p className="text-sm text-muted-foreground bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                            {selectedFund.key_watchpoints}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="text-xs text-muted-foreground pt-4 border-t border-border flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last updated {getTimeAgo(selectedFund.updated_at)}
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Fund Activity Card Component
interface FundActivityCardProps {
  fund: FundAnalystData;
  isRecent?: boolean;
  onClick: () => void;
  getAnalystBadgeStyle: (rating: AnalystRating) => string;
  getScoreColor: (score: number | null) => string;
  formatAUM: (aum: number | null) => string;
  getTimeAgo: (date: string) => string;
}

function FundActivityCard({ 
  fund, 
  isRecent, 
  onClick, 
  getAnalystBadgeStyle, 
  getScoreColor,
  formatAUM,
  getTimeAgo 
}: FundActivityCardProps) {
  return (
    <div 
      className={`group p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
        isRecent 
          ? 'bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-emerald-500/20 hover:border-emerald-500/40' 
          : 'bg-muted/30 border-border hover:border-border/80'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold truncate">{fund.fund_name}</h4>
              {fund.is_featured && (
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="font-medium">{fund.isin}</span>
              {fund.provider && (
                <>
                  <span>•</span>
                  <span>{fund.provider}</span>
                </>
              )}
              <span>•</span>
              <span>{getTimeAgo(fund.updated_at)}</span>
            </div>
            {fund.rating_rationale && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {fund.rating_rationale}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <Badge className={`${getAnalystBadgeStyle(fund.analyst_rating)} text-xs`}>
            {fund.analyst_rating}
          </Badge>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${getScoreColor(fund.overall_score)}`}>
              {fund.overall_score?.toFixed(1) || '—'}/5
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Featured Fund Card Component
interface FeaturedFundCardProps {
  fund: FundAnalystData;
  onClick: () => void;
  getAnalystBadgeStyle: (rating: AnalystRating) => string;
  getScoreColor: (score: number | null) => string;
  formatAUM: (aum: number | null) => string;
}

function FeaturedFundCard({ 
  fund, 
  onClick, 
  getAnalystBadgeStyle, 
  getScoreColor,
  formatAUM
}: FeaturedFundCardProps) {
  return (
    <div 
      className="group p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-orange-500/5 border-amber-500/20 hover:border-amber-500/40"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
        <span className="text-xs font-medium text-amber-600">Featured</span>
      </div>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
          <Database className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{fund.fund_name}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{fund.isin}</span>
            {fund.provider && (
              <>
                <span>•</span>
                <span>{fund.provider}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-500/10">
        <Badge className={`${getAnalystBadgeStyle(fund.analyst_rating)} text-xs`}>
          {fund.analyst_rating}
        </Badge>
        <span className={`text-sm font-bold ${getScoreColor(fund.overall_score)}`}>
          {fund.overall_score?.toFixed(1) || '—'}/5
        </span>
      </div>
    </div>
  );
}

// Score Bar Component
interface ScoreBarProps {
  label: string;
  score: number | null;
  icon: React.ElementType;
  getScoreColor: (score: number | null) => string;
  getScoreProgressColor: (score: number | null) => string;
}

function ScoreBar({ label, score, icon: Icon, getScoreColor, getScoreProgressColor }: ScoreBarProps) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
          {score || '—'}/5
        </span>
      </div>
      <Progress 
        value={score ? (score / 5) * 100 : 0} 
        className="h-2"
      />
    </div>
  );
}
