import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Save, 
  Bitcoin, 
  BarChart3, 
  Star, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  ChartBar,
  FileText,
  Users,
  Settings,
  Building2,
  Award,
  Target,
  AlertTriangle,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useCryptoData, useStockData, type CryptoData, type StockData } from "@/hooks/useRealTimeMarketData";

type AnalystRating = 'Gold' | 'Silver' | 'Bronze' | 'Neutral' | 'Negative';

interface RatingForm {
  analystRating: AnalystRating;
  scoreFundamentals: number;
  scoreTechnicals: number;
  scoreMomentum: number;
  scoreRisk: number;
  investmentThesis: string;
  strengths: string;
  risks: string;
  suitableInvestorType: string;
  keyWatchpoints: string;
  ratingRationale: string;
  isFeatured: boolean;
}

const initialRatingForm: RatingForm = {
  analystRating: 'Neutral',
  scoreFundamentals: 2.5,
  scoreTechnicals: 2.5,
  scoreMomentum: 2.5,
  scoreRisk: 2.5,
  investmentThesis: '',
  strengths: '',
  risks: '',
  suitableInvestorType: '',
  keyWatchpoints: '',
  ratingRationale: '',
  isFeatured: false,
};

export function StocksCryptoAdmin() {
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto'>('stocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockPage, setStockPage] = useState(1);
  const [cryptoPage, setCryptoPage] = useState(1);
  
  // Real-time data hooks
  const { data: stocksData, total: stocksTotal, loading: stocksLoading, refetch: refetchStocks } = useStockData(stockPage, 50);
  const { data: cryptoData, total: cryptoTotal, loading: cryptoLoading, refetch: refetchCrypto } = useCryptoData(cryptoPage, 100);
  
  // Selected asset for rating
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  
  // Rating form
  const [ratingForm, setRatingForm] = useState<RatingForm>(initialRatingForm);
  const [saving, setSaving] = useState(false);
  
  // Saved ratings from DB
  const [savedRatings, setSavedRatings] = useState<Record<string, any>>({});
  const [loadingRatings, setLoadingRatings] = useState(true);

  useEffect(() => {
    fetchSavedRatings();
  }, []);

  const fetchSavedRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('stocks_crypto')
        .select('*');

      if (error) throw error;
      
      const ratingsMap: Record<string, any> = {};
      (data || []).forEach(item => {
        ratingsMap[item.symbol] = item;
      });
      setSavedRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching saved ratings:', error);
    } finally {
      setLoadingRatings(false);
    }
  };

  // Filter assets based on search
  const filteredStocks = useMemo(() => {
    if (!searchQuery) return stocksData;
    const query = searchQuery.toLowerCase();
    return stocksData.filter(s => 
      s.symbol.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query) ||
      (s.sector?.toLowerCase().includes(query))
    );
  }, [stocksData, searchQuery]);

  const filteredCryptos = useMemo(() => {
    if (!searchQuery) return cryptoData;
    const query = searchQuery.toLowerCase();
    return cryptoData.filter(c => 
      c.symbol.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query)
    );
  }, [cryptoData, searchQuery]);

  // Auto-calculate overall score
  const overallScore = useMemo(() => {
    const scores = [ratingForm.scoreFundamentals, ratingForm.scoreTechnicals, ratingForm.scoreMomentum, ratingForm.scoreRisk];
    return Number((scores.reduce((a, b) => a + b, 0) / 4).toFixed(2));
  }, [ratingForm.scoreFundamentals, ratingForm.scoreTechnicals, ratingForm.scoreMomentum, ratingForm.scoreRisk]);

  const handleSelectStock = (stock: StockData) => {
    setSelectedStock(stock);
    setSelectedCrypto(null);
    
    // Load existing rating if available
    const existing = savedRatings[stock.symbol];
    if (existing) {
      setRatingForm({
        analystRating: existing.analyst_rating || 'Neutral',
        scoreFundamentals: existing.score_fundamentals || 2.5,
        scoreTechnicals: existing.score_technicals || 2.5,
        scoreMomentum: existing.score_momentum || 2.5,
        scoreRisk: existing.score_risk || 2.5,
        investmentThesis: existing.investment_thesis || '',
        strengths: existing.strengths || '',
        risks: existing.risks || '',
        suitableInvestorType: existing.suitable_investor_type || '',
        keyWatchpoints: existing.key_watchpoints || '',
        ratingRationale: existing.rating_rationale || '',
        isFeatured: existing.is_featured || false,
      });
    } else {
      setRatingForm(initialRatingForm);
    }
  };

  const handleSelectCrypto = (crypto: CryptoData) => {
    setSelectedCrypto(crypto);
    setSelectedStock(null);
    
    // Load existing rating if available
    const existing = savedRatings[crypto.symbol.toUpperCase()];
    if (existing) {
      setRatingForm({
        analystRating: existing.analyst_rating || 'Neutral',
        scoreFundamentals: existing.score_fundamentals || 2.5,
        scoreTechnicals: existing.score_technicals || 2.5,
        scoreMomentum: existing.score_momentum || 2.5,
        scoreRisk: existing.score_risk || 2.5,
        investmentThesis: existing.investment_thesis || '',
        strengths: existing.strengths || '',
        risks: existing.risks || '',
        suitableInvestorType: existing.suitable_investor_type || '',
        keyWatchpoints: existing.key_watchpoints || '',
        ratingRationale: existing.rating_rationale || '',
        isFeatured: existing.is_featured || false,
      });
    } else {
      setRatingForm(initialRatingForm);
    }
  };

  const handleSave = async () => {
    const asset = selectedStock || selectedCrypto;
    if (!asset) return;

    setSaving(true);
    try {
      const symbol = selectedStock ? selectedStock.symbol : selectedCrypto!.symbol.toUpperCase();
      const name = selectedStock ? selectedStock.name : selectedCrypto!.name;
      const assetType = selectedStock ? 'stock' : 'crypto';
      
      const payload = {
        symbol,
        name,
        asset_type: assetType,
        current_price: selectedStock ? selectedStock.currentPrice : selectedCrypto!.currentPrice,
        market_cap: selectedStock ? selectedStock.marketCap : selectedCrypto!.marketCap,
        price_change_24h: selectedStock ? selectedStock.changePercent : selectedCrypto!.priceChange24h,
        exchange: selectedStock?.exchange || null,
        sector: selectedStock?.sector || null,
        analyst_rating: ratingForm.analystRating,
        rating_rationale: ratingForm.ratingRationale,
        score_fundamentals: ratingForm.scoreFundamentals,
        score_technicals: ratingForm.scoreTechnicals,
        score_momentum: ratingForm.scoreMomentum,
        score_risk: ratingForm.scoreRisk,
        overall_score: overallScore,
        investment_thesis: ratingForm.investmentThesis,
        strengths: ratingForm.strengths,
        risks: ratingForm.risks,
        suitable_investor_type: ratingForm.suitableInvestorType,
        key_watchpoints: ratingForm.keyWatchpoints,
        is_featured: ratingForm.isFeatured,
        status: 'published',
        logo_url: selectedCrypto?.image || null,
      };

      // Check if exists
      const existing = savedRatings[symbol];
      
      if (existing) {
        const { error } = await supabase
          .from('stocks_crypto')
          .update(payload)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('stocks_crypto')
          .insert([payload]);
        if (error) throw error;
      }

      toast.success(`${name} ratings saved successfully`);
      fetchSavedRatings();
    } catch (error: any) {
      console.error('Error saving rating:', error);
      toast.error(error.message || 'Failed to save rating');
    } finally {
      setSaving(false);
    }
  };

  const getAnalystBadgeStyle = (rating: AnalystRating) => {
    const styles: Record<AnalystRating, string> = {
      'Gold': 'bg-amber-500/20 text-amber-600 border-amber-500/40',
      'Silver': 'bg-slate-400/20 text-slate-600 border-slate-400/40',
      'Bronze': 'bg-orange-600/20 text-orange-600 border-orange-600/40',
      'Neutral': 'bg-slate-200 text-slate-600 border-slate-300',
      'Negative': 'bg-red-500/20 text-red-600 border-red-500/40'
    };
    return styles[rating];
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-600';
    if (score >= 3) return 'text-blue-600';
    if (score >= 2) return 'text-amber-600';
    return 'text-red-600';
  };

  const analystOptions: AnalystRating[] = ['Gold', 'Silver', 'Bronze', 'Neutral', 'Negative'];

  const formatPrice = (price: number) => {
    if (price >= 1) return `£${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `£${price.toFixed(6)}`;
  };

  const formatMarketCap = (cap: number | null) => {
    if (!cap) return 'N/A';
    if (cap >= 1e12) return `£${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `£${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `£${(cap / 1e6).toFixed(2)}M`;
    return `£${cap.toLocaleString()}`;
  };

  const stockTotalPages = Math.ceil(stocksTotal / 50);
  const cryptoTotalPages = Math.ceil(cryptoTotal / 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Asset Selection Panel */}
      <Card className="border-slate-200 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
            <Search className="h-5 w-5 text-blue-600" />
            Select Asset
          </CardTitle>
          <CardDescription className="text-slate-500">
            {activeTab === 'stocks' ? `${stocksTotal.toLocaleString()} stocks available` : `${cryptoTotal.toLocaleString()} cryptocurrencies available`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Asset Type Toggle */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
            <Button
              size="sm"
              variant={activeTab === 'stocks' ? 'default' : 'ghost'}
              onClick={() => { setActiveTab('stocks'); setSearchQuery(''); }}
              className={`flex-1 ${activeTab === 'stocks' ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Stocks ({stocksTotal})
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'crypto' ? 'default' : 'ghost'}
              onClick={() => { setActiveTab('crypto'); setSearchQuery(''); }}
              className={`flex-1 ${activeTab === 'crypto' ? 'bg-amber-600 hover:bg-amber-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Bitcoin className="h-4 w-4 mr-1" />
              Crypto ({cryptoTotal})
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>

          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => activeTab === 'stocks' ? refetchStocks() : refetchCrypto()}
            disabled={stocksLoading || cryptoLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(stocksLoading || cryptoLoading) ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>

          {/* Asset List */}
          <ScrollArea className="h-[400px]">
            {activeTab === 'stocks' ? (
              stocksLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => handleSelectStock(stock)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedStock?.symbol === stock.symbol
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{stock.symbol}</span>
                          {savedRatings[stock.symbol] && (
                            <Badge className={`text-[10px] ${getAnalystBadgeStyle(savedRatings[stock.symbol].analyst_rating)}`}>
                              {savedRatings[stock.symbol].analyst_rating}
                            </Badge>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${stock.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{stock.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-slate-900">{formatPrice(stock.currentPrice)}</span>
                        {stock.sector && (
                          <span className="text-[10px] text-slate-400">{stock.sector}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              cryptoLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCryptos.map((crypto) => (
                    <div
                      key={crypto.id}
                      onClick={() => handleSelectCrypto(crypto)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedCrypto?.id === crypto.id
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {crypto.image && (
                            <img src={crypto.image} alt={crypto.name} className="h-5 w-5 rounded-full" />
                          )}
                          <span className="font-bold text-sm text-slate-900">{crypto.symbol.toUpperCase()}</span>
                          {savedRatings[crypto.symbol.toUpperCase()] && (
                            <Badge className={`text-[10px] ${getAnalystBadgeStyle(savedRatings[crypto.symbol.toUpperCase()].analyst_rating)}`}>
                              {savedRatings[crypto.symbol.toUpperCase()].analyst_rating}
                            </Badge>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${crypto.priceChange24h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {crypto.priceChange24h >= 0 ? '+' : ''}{crypto.priceChange24h.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{crypto.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-slate-900">{formatPrice(crypto.currentPrice)}</span>
                        <span className="text-[10px] text-slate-400">#{crypto.marketCapRank}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </ScrollArea>

          {/* Pagination */}
          {activeTab === 'stocks' && stockTotalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStockPage(p => Math.max(1, p - 1))}
                disabled={stockPage === 1 || stocksLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-500">
                Page {stockPage} of {stockTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStockPage(p => Math.min(stockTotalPages, p + 1))}
                disabled={stockPage === stockTotalPages || stocksLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {activeTab === 'crypto' && cryptoTotalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCryptoPage(p => Math.max(1, p - 1))}
                disabled={cryptoPage === 1 || cryptoLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-500">
                Page {cryptoPage} of {cryptoTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCryptoPage(p => Math.min(cryptoTotalPages, p + 1))}
                disabled={cryptoPage === cryptoTotalPages || cryptoLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Panel */}
      <Card className="lg:col-span-2 border-slate-200 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shadow-lg ${
                activeTab === 'stocks' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-br from-amber-500 to-amber-600'
              }`}>
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">Analyst Assessment Panel</CardTitle>
                <CardDescription className="text-slate-500">Rate and provide commentary on assets</CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={(!selectedStock && !selectedCrypto) || saving}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Ratings
            </Button>
          </div>

          {/* Selected Asset Info */}
          {(selectedStock || selectedCrypto) && (
            <div className="mt-4 p-3 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-3">
                {selectedCrypto?.image && (
                  <img src={selectedCrypto.image} alt={selectedCrypto.name} className="h-8 w-8 rounded-full" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">
                    {selectedStock?.name || selectedCrypto?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedStock?.symbol || selectedCrypto?.symbol.toUpperCase()} • 
                    {formatPrice(selectedStock?.currentPrice || selectedCrypto?.currentPrice || 0)} • 
                    MCap: {formatMarketCap(selectedStock?.marketCap || selectedCrypto?.marketCap || null)}
                  </p>
                </div>
                <div className={`flex items-center gap-1 ${
                  (selectedStock?.changePercent || selectedCrypto?.priceChange24h || 0) >= 0 
                    ? 'text-emerald-600' 
                    : 'text-red-600'
                }`}>
                  {(selectedStock?.changePercent || selectedCrypto?.priceChange24h || 0) >= 0 
                    ? <TrendingUp className="h-4 w-4" /> 
                    : <TrendingDown className="h-4 w-4" />
                  }
                  <span className="font-medium text-sm">
                    {(selectedStock?.changePercent || selectedCrypto?.priceChange24h || 0) >= 0 ? '+' : ''}
                    {(selectedStock?.changePercent || selectedCrypto?.priceChange24h || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        {(selectedStock || selectedCrypto) ? (
          <ScrollArea className="h-[550px]">
            <Tabs defaultValue="rating" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mx-4 mt-4 bg-slate-100" style={{ width: 'calc(100% - 2rem)' }}>
                <TabsTrigger value="rating" className="text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  Rating
                </TabsTrigger>
                <TabsTrigger value="conviction" className="text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <ChartBar className="h-3 w-3 mr-1" />
                  Conviction
                </TabsTrigger>
                <TabsTrigger value="commentary" className="text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <FileText className="h-3 w-3 mr-1" />
                  Commentary
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Analyst Rating */}
              <TabsContent value="rating" className="p-4 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <Label className="text-sm font-semibold text-slate-900">Forward-Looking Analyst Rating</Label>
                  </div>
                  <p className="text-xs text-slate-500">
                    Qualitative assessment of the asset's potential for outperformance.
                  </p>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {analystOptions.map((rating) => (
                      <Button
                        key={rating}
                        variant="outline"
                        size="sm"
                        className={`flex flex-col items-center gap-1 h-auto py-3 ${
                          ratingForm.analystRating === rating 
                            ? getAnalystBadgeStyle(rating) + ' border-2 ring-2 ring-blue-200' 
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                        onClick={() => setRatingForm({ ...ratingForm, analystRating: rating })}
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

                  <div className="space-y-2">
                    <Label className="text-slate-700">Rating Rationale</Label>
                    <Textarea
                      value={ratingForm.ratingRationale}
                      onChange={(e) => setRatingForm({ ...ratingForm, ratingRationale: e.target.value })}
                      placeholder="Explain your rating decision..."
                      className="min-h-[100px] bg-white border-slate-200"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <Switch 
                      checked={ratingForm.isFeatured}
                      onCheckedChange={(checked) => setRatingForm({ ...ratingForm, isFeatured: checked })}
                    />
                    <div>
                      <Label className="text-slate-900">Featured Asset</Label>
                      <p className="text-xs text-slate-500">Show this asset prominently on the platform</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Conviction Scores */}
              <TabsContent value="conviction" className="p-4 space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChartBar className="h-5 w-5 text-blue-600" />
                      <Label className="text-sm font-semibold text-slate-900">Analyst Conviction Scores</Label>
                    </div>
                    <Badge variant="outline" className={`${getScoreColor(overallScore)} border-current`}>
                      Overall: {overallScore.toFixed(1)} / 5
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Score each factor from 0 (lowest) to 5 (highest).
                  </p>

                  {/* Score Sliders */}
                  {[
                    { label: 'Fundamentals', icon: Building2, value: ratingForm.scoreFundamentals, key: 'scoreFundamentals', color: 'text-purple-600', desc: 'Financial health, earnings, balance sheet' },
                    { label: 'Technicals', icon: Settings, value: ratingForm.scoreTechnicals, key: 'scoreTechnicals', color: 'text-blue-600', desc: 'Chart patterns, support/resistance, trends' },
                    { label: 'Momentum', icon: TrendingUp, value: ratingForm.scoreMomentum, key: 'scoreMomentum', color: 'text-green-600', desc: 'Price momentum, volume trends, sentiment' },
                    { label: 'Risk', icon: AlertTriangle, value: ratingForm.scoreRisk, key: 'scoreRisk', color: 'text-amber-600', desc: 'Volatility, downside protection (higher = lower risk)' },
                  ].map(({ label, icon: Icon, value, key, color, desc }) => (
                    <div key={label} className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${color}`} />
                          <span className="font-medium text-sm text-slate-900">{label}</span>
                        </div>
                        <span className={`text-lg font-bold ${getScoreColor(value)}`}>
                          {value.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{desc}</p>
                      <Slider
                        value={[value]}
                        onValueChange={(v) => setRatingForm({ ...ratingForm, [key]: v[0] })}
                        max={5}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Poor</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tab 3: Commentary */}
              <TabsContent value="commentary" className="p-4 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <Label className="text-sm font-semibold text-slate-900">Analyst Commentary</Label>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Investment Thesis
                    </Label>
                    <Textarea
                      value={ratingForm.investmentThesis}
                      onChange={(e) => setRatingForm({ ...ratingForm, investmentThesis: e.target.value })}
                      placeholder="Core investment rationale..."
                      className="min-h-[80px] bg-white border-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        Key Strengths
                      </Label>
                      <Textarea
                        value={ratingForm.strengths}
                        onChange={(e) => setRatingForm({ ...ratingForm, strengths: e.target.value })}
                        placeholder="Competitive advantages..."
                        className="min-h-[100px] bg-white border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Key Risks
                      </Label>
                      <Textarea
                        value={ratingForm.risks}
                        onChange={(e) => setRatingForm({ ...ratingForm, risks: e.target.value })}
                        placeholder="Potential downside risks..."
                        className="min-h-[100px] bg-white border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      Suitable Investor Type
                    </Label>
                    <Input
                      value={ratingForm.suitableInvestorType}
                      onChange={(e) => setRatingForm({ ...ratingForm, suitableInvestorType: e.target.value })}
                      placeholder="e.g., Growth investors, Risk-tolerant, Long-term holders..."
                      className="bg-white border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-amber-500" />
                      Key Watchpoints
                    </Label>
                    <Textarea
                      value={ratingForm.keyWatchpoints}
                      onChange={(e) => setRatingForm({ ...ratingForm, keyWatchpoints: e.target.value })}
                      placeholder="Important metrics or events to monitor..."
                      className="min-h-[80px] bg-white border-slate-200"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        ) : (
          <CardContent className="h-[550px] flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Select an Asset</p>
                <p className="text-sm text-slate-500">Choose a stock or cryptocurrency from the list to rate</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
