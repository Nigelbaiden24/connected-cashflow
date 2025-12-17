import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from "recharts";
import { Users, DollarSign, TrendingUp, Calendar, Briefcase, Target, Filter, Download, Plus, Phone, Mail, Clock, ArrowLeft, Activity, Shield, PieChart as PieChartIcon } from "lucide-react";
import { PracticeMetricCard } from "@/components/practice/PracticeMetricCard";
import { ActivityFeedCard } from "@/components/practice/ActivityFeedCard";
import { cn } from "@/lib/utils";

// Practice management data
const practiceMetrics = {
  totalClients: 289,
  assetsUnderManagement: 142800000,
  monthlyRevenue: 102300,
  growthRate: 15.8,
  clientRetention: 95.2,
  averageClientValue: 494115
};

const clientGrowth = [
  { month: "Jan", newClients: 8, totalClients: 210 },
  { month: "Feb", newClients: 12, totalClients: 222 },
  { month: "Mar", newClients: 6, totalClients: 228 },
  { month: "Apr", newClients: 9, totalClients: 237 },
  { month: "May", newClients: 10, totalClients: 247 },
  { month: "Jun", newClients: 7, totalClients: 254 },
  { month: "Jul", newClients: 11, totalClients: 265 },
  { month: "Aug", newClients: 5, totalClients: 270 },
  { month: "Sep", newClients: 8, totalClients: 278 },
  { month: "Oct", newClients: 6, totalClients: 284 },
  { month: "Nov", newClients: 5, totalClients: 289 },
  { month: "Dec", newClients: 0, totalClients: 289 }
];

const revenueData = [
  { month: "Jan", revenue: 78500, fees: 72300, commissions: 6200 },
  { month: "Feb", revenue: 83200, fees: 76800, commissions: 6400 },
  { month: "Mar", revenue: 79800, fees: 73600, commissions: 6200 },
  { month: "Apr", revenue: 86400, fees: 80100, commissions: 6300 },
  { month: "May", revenue: 89500, fees: 82800, commissions: 6700 },
  { month: "Jun", revenue: 91200, fees: 84200, commissions: 7000 },
  { month: "Jul", revenue: 94800, fees: 87500, commissions: 7300 },
  { month: "Aug", revenue: 88600, fees: 81800, commissions: 6800 },
  { month: "Sep", revenue: 96200, fees: 88900, commissions: 7300 },
  { month: "Oct", revenue: 99100, fees: 91400, commissions: 7700 },
  { month: "Nov", revenue: 102300, fees: 94500, commissions: 7800 },
  { month: "Dec", revenue: 105600, fees: 97300, commissions: 8300 }
];

const clientSegmentation = [
  { segment: "High Net Worth", value: 62, color: "hsl(var(--chart-1))", clients: 48, aum: 88500000 },
  { segment: "Mass Affluent", value: 27, color: "hsl(var(--chart-2))", clients: 102, aum: 38600000 },
  { segment: "Emerging Wealth", value: 8, color: "hsl(var(--chart-3))", clients: 95, aum: 11400000 },
  { segment: "Retirement Focus", value: 3, color: "hsl(var(--chart-5))", clients: 44, aum: 4300000 }
];

const upcomingTasks = [
  { id: 1, client: "Robert Chen", task: "Annual Review Meeting", due: "2024-12-18", priority: "high", type: "meeting" },
  { id: 2, client: "Sarah Williams", task: "Year-End Tax Planning", due: "2024-12-20", priority: "high", type: "action" },
  { id: 3, client: "Michael Davis", task: "Portfolio Rebalancing", due: "2024-12-22", priority: "medium", type: "action" },
  { id: 4, client: "Lisa Thompson", task: "2025 Goals Discussion", due: "2024-12-28", priority: "medium", type: "meeting" },
  { id: 5, client: "David Park", task: "Q4 Performance Review", due: "2024-12-30", priority: "high", type: "review" },
  { id: 6, client: "Emma Wilson", task: "Investment Strategy Update", due: "2025-01-05", priority: "medium", type: "meeting" },
  { id: 7, client: "James Foster", task: "Estate Planning Review", due: "2025-01-08", priority: "high", type: "review" }
];

const recentActivities = [
  { id: 1, type: "client_meeting", client: "Jennifer Martinez", description: "Year-end portfolio review completed", time: "2 hours ago" },
  { id: 2, type: "new_client", client: "Oliver Thompson", description: "New client onboarding completed - £2.1M AUM", time: "4 hours ago" },
  { id: 3, type: "trade_execution", client: "Susan Garcia", description: "Year-end tax loss harvesting executed", time: "6 hours ago" },
  { id: 4, type: "compliance", client: "All Clients", description: "Annual compliance audit completed", time: "1 day ago" },
  { id: 5, type: "document_upload", client: "Mark Johnson", description: "2025 financial plan approved and signed", time: "1 day ago" },
];

