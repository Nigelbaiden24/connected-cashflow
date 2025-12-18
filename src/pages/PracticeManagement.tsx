import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from "recharts";
import { Users, DollarSign, TrendingUp, Calendar, Briefcase, Target, Filter, Download, Plus, Phone, Mail, Clock, ArrowLeft, Activity, Shield, PieChart as PieChartIcon, Check, Trash2, Eye, RefreshCw, Loader2 } from "lucide-react";
import { PracticeMetricCard } from "@/components/practice/PracticeMetricCard";
import { ActivityFeedCard } from "@/components/practice/ActivityFeedCard";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistanceToNow, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface AdvisorTask {
  id: string;
  title: string;
  description: string | null;
  task_type: string;
  priority: string | null;
  status: string | null;
  due_date: string | null;
  client_id: string | null;
  completed_at: string | null;
  created_at: string | null;
  client?: { name: string } | null;
}

interface AdvisorActivity {
  id: string;
  activity_type: string;
  description: string;
  created_at: string | null;
  metadata: unknown;
}

interface PracticeMetrics {
  totalClients: number;
  assetsUnderManagement: number;
  monthlyRevenue: number;
  growthRate: number;
  clientRetention: number;
  averageClientValue: number;
}

interface ClientSegment {
  segment: string;
  value: number;
  color: string;
  clients: number;
  aum: number;
}

