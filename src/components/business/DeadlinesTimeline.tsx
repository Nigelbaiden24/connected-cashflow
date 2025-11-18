import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        id: t.id,
        title: t.task_name,
        dueDate: new Date(t.due_date),
        type: 'task' as const,
        priority: t.priority
      }));

      const projectDeadlines: DeadlineItem[] = (projectsRes.data || []).map(p => ({
        id: p.id,
        title: p.project_name,
        dueDate: new Date(p.due_date),
        type: 'project' as const,
        priority: p.priority
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

    if (days < 0) return { label: 'Overdue', color: 'text-red-600 bg-red-50' };
    if (days === 0) return { label: 'Today', color: 'text-orange-600 bg-orange-50' };
    if (days <= 7) return { label: 'This Week', color: 'text-yellow-600 bg-yellow-50' };
    if (days <= 30) return { label: 'This Month', color: 'text-blue-600 bg-blue-50' };
    return { label: 'Later', color: 'text-gray-600 bg-gray-50' };
  };

  const groupedDeadlines = deadlines.reduce((acc, deadline) => {
    const group = getTimeGroup(deadline.dueDate);
    if (!acc[group.label]) {
      acc[group.label] = { items: [], color: group.color };
    }
    acc[group.label].items.push(deadline);
    return acc;
  }, {} as Record<string, { items: DeadlineItem[]; color: string }>);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Deadlines Timeline
        </CardTitle>
        <CardDescription>Tasks and projects due soon</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading deadlines...</div>
        ) : deadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedDeadlines).map(([label, { items, color }]) => (
              <div key={label}>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${color}`}>
                  {label}
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-background">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Due: {item.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getPriorityColor(item.priority) as any} className="shrink-0">
                        {item.priority}
                      </Badge>
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