const performanceMetrics = [
  { metric: "Client Satisfaction", value: 4.9, target: 4.5, unit: "/5", status: "excellent" },
  { metric: "Response Time", value: 2.1, target: 4.0, unit: " hours", status: "excellent" },
  { metric: "Meeting Completion", value: 97, target: 90, unit: "%", status: "excellent" },
  { metric: "Referral Rate", value: 22, target: 15, unit: "%", status: "excellent" },
  { metric: "Client Retention", value: 95.2, target: 92, unit: "%", status: "excellent" },
  { metric: "Revenue Growth", value: 15.8, target: 10, unit: "%", status: "excellent" }
];

export default function PracticeManagement() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState(recentActivities);

  // Auto-update activities every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => [
        {
          id: Date.now(),
          type: ['client_meeting', 'new_client', 'trade_execution'][Math.floor(Math.random() * 3)],
          client: 'System Update',
          description: 'Activity auto-refreshed',
          time: 'Just now'
        },
        ...prev.slice(0, 4)
      ]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleExportReport = () => {
    const reportData = {
      id: `report-${Date.now()}`,
      title: 'Practice Management Report',
      generatedAt: new Date(),
      type: 'practice' as const,
      data: {
        totalClients: practiceMetrics.totalClients,
        aum: practiceMetrics.assetsUnderManagement,
        monthlyRevenue: practiceMetrics.monthlyRevenue,
        clientRetention: practiceMetrics.clientRetention,
        growthRate: practiceMetrics.growthRate,
        clientGrowth,
        revenueData,
        clientSegmentation,
        performanceMetrics
      }
    };

    sessionStorage.setItem('exportedReport', JSON.stringify(reportData));
    navigate('/reports');
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-success text-success-foreground";
      case "good": return "bg-primary text-primary-foreground";
      case "fair": return "bg-warning text-warning-foreground";
      case "poor": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Generate sparkline data
  const generateSparkline = () => Array.from({ length: 20 }, () => Math.random() * 40 + 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
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
                Practice Management
              </h1>
              <p className="text-muted-foreground mt-1">Comprehensive business analytics and client insights</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportReport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => navigate('/calendar')} className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PracticeMetricCard
            title="Total Clients"
            value={practiceMetrics.totalClients}
            subtitle="this year"
            trend="up"
            trendValue="+79"
            icon={<Users className="h-5 w-5 text-primary" />}
            sparkline={generateSparkline()}
            variant="primary"
          />
          <PracticeMetricCard
            title="Assets Under Management"
            value={formatCurrency(practiceMetrics.assetsUnderManagement)}
            subtitle="YTD"
            trend="up"
            trendValue={`+${practiceMetrics.growthRate}%`}
            icon={<DollarSign className="h-5 w-5 text-success" />}
            sparkline={generateSparkline()}
            variant="success"
          />
          <PracticeMetricCard
            title="Monthly Revenue"
            value={formatCurrency(practiceMetrics.monthlyRevenue)}
            subtitle="YoY"
            trend="up"
            trendValue="+34.5%"
            icon={<TrendingUp className="h-5 w-5 text-chart-3" />}
            sparkline={generateSparkline()}
            variant="default"
          />
          <PracticeMetricCard
            title="Client Retention"
            value={`${practiceMetrics.clientRetention}%`}
            subtitle="Above industry average"
            icon={<Target className="h-5 w-5 text-chart-5" />}
            variant="default"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <Clock className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <Shield className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border bg-card/30 backdrop-blur-sm">
              <ResizablePanel defaultSize={60} minSize={40}>
                <Card className="h-full border-0 bg-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Client Growth Trend
                    </CardTitle>
                    <CardDescription>New client acquisition over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={clientGrowth}>
                        <defs>
                          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
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
                          stroke="hsl(var(--muted-foreground))"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="totalClients" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          fill="url(#growthGradient)"
                          name="Total Clients"
                        />
                        <Bar 
                          dataKey="newClients" 
                          fill="hsl(var(--chart-5))" 
                          opacity={0.6}
                          radius={[4, 4, 0, 0]}
                          name="New Clients"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={40} minSize={30}>
                <ActivityFeedCard activities={activities} />
              </ResizablePanel>
            </ResizablePanelGroup>

            {/* Client Segmentation */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Client Segmentation by AUM
                </CardTitle>
                <CardDescription>Distribution of clients across wealth segments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <defs>
                        {clientSegmentation.map((entry, index) => (
                          <linearGradient key={`gradient-${index}`} id={`segmentGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={clientSegmentation}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="hsl(var(--background))"
                        strokeWidth={3}
                      >
                        {clientSegmentation.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#segmentGradient-${index})`}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-4">
                    {clientSegmentation.map((segment, index) => (
                      <div 
                        key={segment.segment}
                        className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-all duration-200"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: 'fade-in 0.5s ease-out'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: segment.color }}
                            />
                            <div>
                              <div className="font-semibold">{segment.segment}</div>
                              <div className="text-sm text-muted-foreground">{segment.clients} clients</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatCurrency(segment.aum)}</div>
                            <div className="text-sm text-muted-foreground">{segment.value}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Client Analytics Dashboard</CardTitle>
                <CardDescription>Detailed client metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Average Client Value", value: formatCurrency(practiceMetrics.averageClientValue), change: "+8.7% vs last year", trend: "up" },
                    { label: "Client Acquisition Cost", value: "£2,280", subtitle: "Average cost per new client" },
                    { label: "Lifetime Value", value: "£168K", subtitle: "Projected client lifetime value" }
                  ].map((metric, index) => (
                    <div 
                      key={metric.label}
                      className="p-6 rounded-lg border bg-gradient-to-br from-card to-card/50 hover:shadow-md transition-all duration-200"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fade-in 0.5s ease-out'
                      }}
                    >
                      <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
                      <div className="text-3xl font-bold mb-1">{metric.value}</div>
                      <div className={cn(
                        "text-sm",
                        metric.trend === "up" ? "text-success" : "text-muted-foreground"
                      )}>
                        {metric.change || metric.subtitle}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Monthly revenue breakdown and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueData}>
                    <defs>
                      <linearGradient id="feesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="commissionsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `£${(value / 1000).toFixed(0)}K`}
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
                      dataKey="fees" 
                      stackId="a" 
                      fill="url(#feesGradient)"
                      radius={[0, 0, 0, 0]}
                      name="Management Fees"
                    />
                    <Bar 
                      dataKey="commissions" 
                      stackId="a" 
                      fill="url(#commissionsGradient)"
                      radius={[8, 8, 0, 0]}
                      name="Commissions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            {/* Task Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-destructive/20">
                      <Clock className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">High Priority</div>
                      <div className="text-2xl font-bold text-destructive">{upcomingTasks.filter(t => t.priority === 'high').length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-warning/20">
                      <Calendar className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Due This Week</div>
                      <div className="text-2xl font-bold text-warning">4</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/20">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Tasks</div>
                      <div className="text-2xl font-bold text-primary">{upcomingTasks.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-success/20">
                      <Target className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Completion Rate</div>
                      <div className="text-2xl font-bold text-success">94%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-border/50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Task Management
                    </CardTitle>
                    <CardDescription>Upcoming client tasks and deadlines</CardDescription>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {upcomingTasks.map((task, index) => (
                    <div 
                      key={task.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-5 rounded-xl border bg-gradient-to-r from-card to-muted/30 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: 'fade-in 0.3s ease-out'
                      }}
                    >
                      <div className="flex items-center gap-4 mb-3 lg:mb-0">
                        <div className={cn(
                          "p-3 rounded-xl",
                          task.priority === "high" ? "bg-gradient-to-br from-destructive/20 to-destructive/10 text-destructive" :
                          task.priority === "medium" ? "bg-gradient-to-br from-warning/20 to-warning/10 text-warning" : 
                          "bg-gradient-to-br from-muted/20 to-muted/10 text-muted-foreground"
                        )}>
                          {task.type === "meeting" ? <Phone className="h-5 w-5" /> : 
                           task.type === "review" ? <Target className="h-5 w-5" /> :
                           <Mail className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-base">{task.task}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Users className="h-3.5 w-3.5" />
                            {task.client}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "px-3 py-1",
                            task.priority === "high" ? "bg-destructive/10 text-destructive border-destructive/30" :
                            task.priority === "medium" ? "bg-warning/10 text-warning border-warning/30" :
                            "bg-muted text-muted-foreground"
                          )}
                        >
                          {task.priority}
                        </Badge>
                        <div className="text-sm font-medium px-3 py-1 rounded-lg bg-muted/50">{task.due}</div>
                        <Button size="sm" variant="outline" className="gap-2 hover:bg-primary/10 hover:border-primary/30">
                          <Target className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {/* Performance Summary Banner */}
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-success/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-success/20">
                      <Shield className="h-8 w-8 text-success" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Overall Performance Score</div>
                      <div className="text-4xl font-bold text-success">Excellent</div>
                      <div className="text-sm text-muted-foreground mt-1">All KPIs exceeding targets</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export Report
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                      <Activity className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performanceMetrics.map((metric, index) => (
                <Card 
                  key={metric.metric}
                  className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fade-in 0.5s ease-out'
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{metric.metric}</CardTitle>
                        <CardDescription className="text-sm">
                          Target: {metric.target}{metric.unit}
                        </CardDescription>
                      </div>
                      <Badge className={cn(
                        "px-3 py-1",
                        metric.status === "excellent" ? "bg-gradient-to-r from-success to-success/80 text-success-foreground" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {metric.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="text-5xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                        {metric.value}
                      </div>
                      <div className="text-xl text-muted-foreground mb-2">{metric.unit}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(metric.unit === "%" ? metric.value : (metric.value / metric.target) * 100)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-700"
                          style={{ width: `${Math.min(metric.unit === "%" ? metric.value : (metric.value / metric.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-success font-medium">Above target</span>
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
