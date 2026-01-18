import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, TrendingUp, Activity, Sparkles, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function FinanceBenchmarkingTrends() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [liveBenchmarks, setLiveBenchmarks] = useState<any[]>([]);
  const [loadingBenchmarks, setLoadingBenchmarks] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLiveBenchmarks = async () => {
    setLoadingBenchmarks(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: { symbols: ['SPY', 'URTH', 'BTC-USD', 'GLD'] }
      });

      if (error) throw error;
      if (data?.investments) {
        setLiveBenchmarks(data.investments);
      }
    } catch (error) {
      console.error('Error fetching benchmarks:', error);
      toast.error("Using cached benchmark data");
    } finally {
      setLoadingBenchmarks(false);
    }
  };

  useEffect(() => {
    fetchLiveBenchmarks();
  }, []);

  const benchmarkNames: Record<string, string> = {
    'SPY': 'S&P 500',
    'URTH': 'MSCI World',
    'BTC-USD': 'Bitcoin',
    'GLD': 'Gold'
  };

  const benchmarks = liveBenchmarks.length > 0
    ? liveBenchmarks.map(b => ({
        name: benchmarkNames[b.symbol] || b.symbol,
        value: `£${b.price.toFixed(2)}`,
        change: `${b.changePercent >= 0 ? '+' : ''}${b.changePercent.toFixed(2)}%`,
        ytd: `${b.changePercent >= 0 ? '+' : ''}${(b.changePercent * 1.5).toFixed(1)}%`
      }))
    : [
        { name: "S&P 500", value: "£4,653.21", change: "+12.5%", ytd: "+18.2%" },
        { name: "MSCI World", value: "£2,569.28", change: "+10.2%", ytd: "+15.8%" },
        { name: "Bitcoin", value: "£72,174", change: "+145%", ytd: "+92.3%" },
        { name: "Gold", value: "£2,085", change: "+8.5%", ytd: "+12.1%" },
      ];

  const [trends, setTrends] = useState<any[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);

  const fetchMarketTrends = async () => {
    setLoadingTrends(true);
    try {
      const { data, error } = await supabase
        .from("market_trends")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrends(data || []);
    } catch (error) {
      console.error("Error fetching market trends:", error);
      toast.error("Failed to load market trends");
    } finally {
      setLoadingTrends(false);
    }
  };

  useEffect(() => {
    fetchMarketTrends();
  }, []);

  // Sample performance data for charts
  const performanceData = [
    { month: "Jan", portfolio: 5.2, sp500: 4.8, msci: 4.5 },
    { month: "Feb", portfolio: 6.1, sp500: 5.5, msci: 5.2 },
    { month: "Mar", portfolio: 7.8, sp500: 6.9, msci: 6.5 },
    { month: "Apr", portfolio: 9.2, sp500: 8.1, msci: 7.8 },
    { month: "May", portfolio: 11.5, sp500: 10.2, msci: 9.8 },
    { month: "Jun", portfolio: 13.8, sp500: 12.5, msci: 11.9 },
    { month: "Jul", portfolio: 15.2, sp500: 14.1, msci: 13.5 },
    { month: "Aug", portfolio: 16.8, sp500: 15.8, msci: 15.2 },
    { month: "Sep", portfolio: 18.5, sp500: 17.2, msci: 16.8 },
    { month: "Oct", portfolio: 20.1, sp500: 18.9, msci: 18.3 },
    { month: "Nov", portfolio: 22.5, sp500: 20.5, msci: 19.9 },
    { month: "Dec", portfolio: 24.2, sp500: 22.1, msci: 21.5 },
  ];

  const sectorData = [
    { sector: "Technology", allocation: 35, benchmark: 28 },
    { sector: "Healthcare", allocation: 18, benchmark: 15 },
    { sector: "Financials", allocation: 15, benchmark: 18 },
    { sector: "Consumer", allocation: 12, benchmark: 14 },
    { sector: "Energy", allocation: 10, benchmark: 12 },
    { sector: "Other", allocation: 10, benchmark: 13 },
  ];

  const riskMetrics = [
    { metric: "Sharpe Ratio", portfolio: 1.35, sp500: 1.28, msci: 1.22 },
    { metric: "Volatility", portfolio: 15.2, sp500: 14.8, msci: 14.5 },
    { metric: "Max Drawdown", portfolio: -12.5, sp500: -15.2, msci: -16.1 },
    { metric: "Beta", portfolio: 1.08, sp500: 1.00, msci: 0.95 },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Parse CSV/Excel file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const holdings: any[] = [];

        // Simple CSV parsing (skip header)
        for (let i = 1; i < lines.length; i++) {
          const [ticker, shares, price] = lines[i].split(',');
          if (ticker && shares && price) {
            holdings.push({
              ticker: ticker.trim(),
              shares: parseFloat(shares),
              price: parseFloat(price),
              value: parseFloat(shares) * parseFloat(price)
            });
          }
        }

        const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

        // Store in Supabase
        const { data, error } = await supabase
          .from("user_portfolios")
          .insert({
            user_id: user.id,
            portfolio_name: file.name.replace(/\.[^/.]+$/, ""),
            holdings: holdings,
            total_value: totalValue,
            metadata: { uploadDate: new Date().toISOString() },
            platform: "finance"
          })
          .select()
          .single();

        if (error) throw error;

        setSelectedPortfolio(data.id);
        toast.success("Portfolio uploaded successfully!");
        setUploadDialogOpen(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload portfolio");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!selectedPortfolio) {
      toast.error("Please upload a portfolio first");
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("portfolio-benchmark-analysis", {
        body: { portfolioId: selectedPortfolio }
      });

      if (error) throw error;

      setAnalysisResult(data);
      toast.success("Analysis complete!");
    } catch (error: any) {
      console.error("Analysis error:", error);
      if (error.message?.includes("429")) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else if (error.message?.includes("402")) {
        toast.error("Credits depleted. Please add more credits.");
      } else {
        toast.error("Failed to analyze portfolio");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benchmarking & Trends</h1>
          <p className="text-muted-foreground mt-2">
            Upload your portfolio and compare performance against major market indices
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Portfolio</DialogTitle>
                <DialogDescription>
                  Upload a CSV or Excel file with your portfolio holdings (columns: Ticker, Shares, Price)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolio-file">Portfolio File</Label>
                  <Input
                    id="portfolio-file"
                    type="file"
                    accept=".csv,.xlsx"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </div>
                {isUploading && (
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleAIAnalysis} 
            disabled={!selectedPortfolio || isAnalyzing}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "AI Comparison"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="benchmarks" className="w-full">
        <TabsList>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="benchmarks" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benchmarks.map((benchmark) => (
              <Card key={benchmark.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{benchmark.name}</CardTitle>
                  <Activity className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{benchmark.value}</div>
                  <div className="flex justify-between mt-2">
                    <p className={`text-xs font-medium ${benchmark.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {benchmark.change} 1Y
                    </p>
                    <p className="text-xs text-muted-foreground">
                      YTD: {benchmark.ytd}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cumulative Performance Comparison</CardTitle>
              <CardDescription>
                Year-to-date returns comparison across benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSP500" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMSCI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="portfolio" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorPortfolio)" 
                    name="Your Portfolio"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sp500" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorSP500)" 
                    name="S&P 500"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="msci" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorMSCI)" 
                    name="MSCI World"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {analysisResult && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap text-sm">{analysisResult.analysis}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-6">
          {loadingTrends ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Activity className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading market trends...</span>
              </CardContent>
            </Card>
          ) : trends.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No market trends available at this time.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {trends.map((trend) => (
              <Card key={trend.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      trend.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {trend.impact} Impact
                    </span>
                  </div>
                  <CardTitle className="mt-4">{trend.title}</CardTitle>
                  <CardDescription>{trend.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Timeframe: {trend.timeframe}</span>
                    <Button className="bg-primary hover:bg-primary/90">
                      View Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  Sector Allocation Comparison
                </CardTitle>
                <CardDescription>
                  Your portfolio vs benchmark sector weights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sectorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="sector" type="category" className="text-xs" width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="allocation" fill="hsl(var(--primary))" name="Your Portfolio" />
                    <Bar dataKey="benchmark" fill="#94a3b8" name="Benchmark" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics Comparison</CardTitle>
                <CardDescription>
                  Key risk metrics vs major indices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskMetrics.map((metric) => (
                    <div key={metric.metric} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{metric.metric}</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-primary font-semibold">You: {metric.portfolio}</span>
                        <span className="text-muted-foreground">S&P: {metric.sp500}</span>
                        <span className="text-muted-foreground">MSCI: {metric.msci}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
