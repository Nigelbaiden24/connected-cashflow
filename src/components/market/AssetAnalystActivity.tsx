import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { 
  Award, 
  TrendingUp, 
  TrendingDown,
  Target,
  AlertTriangle,
  Users,
  FileText,
  Clock,
  BarChart3,
  Shield,
  Zap,
  ChartBar
} from "lucide-react";
import { format } from "date-fns";

interface AssetAnalystActivityProps {
  symbol: string;
  assetType: 'stock' | 'crypto';
}

interface AnalystData {
  id: string;
  symbol: string;
  name: string;
  analyst_rating: string | null;
  rating_rationale: string | null;
  score_fundamentals: number | null;
  score_technicals: number | null;
  score_momentum: number | null;
  score_risk: number | null;
  overall_score: number | null;
  investment_thesis: string | null;
  strengths: string | null;
  risks: string | null;
  suitable_investor_type: string | null;
  key_watchpoints: string | null;
  is_featured: boolean | null;
  updated_at: string;
  created_at: string;
}

export function AssetAnalystActivity({ symbol, assetType }: AssetAnalystActivityProps) {
  const [data, setData] = useState<AnalystData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalystData();
  }, [symbol]);

  const fetchAnalystData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('stocks_crypto')
        .select('*')
        .eq('symbol', symbol.toUpperCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching analyst data:', error);
      }
      
      setData(result || null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingBadgeStyle = (rating: string) => {
    const styles: Record<string, string> = {
      'Gold': 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-200',
      'Silver': 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800 shadow-lg shadow-slate-200',
      'Bronze': 'bg-gradient-to-r from-orange-400 to-amber-600 text-white shadow-lg shadow-orange-200',
      'Neutral': 'bg-slate-200 text-slate-700',
      'Negative': 'bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg shadow-red-200'
    };
    return styles[rating] || styles['Neutral'];
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-slate-400';
    if (score >= 4) return 'text-emerald-600';
    if (score >= 3) return 'text-blue-600';
    if (score >= 2) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number | null) => {
    if (!score) return 'bg-slate-50';
    if (score >= 4) return 'bg-emerald-50 border-emerald-100';
    if (score >= 3) return 'bg-blue-50 border-blue-100';
    if (score >= 2) return 'bg-amber-50 border-amber-100';
    return 'bg-red-50 border-red-100';
  };

  const getConvictionLevel = (score: number | null) => {
    if (!score) return 'No Rating';
    if (score >= 4.5) return 'Very High';
    if (score >= 4) return 'High';
    if (score >= 3) return 'Moderate';
    if (score >= 2) return 'Low';
    return 'Very Low';
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700">No Analyst Coverage</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">
          This asset hasn't been rated by our analysts yet. Check back later for expert insights.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-6">
        {/* Rating Header */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${getRatingBadgeStyle(data.analyst_rating)}`}>
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Analyst Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{data.analyst_rating}</span>
                {data.is_featured && (
                  <Badge className="bg-primary/10 text-primary border-0 text-xs">Featured</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Conviction</p>
            <p className={`text-lg font-bold mt-1 ${getScoreColor(data.overall_score)}`}>
              {getConvictionLevel(data.overall_score)}
            </p>
          </div>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-5 gap-2">
          <ScoreCard 
            label="Overall" 
            score={data.overall_score} 
            icon={Target}
            getScoreColor={getScoreColor}
            getScoreBg={getScoreBg}
          />
          <ScoreCard 
            label="Fundamentals" 
            score={data.score_fundamentals} 
            icon={BarChart3}
            getScoreColor={getScoreColor}
            getScoreBg={getScoreBg}
          />
          <ScoreCard 
            label="Technicals" 
            score={data.score_technicals} 
            icon={ChartBar}
            getScoreColor={getScoreColor}
            getScoreBg={getScoreBg}
          />
          <ScoreCard 
            label="Momentum" 
            score={data.score_momentum} 
            icon={Zap}
            getScoreColor={getScoreColor}
            getScoreBg={getScoreBg}
          />
          <ScoreCard 
            label="Risk" 
            score={data.score_risk} 
            icon={Shield}
            getScoreColor={getScoreColor}
            getScoreBg={getScoreBg}
          />
        </div>

        {/* Investment Thesis */}
        {data.investment_thesis && (
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Investment Thesis</h4>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">{data.investment_thesis}</p>
          </div>
        )}

        {/* Rating Rationale */}
        {data.rating_rationale && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-slate-600" />
              <h4 className="font-semibold text-slate-900">Rating Rationale</h4>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{data.rating_rationale}</p>
          </div>
        )}

        {/* Strengths & Risks */}
        <div className="grid grid-cols-2 gap-4">
          {data.strengths && (
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <h4 className="font-semibold text-emerald-900">Key Strengths</h4>
              </div>
              <p className="text-sm text-emerald-800 leading-relaxed">{data.strengths}</p>
            </div>
          )}
          {data.risks && (
            <div className="p-4 rounded-xl bg-red-50/50 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h4 className="font-semibold text-red-900">Key Risks</h4>
              </div>
              <p className="text-sm text-red-800 leading-relaxed">{data.risks}</p>
            </div>
          )}
        </div>

        {/* Watchpoints */}
        {data.key_watchpoints && (
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h4 className="font-semibold text-amber-900">Key Watchpoints</h4>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">{data.key_watchpoints}</p>
          </div>
        )}

        {/* Suitable Investor Type */}
        {data.suitable_investor_type && (
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-600" />
              <h4 className="font-semibold text-purple-900">Suitable For</h4>
            </div>
            <p className="text-sm text-purple-800 leading-relaxed">{data.suitable_investor_type}</p>
          </div>
        )}

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Last updated: {format(new Date(data.updated_at), 'MMM d, yyyy \'at\' h:mm a')}
          </span>
        </div>
      </div>
    </ScrollArea>
  );
}

interface ScoreCardProps {
  label: string;
  score: number | null;
  icon: React.ElementType;
  getScoreColor: (score: number | null) => string;
  getScoreBg: (score: number | null) => string;
}

function ScoreCard({ label, score, icon: Icon, getScoreColor, getScoreBg }: ScoreCardProps) {
  return (
    <div className={`p-3 rounded-xl border text-center ${getScoreBg(score)}`}>
      <Icon className={`h-4 w-4 mx-auto mb-1 ${getScoreColor(score)}`} />
      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${getScoreColor(score)}`}>
        {score?.toFixed(1) || '—'}
      </p>
    </div>
  );
}
