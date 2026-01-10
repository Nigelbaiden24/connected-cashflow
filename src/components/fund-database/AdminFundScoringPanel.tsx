import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  Shield, 
  Users, 
  Settings, 
  Building2, 
  DollarSign,
  Award,
  Save,
  X,
  FileText,
  TrendingUp,
  AlertTriangle,
  Target,
  Eye,
  Clock,
  ChartBar
} from "lucide-react";
import type { CompleteFund, FundRatings } from "@/types/fund";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AdminFundScoringPanelProps {
  fund: CompleteFund;
  onSave: (fundIsin: string, ratings: FundRatings) => void;
  onClose: () => void;
}

type AnalystRating = 'Gold' | 'Silver' | 'Bronze' | 'Neutral' | 'Negative';

export function AdminFundScoringPanel({ fund, onSave, onClose }: AdminFundScoringPanelProps) {
  const { toast } = useToast();
  const existingRatings = fund.ratings || {};
  
  // Forward-Looking Medalist Rating
  const [analystRating, setAnalystRating] = useState<AnalystRating>(existingRatings.analystRating || 'Neutral');
  
  // Conviction Scores (0-5 sliders)
  const [peopleScore, setPeopleScore] = useState<number>(existingRatings.peopleScore ?? 2.5);
  const [processScore, setProcessScore] = useState<number>(existingRatings.processScore ?? 2.5);
  const [parentScore, setParentScore] = useState<number>(existingRatings.parentScore ?? 2.5);
  const [priceScore, setPriceScore] = useState<number>(existingRatings.priceScore ?? 2.5);
  
  // Analyst Written Commentary
  const [investmentThesis, setInvestmentThesis] = useState(existingRatings.investmentThesis || '');
  const [strengths, setStrengths] = useState(existingRatings.strengths || '');
  const [risks, setRisks] = useState(existingRatings.risks || '');
  const [suitableInvestorType, setSuitableInvestorType] = useState(existingRatings.suitableInvestorType || '');
  const [keyWatchpoints, setKeyWatchpoints] = useState(existingRatings.keyWatchpoints || '');

  // Auto-calculate overall conviction score
  const overallConvictionScore = useMemo(() => {
    return Number(((peopleScore + processScore + parentScore + priceScore) / 4).toFixed(2));
  }, [peopleScore, processScore, parentScore, priceScore]);

  const handleSave = () => {
    const now = new Date().toISOString();
    const newRatings: FundRatings = {
      ...existingRatings,
      analystRating,
      analystRatingDate: now.split('T')[0],
      peopleScore,
      processScore,
      parentScore,
      priceScore,
      overallConvictionScore,
      investmentThesis,
      strengths,
      risks,
      suitableInvestorType,
      keyWatchpoints,
      ratedBy: 'Analyst',
      ratedAt: now,
      lastAnalystReviewDate: now,
    };
    
    onSave(fund.isin, newRatings);
    toast({
      title: "Analyst ratings saved",
      description: `Updated analyst assessment for ${fund.name}`,
    });
  };

  const getAnalystBadgeStyle = (rating: AnalystRating) => {
    const styles: Record<AnalystRating, string> = {
      'Gold': 'bg-amber-500/20 text-amber-600 border-amber-500/40',
      'Silver': 'bg-slate-400/20 text-slate-600 border-slate-400/40',
      'Bronze': 'bg-orange-600/20 text-orange-600 border-orange-600/40',
      'Neutral': 'bg-muted text-muted-foreground border-border',
      'Negative': 'bg-red-500/20 text-red-600 border-red-500/40'
    };
    return styles[rating];
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-500';
    if (score >= 3) return 'text-chart-2';
    if (score >= 2) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Average';
    if (score >= 1.5) return 'Below Average';
    return 'Poor';
  };

  const analystOptions: AnalystRating[] = ['Gold', 'Silver', 'Bronze', 'Neutral', 'Negative'];

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-muted/10 overflow-hidden w-full max-w-2xl">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-chart-2/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Award className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Analyst Assessment Panel</CardTitle>
              <CardDescription className="text-xs">Fund research & ratings input</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Fund Info */}
        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
          <p className="font-medium text-sm line-clamp-1">{fund.name}</p>
          <p className="text-xs text-muted-foreground">{fund.isin} • {fund.provider}</p>
          {existingRatings.lastAnalystReviewDate && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last Analyst Review: {format(new Date(existingRatings.lastAnalystReviewDate), 'dd MMM yyyy, HH:mm')}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <ScrollArea className="h-[650px]">
        <Tabs defaultValue="rating" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mx-4 mt-4" style={{ width: 'calc(100% - 2rem)' }}>
            <TabsTrigger value="rating" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Rating
            </TabsTrigger>
            <TabsTrigger value="conviction" className="text-xs">
              <ChartBar className="h-3 w-3 mr-1" />
              Conviction
            </TabsTrigger>
            <TabsTrigger value="commentary" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Commentary
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Forward-Looking Medalist Rating */}
          <TabsContent value="rating" className="p-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <Label className="text-sm font-semibold">Forward-Looking Analyst Rating</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Qualitative forward-looking assessment of the fund's ability to outperform its category benchmark on a risk-adjusted basis over a full market cycle.
              </p>
              
              <div className="grid grid-cols-5 gap-2">
                {analystOptions.map((rating) => (
                  <Button
                    key={rating}
                    variant="outline"
                    size="sm"
                    className={`flex flex-col items-center gap-1 h-auto py-3 ${
                      analystRating === rating 
                        ? getAnalystBadgeStyle(rating) + ' border-2 ring-2 ring-primary/20' 
                        : 'border-border/50 hover:bg-muted/50'
                    }`}
                    onClick={() => setAnalystRating(rating)}
                  >
                    <span className="text-lg">
                      {rating === 'Gold' && '🥇'}
                      {rating === 'Silver' && '🥈'}
                      {rating === 'Bronze' && '🥉'}
                      {rating === 'Neutral' && '⚪'}
                      {rating === 'Negative' && '🔴'}
                    </span>
                    <span className="text-xs font-medium">{rating}</span>
                  </Button>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-2">
                <h4 className="text-sm font-medium">Rating Definitions</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><span className="font-medium text-amber-600">Gold:</span> Best ideas with highest conviction</p>
                  <p><span className="font-medium text-slate-500">Silver:</span> Strong prospect of outperformance</p>
                  <p><span className="font-medium text-orange-600">Bronze:</span> Above-average potential</p>
                  <p><span className="font-medium">Neutral:</span> Average expectations</p>
                  <p><span className="font-medium text-red-500">Negative:</span> Structural issues or concerns</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Conviction Scores */}
          <TabsContent value="conviction" className="p-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChartBar className="h-5 w-5 text-chart-2" />
                  <Label className="text-sm font-semibold">Analyst Conviction Scores</Label>
                </div>
                <Badge variant="outline" className={`${getScoreColor(overallConvictionScore)} border-current`}>
                  Overall: {overallConvictionScore.toFixed(1)} / 5
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Score each pillar from 0 (lowest) to 5 (highest). The overall conviction score is automatically calculated as the average.
              </p>

              {/* People Score */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-chart-1" />
                    <Label className="text-sm font-medium">People</Label>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(peopleScore)}`}>
                    {peopleScore.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Quality of investment team, experience, stability, and talent retention
                </p>
                <Slider
                  value={[peopleScore]}
                  onValueChange={(v) => setPeopleScore(v[0])}
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0 - Poor</span>
                  <span>2.5 - Average</span>
                  <span>5 - Excellent</span>
                </div>
              </div>

              {/* Process Score */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-chart-2" />
                    <Label className="text-sm font-medium">Process</Label>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(processScore)}`}>
                    {processScore.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Investment process clarity, repeatability, risk management, and philosophy
                </p>
                <Slider
                  value={[processScore]}
                  onValueChange={(v) => setProcessScore(v[0])}
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0 - Poor</span>
                  <span>2.5 - Average</span>
                  <span>5 - Excellent</span>
                </div>
              </div>

              {/* Parent Score */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-chart-3" />
                    <Label className="text-sm font-medium">Parent</Label>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(parentScore)}`}>
                    {parentScore.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Fund house stewardship, alignment with investors, corporate governance
                </p>
                <Slider
                  value={[parentScore]}
                  onValueChange={(v) => setParentScore(v[0])}
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0 - Poor</span>
                  <span>2.5 - Average</span>
                  <span>5 - Excellent</span>
                </div>
              </div>

              {/* Price Score */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-chart-4" />
                    <Label className="text-sm font-medium">Price</Label>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(priceScore)}`}>
                    {priceScore.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Fee competitiveness relative to peers and value delivered
                </p>
                <Slider
                  value={[priceScore]}
                  onValueChange={(v) => setPriceScore(v[0])}
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0 - Poor</span>
                  <span>2.5 - Average</span>
                  <span>5 - Excellent</span>
                </div>
              </div>

              {/* Overall Score Summary */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-chart-2/10 border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold">Overall Analyst Conviction Score</Label>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${getScoreColor(overallConvictionScore)}`}>
                      {overallConvictionScore.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground"> / 5</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        overallConvictionScore >= 4 ? 'bg-emerald-500' :
                        overallConvictionScore >= 3 ? 'bg-chart-2' :
                        overallConvictionScore >= 2 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(overallConvictionScore / 5) * 100}%` }}
                    />
                  </div>
                  <Badge variant="outline" className={getScoreColor(overallConvictionScore)}>
                    {getScoreLabel(overallConvictionScore)}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Analyst Written Commentary */}
          <TabsContent value="commentary" className="p-4 space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-chart-3" />
                <Label className="text-sm font-semibold">Analyst Written Commentary</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Provide detailed qualitative analysis. Each section supports rich text formatting.
              </p>

              {/* Investment Thesis */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">Investment Thesis</Label>
                </div>
                <Textarea
                  value={investmentThesis}
                  onChange={(e) => setInvestmentThesis(e.target.value)}
                  placeholder="Describe the core investment thesis and rationale for this fund..."
                  className="min-h-[100px] text-sm bg-muted/30 border-border/50"
                />
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-emerald-500" />
                  <Label className="text-sm font-medium">Strengths</Label>
                </div>
                <Textarea
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Key competitive advantages and positive attributes..."
                  className="min-h-[80px] text-sm bg-muted/30 border-border/50"
                />
              </div>

              {/* Risks */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <Label className="text-sm font-medium">Risks</Label>
                </div>
                <Textarea
                  value={risks}
                  onChange={(e) => setRisks(e.target.value)}
                  placeholder="Key risks and potential areas of concern..."
                  className="min-h-[80px] text-sm bg-muted/30 border-border/50"
                />
              </div>

              {/* Suitable Investor Type */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-chart-2" />
                  <Label className="text-sm font-medium">Suitable Investor Type</Label>
                </div>
                <Textarea
                  value={suitableInvestorType}
                  onChange={(e) => setSuitableInvestorType(e.target.value)}
                  placeholder="Which types of investors is this fund most suitable for..."
                  className="min-h-[60px] text-sm bg-muted/30 border-border/50"
                />
              </div>

              {/* Key Watchpoints */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-chart-4" />
                  <Label className="text-sm font-medium">Key Watchpoints</Label>
                </div>
                <Textarea
                  value={keyWatchpoints}
                  onChange={(e) => setKeyWatchpoints(e.target.value)}
                  placeholder="Items to monitor going forward, potential catalysts or warning signs..."
                  className="min-h-[60px] text-sm bg-muted/30 border-border/50"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-4 space-y-4">
          <Separator className="bg-border/50" />

          {/* Summary Preview */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-chart-2/5 border border-border/50 space-y-3">
            <Label className="text-sm font-semibold">Rating Summary</Label>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={`${getAnalystBadgeStyle(analystRating)} border text-sm px-3 py-1`}>
                {analystRating === 'Gold' && '🥇 '}
                {analystRating === 'Silver' && '🥈 '}
                {analystRating === 'Bronze' && '🥉 '}
                {analystRating}
              </Badge>
              <Badge variant="outline" className={`${getScoreColor(overallConvictionScore)} border-current`}>
                Conviction: {overallConvictionScore.toFixed(1)}/5
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'People', value: peopleScore },
                { label: 'Process', value: processScore },
                { label: 'Parent', value: parentScore },
                { label: 'Price', value: priceScore }
              ].map((pillar) => (
                <div key={pillar.label} className="space-y-1">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        pillar.value >= 4 ? 'bg-emerald-500' :
                        pillar.value >= 3 ? 'bg-chart-2' :
                        pillar.value >= 2 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(pillar.value / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{pillar.label}</span>
                  <span className="text-[10px] font-medium block">{pillar.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              {investmentThesis && <p className="line-clamp-2">📝 Thesis provided</p>}
              {strengths && <p>✅ Strengths documented</p>}
              {risks && <p>⚠️ Risks noted</p>}
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            className="w-full bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Analyst Assessment
          </Button>

          {existingRatings.lastAnalystReviewDate && (
            <p className="text-xs text-center text-muted-foreground">
              Last updated: {format(new Date(existingRatings.lastAnalystReviewDate), 'dd MMM yyyy, HH:mm')}
            </p>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
