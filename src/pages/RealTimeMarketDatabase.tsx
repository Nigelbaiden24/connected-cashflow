import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoData, useStockData, CryptoData, StockData } from "@/hooks/useRealTimeMarketData";
import { AnalystPicksSection } from "@/components/market/AnalystPicksSection";
import { AssetAnalystActivity } from "@/components/market/AssetAnalystActivity";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Bitcoin, 
  BarChart3, 
  ArrowUpDown,
  Clock,
  ChevronLeft,
  ChevronRight,
  Layers,
  Globe,
  Zap,
  Activity,
  FileText
} from "lucide-react";

export default function RealTimeMarketDatabase() {
  const [cryptoPage, setCryptoPage] = useState(1);
  const [stockPage, setStockPage] = useState(1);
  const cryptoPerPage = 100;
  const stockPerPage = 50;
  
  const { data: cryptoData, total: cryptoTotal, loading: cryptoLoading, refetch: refetchCrypto, lastFetch: cryptoLastFetch } = useCryptoData(cryptoPage, cryptoPerPage);
  const { data: stockData, total: stockTotal, loading: stockLoading, refetch: refetchStocks, lastFetch: stockLastFetch } = useStockData(stockPage, stockPerPage);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("market_cap");
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);

  const loading = cryptoLoading || stockLoading;

  const handleRefresh = async () => {
    await Promise.all([refetchCrypto(), refetchStocks()]);
  };

  const filteredCrypto = cryptoData.filter(coin =>
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case "market_cap": return (b.marketCap || 0) - (a.marketCap || 0);
      case "price_change": return (b.priceChange24h || 0) - (a.priceChange24h || 0);
      case "volume": return (b.volume24h || 0) - (a.volume24h || 0);
      default: return 0;
    }
  });

  const filteredStocks = stockData.filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case "market_cap": return (b.marketCap || 0) - (a.marketCap || 0);
      case "price_change": return (b.changePercent || 0) - (a.changePercent || 0);
      case "volume": return (b.volume || 0) - (a.volume || 0);
      default: return 0;
    }
  });

  const formatCurrency = (value: number | null, decimals = 2) => {
    if (!value) return '—';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: value < 1 ? 4 : decimals,
      maximumFractionDigits: value < 1 ? 6 : decimals
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

  const cryptoTotalPages = Math.ceil(cryptoTotal / cryptoPerPage);
  const stockTotalPages = Math.ceil(stockTotal / stockPerPage);

  const topGainer = cryptoData.length > 0 
    ? cryptoData.reduce((prev, current) => 
        (prev.priceChange24h || 0) > (current.priceChange24h || 0) ? prev : current
      )
    : null;

  const topLoser = cryptoData.length > 0 
    ? cryptoData.reduce((prev, current) => 
        (prev.priceChange24h || 0) < (current.priceChange24h || 0) ? prev : current
      )
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/25">
                <Layers className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Real-Time Market Data
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  Live prices from CoinGecko & Alpha Vantage • {stockTotal.toLocaleString()} Stocks • {cryptoTotal.toLocaleString()} Cryptocurrencies
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {(cryptoLastFetch || stockLastFetch) && (
                <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-100 px-3 py-1.5 rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span>Updated: {(cryptoLastFetch || stockLastFetch)?.toLocaleTimeString()}</span>
                </div>
              )}
              <Button 
                onClick={handleRefresh} 
                disabled={loading}
                className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md shadow-primary/20"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Analyst Picks Section */}
        <AnalystPicksSection />

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <StatsCard
            label="Total Stocks"
            value={stockTotal.toLocaleString()}
            icon={BarChart3}
            gradient="from-primary to-blue-600"
          />
          <StatsCard
            label="Total Crypto"
            value={cryptoTotal.toLocaleString()}
            icon={Bitcoin}
            gradient="from-amber-500 to-orange-500"
          />
          <StatsCard
            label="Top Gainer (24h)"
            value={topGainer?.symbol || '—'}
            subValue={topGainer ? formatPercentage(topGainer.priceChange24h) : undefined}
            icon={TrendingUp}
            gradient="from-emerald-500 to-green-600"
            positive
          />
          <StatsCard
            label="Top Loser (24h)"
            value={topLoser?.symbol || '—'}
            subValue={topLoser ? formatPercentage(topLoser.priceChange24h) : undefined}
            icon={TrendingDown}
            gradient="from-red-500 to-rose-600"
            negative
          />
        </div>

        {/* Filters */}
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or symbol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-50/50 border-slate-200 focus:bg-white"
                  />
                </div>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-white border-slate-200">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="market_cap">Market Cap</SelectItem>
                  <SelectItem value="price_change">24h Change</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="crypto" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 shadow-sm">
            <TabsTrigger 
              value="crypto" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2"
            >
              <Bitcoin className="h-4 w-4" />
              Cryptocurrency ({cryptoTotal.toLocaleString()})
            </TabsTrigger>
            <TabsTrigger 
              value="stocks" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Stocks ({stockTotal.toLocaleString()})
            </TabsTrigger>
          </TabsList>

          {/* Crypto Tab */}
          <TabsContent value="crypto" className="mt-0">
            <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <Bitcoin className="h-5 w-5 text-amber-500" />
                      Cryptocurrency Prices
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Real-time data from CoinGecko API • Page {cryptoPage} of {cryptoTotalPages}
                    </CardDescription>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-0">
                    {filteredCrypto.length} assets
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {cryptoLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full bg-slate-100" />
                    ))}
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[600px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-slate-200">
                            <TableHead className="font-semibold text-slate-700">#</TableHead>
                            <TableHead className="font-semibold text-slate-700">Name</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Price</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">1h</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">24h</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">7d</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Market Cap</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Volume (24h)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCrypto.map((coin, index) => (
                            <TableRow 
                              key={coin.id} 
                              className="border-slate-100 hover:bg-amber-50/50 cursor-pointer transition-colors"
                              onClick={() => setSelectedCrypto(coin)}
                            >
                              <TableCell className="text-slate-500 font-medium">
                                {coin.marketCapRank || (cryptoPage - 1) * cryptoPerPage + index + 1}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {coin.image && (
                                    <img src={coin.image} alt={coin.name} className="h-9 w-9 rounded-full shadow-sm" />
                                  )}
                                  <div>
                                    <p className="font-semibold text-slate-900">{coin.name}</p>
                                    <p className="text-xs text-slate-500 uppercase">{coin.symbol}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-semibold text-slate-900 tabular-nums">
                                {formatCurrency(coin.currentPrice)}
                              </TableCell>
                              <TableCell className="text-right">
                                <ChangeIndicator value={coin.priceChange1h} />
                              </TableCell>
                              <TableCell className="text-right">
                                <ChangeIndicator value={coin.priceChange24h} showIcon />
                              </TableCell>
                              <TableCell className="text-right">
                                <ChangeIndicator value={coin.priceChange7d} />
                              </TableCell>
                              <TableCell className="text-right font-medium text-slate-700 tabular-nums">
                                {formatMarketCap(coin.marketCap)}
                              </TableCell>
                              <TableCell className="text-right text-slate-500 tabular-nums">
                                {formatMarketCap(coin.volume24h)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    
                    {/* Crypto Pagination */}
                    <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                      <p className="text-sm text-slate-500">
                        Showing {(cryptoPage - 1) * cryptoPerPage + 1} - {Math.min(cryptoPage * cryptoPerPage, cryptoTotal)} of {cryptoTotal.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCryptoPage(p => Math.max(1, p - 1))}
                          disabled={cryptoPage === 1}
                          className="bg-white border-slate-200 hover:bg-slate-50"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {[...Array(Math.min(5, cryptoTotalPages))].map((_, i) => {
                            const pageNum = cryptoPage <= 3 ? i + 1 : cryptoPage - 2 + i;
                            if (pageNum > cryptoTotalPages) return null;
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === cryptoPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCryptoPage(pageNum)}
                                className={pageNum === cryptoPage 
                                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md" 
                                  : "bg-white border-slate-200"
                                }
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCryptoPage(p => Math.min(cryptoTotalPages, p + 1))}
                          disabled={cryptoPage === cryptoTotalPages}
                          className="bg-white border-slate-200 hover:bg-slate-50"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stocks Tab */}
          <TabsContent value="stocks" className="mt-0">
            <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Stock Prices
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Real-time data from Alpha Vantage API • Page {stockPage} of {stockTotalPages}
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-0">
                    {filteredStocks.length} securities
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {stockLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full bg-slate-100" />
                    ))}
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[600px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-slate-200">
                            <TableHead className="font-semibold text-slate-700">Symbol</TableHead>
                            <TableHead className="font-semibold text-slate-700">Name</TableHead>
                            <TableHead className="font-semibold text-slate-700">Sector</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Price</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Change</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Market Cap</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">P/E</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Div Yield</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStocks.map((stock) => (
                            <TableRow 
                              key={stock.symbol} 
                              className="border-slate-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
                              onClick={() => setSelectedStock(stock)}
                            >
                              <TableCell>
                                <Badge className="font-mono bg-primary/10 text-primary border-0 font-semibold">
                                  {stock.symbol}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold text-slate-900">{stock.name}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 text-xs">
                                  {stock.sector || '—'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-semibold text-slate-900 tabular-nums">
                                {formatCurrency(stock.currentPrice)}
                              </TableCell>
                              <TableCell className="text-right">
                                <ChangeIndicator value={stock.changePercent} showIcon />
                              </TableCell>
                              <TableCell className="text-right font-medium text-slate-700 tabular-nums">
                                {formatMarketCap(stock.marketCap)}
                              </TableCell>
                              <TableCell className="text-right text-slate-500 tabular-nums">
                                {stock.peRatio?.toFixed(2) || '—'}
                              </TableCell>
                              <TableCell className="text-right text-slate-500 tabular-nums">
                                {stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : '—'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    
                    {/* Stock Pagination */}
                    <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                      <p className="text-sm text-slate-500">
                        Showing {(stockPage - 1) * stockPerPage + 1} - {Math.min(stockPage * stockPerPage, stockTotal)} of {stockTotal.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStockPage(p => Math.max(1, p - 1))}
                          disabled={stockPage === 1}
                          className="bg-white border-slate-200 hover:bg-slate-50"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {[...Array(Math.min(5, stockTotalPages))].map((_, i) => {
                            const pageNum = stockPage <= 3 ? i + 1 : stockPage - 2 + i;
                            if (pageNum > stockTotalPages) return null;
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === stockPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStockPage(pageNum)}
                                className={pageNum === stockPage 
                                  ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md" 
                                  : "bg-white border-slate-200"
                                }
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStockPage(p => Math.min(stockTotalPages, p + 1))}
                          disabled={stockPage === stockTotalPages}
                          className="bg-white border-slate-200 hover:bg-slate-50"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Crypto Detail Dialog */}
      {selectedCrypto && (
        <Dialog open={!!selectedCrypto} onOpenChange={() => setSelectedCrypto(null)}>
          <DialogContent className="max-w-3xl bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl text-slate-900">
                {selectedCrypto.image && (
                  <img src={selectedCrypto.image} alt={selectedCrypto.name} className="h-12 w-12 rounded-full shadow-md" />
                )}
                <div>
                  <span>{selectedCrypto.name}</span>
                  <Badge variant="secondary" className="ml-3 uppercase">
                    {selectedCrypto.symbol}
                  </Badge>
                </div>
                <Badge className="ml-auto bg-amber-100 text-amber-700 border-0">
                  Rank #{selectedCrypto.marketCapRank}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="w-full bg-slate-100">
                <TabsTrigger value="overview" className="flex-1 gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analyst" className="flex-1 gap-2">
                  <FileText className="h-4 w-4" />
                  Analyst Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <MetricCard label="Current Price" value={formatCurrency(selectedCrypto.currentPrice)} />
                  <MetricCard 
                    label="24h Change" 
                    value={formatPercentage(selectedCrypto.priceChange24h)}
                    positive={(selectedCrypto.priceChange24h || 0) >= 0}
                  />
                  <MetricCard label="Market Cap" value={formatMarketCap(selectedCrypto.marketCap)} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <DetailRow label="24h High" value={formatCurrency(selectedCrypto.high24h)} />
                    <DetailRow label="24h Low" value={formatCurrency(selectedCrypto.low24h)} />
                    <DetailRow label="All-Time High" value={formatCurrency(selectedCrypto.ath)} />
                    <DetailRow label="All-Time Low" value={formatCurrency(selectedCrypto.atl)} />
                  </div>
                  <div className="space-y-1">
                    <DetailRow label="Volume (24h)" value={formatMarketCap(selectedCrypto.volume24h)} />
                    <DetailRow label="Circulating Supply" value={selectedCrypto.circulatingSupply?.toLocaleString() || '—'} />
                    <DetailRow label="Total Supply" value={selectedCrypto.totalSupply?.toLocaleString() || '—'} />
                    <DetailRow label="Max Supply" value={selectedCrypto.maxSupply?.toLocaleString() || '∞'} />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <PerformanceCard label="1h" value={selectedCrypto.priceChange1h} formatPercentage={formatPercentage} />
                  <PerformanceCard label="24h" value={selectedCrypto.priceChange24h} formatPercentage={formatPercentage} />
                  <PerformanceCard label="7d" value={selectedCrypto.priceChange7d} formatPercentage={formatPercentage} />
                  <PerformanceCard label="30d" value={selectedCrypto.priceChange30d} formatPercentage={formatPercentage} />
                  <PerformanceCard label="1y" value={selectedCrypto.priceChange1y} formatPercentage={formatPercentage} />
                </div>
              </TabsContent>

              <TabsContent value="analyst" className="mt-4">
                <AssetAnalystActivity symbol={selectedCrypto.symbol} assetType="crypto" />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Stock Detail Dialog */}
      {selectedStock && (
        <Dialog open={!!selectedStock} onOpenChange={() => setSelectedStock(null)}>
          <DialogContent className="max-w-3xl bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl text-slate-900">
                <Badge className="font-mono bg-primary text-white text-lg px-3 py-1">
                  {selectedStock.symbol}
                </Badge>
                <span>{selectedStock.name}</span>
                {selectedStock.sector && (
                  <Badge className="ml-auto bg-blue-100 text-blue-700 border-0">
                    {selectedStock.sector}
                  </Badge>
                )}
              </DialogTitle>
              {selectedStock.description && (
                <DialogDescription className="text-slate-500 mt-2">
                  {selectedStock.description}
                </DialogDescription>
              )}
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="w-full bg-slate-100">
                <TabsTrigger value="overview" className="flex-1 gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analyst" className="flex-1 gap-2">
                  <FileText className="h-4 w-4" />
                  Analyst Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <MetricCard label="Current Price" value={formatCurrency(selectedStock.currentPrice)} />
                  <MetricCard 
                    label="Change" 
                    value={formatPercentage(selectedStock.changePercent)}
                    positive={(selectedStock.changePercent || 0) >= 0}
                  />
                  <MetricCard label="Market Cap" value={formatMarketCap(selectedStock.marketCap)} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <DetailRow label="Open" value={formatCurrency(selectedStock.open)} />
                    <DetailRow label="Previous Close" value={formatCurrency(selectedStock.previousClose)} />
                    <DetailRow label="Day High" value={formatCurrency(selectedStock.high)} />
                    <DetailRow label="Day Low" value={formatCurrency(selectedStock.low)} />
                    <DetailRow label="52 Week High" value={formatCurrency(selectedStock.fiftyTwoWeekHigh)} />
                    <DetailRow label="52 Week Low" value={formatCurrency(selectedStock.fiftyTwoWeekLow)} />
                  </div>
                  <div className="space-y-1">
                    <DetailRow label="P/E Ratio" value={selectedStock.peRatio?.toFixed(2) || '—'} />
                    <DetailRow label="Forward P/E" value={selectedStock.forwardPE?.toFixed(2) || '—'} />
                    <DetailRow label="EPS" value={selectedStock.eps ? formatCurrency(selectedStock.eps) : '—'} />
                    <DetailRow label="Dividend Yield" value={selectedStock.dividendYield ? `${selectedStock.dividendYield.toFixed(2)}%` : '—'} />
                    <DetailRow label="Beta" value={selectedStock.beta?.toFixed(2) || '—'} />
                    <DetailRow label="Volume" value={selectedStock.volume?.toLocaleString() || '—'} />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <FundamentalCard label="P/E Ratio" value={selectedStock.peRatio?.toFixed(2) || '—'} />
                  <FundamentalCard label="EPS" value={selectedStock.eps ? `$${selectedStock.eps.toFixed(2)}` : '—'} />
                  <FundamentalCard label="Dividend" value={selectedStock.dividendYield ? `${selectedStock.dividendYield.toFixed(2)}%` : '—'} />
                  <FundamentalCard label="Beta" value={selectedStock.beta?.toFixed(2) || '—'} />
                </div>
              </TabsContent>

              <TabsContent value="analyst" className="mt-4">
                <AssetAnalystActivity symbol={selectedStock.symbol} assetType="stock" />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  gradient: string;
  subValue?: string;
  positive?: boolean;
  negative?: boolean;
}

function StatsCard({ label, value, icon: Icon, gradient, subValue, positive, negative }: StatsCardProps) {
  return (
    <Card className="border-slate-200/80 bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {subValue && (
              <p className={`text-sm font-semibold mt-0.5 ${positive ? 'text-emerald-600' : negative ? 'text-red-600' : 'text-slate-600'}`}>
                {subValue}
              </p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Change Indicator Component
function ChangeIndicator({ value, showIcon }: { value: number | null | undefined; showIcon?: boolean }) {
  const positive = (value || 0) >= 0;
  const formatted = value !== null && value !== undefined 
    ? `${positive ? '+' : ''}${value.toFixed(2)}%` 
    : '—';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold tabular-nums px-2 py-1 rounded-md text-sm ${
      positive ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
    }`}>
      {showIcon && (positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />)}
      {formatted}
    </span>
  );
}

// Metric Card Component
function MetricCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-1 ${positive !== undefined ? (positive ? 'text-emerald-600' : 'text-red-600') : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  );
}

// Detail Row Component
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

// Performance Card Component
function PerformanceCard({ label, value, formatPercentage }: { label: string; value: number | null | undefined; formatPercentage: (v: number | null) => string }) {
  const positive = (value || 0) >= 0;
  return (
    <div className={`p-3 rounded-xl text-center ${positive ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className={`font-bold text-sm ${positive ? 'text-emerald-700' : 'text-red-700'}`}>
        {formatPercentage(value)}
      </p>
    </div>
  );
}

// Fundamental Card Component
function FundamentalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="font-bold text-slate-900">{value}</p>
    </div>
  );
}