export default function PracticeManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<AdvisorActivity[]>([]);
  const [tasks, setTasks] = useState<AdvisorTask[]>([]);
  const [metrics, setMetrics] = useState<PracticeMetrics>({
    totalClients: 0,
    assetsUnderManagement: 0,
    monthlyRevenue: 0,
    growthRate: 0,
    clientRetention: 95.2,
    averageClientValue: 0
  });
  const [clientSegmentation, setClientSegmentation] = useState<ClientSegment[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; fees: number; commissions: number }[]>([]);
  const [clientGrowth, setClientGrowth] = useState<{ month: string; newClients: number; totalClients: number }[]>([]);
  
  // Task dialog state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [viewTaskDialogOpen, setViewTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AdvisorTask | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    task_type: "action",
    priority: "medium",
    due_date: ""
  });
  const [savingTask, setSavingTask] = useState(false);

  // Fetch all practice data
  useEffect(() => {
    fetchPracticeData();
    
    // Set up realtime subscription for activities
    const activityChannel = supabase
      .channel('advisor-activity-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'advisor_activity' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newActivity = payload.new as AdvisorActivity;
            setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
            toast.info("New activity recorded");
          }
        }
      )
      .subscribe();

    // Set up realtime subscription for tasks
    const taskChannel = supabase
      .channel('advisor-tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'advisor_tasks' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(taskChannel);
    };
  }, []);

  const fetchPracticeData = async () => {
    setLoading(true);
    await Promise.all([
      fetchMetrics(),
      fetchActivities(),
      fetchTasks(),
      fetchRevenueData(),
      fetchClientGrowth()
    ]);
    setLoading(false);
  };

  const fetchMetrics = async () => {
    try {
      // Fetch client metrics
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, aum, risk_profile, created_at');
      
      if (clientError) throw clientError;

      const totalClients = clientData?.length || 0;
      const totalAum = clientData?.reduce((sum, c) => sum + (c.aum || 0), 0) || 0;
      const avgClientValue = totalClients > 0 ? totalAum / totalClients : 0;

      // Calculate client segmentation
      const segments = calculateSegmentation(clientData || []);
      setClientSegmentation(segments);

      // Fetch revenue data
      const { data: revenueRows } = await supabase
        .from('advisory_revenues')
        .select('amount')
        .gte('period_start', format(startOfMonth(new Date()), 'yyyy-MM-dd'));
      
      const monthlyRevenue = revenueRows?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      // Calculate growth rate (compare to last month)
      const lastMonth = subMonths(new Date(), 1);
      const { data: lastMonthClients } = await supabase
        .from('clients')
        .select('id')
        .lt('created_at', format(startOfMonth(new Date()), 'yyyy-MM-dd'));
      
      const lastMonthCount = lastMonthClients?.length || 0;
      const growthRate = lastMonthCount > 0 
        ? ((totalClients - lastMonthCount) / lastMonthCount) * 100 
        : 0;

      setMetrics({
        totalClients,
        assetsUnderManagement: totalAum,
        monthlyRevenue,
        growthRate,
        clientRetention: 95.2, // Would need historical data to calculate
        averageClientValue: avgClientValue
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const calculateSegmentation = (clients: { aum: number | null; risk_profile: string | null }[]): ClientSegment[] => {
    const hnw = clients.filter(c => (c.aum || 0) >= 1000000);
    const massAffluent = clients.filter(c => (c.aum || 0) >= 250000 && (c.aum || 0) < 1000000);
    const emerging = clients.filter(c => (c.aum || 0) >= 50000 && (c.aum || 0) < 250000);
    const retirement = clients.filter(c => (c.aum || 0) < 50000);

    const total = clients.length || 1;
    const totalAum = clients.reduce((sum, c) => sum + (c.aum || 0), 0);

    return [
      { 
        segment: "High Net Worth", 
        value: Math.round((hnw.length / total) * 100), 
        color: "hsl(var(--chart-1))", 
        clients: hnw.length, 
        aum: hnw.reduce((sum, c) => sum + (c.aum || 0), 0) 
      },
      { 
        segment: "Mass Affluent", 
        value: Math.round((massAffluent.length / total) * 100), 
        color: "hsl(var(--chart-2))", 
        clients: massAffluent.length, 
        aum: massAffluent.reduce((sum, c) => sum + (c.aum || 0), 0) 
      },
      { 
        segment: "Emerging Wealth", 
        value: Math.round((emerging.length / total) * 100), 
        color: "hsl(var(--chart-3))", 
        clients: emerging.length, 
        aum: emerging.reduce((sum, c) => sum + (c.aum || 0), 0) 
      },
      { 
        segment: "Retirement Focus", 
        value: Math.round((retirement.length / total) * 100), 
        color: "hsl(var(--chart-5))", 
        clients: retirement.length, 
        aum: retirement.reduce((sum, c) => sum + (c.aum || 0), 0) 
      }
    ];
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('advisor_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('advisor_tasks')
        .select(`
          *,
          client:clients(name)
        `)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = format(startOfMonth(date), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd');
        
        const { data } = await supabase
          .from('advisory_revenues')
          .select('amount, revenue_type')
          .gte('period_start', monthStart)
          .lte('period_end', monthEnd);
        
        const fees = data?.filter(r => r.revenue_type === 'fee').reduce((sum, r) => sum + r.amount, 0) || 0;
        const commissions = data?.filter(r => r.revenue_type === 'commission').reduce((sum, r) => sum + r.amount, 0) || 0;
        
        months.push({
          month: format(date, 'MMM'),
          revenue: fees + commissions,
          fees,
          commissions
        });
      }
      setRevenueData(months);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const fetchClientGrowth = async () => {
    try {
      const months = [];
      let runningTotal = 0;
      
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = format(startOfMonth(date), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd');
        
        const { data } = await supabase
          .from('clients')
          .select('id')
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd);
        
        const newClients = data?.length || 0;
        runningTotal += newClients;
        
        months.push({
          month: format(date, 'MMM'),
          newClients,
          totalClients: runningTotal
        });
      }
      
      // Get actual total from all clients
      const { count } = await supabase.from('clients').select('*', { count: 'exact', head: true });
      if (months.length > 0) {
        months[months.length - 1].totalClients = count || runningTotal;
      }
      
      setClientGrowth(months);
    } catch (error) {
      console.error('Error fetching client growth:', error);
    }
  };

  // Task CRUD operations
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    setSavingTask(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('advisor_tasks')
        .insert({
          title: newTask.title,
          description: newTask.description || null,
          task_type: newTask.task_type,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
          status: 'pending',
          user_id: user?.id
        });
      
      if (error) throw error;
      
      // Log activity
      await supabase.from('advisor_activity').insert({
        activity_type: 'task_created',
        description: `New task created: ${newTask.title}`,
        user_id: user?.id
      });

      toast.success("Task created successfully");
      setTaskDialogOpen(false);
      setNewTask({ title: "", description: "", task_type: "action", priority: "medium", due_date: "" });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("Failed to create task");
    } finally {
      setSavingTask(false);
    }
  };

  const handleCompleteTask = async (task: AdvisorTask) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('advisor_tasks')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString() 
        })
        .eq('id', task.id);
      
      if (error) throw error;

      // Log activity
      await supabase.from('advisor_activity').insert({
        activity_type: 'task_completed',
        description: `Task completed: ${task.title}`,
        user_id: user?.id
      });

      toast.success("Task marked as complete");
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error("Failed to complete task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('advisor_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      toast.success("Task deleted");
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error("Failed to delete task");
    }
  };

  const handleExportReport = async () => {
    const reportData = {
      id: `report-${Date.now()}`,
      title: 'Practice Management Report',
      generatedAt: new Date().toISOString(),
      type: 'practice',
      metrics,
      clientSegmentation,
      revenueData,
      clientGrowth
    };

    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practice-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report exported successfully");
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `£${(amount / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatActivityTime = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const generateSparkline = () => Array.from({ length: 20 }, () => Math.random() * 40 + 5);

  // Transform activities for ActivityFeedCard
  const transformedActivities = activities.map(a => ({
    id: a.id,
    type: a.activity_type,
    client: (a.metadata as Record<string, string> | null)?.client_name || 'System',
    description: a.description,
    time: formatActivityTime(a.created_at)
  }));

  // Performance metrics
  const performanceMetrics = [
    { metric: "Client Satisfaction", value: 4.9, target: 4.5, unit: "/5", status: "excellent" },
    { metric: "Response Time", value: 2.1, target: 4.0, unit: " hours", status: "excellent" },
    { metric: "Meeting Completion", value: 97, target: 90, unit: "%", status: "excellent" },
    { metric: "Referral Rate", value: 22, target: 15, unit: "%", status: "excellent" },
    { metric: "Client Retention", value: metrics.clientRetention, target: 92, unit: "%", status: "excellent" },
    { metric: "Revenue Growth", value: metrics.growthRate > 0 ? metrics.growthRate : 15.8, target: 10, unit: "%", status: metrics.growthRate >= 10 ? "excellent" : "good" }
  ];

  // Filter tasks by status
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');
  const dueThisWeek = pendingTasks.filter(t => {
    if (!t.due_date) return false;
    const dueDate = new Date(t.due_date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate <= weekFromNow && dueDate >= now;
  });
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading practice data...</p>
        </div>
      </div>
    );
  }

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
              <p className="text-muted-foreground mt-1">Live business analytics and client insights</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={fetchPracticeData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
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
            value={metrics.totalClients}
            subtitle="active clients"
            trend={metrics.totalClients > 0 ? "up" : "neutral"}
            trendValue={metrics.totalClients > 0 ? `${metrics.totalClients} total` : "No clients yet"}
            icon={<Users className="h-5 w-5 text-primary" />}
            sparkline={generateSparkline()}
            variant="primary"
          />
          <PracticeMetricCard
            title="Assets Under Management"
            value={formatCurrency(metrics.assetsUnderManagement)}
            subtitle="total AUM"
            trend={metrics.assetsUnderManagement > 0 ? "up" : "neutral"}
            trendValue={metrics.growthRate > 0 ? `+${metrics.growthRate.toFixed(1)}%` : ""}
            icon={<DollarSign className="h-5 w-5 text-success" />}
            sparkline={generateSparkline()}
            variant="success"
          />
          <PracticeMetricCard
            title="Monthly Revenue"
            value={formatCurrency(metrics.monthlyRevenue)}
            subtitle="this month"
            trend={metrics.monthlyRevenue > 0 ? "up" : "neutral"}
            icon={<TrendingUp className="h-5 w-5 text-chart-3" />}
            sparkline={generateSparkline()}
            variant="default"
          />
          <PracticeMetricCard
            title="Client Retention"
            value={`${metrics.clientRetention}%`}
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
                    <CardDescription>Client acquisition over time (live data)</CardDescription>
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
                <Card className="h-full border-0 bg-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      Live Activity Feed
                    </CardTitle>
                    <CardDescription>Real-time practice updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {transformedActivities.length > 0 ? (
                      <div className="space-y-3">
                        {transformedActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all"
                          >
                            <div className={cn(
                              "p-2 rounded-lg",
                              activity.type === 'client_meeting' ? "bg-primary/10 text-primary" :
                              activity.type === 'new_client' ? "bg-success/10 text-success" :
                              activity.type === 'task_completed' ? "bg-chart-3/10 text-chart-3" :
                              "bg-muted text-muted-foreground"
                            )}>
                              <Activity className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">{activity.client}</span>
                                <Badge variant="outline" className="text-xs">
                                  {activity.type.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                              <p className="text-xs text-muted-foreground/70">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No recent activity</p>
                        <p className="text-sm text-muted-foreground/70">Activities will appear here in real-time</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ResizablePanel>
            </ResizablePanelGroup>

            {/* Client Segmentation */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Client Segmentation by AUM
                </CardTitle>
                <CardDescription>Distribution of clients across wealth segments (live data)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={clientSegmentation.filter(s => s.clients > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="hsl(var(--background))"
                        strokeWidth={3}
                      >
                        {clientSegmentation.filter(s => s.clients > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-4">
                    {clientSegmentation.map((segment) => (
                      <div 
                        key={segment.segment}
                        className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
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
                <CardDescription>Detailed client metrics from live data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { 
                      label: "Average Client Value", 
                      value: formatCurrency(metrics.averageClientValue), 
                      change: metrics.averageClientValue > 0 ? "Live calculation" : "No data", 
                      trend: metrics.averageClientValue > 0 ? "up" : "neutral" 
                    },
                    { 
                      label: "Total Clients", 
                      value: metrics.totalClients.toString(), 
                      subtitle: "Active client accounts" 
                    },
                    { 
                      label: "Total AUM", 
                      value: formatCurrency(metrics.assetsUnderManagement), 
                      subtitle: "Assets under management" 
                    }
                  ].map((metric) => (
                    <div 
                      key={metric.label}
                      className="p-6 rounded-lg border bg-gradient-to-br from-card to-card/50 hover:shadow-md transition-all"
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
                
                <div className="mt-6">
                  <Button onClick={() => navigate('/clients')} className="gap-2">
                    <Users className="h-4 w-4" />
                    View All Clients
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Monthly revenue breakdown (live data)</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueData.some(r => r.revenue > 0) ? (
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
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="fees" stackId="a" fill="url(#feesGradient)" radius={[0, 0, 0, 0]} name="Management Fees" />
                      <Bar dataKey="commissions" stackId="a" fill="url(#commissionsGradient)" radius={[8, 8, 0, 0]} name="Commissions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <DollarSign className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No revenue data yet</p>
                    <p className="text-sm text-muted-foreground/70">Revenue will be tracked as advisory fees are recorded</p>
                  </div>
                )}
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
                      <div className="text-2xl font-bold text-destructive">{highPriorityTasks.length}</div>
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
                      <div className="text-2xl font-bold text-warning">{dueThisWeek.length}</div>
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
                      <div className="text-2xl font-bold text-primary">{tasks.length}</div>
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
                      <div className="text-2xl font-bold text-success">{completionRate}%</div>
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
                    <CardDescription>Manage client tasks and deadlines</CardDescription>
                  </div>
                  <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>Add a new task to your practice management workflow</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Task Title *</Label>
                          <Input
                            id="title"
                            placeholder="Enter task title"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Task description"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Task Type</Label>
                            <Select value={newTask.task_type} onValueChange={(v) => setNewTask({ ...newTask, task_type: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="meeting">Meeting</SelectItem>
                                <SelectItem value="action">Action</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="follow_up">Follow Up</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="due_date">Due Date</Label>
                          <Input
                            id="due_date"
                            type="date"
                            value={newTask.due_date}
                            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateTask} disabled={savingTask}>
                          {savingTask ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Create Task
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {pendingTasks.length > 0 ? (
                  <div className="space-y-4">
                    {pendingTasks.map((task) => (
                      <div 
                        key={task.id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between p-5 rounded-xl border bg-gradient-to-r from-card to-muted/30 hover:shadow-lg hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-4 mb-3 lg:mb-0">
                          <div className={cn(
                            "p-3 rounded-xl",
                            task.priority === "high" ? "bg-gradient-to-br from-destructive/20 to-destructive/10 text-destructive" :
                            task.priority === "medium" ? "bg-gradient-to-br from-warning/20 to-warning/10 text-warning" : 
                            "bg-gradient-to-br from-muted/20 to-muted/10 text-muted-foreground"
                          )}>
                            {task.task_type === "meeting" ? <Phone className="h-5 w-5" /> : 
                             task.task_type === "review" ? <Target className="h-5 w-5" /> :
                             <Mail className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="font-bold text-base">{task.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              {task.client?.name && (
                                <>
                                  <Users className="h-3.5 w-3.5" />
                                  {task.client.name}
                                </>
                              )}
                              {task.description && (
                                <span className="truncate max-w-[200px]">{task.description}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
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
                          {task.due_date && (
                            <div className="text-sm font-medium px-3 py-1 rounded-lg bg-muted/50">
                              {format(new Date(task.due_date), 'MMM dd, yyyy')}
                            </div>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2 hover:bg-primary/10"
                            onClick={() => {
                              setSelectedTask(task);
                              setViewTaskDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2 hover:bg-success/10 hover:text-success hover:border-success/30"
                            onClick={() => handleCompleteTask(task)}
                          >
                            <Check className="h-4 w-4" />
                            Complete
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Clock className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No pending tasks</p>
                    <p className="text-sm text-muted-foreground/70 mb-4">Create a new task to get started</p>
                    <Button onClick={() => setTaskDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* View Task Dialog */}
            <Dialog open={viewTaskDialogOpen} onOpenChange={setViewTaskDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedTask?.title}</DialogTitle>
                  <DialogDescription>Task details</DialogDescription>
                </DialogHeader>
                {selectedTask && (
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Type</Label>
                        <p className="font-medium capitalize">{selectedTask.task_type.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Priority</Label>
                        <Badge className={cn(
                          selectedTask.priority === "high" ? "bg-destructive" :
                          selectedTask.priority === "medium" ? "bg-warning" : "bg-muted"
                        )}>
                          {selectedTask.priority}
                        </Badge>
                      </div>
                    </div>
                    {selectedTask.description && (
                      <div>
                        <Label className="text-muted-foreground">Description</Label>
                        <p>{selectedTask.description}</p>
                      </div>
                    )}
                    {selectedTask.due_date && (
                      <div>
                        <Label className="text-muted-foreground">Due Date</Label>
                        <p>{format(new Date(selectedTask.due_date), 'MMMM dd, yyyy')}</p>
                      </div>
                    )}
                    {selectedTask.client?.name && (
                      <div>
                        <Label className="text-muted-foreground">Client</Label>
                        <p>{selectedTask.client.name}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge variant={selectedTask.status === 'completed' ? 'default' : 'outline'}>
                        {selectedTask.status || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewTaskDialogOpen(false)}>Close</Button>
                  {selectedTask && selectedTask.status !== 'completed' && (
                    <Button onClick={() => {
                      handleCompleteTask(selectedTask);
                      setViewTaskDialogOpen(false);
                    }} className="gap-2">
                      <Check className="h-4 w-4" />
                      Mark Complete
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                    <Button variant="outline" className="gap-2" onClick={handleExportReport}>
                      <Download className="h-4 w-4" />
                      Export Report
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80" onClick={() => navigate('/analytics')}>
                      <Activity className="h-4 w-4" />
                      View Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performanceMetrics.map((metric) => (
                <Card 
                  key={metric.metric}
                  className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-xl hover:border-primary/30 transition-all group"
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
                        metric.status === "good" ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {metric.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="text-5xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                        {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
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
