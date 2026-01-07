import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  DollarSign,
  Leaf,
  Star,
  Filter,
  RotateCcw,
  Play,
  Save,
  ChevronRight,
  Zap,
  Target,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { fundDatabase } from "@/data/fundDatabase";
import type { CompleteFund } from "@/types/fund";

interface ScreenerCriteria {
  minReturn1Y: number;
  maxOCF: number;
  maxRisk: number;
  minAUM: number;
  minSharpe: number;
  maxDrawdown: number;
  esgOnly: boolean;
  ucitsOnly: boolean;
  accumulating: boolean;
  fundTypes: string[];
  assetClasses: string[];
}

const defaultCriteria: ScreenerCriteria = {
  minReturn1Y: -50,
  maxOCF: 2,
  maxRisk: 7,
  minAUM: 0,
  minSharpe: -1,
  maxDrawdown: -50,
  esgOnly: false,
  ucitsOnly: false,
  accumulating: false,
  fundTypes: [],
  assetClasses: []
};

interface FundScreenerProps {
  onViewFund?: (fund: CompleteFund) => void;
  onAddToComparison?: (fund: CompleteFund) => void;
}

const presetScreens = [
  { name: "Top Performers", description: "High 1Y returns with solid risk metrics", criteria: { ...defaultCriteria, minReturn1Y: 10, minSharpe: 0.5 } },
  { name: "Low Cost Champions", description: "Best value funds under 0.5% OCF", criteria: { ...defaultCriteria, maxOCF: 0.5 } },
  { name: "Conservative Income", description: "Low risk with steady returns", criteria: { ...defaultCriteria, maxRisk: 3, maxDrawdown: -15 } },
  { name: "ESG Leaders", description: "Sustainable investment options", criteria: { ...defaultCriteria, esgOnly: true } },
  { name: "Growth Focused", description: "High growth potential funds", criteria: { ...defaultCriteria, minReturn1Y: 15, maxRisk: 5 } },
];

