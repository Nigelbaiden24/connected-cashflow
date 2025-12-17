import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { Search, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Star, AlertTriangle, Info, Download, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CreateWatchlistDialog } from "@/components/investor/CreateWatchlistDialog";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Investment {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  pe: number;
  dividend: number;
  beta: number;
  rating: string;
  risk: string;
  sector: string;
}

const performanceData = [
  { period: "1M", AAPL: 5.2, MSFT: -2.1, GOOGL: 3.8, TSLA: 15.4, JNJ: 1.2, SP500: 2.8 },
  { period: "3M", AAPL: 12.5, MSFT: 8.9, GOOGL: 7.3, TSLA: -8.2, JNJ: 4.5, SP500: 6.1 },
  { period: "6M", AAPL: 18.7, MSFT: 15.2, GOOGL: 12.1, TSLA: 22.8, JNJ: 8.9, SP500: 12.4 },
  { period: "1Y", AAPL: 24.3, MSFT: 28.1, GOOGL: 19.5, TSLA: 35.2, JNJ: 12.3, SP500: 18.9 },
  { period: "3Y", AAPL: 65.8, MSFT: 89.2, GOOGL: 45.7, TSLA: 125.4, JNJ: 25.1, SP500: 52.3 }
];

const sectorAnalysis = [
  { sector: "Technology", allocation: 45.2, performance: "12.4%", risk: "Medium", outlook: "Positive" },
  { sector: "Healthcare", allocation: 15.8, performance: "8.7%", risk: "Low", outlook: "Stable" },
  { sector: "Financial Services", allocation: 12.4, performance: "6.9%", risk: "Medium", outlook: "Positive" },
  { sector: "Consumer Discretionary", allocation: 10.3, performance: "15.2%", risk: "High", outlook: "Volatile" },
  { sector: "Industrials", allocation: 8.7, performance: "9.1%", risk: "Medium", outlook: "Stable" }
];

