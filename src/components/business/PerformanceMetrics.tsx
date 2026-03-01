import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Clock, Zap } from "lucide-react";
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
    { title: "Task Completion", value: `${metrics.taskCompletionRate}%`, progress: metrics.taskCompletionRate, icon: Target },
    { title: "Workflow Success", value: `${metrics.workflowSuccessRate}%`, progress: metrics.workflowSuccessRate, icon: TrendingUp },
    { title: "SLA Adherence", value: `${metrics.slaAdherence}%`, progress: metrics.slaAdherence, icon: Clock },
    { title: "Time Saved", value: `${metrics.automationTimeSaved}h`, progress: Math.min(100, metrics.automationTimeSaved * 10), icon: Zap },
    { title: "Efficiency", value: `${metrics.teamEfficiency}%`, progress: metrics.teamEfficiency, icon: TrendingUp },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Performance Metrics & KPIs</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading metrics...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <kpi.icon className="h-4 w-4 text-primary" />
                  <span className="text-xl font-bold text-foreground">{kpi.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{kpi.title}</p>
                <Progress value={kpi.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
