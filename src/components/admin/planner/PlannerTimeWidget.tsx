import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown, Minus, Timer, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlannerTimeWidgetProps {
  today: { hours: number; minutes: number };
  thisWeek: number; // seconds
  lastWeek: number; // seconds
}

export function PlannerTimeWidget({ today, thisWeek, lastWeek }: PlannerTimeWidgetProps) {
  const thisWeekHours = Math.floor(thisWeek / 3600);
  const thisWeekMinutes = Math.floor((thisWeek % 3600) / 60);
  
  const lastWeekHours = Math.floor(lastWeek / 3600);
  
  const weekDiff = thisWeekHours - lastWeekHours;
  const weekTrend = weekDiff > 0 ? 'up' : weekDiff < 0 ? 'down' : 'neutral';
  
  // Calculate daily goal progress (assuming 8 hour goal)
  const dailyGoalHours = 8;
  const todayTotalMinutes = today.hours * 60 + today.minutes;
  const dailyProgress = Math.min((todayTotalMinutes / (dailyGoalHours * 60)) * 100, 100);
  
  return (
    <Card className="h-full border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <Timer className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold">Platform Time</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Today - Featured */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Today
            </span>
            <span className="text-2xl font-bold text-foreground">
              {today.hours}h {today.minutes}m
            </span>
          </div>
          {/* Daily progress bar */}
          <div className="space-y-1.5">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {dailyProgress.toFixed(0)}% of daily goal
            </p>
          </div>
        </div>

        {/* This Week */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
          <span className="text-sm text-muted-foreground font-medium">This Week</span>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-foreground">
              {thisWeekHours}h {thisWeekMinutes}m
            </span>
            {weekTrend === 'up' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                <TrendingUp className="h-3 w-3" />
                +{weekDiff}h
              </div>
            )}
            {weekTrend === 'down' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                <TrendingDown className="h-3 w-3" />
                {weekDiff}h
              </div>
            )}
            {weekTrend === 'neutral' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                <Minus className="h-3 w-3" />
                0h
              </div>
            )}
          </div>
        </div>

        {/* Trend Summary */}
        <div className={cn(
          "text-sm p-3 rounded-lg text-center font-medium border",
          weekTrend === 'up' && "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30",
          weekTrend === 'down' && "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30",
          weekTrend === 'neutral' && "bg-muted/50 text-muted-foreground border-border/50"
        )}>
          {weekTrend === 'up' && (
            <span className="flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Great progress! +{weekDiff} hours vs last week
            </span>
          )}
          {weekTrend === 'down' && (
            <span className="flex items-center justify-center gap-2">
              <TrendingDown className="h-4 w-4" />
              {weekDiff} hours vs last week
            </span>
          )}
          {weekTrend === 'neutral' && (
            <span className="flex items-center justify-center gap-2">
              <Minus className="h-4 w-4" />
              Consistent with last week
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
