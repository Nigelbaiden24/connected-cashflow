import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, CheckCircle2, Clock, AlertCircle, Target } from "lucide-react";

interface Task {
  id: number;
  title: string;
  project: string;
  priority: string;
  dueDate: string;
  status: string;
  completed: boolean;
}

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityPending = tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const overdueTasks = tasks.filter(t => {
    if (t.completed) return false;
    try {
      const dueDate = new Date(t.dueDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return dueDate < now;
    } catch {
      return false;
    }
  }).length;

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      subtitle: "All tasks",
      icon: Target,
      gradient: "from-blue-500/20 to-blue-600/20",
      trend: null
    },
    {
      title: "Pending",
      value: pendingTasks,
      subtitle: "Need attention",
      icon: Clock,
      gradient: "from-orange-500/20 to-orange-600/20",
      trend: null
    },
    {
      title: "Completed",
      value: completedTasks,
      subtitle: `${completionRate}% completion`,
      icon: CheckCircle2,
      gradient: "from-green-500/20 to-green-600/20",
      trend: completionRate >= 50 ? "up" : "down"
    },
    {
      title: "High Priority",
      value: highPriorityPending,
      subtitle: "Urgent tasks",
      icon: AlertCircle,
      gradient: "from-red-500/20 to-red-600/20",
      trend: null
    }
  ];

  if (overdueTasks > 0) {
    stats.push({
      title: "Overdue",
      value: overdueTasks,
      subtitle: "Past deadline",
      icon: AlertCircle,
      gradient: "from-destructive/20 to-destructive/30",
      trend: null
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
                {stat.trend && (
                  <Badge variant={stat.trend === "up" ? "default" : "destructive"} className="gap-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {completionRate}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
