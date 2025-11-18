import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Clock, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    taskCompletionRate: 0,
    workflowSuccessRate: 0,
    slaAdherence: 0,
    automationTimeSaved: 0,
    teamEfficiency: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const [tasksRes, workflowsRes] = await Promise.all([
        supabase.from('business_tasks').select('*').eq('user_id', userId),
        supabase.from('business_workflows').select('*').eq('user_id', userId)
      ]);

      const tasks = tasksRes.data || [];
      const workflows = workflowsRes.data || [];

      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

      const totalExecutions = workflows.reduce((sum, w) => sum + w.execution_count, 0);
      const totalSuccess = workflows.reduce((sum, w) => sum + w.success_count, 0);
      const workflowSuccessRate = totalExecutions > 0 ? Math.round((totalSuccess / totalExecutions) * 100) : 0;

      const totalTimeSaved = workflows.reduce((sum, w) => sum + (w.time_saved_minutes || 0), 0);

      setMetrics({
        taskCompletionRate,
        workflowSuccessRate,
        slaAdherence: 85,
        automationTimeSaved: Math.round(totalTimeSaved / 60),
        teamEfficiency: Math.round((taskCompletionRate + workflowSuccessRate) / 2)
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    {
      title: "Task Completion Rate",
      value: `${metrics.taskCompletionRate}%`,
      progress: metrics.taskCompletionRate,
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "Workflow Success Rate",
      value: `${metrics.workflowSuccessRate}%`,
      progress: metrics.workflowSuccessRate,
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "SLA Adherence",
      value: `${metrics.slaAdherence}%`,
      progress: metrics.slaAdherence,
      icon: Clock,
      color: "text-purple-600"
    },
    {
      title: "Automation Time Saved",
      value: `${metrics.automationTimeSaved}h`,
      progress: Math.min(100, metrics.automationTimeSaved * 10),
      icon: Zap,
      color: "text-yellow-600"
    },
    {
      title: "Team Efficiency Score",
      value: `${metrics.teamEfficiency}%`,
      progress: metrics.teamEfficiency,
      icon: TrendingUp,
      color: "text-indigo-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics & KPIs</CardTitle>
        <CardDescription>Key performance indicators for your workspace</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading metrics...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  <span className="text-2xl font-bold">{kpi.value}</span>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">{kpi.title}</div>
                  <Progress value={kpi.progress} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
