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
import { allFunds, propertyFunds } from "@/data/funds";

type AnalystRating = 'Gold' | 'Silver' | 'Bronze' | 'Neutral' | 'Negative';

// Extended fund type with ratings for admin
interface AdminFund extends IngestibleFund {
  ratings?: FundRatings;
}

export function FundScoringAdmin() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFund, setSelectedFund] = useState<AdminFund | null>(null);
  const [fundCategoryFilter, setFundCategoryFilter] = useState<'all' | 'standard' | 'property'>('all');
  
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

  // Filter funds based on search and category
  const filteredFunds = useMemo(() => {
    let fundsToFilter = allFunds;
    
    // Filter by category first
    if (fundCategoryFilter === 'property') {
      fundsToFilter = allFunds.filter(f => f.fundCategory === 'property');
    } else if (fundCategoryFilter === 'standard') {
      fundsToFilter = allFunds.filter(f => f.fundCategory !== 'property');
    }
    
    const fundsWithRatings: AdminFund[] = fundsToFilter.map(f => ({ ...f, ratings: undefined }));
    if (!searchQuery) return fundsWithRatings.slice(0, 30);
    const query = searchQuery.toLowerCase();
    return fundsWithRatings.filter(f => 
      f.fundName.toLowerCase().includes(query) || 
      f.isin.toLowerCase().includes(query) ||
      f.managementCompany.toLowerCase().includes(query) ||
      (f.subcategory?.toLowerCase().includes(query))
    ).slice(0, 30);
  }, [searchQuery, fundCategoryFilter]);

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
      'Gold': 'bg-amber-100 text-amber-700 border-amber-300',
      'Silver': 'bg-slate-100 text-slate-700 border-slate-300',
      'Bronze': 'bg-orange-100 text-orange-700 border-orange-300',
      'Neutral': 'bg-gray-100 text-gray-600 border-gray-300',
      'Negative': 'bg-red-100 text-red-700 border-red-300'
    };
    return styles[rating];
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-600';
    if (score >= 3) return 'text-blue-600';
    if (score >= 2) return 'text-amber-600';
    return 'text-red-600';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fund Selection Panel */}
        <Card className="border border-gray-200 shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
            <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
                <Search className="h-4 w-4 text-white" />
              </div>
              Select Fund
            </CardTitle>
            <CardDescription className="text-gray-500">
              Search and select a fund to rate
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {/* Category Filter */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              <Button
                size="sm"
                variant={fundCategoryFilter === 'all' ? 'default' : 'ghost'}
                onClick={() => setFundCategoryFilter('all')}
                className={`flex-1 text-xs rounded-lg transition-all ${fundCategoryFilter === 'all' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={fundCategoryFilter === 'standard' ? 'default' : 'ghost'}
                onClick={() => setFundCategoryFilter('standard')}
                className={`flex-1 text-xs rounded-lg transition-all ${fundCategoryFilter === 'standard' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Standard
              </Button>
              <Button
                size="sm"
                variant={fundCategoryFilter === 'property' ? 'default' : 'ghost'}
                onClick={() => setFundCategoryFilter('property')}
                className={`flex-1 text-xs rounded-lg transition-all ${fundCategoryFilter === 'property' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Property
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, ISIN, or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
              />
            </div>
            
            <ScrollArea className="h-[450px] pr-2">
              <div className="space-y-2">
                {filteredFunds.map((fund) => (
                  <div
                    key={fund.isin}
                    onClick={() => handleSelectFund(fund)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      selectedFund?.isin === fund.isin
                        ? 'bg-amber-50 border-amber-400 shadow-md'
                        : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-900 line-clamp-1">{fund.fundName}</p>
                      {fund.fundCategory === 'property' && (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">
                          Property
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{fund.isin} • {fund.managementCompany}</p>
                    {fund.subcategory && (
                      <p className="text-xs text-gray-400 mt-1">{fund.subcategory}</p>
                    )}
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
        <Card className="lg:col-span-2 border border-gray-200 shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-amber-50 via-white to-blue-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Analyst Assessment Panel</CardTitle>
                  <CardDescription className="text-gray-500">Fund research & ratings input</CardDescription>
                </div>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={!selectedFund}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl px-6"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Ratings
              </Button>
            </div>
            
            {/* Selected Fund Info */}
            {selectedFund && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-amber-50/50 border border-gray-200">
                <p className="font-semibold text-sm text-gray-900 line-clamp-1">{selectedFund.fundName}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedFund.isin} • {selectedFund.managementCompany}</p>
                {selectedFund.ratings?.lastAnalystReviewDate && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
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
                <TabsList className="w-full grid grid-cols-3 mx-4 mt-4 bg-gray-100 rounded-xl p-1" style={{ width: 'calc(100% - 2rem)' }}>
                  <TabsTrigger value="rating" className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Rating
                  </TabsTrigger>
                  <TabsTrigger value="conviction" className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                    <ChartBar className="h-3 w-3 mr-1" />
                    Conviction
                  </TabsTrigger>
                  <TabsTrigger value="commentary" className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">
                    <FileText className="h-3 w-3 mr-1" />
                    Commentary
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Forward-Looking Medalist Rating */}
                <TabsContent value="rating" className="p-5 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-amber-600" />
                      </div>
                      <Label className="text-sm font-semibold text-gray-900">Forward-Looking Analyst Rating</Label>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Qualitative forward-looking assessment of the fund's ability to outperform its category benchmark on a risk-adjusted basis.
                    </p>
                    
                    <div className="grid grid-cols-5 gap-3">
                      {analystOptions.map((rating) => (
                        <Button
                          key={rating}
                          variant="outline"
                          size="sm"
                          className={`flex flex-col items-center gap-2 h-auto py-4 rounded-xl transition-all ${
                            analystRating === rating 
                              ? getAnalystBadgeStyle(rating) + ' border-2 ring-2 ring-amber-200 shadow-md' 
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:border-gray-300'
                          }`}
                          onClick={() => setAnalystRating(rating)}
                        >
                          <span className="text-2xl">
                            {rating === 'Gold' && '🥇'}
                            {rating === 'Silver' && '🥈'}
                            {rating === 'Bronze' && '🥉'}
                            {rating === 'Neutral' && '⚪'}
                            {rating === 'Negative' && '🔴'}
                          </span>
                          <span className="text-xs font-semibold">{rating}</span>
                        </Button>
                      ))}
                    </div>

                    <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-amber-50/30 border border-gray-200 space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        Rating Definitions
                      </h4>
                      <div className="space-y-2 text-xs text-gray-600">
                        <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400"></span><span className="font-semibold text-amber-600">Gold:</span> Best ideas with highest conviction</p>
                        <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400"></span><span className="font-semibold text-slate-600">Silver:</span> Strong prospect of outperformance</p>
                        <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400"></span><span className="font-semibold text-orange-600">Bronze:</span> Above-average potential</p>
                        <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-400"></span><span className="font-semibold text-gray-600">Neutral:</span> Average expectations</p>
                        <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400"></span><span className="font-semibold text-red-600">Negative:</span> Structural issues or concerns</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Conviction Scores */}
                <TabsContent value="conviction" className="p-5 space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <ChartBar className="h-4 w-4 text-blue-600" />
                        </div>
                        <Label className="text-sm font-semibold text-gray-900">Analyst Conviction Scores</Label>
                      </div>
                      <Badge variant="outline" className={`${getScoreColor(overallConvictionScore)} border-current px-3 py-1`}>
                        Overall: {overallConvictionScore.toFixed(1)} / 5
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Score each pillar from 0 (lowest) to 5 (highest). The overall conviction score is automatically calculated.
                    </p>

                    {/* Score Sliders */}
                    {[
                      { label: 'People', icon: Users, value: peopleScore, setter: setPeopleScore, color: 'text-purple-600', bgColor: 'bg-purple-100', desc: 'Quality of investment team, experience, stability' },
                      { label: 'Process', icon: Settings, value: processScore, setter: setProcessScore, color: 'text-blue-600', bgColor: 'bg-blue-100', desc: 'Investment process clarity, repeatability, risk management' },
                      { label: 'Parent', icon: Building2, value: parentScore, setter: setParentScore, color: 'text-emerald-600', bgColor: 'bg-emerald-100', desc: 'Fund house stewardship, alignment with investors' },
                      { label: 'Price', icon: DollarSign, value: priceScore, setter: setPriceScore, color: 'text-amber-600', bgColor: 'bg-amber-100', desc: 'Fee competitiveness relative to peers' },
                    ].map(({ label, icon: Icon, value, setter, color, bgColor, desc }) => (
                      <div key={label} className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg ${bgColor} flex items-center justify-center`}>
                              <Icon className={`h-4 w-4 ${color}`} />
                            </div>
                            <Label className="text-sm font-semibold text-gray-900">{label}</Label>
                          </div>
                          <span className={`text-lg font-bold ${getScoreColor(value)}`}>
                            {value.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 ml-11">{desc}</p>
                        <Slider
                          value={[value]}
                          onValueChange={(v) => setter(v[0])}
                          max={5}
                          min={0}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 px-1">
                          <span>0 - Poor</span>
                          <span>2.5 - Average</span>
                          <span>5 - Excellent</span>
                        </div>
                      </div>
                    ))}

                    {/* Overall Score Summary */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 via-white to-blue-50 border border-amber-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-sm font-semibold text-gray-900">Overall Analyst Conviction Score</Label>
                        <div className="text-right">
                          <span className={`text-3xl font-bold ${getScoreColor(overallConvictionScore)}`}>
                            {overallConvictionScore.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-400"> / 5</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all shadow-sm ${
                              overallConvictionScore >= 4 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                              overallConvictionScore >= 3 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                              overallConvictionScore >= 2 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            style={{ width: `${(overallConvictionScore / 5) * 100}%` }}
                          />
                        </div>
                        <Badge className={`${getScoreColor(overallConvictionScore)} bg-white border shadow-sm px-3`}>
                          {getScoreLabel(overallConvictionScore)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: Analyst Written Commentary */}
                <TabsContent value="commentary" className="p-5 space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-emerald-600" />
                      </div>
                      <Label className="text-sm font-semibold text-gray-900">Analyst Written Commentary</Label>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Provide detailed qualitative analysis for each section.
                    </p>

                    {/* Commentary Fields */}
                    {[
                      { label: 'Investment Thesis', icon: TrendingUp, value: investmentThesis, setter: setInvestmentThesis, color: 'text-blue-600', bgColor: 'bg-blue-100', placeholder: 'Describe the core investment case...' },
                      { label: 'Strengths', icon: Star, value: strengths, setter: setStrengths, color: 'text-emerald-600', bgColor: 'bg-emerald-100', placeholder: 'Key competitive advantages and positive attributes...' },
                      { label: 'Risks', icon: AlertTriangle, value: risks, setter: setRisks, color: 'text-red-600', bgColor: 'bg-red-100', placeholder: 'Potential risks and concerns...' },
                      { label: 'Suitable Investor Type', icon: Target, value: suitableInvestorType, setter: setSuitableInvestorType, color: 'text-purple-600', bgColor: 'bg-purple-100', placeholder: 'Best suited for which investor profile...' },
                      { label: 'Key Watchpoints', icon: Eye, value: keyWatchpoints, setter: setKeyWatchpoints, color: 'text-amber-600', bgColor: 'bg-amber-100', placeholder: 'Areas to monitor going forward...' },
                    ].map(({ label, icon: Icon, value, setter, color, bgColor, placeholder }) => (
                      <div key={label} className="space-y-2 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg ${bgColor} flex items-center justify-center`}>
                            <Icon className={`h-4 w-4 ${color}`} />
                          </div>
                          <Label className="text-sm font-semibold text-gray-900">{label}</Label>
                        </div>
                        <Textarea
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          placeholder={placeholder}
                          rows={3}
                          className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 resize-none rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-[550px] text-center bg-gradient-to-br from-gray-50 to-amber-50/30">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-6 shadow-lg">
                <Star className="h-10 w-10 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Fund</h3>
              <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                Search and select a fund from the list on the left to begin entering analyst ratings and commentary.
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}