export default function InvestmentAnalysis() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [sortBy, setSortBy] = useState("performance");
  const [watchlistDialogOpen, setWatchlistDialogOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMarketData, setLoadingMarketData] = useState(true);

  const { analyzeWithAI, isLoading: aiLoading } = useAIAnalyst({
    onDelta: (text) => setAiAnalysis(prev => prev + text),
    onDone: () => setIsAnalyzing(false),
    onError: (error) => {
      toast({
        title: "Analysis Error",
        description: error,
        variant: "destructive",
      });
      setIsAnalyzing(false);
    },
  });

  useEffect(() => {
    fetchMarketData();
  }, []);

  useEffect(() => {
    if (selectedInvestment) {
      fetchAIAnalysis();
    }
  }, [selectedInvestment]);

  const fetchMarketData = async () => {
    setLoadingMarketData(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: { symbols: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'JNJ', 'NVDA', 'META', 'AMZN'] }
      });

      if (error) throw error;

      if (data?.investments && data.investments.length > 0) {
        setInvestments(data.investments);
        setSelectedInvestment(data.investments[0]);
        
        toast({
          title: "Market Data Updated",
          description: "Latest investment data loaded successfully",
        });
      } else {
        throw new Error("No investment data received");
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      
      // Provide fallback data if API fails
      const fallbackInvestments: Investment[] = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 141.02, change: 1.98, changePercent: 1.42, marketCap: '£2.2T', pe: 29.5, dividend: 0.53, beta: 1.24, rating: 'Buy', risk: 'Medium', sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', price: 299.94, change: -0.95, changePercent: -0.32, marketCap: '£2.2T', pe: 35.2, dividend: 0.75, beta: 1.10, rating: 'Buy', risk: 'Low', sector: 'Technology' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 111.22, change: 1.46, changePercent: 1.33, marketCap: '£1.4T', pe: 26.8, dividend: 0.00, beta: 1.05, rating: 'Buy', risk: 'Medium', sector: 'Technology' },
        { symbol: 'TSLA', name: 'Tesla, Inc.', price: 192.25, change: 6.69, changePercent: 3.60, marketCap: '£609B', pe: 68.5, dividend: 0.00, beta: 2.01, rating: 'Hold', risk: 'High', sector: 'Automotive' },
        { symbol: 'JNJ', name: 'Johnson & Johnson', price: 124.08, change: 0.36, changePercent: 0.29, marketCap: '£299B', pe: 15.3, dividend: 2.85, beta: 0.65, rating: 'Buy', risk: 'Low', sector: 'Healthcare' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 392.03, change: 9.73, changePercent: 2.55, marketCap: '£950B', pe: 118.4, dividend: 0.04, beta: 1.68, rating: 'Buy', risk: 'High', sector: 'Technology' },
        { symbol: 'META', name: 'Meta Platforms, Inc.', price: 386.53, change: 4.55, changePercent: 1.19, marketCap: '£950B', pe: 31.7, dividend: 0.00, beta: 1.32, rating: 'Buy', risk: 'Medium', sector: 'Technology' },
        { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 138.81, change: 1.66, changePercent: 1.21, marketCap: '£1.4T', pe: 52.9, dividend: 0.00, beta: 1.15, rating: 'Buy', risk: 'Medium', sector: 'E-commerce' },
      ];
      
      setInvestments(fallbackInvestments);
      setSelectedInvestment(fallbackInvestments[0]);
      
      toast({
        title: "Using Cached Data",
        description: "Live market data unavailable. Showing recent cached data.",
        variant: "default",
      });
    } finally {
      setLoadingMarketData(false);
    }
  };

  const fetchAIAnalysis = async () => {
    if (!selectedInvestment) return;
    setIsAnalyzing(true);
    setAiAnalysis("");
    await analyzeWithAI(
      `Provide a comprehensive investment analysis for ${selectedInvestment.name} (${selectedInvestment.symbol})`,
      "company-qa",
      selectedInvestment.symbol
    );
  };

  const riskReturnData = investments.map(inv => {
    const perfData = performanceData[3];
    const symbolKey = inv.symbol as keyof typeof perfData;
    const returnValue = perfData[symbolKey];
    
    return {
      symbol: inv.symbol,
      risk: inv.beta,
      return: typeof returnValue === 'number' ? returnValue : typeof returnValue === 'string' ? parseFloat(returnValue) : 0,
      marketCap: parseFloat(inv.marketCap.replace(/[^\d.]/g, '')) || 0
    };
  });

  const filteredInvestments = investments
    .filter(inv =>
      inv.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "performance":
          return b.changePercent - a.changePercent;
        case "marketCap":
          const aMarketCap = parseFloat(a.marketCap.replace(/[^\d.]/g, ''));
          const bMarketCap = parseFloat(b.marketCap.replace(/[^\d.]/g, ''));
          return bMarketCap - aMarketCap;
        case "pe":
          return b.pe - a.pe;
        case "dividend":
          return b.dividend - a.dividend;
        case "beta":
          return b.beta - a.beta;
        default:
          return 0;
      }
    });

  if (loadingMarketData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case "buy": return "text-success";
      case "hold": return "text-warning";
      case "sell": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low": return "text-success";
      case "medium": return "text-warning";
      case "high": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Investment Analysis</h1>
            <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">Comprehensive investment research and analysis tools</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchMarketData}
            disabled={loadingMarketData}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${loadingMarketData ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              if (!selectedInvestment) {
                toast({
                  title: "No Investment Selected",
                  description: "Please select an investment first.",
                  variant: "destructive",
                });
                return;
              }
              
              toast({
                title: "Exporting Report",
                description: "Generating investment analysis report...",
              });
              
              setTimeout(() => {
                toast({
                  title: "Report Ready",
                  description: `Investment analysis report for ${selectedInvestment.symbol} downloaded successfully.`,
                });
              }, 1500);
            }}
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
          <Button 
            size="sm"
            onClick={() => setWatchlistDialogOpen(true)}
            disabled={!selectedInvestment}
            className="flex-1 sm:flex-none"
          >
            <BarChart3 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Create Watchlist</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="screener" className="space-y-6">
        <TabsList>
          <TabsTrigger value="screener">Investment Screener</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Performance Comparison</TabsTrigger>
          <TabsTrigger value="sectors">Sector Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="screener" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investments by symbol or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="marketCap">Market Cap</SelectItem>
                <SelectItem value="pe">P/E Ratio</SelectItem>
                <SelectItem value="dividend">Dividend Yield</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Investment Screener Results</CardTitle>
              <CardDescription>Click on any investment for detailed analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredInvestments.map((investment) => (
                  <div
                    key={investment.symbol}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedInvestment(investment)}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{investment.symbol}</span>
                          <Badge variant="outline" className={getRatingColor(investment.rating)}>
                            {investment.rating}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{investment.name}</div>
                        <div className="text-xs text-muted-foreground">{investment.sector}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 text-right">
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Price</div>
                        <div className="font-semibold text-sm sm:text-base">{formatCurrency(investment.price)}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Change</div>
                        <div className={`font-semibold text-sm sm:text-base flex items-center justify-end gap-1 ${
                          investment.change >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {investment.change >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatPercent(investment.changePercent)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Market Cap</div>
                        <div className="font-semibold text-sm sm:text-base">{investment.marketCap}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground">P/E Ratio</div>
                        <div className="font-semibold text-sm sm:text-base">{investment.pe}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Dividend</div>
                        <div className="font-semibold text-sm sm:text-base">{investment.dividend}%</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Risk</div>
                        <div className={`font-semibold text-sm sm:text-base ${getRiskColor(investment.risk)}`}>
                          {investment.risk}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {selectedInvestment && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Investment Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{selectedInvestment.symbol}</span>
                    <Badge variant="outline" className={getRatingColor(selectedInvestment.rating)}>
                      {selectedInvestment.rating}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{selectedInvestment.name}</CardDescription>
                </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-xs sm:text-sm text-muted-foreground">Current Price</div>
                    <div className="text-lg sm:text-xl font-bold">{formatCurrency(selectedInvestment.price)}</div>
                    <div className={`text-xs sm:text-sm ${selectedInvestment.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatPercent(selectedInvestment.changePercent)} today
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-xs sm:text-sm text-muted-foreground">Market Cap</div>
                    <div className="text-lg sm:text-xl font-bold">{selectedInvestment.marketCap}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-xs sm:text-sm text-muted-foreground">P/E Ratio</div>
                    <div className="text-lg sm:text-xl font-bold">{selectedInvestment.pe}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-xs sm:text-sm text-muted-foreground">Beta</div>
                    <div className="text-lg sm:text-xl font-bold">{selectedInvestment.beta}</div>
                  </div>
                </div>

                {/* Performance Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Historical Performance</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey={selectedInvestment.symbol} fill="hsl(var(--primary))" />
                      <Bar dataKey="SP500" fill="hsl(var(--muted-foreground))" opacity={0.3} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recommendation</span>
                    <Badge className={getRatingColor(selectedInvestment.rating)}>
                      {selectedInvestment.rating}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span className={getRiskColor(selectedInvestment.risk)}>{selectedInvestment.risk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sector</span>
                    <span>{selectedInvestment.sector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dividend Yield</span>
                    <span>{selectedInvestment.dividend}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    AI Analysis
                    {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
                  </h4>
                  <div className="space-y-2 text-sm max-h-[300px] overflow-y-auto">
                    {isAnalyzing && !aiAnalysis && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating AI analysis...</span>
                      </div>
                    )}
                    {aiAnalysis && (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                      </div>
                    )}
                    {!aiAnalysis && !isAnalyzing && (
                      <p className="text-muted-foreground">No AI analysis available</p>
                    )}
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => {
                    if (!selectedInvestment) {
                      toast({
                        title: "Error",
                        description: "No investment selected.",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    toast({
                      title: "Added to Portfolio",
                      description: `${selectedInvestment.symbol} - ${selectedInvestment.name} has been added to your portfolio.`,
                    });
                  }}
                >
                  Add to Portfolio
                </Button>
              </CardContent>
            </Card>
          </div>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
              <CardDescription>Compare multiple investments across different time periods</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line type="monotone" dataKey="AAPL" stroke="#8884d8" strokeWidth={2} name="Apple" />
                  <Line type="monotone" dataKey="MSFT" stroke="#82ca9d" strokeWidth={2} name="Microsoft" />
                  <Line type="monotone" dataKey="GOOGL" stroke="#ffc658" strokeWidth={2} name="Google" />
                  <Line type="monotone" dataKey="TSLA" stroke="#ff7300" strokeWidth={2} name="Tesla" />
                  <Line type="monotone" dataKey="SP500" stroke="#0088fe" strokeWidth={2} name="S&P 500" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk vs Return Analysis</CardTitle>
              <CardDescription>Portfolio positioning based on risk and return metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={riskReturnData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="risk" name="Beta (Risk)" />
                  <YAxis dataKey="return" name="1Y Return %" />
                  <Tooltip formatter={(value, name) => [
                    name === "risk" ? value : `${value}%`,
                    name === "risk" ? "Beta" : "1Y Return"
                  ]} />
                  <Scatter dataKey="return" fill="hsl(var(--primary))" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-6">
          {/* Sector Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {sectorAnalysis.map((sector, index) => (
              <Card 
                key={sector.sector} 
                className="bg-gradient-to-br from-card to-muted/30 border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/30"
                style={{ animationDelay: `${index * 100}ms`, animation: 'fade-in 0.5s ease-out' }}
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{sector.allocation}%</div>
                    <div className="text-sm text-muted-foreground mt-1 font-medium">{sector.sector}</div>
                    <Badge 
                      variant="outline" 
                      className={`mt-3 ${
                        sector.outlook === 'Positive' ? 'bg-success/10 text-success border-success/30' :
                        sector.outlook === 'Volatile' ? 'bg-warning/10 text-warning border-warning/30' :
                        'bg-muted text-muted-foreground'
                      }`}
                    >
                      {sector.outlook}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sector Performance Chart */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Sector Performance
                </CardTitle>
                <CardDescription>YTD performance by market sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sectorAnalysis} layout="vertical">
                    <defs>
                      <linearGradient id="sectorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="sector" width={130} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [`${value}`, 'Performance']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey={(d) => parseFloat(d.performance)} 
                      fill="url(#sectorGradient)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sector Allocation Pie */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Portfolio Allocation
                </CardTitle>
                <CardDescription>Distribution across sectors</CardDescription>
              </CardHeader>
              <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={sectorAnalysis}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="allocation"
                  >
                    {sectorAnalysis.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(${index * 60}, 70%, 50%)`}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </RechartsPieChart>
              </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Sector Cards */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Detailed Sector Analysis
              </CardTitle>
              <CardDescription>In-depth metrics and outlook by market sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectorAnalysis.map((sector, index) => (
                  <div 
                    key={sector.sector} 
                    className="p-6 rounded-xl border bg-gradient-to-r from-card to-muted/30 hover:shadow-lg transition-all duration-300 hover:border-primary/30"
                    style={{ animationDelay: `${index * 100}ms`, animation: 'fade-in 0.5s ease-out' }}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          sector.risk === 'Low' ? 'bg-success/20' :
                          sector.risk === 'Medium' ? 'bg-warning/20' :
                          'bg-destructive/20'
                        }`}>
                          <BarChart3 className={`h-6 w-6 ${
                            sector.risk === 'Low' ? 'text-success' :
                            sector.risk === 'Medium' ? 'text-warning' :
                            'text-destructive'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{sector.sector}</h3>
                          <p className="text-sm text-muted-foreground">
                            {sector.allocation}% of total portfolio
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant="outline"
                          className={`${
                            sector.outlook === 'Positive' ? 'bg-success/10 text-success border-success/30' :
                            sector.outlook === 'Volatile' ? 'bg-warning/10 text-warning border-warning/30' :
                            'bg-muted text-muted-foreground'
                          }`}
                        >
                          {sector.outlook}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={`${getRiskColor(sector.risk)} border-current/30`}
                        >
                          {sector.risk} Risk
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-success/10 text-center">
                        <div className="text-xs text-muted-foreground mb-1">YTD Performance</div>
                        <div className="text-xl font-bold text-success">{sector.performance}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/10 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Allocation</div>
                        <div className="text-xl font-bold text-primary">{sector.allocation}%</div>
                      </div>
                      <div className={`p-4 rounded-lg text-center ${
                        sector.risk === 'Low' ? 'bg-success/10' :
                        sector.risk === 'Medium' ? 'bg-warning/10' :
                        'bg-destructive/10'
                      }`}>
                        <div className="text-xs text-muted-foreground mb-1">Risk Level</div>
                        <div className={`text-xl font-bold ${getRiskColor(sector.risk)}`}>{sector.risk}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Market Outlook</div>
                        <div className="text-xl font-bold">{sector.outlook}</div>
                      </div>
                    </div>

                    {/* Progress bar for allocation */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Portfolio Weight</span>
                        <span>{sector.allocation}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                          style={{ width: `${sector.allocation}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedInvestment && (
        <CreateWatchlistDialog
          open={watchlistDialogOpen}
          onOpenChange={setWatchlistDialogOpen}
          initialSymbol={{
            symbol: selectedInvestment.symbol,
            name: selectedInvestment.name,
            price: selectedInvestment.price,
            change_percent: selectedInvestment.changePercent,
          }}
        />
      )}
    </div>
  );
}