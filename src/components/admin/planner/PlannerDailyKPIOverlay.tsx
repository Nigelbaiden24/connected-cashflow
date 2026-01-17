import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Target, TrendingUp, TrendingDown, Minus, Flame, Trophy, Clock, CheckCircle2, ListTodo } from "lucide-react";
import { format, addDays, subDays, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import type { PlannerItem } from "./PlannerItemsTable";

interface DayKPI {
  date: Date;
  tasksCompleted: number;
  tasksPlanned: number;
  focusMinutes: number;
  productivityScore: number;
  streak: number;
}

interface PlannerDailyKPIOverlayProps {
  items: PlannerItem[];
  timeData: { date: string; minutes: number }[];
}

export function PlannerDailyKPIOverlay({ items, timeData }: PlannerDailyKPIOverlayProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const dailyKPIs = useMemo((): DayKPI[] => {
    return weekDays.map((day, index) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayItems = items.filter(item => {
        if (!item.target_date) return false;
        return format(new Date(item.target_date), 'yyyy-MM-dd') === dayStr;
      });

      const completed = dayItems.filter(i => i.status === 'completed').length;
      const total = dayItems.length;
      const timeEntry = timeData.find(t => t.date === format(day, 'EEE'));
      const focusMinutes = timeEntry?.minutes || 0;
      const productivityScore = total > 0 ? Math.round((completed / total) * 100) : (focusMinutes > 0 ? 50 : 0);

      return {
        date: day,
        tasksCompleted: completed,
        tasksPlanned: total,
        focusMinutes,
        productivityScore,
        streak: index + 1, // Simplified streak
      };
    });
  }, [items, timeData, weekDays]);

  const selectedDayKPI = dailyKPIs.find(d => isSameDay(d.date, selectedDate)) || dailyKPIs[0];
  const weeklyAvg = Math.round(dailyKPIs.reduce((sum, d) => sum + d.productivityScore, 0) / 7);
  const totalWeeklyTasks = dailyKPIs.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const totalWeeklyFocus = dailyKPIs.reduce((sum, d) => sum + d.focusMinutes, 0);

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return { icon: TrendingUp, color: 'text-green-500', label: '+' + (current - previous) };
    if (current < previous) return { icon: TrendingDown, color: 'text-red-500', label: '-' + (previous - current) };
    return { icon: Minus, color: 'text-muted-foreground', label: '0' };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-amber-500/20 border-amber-500/30';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(prev => subDays(prev, 7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <h2 className="text-xl font-bold">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </h2>
              <p className="text-sm text-muted-foreground">Weekly KPI Overview</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(prev => addDays(prev, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Day Selector */}
          <div className="grid grid-cols-7 gap-2">
            {dailyKPIs.map((day) => (
              <Button
                key={day.date.toISOString()}
                variant={isSameDay(day.date, selectedDate) ? 'default' : 'outline'}
                className={`flex flex-col h-auto py-3 ${isSameDay(day.date, new Date()) ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                onClick={() => setSelectedDate(day.date)}
              >
                <span className="text-xs font-medium">{format(day.date, 'EEE')}</span>
                <span className="text-lg font-bold">{format(day.date, 'd')}</span>
                <div className={`mt-1 w-8 h-1 rounded-full ${
                  day.productivityScore >= 80 ? 'bg-green-500' :
                  day.productivityScore >= 60 ? 'bg-amber-500' :
                  day.productivityScore > 0 ? 'bg-orange-500' : 'bg-muted'
                }`} />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`border-2 ${getScoreBg(selectedDayKPI.productivityScore)}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-background/50">
                <Target className={`h-6 w-6 ${getScoreColor(selectedDayKPI.productivityScore)}`} />
              </div>
              <Badge variant="outline" className="text-xs">
                {format(selectedDayKPI.date, 'EEE, MMM d')}
              </Badge>
            </div>
            <div className="mt-4">
              <div className={`text-4xl font-bold ${getScoreColor(selectedDayKPI.productivityScore)}`}>
                {selectedDayKPI.productivityScore}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Productivity Score</p>
            </div>
            <Progress 
              value={selectedDayKPI.productivityScore} 
              className="mt-4 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="text-4xl font-bold">
                {selectedDayKPI.tasksCompleted}
                <span className="text-lg text-muted-foreground">/{selectedDayKPI.tasksPlanned}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Tasks Completed</p>
            </div>
            <div className="mt-4 flex gap-2">
              {Array.from({ length: Math.min(selectedDayKPI.tasksPlanned, 10) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < selectedDayKPI.tasksCompleted ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <Badge variant="secondary">Focus Time</Badge>
            </div>
            <div className="mt-4">
              <div className="text-4xl font-bold">
                {Math.floor(selectedDayKPI.focusMinutes / 60)}h {selectedDayKPI.focusMinutes % 60}m
              </div>
              <p className="text-sm text-muted-foreground mt-1">Time on Platform</p>
            </div>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground mb-1">vs 8h goal</div>
              <Progress value={(selectedDayKPI.focusMinutes / 480) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Flame className="h-6 w-6 text-amber-500" />
              </div>
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-4">
              <div className="text-4xl font-bold text-amber-600">
                {selectedDayKPI.streak} 🔥
              </div>
              <p className="text-sm text-muted-foreground mt-1">Day Streak</p>
            </div>
            <p className="mt-4 text-xs text-amber-600">
              Keep going! You're on fire!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            Weekly Summary
          </CardTitle>
          <CardDescription>Performance overview for the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-muted/50">
              <div className="text-5xl font-bold text-primary">{weeklyAvg}%</div>
              <p className="text-sm text-muted-foreground mt-2">Average Productivity</p>
              <Badge className="mt-2" variant={weeklyAvg >= 70 ? 'default' : 'secondary'}>
                {weeklyAvg >= 80 ? 'Excellent' : weeklyAvg >= 60 ? 'Good' : weeklyAvg >= 40 ? 'Fair' : 'Needs Improvement'}
              </Badge>
            </div>
            <div className="text-center p-6 rounded-xl bg-muted/50">
              <div className="text-5xl font-bold text-green-600">{totalWeeklyTasks}</div>
              <p className="text-sm text-muted-foreground mt-2">Tasks Completed</p>
              <Badge className="mt-2" variant="outline">
                {Math.round(totalWeeklyTasks / 7)} avg/day
              </Badge>
            </div>
            <div className="text-center p-6 rounded-xl bg-muted/50">
              <div className="text-5xl font-bold text-blue-600">
                {Math.floor(totalWeeklyFocus / 60)}h
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total Focus Time</p>
              <Badge className="mt-2" variant="outline">
                {Math.round(totalWeeklyFocus / 7)} min/day
              </Badge>
            </div>
          </div>

          {/* Daily Breakdown Chart */}
          <div className="mt-8">
            <h4 className="text-sm font-medium mb-4">Daily Breakdown</h4>
            <div className="flex items-end gap-2 h-32">
              {dailyKPIs.map((day) => (
                <div key={day.date.toISOString()} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={`w-full rounded-t-lg transition-all ${
                      isSameDay(day.date, selectedDate) ? 'bg-primary' : 'bg-primary/40'
                    }`}
                    style={{ height: `${Math.max(day.productivityScore, 5)}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{format(day.date, 'EEE')}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}