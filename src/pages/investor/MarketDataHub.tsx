import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MarketDataHub() {
  const { toast } = useToast();

  const marketData = [
    { name: "S&P 500", value: "4,783.45", change: "+1.2%", trend: "up" },
    { name: "NASDAQ", value: "15,095.14", change: "+0.8%", trend: "up" },
    { name: "Bitcoin", value: "$43,250", change: "-2.3%", trend: "down" },
    { name: "Gold", value: "$2,045/oz", change: "+0.5%", trend: "up" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Market Data Hub</h1>
          <p className="text-muted-foreground mt-2">Real-time market data and analytics</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketData.map((market) => (
          <Card key={market.name}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{market.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{market.value}</div>
              <div className={`flex items-center gap-1 text-sm ${market.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {market.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {market.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="stocks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
          <TabsTrigger value="forex">Forex</TabsTrigger>
        </TabsList>

        <TabsContent value="stocks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Stock Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">US Markets</p>
                    <p className="text-sm text-muted-foreground">NYSE, NASDAQ</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">European Markets</p>
                    <p className="text-sm text-muted-foreground">LSE, Euronext</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Asian Markets</p>
                    <p className="text-sm text-muted-foreground">Tokyo, Shanghai, Hong Kong</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cryptocurrency Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Real-time cryptocurrency prices, market caps, and trading volumes.</p>
              <Button className="mt-4">View Crypto Data</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commodities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commodities & Precious Metals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Track prices for gold, silver, oil, and other commodities.</p>
              <Button className="mt-4">View Commodities</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forex" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Foreign Exchange Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Live forex rates and currency exchange data.</p>
              <Button className="mt-4">View Forex Rates</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
