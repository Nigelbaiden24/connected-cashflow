import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Star, 
  Shield, 
  Users, 
  Settings, 
  Building2, 
  TrendingUp, 
  DollarSign,
  Award,
  Save,
  X,
} from "lucide-react";
import type { CompleteFund, FundRatings } from "@/types/fund";
import { useToast } from "@/hooks/use-toast";

// Re-export the new comprehensive panel
export { AdminFundScoringPanel } from "./AdminFundScoringPanel";

interface AdminFundScoringProps {
  fund: CompleteFund;
  onSave: (fundIsin: string, ratings: FundRatings) => void;
  onClose: () => void;
}

type AnalystRating = 'Gold' | 'Silver' | 'Bronze' | 'Neutral' | 'Negative';
type PillarRating = 'High' | 'Above Average' | 'Average' | 'Below Average' | 'Low';

/**
 * @deprecated Use AdminFundScoringPanel for the full analyst backend experience
 */
export function AdminFundScoring({ fund, onSave, onClose }: AdminFundScoringProps) {
  const { toast } = useToast();
  const existingRatings = fund.ratings || {};
  
  const [starRating, setStarRating] = useState<number>(existingRatings.starRating || 3);
  const [analystRating, setAnalystRating] = useState<AnalystRating>(existingRatings.analystRating || 'Neutral');
  const [rationale, setRationale] = useState(existingRatings.analystRatingRationale || '');
  const [peopleRating, setPeopleRating] = useState<PillarRating>(existingRatings.peopleRating || 'Average');
  const [processRating, setProcessRating] = useState<PillarRating>(existingRatings.processRating || 'Average');
  const [parentRating, setParentRating] = useState<PillarRating>(existingRatings.parentRating || 'Average');
  const [performanceRating, setPerformanceRating] = useState<PillarRating>(existingRatings.performanceRating || 'Average');
  const [priceRating, setPriceRating] = useState<PillarRating>(existingRatings.priceRating || 'Average');

  const handleSave = () => {
    const newRatings: FundRatings = {
      starRating: starRating as 1 | 2 | 3 | 4 | 5,
      starRatingDate: new Date().toISOString().split('T')[0],
      analystRating,
      analystRatingDate: new Date().toISOString().split('T')[0],
      analystRatingRationale: rationale,
      peopleRating,
      processRating,
      parentRating,
      performanceRating,
      priceRating,
      ratedBy: 'Admin',
      ratedAt: new Date().toISOString(),
      lastAnalystReviewDate: new Date().toISOString(),
      categoryRank: existingRatings.categoryRank,
      styleBoxEquity: existingRatings.styleBoxEquity,
      styleBoxFixedIncome: existingRatings.styleBoxFixedIncome
    };
    
    onSave(fund.isin, newRatings);
    toast({
      title: "Ratings saved",
      description: `Updated ratings for ${fund.name}`,
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

  const getPillarBadgeStyle = (rating: PillarRating) => {
    const styles: Record<PillarRating, string> = {
      'High': 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40',
      'Above Average': 'bg-emerald-400/15 text-emerald-500 border-emerald-400/30',
      'Average': 'bg-muted text-muted-foreground border-border',
      'Below Average': 'bg-amber-500/15 text-amber-600 border-amber-500/30',
      'Low': 'bg-red-500/20 text-red-600 border-red-500/40'
    };
    return styles[rating];
  };

  const pillarOptions: PillarRating[] = ['High', 'Above Average', 'Average', 'Below Average', 'Low'];
  const analystOptions: AnalystRating[] = ['Gold', 'Silver', 'Bronze', 'Neutral', 'Negative'];

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-muted/10 overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-chart-2/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Award className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Fund Rating Panel</CardTitle>
              <CardDescription className="text-xs">Morningstar-style analysis</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <ScrollArea className="h-[600px]">
        <CardContent className="p-4 space-y-6">
          {/* Fund Info */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="font-medium text-sm line-clamp-1">{fund.name}</p>
            <p className="text-xs text-muted-foreground">{fund.isin} • {fund.provider}</p>
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <Label className="text-sm font-semibold">Star Rating (1-5)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on historical risk-adjusted performance vs. category peers
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={starRating >= rating ? "default" : "outline"}
                  size="sm"
                  className={`w-10 h-10 p-0 ${starRating >= rating ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25' : 'border-amber-500/30 hover:bg-amber-500/10'}`}
                  onClick={() => setStarRating(rating)}
                >
                  <Star className={`h-4 w-4 ${starRating >= rating ? 'fill-current' : ''}`} />
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {starRating} Star{starRating !== 1 ? 's' : ''} - {
                starRating === 5 ? 'Top 10%' :
                starRating === 4 ? 'Next 22.5%' :
                starRating === 3 ? 'Middle 35%' :
                starRating === 2 ? 'Next 22.5%' : 'Bottom 10%'
              }
            </p>
          </div>

          <Separator className="bg-border/50" />

          {/* Analyst Rating */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Forward-Looking Analyst Rating</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Forward-looking assessment of the fund's ability to outperform peers
            </p>
            <div className="flex flex-wrap gap-2">
              {analystOptions.map((rating) => (
                <Button
                  key={rating}
                  variant="outline"
                  size="sm"
                  className={`${analystRating === rating ? getAnalystBadgeStyle(rating) + ' border-2' : 'border-border/50'}`}
                  onClick={() => setAnalystRating(rating)}
                >
                  {rating === 'Gold' && <span className="mr-1">🥇</span>}
                  {rating === 'Silver' && <span className="mr-1">🥈</span>}
                  {rating === 'Bronze' && <span className="mr-1">🥉</span>}
                  {rating}
                </Button>
              ))}
            </div>
          </div>

          {/* Rating Rationale */}
          <div className="space-y-2">
            <Label className="text-sm">Rating Rationale</Label>
            <Textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Explain your rating decision..."
              className="min-h-[80px] text-sm bg-muted/30 border-border/50"
            />
          </div>

          <Separator className="bg-border/50" />

          {/* Pillar Ratings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-semibold">Pillar Ratings</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Qualitative assessment of key fund attributes
            </p>

            {/* People */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-chart-1" />
                <Label className="text-xs">People (Management Team)</Label>
              </div>
              <Select value={peopleRating} onValueChange={(v) => setPeopleRating(v as PillarRating)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pillarOptions.map(opt => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      <Badge variant="outline" className={`${getPillarBadgeStyle(opt)} text-xs`}>
                        {opt}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Process */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="h-3.5 w-3.5 text-chart-2" />
                <Label className="text-xs">Process (Investment Strategy)</Label>
              </div>
              <Select value={processRating} onValueChange={(v) => setProcessRating(v as PillarRating)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pillarOptions.map(opt => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      <Badge variant="outline" className={`${getPillarBadgeStyle(opt)} text-xs`}>
                        {opt}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parent */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-chart-3" />
                <Label className="text-xs">Parent (Fund House)</Label>
              </div>
              <Select value={parentRating} onValueChange={(v) => setParentRating(v as PillarRating)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pillarOptions.map(opt => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      <Badge variant="outline" className={`${getPillarBadgeStyle(opt)} text-xs`}>
                        {opt}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Performance */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-chart-4" />
                <Label className="text-xs">Performance (Track Record)</Label>
              </div>
              <Select value={performanceRating} onValueChange={(v) => setPerformanceRating(v as PillarRating)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pillarOptions.map(opt => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      <Badge variant="outline" className={`${getPillarBadgeStyle(opt)} text-xs`}>
                        {opt}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-chart-5" />
                <Label className="text-xs">Price (Fee Competitiveness)</Label>
              </div>
              <Select value={priceRating} onValueChange={(v) => setPriceRating(v as PillarRating)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pillarOptions.map(opt => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      <Badge variant="outline" className={`${getPillarBadgeStyle(opt)} text-xs`}>
                        {opt}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Summary Preview */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-chart-2/5 border border-border/50 space-y-3">
            <Label className="text-sm font-semibold">Rating Summary</Label>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={`h-4 w-4 ${s <= starRating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <Badge className={`${getAnalystBadgeStyle(analystRating)} border`}>
                {analystRating}
              </Badge>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {[
                { label: 'People', value: peopleRating },
                { label: 'Process', value: processRating },
                { label: 'Parent', value: parentRating },
                { label: 'Perf', value: performanceRating },
                { label: 'Price', value: priceRating }
              ].map((pillar) => (
                <div key={pillar.label} className="space-y-1">
                  <div className={`h-2 rounded-full ${
                    pillar.value === 'High' || pillar.value === 'Above Average' 
                      ? 'bg-emerald-500' 
                      : pillar.value === 'Average' 
                        ? 'bg-muted-foreground/40' 
                        : 'bg-amber-500'
                  }`} />
                  <span className="text-[10px] text-muted-foreground">{pillar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            className="w-full bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Ratings
          </Button>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
