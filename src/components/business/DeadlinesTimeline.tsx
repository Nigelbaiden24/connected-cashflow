import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DeadlineItem {
  id: string;
  title: string;
  dueDate: Date;
  type: 'task' | 'project';
  priority: string;
}

export function DeadlinesTimeline() {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const [tasksRes, projectsRes] = await Promise.all([
        supabase.from('business_tasks').select('*').eq('user_id', userId).not('due_date', 'is', null).neq('status', 'completed'),
        supabase.from('business_projects').select('*').eq('user_id', userId).not('due_date', 'is', null).neq('status', 'completed')
      ]);

      const taskDeadlines: DeadlineItem[] = (tasksRes.data || []).map(t => ({
        id: t.id, title: t.task_name, dueDate: new Date(t.due_date), type: 'task' as const, priority: t.priority
      }));

      const projectDeadlines: DeadlineItem[] = (projectsRes.data || []).map(p => ({
        id: p.id, title: p.project_name, dueDate: new Date(p.due_date), type: 'project' as const, priority: p.priority
      }));

      const allDeadlines = [...taskDeadlines, ...projectDeadlines]
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .slice(0, 15);

      setDeadlines(allDeadlines);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeGroup = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { label: 'Overdue', color: 'text-destructive bg-destructive/10 border-destructive/20' };
    if (days === 0) return { label: 'Today', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' };
    if (days <= 7) return { label: 'This Week', color: 'text-primary bg-primary/10 border-primary/20' };
    if (days <= 30) return { label: 'This Month', color: 'text-muted-foreground bg-muted border-border' };
    return { label: 'Later', color: 'text-muted-foreground bg-muted border-border' };
  };

  const groupedDeadlines = deadlines.reduce((acc, deadline) => {
    const group = getTimeGroup(deadline.dueDate);
    if (!acc[group.label]) {
      acc[group.label] = { items: [], color: group.color };
    }
    acc[group.label].items.push(deadline);
    return acc;
  }, {} as Record<string, { items: DeadlineItem[]; color: string }>);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Calendar className="h-4 w-4 text-primary" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : deadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
            <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedDeadlines).map(([label, { items, color }]) => (
              <div key={label}>
                <Badge variant="outline" className={`text-xs mb-2 ${color}`}>{label}</Badge>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/10">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Due: {item.dueDate.toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        <Badge variant="outline" className="text-xs">{item.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
