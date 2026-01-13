import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Bitcoin, 
  BarChart3, 
  Sparkles,
  ArrowUpDown,
  Bookmark,
  Download,
  ChevronRight,
  Activity,
  Target,
  Shield,
  Zap,
  Eye,
  Clock,
  Globe,
  Layers,
  RefreshCw,
  ExternalLink,
  Coins
} from "lucide-react";

interface StockCrypto {
  id: string;
  symbol: string;
  name: string;
  asset_type: string;
  description: string | null;
  current_price: number | null;
  price_currency: string | null;
  market_cap: number | null;
  volume_24h: number | null;
  price_change_24h: number | null;
  price_change_7d: number | null;
  price_change_30d: number | null;
  price_change_1y: number | null;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  pe_ratio: number | null;
  dividend_yield: number | null;
  blockchain: string | null;
  logo_url: string | null;
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
}

// Currency conversion rates (relative to USD)
const CURRENCY_RATES: Record<string, { rate: number; symbol: string; locale: string }> = {
  GBP: { rate: 0.79, symbol: '£', locale: 'en-GB' },
  USD: { rate: 1, symbol: '$', locale: 'en-US' },
  EUR: { rate: 0.92, symbol: '€', locale: 'de-DE' },
  JPY: { rate: 149.50, symbol: '¥', locale: 'ja-JP' },
  CHF: { rate: 0.88, symbol: 'CHF', locale: 'de-CH' },
  AUD: { rate: 1.53, symbol: 'A$', locale: 'en-AU' },
  CAD: { rate: 1.36, symbol: 'C$', locale: 'en-CA' },
};

