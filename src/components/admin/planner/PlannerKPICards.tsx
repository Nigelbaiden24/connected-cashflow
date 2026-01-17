import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, ListTodo, Briefcase, TrendingUp, Sparkles } from "lucide-react";
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
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      cardBg: "bg-gradient-to-br from-blue-50 via-blue-50/50 to-background dark:from-blue-950/30 dark:via-blue-950/20 dark:to-background",
      borderColor: "border-blue-200/50 dark:border-blue-800/30",
      accentColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Open Applications",
      value: openApplications.toString(),
      icon: Briefcase,
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      cardBg: "bg-gradient-to-br from-violet-50 via-purple-50/50 to-background dark:from-violet-950/30 dark:via-purple-950/20 dark:to-background",
      borderColor: "border-violet-200/50 dark:border-violet-800/30",
      accentColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Completed This Week",
      value: completedThisWeek.toString(),
      icon: CheckCircle2,
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
      cardBg: "bg-gradient-to-br from-emerald-50 via-green-50/50 to-background dark:from-emerald-950/30 dark:via-green-950/20 dark:to-background",
      borderColor: "border-emerald-200/50 dark:border-emerald-800/30",
      accentColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Time Today",
      value: `${timeSpentToday.hours}h ${timeSpentToday.minutes}m`,
      icon: Clock,
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      cardBg: "bg-gradient-to-br from-amber-50 via-orange-50/50 to-background dark:from-amber-950/30 dark:via-orange-950/20 dark:to-background",
      borderColor: "border-amber-200/50 dark:border-amber-800/30",
      accentColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Weekly Productivity",
      value: `${productivityScore}%`,
      icon: TrendingUp,
      iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600",
      cardBg: "bg-gradient-to-br from-cyan-50 via-teal-50/50 to-background dark:from-cyan-950/30 dark:via-teal-950/20 dark:to-background",
      borderColor: "border-cyan-200/50 dark:border-cyan-800/30",
      accentColor: "text-cyan-600 dark:text-cyan-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.label}
            className={cn(
              "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
              "border",
              kpi.cardBg,
              kpi.borderColor
            )}
          >
            {/* Subtle decorative element */}
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10">
              <div className={cn("w-full h-full rounded-full", kpi.iconBg)} />
            </div>
            
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    kpi.accentColor
                  )}>
                    {kpi.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground tracking-tight">
                    {kpi.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "p-2.5 rounded-xl shadow-lg",
                    kpi.iconBg
                  )}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {/* Progress indicator for productivity */}
              {kpi.label === "Weekly Productivity" && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", kpi.iconBg)}
                      style={{ width: `${Math.min(productivityScore, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
