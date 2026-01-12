import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Shield, 
  DollarSign, 
  Leaf, 
  Clock, 
  ChevronRight,
  Star,
  AlertTriangle
} from 'lucide-react';
import { ResearchReport } from '@/hooks/useResearchReports';
import { format } from 'date-fns';

interface ResearchReportCardProps {
  report: ResearchReport;
  onViewDetails: (report: ResearchReport) => void;
}

export function ResearchReportCard({ report, onViewDetails }: ResearchReportCardProps) {
  const getAssetTypeBadge = (type: string) => {
    const colors = {
      fund: 'bg-blue-100 text-blue-800',
      etf: 'bg-purple-100 text-purple-800',
      stock: 'bg-green-100 text-green-800',
      crypto: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getQualityTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getConfidenceBadge = (level: string | null) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const qualityTier = report.quality_analysis?.quality_tier || 'N/A';

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onViewDetails(report)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className={getAssetTypeBadge(report.asset_type)}>
                {report.asset_type.toUpperCase()}
              </Badge>
              {report.asset_symbol && (
                <span className="text-sm font-mono text-muted-foreground">
                  {report.asset_symbol}
                </span>
              )}
            </div>
            <CardTitle className="text-lg line-clamp-1">{report.asset_name}</CardTitle>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scores Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5" />
              Quality
            </div>
            <div className="flex items-center gap-2">
              <Progress value={report.overall_quality_score || 0} className="h-2 flex-1" />
              <span className="text-sm font-medium w-8">{report.overall_quality_score || 0}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Risk
            </div>
            <div className="flex items-center gap-2">
              <Progress value={report.risk_score || 0} className="h-2 flex-1" />
              <span className="text-sm font-medium w-8">{report.risk_score || 0}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              Valuation
            </div>
            <div className="flex items-center gap-2">
              <Progress value={report.valuation_score || 0} className="h-2 flex-1" />
              <span className="text-sm font-medium w-8">{report.valuation_score || 0}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Leaf className="h-3.5 w-3.5" />
              ESG
            </div>
            <div className="flex items-center gap-2">
              <Progress value={report.esg_score || 0} className="h-2 flex-1" />
              <span className="text-sm font-medium w-8">{report.esg_score || 0}</span>
            </div>
          </div>
        </div>

        {/* Quality Tier & Confidence */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Quality Tier:</span>
            <span className={`text-sm font-semibold ${getQualityTierColor(qualityTier)}`}>
              {qualityTier}
            </span>
          </div>
          <Badge variant="outline" className={getConfidenceBadge(report.confidence_level)}>
            {report.confidence_level || 'unknown'} confidence
          </Badge>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {format(new Date(report.generated_at), 'MMM d, yyyy')}
          </div>
          <span>v{report.version}</span>
        </div>
      </CardContent>
    </Card>
  );
}