export default function StocksCryptoDatabase() {
  const [assets, setAssets] = useState<StockCrypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("market_cap");
  const [selectedAsset, setSelectedAsset] = useState<StockCrypto | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("GBP");

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase
        .from('stocks_crypto')
        .select('*')
        .eq('status', 'published')
        .order('market_cap', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = assetTypeFilter === "all" || asset.asset_type === assetTypeFilter;
      const matchesSector = sectorFilter === "all" || asset.sector === sectorFilter;
      const matchesRating = ratingFilter === "all" || asset.analyst_rating === ratingFilter;
      return matchesSearch && matchesType && matchesSector && matchesRating;
    }).sort((a, b) => {
      switch (sortBy) {
        case "market_cap":
          return (b.market_cap || 0) - (a.market_cap || 0);
        case "price_change_24h":
          return (b.price_change_24h || 0) - (a.price_change_24h || 0);
        case "overall_score":
          return (Number(b.overall_score) || 0) - (Number(a.overall_score) || 0);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [assets, searchQuery, assetTypeFilter, sectorFilter, ratingFilter, sortBy]);

  const sectors = useMemo(() => [...new Set(assets.filter(a => a.sector).map(a => a.sector))], [assets]);

  const stats = useMemo(() => ({
    totalStocks: assets.filter(a => a.asset_type === 'stock').length,
    totalCrypto: assets.filter(a => a.asset_type === 'crypto').length,
    goldRated: assets.filter(a => a.analyst_rating === 'Gold').length,
    featured: assets.filter(a => a.is_featured).length,
    totalMarketCap: assets.reduce((sum, a) => sum + (a.market_cap || 0), 0),
  }), [assets]);

  const convertPrice = (valueInUSD: number | null): number | null => {
    if (!valueInUSD) return null;
    const currencyConfig = CURRENCY_RATES[selectedCurrency];
    return valueInUSD * currencyConfig.rate;
  };

  const formatCurrency = (value: number | null, originalCurrency = 'USD') => {
    if (!value) return '—';
    // Convert from original currency (assumed USD) to selected currency
    const convertedValue = convertPrice(value);
    if (!convertedValue) return '—';
    
    const currencyConfig = CURRENCY_RATES[selectedCurrency];
    return new Intl.NumberFormat(currencyConfig.locale, { 
      style: 'currency', 
      currency: selectedCurrency,
      minimumFractionDigits: convertedValue < 1 ? 4 : 2,
      maximumFractionDigits: convertedValue < 1 ? 6 : 2
    }).format(convertedValue);
  };

  const formatMarketCap = (value: number | null) => {
    if (!value) return '—';
    const convertedValue = convertPrice(value);
    if (!convertedValue) return '—';
    
    const symbol = CURRENCY_RATES[selectedCurrency].symbol;
    if (convertedValue >= 1e12) return `${symbol}${(convertedValue / 1e12).toFixed(2)}T`;
    if (convertedValue >= 1e9) return `${symbol}${(convertedValue / 1e9).toFixed(2)}B`;
    if (convertedValue >= 1e6) return `${symbol}${(convertedValue / 1e6).toFixed(2)}M`;
    return `${symbol}${convertedValue.toFixed(0)}`;
  };

  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return '—';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getRatingConfig = (rating: string | null) => {
    switch (rating) {
      case 'Gold': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', icon: '🏆' };
      case 'Silver': return { bg: 'bg-slate-400/10', text: 'text-slate-400', border: 'border-slate-400/20', icon: '🥈' };
      case 'Bronze': return { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', icon: '🥉' };
      case 'Neutral': return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', icon: '◉' };
      case 'Negative': return { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20', icon: '⚠' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', icon: '—' };
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 4) return 'text-success';
    if (score >= 3) return 'text-warning';
    if (score >= 2) return 'text-orange-500';
    return 'text-destructive';
  };

  const getScoreProgress = (score: number | null) => {
    if (!score) return 0;
    return (score / 5) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header Section */}
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/25">
                <Layers className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Securities Research Database
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  Institutional-grade analysis across {assets.length} securities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Currency Selector */}
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-[100px] bg-white border-slate-200 text-slate-700">
                  <Coins className="h-4 w-4 mr-1 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                  <SelectItem value="JPY">🇯🇵 JPY</SelectItem>
                  <SelectItem value="CHF">🇨🇭 CHF</SelectItem>
                  <SelectItem value="AUD">🇦🇺 AUD</SelectItem>
                  <SelectItem value="CAD">🇨🇦 CAD</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAssets}
                disabled={isRefreshing}
                className="gap-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-700">
                <Bookmark className="h-4 w-4" />
                Watchlist
              </Button>
              <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md shadow-primary/20">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-4">
          <StatsCard
            label="Equities"
            value={stats.totalStocks}
            icon={BarChart3}
            color="primary"
          />
          <StatsCard
            label="Digital Assets"
            value={stats.totalCrypto}
            icon={Bitcoin}
            color="warning"
          />
          <StatsCard
            label="Gold Rated"
            value={stats.goldRated}
            icon={Star}
            color="amber"
          />
          <StatsCard
            label="Featured"
            value={stats.featured}
            icon={Sparkles}
            color="purple"
          />
          <StatsCard
            label="Total Coverage"
            value={formatMarketCap(stats.totalMarketCap)}
            icon={Globe}
            color="success"
            isText
          />
        </div>

        {/* Filters */}
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or ticker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50/50 border-slate-200 focus:bg-white"
                />
              </div>
              <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
                <SelectTrigger className="w-[140px] bg-white border-slate-200">
                  <SelectValue placeholder="Asset Class" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="stock">Equities</SelectItem>
                  <SelectItem value="crypto">Digital Assets</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-[160px] bg-white border-slate-200">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector!}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px] bg-white border-slate-200">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="Gold">🏆 Gold</SelectItem>
                  <SelectItem value="Silver">🥈 Silver</SelectItem>
                  <SelectItem value="Bronze">🥉 Bronze</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="Negative">Negative</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] bg-white border-slate-200">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="market_cap">Market Cap</SelectItem>
                  <SelectItem value="price_change_24h">24h Performance</SelectItem>
                  <SelectItem value="overall_score">Analyst Score</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
              <Badge className="ml-auto bg-primary/10 text-primary border-0 font-medium">
                {filteredAssets.length} results
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 shadow-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
              All Securities
            </TabsTrigger>
            <TabsTrigger value="stocks" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md gap-2">
              <BarChart3 className="h-4 w-4" />
              Equities
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md gap-2">
              <Bitcoin className="h-4 w-4" />
              Digital Assets
            </TabsTrigger>
            <TabsTrigger value="top-rated" className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md gap-2">
              <Star className="h-4 w-4" />
              Top Rated
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <AssetTable
              assets={filteredAssets} 
              loading={loading}
              formatCurrency={formatCurrency}
              formatMarketCap={formatMarketCap}
              formatPercentage={formatPercentage}
              getRatingConfig={getRatingConfig}
              getScoreColor={getScoreColor}
              onSelectAsset={setSelectedAsset}
            />
          </TabsContent>

          <TabsContent value="stocks" className="mt-0">
            <AssetTable 
              assets={filteredAssets.filter(a => a.asset_type === 'stock')} 
              loading={loading}
              formatCurrency={formatCurrency}
              formatMarketCap={formatMarketCap}
              formatPercentage={formatPercentage}
              getRatingConfig={getRatingConfig}
              getScoreColor={getScoreColor}
              onSelectAsset={setSelectedAsset}
            />
          </TabsContent>

          <TabsContent value="crypto" className="mt-0">
            <AssetTable 
              assets={filteredAssets.filter(a => a.asset_type === 'crypto')} 
              loading={loading}
              formatCurrency={formatCurrency}
              formatMarketCap={formatMarketCap}
              formatPercentage={formatPercentage}
              getRatingConfig={getRatingConfig}
              getScoreColor={getScoreColor}
              onSelectAsset={setSelectedAsset}
            />
          </TabsContent>

          <TabsContent value="top-rated" className="mt-0">
            <AssetTable 
              assets={filteredAssets.filter(a => a.analyst_rating === 'Gold' || a.analyst_rating === 'Silver')} 
              loading={loading}
              formatCurrency={formatCurrency}
              formatMarketCap={formatMarketCap}
              formatPercentage={formatPercentage}
              getRatingConfig={getRatingConfig}
              getScoreColor={getScoreColor}
              onSelectAsset={setSelectedAsset}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Asset Detail Sheet */}
      <Sheet open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedAsset && (
            <AssetDetailPanel
              asset={selectedAsset}
              formatCurrency={formatCurrency}
              formatMarketCap={formatMarketCap}
              formatPercentage={formatPercentage}
              getRatingConfig={getRatingConfig}
              getScoreColor={getScoreColor}
              getScoreProgress={getScoreProgress}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: 'primary' | 'warning' | 'amber' | 'purple' | 'success';
  isText?: boolean;
}

