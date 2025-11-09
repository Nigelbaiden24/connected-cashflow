import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Pause,
  Play,
  Settings,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateAutomationDialog } from "@/components/automation/CreateAutomationDialog";

interface AutomationRule {
  id: string;
  rule_name: string;
  module: string;
  enabled: boolean;
  executions_today: number;
  success_rate: number;
  last_executed?: Date;
  status: 'active' | 'paused' | 'error';
}

interface AutomationExecution {
  id: string;
  rule_name: string;
  status: 'success' | 'failed' | 'running';
  executed_at: Date;
  execution_time: number;
  error_message?: string;
}

const AutomationCenter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<AutomationExecution[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalFailed: 0,
    uptime: 0,
    paused: 0
  });

  useEffect(() => {
    fetchAutomationData();
    
    // Set up real-time subscription for execution updates
    const channel = supabase
      .channel('automation-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'automation_executions'
      }, () => {
        fetchAutomationData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAutomationData = async () => {
    try {
      // Fetch automation rules
      const { data: rules, error: rulesError } = await supabase
        .from('automation_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (rulesError) throw rulesError;

      // Fetch recent executions
      const { data: executions, error: executionsError } = await supabase
        .from('automation_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (executionsError) throw executionsError;

      // Transform data to match component interface
      const transformedAutomations: AutomationRule[] = (rules || []).map(rule => ({
        id: rule.id,
        rule_name: rule.rule_name,
        module: rule.module,
        enabled: rule.enabled,
        executions_today: 0, // Will be calculated from executions
        success_rate: 100, // Will be calculated from executions
        last_executed: new Date(),
        status: rule.enabled ? 'active' : 'paused'
      }));

      const transformedExecutions: AutomationExecution[] = (executions || []).map(exec => ({
        id: exec.id,
        rule_name: rules?.find(r => r.id === exec.rule_id)?.rule_name || 'Unknown',
        status: exec.status as 'success' | 'failed' | 'running',
        executed_at: new Date(exec.created_at),
        execution_time: exec.execution_time_ms || 0,
        error_message: exec.error_message
      }));

      // Calculate executions today for each rule
      const today = new Date().setHours(0, 0, 0, 0);
      transformedAutomations.forEach(auto => {
        const ruleExecutions = executions?.filter(e => 
          e.rule_id === auto.id && 
          new Date(e.created_at).getTime() >= today
        ) || [];
        
        auto.executions_today = ruleExecutions.length;
        
        const successfulExecutions = ruleExecutions.filter(e => e.status === 'success').length;
        auto.success_rate = ruleExecutions.length > 0 
          ? Math.round((successfulExecutions / ruleExecutions.length) * 100) 
          : 100;

        const lastExec = ruleExecutions[0];
        if (lastExec) {
          auto.last_executed = new Date(lastExec.created_at);
        }

        // Determine status
        if (!auto.enabled) {
          auto.status = 'paused';
        } else if (auto.success_rate < 90) {
          auto.status = 'error';
        } else {
          auto.status = 'active';
        }
      });

      setAutomations(transformedAutomations);
      setRecentExecutions(transformedExecutions);
      
      setStats({
        totalActive: transformedAutomations.filter(a => a.enabled && a.status === 'active').length,
        totalFailed: transformedAutomations.filter(a => a.status === 'error').length,
        uptime: 98.7,
        paused: transformedAutomations.filter(a => !a.enabled).length
      });
    } catch (error) {
      console.error('Error fetching automation data:', error);
      toast({
        title: "Error",
        description: "Failed to load automation data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutomation = async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    const newEnabled = !automation.enabled;
    
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ enabled: newEnabled })
        .eq('id', id);

      if (error) throw error;

      setAutomations(automations.map(a => 
        a.id === id ? { ...a, enabled: newEnabled, status: newEnabled ? 'active' : 'paused' as const } : a
      ));

      toast({
        title: newEnabled ? "Automation Enabled" : "Automation Paused",
        description: `${automation.rule_name} has been ${newEnabled ? 'enabled' : 'paused'}`
      });
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast({
        title: "Error",
        description: "Failed to toggle automation",
        variant: "destructive"
      });
    }
  };

  const handleSeedAutomations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('seed-automations');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: `Seeded ${data.rules_created} automation rules`
      });

      fetchAutomationData();
    } catch (error) {
      console.error('Error seeding automations:', error);
      toast({
        title: "Error",
        description: "Failed to seed automations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success text-success-foreground">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'active':
        return <Badge className="bg-primary text-primary-foreground">Active</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'paused':
        return <Badge variant="outline">Paused</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getModuleColor = (module: string) => {
    const colors: Record<string, string> = {
      'CRM': 'text-blue-600',
      'Projects': 'text-purple-600',
      'Dashboard': 'text-green-600',
      'Revenue': 'text-orange-600',
      'Payroll': 'text-pink-600',
      'Security': 'text-red-600',
      'Tasks': 'text-indigo-600',
      'Analytics': 'text-cyan-600'
    };
    return colors[module] || 'text-muted-foreground';
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const moduleAutomations = automations.reduce((acc, auto) => {
    acc[auto.module] = (acc[auto.module] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moduleStats = Object.entries(moduleAutomations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading automation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Automation Center</h1>
            </div>
            <p className="text-muted-foreground">Monitor and manage all platform automations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeedAutomations} disabled={loading} className="gap-2">
            <Zap className="h-4 w-4" />
            {loading ? "Seeding..." : "Seed Automations"}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Settings className="h-4 w-4" />
            Create Automation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.totalActive}</div>
            <p className="text-xs text-muted-foreground">Running smoothly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Today</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.totalFailed}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.uptime}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Pause className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paused}</div>
            <p className="text-xs text-muted-foreground">Temporarily disabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="executions">Recent Executions</TabsTrigger>
          <TabsTrigger value="modules">By Module</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Automations</CardTitle>
              <CardDescription>Manage your automated workflows and rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automations.map((automation) => (
                  <div
                    key={automation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{automation.rule_name}</h3>
                        {getStatusBadge(automation.status)}
                        <Badge variant="outline" className={getModuleColor(automation.module)}>
                          {automation.module}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {automation.executions_today} executions today
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {automation.success_rate}% success rate
                        </span>
                        {automation.last_executed && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last: {formatTimeAgo(automation.last_executed)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={automation.enabled}
                        onCheckedChange={() => handleToggleAutomation(automation.id)}
                      />
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Executions Tab */}
        <TabsContent value="executions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Latest automation runs and their results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentExecutions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {execution.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : execution.status === 'failed' ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Clock className="h-4 w-4 text-primary animate-spin" />
                        )}
                        <span className="font-medium">{execution.rule_name}</span>
                        {getStatusBadge(execution.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatTimeAgo(execution.executed_at)}</span>
                        <span>Execution time: {execution.execution_time}ms</span>
                      </div>
                      {execution.error_message && (
                        <div className="flex items-start gap-2 text-sm text-destructive">
                          <AlertTriangle className="h-4 w-4 mt-0.5" />
                          <span>{execution.error_message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Module Tab */}
        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automations by Module</CardTitle>
              <CardDescription>Distribution of automations across platform modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moduleStats.map(([module, count]) => {
                  const moduleAutomationsList = automations.filter(a => a.module === module);
                  const activeCount = moduleAutomationsList.filter(a => a.enabled).length;
                  const percentage = (activeCount / count) * 100;
                  
                  return (
                    <div key={module} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getModuleColor(module)}`}>{module}:</span>
                          <Badge variant="secondary">{count} total</Badge>
                          <Badge className="bg-success text-success-foreground">{activeCount} active</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{percentage.toFixed(0)}% enabled</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Module Performance</CardTitle>
              <CardDescription>Success rates by module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {moduleStats.map(([module]) => {
                  const moduleAutomationsList = automations.filter(a => a.module === module);
                  const avgSuccessRate = moduleAutomationsList.reduce((sum, a) => sum + a.success_rate, 0) / moduleAutomationsList.length;
                  const totalExecutions = moduleAutomationsList.reduce((sum, a) => sum + a.executions_today, 0);
                  
                  return (
                    <div key={module} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`font-medium ${getModuleColor(module)}`}>{module}</div>
                        <Badge variant="outline">{totalExecutions} executions today</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={avgSuccessRate} className="w-24 h-2" />
                        <span className="text-sm font-medium">{avgSuccessRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Logs</CardTitle>
              <CardDescription>Detailed execution history and debugging information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Detailed logging coming soon</p>
                <p className="text-sm">View comprehensive execution logs and debugging information</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateAutomationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchAutomationData}
      />
    </div>
  );
};

export default AutomationCenter;
