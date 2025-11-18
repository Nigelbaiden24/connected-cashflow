import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Task {
  id: string;
  title: string;
  task_type: string;
  priority: string;
  due_date: string;
  status: string;
}

export function AdvisorTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('advisor_tasks')
        .select('*')
        .eq('user_id', user.user.id)
        .in('status', ['pending', 'in_progress', 'overdue'])
        .order('due_date', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'kyc': return FileText;
      case 'compliance': return AlertCircle;
      case 'meeting': return Clock;
      default: return CheckCircle;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks & Compliance To-Dos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Tasks & Compliance To-Dos
          <Badge variant="secondary">{tasks.length} pending</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pending tasks</p>
              </div>
            ) : (
              tasks.map((task) => {
                const Icon = getTaskIcon(task.task_type);
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
