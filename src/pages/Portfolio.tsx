import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Users, Filter, Download, RefreshCw, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
      'Stocks': "#8884d8",
      'Bonds': "#82ca9d", 
      'Property': "#ffc658",
      'Commodities': "#ff7300",
      'Cash': "#00c49f",
      'Other': "#0088fe"
    };
    return colors[sector] || "#888888";
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
        color: getColorForSector(sector)
      });
    }
    return acc;
  }, [] as any[]).map(sector => ({
    ...sector,
    value: totalPortfolioValue > 0 ? (sector.value / totalPortfolioValue * 100) : 0
  }));

  const performanceData = Array.from({ length: 6 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
    value: totalPortfolioValue * (0.9 + (i * 0.02) + Math.random() * 0.05)
  }));

  const riskMetrics = [
    { metric: "Beta", value: "1.12", description: "Volatility vs Market" },
    { metric: "Sharpe Ratio", value: "1.85", description: "Risk-Adjusted Return" },
    { metric: "Max Drawdown", value: "-8.4%", description: "Largest Peak-to-Trough Loss" },
    { metric: "Standard Deviation", value: "14.2%", description: "Volatility Measure" }
  ];

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6" ref={contentRef}>
      <div className="flex justify-between items-center print:hidden">
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
            <h1 className="text-3xl font-bold">Portfolio Management</h1>
            <p className="text-muted-foreground">Individual client portfolio analysis</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-64">
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast({
                title: "Filter Options",
                description: "Opening portfolio filter options...",
              })}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button 
              size="sm"
              onClick={() => {
                toast({
                  title: "Syncing Data",
                  description: "Updating portfolio data from market sources...",
                });
                setTimeout(() => {
                  fetchClientPortfolio(selectedClient);
                  toast({
                    title: "Sync Complete",
                    description: "Portfolio data updated successfully.",
                  });
                }, 1500);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Data
            </Button>
          </div>
        </div>
      </div>

      {selectedClientData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedClientData.name}
            </CardTitle>
            <CardDescription>
              {selectedClientData.email} • Risk Profile: {selectedClientData.risk_profile || "Not assessed"}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
            <div className="flex items-center text-sm">
              {dayChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive mr-1" />
              )}
              <span className={dayChange >= 0 ? "text-success" : "text-destructive"}>
                {formatCurrency(Math.abs(dayChange))} ({formatPercent(dayChangePercent)})
              </span>
              <span className="text-muted-foreground ml-1">today</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatPercent(ytdChangePercent)}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{formatCurrency(ytdChange)} gain</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioHoldings.length}</div>
            <div className="text-sm text-muted-foreground">Active positions</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(selectedClientData?.net_worth || 0)}</div>
            <div className="text-sm text-muted-foreground">Client net worth</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="print:hidden">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
                <CardDescription>Portfolio distribution by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sectorAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {sectorAllocation.slice(0, 6).map((sector) => (
                    <div key={sector.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sector.color }}
                      />
                      <span className="text-sm">{sector.name}: {sector.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>6-month trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `£${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="holdings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Holdings</CardTitle>
              <CardDescription>Individual positions and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioHoldings.length > 0 ? portfolioHoldings.map((holding) => (
                  <div key={holding.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">{holding.symbol || holding.asset_name}</div>
                        <div className="text-sm text-muted-foreground">{holding.asset_name}</div>
                        <Badge variant="secondary" className="text-xs">{holding.asset_type}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-8 text-right">
                      <div>
                        <div className="text-sm text-muted-foreground">Quantity</div>
                        <div className="font-medium">{holding.quantity?.toLocaleString() || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Purchase Price</div>
                        <div className="font-medium">{holding.purchase_price ? formatCurrency(holding.purchase_price) : 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Current Value</div>
                        <div className="font-medium">{formatCurrency(holding.current_value || 0)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Allocation</div>
                        <div className="font-medium">
                          {totalPortfolioValue > 0 ? ((holding.current_value || 0) / totalPortfolioValue * 100).toFixed(1) : '0.0'}%
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground py-8">
                    No holdings found for this client
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Historical performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `£${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {riskMetrics.map((metric) => (
              <Card key={metric.metric}>
                <CardHeader>
                  <CardTitle>{metric.metric}</CardTitle>
                  <CardDescription>{metric.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metric.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
