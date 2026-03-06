import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Star, Clock, Bookmark, ArrowRight, Flame, Zap,
  Building2, Car, Globe, Briefcase, LineChart, Bitcoin, Users, Award, Package, Landmark
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#64748b'];

const categoryIcons: Record<string, any> = {
  uk_property: Building2, vehicles: Car, overseas_property: Globe, businesses: Briefcase,
  stocks: LineChart, crypto: Bitcoin, private_equity: Users, memorabilia: Award,
  commodities: Package, funds: Landmark
};

const categoryLabels: Record<string, string> = {
  uk_property: "UK Property", vehicles: "Vehicles", overseas_property: "Overseas Property",
  businesses: "Businesses", stocks: "Stocks", crypto: "Crypto", private_equity: "Private Equity",
  memorabilia: "Memorabilia", commodities: "Commodities", funds: "Funds"
};

interface DashboardDealWidgetsProps {
  basePath: string; // "/finance" or "/investor"
}

export function DashboardDealWidgets({ basePath }: DashboardDealWidgetsProps) {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("opportunity_products")
        .select("*")
        .in("status", ["active", "draft"])
        .order("created_at", { ascending: false })
        .limit(50);
      setOpportunities(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const featured = opportunities.filter(o => o.featured);
  const thisWeek = opportunities.filter(o => {
    const created = new Date(o.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created >= weekAgo;
  });
  const topRated = [...opportunities].sort((a, b) => (b.overall_conviction_score || 0) - (a.overall_conviction_score || 0)).slice(0, 5);

  // Category distribution for pie chart
  const catCounts: Record<string, number> = {};
  opportunities.forEach(o => { catCounts[o.category] = (catCounts[o.category] || 0) + 1; });
  const pieData = Object.entries(catCounts).map(([key, value], i) => ({
    name: categoryLabels[key] || key, value, fill: CHART_COLORS[i % CHART_COLORS.length]
  }));

  // Price range bar chart
  const priceRanges = [
    { range: "<£50K", min: 0, max: 50000 },
    { range: "£50-250K", min: 50000, max: 250000 },
    { range: "£250K-1M", min: 250000, max: 1000000 },
    { range: "£1-5M", min: 1000000, max: 5000000 },
    { range: "£5M+", min: 5000000, max: Infinity }
  ];
  const priceBarData = priceRanges.map((r, i) => ({
    range: r.range,
    count: opportunities.filter(o => o.price >= r.min && o.price < r.max).length,
    fill: CHART_COLORS[i]
  }));

  const formatPrice = (p: number, c: string) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: c || "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(p);

  const ratingColors: Record<string, string> = {
    Gold: "bg-yellow-500/20 text-yellow-600", Silver: "bg-gray-400/20 text-gray-600",
    Bronze: "bg-orange-500/20 text-orange-600", Neutral: "bg-slate-500/20 text-slate-600"
  };

  const DealCard = ({ deal }: { deal: any }) => {
    const Icon = categoryIcons[deal.category] || Building2;
    return (
      <div
        className="group flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/50 hover:bg-accent/30 hover:border-primary/30 cursor-pointer transition-all duration-200"
        onClick={() => navigate(`${basePath}/opportunities/${deal.id}`)}
      >
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {deal.thumbnail_url ? (
            <img src={deal.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Icon className="h-5 w-5 text-muted-foreground/50" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{deal.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {deal.price && <span className="text-xs font-semibold text-primary">{formatPrice(deal.price, deal.price_currency)}</span>}
            {deal.analyst_rating && (
              <Badge className={`text-[10px] px-1.5 py-0 ${ratingColors[deal.analyst_rating] || ""}`}>
                {deal.analyst_rating}
              </Badge>
            )}
            {deal.overall_conviction_score && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <TrendingUp className="h-2.5 w-2.5 text-green-500" />
                {deal.overall_conviction_score.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Market Overview & Deals</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`${basePath}/opportunities`)} className="gap-1.5">
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Analytics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Quick Stats */}
        <Card className="border-border/50">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Deals</span>
              <Badge variant="secondary" className="text-lg font-bold">{opportunities.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">New This Week</span>
              <Badge className="bg-green-500/20 text-green-600">{thisWeek.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Featured</span>
              <Badge className="bg-primary/20 text-primary">{featured.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sectors</span>
              <Badge variant="outline">{Object.keys(catCounts).length}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Sector Distribution */}
        <Card className="border-border/50">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground">Sector Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2} dataKey="value" animationDuration={1200}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-lg px-2 py-1 shadow-xl">
                          <p className="text-xs font-medium">{payload[0].name}: {payload[0].value}</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Price Range Distribution */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground">Deals by Ticket Size</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="range" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1200}>
                    {priceBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-lg px-2 py-1 shadow-xl">
                          <p className="text-xs font-medium">{payload[0].payload.range}: {payload[0].value} deals</p>
                        </div>
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deal Lists */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Trending / Top Rated */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" /> Trending Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2 pr-2">
                {topRated.map(deal => <DealCard key={deal.id} deal={deal} />)}
                {topRated.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No deals yet</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* New This Week */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" /> New This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2 pr-2">
                {thisWeek.slice(0, 5).map(deal => <DealCard key={deal.id} deal={deal} />)}
                {thisWeek.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No new deals this week</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Featured / Watchlist */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" /> Featured Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2 pr-2">
                {featured.slice(0, 5).map(deal => <DealCard key={deal.id} deal={deal} />)}
                {featured.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No featured deals</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
