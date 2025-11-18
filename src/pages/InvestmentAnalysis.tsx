import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from "recharts";
import { Search, TrendingUp, TrendingDown, BarChart3, PieChart, Star, AlertTriangle, Info, Download, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Dummy investment data
const investments = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 185.43,
    change: 2.34,
    changePercent: 1.28,
    marketCap: "2.89T",
    pe: 28.5,
    dividend: 0.54,
    beta: 1.12,
    rating: "Buy",
    risk: "Medium",
    sector: "Technology"
  },
  {
    symbol: "MSFT", 
    name: "Microsoft Corp.",
    price: 378.91,
    change: -4.23,
    changePercent: -1.10,
    marketCap: "2.81T",
    pe: 32.1,
    dividend: 0.75,
    beta: 0.89,
    rating: "Buy",
    risk: "Medium",
    sector: "Technology"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.56,
    change: 1.87,
    changePercent: 1.33,
    marketCap: "1.79T", 
    pe: 25.8,
    dividend: 0.00,
    beta: 1.05,
    rating: "Hold",
    risk: "Medium",
    sector: "Technology"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 238.45,
    change: 12.34,
    changePercent: 5.46,
    marketCap: "758B",
    pe: 45.2,
    dividend: 0.00,
    beta: 2.15,
    rating: "Hold",
    risk: "High",
    sector: "Consumer Discretionary"
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    price: 168.92,
    change: 0.45,
    changePercent: 0.27,
    marketCap: "445B",
    pe: 15.7,
    dividend: 2.95,
    beta: 0.65,
    rating: "Buy",
    risk: "Low",
    sector: "Healthcare"
  }
];

const performanceData = [
  { period: "1M", AAPL: 5.2, MSFT: -2.1, GOOGL: 3.8, TSLA: 15.4, JNJ: 1.2, SP500: 2.8 },
  { period: "3M", AAPL: 12.5, MSFT: 8.9, GOOGL: 7.3, TSLA: -8.2, JNJ: 4.5, SP500: 6.1 },
  { period: "6M", AAPL: 18.7, MSFT: 15.2, GOOGL: 12.1, TSLA: 22.8, JNJ: 8.9, SP500: 12.4 },
  { period: "1Y", AAPL: 24.3, MSFT: 28.1, GOOGL: 19.5, TSLA: 35.2, JNJ: 12.3, SP500: 18.9 },
  { period: "3Y", AAPL: 65.8, MSFT: 89.2, GOOGL: 45.7, TSLA: 125.4, JNJ: 25.1, SP500: 52.3 }
];

const riskReturnData = investments.map(inv => ({
  symbol: inv.symbol,
  risk: inv.beta,
  return: parseFloat(performanceData[3][inv.symbol as keyof typeof performanceData[3]] as string),
  marketCap: parseFloat(inv.marketCap.replace(/[^\d.]/g, ''))
}));

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
  const [selectedInvestment, setSelectedInvestment] = useState(investments[0]);
  const [sortBy, setSortBy] = useState("performance");

  const filteredInvestments = investments.filter(inv =>
    inv.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
    <div className="p-6 space-y-6 ml-64">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Investment Analysis</h1>
            <p className="text-muted-foreground">Comprehensive investment research and analysis tools</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
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
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button 
            size="sm"
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
                title: "Watchlist Created",
                description: `${selectedInvestment.symbol} has been added to your new watchlist.`,
              });
            }}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Create Watchlist
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
          <div className="flex gap-4">
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
              <SelectTrigger className="w-48">
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
                    
                    <div className="grid grid-cols-6 gap-6 text-right">
                      <div>
                        <div className="text-sm text-muted-foreground">Price</div>
                        <div className="font-semibold">{formatCurrency(investment.price)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Change</div>
                        <div className={`font-semibold flex items-center justify-end gap-1 ${
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
                        <div className="text-sm text-muted-foreground">Market Cap</div>
                        <div className="font-semibold">{investment.marketCap}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">P/E Ratio</div>
                        <div className="font-semibold">{investment.pe}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Dividend</div>
                        <div className="font-semibold">{investment.dividend}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Risk</div>
                        <div className={`font-semibold ${getRiskColor(investment.risk)}`}>
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-sm text-muted-foreground">Current Price</div>
                    <div className="text-xl font-bold">{formatCurrency(selectedInvestment.price)}</div>
                    <div className={`text-sm ${selectedInvestment.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatPercent(selectedInvestment.changePercent)} today
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-sm text-muted-foreground">Market Cap</div>
                    <div className="text-xl font-bold">{selectedInvestment.marketCap}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-sm text-muted-foreground">P/E Ratio</div>
                    <div className="text-xl font-bold">{selectedInvestment.pe}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-sm text-muted-foreground">Beta</div>
                    <div className="text-xl font-bold">{selectedInvestment.beta}</div>
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
                  <h4 className="font-semibold mb-2">Key Insights</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-primary mt-0.5" />
                      <span>Strong fundamentals with consistent growth trajectory</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-warning mt-0.5" />
                      <span>Outperforming sector average by 3.2%</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                      <span>Monitor upcoming earnings report</span>
                    </div>
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
          <Card>
            <CardHeader>
              <CardTitle>Sector Analysis</CardTitle>
              <CardDescription>Performance and outlook by market sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectorAnalysis.map((sector) => (
                  <div key={sector.sector} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{sector.sector}</h3>
                        <p className="text-sm text-muted-foreground">
                          {sector.allocation}% of portfolio
                        </p>
                      </div>
                      <Badge variant="outline">{sector.outlook}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Performance</div>
                        <div className="font-semibold text-success">{sector.performance}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Risk Level</div>
                        <div className={`font-semibold ${getRiskColor(sector.risk)}`}>
                          {sector.risk}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Allocation</div>
                        <div className="font-semibold">{sector.allocation}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}