import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Target, Clock, CheckCircle2, TrendingUp, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeDataPoint {
  date: string;
  minutes: number;
}

interface TaskCompletionPoint {
  date: string;
  completed: number;
}

interface ApplicationFunnel {
  status: string;
  count: number;
  color: string;
}

interface PlannerPerformanceChartsProps {
  timeData: TimeDataPoint[];
  taskCompletionData: TaskCompletionPoint[];
  applicationFunnel: ApplicationFunnel[];
  dailyTarget: number;
  dailyActual: number;
  weeklyTaskTarget: number;
  weeklyTaskActual: number;
  timeOnPlatformTarget: number;
  timeOnPlatformActual: number;
}

export function PlannerPerformanceCharts({
  timeData,
  taskCompletionData,
  applicationFunnel,
  dailyTarget,
  dailyActual,
  weeklyTaskTarget,
  weeklyTaskActual,
  timeOnPlatformTarget,
  timeOnPlatformActual,
}: PlannerPerformanceChartsProps) {
  const dailyProgress = Math.min((dailyActual / dailyTarget) * 100, 100);
  const weeklyProgress = Math.min((weeklyTaskActual / weeklyTaskTarget) * 100, 100);
  const timeProgress = Math.min((timeOnPlatformActual / timeOnPlatformTarget) * 100, 100);

  const progressCards = [
    {
      title: "Daily Productivity",
      icon: Target,
      actual: dailyActual,
      target: dailyTarget,
      progress: dailyProgress,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
      borderColor: "border-blue-200/50 dark:border-blue-800/30",
      progressBg: "bg-blue-500",
    },
    {
      title: "Weekly Completion",
      icon: CheckCircle2,
      actual: weeklyTaskActual,
      target: weeklyTaskTarget,
      progress: weeklyProgress,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
      borderColor: "border-emerald-200/50 dark:border-emerald-800/30",
      progressBg: "bg-emerald-500",
    },
    {
      title: "Time on Platform",
      icon: Clock,
      actual: Math.round(timeOnPlatformActual),
      target: timeOnPlatformTarget,
      progress: timeProgress,
      unit: "h",
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20",
      borderColor: "border-amber-200/50 dark:border-amber-800/30",
      progressBg: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {progressCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.title} 
              className={cn(
                "relative overflow-hidden border transition-all duration-300 hover:shadow-md",
                "bg-gradient-to-br",
                card.bgGradient,
                card.borderColor
              )}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl bg-gradient-to-br shadow-sm", card.gradient)}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-sm">{card.title}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {card.actual}{card.unit || ''}/{card.target}{card.unit || ''}
                  </span>
                </div>
                <div className="space-y-2">
                  <Progress value={card.progress} className="h-2.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{card.progress.toFixed(0)}% complete</span>
                    <span className={cn(
                      "font-medium",
                      card.progress >= 100 ? "text-emerald-600 dark:text-emerald-400" : 
                      card.progress >= 75 ? "text-blue-600 dark:text-blue-400" : 
                      card.progress >= 50 ? "text-amber-600 dark:text-amber-400" : 
                      "text-muted-foreground"
                    )}>
                      {card.progress >= 100 ? "🎉 Goal met!" : 
                       card.progress >= 75 ? "Almost there!" : 
                       card.progress >= 50 ? "Good progress" : 
                       "Keep going!"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Spent Chart */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              Time Spent per Day
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeData}>
                  <defs>
                    <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }} 
                    className="text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    className="text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'min', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fill="url(#timeGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Completion Chart */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Tasks Completed Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskCompletionData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }} 
                    className="text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    className="text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Bar 
                    dataKey="completed" 
                    fill="url(#barGradient)" 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Funnel */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            Application Outcomes Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" horizontal={false} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 11 }} 
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="status" 
                  tick={{ fontSize: 11 }} 
                  className="text-muted-foreground"
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {applicationFunnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
