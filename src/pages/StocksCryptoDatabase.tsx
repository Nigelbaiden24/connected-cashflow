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
  ExternalLink
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

  const formatCurrency = (value: number | null, currency = 'USD') => {
    if (!value) return '—';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency,
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2
    }).format(value);
  };

  const formatMarketCap = (value: number | null) => {
    if (!value) return '—';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(0)}`;
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
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Layers className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                  Securities Research Database
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Institutional-grade analysis across {assets.length} securities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAssets}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Bookmark className="h-4 w-4" />
                Watchlist
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
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
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ticker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Asset Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="stock">Equities</SelectItem>
                  <SelectItem value="crypto">Digital Assets</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector!}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="Gold">🏆 Gold</SelectItem>
                  <SelectItem value="Silver">🥈 Silver</SelectItem>
                  <SelectItem value="Bronze">🥉 Bronze</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="Negative">Negative</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market_cap">Market Cap</SelectItem>
                  <SelectItem value="price_change_24h">24h Performance</SelectItem>
                  <SelectItem value="overall_score">Analyst Score</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="ml-auto">
                {filteredAssets.length} results
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              All Securities
            </TabsTrigger>
            <TabsTrigger value="stocks" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
              <BarChart3 className="h-4 w-4" />
              Equities
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
              <Bitcoin className="h-4 w-4" />
              Digital Assets
            </TabsTrigger>
            <TabsTrigger value="top-rated" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
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
    primary: 'bg-primary/10 text-primary',
    warning: 'bg-warning/10 text-warning',
    amber: 'bg-amber-500/10 text-amber-500',
    purple: 'bg-purple-500/10 text-purple-500',
    success: 'bg-success/10 text-success',
  };

  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className={`${isText ? 'text-xl' : 'text-2xl'} font-semibold text-foreground mt-1`}>{value}</p>
          </div>
          <div className={`h-10 w-10 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="h-5 w-5" />
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
      <Card className="border-border/50">
        <CardContent className="p-16 text-center">
          <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading securities data...</p>
        </CardContent>
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Securities Found</h3>
          <p className="text-muted-foreground text-sm">Adjust your filters or search criteria</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold text-foreground">Security</TableHead>
            <TableHead className="font-semibold text-foreground">Class</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Price</TableHead>
            <TableHead className="font-semibold text-foreground text-right">24h</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Market Cap</TableHead>
            <TableHead className="font-semibold text-foreground text-center">Rating</TableHead>
            <TableHead className="font-semibold text-foreground text-center">Score</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => {
            const ratingConfig = getRatingConfig(asset.analyst_rating);
            return (
              <TableRow 
                key={asset.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => onSelectAsset(asset)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {asset.logo_url ? (
                      <img src={asset.logo_url} alt={asset.name} className="h-10 w-10 rounded-xl object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                        {asset.asset_type === 'crypto' ? (
                          <Bitcoin className="h-5 w-5 text-warning" />
                        ) : (
                          <BarChart3 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{asset.name}</span>
                        {asset.is_featured && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{asset.symbol}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {asset.asset_type === 'crypto' ? 'Digital' : 'Equity'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(asset.current_price)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={`inline-flex items-center gap-1 font-medium tabular-nums ${
                    (asset.price_change_24h || 0) >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {(asset.price_change_24h || 0) >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {formatPercentage(asset.price_change_24h)}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatMarketCap(asset.market_cap)}
                </TableCell>
                <TableCell className="text-center">
                  {asset.analyst_rating ? (
                    <Badge className={`${ratingConfig.bg} ${ratingConfig.text} border ${ratingConfig.border}`}>
                      {ratingConfig.icon} {asset.analyst_rating}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`font-semibold tabular-nums ${getScoreColor(Number(asset.overall_score))}`}>
                    {asset.overall_score ? Number(asset.overall_score).toFixed(1) : '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
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
