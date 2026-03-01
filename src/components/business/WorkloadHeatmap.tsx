import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MemberWorkload {
  id: string;
  name: string;
  tasks: number;
  overdue: number;
  capacity: number;
  isBottleneck: boolean;
}

export function WorkloadHeatmap() {
  const [workloads, setWorkloads] = useState<MemberWorkload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkloads();
  }, []);

  const fetchWorkloads = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data: tasks } = await supabase
        .from('business_tasks')
        .select('assigned_to, status, due_date')
        .eq('user_id', userId);

      if (!tasks) return;

      const memberMap = new Map<string, { tasks: number; overdue: number }>();
      
      tasks.forEach(task => {
        if (!task.assigned_to) return;
        const current = memberMap.get(task.assigned_to) || { tasks: 0, overdue: 0 };
        current.tasks++;
        if (task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed') {
          current.overdue++;
        }
        memberMap.set(task.assigned_to, current);
      });

      const workloadData: MemberWorkload[] = Array.from(memberMap.entries()).map(([id, data]) => ({
        id,
        name: `Member ${id.substring(0, 8)}`,
        tasks: data.tasks,
        overdue: data.overdue,
        capacity: Math.min(100, (data.tasks / 10) * 100),
        isBottleneck: data.tasks > 8
      }));

      setWorkloads(workloadData);
    } catch (error) {
      console.error('Error fetching workloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCapacityColor = (capacity: number) => {
    if (capacity >= 90) return 'text-destructive';
    if (capacity >= 70) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getCapacityBg = (capacity: number) => {
    if (capacity >= 90) return 'bg-destructive/10';
    if (capacity >= 70) return 'bg-amber-500/10';
    return 'bg-emerald-500/10';
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Team Workload</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading workloads...</div>
        ) : workloads.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No assigned tasks</div>
        ) : (
          <div className="space-y-2">
            {workloads.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.tasks} tasks · {member.overdue} overdue</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${getCapacityColor(member.capacity)} ${getCapacityBg(member.capacity)}`}>
                    {Math.round(member.capacity)}%
                  </Badge>
                  {member.isBottleneck && (
                    <Badge variant="destructive" className="text-xs gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Bottleneck
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
