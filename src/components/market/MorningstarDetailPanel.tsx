import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import {
  X,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  Shield,
  Zap,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  Star,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

// Types for different asset types
interface AssetData {
  id: string;
  symbol: string;
  name: string;
  assetType: 'fund' | 'stock' | 'crypto';
  currentPrice?: number;
  priceChange24h?: number;
  priceChange7d?: number;
  priceChange30d?: number;
  priceChange1y?: number;
  marketCap?: number;
  volume24h?: number;
  analystRating?: string;
  overallScore?: number;
  currency?: string;
  // Fund-specific
  ocf?: number;
  aum?: number;
  srriRating?: number;
  // Stock-specific
  peRatio?: number;
  dividendYield?: number;
  sector?: string;
  // Crypto-specific
  blockchain?: string;
  circulatingSupply?: number;
}

interface MorningstarDetailPanelProps {
  asset: AssetData;
  onClose: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// Generate realistic scenario trend data
const generateScenarioTrendData = (baseReturn: number) => {
  const scenarios = [
    { name: "Base Case", color: "hsl(var(--primary))" },
    { name: "Bull Market", color: "hsl(var(--success))" },
    { name: "Bear Market", color: "hsl(var(--destructive))" },
    { name: "High Volatility", color: "hsl(var(--warning))" },
  ];

  const months = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 24);

  for (let i = 0; i <= 24; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    
    const monthData: any = {
      date: date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
      month: i,
    };

    // Generate cumulative returns for each scenario
    const volatility = 0.08;
    const baseMonthlyReturn = baseReturn / 12;
    
    scenarios.forEach((scenario, idx) => {
      let multiplier = 1;
      let scenarioVolatility = volatility;
      
      switch (idx) {
        case 0: // Base Case
          multiplier = 1;
          break;
        case 1: // Bull Market
          multiplier = 1.8;
          scenarioVolatility = volatility * 0.8;
          break;
        case 2: // Bear Market
          multiplier = -0.5;
          scenarioVolatility = volatility * 1.2;
          break;
        case 3: // High Volatility
          multiplier = 0.3;
          scenarioVolatility = volatility * 2;
          break;
      }

      const randomFactor = (Math.random() - 0.5) * scenarioVolatility * 100;
      const cumulativeReturn = (baseMonthlyReturn * multiplier * i * 100) + randomFactor + (i === 0 ? 0 : months[i - 1]?.[scenario.name] || 0) * 0.1;
      monthData[scenario.name] = Number(cumulativeReturn.toFixed(2));
    });

    months.push(monthData);
  }

  return { data: months, scenarios };
};

// Generate scenario metrics data
const generateScenarioMetrics = (baseReturn: number, volatility: number = 15) => {
  const scenarios = ["2008 Financial Crisis", "2020 COVID Crash", "2022 Rate Hikes", "Base Scenario", "Bull Run"];
  
  return scenarios.map((scenario, idx) => {
    let alpha = 0, maxDrawdown = 0, returnVal = 0, stdDev = 0, trackingError = 0;
    
    switch (idx) {
      case 0: // 2008
        alpha = -2.5 + Math.random() * 2;
        maxDrawdown = -45 - Math.random() * 10;
        returnVal = -35 - Math.random() * 10;
        stdDev = 28 + Math.random() * 5;
        trackingError = 8 + Math.random() * 3;
        break;
      case 1: // 2020
        alpha = 1.2 + Math.random() * 2;
        maxDrawdown = -32 - Math.random() * 8;
        returnVal = 8 + Math.random() * 12;
        stdDev = 24 + Math.random() * 4;
        trackingError = 6 + Math.random() * 2;
        break;
      case 2: // 2022
        alpha = -1.8 + Math.random() * 1.5;
        maxDrawdown = -22 - Math.random() * 6;
        returnVal = -18 - Math.random() * 8;
        stdDev = 20 + Math.random() * 4;
        trackingError = 5 + Math.random() * 2;
        break;
      case 3: // Base
        alpha = baseReturn * 0.1;
        maxDrawdown = -12 - Math.random() * 5;
        returnVal = baseReturn;
        stdDev = volatility;
        trackingError = 3 + Math.random() * 2;
        break;
      case 4: // Bull
        alpha = 3.5 + Math.random() * 2;
        maxDrawdown = -8 - Math.random() * 4;
        returnVal = 25 + Math.random() * 10;
        stdDev = 14 + Math.random() * 3;
        trackingError = 4 + Math.random() * 2;
        break;
    }

    return {
      scenario,
      Alpha: Number(alpha.toFixed(2)),
      "Max Drawdown": Number(maxDrawdown.toFixed(2)),
      Return: Number(returnVal.toFixed(2)),
      "Std Dev": Number(stdDev.toFixed(2)),
      "Tracking Error": Number(trackingError.toFixed(2)),
    };
  });
};

// Generate price history for stocks/crypto
const generatePriceHistory = (currentPrice: number, volatility: number = 0.02) => {
  const data = [];
  let price = currentPrice * 0.7;
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const change = (Math.random() - 0.48) * volatility * price;
    price = Math.max(price * 0.5, price + change);
    
    data.push({
      date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      price: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000,
    });
  }
  
  // Ensure last price matches current
  if (data.length > 0) {
    data[data.length - 1].price = currentPrice;
  }
  
  return data;
};

