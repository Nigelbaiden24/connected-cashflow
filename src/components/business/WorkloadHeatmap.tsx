import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

      // Group by assigned member
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

      // Convert to array
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
    if (capacity >= 90) return 'text-red-600 bg-red-50';
    if (capacity >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Workload Heatmap</CardTitle>
        <CardDescription>Member capacity and task distribution</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading workloads...</div>
        ) : workloads.length === 0 ? (
          <div className="text-sm text-muted-foreground">No team members with assigned tasks</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="text-center">Tasks</TableHead>
                <TableHead className="text-center">Overdue</TableHead>
                <TableHead className="text-center">Capacity %</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workloads.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-center">{member.tasks}</TableCell>
                  <TableCell className="text-center">
                    {member.overdue > 0 ? (
                      <Badge variant="destructive">{member.overdue}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getCapacityColor(member.capacity)}>
                      {Math.round(member.capacity)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {member.isBottleneck ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Bottleneck
                      </Badge>
                    ) : (
                      <Badge variant="outline">Normal</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
