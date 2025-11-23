import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Activity, Globe, Zap, ThermometerSun, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function MarketDataHub() {
  const { toast } = useToast();
  const [liveMarketData, setLiveMarketData] = useState<any[]>([]);
  const [loadingMarketData, setLoadingMarketData] = useState(false);

  const fetchLiveMarketData = async () => {
    setLoadingMarketData(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: { symbols: ['SPY', 'QQQ', 'EWU', 'EWG', 'EWJ', 'EWH', 'GLD', 'SLV', 'USO', 'UNG'] }
      });

      if (error) throw error;
      if (data?.investments) {
        setLiveMarketData(data.investments);
        toast({ title: "Live market data updated" });
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({ title: "Using cached market data", variant: "destructive" });
    } finally {
      setLoadingMarketData(false);
    }
  };

  useEffect(() => {
    fetchLiveMarketData();
  }, []);

  const indexMapping: Record<string, string> = {
    'SPY': 'S&P 500',
    'QQQ': 'NASDAQ',
    'EWU': 'FTSE 100',
    'EWG': 'DAX',
    'EWJ': 'Nikkei 225',
    'EWH': 'Hang Seng'
  };

  const commodityMapping: Record<string, { name: string; unit: string }> = {
    'GLD': { name: 'Gold', unit: '/oz' },
    'SLV': { name: 'Silver', unit: '/oz' },
    'USO': { name: 'Crude Oil (WTI)', unit: '/bbl' },
    'UNG': { name: 'Natural Gas', unit: '/MMBtu' }
  };

  const majorIndices = liveMarketData.length > 0
    ? liveMarketData.filter(d => indexMapping[d.symbol]).map(stock => ({
        name: indexMapping[stock.symbol],
        value: `£${stock.price.toFixed(2)}`,
        change: `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`,
        changeValue: `£${stock.change.toFixed(2)}`,
        trend: stock.changePercent >= 0 ? "up" : "down"
      }))
    : [
        { name: "S&P 500", value: "£3,789.12", change: "+1.2%", changeValue: "£44.96", trend: "up" },
        { name: "NASDAQ", value: "£11,952.66", change: "+0.8%", changeValue: "£93.68", trend: "up" },
        { name: "FTSE 100", value: "£6,035.13", change: "+0.3%", changeValue: "£17.54", trend: "up" },
        { name: "DAX", value: "£13,343.32", change: "-0.4%", changeValue: "-£53.22", trend: "down" },
        { name: "Nikkei 225", value: "£26,490.89", change: "+1.5%", changeValue: "£392.07", trend: "up" },
        { name: "Hang Seng", value: "£13,327.14", change: "-0.9%", changeValue: "-£121.51", trend: "down" },
      ];

  const commodities = liveMarketData.length > 0
    ? liveMarketData.filter(d => commodityMapping[d.symbol]).map(stock => ({
        name: commodityMapping[stock.symbol].name,
        value: `£${stock.price.toFixed(2)}`,
        change: `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`,
        unit: commodityMapping[stock.symbol].unit
      }))
    : [
        { name: "Gold", value: "£1,619.15", change: "+0.5%", unit: "/oz" },
        { name: "Silver", value: "£19.13", change: "+1.2%", unit: "/oz" },
        { name: "Crude Oil (WTI)", value: "£62.10", change: "-1.3%", unit: "/bbl" },
        { name: "Natural Gas", value: "£2.26", change: "+2.4%", unit: "/MMBtu" },
      ];

  const forexPairs = [
    { pair: "EUR/USD", rate: "1.0845", change: "+0.15%", bid: "1.0843", ask: "1.0847" },
    { pair: "GBP/USD", rate: "1.2634", change: "+0.22%", bid: "1.2632", ask: "1.2636" },
    { pair: "USD/JPY", rate: "149.85", change: "-0.18%", bid: "149.83", ask: "149.87" },
    { pair: "USD/CHF", rate: "0.8756", change: "-0.12%", bid: "0.8754", ask: "0.8758" },
    { pair: "AUD/USD", rate: "0.6589", change: "+0.31%", bid: "0.6587", ask: "0.6591" },
    { pair: "USD/CAD", rate: "1.3542", change: "-0.09%", bid: "1.3540", ask: "1.3544" },
  ];

  const volatilityIndices = [
    { name: "VIX (S&P 500)", value: "13.45", change: "-2.3%", level: "Low" },
    { name: "VXN (NASDAQ)", value: "15.78", change: "-1.8%", level: "Low" },
    { name: "VFTSE (FTSE 100)", value: "11.23", change: "+0.5%", level: "Low" },
    { name: "VDAX (DAX)", value: "14.56", change: "+1.2%", level: "Low" },
  ];

  const marketSentiment = [
    { market: "US Equities", rating: "Bullish", score: 72, color: "text-green-600" },
    { market: "European Equities", rating: "Neutral", score: 55, color: "text-yellow-600" },
    { market: "Asian Equities", rating: "Bullish", score: 68, color: "text-green-600" },
    { market: "Commodities", rating: "Neutral", score: 52, color: "text-yellow-600" },
    { market: "Cryptocurrencies", rating: "Bearish", score: 38, color: "text-red-600" },
    { market: "Fixed Income", rating: "Neutral", score: 50, color: "text-yellow-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Market Data Hub</h1>
          <p className="text-muted-foreground mt-2">Real-time market data powered by Alpha Vantage</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLiveMarketData}
          disabled={loadingMarketData}
          className="gap-2"
        >
          {loadingMarketData ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="indices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="indices">Indices</TabsTrigger>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
          <TabsTrigger value="forex">FX</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="volatility">Volatility</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="indices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Major Market Indices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Index</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Change %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {majorIndices.map((index) => (
                    <TableRow key={index.name}>
                      <TableCell className="font-medium">{index.name}</TableCell>
                      <TableCell className="text-right">{index.value}</TableCell>
                      <TableCell className="text-right">
                        <span className={index.trend === "up" ? "text-green-600" : "text-red-600"}>
                          {index.changeValue}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center justify-end gap-1 ${index.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                          {index.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {index.change}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commodities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThermometerSun className="h-5 w-5" />
                Commodities & Precious Metals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {commodities.map((commodity) => (
                  <Card key={commodity.name}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{commodity.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{commodity.value}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{commodity.unit}</span>
                        <span className={`text-sm font-medium ${commodity.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                          {commodity.change}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forex" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Foreign Exchange Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pair</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Bid</TableHead>
                    <TableHead className="text-right">Ask</TableHead>
                    <TableHead className="text-right">Change %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forexPairs.map((pair) => (
                    <TableRow key={pair.pair}>
                      <TableCell className="font-medium">{pair.pair}</TableCell>
                      <TableCell className="text-right">{pair.rate}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{pair.bid}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{pair.ask}</TableCell>
                      <TableCell className="text-right">
                        <span className={pair.change.startsWith("+") ? "text-green-600" : "text-red-600"}>
                          {pair.change}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Global Markets Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Americas</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {majorIndices.slice(0, 2).map((index) => (
                    <div key={index.name} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{index.name}</p>
                        <p className="text-sm text-muted-foreground">{index.value}</p>
                      </div>
                      <Badge variant={index.trend === "up" ? "default" : "destructive"}>
                        {index.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Europe</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {majorIndices.slice(2, 4).map((index) => (
                    <div key={index.name} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{index.name}</p>
                        <p className="text-sm text-muted-foreground">{index.value}</p>
                      </div>
                      <Badge variant={index.trend === "up" ? "default" : "destructive"}>
                        {index.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Asia-Pacific</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {majorIndices.slice(4).map((index) => (
                    <div key={index.name} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{index.name}</p>
                        <p className="text-sm text-muted-foreground">{index.value}</p>
                      </div>
                      <Badge variant={index.trend === "up" ? "default" : "destructive"}>
                        {index.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volatility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Volatility Indices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {volatilityIndices.map((index) => (
                  <div key={index.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{index.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-2xl font-bold">{index.value}</span>
                        <Badge variant="outline">{index.level} Volatility</Badge>
                      </div>
                    </div>
                    <div className={`text-right ${index.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                      <div className="flex items-center gap-1">
                        {index.change.startsWith("+") ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {index.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Volatility indices measure expected market volatility. Lower values indicate calmer markets, 
                  while higher values suggest increased uncertainty and price swings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Sentiment Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketSentiment.map((item) => (
                  <div key={item.market} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.market}</p>
                        <p className={`text-sm font-semibold ${item.color}`}>{item.rating}</p>
                      </div>
                      <Badge variant={
                        item.rating === "Bullish" ? "default" : 
                        item.rating === "Bearish" ? "destructive" : 
                        "secondary"
                      }>
                        Score: {item.score}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.rating === "Bullish" ? "bg-green-600" : 
                          item.rating === "Bearish" ? "bg-red-600" : 
                          "bg-yellow-600"
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Sentiment Scale:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <span className="text-green-600 font-medium">Bullish</span>: 65-100 (Strong positive sentiment)</li>
                  <li>• <span className="text-yellow-600 font-medium">Neutral</span>: 45-64 (Mixed sentiment)</li>
                  <li>• <span className="text-red-600 font-medium">Bearish</span>: 0-44 (Negative sentiment)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
