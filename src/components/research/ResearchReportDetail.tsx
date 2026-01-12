import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Shield, 
  DollarSign, 
  Leaf, 
  Clock, 
  ArrowLeft,
  Star,
  AlertTriangle,
  BarChart3,
  Users,
  Building,
  LineChart,
  Scale,
  Target,
  Zap,
  Info,
  FileText
} from 'lucide-react';
import { ResearchReport, ResearchChangeLog } from '@/hooks/useResearchReports';
import { format } from 'date-fns';

interface ResearchReportDetailProps {
  report: ResearchReport;
  changeLogs: ResearchChangeLog[];
  onBack: () => void;
}

export function ResearchReportDetail({ report, changeLogs, onBack }: ResearchReportDetailProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAssetTypeBadge = (type: string) => {
    const colors = {
      fund: 'bg-blue-100 text-blue-800',
      etf: 'bg-purple-100 text-purple-800',
      stock: 'bg-green-100 text-green-800',
      crypto: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderRiskAnalysis = () => {
    const risk = report.risk_analysis;
    if (!risk) return <p className="text-muted-foreground">No risk analysis available</p>;

    const riskCategories = [
      { key: 'market_risk', label: 'Market Risk', icon: TrendingUp },
      { key: 'volatility_risk', label: 'Volatility', icon: LineChart },
      { key: 'liquidity_risk', label: 'Liquidity', icon: Zap },
      { key: 'concentration_risk', label: 'Concentration', icon: Target },
      { key: 'leverage_risk', label: 'Leverage', icon: Scale },
      { key: 'governance_risk', label: 'Governance', icon: Building },
      { key: 'regulatory_risk', label: 'Regulatory', icon: Shield },
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Overall Risk Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(100 - (risk.overall_risk_score || 50))}`}>
              {risk.overall_risk_score || 50}/100
            </p>
          </div>
          <Shield className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="grid gap-3">
          {riskCategories.map(({ key, label, icon: Icon }) => {
            const data = risk[key];
            if (!data) return null;
            return (
              <div key={key} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{label}</span>
                  </div>
                  <span className={`font-semibold ${getScoreColor(100 - (data.score || 50))}`}>
                    {data.score || 'N/A'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{data.assessment || 'No assessment available'}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListSection = (items: string[] | undefined, emptyMessage: string) => {
    if (!items || items.length === 0) {
      return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
    }
    return (
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div className="flex items-center gap-3">
            <Badge className={getAssetTypeBadge(report.asset_type)} variant="secondary">
              {report.asset_type.toUpperCase()}
            </Badge>
            {report.asset_symbol && (
              <span className="text-lg font-mono text-muted-foreground">
                {report.asset_symbol}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold">{report.asset_name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Generated {format(new Date(report.generated_at), 'MMMM d, yyyy')}
            </span>
            <span>Version {report.version}</span>
            <Badge variant="outline">{report.confidence_level || 'medium'} confidence</Badge>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Quality', score: report.overall_quality_score, icon: Star, color: 'blue' },
          { label: 'Risk', score: report.risk_score, icon: Shield, color: 'red' },
          { label: 'Valuation', score: report.valuation_score, icon: DollarSign, color: 'green' },
          { label: 'ESG', score: report.esg_score, icon: Leaf, color: 'emerald' },
        ].map(({ label, score, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className={`text-2xl font-bold ${getScoreColor(score || 0)}`}>
                  {score || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{label} Score</p>
              <Progress value={score || 0} className="h-2 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="fundamental" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="fundamental" className="text-xs">Fundamental</TabsTrigger>
          <TabsTrigger value="quality" className="text-xs">Quality</TabsTrigger>
          <TabsTrigger value="valuation" className="text-xs">Valuation</TabsTrigger>
          <TabsTrigger value="risk" className="text-xs">Risk</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
          <TabsTrigger value="governance" className="text-xs">Governance</TabsTrigger>
          <TabsTrigger value="esg" className="text-xs">ESG</TabsTrigger>
          <TabsTrigger value="portfolio" className="text-xs">Portfolio Role</TabsTrigger>
          <TabsTrigger value="scenario" className="text-xs">Scenarios</TabsTrigger>
          <TabsTrigger value="methodology" className="text-xs">Methodology</TabsTrigger>
        </TabsList>

        <TabsContent value="fundamental">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Fundamental Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {report.fundamental_analysis ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Overview</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.fundamental_analysis.overview || 'No overview available'}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">Strengths</h4>
                      {renderListSection(report.fundamental_analysis.strengths, 'No strengths identified')}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">Weaknesses</h4>
                      {renderListSection(report.fundamental_analysis.weaknesses, 'No weaknesses identified')}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Revenue Drivers</h4>
                    {renderListSection(report.fundamental_analysis.revenue_drivers, 'No revenue drivers identified')}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Cost Structure</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.fundamental_analysis.cost_structure || 'No cost structure analysis available'}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No fundamental analysis available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Quality Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {report.quality_analysis ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Quality Tier</p>
                      <p className="text-2xl font-bold">{report.quality_analysis.quality_tier || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Repeatability Score</p>
                      <p className="text-2xl font-bold">{report.quality_analysis.repeatability_score || 'N/A'}/10</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Competitive Advantages</h4>
                    {renderListSection(report.quality_analysis.competitive_advantages, 'No competitive advantages identified')}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Manager Assessment</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.quality_analysis.manager_assessment || 'No manager assessment available'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Philosophy Clarity</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.quality_analysis.philosophy_clarity || 'No philosophy assessment available'}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No quality analysis available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valuation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Valuation Analysis
              </CardTitle>
              <CardDescription>Non-recommendation valuation assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {report.valuation_analysis ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Probability Overvalued</p>
                      <p className="text-2xl font-bold text-red-600">
                        {report.valuation_analysis.probability_overvalued || 0}%
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Probability Undervalued</p>
                      <p className="text-2xl font-bold text-green-600">
                        {report.valuation_analysis.probability_undervalued || 0}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Relative Valuation</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.valuation_analysis.relative_valuation || 'No relative valuation available'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Historical Band Position</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.valuation_analysis.historical_band_position || 'No historical analysis available'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Valuation Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.valuation_analysis.valuation_summary || 'No summary available'}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No valuation analysis available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk Analysis
              </CardTitle>
              <CardDescription>Multi-dimensional risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              {renderRiskAnalysis()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Performance Diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {report.performance_analysis ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Return Drivers</h4>
                    {renderListSection(report.performance_analysis.return_drivers, 'No return drivers identified')}
                  </div>
                  {report.performance_analysis.factor_exposures && (
                    <div>
                      <h4 className="font-semibold mb-3">Factor Exposures</h4>
                      <div className="grid grid-cols-5 gap-4">
                        {Object.entries(report.performance_analysis.factor_exposures).map(([factor, value]) => (
                          <div key={factor} className="text-center p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground capitalize">{factor}</p>
                            <p className="text-lg font-bold">{typeof value === 'number' ? (value as number).toFixed(2) : String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold mb-2">Cycle Consistency</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.performance_analysis.cycle_consistency || 'No cycle analysis available'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Risk-Adjusted Assessment</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.performance_analysis.risk_adjusted_assessment || 'No risk-adjusted assessment available'}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No performance analysis available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Governance Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {report.governance_analysis ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Leadership Stability</h4>
                      <p className="text-sm text-muted-foreground">
                        {report.governance_analysis.leadership_stability || 'No assessment available'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Key Person Risk</h4>
                      <Badge variant={
                        report.governance_analysis.key_person_risk === 'Low' ? 'secondary' :
                        report.governance_analysis.key_person_risk === 'High' ? 'destructive' : 'default'
                      }>
                        {report.governance_analysis.key_person_risk || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Incentive Alignment</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.governance_analysis.incentive_alignment || 'No assessment available'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Track Record</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.governance_analysis.track_record || 'No track record assessment available'}
                    </p>
                  </div>
                  {report.governance_analysis.red_flags && report.governance_analysis.red_flags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Red Flags
                      </h4>
                      {renderListSection(report.governance_analysis.red_flags, 'No red flags identified')}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No governance analysis available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="esg">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                ESG & Sustainability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {report.esg_analysis ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">ESG Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(report.esg_analysis.esg_score || 0)}`}>
                        {report.esg_analysis.esg_score || 0}/100
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {report.esg_analysis.sustainability_rating || 'Not Rated'}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Environmental</h4>
                      <p className="text-xs text-muted-foreground">
                        {report.esg_analysis.environmental_risk || 'No data'}
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Social</h4>
                      <p className="text-xs text-muted-foreground">
                        {report.esg_analysis.social_risk || 'No data'}
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Governance</h4>
                      <p className="text-xs text-muted-foreground">
                        {report.esg_analysis.governance_risk || 'No data'}
                      </p>
                    </div>
                  </div>
                  {report.esg_analysis.controversies && report.esg_analysis.controversies.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-amber-600">Controversies</h4>
                      {renderListSection(report.esg_analysis.controversies, 'No controversies identified')}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No ESG analysis available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Portfolio Role Framework
              </CardTitle>
              <CardDescription>Educational analysis only - not personalized advice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.portfolio_role ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Theoretical Role</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.portfolio_role.theoretical_role || 'No role assessment available'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Typical Allocation Context</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.portfolio_role.typical_allocation_context || 'No context available'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Correlation Characteristics</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.portfolio_role.correlation_characteristics || 'No data available'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Diversification Benefit</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.portfolio_role.diversification_benefit || 'No assessment available'}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No portfolio role analysis available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenario">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Scenario & Stress Analysis
              </CardTitle>
              <CardDescription>Historical behavior analysis - not predictive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.scenario_analysis ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'market_drawdown_behavior', label: 'Market Drawdowns' },
                    { key: 'rising_rates_behavior', label: 'Rising Rates' },
                    { key: 'inflation_behavior', label: 'Inflationary Periods' },
                    { key: 'liquidity_shock_behavior', label: 'Liquidity Shocks' },
                  ].map(({ key, label }) => (
                    <div key={key} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {report.scenario_analysis[key] || 'No data available'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No scenario analysis available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methodology">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Model Governance & Explainability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {report.model_governance ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Methodology</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.model_governance.methodology || 'AI-driven analysis using publicly available data'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Data Limitations</h4>
                    {renderListSection(report.model_governance.data_limitations, 'No limitations noted')}
                  </div>
                  {report.model_governance.anomalies && report.model_governance.anomalies.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-amber-600">Anomalies Detected</h4>
                      {renderListSection(report.model_governance.anomalies, 'No anomalies detected')}
                    </div>
                  )}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Confidence Level</h4>
                    <Badge variant="secondary" className="capitalize">
                      {report.model_governance.confidence_level || report.confidence_level || 'Medium'}
                    </Badge>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No methodology information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Log */}
      {changeLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Change History
            </CardTitle>
            <CardDescription>What changed and why</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {changeLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant={
                      log.significance === 'material' ? 'destructive' :
                      log.significance === 'moderate' ? 'default' : 'secondary'
                    } className="capitalize">
                      {log.significance || 'minor'}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.change_summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')} • {log.change_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground text-center">
            This content is for informational and research purposes only and does not constitute investment advice.
            Data sources: {report.data_sources?.join(', ') || 'AI Analysis'}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
