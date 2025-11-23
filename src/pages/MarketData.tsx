import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Search, RefreshCw, DollarSign, BarChart3, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MarketData = () => {
  const navigate = useNavigate();
  const [searchTicker, setSearchTicker] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [liveData, setLiveData] = useState<any>(null);

  const majorIndices = [
    {
      name: "S&P 500",
      symbol: "SPX",
      price: "4,247.68",
      change: "+34.12",
      changePercent: "+0.81%",
      trend: "up",
    },
    {
      name: "Dow Jones",
      symbol: "DJI",
      price: "33,876.78",
      change: "+267.55",
      changePercent: "+0.80%",
      trend: "up",
    },
    {
      name: "NASDAQ",
      symbol: "IXIC",
      price: "13,259.14",
      change: "+128.95",
      changePercent: "+0.98%",
      trend: "up",
    },
    {
      name: "Russell 2000",
      symbol: "RUT",
      price: "1,876.23",
      change: "-8.45",
      changePercent: "-0.45%",
      trend: "down",
    },
  ];

  const topMovers = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: "$189.42",
      change: "+2.18%",
      volume: "52.3M",
      trend: "up",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: "$378.91",
      change: "+1.87%",
      volume: "31.7M",
      trend: "up",
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: "$138.45",
      change: "+2.34%",
      volume: "28.9M",
      trend: "up",
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: "$248.73",
      change: "-1.23%",
      volume: "89.2M",
      trend: "down",
    },
  ];

  const sectorPerformance = [
    { sector: "Technology", change: "+1.8%", trend: "up" },
    { sector: "Healthcare", change: "+1.1%", trend: "up" },
    { sector: "Financial", change: "+0.7%", trend: "up" },
    { sector: "Energy", change: "+3.2%", trend: "up" },
    { sector: "Consumer Disc.", change: "-0.3%", trend: "down" },
    { sector: "Utilities", change: "-0.8%", trend: "down" },
    { sector: "Real Estate", change: "+0.4%", trend: "up" },
    { sector: "Materials", change: "+1.5%", trend: "up" },
  ];

  const currencyRates = [
    { pair: "EUR/USD", rate: "1.0892", change: "+0.12%" },
    { pair: "GBP/USD", rate: "1.2734", change: "-0.08%" },
    { pair: "USD/JPY", rate: "149.85", change: "+0.34%" },
    { pair: "USD/CAD", rate: "1.3567", change: "+0.21%" },
  ];

  const commodities = [
    { name: "Gold", price: "$2,031.40", change: "-0.5%" },
    { name: "Silver", price: "$24.87", change: "+0.8%" },
    { name: "Crude Oil", price: "$89.73", change: "+1.2%" },
    { name: "Natural Gas", price: "$2.89", change: "-2.1%" },
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
    console.log("Searching for:", searchTicker);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Market Data</h1>
            <p className="text-muted-foreground">
              Real-time financial market information and analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter ticker symbol"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value)}
              className="w-40"
            />
            <Button onClick={handleSearch} size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="indices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="indices">Indices</TabsTrigger>
          <TabsTrigger value="stocks">Top Movers</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="forex">Forex</TabsTrigger>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
        </TabsList>

        <TabsContent value="indices">
          {isLoading ? (
            <div className="text-center py-8">Loading live market data...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(liveData?.investments || majorIndices).slice(0, 8).map((index: any) => (
                <Card key={index.symbol}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {index.name || index.symbol}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {index.symbol}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${index.price?.toFixed(2) || index.price}
                    </div>
                    <div className="flex items-center text-xs">
                      {(index.change >= 0 || index.trend === "up") ? (
                        <TrendingUp className="mr-1 h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                      )}
                      <span className={(index.change >= 0 || index.trend === "up") ? "text-success" : "text-destructive"}>
                        {index.change >= 0 ? "+" : ""}{index.change?.toFixed(2) || index.change} ({index.changePercent?.toFixed(2) || index.changePercent}%)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stocks">
          <Card>
            <CardHeader>
              <CardTitle>Top Movers</CardTitle>
              <CardDescription>
                Most active stocks by volume and price movement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {(liveData?.investments || topMovers).slice(0, 4).map((stock: any) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{stock.symbol}</p>
                          <Badge variant="outline" className="text-xs">
                            Vol: {stock.volume ? stock.volume : (stock.volume || "N/A")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {stock.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${stock.price?.toFixed?.(2) || stock.price}</p>
                        <div className="flex items-center text-xs">
                          {(stock.change >= 0 || stock.trend === "up") ? (
                            <TrendingUp className="mr-1 h-3 w-3 text-success" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                          )}
                          <span className={(stock.change >= 0 || stock.trend === "up") ? "text-success" : "text-destructive"}>
                            {stock.changePercent?.toFixed?.(2) || stock.change}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors">
          <Card>
            <CardHeader>
              <CardTitle>Sector Performance</CardTitle>
              <CardDescription>
                Daily performance by market sector
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {sectorPerformance.map((sector) => (
                  <div
                    key={sector.sector}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{sector.sector}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      {sector.trend === "up" ? (
                        <TrendingUp className="mr-1 h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                      )}
                      <span className={sector.trend === "up" ? "text-success" : "text-destructive"}>
                        {sector.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forex">
          <Card>
            <CardHeader>
              <CardTitle>Currency Exchange Rates</CardTitle>
              <CardDescription>
                Major currency pairs and their daily performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {currencyRates.map((currency) => (
                  <div
                    key={currency.pair}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{currency.pair}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{currency.rate}</p>
                      <p className="text-xs text-muted-foreground">{currency.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commodities">
          <Card>
            <CardHeader>
              <CardTitle>Commodities</CardTitle>
              <CardDescription>
                Precious metals and energy commodity prices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {commodities.map((commodity) => (
                  <div
                    key={commodity.name}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="text-sm font-medium">{commodity.name}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">{commodity.price}</p>
                      <p className="text-xs text-muted-foreground">{commodity.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketData;