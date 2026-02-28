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
      
      const [
        meetingsResult,
        tasksResult,
        alertsResult,
        clientsResult,
        revenueResult,
        goalsResult,
        activityResult
      ] = await Promise.all([
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
      const highAlerts = alertsResult.data?.filter(a => a.severity === 'high').length || 0;
      const highRiskClients = clientsResult.data?.filter(c => c.risk_level === 'high').length || 0;
      const mediumRiskClients = clientsResult.data?.filter(c => c.risk_level === 'medium').length || 0;
      const weeklyRevenue = revenueResult.data?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      const activeGoals = goalsResult.data?.length || 0;
      const goalProgress = goalsResult.data?.filter(g => g.current_value && g.target_value && (g.current_value / g.target_value) >= 0.8).length || 0;
      const weeklyActivities = activityResult.data?.length || 0;

      const newInsights: Insight[] = [];
      
      if (criticalAlerts > 0) {
        newInsights.push({ 
          icon: AlertCircle, 
          text: `${criticalAlerts} critical alert${criticalAlerts > 1 ? 's' : ''} requiring immediate attention`, 
          type: 'critical',
          trend: 'up'
        });
      }
      
      if (overdueTasks > 0) {
        newInsights.push({ 
          icon: FileText, 
          text: `${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}`, 
          type: 'critical',
          trend: 'up'
        });
      }

      if (highRiskClients > 0) {
        newInsights.push({ 
          icon: Users, 
          text: `${highRiskClients} high-risk portfolio${highRiskClients > 1 ? 's' : ''} need review`, 
          type: 'warning',
          trend: highRiskClients > 3 ? 'up' : 'stable'
        });
      }

      if (todayMeetings > 0) {
        newInsights.push({ 
          icon: Calendar, 
          text: `${todayMeetings} meeting${todayMeetings > 1 ? 's' : ''} scheduled today`, 
          type: 'info',
          trend: 'stable'
        });
      }

      if (pendingDocs > 0) {
        newInsights.push({ 
          icon: FileText, 
          text: `${pendingDocs} document${pendingDocs > 1 ? 's' : ''} awaiting review`, 
          type: 'warning',
          trend: 'stable'
        });
      }

      if (goalProgress > 0 && activeGoals > 0) {
        newInsights.push({ 
          icon: Target, 
          text: `${goalProgress}/${activeGoals} goals on track (80%+ complete)`, 
          type: 'success',
          trend: 'up'
        });
      }

      if (weeklyRevenue > 0) {
        newInsights.push({ 
          icon: TrendingUp, 
          text: `£${(weeklyRevenue / 1000).toFixed(1)}K revenue this week`, 
          type: 'success',
          trend: 'up'
        });
      }

      if (newInsights.length === 0 || (criticalAlerts === 0 && overdueTasks === 0 && highAlerts === 0)) {
        newInsights.push({ 
          icon: Sparkles, 
          text: 'All systems healthy - excellent performance', 
          type: 'success',
          trend: 'stable'
        });
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
      setSummary("Unable to generate AI insights. Please refresh to try again.");
      toast.error("Failed to load AI insights");
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyles = (type: Insight['type']) => {
    switch (type) {
      case 'critical': 
        return 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive backdrop-blur-sm';
      case 'warning': 
        return 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 backdrop-blur-sm';
      case 'success': 
        return 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 backdrop-blur-sm';
      case 'info':
        return 'border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary backdrop-blur-sm';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (!trend) return null;
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 ml-1" />;
      case 'down': return <TrendingUp className="h-3 w-3 ml-1 rotate-180" />;
      case 'stable': return <div className="h-1 w-3 bg-current rounded ml-1" />;
    }
  };

  if (loading) {
    return (
      <Card className="col-span-full border-primary/20 bg-gradient-to-br from-primary/5 via-card to-violet-500/5 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Brain className="h-5 w-5 animate-pulse text-primary" />
              </div>
              AI Daily Snapshot
            </CardTitle>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-violet-500/5 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500">
      {/* Animated gradient border top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      {/* Floating ambient orbs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-500 rounded-xl blur opacity-40 animate-pulse" />
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/30 backdrop-blur-sm">
                <Brain className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Daily Snapshot
                {aiGenerated && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                    <span className="relative flex h-1.5 w-1.5 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Live
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time intelligence powered by AI
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSummary}
            disabled={loading}
            className="backdrop-blur-sm bg-card/50 border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        <div className="text-base font-medium leading-relaxed text-foreground/90 p-4 bg-background/30 backdrop-blur-sm rounded-xl border border-border/30">
          {summary}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <div
                key={i}
                className={`flex items-center justify-between gap-2 p-3 rounded-xl border transition-all duration-300 cursor-default hover:-translate-y-0.5 hover:shadow-md ${getTypeStyles(insight.type)}`}
                onClick={insight.action}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium leading-tight">{insight.text}</span>
                </div>
                {getTrendIcon(insight.trend)}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t border-border/30">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            Powered by AI Analytics
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