export function MorningstarDetailPanel({
  asset,
  onClose,
  isExpanded = false,
  onToggleExpand,
}: MorningstarDetailPanelProps) {
  const [activeTab, setActiveTab] = useState("scenario");
  const [timeRange, setTimeRange] = useState("1Y");

  // Generate chart data based on asset
  const scenarioTrendData = useMemo(() => {
    const baseReturn = asset.priceChange1y || 8;
    return generateScenarioTrendData(baseReturn / 100);
  }, [asset]);

  const scenarioMetricsData = useMemo(() => {
    return generateScenarioMetrics(asset.priceChange1y || 8);
  }, [asset]);

  const priceHistoryData = useMemo(() => {
    return generatePriceHistory(asset.currentPrice || 100);
  }, [asset]);

  const formatCurrency = (value: number) => {
    if (!value) return "—";
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: asset.currency || 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return "—";
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value?: number) => {
    if (!value) return "text-muted-foreground";
    return value >= 0 ? "text-emerald-600" : "text-red-600";
  };

  const getRatingBadge = (rating?: string) => {
    const styles: Record<string, string> = {
      'Gold': 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
      'Silver': 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800',
      'Bronze': 'bg-gradient-to-r from-orange-400 to-amber-600 text-white',
      'Buy': 'bg-emerald-500 text-white',
      'Hold': 'bg-amber-500 text-white',
      'Sell': 'bg-red-500 text-white',
    };
    return styles[rating || ''] || 'bg-muted text-muted-foreground';
  };

  return (
    <Card className={`flex flex-col h-full overflow-hidden border-slate-200 shadow-lg ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <CardHeader className="flex-shrink-0 pb-3 bg-gradient-to-r from-slate-50 to-white border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
              {asset.assetType === 'crypto' ? (
                <Zap className="h-6 w-6 text-amber-500" />
              ) : asset.assetType === 'fund' ? (
                <PieChart className="h-6 w-6 text-primary" />
              ) : (
                <BarChart3 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-slate-900">{asset.name}</CardTitle>
                {asset.analystRating && (
                  <Badge className={getRatingBadge(asset.analystRating)}>
                    {asset.analystRating}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono text-xs">{asset.symbol}</Badge>
                <span className="text-sm text-muted-foreground capitalize">{asset.assetType}</span>
                {asset.sector && (
                  <span className="text-sm text-muted-foreground">• {asset.sector}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onToggleExpand && (
              <Button variant="ghost" size="icon" onClick={onToggleExpand}>
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-white border shadow-sm">
            <p className="text-xs text-muted-foreground">Current Price</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(asset.currentPrice || 0)}</p>
          </div>
          <div className="p-3 rounded-lg bg-white border shadow-sm">
            <p className="text-xs text-muted-foreground">24h Change</p>
            <div className={`flex items-center gap-1 ${getChangeColor(asset.priceChange24h)}`}>
              {(asset.priceChange24h || 0) >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span className="text-lg font-bold">{formatPercentage(asset.priceChange24h)}</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white border shadow-sm">
            <p className="text-xs text-muted-foreground">1Y Return</p>
            <div className={`flex items-center gap-1 ${getChangeColor(asset.priceChange1y)}`}>
              {(asset.priceChange1y || 0) >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-lg font-bold">{formatPercentage(asset.priceChange1y)}</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white border shadow-sm">
            <p className="text-xs text-muted-foreground">
              {asset.assetType === 'fund' ? 'AUM' : 'Market Cap'}
            </p>
            <p className="text-lg font-bold text-slate-900">
              {formatCurrency(asset.aum || asset.marketCap || 0)}
            </p>
          </div>
        </div>
      </CardHeader>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0 px-4 border-b bg-slate-50/50">
          <TabsList className="h-10 bg-transparent p-0 gap-1">
            <TabsTrigger 
              value="scenario" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Scenario Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="performance"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="metrics"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Risk Metrics
            </TabsTrigger>
            <TabsTrigger 
              value="analysis"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Analysis
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Scenario Analysis Tab */}
            <TabsContent value="scenario" className="m-0 space-y-4">
              {/* Scenario Trend Chart */}
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-semibold">
                        Scenario Trend: Cumulative Return | {asset.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      {['1M', '3M', '6M', '1Y', '2Y'].map((range) => (
                        <Button
                          key={range}
                          variant={timeRange === range ? "default" : "ghost"}
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setTimeRange(range)}
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={scenarioTrendData.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(v) => `${v}%`}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          }}
                          formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '10px' }}
                          formatter={(value) => <span className="text-xs">{value}</span>}
                        />
                        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                        {scenarioTrendData.scenarios.map((scenario, idx) => (
                          <Line
                            key={scenario.name}
                            type="monotone"
                            dataKey={scenario.name}
                            stroke={scenario.color}
                            strokeWidth={idx === 0 ? 2.5 : 1.5}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 2 }}
                          />
                        ))}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Scenario Legend with Values */}
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
                    {scenarioTrendData.scenarios.map((scenario) => {
                      const latestValue = scenarioTrendData.data[scenarioTrendData.data.length - 1]?.[scenario.name] || 0;
                      return (
                        <div key={scenario.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: scenario.color }}
                          />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground truncate">{scenario.name}</p>
                            <p className={`text-sm font-bold ${latestValue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {latestValue >= 0 ? '+' : ''}{latestValue.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Scenario Metrics Bar Chart */}
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">
                      Scenario Metrics: {asset.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={scenarioMetricsData} 
                        layout="vertical"
                        margin={{ left: 10, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis 
                          type="number" 
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="scenario"
                          tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`${value.toFixed(2)}%`]}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" />
                        <Bar dataKey="Alpha" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Max Drawdown" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Return" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Metrics Summary Table */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {['Alpha', 'Max Drawdown', 'Return', 'Std Dev', 'Tracking Error'].map((metric) => {
                        const metricValue = scenarioMetricsData[3]?.[metric as keyof typeof scenarioMetricsData[0]];
                        const displayValue = typeof metricValue === 'number' ? metricValue.toFixed(2) : '—';
                        return (
                        <div key={metric} className="p-2 rounded-lg bg-slate-50">
                          <p className="text-[10px] text-muted-foreground font-medium">{metric}</p>
                          <p className="text-sm font-bold text-slate-900">
                            {displayValue}%
                          </p>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="m-0 space-y-4">
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-semibold">Price History</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      {['1W', '1M', '3M', '6M', '1Y', 'All'].map((range) => (
                        <Button
                          key={range}
                          variant={timeRange === range ? "default" : "ghost"}
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setTimeRange(range)}
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={priceHistoryData}>
                        <defs>
                          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis 
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(v) => formatCurrency(v)}
                          tickLine={false}
                          axisLine={false}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Price']}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fill="url(#priceGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Performance Summary */}
                  <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t">
                    {[
                      { label: '24h', value: asset.priceChange24h },
                      { label: '7d', value: asset.priceChange7d },
                      { label: '30d', value: asset.priceChange30d },
                      { label: '1Y', value: asset.priceChange1y },
                      { label: 'YTD', value: (asset.priceChange1y || 0) * 0.7 },
                    ].map((item) => (
                      <div key={item.label} className="p-2 rounded-lg bg-slate-50 text-center">
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className={`text-sm font-bold ${getChangeColor(item.value)}`}>
                          {formatPercentage(item.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Risk Metrics Tab */}
            <TabsContent value="metrics" className="m-0 space-y-4">
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Risk & Volatility Metrics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={scenarioMetricsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="scenario" 
                          tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                          angle={-15}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`${value.toFixed(2)}%`]}
                        />
                        <Legend />
                        <Bar dataKey="Alpha" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Max Drawdown" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Return" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Std Dev" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Tracking Error" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Indicators Grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'SRRI Rating', value: asset.srriRating ? `${asset.srriRating}/7` : '4/7', color: 'text-amber-600' },
                  { label: 'Sharpe Ratio', value: '0.85', color: 'text-emerald-600' },
                  { label: 'Beta', value: '1.12', color: 'text-primary' },
                  { label: 'Alpha', value: '+2.3%', color: 'text-emerald-600' },
                  { label: 'Max Drawdown', value: '-18.5%', color: 'text-red-600' },
                  { label: 'Volatility', value: '15.2%', color: 'text-amber-600' },
                ].map((metric) => (
                  <div key={metric.label} className="p-4 rounded-xl bg-slate-50 border text-center">
                    <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                    <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="m-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <CardTitle className="text-sm font-semibold text-emerald-900">Key Strengths</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-0.5 text-emerald-500" />
                        Strong momentum indicators across multiple timeframes
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-0.5 text-emerald-500" />
                        Above-average risk-adjusted returns
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-0.5 text-emerald-500" />
                        Consistent outperformance vs benchmark
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <CardTitle className="text-sm font-semibold text-red-900">Key Risks</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-0.5 text-red-500" />
                        Higher volatility in stressed market conditions
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-0.5 text-red-500" />
                        Concentration risk in specific sectors
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-0.5 text-red-500" />
                        Currency exposure for international holdings
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Conviction Scores */}
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Conviction Scores</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { label: 'Overall', score: asset.overallScore || 4.2, icon: Star },
                      { label: 'Fundamentals', score: 3.8, icon: BarChart3 },
                      { label: 'Technicals', score: 4.1, icon: Activity },
                      { label: 'Momentum', score: 4.5, icon: Zap },
                      { label: 'Risk', score: 3.5, icon: Shield },
                    ].map((item) => {
                      const Icon = item.icon;
                      const color = item.score >= 4 ? 'text-emerald-600' : item.score >= 3 ? 'text-amber-600' : 'text-red-600';
                      const bg = item.score >= 4 ? 'bg-emerald-50' : item.score >= 3 ? 'bg-amber-50' : 'bg-red-50';
                      return (
                        <div key={item.label} className={`p-3 rounded-xl ${bg} text-center`}>
                          <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
                          <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
                          <p className={`text-lg font-bold ${color}`}>{item.score.toFixed(1)}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Last Updated */}
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Analysis last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </Card>
  );
}
