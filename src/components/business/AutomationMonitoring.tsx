import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AutomationMonitoring() {
  const [stats, setStats] = useState({
    triggered24h: 0,
    successRate: 0,
    failedCount: 0,
    timeSavedHours: 0,
    mostActive: 'N/A'
  });
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomationStats();
  }, []);

  const fetchAutomationStats = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data: workflowsData } = await supabase
        .from('business_workflows')
        .select('*')
        .eq('user_id', userId);

      if (!workflowsData) return;

      const totalExecutions = workflowsData.reduce((sum, w) => sum + w.execution_count, 0);
      const totalSuccess = workflowsData.reduce((sum, w) => sum + w.success_count, 0);
      const totalFailed = workflowsData.reduce((sum, w) => sum + w.failure_count, 0);
      const totalTimeSaved = workflowsData.reduce((sum, w) => sum + (w.time_saved_minutes || 0), 0);
      
      const mostActive = workflowsData.reduce((max, w) => 
        w.execution_count > (max?.execution_count || 0) ? w : max, workflowsData[0]
      );

      setStats({
        triggered24h: totalExecutions,
        successRate: totalExecutions > 0 ? Math.round((totalSuccess / totalExecutions) * 100) : 0,
        failedCount: totalFailed,
        timeSavedHours: Math.round(totalTimeSaved / 60),
        mostActive: mostActive?.workflow_name || 'N/A'
      });

      setWorkflows(workflowsData);
    } catch (error) {
      console.error('Error fetching automation stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const summaryMetrics = [
    { label: "Triggered", value: stats.triggered24h, icon: Zap },
    { label: "Success Rate", value: `${stats.successRate}%`, icon: TrendingUp, hasProgress: true, progress: stats.successRate },
    { label: "Failed", value: stats.failedCount, icon: AlertCircle },
    { label: "Time Saved", value: `${stats.timeSavedHours}h`, icon: Clock },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Zap className="h-4 w-4 text-primary" />
          Automation Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryMetrics.map((m, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-border bg-muted/20">
              <div className="flex items-center gap-2 mb-1">
                <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
              <div className="text-xl font-bold text-foreground">{m.value}</div>
              {m.hasProgress && <Progress value={m.progress} className="mt-2 h-1" />}
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg border border-border bg-muted/20">
          <div className="text-xs text-muted-foreground mb-1">Most Active Workflow</div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{stats.mostActive}</span>
            <Badge variant="outline" className="text-xs">Top Performer</Badge>
          </div>
        </div>

        {!loading && workflows.length > 0 && (
          <div className="space-y-1.5">
            {workflows.slice(0, 5).map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/10 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{workflow.workflow_name}</div>
                  <div className="text-xs text-muted-foreground">{workflow.execution_count} runs · {workflow.success_count} success</div>
                </div>
                <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {workflow.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
