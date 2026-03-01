import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, CheckSquare, AlertCircle, Users, Zap, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function WorkloadSummary() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    tasksDueToday: 0,
    overdueTasks: 0,
    activeMembers: 0,
    activeAutomations: 0,
    avgSLA: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const [projectsRes, tasksRes, workflowsRes] = await Promise.all([
        supabase.from('business_projects').select('*').eq('user_id', userId).in('status', ['active', 'on-track', 'at-risk', 'behind']),
        supabase.from('business_tasks').select('*').eq('user_id', userId),
        supabase.from('business_workflows').select('*').eq('user_id', userId).eq('status', 'active')
      ]);

      const tasks = tasksRes.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tasksDueToday = tasks.filter(t => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        return dueDate >= today && dueDate < tomorrow && t.status !== 'completed';
      }).length;

      const overdueTasks = tasks.filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        return new Date(t.due_date) < today;
      }).length;

      const assignedMembers = new Set(tasks.filter(t => t.assigned_to).map(t => t.assigned_to)).size;

      setStats({
        activeProjects: projectsRes.data?.length || 0,
        tasksDueToday,
        overdueTasks,
        activeMembers: assignedMembers,
        activeAutomations: workflowsRes.data?.length || 0,
        avgSLA: 0
      });
    } catch (error) {
      console.error('Error fetching workload stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { title: "Active Projects", value: stats.activeProjects, icon: Briefcase, change: "+2", trend: "up" },
    { title: "Due Today", value: stats.tasksDueToday, icon: CheckSquare, change: "0", trend: "stable" },
    { title: "Overdue", value: stats.overdueTasks, icon: AlertCircle, change: "-1", trend: "down" },
    { title: "Team Members", value: stats.activeMembers, icon: Users, change: "+1", trend: "up" },
    { title: "Automations", value: stats.activeAutomations, icon: Zap, change: "+3", trend: "up" },
    { title: "Avg SLA", value: `${stats.avgSLA}h`, icon: Clock, change: "0", trend: "stable" }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1,2,3,4,5,6].map(i => (
          <Card key={i} className="border-border">
            <CardContent className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-20 mb-3" />
              <div className="h-7 bg-muted rounded w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((metric, idx) => (
        <Card key={idx} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <metric.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              {metric.trend !== "stable" && (
                <div className={`flex items-center text-xs ${metric.trend === "up" ? "text-emerald-600" : "text-destructive"}`}>
                  {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="ml-0.5">{metric.change}</span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{metric.title}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