export function FundScreener({ onViewFund, onAddToComparison }: FundScreenerProps) {
  const [criteria, setCriteria] = useState<ScreenerCriteria>(defaultCriteria);
  const [hasRun, setHasRun] = useState(false);

  const screenedFunds = useMemo(() => {
    if (!hasRun) return [];
    
    return fundDatabase.filter(fund => {
      if (fund.performance.oneYearReturn < criteria.minReturn1Y) return false;
      if (fund.costs.ocf > criteria.maxOCF) return false;
      if (fund.risk.srriRating > criteria.maxRisk) return false;
      if (fund.aum < criteria.minAUM) return false;
      if (fund.risk.sharpeRatio3Y < criteria.minSharpe) return false;
      if (fund.risk.maxDrawdown < criteria.maxDrawdown) return false;
      if (criteria.esgOnly && !fund.exposure.esgRating) return false;
      if (criteria.ucitsOnly && !fund.ucitsStatus) return false;
      if (criteria.accumulating && fund.shareClass !== 'Accumulating') return false;
      if (criteria.fundTypes.length > 0 && !criteria.fundTypes.includes(fund.fundType)) return false;
      if (criteria.assetClasses.length > 0 && !criteria.assetClasses.includes(fund.assetClass)) return false;
      return true;
    }).sort((a, b) => b.performance.oneYearReturn - a.performance.oneYearReturn);
  }, [criteria, hasRun]);

  const handleReset = () => {
    setCriteria(defaultCriteria);
    setHasRun(false);
  };

  const handleRunScreen = () => {
    setHasRun(true);
  };

  const applyPreset = (preset: typeof presetScreens[0]) => {
    setCriteria(preset.criteria);
    setHasRun(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Criteria Panel */}
      <Card className="lg:col-span-1 border-border/50 bg-gradient-to-br from-background to-muted/10">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Screen Criteria</CardTitle>
              <CardDescription>Build custom fund screens</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {/* Preset Screens */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Quick Screens
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {presetScreens.map((preset, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2.5 px-3 border-border/50 hover:border-primary/50 hover:bg-primary/5 group"
                      onClick={() => applyPreset(preset)}
                    >
                      <div className="flex-1">
                        <span className="font-medium text-sm">{preset.name}</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">{preset.description}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Performance */}
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Performance
                </Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Min. 1Y Return</span>
                      <span className="font-mono text-primary">{criteria.minReturn1Y}%</span>
                    </div>
                    <Slider
                      value={[criteria.minReturn1Y]}
                      min={-50}
                      max={50}
                      step={1}
                      onValueChange={([v]) => setCriteria({ ...criteria, minReturn1Y: v })}
                      className="py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Min. Sharpe Ratio (3Y)</span>
                      <span className="font-mono text-primary">{criteria.minSharpe.toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[criteria.minSharpe]}
                      min={-1}
                      max={3}
                      step={0.1}
                      onValueChange={([v]) => setCriteria({ ...criteria, minSharpe: v })}
                      className="py-2"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Risk */}
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  Risk Controls
                </Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Max. SRRI Risk Level</span>
                      <span className="font-mono text-primary">{criteria.maxRisk}/7</span>
                    </div>
                    <Slider
                      value={[criteria.maxRisk]}
                      min={1}
                      max={7}
                      step={1}
                      onValueChange={([v]) => setCriteria({ ...criteria, maxRisk: v })}
                      className="py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Max. Drawdown</span>
                      <span className="font-mono text-primary">{criteria.maxDrawdown}%</span>
                    </div>
                    <Slider
                      value={[criteria.maxDrawdown]}
                      min={-50}
                      max={0}
                      step={1}
                      onValueChange={([v]) => setCriteria({ ...criteria, maxDrawdown: v })}
                      className="py-2"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Cost */}
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <DollarSign className="h-3 w-3" />
                  Costs
                </Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Max. OCF</span>
                    <span className="font-mono text-primary">{criteria.maxOCF}%</span>
                  </div>
                  <Slider
                    value={[criteria.maxOCF]}
                    min={0}
                    max={2}
                    step={0.05}
                    onValueChange={([v]) => setCriteria({ ...criteria, maxOCF: v })}
                    className="py-2"
                  />
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Size */}
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <BarChart3 className="h-3 w-3" />
                  Fund Size
                </Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Min. AUM</span>
                    <span className="font-mono text-primary">${criteria.minAUM}M</span>
                  </div>
                  <Slider
                    value={[criteria.minAUM]}
                    min={0}
                    max={5000}
                    step={100}
                    onValueChange={([v]) => setCriteria({ ...criteria, minAUM: v })}
                    className="py-2"
                  />
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Toggles */}
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <Target className="h-3 w-3" />
                  Preferences
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">ESG Rated Only</span>
                    </div>
                    <Switch
                      checked={criteria.esgOnly}
                      onCheckedChange={(v) => setCriteria({ ...criteria, esgOnly: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">UCITS Only</span>
                    </div>
                    <Switch
                      checked={criteria.ucitsOnly}
                      onCheckedChange={(v) => setCriteria({ ...criteria, ucitsOnly: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Accumulating Only</span>
                    </div>
                    <Switch
                      checked={criteria.accumulating}
                      onCheckedChange={(v) => setCriteria({ ...criteria, accumulating: v })}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1 border-border/50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleRunScreen}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Screen
                </Button>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card className="lg:col-span-2 border-border/50 bg-gradient-to-br from-background to-muted/10">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <CardTitle className="text-lg">Screen Results</CardTitle>
                <CardDescription>
                  {hasRun ? `${screenedFunds.length} funds match your criteria` : "Configure criteria and run screen"}
                </CardDescription>
              </div>
            </div>
            {hasRun && screenedFunds.length > 0 && (
              <Button variant="outline" size="sm" className="border-border/50">
                <Save className="h-4 w-4 mr-2" />
                Save Screen
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!hasRun ? (
            <div className="text-center py-20">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center mx-auto mb-6">
                <Filter className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Configure Your Screen</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Set your criteria in the panel on the left and click "Run Screen" to find matching funds
              </p>
            </div>
          ) : screenedFunds.length === 0 ? (
            <div className="text-center py-20">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Funds Match</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your criteria to broaden the search
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {screenedFunds.map((fund, index) => (
                  <Card
                    key={fund.isin}
                    className="border-border/50 hover:border-primary/30 transition-all cursor-pointer group overflow-hidden"
                    onClick={() => onViewFund?.(fund)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                              {fund.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{fund.provider}</span>
                            <span>•</span>
                            <span>{fund.isin}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {fund.fundType}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className={`text-lg font-bold ${fund.performance.oneYearReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {fund.performance.oneYearReturn >= 0 ? '+' : ''}{fund.performance.oneYearReturn.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">1Y Return</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{fund.costs.ocf}%</p>
                            <p className="text-xs text-muted-foreground">OCF</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold">{fund.risk.srriRating}</span>
                              <span className="text-muted-foreground">/7</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Risk</p>
                          </div>
                          {fund.ratings?.starRating && (
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: fund.ratings.starRating }).map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
