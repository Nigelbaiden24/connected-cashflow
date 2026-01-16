import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, ListTodo, Briefcase, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlannerKPICardsProps {
  totalActiveTasks: number;
  openApplications: number;
  completedThisWeek: number;
  timeSpentToday: { hours: number; minutes: number };
  productivityScore: number;
}

export function PlannerKPICards({
  totalActiveTasks,
  openApplications,
  completedThisWeek,
  timeSpentToday,
  productivityScore,
}: PlannerKPICardsProps) {
  const kpis = [
    {
      label: "Active Tasks",
      value: totalActiveTasks.toString(),
      icon: ListTodo,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50",
    },
    {
      label: "Open Applications",
      value: openApplications.toString(),
      icon: Briefcase,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100/50",
    },
    {
      label: "Completed This Week",
      value: completedThisWeek.toString(),
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100/50",
    },
    {
      label: "Time Today",
      value: `${timeSpentToday.hours}h ${timeSpentToday.minutes}m`,
      icon: Clock,
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-50 to-amber-100/50",
    },
    {
      label: "Weekly Productivity",
      value: `${productivityScore}%`,
      icon: TrendingUp,
      gradient: "from-cyan-500 to-cyan-600",
      bgGradient: "from-cyan-50 to-cyan-100/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.label}
            className={cn(
              "relative overflow-hidden border-0 shadow-md",
              "bg-gradient-to-br",
              kpi.bgGradient
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {kpi.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "p-2 rounded-lg bg-gradient-to-br shadow-sm",
                    kpi.gradient
                  )}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
