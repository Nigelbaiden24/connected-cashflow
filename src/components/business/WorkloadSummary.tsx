import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, CheckSquare, AlertCircle, Users, Zap, Clock } from "lucide-react";
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
    { title: "Active Projects", value: stats.activeProjects, icon: Briefcase, color: "text-blue-600" },
    { title: "Tasks Due Today", value: stats.tasksDueToday, icon: CheckSquare, color: "text-green-600" },
    { title: "Overdue Tasks", value: stats.overdueTasks, icon: AlertCircle, color: "text-red-600" },
    { title: "Team Members", value: stats.activeMembers, icon: Users, color: "text-purple-600" },
    { title: "Automations", value: stats.activeAutomations, icon: Zap, color: "text-yellow-600" },
    { title: "Avg Task SLA", value: `${stats.avgSLA}h`, icon: Clock, color: "text-indigo-600" }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Operations Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Global Workload Summary
          </span>
          <Badge variant="secondary">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex flex-col items-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <metric.icon className={`h-8 w-8 mb-2 ${metric.color}`} />
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-xs text-muted-foreground text-center">{metric.title}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
