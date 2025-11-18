import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Globe, Sparkles, Activity, Eye, Star, BarChart3, RefreshCw, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { toast } from "sonner";

const InvestorDashboard = () => {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [aiInsightsText, setAiInsightsText] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  // Parse AI insights into individual insights
  const parseInsights = (text: string): string[] => {
    if (!text) return [];
    // Split by numbered points (1., 2., 3., etc.) or by double newlines
    const insights = text
      .split(/\n\n+|\n(?=\d+\.)/g)
      .map(insight => insight.trim())
      .filter(insight => insight.length > 0)
      .slice(0, 3); // Take only first 3 insights
    return insights;
  };
  
  const insights = parseInsights(aiInsightsText);

  const { analyzeWithAI, isLoading } = useAIAnalyst({
    onDelta: (text) => setAiInsightsText(prev => prev + text),
    onDone: () => {
      setLastRefreshed(new Date());
      toast.success("AI insights refreshed");
    },
    onError: (error) => {
      toast.error(error);
      setAiInsightsText("");
    }
  });

  const fetchDailyInsights = async () => {
    setAiInsightsText("");
    await analyzeWithAI(
      "Provide 3-5 key investment insights for today including market opportunities, risks, and sector analysis. Keep each insight concise and actionable.",
      "trends"
    );
  };

  useEffect(() => {
    const today = new Date().toDateString();
    const lastFetch = localStorage.getItem('lastInsightsFetch');
    
    if (lastFetch !== today) {
      fetchDailyInsights();
      localStorage.setItem('lastInsightsFetch', today);
    } else {
      const cachedInsights = localStorage.getItem('cachedInsights');
      const cachedTime = localStorage.getItem('cachedInsightsTime');
      if (cachedInsights && cachedTime) {
        setAiInsightsText(cachedInsights);
        setLastRefreshed(new Date(cachedTime));
      } else {
        fetchDailyInsights();
      }
    }
  }, []);

  useEffect(() => {
    if (aiInsightsText && lastRefreshed) {
      localStorage.setItem('cachedInsights', aiInsightsText);
      localStorage.setItem('cachedInsightsTime', lastRefreshed.toISOString());
    }
  }, [aiInsightsText, lastRefreshed]);

  const macroOverview = [
    { metric: "US GDP Growth", value: "2.4%", change: "+0.3%", positive: true },
    { metric: "Inflation (YoY)", value: "3.2%", change: "-0.5%", positive: true },
    { metric: "Unemployment", value: "3.8%", change: "+0.1%", positive: false },
    { metric: "Fed Funds Rate", value: "5.25%", change: "0.0%", positive: null }
  ];

  const topMovers = [
    { symbol: "NVDA", name: "NVIDIA Corp", price: "$875.32", change: "+8.45%", volume: "245M", positive: true },
    { symbol: "TSLA", name: "Tesla Inc", price: "$245.18", change: "+5.23%", volume: "156M", positive: true },
    { symbol: "AAPL", name: "Apple Inc", price: "$182.45", change: "+3.21%", volume: "89M", positive: true },
    { symbol: "META", name: "Meta Platforms", price: "$456.78", change: "-2.34%", volume: "34M", positive: false },
    { symbol: "MSFT", name: "Microsoft Corp", price: "$378.90", change: "-1.12%", volume: "28M", positive: false }
  ];

  const watchlistToday = [
    { name: "Apple Inc.", symbol: "AAPL", price: "$182.45", change: "+1.2%", trend: "up", alert: false },
    { name: "Bitcoin", symbol: "BTC", price: "$43,250", change: "+3.4%", trend: "up", alert: true },
    { name: "Tesla Inc.", symbol: "TSLA", price: "$245.18", change: "+3.1%", trend: "up", alert: false },
    { name: "Gold", symbol: "GC", price: "$2,045/oz", change: "+0.5%", trend: "up", alert: false }
  ];

  const sectorHeatmap = [
    { name: "Technology", performance: "+12.5%", value: 12.5, companies: 127 },
    { name: "Healthcare", performance: "+8.3%", value: 8.3, companies: 98 },
    { name: "Financials", performance: "+5.7%", value: 5.7, companies: 156 },
    { name: "Consumer Disc.", performance: "+4.2%", value: 4.2, companies: 89 },
    { name: "Energy", performance: "+3.8%", value: 3.8, companies: 67 },
    { name: "Industrials", performance: "+2.1%", value: 2.1, companies: 112 },
    { name: "Materials", performance: "-0.5%", value: -0.5, companies: 78 },
    { name: "Real Estate", performance: "-1.8%", value: -1.8, companies: 45 },
    { name: "Utilities", performance: "-2.3%", value: -2.3, companies: 34 },
    { name: "Telecom", performance: "-3.1%", value: -3.1, companies: 23 }
  ];

  const getHeatmapColor = (value: number) => {
    if (value >= 10) return "bg-green-600";
    if (value >= 5) return "bg-green-500";
    if (value >= 2) return "bg-green-400";
    if (value >= 0) return "bg-green-300";
    if (value >= -2) return "bg-red-300";
    if (value >= -5) return "bg-red-400";
    return "bg-red-500";
  };

  return (
    <div className="p-6 space-y-6 investor-theme">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investment Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your global investment portal
        </p>
      </div>

      {/* AI Insights of the Day */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">AI Insights of the Day</h2>
          </div>
          <div className="flex items-center gap-2">
            {lastRefreshed && (
              <span className="text-xs text-muted-foreground">
                Last updated: {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDailyInsights}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Real-time intelligence powered by advanced AI</p>
        
        {isLoading && !aiInsightsText ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="pt-6 min-h-[180px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : insights.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <Card 
                key={index} 
                className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg hover:border-primary/40 transition-all duration-300"
              >
                <CardContent className="pt-6 max-h-[240px] overflow-y-auto">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 sticky top-0 bg-gradient-to-br from-primary/5 to-primary/10 pb-2">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="h-px flex-1 bg-primary/20"></div>
                    </div>
                    <p className="text-sm leading-relaxed">{insight.replace(/^\d+\.\s*/, '')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Click refresh to get today's AI insights
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Macro Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Macro Overview</CardTitle>
          </div>
          <CardDescription>Key economic indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {macroOverview.map((item, index) => (
              <div key={index} className="space-y-2">
                <p className="text-sm text-muted-foreground">{item.metric}</p>
                <p className="text-2xl font-bold">{item.value}</p>
                <div className="flex items-center gap-1">
                  {item.positive !== null && (
                    item.positive ? 
                      <TrendingUp className="h-4 w-4 text-green-600" /> : 
                      <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${
                    item.positive === null ? 'text-muted-foreground' :
                    item.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Movers */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Top Movers</CardTitle>
            </div>
            <CardDescription>Most active stocks today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMovers.map((stock, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="font-bold text-sm">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground">{stock.volume}</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{stock.name}</p>
                      <p className="text-xs text-muted-foreground">{stock.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      stock.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stock.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {stock.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Your Watchlist Today */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle>Your Watchlist Today</CardTitle>
            </div>
            <CardDescription>Quick view of your tracked assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {watchlistToday.map((asset, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Star className={`h-5 w-5 ${asset.alert ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium text-sm">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{asset.price}</p>
                    <div className={`flex items-center gap-1 text-xs ${
                      asset.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {asset.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {asset.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Heatmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Sector Heatmap</CardTitle>
          </div>
          <CardDescription>Performance overview across all sectors (30-day)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {sectorHeatmap.map((sector, index) => (
              <div
                key={index}
                className={`${getHeatmapColor(sector.value)} rounded-lg p-4 cursor-pointer transition-all hover:scale-105 hover:shadow-lg`}
                onClick={() => setSelectedSector(sector.name)}
              >
                <div className="text-white">
                  <p className="font-bold text-sm mb-1">{sector.name}</p>
                  <p className="text-2xl font-bold mb-1">{sector.performance}</p>
                  <p className="text-xs opacity-90">{sector.companies} companies</p>
                </div>
              </div>
            ))}
          </div>
          {selectedSector && (
            <div className="mt-4 p-4 rounded-lg border bg-accent/50">
              <p className="text-sm text-muted-foreground">
                Selected sector: <span className="font-semibold text-foreground">{selectedSector}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorDashboard;