function StatsCard({ label, value, icon: Icon, color, isText }: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/20',
    warning: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20',
    amber: 'bg-gradient-to-br from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/20',
    purple: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/20',
    success: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20',
  };

  return (
    <Card className="border-slate-200/80 bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
            <p className={`${isText ? 'text-xl' : 'text-3xl'} font-bold text-slate-900 mt-1`}>{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Asset Table Component
interface AssetTableProps {
  assets: StockCrypto[];
  loading: boolean;
  formatCurrency: (value: number | null, currency?: string) => string;
  formatMarketCap: (value: number | null) => string;
  formatPercentage: (value: number | null) => string;
  getRatingConfig: (rating: string | null) => { bg: string; text: string; border: string; icon: string };
  getScoreColor: (score: number | null) => string;
  onSelectAsset: (asset: StockCrypto) => void;
}

function AssetTable({ 
  assets, 
  loading, 
  formatCurrency, 
  formatMarketCap, 
  formatPercentage,
  getRatingConfig,
  getScoreColor,
  onSelectAsset
}: AssetTableProps) {
  if (loading) {
    return (
      <Card className="border-slate-200/80 bg-white shadow-sm">
        <CardContent className="p-16 text-center">
          <div className="h-12 w-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading securities data...</p>
        </CardContent>
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <Card className="border-slate-200/80 bg-white shadow-sm">
        <CardContent className="p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Securities Found</h3>
          <p className="text-slate-500 text-sm">Adjust your filters or search criteria</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-slate-200">
            <TableHead className="font-semibold text-slate-700">Security</TableHead>
            <TableHead className="font-semibold text-slate-700">Class</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">Price</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">24h</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">Market Cap</TableHead>
            <TableHead className="font-semibold text-slate-700 text-center">Rating</TableHead>
            <TableHead className="font-semibold text-slate-700 text-center">Score</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => {
            const ratingConfig = getRatingConfig(asset.analyst_rating);
            return (
              <TableRow 
                key={asset.id} 
                className="cursor-pointer hover:bg-primary/5 transition-all duration-200 group border-slate-100"
                onClick={() => onSelectAsset(asset)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {asset.logo_url ? (
                      <img src={asset.logo_url} alt={asset.name} className="h-11 w-11 rounded-xl object-cover shadow-sm" />
                    ) : (
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-200/50">
                        {asset.asset_type === 'crypto' ? (
                          <Bitcoin className="h-5 w-5 text-amber-500" />
                        ) : (
                          <BarChart3 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{asset.name}</span>
                        {asset.is_featured && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{asset.symbol}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-600 border-0">
                    {asset.asset_type === 'crypto' ? 'Digital' : 'Equity'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-slate-900">
                  {formatCurrency(asset.current_price)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={`inline-flex items-center gap-1 font-semibold tabular-nums px-2 py-1 rounded-md ${
                    (asset.price_change_24h || 0) >= 0 
                      ? 'text-emerald-700 bg-emerald-50' 
                      : 'text-red-700 bg-red-50'
                  }`}>
                    {(asset.price_change_24h || 0) >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {formatPercentage(asset.price_change_24h)}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums text-slate-600 font-medium">
                  {formatMarketCap(asset.market_cap)}
                </TableCell>
                <TableCell className="text-center">
                  {asset.analyst_rating ? (
                    <Badge className={`${ratingConfig.bg} ${ratingConfig.text} border ${ratingConfig.border} font-semibold`}>
                      {ratingConfig.icon} {asset.analyst_rating}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`font-bold tabular-nums text-lg ${getScoreColor(Number(asset.overall_score))}`}>
                    {asset.overall_score ? Number(asset.overall_score).toFixed(1) : '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

// Asset Detail Panel Component
interface AssetDetailPanelProps {
  asset: StockCrypto;
  formatCurrency: (value: number | null, currency?: string) => string;
  formatMarketCap: (value: number | null) => string;
  formatPercentage: (value: number | null) => string;
  getRatingConfig: (rating: string | null) => { bg: string; text: string; border: string; icon: string };
  getScoreColor: (score: number | null) => string;
  getScoreProgress: (score: number | null) => number;
}

function AssetDetailPanel({
  asset,
  formatCurrency,
  formatMarketCap,
  formatPercentage,
  getRatingConfig,
  getScoreColor,
  getScoreProgress
}: AssetDetailPanelProps) {
  const ratingConfig = getRatingConfig(asset.analyst_rating);

  return (
    <>
      <SheetHeader className="space-y-4 pb-6">
        <div className="flex items-start gap-4">
          {asset.logo_url ? (
            <img src={asset.logo_url} alt={asset.name} className="h-16 w-16 rounded-2xl object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              {asset.asset_type === 'crypto' ? (
                <Bitcoin className="h-8 w-8 text-warning" />
              ) : (
                <BarChart3 className="h-8 w-8 text-primary" />
              )}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <SheetTitle className="text-xl">{asset.name}</SheetTitle>
              {asset.is_featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{asset.symbol}</Badge>
              {asset.analyst_rating && (
                <Badge className={`${ratingConfig.bg} ${ratingConfig.text} border ${ratingConfig.border}`}>
                  {ratingConfig.icon} {asset.analyst_rating}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {asset.description && (
          <SheetDescription className="text-sm leading-relaxed">
            {asset.description}
          </SheetDescription>
        )}
      </SheetHeader>

      <div className="space-y-6">
        {/* Price Metrics */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Price Metrics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Current Price" value={formatCurrency(asset.current_price)} />
            <MetricCard 
              label="24h Change" 
              value={formatPercentage(asset.price_change_24h)}
              valueClass={(asset.price_change_24h || 0) >= 0 ? 'text-success' : 'text-destructive'}
            />
            <MetricCard label="Market Cap" value={formatMarketCap(asset.market_cap)} />
            <MetricCard label="Volume (24h)" value={formatMarketCap(asset.volume_24h)} />
          </div>
        </section>

        <Separator />

        {/* Performance */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Performance
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard 
              label="7 Days" 
              value={formatPercentage(asset.price_change_7d)}
              valueClass={(asset.price_change_7d || 0) >= 0 ? 'text-success' : 'text-destructive'}
            />
            <MetricCard 
              label="30 Days" 
              value={formatPercentage(asset.price_change_30d)}
              valueClass={(asset.price_change_30d || 0) >= 0 ? 'text-success' : 'text-destructive'}
            />
            <MetricCard 
              label="1 Year" 
              value={formatPercentage(asset.price_change_1y)}
              valueClass={(asset.price_change_1y || 0) >= 0 ? 'text-success' : 'text-destructive'}
            />
          </div>
        </section>

        {/* Analyst Scores */}
        {(asset.score_fundamentals || asset.score_technicals || asset.score_momentum || asset.score_risk) && (
          <>
            <Separator />
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Analyst Conviction Scores
              </h3>
              <div className="space-y-4">
                {asset.score_fundamentals && (
                  <ScoreBar label="Fundamentals" score={asset.score_fundamentals} getScoreColor={getScoreColor} getScoreProgress={getScoreProgress} />
                )}
                {asset.score_technicals && (
                  <ScoreBar label="Technicals" score={asset.score_technicals} getScoreColor={getScoreColor} getScoreProgress={getScoreProgress} />
                )}
                {asset.score_momentum && (
                  <ScoreBar label="Momentum" score={asset.score_momentum} getScoreColor={getScoreColor} getScoreProgress={getScoreProgress} />
                )}
                {asset.score_risk && (
                  <ScoreBar label="Risk Profile" score={asset.score_risk} getScoreColor={getScoreColor} getScoreProgress={getScoreProgress} />
                )}
              </div>
            </section>
          </>
        )}

        {/* Investment Thesis */}
        {asset.investment_thesis && (
          <>
            <Separator />
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Investment Thesis
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {asset.investment_thesis}
              </p>
            </section>
          </>
        )}

        {/* Strengths & Risks */}
        {(asset.strengths || asset.risks) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {asset.strengths && (
                <section>
                  <h3 className="text-sm font-semibold text-success mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Strengths
                  </h3>
                  <div className="p-3 rounded-lg bg-success/5 border border-success/10">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {asset.strengths}
                    </p>
                  </div>
                </section>
              )}
              {asset.risks && (
                <section>
                  <h3 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Risks
                  </h3>
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {asset.risks}
                    </p>
                  </div>
                </section>
              )}
            </div>
          </>
        )}

        {/* Key Watchpoints */}
        {asset.key_watchpoints && (
          <>
            <Separator />
            <section>
              <h3 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Key Watchpoints
              </h3>
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {asset.key_watchpoints}
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}

// Metric Card Component
function MetricCard({ label, value, valueClass = 'text-foreground' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}

// Score Bar Component
function ScoreBar({ 
  label, 
  score, 
  getScoreColor, 
  getScoreProgress 
}: { 
  label: string; 
  score: number;
  getScoreColor: (score: number | null) => string;
  getScoreProgress: (score: number | null) => number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold tabular-nums ${getScoreColor(score)}`}>{score.toFixed(1)}/5</span>
      </div>
      <Progress value={getScoreProgress(score)} className="h-2" />
    </div>
  );
}
