import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
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
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Platform Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Today</span>
          <span className="text-lg font-semibold">
            {today.hours}h {today.minutes}m
          </span>
        </div>

        {/* This Week */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">This Week</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              {thisWeekHours}h {thisWeekMinutes}m
            </span>
            {weekTrend === 'up' && (
              <div className="flex items-center text-emerald-500 text-xs">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +{weekDiff}h
              </div>
            )}
            {weekTrend === 'down' && (
              <div className="flex items-center text-red-500 text-xs">
                <TrendingDown className="h-3 w-3 mr-0.5" />
                {weekDiff}h
              </div>
            )}
            {weekTrend === 'neutral' && (
              <div className="flex items-center text-muted-foreground text-xs">
                <Minus className="h-3 w-3 mr-0.5" />
                0h
              </div>
            )}
          </div>
        </div>

        {/* Trend Indicator */}
        <div className={cn(
          "text-xs p-2 rounded-md text-center",
          weekTrend === 'up' && "bg-emerald-50 text-emerald-700",
          weekTrend === 'down' && "bg-red-50 text-red-700",
          weekTrend === 'neutral' && "bg-muted text-muted-foreground"
        )}>
          {weekTrend === 'up' && `+${weekDiff} hours vs last week`}
          {weekTrend === 'down' && `${weekDiff} hours vs last week`}
          {weekTrend === 'neutral' && 'Same as last week'}
        </div>
      </CardContent>
    </Card>
  );
}
