import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, AlertCircle, CheckCircle, FileText, ListTodo } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Task { id: string; title: string; task_type: string; priority: string; due_date: string; status: string; }

export function AdvisorTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data, error } = await supabase.from('advisor_tasks').select('*').eq('user_id', user.user.id).in('status', ['pending', 'in_progress', 'overdue']).order('due_date', { ascending: true }).limit(10);
      if (error) throw error;
      setTasks(data || []);
    } catch (error) { console.error('Error fetching tasks:', error); } finally { setLoading(false); }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-destructive border-destructive/20 bg-destructive/10';
      case 'high': return 'text-amber-600 border-amber-500/20 bg-amber-500/10';
      case 'medium': return 'text-primary border-primary/20 bg-primary/10';
      default: return 'text-muted-foreground border-border bg-muted';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) { case 'kyc': return FileText; case 'compliance': return AlertCircle; case 'meeting': return Clock; default: return CheckCircle; }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            Tasks & Compliance
          </div>
          {tasks.length > 0 && <Badge variant="outline" className="text-xs">{tasks.length} pending</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-1.5">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No pending tasks</p>
              </div>
            ) : (
              tasks.map((task) => {
                const Icon = getTaskIcon(task.task_type);
                return (
                  <div key={task.id} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-muted/10 hover:bg-muted/30 transition-colors">
                    <Icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
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
