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
import { Target, Clock, CheckCircle2 } from "lucide-react";

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

  return (
    <div className="space-y-6">
      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Daily Productivity</span>
              </div>
              <span className="text-muted-foreground">{dailyActual}/{dailyTarget}</span>
            </div>
            <Progress value={dailyProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">Weekly Task Completion</span>
              </div>
              <span className="text-muted-foreground">{weeklyTaskActual}/{weeklyTaskTarget}</span>
            </div>
            <Progress value={weeklyProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Time on Platform</span>
              </div>
              <span className="text-muted-foreground">{Math.round(timeOnPlatformActual)}h/{timeOnPlatformTarget}h</span>
            </div>
            <Progress value={timeProgress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Spent Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Spent per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeData}>
                  <defs>
                    <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    className="text-muted-foreground"
                    label={{ value: 'min', angle: -90, position: 'insideLeft', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#timeGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Completion Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Funnel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Application Outcomes Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis 
                  type="category" 
                  dataKey="status" 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
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
