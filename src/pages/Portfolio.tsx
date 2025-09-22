import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Plus, Filter, Download, RefreshCw } from "lucide-react";

// Dummy data
const portfolioOverview = {
  totalValue: 2847392,
  dayChange: 12847,
  dayChangePercent: 0.45,
  ytdChange: 184728,
  ytdChangePercent: 6.93
};

const holdings = [
  { symbol: "AAPL", name: "Apple Inc.", quantity: 500, price: 185.43, value: 92715, allocation: 3.26, dayChange: 2.34, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", quantity: 300, price: 378.91, value: 113673, allocation: 3.99, dayChange: -1.23, sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", quantity: 200, price: 142.56, value: 28512, allocation: 1.00, dayChange: 0.87, sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", quantity: 150, price: 238.45, value: 35768, allocation: 1.26, dayChange: 4.56, sector: "Consumer Discretionary" },
  { symbol: "NVDA", name: "NVIDIA Corp.", quantity: 100, price: 498.32, value: 49832, allocation: 1.75, dayChange: 3.21, sector: "Technology" },
];

const sectorAllocation = [
  { name: "Technology", value: 45.2, color: "#8884d8" },
  { name: "Healthcare", value: 15.8, color: "#82ca9d" },
  { name: "Financial Services", value: 12.4, color: "#ffc658" },
  { name: "Consumer Discretionary", value: 10.3, color: "#ff7300" },
  { name: "Industrials", value: 8.7, color: "#00c49f" },
  { name: "Energy", value: 4.2, color: "#0088fe" },
  { name: "Utilities", value: 2.1, color: "#00c49f" },
  { name: "Real Estate", value: 1.3, color: "#ffbb28" }
];

const performanceData = [
  { month: "Jan", value: 2650000 },
  { month: "Feb", value: 2680000 },
  { month: "Mar", value: 2720000 },
  { month: "Apr", value: 2695000 },
  { month: "May", value: 2780000 },
  { month: "Jun", value: 2847392 }
];

const riskMetrics = [
  { metric: "Beta", value: "1.12", description: "Volatility vs Market" },
  { metric: "Sharpe Ratio", value: "1.85", description: "Risk-Adjusted Return" },
  { metric: "Max Drawdown", value: "-8.4%", description: "Largest Peak-to-Trough Loss" },
  { metric: "Standard Deviation", value: "14.2%", description: "Volatility Measure" }
];

export default function Portfolio() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Management</h1>
          <p className="text-muted-foreground">Monitor and manage client portfolios</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioOverview.totalValue)}</div>
            <div className="flex items-center text-sm">
              {portfolioOverview.dayChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive mr-1" />
              )}
              <span className={portfolioOverview.dayChange >= 0 ? "text-success" : "text-destructive"}>
                {formatCurrency(Math.abs(portfolioOverview.dayChange))} ({formatPercent(portfolioOverview.dayChangePercent)})
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
            <div className="text-2xl font-bold text-success">{formatPercent(portfolioOverview.ytdChangePercent)}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{formatCurrency(portfolioOverview.ytdChange)} gain</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holdings.length}</div>
            <div className="text-sm text-muted-foreground">Active positions</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(45680)}</div>
            <div className="text-sm text-muted-foreground">1.6% of portfolio</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sector Allocation */}
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
                      <span className="text-sm">{sector.name}: {sector.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
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
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
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
                {holdings.map((holding) => (
                  <div key={holding.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">{holding.symbol}</div>
                        <div className="text-sm text-muted-foreground">{holding.name}</div>
                        <Badge variant="secondary" className="text-xs">{holding.sector}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-8 text-right">
                      <div>
                        <div className="text-sm text-muted-foreground">Quantity</div>
                        <div className="font-medium">{holding.quantity.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Price</div>
                        <div className="font-medium">${holding.price.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Value</div>
                        <div className="font-medium">{formatCurrency(holding.value)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Day Change</div>
                        <div className={`font-medium ${holding.dayChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatPercent(holding.dayChange)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
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