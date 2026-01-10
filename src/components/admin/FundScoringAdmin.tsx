import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  FileText,
  TrendingUp,
  AlertTriangle,
  Target,
  Eye,
  Clock,
  ChartBar,
  Search
} from "lucide-react";
import type { FundRatings } from "@/types/fund";
import type { IngestibleFund } from "@/types/fundIngestion";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { allFunds } from "@/data/funds";

type AnalystRating = 'Gold' | 'Silver' | 'Bronze' | 'Neutral' | 'Negative';

// Extended fund type with ratings for admin
interface AdminFund extends IngestibleFund {
  ratings?: FundRatings;
}

export function FundScoringAdmin() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFund, setSelectedFund] = useState<AdminFund | null>(null);
  
  // Forward-Looking Medalist Rating
  const [analystRating, setAnalystRating] = useState<AnalystRating>('Neutral');
  
  // Conviction Scores (0-5 sliders)
  const [peopleScore, setPeopleScore] = useState<number>(2.5);
  const [processScore, setProcessScore] = useState<number>(2.5);
  const [parentScore, setParentScore] = useState<number>(2.5);
  const [priceScore, setPriceScore] = useState<number>(2.5);
  
  // Analyst Written Commentary
  const [investmentThesis, setInvestmentThesis] = useState('');
  const [strengths, setStrengths] = useState('');
  const [risks, setRisks] = useState('');
  const [suitableInvestorType, setSuitableInvestorType] = useState('');
  const [keyWatchpoints, setKeyWatchpoints] = useState('');

  // Filter funds based on search
  const filteredFunds = useMemo(() => {
    const fundsWithRatings: AdminFund[] = allFunds.map(f => ({ ...f, ratings: undefined }));
    if (!searchQuery) return fundsWithRatings.slice(0, 20);
    const query = searchQuery.toLowerCase();
    return fundsWithRatings.filter(f => 
      f.fundName.toLowerCase().includes(query) || 
      f.isin.toLowerCase().includes(query) ||
      f.managementCompany.toLowerCase().includes(query)
    ).slice(0, 20);
  }, [searchQuery]);

  // Auto-calculate overall conviction score
  const overallConvictionScore = useMemo(() => {
    return Number(((peopleScore + processScore + parentScore + priceScore) / 4).toFixed(2));
  }, [peopleScore, processScore, parentScore, priceScore]);

  const handleSelectFund = (fund: AdminFund) => {
    setSelectedFund(fund);
    const existingRatings = fund.ratings || {};
    setAnalystRating(existingRatings.analystRating || 'Neutral');
    setPeopleScore(existingRatings.peopleScore ?? 2.5);
    setProcessScore(existingRatings.processScore ?? 2.5);
    setParentScore(existingRatings.parentScore ?? 2.5);
    setPriceScore(existingRatings.priceScore ?? 2.5);
    setInvestmentThesis(existingRatings.investmentThesis || '');
    setStrengths(existingRatings.strengths || '');
    setRisks(existingRatings.risks || '');
    setSuitableInvestorType(existingRatings.suitableInvestorType || '');
    setKeyWatchpoints(existingRatings.keyWatchpoints || '');
  };

  const handleSave = () => {
    if (!selectedFund) return;
    
    const now = new Date().toISOString();
    const newRatings: FundRatings = {
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
    
    // In a real implementation, this would save to database
    console.log('Saving ratings for', selectedFund.isin, newRatings);
    toast({
      title: "Analyst ratings saved",
      description: `Updated analyst assessment for ${selectedFund.fundName}`,
    });
  };

  const getAnalystBadgeStyle = (rating: AnalystRating) => {
    const styles: Record<AnalystRating, string> = {
      'Gold': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      'Silver': 'bg-slate-400/20 text-slate-300 border-slate-400/40',
      'Bronze': 'bg-orange-600/20 text-orange-400 border-orange-600/40',
      'Neutral': 'bg-zinc-700 text-zinc-300 border-zinc-600',
      'Negative': 'bg-red-500/20 text-red-400 border-red-500/40'
    };
    return styles[rating];
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-400';
    if (score >= 3) return 'text-blue-400';
    if (score >= 2) return 'text-amber-400';
    return 'text-red-400';
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Fund Selection Panel */}
      <Card className="border-white/10 shadow-2xl bg-gradient-to-br from-zinc-950 to-black backdrop-blur-xl">
        <CardHeader className="border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-transparent">
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <Search className="h-5 w-5 text-amber-400" />
            Select Fund
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Search and select a fund to rate
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by name, ISIN, or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredFunds.map((fund) => (
                <div
                  key={fund.isin}
                  onClick={() => handleSelectFund(fund)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    selectedFund?.isin === fund.isin
                      ? 'bg-amber-500/20 border-amber-500/50'
                      : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50'
                  }`}
                >
                  <p className="font-medium text-sm text-white line-clamp-1">{fund.fundName}</p>
                  <p className="text-xs text-zinc-400">{fund.isin} • {fund.managementCompany}</p>
                  {fund.ratings?.analystRating && (
                    <Badge className={`mt-2 text-xs ${getAnalystBadgeStyle(fund.ratings.analystRating)}`}>
                      {fund.ratings.analystRating}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Scoring Panel */}
      <Card className="lg:col-span-2 border-white/10 shadow-2xl bg-gradient-to-br from-zinc-950 to-black backdrop-blur-xl">
        <CardHeader className="border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Analyst Assessment Panel</CardTitle>
                <CardDescription className="text-zinc-400">Fund research & ratings input</CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={!selectedFund}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Ratings
            </Button>
          </div>
          
          {/* Selected Fund Info */}
          {selectedFund && (
            <div className="mt-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <p className="font-medium text-sm text-white line-clamp-1">{selectedFund.fundName}</p>
              <p className="text-xs text-zinc-400">{selectedFund.isin} • {selectedFund.managementCompany}</p>
              {selectedFund.ratings?.lastAnalystReviewDate && (
                <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                  <Clock className="h-3 w-3" />
                  <span>Last Analyst Review: {format(new Date(selectedFund.ratings.lastAnalystReviewDate), 'dd MMM yyyy, HH:mm')}</span>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        
        {selectedFund ? (
          <ScrollArea className="h-[550px]">
            <Tabs defaultValue="rating" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mx-4 mt-4 bg-zinc-900" style={{ width: 'calc(100% - 2rem)' }}>
                <TabsTrigger value="rating" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
                  <Shield className="h-3 w-3 mr-1" />
                  Rating
                </TabsTrigger>
                <TabsTrigger value="conviction" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
                  <ChartBar className="h-3 w-3 mr-1" />
                  Conviction
                </TabsTrigger>
                <TabsTrigger value="commentary" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
                  <FileText className="h-3 w-3 mr-1" />
                  Commentary
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Forward-Looking Medalist Rating */}
              <TabsContent value="rating" className="p-4 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-400" />
                    <Label className="text-sm font-semibold text-white">Forward-Looking Analyst Rating</Label>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Qualitative forward-looking assessment of the fund's ability to outperform its category benchmark on a risk-adjusted basis.
                  </p>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {analystOptions.map((rating) => (
                      <Button
                        key={rating}
                        variant="outline"
                        size="sm"
                        className={`flex flex-col items-center gap-1 h-auto py-3 ${
                          analystRating === rating 
                            ? getAnalystBadgeStyle(rating) + ' border-2 ring-2 ring-amber-500/20' 
                            : 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
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

                  <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-2">
                    <h4 className="text-sm font-medium text-white">Rating Definitions</h4>
                    <div className="space-y-1 text-xs text-zinc-400">
                      <p><span className="font-medium text-amber-400">Gold:</span> Best ideas with highest conviction</p>
                      <p><span className="font-medium text-slate-300">Silver:</span> Strong prospect of outperformance</p>
                      <p><span className="font-medium text-orange-400">Bronze:</span> Above-average potential</p>
                      <p><span className="font-medium text-zinc-300">Neutral:</span> Average expectations</p>
                      <p><span className="font-medium text-red-400">Negative:</span> Structural issues or concerns</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Conviction Scores */}
              <TabsContent value="conviction" className="p-4 space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChartBar className="h-5 w-5 text-blue-400" />
                      <Label className="text-sm font-semibold text-white">Analyst Conviction Scores</Label>
                    </div>
                    <Badge variant="outline" className={`${getScoreColor(overallConvictionScore)} border-current`}>
                      Overall: {overallConvictionScore.toFixed(1)} / 5
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Score each pillar from 0 (lowest) to 5 (highest). The overall conviction score is automatically calculated.
                  </p>

                  {/* Score Sliders */}
                  {[
                    { label: 'People', icon: Users, value: peopleScore, setter: setPeopleScore, color: 'text-purple-400', desc: 'Quality of investment team, experience, stability' },
                    { label: 'Process', icon: Settings, value: processScore, setter: setProcessScore, color: 'text-blue-400', desc: 'Investment process clarity, repeatability, risk management' },
                    { label: 'Parent', icon: Building2, value: parentScore, setter: setParentScore, color: 'text-green-400', desc: 'Fund house stewardship, alignment with investors' },
                    { label: 'Price', icon: DollarSign, value: priceScore, setter: setPriceScore, color: 'text-amber-400', desc: 'Fee competitiveness relative to peers' },
                  ].map(({ label, icon: Icon, value, setter, color, desc }) => (
                    <div key={label} className="space-y-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${color}`} />
                          <Label className="text-sm font-medium text-white">{label}</Label>
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(value)}`}>
                          {value.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">{desc}</p>
                      <Slider
                        value={[value]}
                        onValueChange={(v) => setter(v[0])}
                        max={5}
                        min={0}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-600">
                        <span>0 - Poor</span>
                        <span>2.5 - Average</span>
                        <span>5 - Excellent</span>
                      </div>
                    </div>
                  ))}

                  {/* Overall Score Summary */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-semibold text-white">Overall Analyst Conviction Score</Label>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${getScoreColor(overallConvictionScore)}`}>
                          {overallConvictionScore.toFixed(1)}
                        </span>
                        <span className="text-sm text-zinc-400"> / 5</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            overallConvictionScore >= 4 ? 'bg-emerald-500' :
                            overallConvictionScore >= 3 ? 'bg-blue-500' :
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
                    <FileText className="h-5 w-5 text-green-400" />
                    <Label className="text-sm font-semibold text-white">Analyst Written Commentary</Label>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Provide detailed qualitative analysis for each section.
                  </p>

                  {/* Commentary Fields */}
                  {[
                    { label: 'Investment Thesis', icon: TrendingUp, value: investmentThesis, setter: setInvestmentThesis, color: 'text-blue-400', placeholder: 'Describe the core investment case...' },
                    { label: 'Strengths', icon: Star, value: strengths, setter: setStrengths, color: 'text-emerald-400', placeholder: 'Key competitive advantages and positive attributes...' },
                    { label: 'Risks', icon: AlertTriangle, value: risks, setter: setRisks, color: 'text-red-400', placeholder: 'Potential risks and concerns...' },
                    { label: 'Suitable Investor Type', icon: Target, value: suitableInvestorType, setter: setSuitableInvestorType, color: 'text-purple-400', placeholder: 'Best suited for which investor profile...' },
                    { label: 'Key Watchpoints', icon: Eye, value: keyWatchpoints, setter: setKeyWatchpoints, color: 'text-amber-400', placeholder: 'Areas to monitor going forward...' },
                  ].map(({ label, icon: Icon, value, setter, color, placeholder }) => (
                    <div key={label} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <Label className="text-sm font-medium text-white">{label}</Label>
                      </div>
                      <Textarea
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        ) : (
          <CardContent className="flex flex-col items-center justify-center h-[550px] text-center">
            <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Select a Fund</h3>
            <p className="text-sm text-zinc-400 max-w-md">
              Search and select a fund from the list on the left to begin entering analyst ratings and commentary.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}