import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Globe, Sparkles, Activity, Eye, Star, BarChart3, RefreshCw, Loader2, FileText, BookOpen, Newspaper, PieChart as PieIcon, Briefcase, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { useInvestorDashboardData } from "@/hooks/useInvestorDashboardData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TranslatedText } from "@/components/TranslatedText";
import { FeaturedAnalystPicksSection } from "@/components/market/FeaturedAnalystPicksSection";
import { NetflixContentRow } from "@/components/investor/NetflixContentRow";
import { PlatformAnalyticsCharts } from "@/components/investor/PlatformAnalyticsCharts";
import { PitchbookDealFlow } from "@/components/investor/PitchbookDealFlow";
import { DashboardDealWidgets } from "@/components/dashboard/DashboardDealWidgets";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ComposedChart, Line
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
  const [aiInsightsText, setAiInsightsText] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [liveMarketData, setLiveMarketData] = useState<any[]>([]);
  const [loadingMarketData, setLoadingMarketData] = useState(false);

  const dashboardData = useInvestorDashboardData();

  const parseInsights = (text: string): string[] => {
    if (!text) return [];
    return text.split(/\n\n+|\n(?=\d+\.)/g).map(i => i.trim()).filter(i => i.length > 0).slice(0, 3);
  };
  const insights = parseInsights(aiInsightsText);

  const { analyzeWithAI, isLoading } = useAIAnalyst({
    onDelta: (text) => setAiInsightsText(prev => prev + text),
    onDone: () => { setLastRefreshed(new Date()); toast.success("AI insights refreshed"); },
    onError: (error) => { toast.error(error); setAiInsightsText(""); }
  });

  const fetchDailyInsights = async () => {
    setAiInsightsText("");
    await analyzeWithAI("Provide 3-5 key investment insights for today including market opportunities, risks, and sector analysis. Keep each insight concise and actionable.", "trends");
  };

  const fetchLiveMarketData = async () => {
    setLoadingMarketData(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: { symbols: ['NVDA', 'TSLA', 'AAPL', 'META', 'MSFT', 'BTC-USD', 'GC=F'] }
      });
      if (error) throw error;
      if (data?.investments) { setLiveMarketData(data.investments); toast.success("Live market data loaded"); }
    } catch { toast.error("Using cached market data"); }
    finally { setLoadingMarketData(false); }
  };

  useEffect(() => {
    const today = new Date().toDateString();
    const lastFetch = localStorage.getItem('lastInsightsFetch');
    if (lastFetch !== today) {
      fetchDailyInsights();
      localStorage.setItem('lastInsightsFetch', today);
    } else {
      const cached = localStorage.getItem('cachedInsights');
      const cachedTime = localStorage.getItem('cachedInsightsTime');
      if (cached && cachedTime) { setAiInsightsText(cached); setLastRefreshed(new Date(cachedTime)); }
      else fetchDailyInsights();
    }
    fetchLiveMarketData();
  }, []);

  useEffect(() => {
    if (aiInsightsText && lastRefreshed) {
      localStorage.setItem('cachedInsights', aiInsightsText);
      localStorage.setItem('cachedInsightsTime', lastRefreshed.toISOString());
    }
  }, [aiInsightsText, lastRefreshed]);

  // --- Market data transforms ---
  const macroOverview = [
    { metric: "US GDP Growth", value: 2.4, change: 0.3, positive: true },
    { metric: "Inflation (YoY)", value: 3.2, change: -0.5, positive: true },
    { metric: "Unemployment", value: 3.8, change: 0.1, positive: false },
    { metric: "Fed Funds Rate", value: 5.25, change: 0.0, positive: null }
  ];

  const topMovers = liveMarketData.length > 0
    ? liveMarketData.slice(0, 5).map(s => ({ symbol: s.symbol, name: s.name, price: s.price, change: s.changePercent, volume: s.volume, positive: s.changePercent >= 0 }))
    : [
        { symbol: "NVDA", name: "NVIDIA Corp", price: 875.32, change: 8.45, volume: 245000000, positive: true },
        { symbol: "TSLA", name: "Tesla Inc", price: 245.18, change: 5.23, volume: 156000000, positive: true },
        { symbol: "AAPL", name: "Apple Inc", price: 182.45, change: 3.21, volume: 89000000, positive: true },
        { symbol: "META", name: "Meta Platforms", price: 456.78, change: -2.34, volume: 34000000, positive: false },
        { symbol: "MSFT", name: "Microsoft Corp", price: 378.90, change: -1.12, volume: 28000000, positive: false }
      ];

  const topMoversChartData = topMovers.map(s => ({ symbol: s.symbol, change: s.change, price: s.price, volume: s.volume, fill: s.positive ? '#10b981' : '#ef4444' }));

  const macroRadarData = macroOverview.map(m => ({ metric: m.metric.split(' ')[0], value: m.value, fullMetric: m.metric }));

  const formatVolume = (v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(1)}K` : v.toString();

  // --- Netflix content transforms ---
  const researchItems = dashboardData.researchReports.map((r: any) => ({
    id: r.id, title: r.asset_name, description: `${r.asset_type} — ${r.confidence_level || "N/A"}`,
    score: r.overall_quality_score, created_at: r.created_at, type: "research" as const,
    category: r.asset_type, route: "/investor/research"
  }));

  const commentaryItems = dashboardData.commentary.map((c: any) => ({
    id: c.id, title: c.title, description: c.description, thumbnail_url: c.thumbnail_url,
    created_at: c.published_date || c.created_at, type: "commentary" as const, route: "/investor/commentary"
  }));

  const portfolioItems = dashboardData.portfolios.map((p: any) => ({
    id: p.id, title: p.title, description: p.description, thumbnail_url: p.thumbnail_url,
    created_at: p.created_at, type: "portfolio" as const, route: "/investor/portfolios"
  }));

  const newsletterItems = dashboardData.newsletters.map((n: any) => ({
    id: n.id, title: n.title, description: n.preview, category: n.category,
    created_at: n.published_date || n.created_at, type: "newsletter" as const,
    extra: n.read_time, route: "/investor/newsletters"
  }));

  const learningItems = dashboardData.learningContent.map((l: any) => ({
    id: l.id, title: l.title, description: l.description, thumbnail_url: l.thumbnail_url,
    category: l.category, created_at: l.created_at, type: "learning" as const,
    extra: l.duration, route: "/investor/learning"
  }));

  const reportItems = dashboardData.purchasableReports.map((r: any) => ({
    id: r.id, title: r.title, description: r.description, thumbnail_url: r.thumbnail_url,
    category: r.category, created_at: r.created_at, type: "report" as const,
    extra: r.reading_time, route: "/investor/research"
  }));

  return (
    <div className="p-6 space-y-8 investor-theme">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><TranslatedText>Investment Dashboard</TranslatedText></h1>
          <p className="text-muted-foreground mt-1"><TranslatedText>Your global investment command centre</TranslatedText></p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefreshed && <span className="text-xs text-muted-foreground"><TranslatedText>Updated</TranslatedText>: {lastRefreshed.toLocaleTimeString()}</span>}
          <Button variant="outline" size="sm" onClick={() => { fetchDailyInsights(); fetchLiveMarketData(); }} disabled={isLoading || loadingMarketData}>
            {isLoading || loadingMarketData ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Market Overview & Deals - Top */}
      <DashboardDealWidgets basePath="/investor" />

      {/* AI Insights */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold"><TranslatedText>AI Insights of the Day</TranslatedText></h2>
        </div>
        {isLoading && !aiInsightsText ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="pt-6 min-h-[140px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : insights.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                <CardContent className="pt-5 pb-4 max-h-[200px] overflow-y-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div className="h-px flex-1 bg-primary/20" />
                  </div>
                  <p className="text-sm leading-relaxed">{insight.replace(/^\d+\.\s*/, '')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-primary/20"><CardContent className="pt-6"><p className="text-muted-foreground text-center py-6"><TranslatedText>Click refresh to get today's AI insights</TranslatedText></p></CardContent></Card>
        )}
      </div>

      {/* Platform Analytics */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold"><TranslatedText>Platform Analytics</TranslatedText></h2>
        </div>
        {dashboardData.loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <PlatformAnalyticsCharts data={dashboardData.analytics} />
        )}
      </div>


      {/* Featured Analyst Picks */}
      <FeaturedAnalystPicksSection />

      {/* Pitchbook Deal Flow */}
      <PitchbookDealFlow deals={dashboardData.opportunities} loading={dashboardData.loading} />

      {/* Netflix Content Rows */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold"><TranslatedText>Browse All Content</TranslatedText></h2>
        </div>

        <NetflixContentRow title="Research Reports" icon={<FileText className="h-5 w-5 text-blue-500" />} items={researchItems} />
        <NetflixContentRow title="Market Commentary" icon={<Globe className="h-5 w-5 text-emerald-500" />} items={commentaryItems} />
        <NetflixContentRow title="Model Portfolios" icon={<PieIcon className="h-5 w-5 text-violet-500" />} items={portfolioItems} />
        <NetflixContentRow title="Newsletters" icon={<Newspaper className="h-5 w-5 text-amber-500" />} items={newsletterItems} />
        <NetflixContentRow title="Learning Hub" icon={<GraduationCap className="h-5 w-5 text-cyan-500" />} items={learningItems} />
        <NetflixContentRow title="Premium Reports" icon={<Star className="h-5 w-5 text-pink-500" />} items={reportItems} />
      </div>

      {/* Market Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Macro Radar */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm"><TranslatedText>Macro Overview</TranslatedText></CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={macroRadarData} outerRadius="75%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar name="Value" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} animationDuration={1500} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {macroOverview.map((item, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-[10px] text-muted-foreground">{item.metric}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold">{item.value}%</p>
                      <div className="flex items-center gap-0.5">
                        {item.positive !== null && (item.positive ? <TrendingUp className="h-3 w-3 text-green-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />)}
                        <span className={`text-[10px] font-medium ${item.positive === null ? 'text-muted-foreground' : item.positive ? 'text-green-600' : 'text-red-600'}`}>
                          {item.change >= 0 ? '+' : ''}{item.change}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Movers Bar */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm"><TranslatedText>Top Movers</TranslatedText></CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={topMoversChartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="symbol" width={50} tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-xl">
                        <p className="text-xs font-bold">{d.symbol}</p>
                        <p className="text-xs">Price: ${d.price?.toFixed(2)}</p>
                        <p className={`text-xs font-medium ${d.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{d.change >= 0 ? '+' : ''}{d.change?.toFixed(2)}%</p>
                        <p className="text-xs text-muted-foreground">Vol: {formatVolume(d.volume)}</p>
                      </div>
                    );
                  }} />
                  <Bar dataKey="change" radius={[0, 6, 6, 0]} animationDuration={1200} barSize={20}>
                    {topMoversChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Gainers</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Losers</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvestorDashboard;
