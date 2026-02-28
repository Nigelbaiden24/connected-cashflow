import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, AlertCircle, CheckCircle, FileText, ListTodo } from "lucide-react";
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
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground border-border/50';
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
      <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
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
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <ListTodo className="h-4 w-4 text-primary" />
            </div>
            Tasks & Compliance To-Dos
          </div>
          {tasks.length > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{tasks.length} pending</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No pending tasks</p>
              </div>
            ) : (
              tasks.map((task) => {
                const Icon = getTaskIcon(task.task_type);
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm hover:bg-muted/40 hover:border-primary/20 cursor-pointer transition-all duration-300 group"
                  >
                    <div className="p-1.5 rounded-lg bg-muted/50 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
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
