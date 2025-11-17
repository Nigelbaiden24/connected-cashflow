import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, TrendingUp, AlertTriangle, Activity, UserCheck, FileText, Globe, Zap, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const SignalsAlerts = () => {
  const [notifications, setNotifications] = useState({
    priceSurge: true,
    volumeSpike: true,
    insiderBuying: true,
    analystRating: true,
    filings: true,
    macro: true
  });

  const priceSurgeAlerts = [
    {
      id: "1",
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      change: "+8.4%",
      price: "$875.23",
      trigger: "Price up 5%+ in 1 hour",
      time: "15 mins ago",
      severity: "high"
    },
    {
      id: "2",
      ticker: "TSLA",
      company: "Tesla Inc.",
      change: "+6.2%",
      price: "$248.56",
      trigger: "Breaking resistance level",
      time: "1 hour ago",
      severity: "medium"
    },
    {
      id: "3",
      ticker: "AAPL",
      company: "Apple Inc.",
      change: "-5.1%",
      price: "$182.34",
      trigger: "Sharp decline detected",
      time: "2 hours ago",
      severity: "high"
    },
  ];

  const volumeSpikeAlerts = [
    {
      id: "1",
      ticker: "AMD",
      company: "Advanced Micro Devices",
      volumeIncrease: "325%",
      currentVolume: "125M",
      avgVolume: "38M",
      time: "30 mins ago",
      priceChange: "+4.2%"
    },
    {
      id: "2",
      ticker: "PLTR",
      company: "Palantir Technologies",
      volumeIncrease: "280%",
      currentVolume: "95M",
      avgVolume: "34M",
      time: "1 hour ago",
      priceChange: "+3.8%"
    },
    {
      id: "3",
      ticker: "META",
      company: "Meta Platforms",
      volumeIncrease: "210%",
      currentVolume: "42M",
      avgVolume: "20M",
      time: "3 hours ago",
      priceChange: "+2.1%"
    },
  ];

  const insiderBuyingAlerts = [
    {
      id: "1",
      ticker: "MSFT",
      company: "Microsoft Corporation",
      insider: "Satya Nadella (CEO)",
      transaction: "Purchased 50,000 shares",
      value: "$21.2M",
      date: "Today",
      priceAtPurchase: "$424.50"
    },
    {
      id: "2",
      ticker: "GOOGL",
      company: "Alphabet Inc.",
      insider: "Sundar Pichai (CEO)",
      transaction: "Purchased 30,000 shares",
      value: "$4.8M",
      date: "Yesterday",
      priceAtPurchase: "$159.80"
    },
    {
      id: "3",
      ticker: "JPM",
      company: "JPMorgan Chase",
      insider: "Jamie Dimon (CEO)",
      transaction: "Purchased 75,000 shares",
      value: "$14.6M",
      date: "2 days ago",
      priceAtPurchase: "$194.20"
    },
  ];

  const analystRatingAlerts = [
    {
      id: "1",
      ticker: "NFLX",
      company: "Netflix Inc.",
      analyst: "Goldman Sachs",
      oldRating: "Neutral",
      newRating: "Buy",
      priceTarget: "$725",
      currentPrice: "$612.45",
      upside: "+18.4%",
      time: "2 hours ago"
    },
    {
      id: "2",
      ticker: "UBER",
      company: "Uber Technologies",
      analyst: "Morgan Stanley",
      oldRating: "Hold",
      newRating: "Overweight",
      priceTarget: "$92",
      currentPrice: "$78.30",
      upside: "+17.5%",
      time: "5 hours ago"
    },
    {
      id: "3",
      ticker: "DIS",
      company: "Walt Disney Co.",
      analyst: "JP Morgan",
      oldRating: "Overweight",
      newRating: "Neutral",
      priceTarget: "$105",
      currentPrice: "$112.80",
      upside: "-6.9%",
      time: "1 day ago"
    },
  ];

  const filingAlerts = [
    {
      id: "1",
      ticker: "COIN",
      company: "Coinbase Global",
      filingType: "8-K",
      description: "Material acquisition announced",
      filedDate: "Today, 4:30 PM EST",
      impact: "Positive",
      marketReaction: "+3.2%"
    },
    {
      id: "2",
      ticker: "BA",
      company: "Boeing Company",
      filingType: "10-Q",
      description: "Quarterly earnings report filed",
      filedDate: "Today, 2:15 PM EST",
      impact: "Neutral",
      marketReaction: "-0.8%"
    },
    {
      id: "3",
      ticker: "SQ",
      company: "Block Inc.",
      filingType: "S-3",
      description: "Stock offering registration",
      filedDate: "Yesterday, 5:45 PM EST",
      impact: "Negative",
      marketReaction: "-2.4%"
    },
  ];

  const macroAlerts = [
    {
      id: "1",
      event: "Fed Interest Rate Decision",
      description: "FOMC maintains rates at 5.25-5.50%",
      impact: "Market rallies on dovish commentary",
      time: "2:00 PM EST Today",
      marketReaction: "S&P 500 +1.8%, Nasdaq +2.3%",
      severity: "high"
    },
    {
      id: "2",
      event: "CPI Inflation Print",
      description: "Core CPI rises 3.2% YoY, below expectations",
      impact: "Lower inflation supports risk assets",
      time: "8:30 AM EST Today",
      marketReaction: "10-Year Treasury -12bps",
      severity: "high"
    },
    {
      id: "3",
      event: "Unemployment Rate",
      description: "Jobless rate holds at 3.8%",
      impact: "Labor market remains resilient",
      time: "8:30 AM EST Today",
      marketReaction: "USD +0.3%",
      severity: "medium"
    },
    {
      id: "4",
      event: "ECB Policy Decision",
      description: "European Central Bank cuts rates by 25bps",
      impact: "Euro weakens, European stocks rally",
      time: "7:45 AM EST Today",
      marketReaction: "EUR/USD -0.8%",
      severity: "medium"
    },
  ];

  const handleToggleNotification = (type: keyof typeof notifications) => {
    setNotifications({ ...notifications, [type]: !notifications[type] });
    toast.success(`${type} alerts ${!notifications[type] ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Signals & Alerts</h1>
          <p className="text-muted-foreground mt-2">
            Real-time market signals, insider activity, and macro event alerts
          </p>
        </div>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Preferences
          </CardTitle>
          <CardDescription>Enable or disable specific alert types</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Price Surge Alerts</p>
                <p className="text-xs text-muted-foreground">Large price movements</p>
              </div>
            </div>
            <Switch
              checked={notifications.priceSurge}
              onCheckedChange={() => handleToggleNotification('priceSurge')}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Volume Spike Alerts</p>
                <p className="text-xs text-muted-foreground">Unusual trading volume</p>
              </div>
            </div>
            <Switch
              checked={notifications.volumeSpike}
              onCheckedChange={() => handleToggleNotification('volumeSpike')}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Insider Buying Alerts</p>
                <p className="text-xs text-muted-foreground">Executive transactions</p>
              </div>
            </div>
            <Switch
              checked={notifications.insiderBuying}
              onCheckedChange={() => handleToggleNotification('insiderBuying')}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Analyst Rating Changes</p>
                <p className="text-xs text-muted-foreground">Upgrades & downgrades</p>
              </div>
            </div>
            <Switch
              checked={notifications.analystRating}
              onCheckedChange={() => handleToggleNotification('analystRating')}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Filing Alerts</p>
                <p className="text-xs text-muted-foreground">SEC filings & disclosures</p>
              </div>
            </div>
            <Switch
              checked={notifications.filings}
              onCheckedChange={() => handleToggleNotification('filings')}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Macro Alerts</p>
                <p className="text-xs text-muted-foreground">Fed, inflation, economic data</p>
              </div>
            </div>
            <Switch
              checked={notifications.macro}
              onCheckedChange={() => handleToggleNotification('macro')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Different Alert Types */}
      <Tabs defaultValue="price" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="price">
            <TrendingUp className="h-4 w-4 mr-2" />
            Price Surge
          </TabsTrigger>
          <TabsTrigger value="volume">
            <Activity className="h-4 w-4 mr-2" />
            Volume Spike
          </TabsTrigger>
          <TabsTrigger value="insider">
            <UserCheck className="h-4 w-4 mr-2" />
            Insider
          </TabsTrigger>
          <TabsTrigger value="analyst">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyst
          </TabsTrigger>
          <TabsTrigger value="filings">
            <FileText className="h-4 w-4 mr-2" />
            Filings
          </TabsTrigger>
          <TabsTrigger value="macro">
            <Globe className="h-4 w-4 mr-2" />
            Macro
          </TabsTrigger>
        </TabsList>

        {/* Price Surge Alerts */}
        <TabsContent value="price" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Price Surge Alerts</h2>
          </div>

          {priceSurgeAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[80px]">
                      <span className="font-bold text-lg">{alert.ticker}</span>
                      <span className="text-xs text-muted-foreground">{alert.price}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{alert.company}</h3>
                      <p className="text-sm text-muted-foreground">{alert.trigger}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={alert.change.startsWith('+') ? 'default' : 'destructive'} className="text-lg mb-2">
                      {alert.change}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                    {alert.severity === 'high' ? 'High Priority' : 'Medium Priority'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Volume Spike Alerts */}
        <TabsContent value="volume" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Volume Spike Alerts</h2>
          </div>

          {volumeSpikeAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[80px]">
                      <span className="font-bold text-lg">{alert.ticker}</span>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {alert.priceChange}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{alert.company}</h3>
                      <p className="text-sm text-muted-foreground">
                        Volume: {alert.currentVolume} (Avg: {alert.avgVolume})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="text-lg mb-2 bg-orange-500">
                      <Zap className="h-4 w-4 mr-1" />
                      +{alert.volumeIncrease}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Insider Buying Alerts */}
        <TabsContent value="insider" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Insider Buying Alerts</h2>
          </div>

          {insiderBuyingAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[80px]">
                      <span className="font-bold text-lg">{alert.ticker}</span>
                      <span className="text-xs text-muted-foreground">{alert.priceAtPurchase}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{alert.company}</h3>
                      <p className="text-sm font-medium text-primary">{alert.insider}</p>
                      <p className="text-sm text-muted-foreground">{alert.transaction}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="text-base mb-1 bg-green-500">{alert.value}</Badge>
                    <p className="text-xs text-muted-foreground">{alert.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Analyst Rating Change Alerts */}
        <TabsContent value="analyst" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Analyst Rating Changes</h2>
          </div>

          {analystRatingAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[80px]">
                      <span className="font-bold text-lg">{alert.ticker}</span>
                      <span className="text-xs text-muted-foreground">{alert.currentPrice}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{alert.company}</h3>
                      <p className="text-sm font-medium text-primary">{alert.analyst}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{alert.oldRating}</Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge>{alert.newRating}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="font-bold text-lg">{alert.priceTarget}</p>
                    </div>
                    <Badge variant={alert.upside.startsWith('+') ? 'default' : 'destructive'}>
                      {alert.upside}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Filing Alerts */}
        <TabsContent value="filings" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Filing Alerts</h2>
          </div>

          {filingAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[80px]">
                      <span className="font-bold text-lg">{alert.ticker}</span>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {alert.filingType}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{alert.company}</h3>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.filedDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={alert.impact === 'Positive' ? 'default' : alert.impact === 'Negative' ? 'destructive' : 'secondary'}
                      className="mb-2"
                    >
                      {alert.impact}
                    </Badge>
                    <p className="text-sm font-medium">{alert.marketReaction}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Macro Alerts */}
        <TabsContent value="macro" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Macro Economic Alerts</h2>
          </div>

          {macroAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-lg transition-shadow border-2">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <AlertTriangle className={`h-12 w-12 ${alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                    <div>
                      <h3 className="font-bold text-xl mb-1">{alert.event}</h3>
                      <p className="text-base font-medium text-muted-foreground mb-2">{alert.description}</p>
                      <p className="text-sm text-primary">{alert.impact}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'} className="mb-2">
                      {alert.severity === 'high' ? 'High Impact' : 'Medium Impact'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Market Reaction:</p>
                  <p className="text-sm text-muted-foreground">{alert.marketReaction}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SignalsAlerts;