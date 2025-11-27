import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Users, Filter, Download, RefreshCw, ArrowLeft, Wallet, PieChart, Activity, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AssetAllocationChart } from "@/components/AssetAllocationChart";
import { PortfolioMetricCard } from "@/components/portfolio/PortfolioMetricCard";
import { cn } from "@/lib/utils";

export default function Portfolio() {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [clients, setClients] = useState<any[]>([]);
  const [portfolioHoldings, setPortfolioHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchClientPortfolio(selectedClient);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setClients(data || []);
      if (data && data.length > 0) {
        setSelectedClient(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientPortfolio = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('client_id', clientId);
      
      if (error) throw error;
      setPortfolioHoldings(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    toast({
      title: "Generating PDF",
      description: "Capturing portfolio content...",
    });

    const options = {
      margin: 10,
      filename: `portfolio-${selectedClientData?.name || 'client'}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(options).from(contentRef.current).save();
      toast({
        title: "Download Complete",
        description: "Portfolio PDF downloaded successfully",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getColorForSector = (sector: string) => {
    const colors: Record<string, string> = {
      'Stocks': "hsl(var(--chart-1))",
      'Bonds': "hsl(var(--chart-2))", 
      'Property': "hsl(var(--chart-3))",
      'Commodities': "hsl(var(--chart-5))",
      'Cash': "hsl(var(--financial-cyan))",
      'Other': "hsl(var(--chart-4))"
    };
    return colors[sector] || "hsl(var(--muted))";
  };

  const selectedClientData = clients.find(c => c.id === selectedClient);
  const totalPortfolioValue = portfolioHoldings.reduce((sum, holding) => sum + (holding.current_value || 0), 0);
  
  const dayChange = totalPortfolioValue * 0.0045;
  const dayChangePercent = 0.45;
  const ytdChange = totalPortfolioValue * 0.0693;
  const ytdChangePercent = 6.93;

  const sectorAllocation = portfolioHoldings.reduce((acc, holding) => {
    const sector = holding.asset_type || 'Other';
    const existing = acc.find(s => s.name === sector);
    if (existing) {
      existing.value += holding.current_value || 0;
    } else {
      acc.push({
        name: sector,
        value: holding.current_value || 0,
        allocation: 0,
        color: getColorForSector(sector)
      });
    }
    return acc;
  }, [] as any[]).map(sector => ({
    ...sector,
    allocation: totalPortfolioValue > 0 ? ((sector.value / totalPortfolioValue) * 100) : 0,
    value: sector.value
  }));

  const performanceData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: totalPortfolioValue * (0.85 + (i * 0.015) + Math.random() * 0.03)
  }));

  const riskMetrics = [
    { metric: "Beta", value: "1.12", description: "Volatility vs Market", status: "moderate" },
    { metric: "Sharpe Ratio", value: "1.85", description: "Risk-Adjusted Return", status: "good" },
    { metric: "Max Drawdown", value: "-8.4%", description: "Largest Peak-to-Trough Loss", status: "low" },
    { metric: "Standard Deviation", value: "14.2%", description: "Volatility Measure", status: "moderate" }
  ];

  // Generate sparkline data for metrics
  const generateTrendData = () => Array.from({ length: 20 }, () => Math.random() * 40 + 5);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-6 space-y-6" ref={contentRef}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 print:hidden">
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Portfolio Management
              </h1>
              <p className="text-muted-foreground mt-1">Individual client portfolio analysis & insights</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-64 bg-card/50 backdrop-blur-sm">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {client.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button 
              size="sm"
              disabled={!selectedClient || loading}
              onClick={async () => {
                if (!selectedClient) return;
                setLoading(true);
                toast({
                  title: "Syncing Data",
                  description: "Updating portfolio data...",
                });
                try {
                  await fetchClientPortfolio(selectedClient);
                  toast({
                    title: "Sync Complete",
                    description: "Portfolio data updated successfully.",
                  });
                } catch (error) {
                  toast({
                    title: "Sync Failed",
                    description: "Failed to update portfolio data.",
                    variant: "destructive",
                  });
                } finally {
                  setLoading(false);
                }
              }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sync
            </Button>
          </div>
        </div>

        {/* Client Info Card */}
        {selectedClientData && (
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{selectedClientData.name}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {selectedClientData.email}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  Risk: {selectedClientData.risk_profile || "Not assessed"}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PortfolioMetricCard
            title="Total Portfolio Value"
            value={formatCurrency(totalPortfolioValue)}
            change={dayChangePercent}
            changeLabel="today"
            icon={<Wallet className="h-5 w-5" />}
            trend={generateTrendData()}
            variant="primary"
          />
          <PortfolioMetricCard
            title="YTD Performance"
            value={formatPercent(ytdChangePercent)}
            change={ytdChangePercent}
            changeLabel={formatCurrency(ytdChange)}
            icon={<TrendingUp className="h-5 w-5" />}
            trend={generateTrendData()}
            variant="success"
          />
          <PortfolioMetricCard
            title="Total Holdings"
            value={portfolioHoldings.length}
            icon={<PieChart className="h-5 w-5" />}
            variant="default"
          />
          <PortfolioMetricCard
            title="Net Worth"
            value={formatCurrency(selectedClientData?.net_worth || 0)}
            icon={<Activity className="h-5 w-5" />}
            variant="default"
          />
        </div>

        {/* Main Content with Resizable Panels */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="overview" className="gap-2">
              <PieChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="holdings" className="gap-2">
              <Wallet className="h-4 w-4" />
              Holdings
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <Activity className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="risk" className="gap-2">
              <Shield className="h-4 w-4" />
              Risk Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border bg-card/30 backdrop-blur-sm">
              <ResizablePanel defaultSize={50} minSize={30}>
                <Card className="h-full border-0 bg-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-primary" />
                      Asset Allocation
                    </CardTitle>
                    <CardDescription>Portfolio distribution by sector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AssetAllocationChart data={sectorAllocation} />
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      {sectorAllocation.map((sector) => (
                        <div 
                          key={sector.name} 
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className="w-4 h-4 rounded-full shadow-sm"
                            style={{ backgroundColor: sector.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{sector.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {sector.allocation.toFixed(1)}% • {formatCurrency(sector.value)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={50} minSize={30}>
                <Card className="h-full border-0 bg-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Performance Trend
                    </CardTitle>
                    <CardDescription>12-month portfolio growth</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="month" 
                          stroke="hsl(var(--muted-foreground))"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `£${(value / 1000000).toFixed(1)}M`}
                          stroke="hsl(var(--muted-foreground))"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          formatter={(value) => formatCurrency(value as number)}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          fill="url(#colorValue)"
                          animationDuration={1000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabsContent>

          <TabsContent value="holdings" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Current Holdings</CardTitle>
                <CardDescription>Individual positions and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {portfolioHoldings.length > 0 ? portfolioHoldings.map((holding, index) => (
                    <div 
                      key={holding.id} 
                      className={cn(
                        "p-4 border rounded-lg transition-all duration-200 hover:shadow-md hover:border-primary/30",
                        "bg-gradient-to-r from-card to-card/50"
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: 'fade-in 0.3s ease-out'
                      }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {(holding.symbol || holding.asset_name)?.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-base">{holding.symbol || holding.asset_name}</div>
                            <div className="text-sm text-muted-foreground">{holding.asset_name}</div>
                            <Badge variant="secondary" className="text-xs mt-1">{holding.asset_type}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-right">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Quantity</div>
                            <div className="font-semibold">{holding.quantity?.toLocaleString() || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Purchase Price</div>
                            <div className="font-semibold">{holding.purchase_price ? formatCurrency(holding.purchase_price) : 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Current Value</div>
                            <div className="font-semibold text-primary">{formatCurrency(holding.current_value || 0)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Allocation</div>
                            <div className="font-semibold">
                              {totalPortfolioValue > 0 ? ((holding.current_value || 0) / totalPortfolioValue * 100).toFixed(1) : '0.0'}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-muted-foreground py-12">
                      <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No holdings found for this client</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Historical performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={performanceData}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `£${(value / 1000000).toFixed(1)}M`}
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="url(#barGradient)"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskMetrics.map((metric, index) => (
                <Card 
                  key={metric.metric}
                  className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-lg transition-all duration-300"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fade-in 0.5s ease-out'
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{metric.metric}</CardTitle>
                        <CardDescription className="text-sm">{metric.description}</CardDescription>
                      </div>
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold">{metric.value}</p>
                      <Badge 
                        variant={metric.status === "good" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
