import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Filter, 
  Bitcoin, 
  BarChart3, 
  Sparkles,
  ExternalLink,
  ArrowUpDown,
  Bookmark,
  Download,
  ChevronRight
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

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
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
    }
  };

  const filteredAssets = assets.filter(asset => {
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

  const sectors = [...new Set(assets.filter(a => a.sector).map(a => a.sector))];

  const formatCurrency = (value: number | null, currency = 'USD') => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency,
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2
    }).format(value);
  };

  const formatMarketCap = (value: number | null) => {
    if (!value) return '-';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(0)}`;
  };

  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getRatingBadgeColor = (rating: string | null) => {
    switch (rating) {
      case 'Gold': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Silver': return 'bg-slate-400/20 text-slate-300 border-slate-400/30';
      case 'Bronze': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'Neutral': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
      case 'Negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-zinc-700/20 text-zinc-500 border-zinc-700/30';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-zinc-500';
    if (score >= 4) return 'text-emerald-400';
    if (score >= 3) return 'text-amber-400';
    if (score >= 2) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              Stocks & Crypto Database
            </h1>
            <p className="text-zinc-400 mt-2">
              Comprehensive research platform with analyst ratings and insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-white/10 text-zinc-300 hover:bg-white/5">
              <Bookmark className="h-4 w-4 mr-2" />
              Watchlist
            </Button>
            <Button variant="outline" className="border-white/10 text-zinc-300 hover:bg-white/5">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <p className="text-xs text-blue-400 font-medium uppercase">Total Stocks</p>
              <p className="text-2xl font-bold text-white">{assets.filter(a => a.asset_type === 'stock').length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="p-4">
              <p className="text-xs text-amber-400 font-medium uppercase">Total Crypto</p>
              <p className="text-2xl font-bold text-white">{assets.filter(a => a.asset_type === 'crypto').length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-4">
              <p className="text-xs text-emerald-400 font-medium uppercase">Gold Rated</p>
              <p className="text-2xl font-bold text-white">{assets.filter(a => a.analyst_rating === 'Gold').length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4">
              <p className="text-xs text-purple-400 font-medium uppercase">Featured</p>
              <p className="text-2xl font-bold text-white">{assets.filter(a => a.is_featured).length}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900/50 border-white/10 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search by name or symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>
            <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
              <SelectTrigger className="w-[150px] bg-zinc-800/50 border-white/10 text-white">
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="stock">Stocks</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-[180px] bg-zinc-800/50 border-white/10 text-white">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector!}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[150px] bg-zinc-800/50 border-white/10 text-white">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Neutral">Neutral</SelectItem>
                <SelectItem value="Negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-zinc-800/50 border-white/10 text-white">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="market_cap">Market Cap</SelectItem>
                <SelectItem value="price_change_24h">24h Change</SelectItem>
                <SelectItem value="overall_score">Analyst Score</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-zinc-900/50 border border-white/10">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            All Assets
          </TabsTrigger>
          <TabsTrigger value="stocks" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Stocks
          </TabsTrigger>
          <TabsTrigger value="crypto" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <Bitcoin className="h-4 w-4 mr-2" />
            Crypto
          </TabsTrigger>
          <TabsTrigger value="top-rated" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Star className="h-4 w-4 mr-2" />
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
            getRatingBadgeColor={getRatingBadgeColor}
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
            getRatingBadgeColor={getRatingBadgeColor}
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
            getRatingBadgeColor={getRatingBadgeColor}
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
            getRatingBadgeColor={getRatingBadgeColor}
            getScoreColor={getScoreColor}
            onSelectAsset={setSelectedAsset}
          />
        </TabsContent>
      </Tabs>

      {/* Asset Detail Dialog */}
      {selectedAsset && (
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-4xl bg-zinc-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                {selectedAsset.logo_url && (
                  <img src={selectedAsset.logo_url} alt={selectedAsset.name} className="h-10 w-10 rounded-full" />
                )}
                <div>
                  <span>{selectedAsset.name}</span>
                  <Badge variant="outline" className="ml-3 text-zinc-400">
                    {selectedAsset.symbol}
                  </Badge>
                </div>
                {selectedAsset.analyst_rating && (
                  <Badge className={getRatingBadgeColor(selectedAsset.analyst_rating)}>
                    {selectedAsset.analyst_rating}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                {selectedAsset.description}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 p-1">
                {/* Price & Performance */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-zinc-800/50 border-white/10">
                    <CardContent className="p-4">
                      <p className="text-xs text-zinc-400">Current Price</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(selectedAsset.current_price)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-800/50 border-white/10">
                    <CardContent className="p-4">
                      <p className="text-xs text-zinc-400">24h Change</p>
                      <p className={`text-xl font-bold ${(selectedAsset.price_change_24h || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatPercentage(selectedAsset.price_change_24h)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-800/50 border-white/10">
                    <CardContent className="p-4">
                      <p className="text-xs text-zinc-400">Market Cap</p>
                      <p className="text-xl font-bold text-white">
                        {formatMarketCap(selectedAsset.market_cap)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-800/50 border-white/10">
                    <CardContent className="p-4">
                      <p className="text-xs text-zinc-400">Overall Score</p>
                      <p className={`text-xl font-bold ${getScoreColor(Number(selectedAsset.overall_score))}`}>
                        {selectedAsset.overall_score ? `${Number(selectedAsset.overall_score).toFixed(1)}/5` : '-'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Conviction Scores */}
                {(selectedAsset.score_fundamentals || selectedAsset.score_technicals) && (
                  <Card className="bg-zinc-800/50 border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-400" />
                        Analyst Conviction Scores
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-zinc-400">Fundamentals</p>
                          <p className={`text-2xl font-bold ${getScoreColor(selectedAsset.score_fundamentals)}`}>
                            {selectedAsset.score_fundamentals || '-'}/5
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">Technicals</p>
                          <p className={`text-2xl font-bold ${getScoreColor(selectedAsset.score_technicals)}`}>
                            {selectedAsset.score_technicals || '-'}/5
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">Momentum</p>
                          <p className={`text-2xl font-bold ${getScoreColor(selectedAsset.score_momentum)}`}>
                            {selectedAsset.score_momentum || '-'}/5
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">Risk</p>
                          <p className={`text-2xl font-bold ${getScoreColor(selectedAsset.score_risk)}`}>
                            {selectedAsset.score_risk || '-'}/5
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Analyst Commentary */}
                {selectedAsset.investment_thesis && (
                  <Card className="bg-zinc-800/50 border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-white">Investment Thesis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-300 whitespace-pre-wrap">{selectedAsset.investment_thesis}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedAsset.strengths && (
                    <Card className="bg-emerald-500/10 border-emerald-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-emerald-400">Strengths</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-zinc-300 whitespace-pre-wrap">{selectedAsset.strengths}</p>
                      </CardContent>
                    </Card>
                  )}
                  {selectedAsset.risks && (
                    <Card className="bg-red-500/10 border-red-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-red-400">Risks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-zinc-300 whitespace-pre-wrap">{selectedAsset.risks}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {selectedAsset.key_watchpoints && (
                  <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-amber-400">Key Watchpoints</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-300 whitespace-pre-wrap">{selectedAsset.key_watchpoints}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface AssetTableProps {
  assets: StockCrypto[];
  loading: boolean;
  formatCurrency: (value: number | null, currency?: string) => string;
  formatMarketCap: (value: number | null) => string;
  formatPercentage: (value: number | null) => string;
  getRatingBadgeColor: (rating: string | null) => string;
  getScoreColor: (score: number | null) => string;
  onSelectAsset: (asset: StockCrypto) => void;
}

function AssetTable({ 
  assets, 
  loading, 
  formatCurrency, 
  formatMarketCap, 
  formatPercentage,
  getRatingBadgeColor,
  getScoreColor,
  onSelectAsset
}: AssetTableProps) {
  if (loading) {
    return (
      <Card className="bg-zinc-900/50 border-white/10">
        <CardContent className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-400">Loading assets...</p>
        </CardContent>
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-white/10">
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Assets Found</h3>
          <p className="text-zinc-400">No stocks or cryptocurrencies match your search criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-white/10">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-zinc-400">Asset</TableHead>
            <TableHead className="text-zinc-400">Type</TableHead>
            <TableHead className="text-zinc-400 text-right">Price</TableHead>
            <TableHead className="text-zinc-400 text-right">24h Change</TableHead>
            <TableHead className="text-zinc-400 text-right">Market Cap</TableHead>
            <TableHead className="text-zinc-400 text-center">Rating</TableHead>
            <TableHead className="text-zinc-400 text-center">Score</TableHead>
            <TableHead className="text-zinc-400"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow 
              key={asset.id} 
              className="border-white/5 hover:bg-white/5 cursor-pointer"
              onClick={() => onSelectAsset(asset)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  {asset.logo_url ? (
                    <img src={asset.logo_url} alt={asset.name} className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      {asset.asset_type === 'crypto' ? (
                        <Bitcoin className="h-4 w-4 text-amber-400" />
                      ) : (
                        <BarChart3 className="h-4 w-4 text-blue-400" />
                      )}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">{asset.name}</p>
                    <p className="text-xs text-zinc-500">{asset.symbol}</p>
                  </div>
                  {asset.is_featured && (
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={asset.asset_type === 'crypto' ? 'border-amber-500/30 text-amber-400' : 'border-blue-500/30 text-blue-400'}>
                  {asset.asset_type === 'crypto' ? 'Crypto' : 'Stock'}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-white font-medium">
                {formatCurrency(asset.current_price)}
              </TableCell>
              <TableCell className="text-right">
                <span className={`flex items-center justify-end gap-1 ${(asset.price_change_24h || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(asset.price_change_24h || 0) >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {formatPercentage(asset.price_change_24h)}
                </span>
              </TableCell>
              <TableCell className="text-right text-zinc-300">
                {formatMarketCap(asset.market_cap)}
              </TableCell>
              <TableCell className="text-center">
                {asset.analyst_rating ? (
                  <Badge className={getRatingBadgeColor(asset.analyst_rating)}>
                    {asset.analyst_rating}
                  </Badge>
                ) : (
                  <span className="text-zinc-500">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <span className={`font-bold ${getScoreColor(Number(asset.overall_score))}`}>
                  {asset.overall_score ? `${Number(asset.overall_score).toFixed(1)}` : '-'}
                </span>
              </TableCell>
              <TableCell>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
