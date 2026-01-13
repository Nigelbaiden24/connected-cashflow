import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Download,
  Scale,
  TrendingUp,
  TrendingDown,
  Shield,
  DollarSign,
  PieChart,
  Target,
  Lightbulb,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import type { CompleteFund, AIInsight } from "@/types/fund";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface FundDetailPanelProps {
  fund: CompleteFund;
  onClose: () => void;
  onAddToComparison: (fund: CompleteFund) => void;
}

export function FundDetailPanel({ fund, onClose, onAddToComparison }: FundDetailPanelProps) {
  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--warning))',
    'hsl(var(--success))',
    'hsl(var(--destructive))'
  ];

  const getReturnColor = (value: number) => {
    if (value > 0) return "text-emerald-500";
    if (value < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getRiskColor = (rating: number) => {
    if (rating <= 2) return "text-emerald-500";
    if (rating <= 4) return "text-amber-500";
    return "text-red-500";
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'performance': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'risk': return <Shield className="h-4 w-4 text-red-500" />;
      case 'cost': return <DollarSign className="h-4 w-4 text-blue-500" />;
      case 'alternative': return <Lightbulb className="h-4 w-4 text-purple-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const performanceData = [
    { period: 'YTD', return: fund.performance.ytdReturn, benchmark: fund.performance.benchmarkReturn1Y * (new Date().getMonth() + 1) / 12 },
    { period: '1Y', return: fund.performance.oneYearReturn, benchmark: fund.performance.benchmarkReturn1Y },
    { period: '3Y', return: fund.performance.threeYearReturn, benchmark: fund.performance.benchmarkReturn3Y },
    { period: '5Y', return: fund.performance.fiveYearReturn, benchmark: fund.performance.benchmarkReturn5Y }
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{fund.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span className="font-mono">{fund.isin}</span>
              {fund.ticker && <Badge variant="outline">{fund.ticker}</Badge>}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 pt-2">
          <Badge>{fund.fundType}</Badge>
          <Badge variant="outline">{fund.structure}</Badge>
          <Badge variant="outline">{fund.assetClass}</Badge>
          {fund.ucitsStatus && <Badge variant="secondary">UCITS</Badge>}
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1">
        <CardContent className="space-y-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full text-xs">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">{fund.costs.ocf.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">OCF</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className={`text-2xl font-bold ${getReturnColor(fund.performance.oneYearReturn)}`}>
                    {fund.performance.oneYearReturn.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">1Y Return</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className={`text-2xl font-bold ${getRiskColor(fund.risk.srriRating)}`}>
                    {fund.risk.srriRating}/7
                  </div>
                  <div className="text-xs text-muted-foreground">Risk Rating</div>
                </div>
              </div>

              {/* Fund Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">{fund.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{fund.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domicile</span>
                  <span className="font-medium">{fund.domicile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-medium">{fund.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Share Class</span>
                  <span className="font-medium">{fund.shareClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AUM</span>
                  <span className="font-medium">£{fund.aum.toLocaleString()}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Launch Date</span>
                  <span className="font-medium">{new Date(fund.launchDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Benchmark</span>
                  <span className="font-medium text-right">{fund.benchmark.primaryBenchmark}</span>
                </div>
              </div>

              <Separator />

              {/* Cost Breakdown */}
              <div>
                <h4 className="font-semibold mb-2">Cost Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AMC</span>
                    <span>{fund.costs.amc.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction Costs</span>
                    <span>{fund.costs.transactionCosts.toFixed(2)}%</span>
                  </div>
                  {fund.costs.performanceFee && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Performance Fee</span>
                      <span>{fund.costs.performanceFee}%</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Cost of Ownership</span>
                    <span>{fund.costs.totalCostOfOwnership.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4 mt-4">
              {/* Performance Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="return" name="Fund" fill="hsl(var(--primary))" />
                    <Bar dataKey="benchmark" name="Benchmark" fill="hsl(var(--muted-foreground))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Fund</TableHead>
                    <TableHead className="text-right">Benchmark</TableHead>
                    <TableHead className="text-right">Excess</TableHead>
                    <TableHead className="text-center">Quartile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>YTD</TableCell>
                    <TableCell className={`text-right ${getReturnColor(fund.performance.ytdReturn)}`}>
                      {fund.performance.ytdReturn.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>1 Year</TableCell>
                    <TableCell className={`text-right ${getReturnColor(fund.performance.oneYearReturn)}`}>
                      {fund.performance.oneYearReturn.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">{fund.performance.benchmarkReturn1Y.toFixed(1)}%</TableCell>
                    <TableCell className={`text-right ${getReturnColor(fund.performance.excessReturn1Y)}`}>
                      {fund.performance.excessReturn1Y.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">Q{fund.performance.quartileRank1Y}</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>3 Year</TableCell>
                    <TableCell className={`text-right ${getReturnColor(fund.performance.threeYearReturn)}`}>
                      {fund.performance.threeYearReturn.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">{fund.performance.benchmarkReturn3Y.toFixed(1)}%</TableCell>
                    <TableCell className={`text-right ${getReturnColor(fund.performance.excessReturn3Y)}`}>
                      {fund.performance.excessReturn3Y.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">Q{fund.performance.quartileRank3Y}</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>5 Year</TableCell>
                    <TableCell className={`text-right ${getReturnColor(fund.performance.fiveYearReturn)}`}>
                      {fund.performance.fiveYearReturn.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">{fund.performance.benchmarkReturn5Y.toFixed(1)}%</TableCell>
                    <TableCell className={`text-right ${getReturnColor(fund.performance.excessReturn5Y)}`}>
                      {fund.performance.excessReturn5Y.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">Q{fund.performance.quartileRank5Y}</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Since Inception</span>
                  <span className={getReturnColor(fund.performance.sinceInceptionReturn)}>
                    {fund.performance.sinceInceptionReturn.toFixed(1)}% p.a.
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NAV ({fund.performance.navDate})</span>
                  <span>{fund.currency} {fund.performance.dailyNav.toFixed(2)}</span>
                </div>
              </div>
            </TabsContent>

            {/* Risk Tab */}
            <TabsContent value="risk" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-xl font-bold">{fund.risk.volatility3Y.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Volatility (3Y)</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-xl font-bold">{fund.risk.sharpeRatio3Y.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Sharpe Ratio (3Y)</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-xl font-bold text-red-500">{fund.risk.maxDrawdown.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Max Drawdown</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-xl font-bold">{fund.risk.beta3Y.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Beta (3Y)</div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">1Y</TableHead>
                    <TableHead className="text-right">3Y</TableHead>
                    <TableHead className="text-right">5Y</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Volatility</TableCell>
                    <TableCell className="text-right">{fund.risk.volatility1Y.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{fund.risk.volatility3Y.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{fund.risk.volatility5Y.toFixed(1)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sharpe Ratio</TableCell>
                    <TableCell className="text-right">{fund.risk.sharpeRatio1Y.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{fund.risk.sharpeRatio3Y.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{fund.risk.sharpeRatio5Y.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sortino Ratio</TableCell>
                    <TableCell className="text-right">{fund.risk.sortinoRatio1Y.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{fund.risk.sortinoRatio3Y.toFixed(2)}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alpha (3Y)</span>
                  <span className={getReturnColor(fund.risk.alpha3Y)}>{fund.risk.alpha3Y.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">R-Squared</span>
                  <span>{(fund.risk.rSquared * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking Error</span>
                  <span>{fund.risk.trackingError.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Information Ratio</span>
                  <span>{fund.risk.informationRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Downside Deviation</span>
                  <span>{fund.risk.downsideDeviation.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Upside Capture</span>
                  <span>{fund.risk.upsideCaptureRatio}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Downside Capture</span>
                  <span>{fund.risk.downsideCaptureRatio}%</span>
                </div>
              </div>
            </TabsContent>

            {/* Holdings Tab */}
            <TabsContent value="holdings" className="space-y-4 mt-4">
              {/* Sector Allocation */}
              <div>
                <h4 className="font-semibold mb-2">Sector Allocation</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={fund.exposure.sectorExposure.slice(0, 6)}
                        dataKey="weight"
                        nameKey="sector"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label={({ sector, weight }) => `${sector.slice(0, 8)}: ${weight}%`}
                        labelLine={false}
                      >
                        {fund.exposure.sectorExposure.slice(0, 6).map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Holdings */}
              <div>
                <h4 className="font-semibold mb-2">Top 10 Holdings ({fund.exposure.top10Weight.toFixed(1)}%)</h4>
                <div className="space-y-2">
                  {fund.exposure.topHoldings.slice(0, 10).map((holding, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{holding.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {holding.sector} • {holding.country}
                        </div>
                      </div>
                      <span className="text-sm font-medium">{holding.weight.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Region Allocation */}
              <div>
                <h4 className="font-semibold mb-2">Regional Allocation</h4>
                <div className="space-y-2">
                  {fund.exposure.regionExposure.map((region, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{region.region}</span>
                        <span>{region.weight.toFixed(1)}%</span>
                      </div>
                      <Progress value={region.weight} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* ESG Info */}
              {fund.exposure.esgRating && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-sm">ESG Rating: {fund.exposure.esgRating}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {fund.exposure.carbonIntensity && (
                      <div>Carbon Intensity: {fund.exposure.carbonIntensity} tCO2e/$M</div>
                    )}
                    {fund.exposure.sustainabilityScore && (
                      <div>Sustainability Score: {fund.exposure.sustainabilityScore}</div>
                    )}
                    {fund.classification.sfdcClassification && (
                      <div>SFDR: {fund.classification.sfdcClassification}</div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-4 mt-4">
              {fund.aiInsights && fund.aiInsights.length > 0 ? (
                fund.aiInsights.map((insight, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-lg border ${
                      insight.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                      insight.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                      'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h5 className="font-semibold text-sm">{insight.title}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        {insight.recommendation && (
                          <p className="text-sm mt-2 p-2 rounded bg-background/50">
                            <strong>Recommendation:</strong> {insight.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No AI insights available for this fund</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={() => onAddToComparison(fund)}>
              <Scale className="h-4 w-4 mr-2" />
              Compare
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
