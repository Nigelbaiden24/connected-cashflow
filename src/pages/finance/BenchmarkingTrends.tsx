import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, TrendingUp, TrendingDown, BarChart3, Loader2, Upload, Brain, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Benchmark {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface MarketTrend {
  id: string;
  title: string;
  description: string;
  impact: string;
  timeframe?: string;
  category?: string;
}

export default function FinanceBenchmarkingTrends() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  // Sample performance data
  const performanceData = [
    { month: "Jan", portfolio: 100, benchmark: 100 },
    { month: "Feb", portfolio: 102, benchmark: 101 },
    { month: "Mar", portfolio: 105, benchmark: 103 },
    { month: "Apr", portfolio: 103, benchmark: 102 },
    { month: "May", portfolio: 108, benchmark: 106 },
    { month: "Jun", portfolio: 112, benchmark: 108 },
    { month: "Jul", portfolio: 115, benchmark: 110 },
    { month: "Aug", portfolio: 118, benchmark: 112 },
    { month: "Sep", portfolio: 116, benchmark: 111 },
    { month: "Oct", portfolio: 120, benchmark: 114 },
    { month: "Nov", portfolio: 124, benchmark: 117 },
    { month: "Dec", portfolio: 128, benchmark: 120 },
  ];

  const sectorData = [
    { sector: "Technology", allocation: 28, benchmark: 25 },
    { sector: "Healthcare", allocation: 18, benchmark: 15 },
    { sector: "Financials", allocation: 15, benchmark: 18 },
    { sector: "Consumer", allocation: 12, benchmark: 14 },
    { sector: "Industrials", allocation: 10, benchmark: 10 },
    { sector: "Energy", allocation: 8, benchmark: 8 },
    { sector: "Other", allocation: 9, benchmark: 10 },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch benchmarks
      const { data: benchmarkData } = await supabase.functions.invoke("fetch-market-data", {
        body: { symbols: ["SPY", "QQQ", "IWM", "DIA", "VTI"] }
      });

      if (benchmarkData?.data) {
        setBenchmarks(benchmarkData.data.map((b: any) => ({
          name: b.symbol,
          value: b.price,
          change: b.change,
          changePercent: b.changePercent
        })));
      } else {
        // Fallback data
        setBenchmarks([
          { name: "S&P 500", value: 4782.35, change: 24.56, changePercent: 0.52 },
          { name: "NASDAQ", value: 15123.45, change: -45.23, changePercent: -0.30 },
          { name: "DOW", value: 37584.12, change: 156.78, changePercent: 0.42 },
          { name: "Russell 2000", value: 2012.67, change: 12.34, changePercent: 0.62 },
        ]);
      }

      // Fetch trends
      const { data: trendsData } = await supabase
        .from("market_trends")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (trendsData) {
        setTrends(trendsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("portfolio-benchmark-analysis", {
        body: { benchmarks, performanceData }
      });

      if (error) throw error;
      toast({ title: "Analysis Complete", description: "Check the insights panel for results" });
    } catch (error) {
      toast({ title: "Error", description: "Analysis failed", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Benchmarking & Trends</h1>
          <p className="text-muted-foreground mt-2">Compare portfolio performance against market benchmarks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Portfolio
          </Button>
          <Button onClick={handleAIAnalysis} disabled={analyzing} className="gap-2">
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            AI Analysis
          </Button>
        </div>
      </div>

      {/* Benchmark Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {benchmarks.map((benchmark) => (
          <Card key={benchmark.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{benchmark.name}</p>
                <Badge variant={benchmark.change >= 0 ? "default" : "destructive"} className="gap-1">
                  {benchmark.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {benchmark.changePercent.toFixed(2)}%
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-2">${benchmark.value.toLocaleString()}</p>
              <p className={`text-sm ${benchmark.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {benchmark.change >= 0 ? "+" : ""}{benchmark.change.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Performance</CardTitle>
              <CardDescription>Portfolio vs Benchmark (Indexed to 100)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Area
                      type="monotone"
                      dataKey="portfolio"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name="Portfolio"
                    />
                    <Area
                      type="monotone"
                      dataKey="benchmark"
                      stroke="hsl(var(--muted-foreground))"
                      fill="hsl(var(--muted-foreground))"
                      fillOpacity={0.1}
                      name="Benchmark"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation">
          <Card>
            <CardHeader>
              <CardTitle>Sector Allocation</CardTitle>
              <CardDescription>Portfolio allocation vs benchmark weights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="sector" type="category" className="text-xs" width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar dataKey="allocation" fill="hsl(var(--primary))" name="Portfolio" />
                    <Bar dataKey="benchmark" fill="hsl(var(--muted-foreground))" name="Benchmark" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trends.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No market trends available</p>
                </CardContent>
              </Card>
            ) : (
              trends.map((trend) => (
                <Card key={trend.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {trend.impact === "positive" ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : trend.impact === "negative" ? (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      ) : (
                        <BarChart3 className="h-5 w-5 text-yellow-500" />
                      )}
                      {trend.category && <Badge variant="outline">{trend.category}</Badge>}
                    </div>
                    <CardTitle className="text-lg">{trend.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{trend.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
