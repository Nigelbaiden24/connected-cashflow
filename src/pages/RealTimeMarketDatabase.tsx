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
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Bitcoin, 
  BarChart3, 
  ArrowUpDown,
  ExternalLink,
  Clock
} from "lucide-react";

export default function RealTimeMarketDatabase() {
  const { data: cryptoData, loading: cryptoLoading, refetch: refetchCrypto, lastFetch: cryptoLastFetch } = useCryptoData();
  const { data: stockData, loading: stockLoading, refetch: refetchStocks, lastFetch: stockLastFetch } = useStockData();
  
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
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: value < 1 ? 4 : decimals,
      maximumFractionDigits: value < 1 ? 6 : decimals
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

  const formatVolume = (value: number | null) => {
    if (!value) return '-';
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(0);
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
              Real-Time Market Data
            </h1>
            <p className="text-zinc-400 mt-2">
              Live prices from CoinGecko & Alpha Vantage APIs
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(cryptoLastFetch || stockLastFetch) && (
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <Clock className="h-4 w-4" />
                <span>Updated: {(cryptoLastFetch || stockLastFetch)?.toLocaleTimeString()}</span>
              </div>
            )}
            <Button 
              onClick={handleRefresh} 
              disabled={loading}
              variant="outline" 
              className="border-white/10 text-zinc-300 hover:bg-white/5"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <p className="text-xs text-blue-400 font-medium uppercase">Total Stocks</p>
              <p className="text-2xl font-bold text-white">{stockData.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="p-4">
              <p className="text-xs text-amber-400 font-medium uppercase">Total Crypto</p>
              <p className="text-2xl font-bold text-white">{cryptoData.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-4">
              <p className="text-xs text-emerald-400 font-medium uppercase">Top Gainer (24h)</p>
              <p className="text-2xl font-bold text-white">
                {cryptoData.length > 0 
                  ? cryptoData.reduce((prev, current) => 
                      (prev.priceChange24h || 0) > (current.priceChange24h || 0) ? prev : current
                    ).symbol
                  : '-'
                }
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
            <CardContent className="p-4">
              <p className="text-xs text-red-400 font-medium uppercase">Top Loser (24h)</p>
              <p className="text-2xl font-bold text-white">
                {cryptoData.length > 0 
                  ? cryptoData.reduce((prev, current) => 
                      (prev.priceChange24h || 0) < (current.priceChange24h || 0) ? prev : current
                    ).symbol
                  : '-'
                }
              </p>
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-zinc-800/50 border-white/10 text-white">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
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
        <TabsList className="bg-zinc-900/50 border border-white/10">
          <TabsTrigger value="crypto" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <Bitcoin className="h-4 w-4 mr-2" />
            Cryptocurrency
          </TabsTrigger>
          <TabsTrigger value="stocks" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Stocks
          </TabsTrigger>
        </TabsList>

        {/* Crypto Tab */}
        <TabsContent value="crypto" className="mt-0">
          <Card className="bg-zinc-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Cryptocurrency Prices</CardTitle>
              <CardDescription>Real-time data from CoinGecko API</CardDescription>
            </CardHeader>
            <CardContent>
              {cryptoLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full bg-zinc-800" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-400">#</TableHead>
                      <TableHead className="text-zinc-400">Name</TableHead>
                      <TableHead className="text-zinc-400 text-right">Price</TableHead>
                      <TableHead className="text-zinc-400 text-right">1h</TableHead>
                      <TableHead className="text-zinc-400 text-right">24h</TableHead>
                      <TableHead className="text-zinc-400 text-right">7d</TableHead>
                      <TableHead className="text-zinc-400 text-right">Market Cap</TableHead>
                      <TableHead className="text-zinc-400 text-right">Volume (24h)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCrypto.map((coin, index) => (
                      <TableRow 
                        key={coin.id} 
                        className="border-white/5 hover:bg-white/5 cursor-pointer"
                        onClick={() => setSelectedCrypto(coin)}
                      >
                        <TableCell className="text-zinc-500">{coin.marketCapRank || index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {coin.image && <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />}
                            <div>
                              <p className="font-medium text-white">{coin.name}</p>
                              <p className="text-xs text-zinc-500">{coin.symbol}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-white">
                          {formatCurrency(coin.currentPrice)}
                        </TableCell>
                        <TableCell className={`text-right ${(coin.priceChange1h || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatPercentage(coin.priceChange1h)}
                        </TableCell>
                        <TableCell className={`text-right ${(coin.priceChange24h || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          <div className="flex items-center justify-end gap-1">
                            {(coin.priceChange24h || 0) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {formatPercentage(coin.priceChange24h)}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right ${(coin.priceChange7d || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatPercentage(coin.priceChange7d)}
                        </TableCell>
                        <TableCell className="text-right text-white">{formatMarketCap(coin.marketCap)}</TableCell>
                        <TableCell className="text-right text-zinc-400">{formatMarketCap(coin.volume24h)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stocks Tab */}
        <TabsContent value="stocks" className="mt-0">
          <Card className="bg-zinc-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Stock Prices</CardTitle>
              <CardDescription>Real-time data from Alpha Vantage API</CardDescription>
            </CardHeader>
            <CardContent>
              {stockLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full bg-zinc-800" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Symbol</TableHead>
                      <TableHead className="text-zinc-400">Name</TableHead>
                      <TableHead className="text-zinc-400">Sector</TableHead>
                      <TableHead className="text-zinc-400 text-right">Price</TableHead>
                      <TableHead className="text-zinc-400 text-right">Change</TableHead>
                      <TableHead className="text-zinc-400 text-right">Market Cap</TableHead>
                      <TableHead className="text-zinc-400 text-right">P/E</TableHead>
                      <TableHead className="text-zinc-400 text-right">Div Yield</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocks.map((stock) => (
                      <TableRow 
                        key={stock.symbol} 
                        className="border-white/5 hover:bg-white/5 cursor-pointer"
                        onClick={() => setSelectedStock(stock)}
                      >
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-primary border-primary/30">
                            {stock.symbol}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-white">{stock.name}</TableCell>
                        <TableCell className="text-zinc-400">{stock.sector || '-'}</TableCell>
                        <TableCell className="text-right font-medium text-white">
                          {formatCurrency(stock.currentPrice)}
                        </TableCell>
                        <TableCell className={`text-right ${(stock.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          <div className="flex items-center justify-end gap-1">
                            {(stock.changePercent || 0) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {formatPercentage(stock.changePercent)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-white">{formatMarketCap(stock.marketCap)}</TableCell>
                        <TableCell className="text-right text-zinc-400">{stock.peRatio?.toFixed(2) || '-'}</TableCell>
                        <TableCell className="text-right text-zinc-400">
                          {stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Crypto Detail Dialog */}
      {selectedCrypto && (
        <Dialog open={!!selectedCrypto} onOpenChange={() => setSelectedCrypto(null)}>
          <DialogContent className="max-w-3xl bg-zinc-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                {selectedCrypto.image && (
                  <img src={selectedCrypto.image} alt={selectedCrypto.name} className="h-10 w-10 rounded-full" />
                )}
                <div>
                  <span>{selectedCrypto.name}</span>
                  <Badge variant="outline" className="ml-3 text-zinc-400">
                    {selectedCrypto.symbol}
                  </Badge>
                </div>
                <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30">
                  Rank #{selectedCrypto.marketCapRank}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <Card className="bg-zinc-800/50 border-white/10">
                <CardContent className="p-4">
                  <p className="text-xs text-zinc-400">Current Price</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(selectedCrypto.currentPrice)}</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-white/10">
                <CardContent className="p-4">
                  <p className="text-xs text-zinc-400">24h Change</p>
                  <p className={`text-xl font-bold ${(selectedCrypto.priceChange24h || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPercentage(selectedCrypto.priceChange24h)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-white/10">
                <CardContent className="p-4">
                  <p className="text-xs text-zinc-400">Market Cap</p>
                  <p className="text-xl font-bold text-white">{formatMarketCap(selectedCrypto.marketCap)}</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-white/10">
                <CardContent className="p-4">
                  <p className="text-xs text-zinc-400">24h Volume</p>
                  <p className="text-xl font-bold text-white">{formatMarketCap(selectedCrypto.volume24h)}</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-white/10">
                <CardContent className="p-4">
                  <p className="text-xs text-zinc-400">All-Time High</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(selectedCrypto.ath)}</p>
                  <p className="text-xs text-red-400">{formatPercentage(selectedCrypto.athChangePercentage)}</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-white/10">
                <CardContent className="p-4">
                  <p className="text-xs text-zinc-400">Circulating Supply</p>
                  <p className="text-xl font-bold text-white">{formatVolume(selectedCrypto.circulatingSupply)}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-zinc-800/30 rounded-lg">
                <p className="text-xs text-zinc-500">1h</p>
                <p className={`font-semibold ${(selectedCrypto.priceChange1h || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPercentage(selectedCrypto.priceChange1h)}
                </p>
              </div>
              <div className="text-center p-3 bg-zinc-800/30 rounded-lg">
                <p className="text-xs text-zinc-500">7d</p>
                <p className={`font-semibold ${(selectedCrypto.priceChange7d || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPercentage(selectedCrypto.priceChange7d)}
                </p>
              </div>
              <div className="text-center p-3 bg-zinc-800/30 rounded-lg">
                <p className="text-xs text-zinc-500">30d</p>
                <p className={`font-semibold ${(selectedCrypto.priceChange30d || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPercentage(selectedCrypto.priceChange30d)}
                </p>
              </div>
              <div className="text-center p-3 bg-zinc-800/30 rounded-lg">
                <p className="text-xs text-zinc-500">1y</p>
                <p className={`font-semibold ${(selectedCrypto.priceChange1y || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPercentage(selectedCrypto.priceChange1y)}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Stock Detail Dialog */}
      {selectedStock && (
        <Dialog open={!!selectedStock} onOpenChange={() => setSelectedStock(null)}>
          <DialogContent className="max-w-3xl bg-zinc-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div>
                  <Badge variant="outline" className="font-mono text-primary border-primary/30 text-lg">
                    {selectedStock.symbol}
                  </Badge>
                  <span className="ml-3">{selectedStock.name}</span>
                </div>
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                {selectedStock.sector} • {selectedStock.industry}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <Card className="bg-zinc-800/50 border-white/10">
                <CardContent className="p-4">
                  <p className="text-xs text-zinc-400">Current Price</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(selectedStock.currentPrice)}</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-white/10">
                <CardContent className="p-4">
                  <p className="text-xs text-zinc-400">Change</p>
                  <p className={`text-xl font-bold ${(selectedStock.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(selectedStock.change)} ({formatPercentage(selectedStock.changePercent)})
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-white/10">
                <CardContent className="p-4">
                  <p className="text-xs text-zinc-400">Market Cap</p>
                  <p className="text-xl font-bold text-white">{formatMarketCap(selectedStock.marketCap)}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-zinc-800/30 rounded-lg">
                <p className="text-xs text-zinc-500">P/E Ratio</p>
                <p className="font-semibold text-white">{selectedStock.peRatio?.toFixed(2) || '-'}</p>
              </div>
              <div className="text-center p-3 bg-zinc-800/30 rounded-lg">
                <p className="text-xs text-zinc-500">EPS</p>
                <p className="font-semibold text-white">{formatCurrency(selectedStock.eps)}</p>
              </div>
              <div className="text-center p-3 bg-zinc-800/30 rounded-lg">
                <p className="text-xs text-zinc-500">Dividend Yield</p>
                <p className="font-semibold text-white">{selectedStock.dividendYield?.toFixed(2) || '0'}%</p>
              </div>
              <div className="text-center p-3 bg-zinc-800/30 rounded-lg">
                <p className="text-xs text-zinc-500">Beta</p>
                <p className="font-semibold text-white">{selectedStock.beta?.toFixed(2) || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card className="bg-zinc-800/50 border-white/10">
                <CardContent className="p-4">
                  <p className="text-sm text-zinc-400 mb-2">52-Week Range</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-400">{formatCurrency(selectedStock.fiftyTwoWeekLow)}</span>
                    <span className="text-emerald-400">{formatCurrency(selectedStock.fiftyTwoWeekHigh)}</span>
                  </div>
                  <div className="mt-2 h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500"
                      style={{ 
                        width: `${((selectedStock.currentPrice - selectedStock.fiftyTwoWeekLow) / 
                          (selectedStock.fiftyTwoWeekHigh - selectedStock.fiftyTwoWeekLow)) * 100}%` 
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-800/50 border-white/10">
                <CardContent className="p-4">
                  <p className="text-sm text-zinc-400 mb-2">Moving Averages</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">50-Day MA</span>
                      <span className="text-white">{formatCurrency(selectedStock.fiftyDayMA)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">200-Day MA</span>
                      <span className="text-white">{formatCurrency(selectedStock.twoHundredDayMA)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
