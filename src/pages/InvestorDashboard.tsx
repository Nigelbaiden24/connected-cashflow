import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Globe, Sparkles, Activity, Eye, Star, BarChart3, RefreshCw, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TranslatedText } from "@/components/TranslatedText";
import { FeaturedAnalystPicksSection } from "@/components/market/FeaturedAnalystPicksSection";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ComposedChart, Line
} from "recharts";

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

const InvestorDashboard = () => {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [aiInsightsText, setAiInsightsText] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [liveMarketData, setLiveMarketData] = useState<any[]>([]);
  const [loadingMarketData, setLoadingMarketData] = useState(false);

  const parseInsights = (text: string): string[] => {
    if (!text) return [];
    return text
      .split(/\n\n+|\n(?=\d+\.)/g)
      .map(i => i.trim())
      .filter(i => i.length > 0)
      .slice(0, 3);
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

  const fetchLiveMarketData = async () => {
    setLoadingMarketData(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: { symbols: ['NVDA', 'TSLA', 'AAPL', 'META', 'MSFT', 'BTC-USD', 'GC=F'] }
      });
      if (error) throw error;
      if (data?.investments) {
        setLiveMarketData(data.investments);
        toast.success("Live market data loaded");
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast.error("Using cached market data");
    } finally {
      setLoadingMarketData(false);
    }
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
    fetchLiveMarketData();
  }, []);

  useEffect(() => {
    if (aiInsightsText && lastRefreshed) {
      localStorage.setItem('cachedInsights', aiInsightsText);
      localStorage.setItem('cachedInsightsTime', lastRefreshed.toISOString());
    }
  }, [aiInsightsText, lastRefreshed]);

  // --- DATA TRANSFORMS FOR CHARTS ---

  const macroOverview = [
    { metric: "US GDP Growth", value: 2.4, change: 0.3, positive: true },
    { metric: "Inflation (YoY)", value: 3.2, change: -0.5, positive: true },
    { metric: "Unemployment", value: 3.8, change: 0.1, positive: false },
    { metric: "Fed Funds Rate", value: 5.25, change: 0.0, positive: null }
  ];

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  const topMovers = liveMarketData.length > 0
    ? liveMarketData.slice(0, 5).map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.changePercent,
        volume: stock.volume,
        positive: stock.changePercent >= 0
      }))
    : [
        { symbol: "NVDA", name: "NVIDIA Corp", price: 875.32, change: 8.45, volume: 245000000, positive: true },
        { symbol: "TSLA", name: "Tesla Inc", price: 245.18, change: 5.23, volume: 156000000, positive: true },
        { symbol: "AAPL", name: "Apple Inc", price: 182.45, change: 3.21, volume: 89000000, positive: true },
        { symbol: "META", name: "Meta Platforms", price: 456.78, change: -2.34, volume: 34000000, positive: false },
        { symbol: "MSFT", name: "Microsoft Corp", price: 378.90, change: -1.12, volume: 28000000, positive: false }
      ];

  const watchlistToday = liveMarketData.length > 0
    ? liveMarketData.slice(0, 4).map(stock => ({
        name: stock.name, symbol: stock.symbol,
        price: stock.price,
        change: stock.changePercent,
        trend: stock.changePercent >= 0 ? "up" : "down",
        alert: stock.changePercent > 5
      }))
    : [
        { name: "Apple Inc.", symbol: "AAPL", price: 182.45, change: 1.2, trend: "up", alert: false },
        { name: "Bitcoin", symbol: "BTC", price: 43250, change: 3.4, trend: "up", alert: true },
        { name: "Tesla Inc.", symbol: "TSLA", price: 245.18, change: 3.1, trend: "up", alert: false },
        { name: "Gold", symbol: "GC", price: 2045, change: 0.5, trend: "up", alert: false }
      ];

  const sectorHeatmap = [
    { name: "Technology", performance: 12.5, companies: 127 },
    { name: "Healthcare", performance: 8.3, companies: 98 },
    { name: "Financials", performance: 5.7, companies: 156 },
    { name: "Consumer", performance: 4.2, companies: 89 },
    { name: "Energy", performance: 3.8, companies: 67 },
    { name: "Industrials", performance: 2.1, companies: 112 },
    { name: "Materials", performance: -0.5, companies: 78 },
    { name: "Real Estate", performance: -1.8, companies: 45 },
    { name: "Utilities", performance: -2.3, companies: 34 },
    { name: "Telecom", performance: -3.1, companies: 23 }
  ];

  // Bar chart data for Top Movers (horizontal bar showing % change)
  const topMoversChartData = topMovers.map(s => ({
    symbol: s.symbol,
    change: s.change,
    price: s.price,
    volume: s.volume,
    fill: s.positive ? '#10b981' : '#ef4444'
  }));

  // Donut chart for watchlist allocation
  const watchlistDonut = watchlistToday.map((a, i) => ({
    name: a.symbol,
    value: a.price,
    fill: CHART_COLORS[i % CHART_COLORS.length]
  }));

  // Composed bar chart for sector performance
  const sectorChartData = sectorHeatmap.map(s => ({
    name: s.name,
    performance: s.performance,
    companies: s.companies,
    fill: s.performance >= 0 ? '#10b981' : '#ef4444'
  }));

  // Radar for macro overview
  const macroRadarData = macroOverview.map(m => ({
    metric: m.metric.split(' ')[0],
    value: m.value,
    fullMetric: m.metric
  }));

  return (
    <div className="p-6 space-y-6 investor-theme">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight"><TranslatedText>Investment Dashboard</TranslatedText></h1>
        <p className="text-muted-foreground mt-2">
          <TranslatedText>Welcome to your global investment portal</TranslatedText>
        </p>
      </div>

      {/* AI Insights of the Day */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold"><TranslatedText>AI Insights of the Day</TranslatedText></h2>
          </div>
          <div className="flex items-center gap-2">
            {lastRefreshed && (
              <span className="text-xs text-muted-foreground">
                <TranslatedText>Last updated</TranslatedText>: {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => { fetchDailyInsights(); fetchLiveMarketData(); }} disabled={isLoading || loadingMarketData}>
              {isLoading || loadingMarketData ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground"><TranslatedText>Real-time intelligence powered by advanced AI</TranslatedText></p>

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
              <Card key={index} className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg hover:border-primary/40 transition-all duration-300">
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
              <p className="text-muted-foreground text-center py-8"><TranslatedText>Click refresh to get today's AI insights</TranslatedText></p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Featured Analyst Picks */}
      <FeaturedAnalystPicksSection />

      {/* Macro Overview — Radar Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle><TranslatedText>Macro Overview</TranslatedText></CardTitle>
          </div>
          <CardDescription><TranslatedText>Key economic indicators</TranslatedText></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Radar visualization */}
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={macroRadarData} outerRadius="75%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar name="Value" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} animationDuration={1500} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-3">
              {macroOverview.map((item, index) => (
                <div key={index} className="p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
                  <p className="text-xs text-muted-foreground mb-1">{item.metric}</p>
                  <p className="text-2xl font-bold">{item.value}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    {item.positive !== null && (
                      item.positive ?
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" /> :
                        <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${item.positive === null ? 'text-muted-foreground' : item.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Movers — Horizontal Bar Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle><TranslatedText>Top Movers</TranslatedText></CardTitle>
            </div>
            <CardDescription><TranslatedText>Most active stocks today — % change</TranslatedText></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={topMoversChartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="symbol" width={55} tick={{ fontSize: 12, fontWeight: 600, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-xl">
                          <p className="text-xs font-bold">{d.symbol}</p>
                          <p className="text-xs">Price: ${d.price?.toFixed(2)}</p>
                          <p className={`text-xs font-medium ${d.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Change: {d.change >= 0 ? '+' : ''}{d.change?.toFixed(2)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Vol: {formatVolume(d.volume)}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="change" radius={[0, 6, 6, 0]} animationDuration={1200} barSize={24}>
                    {topMoversChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {/* Mini legend */}
            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Gainers</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Losers</span>
            </div>
          </CardContent>
        </Card>

        {/* Watchlist — Donut + Sparklines */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle><TranslatedText>Your Watchlist Today</TranslatedText></CardTitle>
            </div>
            <CardDescription><TranslatedText>Portfolio allocation & performance</TranslatedText></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Donut */}
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={watchlistDonut}
                      cx="50%" cy="50%"
                      innerRadius="55%" outerRadius="85%"
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={1400}
                      animationBegin={200}
                    >
                      {watchlistDonut.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-xl">
                          <p className="text-xs font-bold">{d.name}</p>
                          <p className="text-xs">${d.value?.toLocaleString()}</p>
                        </div>
                      );
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Asset list */}
              <div className="space-y-3 flex flex-col justify-center">
                {watchlistToday.map((asset, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <Star className={`h-3.5 w-3.5 flex-shrink-0 ${asset.alert ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{asset.symbol}</p>
                      <p className="text-[10px] text-muted-foreground">${asset.price.toLocaleString()}</p>
                    </div>
                    <span className={`text-xs font-semibold ${asset.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Performance — Bar Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle><TranslatedText>Sector Performance</TranslatedText></CardTitle>
          </div>
          <CardDescription><TranslatedText>30-day performance across all sectors</TranslatedText></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={sectorChartData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  angle={-40} textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={v => `${v}%`}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-xs font-bold">{d.name}</p>
                      <p className={`text-xs font-medium ${d.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {d.performance >= 0 ? '+' : ''}{d.performance}%
                      </p>
                      <p className="text-xs text-muted-foreground">{d.companies} companies</p>
                    </div>
                  );
                }} />
                <defs>
                  <linearGradient id="sectorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="sectorRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <Bar dataKey="performance" radius={[6, 6, 0, 0]} animationDuration={1400} barSize={28}>
                  {sectorChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.performance >= 0 ? 'url(#sectorGreen)' : 'url(#sectorRed)'} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="performance" stroke="#8b5cf6" strokeWidth={2} dot={false} animationDuration={1800} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {selectedSector && (
            <div className="mt-4 p-4 rounded-lg border bg-accent/50">
              <p className="text-sm text-muted-foreground">
                <TranslatedText>Selected sector</TranslatedText>: <span className="font-semibold text-foreground">{selectedSector}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorDashboard;
