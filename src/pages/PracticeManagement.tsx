import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, DollarSign, TrendingUp, Calendar, Briefcase, Target, Filter, Download, Plus, Phone, Mail, Clock, ArrowLeft } from "lucide-react";

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
  { segment: "High Net Worth", value: 62, color: "#8884d8", clients: 48, aum: 88500000 },
  { segment: "Mass Affluent", value: 27, color: "#82ca9d", clients: 102, aum: 38600000 },
  { segment: "Emerging Wealth", value: 8, color: "#ffc658", clients: 95, aum: 11400000 },
  { segment: "Retirement Focus", value: 3, color: "#ff7300", clients: 44, aum: 4300000 }
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
  { id: 6, type: "client_meeting", client: "Rachel Kumar", description: "Quarterly business review meeting held", time: "2 days ago" },
  { id: 7, type: "trade_execution", client: "David Chen", description: "Portfolio rebalancing to target allocation", time: "3 days ago" }
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
  const [selectedTimeframe, setSelectedTimeframe] = useState("12months");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [activities, setActivities] = useState(recentActivities);

  // Auto-update activities every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => [
        {
          id: Date.now(),
          type: ['client_meeting', 'new_client', 'trade_execution', 'compliance', 'document_upload'][Math.floor(Math.random() * 5)],
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
    // Create comprehensive report data
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

    // Store report data in sessionStorage to pass to Reports page
    sessionStorage.setItem('exportedReport', JSON.stringify(reportData));
    
    // Navigate to reports page
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
      case "excellent": return "text-success";
      case "good": return "text-primary";
      case "fair": return "text-warning";
      case "poor": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "client_meeting": return Users;
      case "new_client": return Plus;
      case "trade_execution": return TrendingUp;
      case "compliance": return Briefcase;
      case "document_upload": return Target;
      default: return Users;
    }
  };

  return (
    <div className="p-6 space-y-6">
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
            <h1 className="text-3xl font-bold">Practice Management</h1>
            <p className="text-muted-foreground">Comprehensive business analytics and client management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practiceMetrics.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+79 this year</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets Under Management</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(practiceMetrics.assetsUnderManagement)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+{practiceMetrics.growthRate}% YTD</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(practiceMetrics.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+34.5% YoY growth</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practiceMetrics.clientRetention}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">Above industry average</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Business Overview</TabsTrigger>
          <TabsTrigger value="clients">Client Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Client Growth Trend</CardTitle>
                <CardDescription>New client acquisition over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={clientGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="totalClients" stroke="hsl(var(--primary))" strokeWidth={2} name="Total Clients" />
                    <Bar dataKey="newClients" fill="hsl(var(--muted-foreground))" opacity={0.3} name="New Clients" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest practice activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => {
                    const ActivityIcon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <ActivityIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{activity.client}</span>
                            <Badge variant="outline" className="text-xs">
                              {activity.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Segmentation */}
          <Card>
            <CardHeader>
              <CardTitle>Client Segmentation by AUM</CardTitle>
              <CardDescription>Distribution of clients across wealth segments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={clientSegmentation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {clientSegmentation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {clientSegmentation.map((segment) => (
                    <div key={segment.segment} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <div>
                          <div className="font-medium">{segment.segment}</div>
                          <div className="text-sm text-muted-foreground">{segment.clients} clients</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(segment.aum)}</div>
                        <div className="text-sm text-muted-foreground">{segment.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Analytics Dashboard</CardTitle>
              <CardDescription>Detailed client metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">Average Client Value</div>
                  <div className="text-2xl font-bold">{formatCurrency(practiceMetrics.averageClientValue)}</div>
                  <div className="text-sm text-success">+8.7% vs last year</div>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">Client Acquisition Cost</div>
                  <div className="text-2xl font-bold">£2,280</div>
                  <div className="text-sm text-muted-foreground">Average cost per new client</div>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">Lifetime Value</div>
                  <div className="text-2xl font-bold">£168K</div>
                  <div className="text-sm text-muted-foreground">Projected client lifetime value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>Monthly revenue breakdown and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="fees" stackId="a" fill="hsl(var(--primary))" name="Management Fees" />
                  <Bar dataKey="commissions" stackId="a" fill="hsl(var(--muted-foreground))" name="Commissions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>Upcoming client tasks and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        task.priority === "high" ? "bg-destructive/20 text-destructive" :
                        task.priority === "medium" ? "bg-warning/20 text-warning" : "bg-muted/20 text-muted-foreground"
                      }`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{task.task}</div>
                        <div className="text-sm text-muted-foreground">Client: {task.client}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <div className="text-sm text-muted-foreground">{task.due}</div>
                      <Button size="sm" variant="outline">
                        {task.type === "meeting" ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                      </Button>
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
              <CardDescription>Key performance indicators and targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {performanceMetrics.map((metric) => (
                  <div key={metric.metric} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{metric.metric}</h3>
                        <div className="text-sm text-muted-foreground">
                          Target: {metric.target}{metric.unit}
                        </div>
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-2xl font-bold">{metric.value}{metric.unit}</span>
                      </div>
                      <Progress 
                        value={metric.unit === "%" ? metric.value : (metric.value / metric.target) * 100} 
                        className="h-2"
                      />
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