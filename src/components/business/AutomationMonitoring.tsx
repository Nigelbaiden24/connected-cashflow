import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          Automation Monitoring
        </CardTitle>
        <CardDescription>Workflow performance and insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-background border">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-muted-foreground">Triggered (24h)</span>
            </div>
            <div className="text-2xl font-bold">{stats.triggered24h}</div>
          </div>
          
          <div className="p-4 rounded-lg bg-background border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
            <Progress value={stats.successRate} className="mt-2 h-1" />
          </div>
          
          <div className="p-4 rounded-lg bg-background border">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-muted-foreground">Failed</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.failedCount}</div>
          </div>
          
          <div className="p-4 rounded-lg bg-background border">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Time Saved</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.timeSavedHours}h</div>
          </div>
        </div>

        {/* Most Active Workflow */}
        <div className="p-4 rounded-lg border bg-muted/20">
          <div className="text-sm font-medium mb-1">Most Active Workflow</div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{stats.mostActive}</span>
            <Badge variant="secondary">Top Performer</Badge>
          </div>
        </div>

        {/* Workflow List */}
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No active workflows</div>
        ) : (
          <div className="space-y-2">
            {workflows.slice(0, 5).map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div className="flex-1">
                  <div className="font-medium text-sm">{workflow.workflow_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {workflow.execution_count} runs · {workflow.success_count} success
                  </div>
                </div>
                <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
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
