import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

export function TimeTrackingSnapshot() {
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    byProject: [] as { name: string; hours: number }[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeStats();
  }, []);

  const fetchTimeStats = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data: timeEntries } = await supabase
        .from('business_time_tracking')
        .select('*, business_projects(project_name)')
        .eq('user_id', userId);

      if (!timeEntries) return;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      const todayMinutes = timeEntries
        .filter(e => new Date(e.created_at) >= todayStart)
        .reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

      const weekMinutes = timeEntries
        .filter(e => new Date(e.created_at) >= weekStart)
        .reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

      // Group by project
      const projectMap = new Map<string, number>();
      timeEntries.forEach(entry => {
        const projectName = entry.business_projects?.project_name || 'Unassigned';
        const current = projectMap.get(projectName) || 0;
        projectMap.set(projectName, current + (entry.duration_minutes || 0));
      });

      const byProject = Array.from(projectMap.entries())
        .map(([name, minutes]) => ({ name, hours: Math.round(minutes / 60 * 10) / 10 }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5);

      setStats({
        today: Math.round(todayMinutes / 60 * 10) / 10,
        thisWeek: Math.round(weekMinutes / 60 * 10) / 10,
        byProject
      });
    } catch (error) {
      console.error('Error fetching time stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracking
        </CardTitle>
        <CardDescription>Time logged across projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-xs text-muted-foreground mb-1">Today</div>
            <div className="text-2xl font-bold text-blue-600">{stats.today}h</div>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="text-xs text-muted-foreground mb-1">This Week</div>
            <div className="text-2xl font-bold text-green-600">{stats.thisWeek}h</div>
          </div>
        </div>

        {/* By Project */}
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading time data...</div>
        ) : stats.byProject.length === 0 ? (
          <div className="text-sm text-muted-foreground">No time logged yet</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Time by Project
            </div>
            {stats.byProject.map((project, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium truncate">{project.name}</span>
                  <span className="text-muted-foreground">{project.hours}h</span>
                </div>
                <Progress value={Math.min(100, (project.hours / 40) * 100)} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
