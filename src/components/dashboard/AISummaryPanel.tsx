import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, RefreshCw, TrendingUp, Calendar, FileText, AlertCircle, Sparkles, Target, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Insight {
  icon: any;
  text: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  trend?: 'up' | 'down' | 'stable';
  action?: () => void;
}

export function AISummaryPanel() {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [aiGenerated, setAiGenerated] = useState(false);

  useEffect(() => {
    generateSummary();
  }, []);

  const generateSummary = async () => {
    setLoading(true);
    setAiGenerated(false);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error("Please log in to view your dashboard");
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      
      const [meetingsResult, tasksResult, alertsResult, clientsResult, revenueResult, goalsResult, activityResult] = await Promise.all([
        supabase.from('advisor_tasks').select('*').eq('user_id', user.user.id).eq('task_type', 'meeting').gte('due_date', today).limit(20),
        supabase.from('advisor_tasks').select('*').eq('user_id', user.user.id).in('status', ['pending', 'overdue']).limit(20),
        supabase.from('advisor_alerts').select('*').eq('user_id', user.user.id).eq('is_read', false).limit(20),
        supabase.from('client_risk_assessments').select('*, clients!inner(user_id)').eq('clients.user_id', user.user.id),
        supabase.from('advisory_revenues').select('amount').eq('user_id', user.user.id).gte('period_start', startOfWeek.toISOString()),
        supabase.from('advisor_goals').select('*').eq('user_id', user.user.id).eq('status', 'active'),
        supabase.from('advisor_activity').select('*').eq('user_id', user.user.id).gte('created_at', startOfWeek.toISOString())
      ]);

      const todayMeetings = meetingsResult.data?.length || 0;
      const pendingTasks = tasksResult.data?.length || 0;
      const overdueTasks = tasksResult.data?.filter(t => t.status === 'overdue').length || 0;
      const pendingDocs = tasksResult.data?.filter(t => t.task_type === 'document_review').length || 0;
      const criticalAlerts = alertsResult.data?.filter(a => a.severity === 'critical').length || 0;
      const highRiskClients = clientsResult.data?.filter(c => c.risk_level === 'high').length || 0;
      const weeklyRevenue = revenueResult.data?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      const activeGoals = goalsResult.data?.length || 0;
      const goalProgress = goalsResult.data?.filter(g => g.current_value && g.target_value && (g.current_value / g.target_value) >= 0.8).length || 0;
      const weeklyActivities = activityResult.data?.length || 0;

      const newInsights: Insight[] = [];
      
      if (criticalAlerts > 0) newInsights.push({ icon: AlertCircle, text: `${criticalAlerts} critical alert${criticalAlerts > 1 ? 's' : ''} requiring attention`, type: 'critical', trend: 'up' });
      if (overdueTasks > 0) newInsights.push({ icon: FileText, text: `${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}`, type: 'critical', trend: 'up' });
      if (highRiskClients > 0) newInsights.push({ icon: Users, text: `${highRiskClients} high-risk portfolio${highRiskClients > 1 ? 's' : ''} need review`, type: 'warning', trend: highRiskClients > 3 ? 'up' : 'stable' });
      if (todayMeetings > 0) newInsights.push({ icon: Calendar, text: `${todayMeetings} meeting${todayMeetings > 1 ? 's' : ''} scheduled today`, type: 'info', trend: 'stable' });
      if (pendingDocs > 0) newInsights.push({ icon: FileText, text: `${pendingDocs} document${pendingDocs > 1 ? 's' : ''} awaiting review`, type: 'warning', trend: 'stable' });
      if (goalProgress > 0 && activeGoals > 0) newInsights.push({ icon: Target, text: `${goalProgress}/${activeGoals} goals on track (80%+)`, type: 'success', trend: 'up' });
      if (weeklyRevenue > 0) newInsights.push({ icon: TrendingUp, text: `£${(weeklyRevenue / 1000).toFixed(1)}K revenue this week`, type: 'success', trend: 'up' });

      if (newInsights.length === 0) {
        newInsights.push({ icon: Sparkles, text: 'All systems healthy', type: 'success', trend: 'stable' });
      }

      const summaryParts = [];
      if (todayMeetings > 0) summaryParts.push(`${todayMeetings} meeting${todayMeetings > 1 ? 's' : ''}`);
      if (pendingTasks > 0) summaryParts.push(`${pendingTasks} pending task${pendingTasks > 1 ? 's' : ''}`);
      if (criticalAlerts > 0) summaryParts.push(`${criticalAlerts} critical alert${criticalAlerts > 1 ? 's' : ''}`);
      if (highRiskClients > 0) summaryParts.push(`${highRiskClients} high-risk client${highRiskClients > 1 ? 's' : ''}`);

      const summaryText = summaryParts.length > 0
        ? `Today: ${summaryParts.join(', ')}. ${weeklyActivities > 10 ? 'Strong activity this week.' : ''} ${goalProgress > 0 ? `${goalProgress} goal${goalProgress > 1 ? 's' : ''} on track.` : ''}`
        : "Dashboard clear. Excellent work maintaining client relationships and portfolio health.";

      setSummary(summaryText);
      setInsights(newInsights);
      setAiGenerated(true);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary("Unable to generate AI insights. Please refresh.");
      toast.error("Failed to load AI insights");
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyles = (type: Insight['type']) => {
    switch (type) {
      case 'critical': return 'border-l-destructive text-destructive';
      case 'warning': return 'border-l-amber-500 text-amber-600 dark:text-amber-400';
      case 'success': return 'border-l-emerald-500 text-emerald-600 dark:text-emerald-400';
      case 'info': return 'border-l-primary text-primary';
    }
  };

  if (loading) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 animate-pulse text-primary" />
            AI Daily Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">AI Daily Snapshot</CardTitle>
            {aiGenerated && (
              <Badge variant="outline" className="text-xs gap-1 border-emerald-500/30 text-emerald-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Live
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={generateSummary} disabled={loading} className="text-xs gap-1">
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground/80 p-3 bg-muted/30 rounded-lg border border-border">{summary}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg border border-border border-l-4 bg-muted/20 ${getTypeStyles(insight.type)}`}>
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-xs font-medium leading-tight">{insight.text}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>Updated: {new Date().toLocaleTimeString()}</span>
          <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" />AI Analytics</span>
        </div>
      </CardContent>
    </Card>
  );
}
