import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  RefreshCw, 
  DollarSign, 
  BarChart3, 
  ArrowLeft,
  Activity,
  Fuel,
  Gem,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Sparkles,
  Clock,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MarketData = () => {
  const navigate = useNavigate();
  const [searchTicker, setSearchTicker] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [liveData, setLiveData] = useState<any>(null);

  const majorIndices = [
    { name: "S&P 500", symbol: "SPX", price: "4,247.68", change: "+34.12", changePercent: "+0.81%", trend: "up", volume: "2.8B", high: "4,259.32", low: "4,218.45" },
    { name: "Dow Jones", symbol: "DJI", price: "33,876.78", change: "+267.55", changePercent: "+0.80%", trend: "up", volume: "412M", high: "33,921.54", low: "33,654.23" },
    { name: "NASDAQ", symbol: "IXIC", price: "13,259.14", change: "+128.95", changePercent: "+0.98%", trend: "up", volume: "4.2B", high: "13,312.87", low: "13,156.42" },
    { name: "Russell 2000", symbol: "RUT", price: "1,876.23", change: "-8.45", changePercent: "-0.45%", trend: "down", volume: "892M", high: "1,891.67", low: "1,869.12" },
    { name: "FTSE 100", symbol: "UKX", price: "7,532.45", change: "+42.18", changePercent: "+0.56%", trend: "up", volume: "1.2B", high: "7,548.92", low: "7,498.34" },
    { name: "DAX", symbol: "DAX", price: "15,987.23", change: "-45.67", changePercent: "-0.28%", trend: "down", volume: "856M", high: "16,045.78", low: "15,934.56" },
  ];

  const topMovers = [
    { symbol: "NVDA", name: "NVIDIA Corporation", price: "487.21", change: "+5.82%", volume: "52.3M", marketCap: "1.21T", trend: "up", sector: "Technology" },
    { symbol: "AAPL", name: "Apple Inc.", price: "189.42", change: "+2.18%", volume: "48.7M", marketCap: "2.98T", trend: "up", sector: "Technology" },
    { symbol: "MSFT", name: "Microsoft Corp.", price: "378.91", change: "+1.87%", volume: "31.7M", marketCap: "2.81T", trend: "up", sector: "Technology" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: "138.45", change: "+2.34%", volume: "28.9M", marketCap: "1.74T", trend: "up", sector: "Technology" },
    { symbol: "TSLA", name: "Tesla Inc.", price: "248.73", change: "-1.23%", volume: "89.2M", marketCap: "790B", trend: "down", sector: "Automotive" },
    { symbol: "META", name: "Meta Platforms", price: "326.54", change: "+3.12%", volume: "21.4M", marketCap: "836B", trend: "up", sector: "Technology" },
  ];

  const sectorPerformance = [
    { sector: "Technology", change: "+1.8%", trend: "up", marketCap: "14.2T", leaders: ["AAPL", "MSFT", "NVDA"], ytd: "+32.4%" },
    { sector: "Healthcare", change: "+1.1%", trend: "up", marketCap: "5.8T", leaders: ["UNH", "JNJ", "LLY"], ytd: "+8.2%" },
    { sector: "Financial", change: "+0.7%", trend: "up", marketCap: "4.2T", leaders: ["JPM", "BAC", "V"], ytd: "+12.6%" },
    { sector: "Energy", change: "+3.2%", trend: "up", marketCap: "2.1T", leaders: ["XOM", "CVX", "COP"], ytd: "-4.8%" },
    { sector: "Consumer Disc.", change: "-0.3%", trend: "down", marketCap: "3.9T", leaders: ["AMZN", "TSLA", "HD"], ytd: "+28.1%" },
    { sector: "Utilities", change: "-0.8%", trend: "down", marketCap: "1.4T", leaders: ["NEE", "DUK", "SO"], ytd: "-12.3%" },
    { sector: "Real Estate", change: "+0.4%", trend: "up", marketCap: "1.2T", leaders: ["PLD", "AMT", "EQIX"], ytd: "-6.7%" },
    { sector: "Materials", change: "+1.5%", trend: "up", marketCap: "890B", leaders: ["LIN", "APD", "SHW"], ytd: "+5.4%" },
  ];

  const currencyRates = [
    { pair: "EUR/USD", rate: "1.0892", change: "+0.12%", trend: "up", bid: "1.0890", ask: "1.0894", dayRange: "1.0845 - 1.0912" },
    { pair: "GBP/USD", rate: "1.2734", change: "-0.08%", trend: "down", bid: "1.2732", ask: "1.2736", dayRange: "1.2698 - 1.2765" },
    { pair: "USD/JPY", rate: "149.85", change: "+0.34%", trend: "up", bid: "149.83", ask: "149.87", dayRange: "149.12 - 150.23" },
    { pair: "USD/CAD", rate: "1.3567", change: "+0.21%", trend: "up", bid: "1.3565", ask: "1.3569", dayRange: "1.3521 - 1.3589" },
    { pair: "AUD/USD", rate: "0.6589", change: "+0.31%", trend: "up", bid: "0.6587", ask: "0.6591", dayRange: "0.6542 - 0.6612" },
    { pair: "USD/CHF", rate: "0.8756", change: "-0.12%", trend: "down", bid: "0.8754", ask: "0.8758", dayRange: "0.8723 - 0.8789" },
  ];

  const commodities = [
    { name: "Gold", symbol: "XAU", price: "1,605.12", change: "-0.5%", trend: "down", unit: "/oz", dayHigh: "1,618.56", dayLow: "1,599.84", ytd: "+9.2%" },
    { name: "Silver", symbol: "XAG", price: "19.66", change: "+0.8%", trend: "up", unit: "/oz", dayHigh: "19.85", dayLow: "19.41", ytd: "+3.4%" },
    { name: "Crude Oil (Brent)", symbol: "CL", price: "70.89", change: "+1.2%", trend: "up", unit: "/bbl", dayHigh: "71.46", dayLow: "70.25", ytd: "+12.8%" },
    { name: "Natural Gas", symbol: "NG", price: "2.28", change: "-2.1%", trend: "down", unit: "/MMBtu", dayHigh: "2.35", dayLow: "2.25", ytd: "-34.2%" },
    { name: "Copper", symbol: "HG", price: "3.06", change: "+0.6%", trend: "up", unit: "/lb", dayHigh: "3.09", dayLow: "3.03", ytd: "+2.1%" },
    { name: "Platinum", symbol: "PL", price: "721.08", change: "+1.4%", trend: "up", unit: "/oz", dayHigh: "725.66", dayLow: "716.10", ytd: "-8.6%" },
  ];

  const fetchMarketData = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: { symbols: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'JNJ', 'NVDA', 'META', 'AMZN'] }
      });

      if (error) throw error;
      setLiveData(data);
      toast.success("Market data updated");
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast.error("Failed to fetch market data");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const handleRefresh = () => {
    fetchMarketData();
  };

  const handleSearch = () => {
    if (searchTicker.trim()) {
      toast.info(`Searching for ${searchTicker.toUpperCase()}...`);
    }
  };

  const formatLargeNumber = (num: string) => {
    if (num.includes('T')) return num;
    if (num.includes('B')) return num;
    if (num.includes('M')) return num;
    return num;
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Market Data
              </h1>
              <Badge variant="secondary" className="animate-pulse">
                <span className="w-2 h-2 bg-success rounded-full mr-1.5 animate-pulse" />
                Live
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Real-time financial market intelligence and analytics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ticker..."
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9 w-48 bg-background/50 border-border/50 focus:border-primary/50"
            />
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">S&P 500</p>
                <p className="text-xl font-bold">4,247.68</p>
              </div>
              <div className="flex items-center gap-1 text-success">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+0.81%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">NASDAQ</p>
                <p className="text-xl font-bold">13,259.14</p>
              </div>
              <div className="flex items-center gap-1 text-success">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+0.98%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Gold</p>
                <p className="text-xl font-bold">$2,031.40</p>
              </div>
              <div className="flex items-center gap-1 text-destructive">
                <ArrowDownRight className="h-4 w-4" />
                <span className="text-sm font-medium">-0.50%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">EUR/USD</p>
                <p className="text-xl font-bold">1.0892</p>
              </div>
              <div className="flex items-center gap-1 text-success">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">+0.12%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="indices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 h-12">
          <TabsTrigger value="indices" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Indices</span>
          </TabsTrigger>
          <TabsTrigger value="stocks" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Top Movers</span>
          </TabsTrigger>
          <TabsTrigger value="sectors" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Sectors</span>
          </TabsTrigger>
          <TabsTrigger value="forex" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Forex</span>
          </TabsTrigger>
          <TabsTrigger value="commodities" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Gem className="h-4 w-4" />
            <span className="hidden sm:inline">Commodities</span>
          </TabsTrigger>
        </TabsList>

        {/* Indices Tab */}
        <TabsContent value="indices" className="space-y-6 animate-fade-in">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {majorIndices.map((index) => (
                  <Card key={index.symbol} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            index.trend === 'up' ? 'bg-success/10' : 'bg-destructive/10'
                          }`}>
                            {index.trend === 'up' ? (
                              <TrendingUp className="h-5 w-5 text-success" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-destructive" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base">{index.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{index.symbol}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Vol: {index.volume}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold">{index.price}</span>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                          index.trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                        }`}>
                          {index.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          <span className="text-sm font-medium">{index.changePercent}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <span>H: {index.high}</span>
                        <span>L: {index.low}</span>
                        <span className={index.trend === 'up' ? 'text-success' : 'text-destructive'}>
                          {index.change}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Top Movers Tab */}
        <TabsContent value="stocks" className="space-y-6 animate-fade-in">
          <Card className="border-border/50">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Top Movers</CardTitle>
                    <CardDescription>Most active stocks by volume and price movement</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Updated just now</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[200px]">Symbol</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Market Cap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMovers.map((stock) => (
                    <TableRow key={stock.symbol} className="group hover:bg-muted/50 cursor-pointer border-border/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            stock.trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                          }`}>
                            {stock.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">{stock.symbol}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{stock.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{stock.sector}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">£{stock.price}</TableCell>
                      <TableCell className="text-right">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                          stock.trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                        }`}>
                          {stock.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          <span className="text-sm font-medium">{stock.change}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{stock.volume}</TableCell>
                      <TableCell className="text-right font-medium">{stock.marketCap}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sectors Tab */}
        <TabsContent value="sectors" className="space-y-6 animate-fade-in">
          <div className="grid gap-4 md:grid-cols-2">
            {sectorPerformance.map((sector) => (
              <Card key={sector.sector} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        sector.trend === 'up' ? 'bg-success/10' : 'bg-destructive/10'
                      }`}>
                        <BarChart3 className={`h-6 w-6 ${sector.trend === 'up' ? 'text-success' : 'text-destructive'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{sector.sector}</h3>
                        <p className="text-xs text-muted-foreground">Market Cap: {sector.marketCap}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                        sector.trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {sector.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="font-semibold">{sector.change}</span>
                      </div>
                      <p className={`text-xs mt-1 ${sector.ytd.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                        YTD: {sector.ytd}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Top Holdings</span>
                      <span>Performance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {sector.leaders.map((leader) => (
                          <Badge key={leader} variant="outline" className="text-xs px-2">
                            {leader}
                          </Badge>
                        ))}
                      </div>
                      <Progress 
                        value={Math.abs(parseFloat(sector.change)) * 10} 
                        className={`w-20 h-2 ${sector.trend === 'up' ? '[&>div]:bg-success' : '[&>div]:bg-destructive'}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Forex Tab */}
        <TabsContent value="forex" className="space-y-6 animate-fade-in">
          <Card className="border-border/50">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Foreign Exchange Rates</CardTitle>
                  <CardDescription>Major currency pairs with bid/ask spreads</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>Currency Pair</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Bid</TableHead>
                    <TableHead className="text-right">Ask</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Day Range</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencyRates.map((currency) => (
                    <TableRow key={currency.pair} className="hover:bg-muted/50 border-border/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{currency.pair}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">{currency.rate}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{currency.bid}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{currency.ask}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center gap-1 ${
                          currency.trend === 'up' ? 'text-success' : 'text-destructive'
                        }`}>
                          {currency.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {currency.change}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{currency.dayRange}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commodities Tab */}
        <TabsContent value="commodities" className="space-y-6 animate-fade-in">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {commodities.map((commodity) => (
              <Card key={commodity.symbol} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden">
                <div className={`h-1 ${commodity.trend === 'up' ? 'bg-success' : 'bg-destructive'}`} />
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        commodity.name === 'Gold' ? 'bg-amber-500/10' :
                        commodity.name === 'Silver' ? 'bg-slate-400/10' :
                        commodity.name.includes('Oil') ? 'bg-orange-500/10' :
                        commodity.name.includes('Gas') ? 'bg-blue-500/10' :
                        commodity.name === 'Copper' ? 'bg-orange-600/10' :
                        'bg-slate-500/10'
                      }`}>
                        {commodity.name.includes('Oil') || commodity.name.includes('Gas') ? (
                          <Fuel className={`h-6 w-6 ${
                            commodity.name.includes('Oil') ? 'text-orange-500' : 'text-blue-500'
                          }`} />
                        ) : (
                          <Gem className={`h-6 w-6 ${
                            commodity.name === 'Gold' ? 'text-amber-500' :
                            commodity.name === 'Silver' ? 'text-slate-400' :
                            commodity.name === 'Copper' ? 'text-orange-600' :
                            'text-slate-500'
                          }`} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{commodity.name}</h3>
                        <p className="text-xs text-muted-foreground">{commodity.symbol} • {commodity.unit}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold">£{commodity.price}</span>
                      <p className="text-xs text-muted-foreground mt-1">per {commodity.unit.replace('/', '')}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                      commodity.trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {commodity.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span className="font-semibold">{commodity.change}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">High</p>
                      <p className="text-sm font-medium">${commodity.dayHigh}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Low</p>
                      <p className="text-sm font-medium">${commodity.dayLow}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">YTD</p>
                      <p className={`text-sm font-medium ${commodity.ytd.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                        {commodity.ytd}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketData;
