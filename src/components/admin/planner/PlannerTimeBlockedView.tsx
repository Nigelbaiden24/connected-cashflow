import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, CheckCircle2, AlertCircle, Play, Pause, SkipForward, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isSameDay, addHours, startOfDay, setHours, setMinutes } from "date-fns";
import type { PlannerItem } from "./PlannerItemsTable";

interface TimeBlock {
  id: string;
  startHour: number;
  endHour: number;
  task: PlannerItem | null;
  type: 'task' | 'break' | 'meeting' | 'focus' | 'buffer';
  isActive?: boolean;
  isCompleted?: boolean;
}

interface PlannerTimeBlockedViewProps {
  items: PlannerItem[];
  onItemClick: (item: PlannerItem) => void;
}

export function PlannerTimeBlockedView({ items, onItemClick }: PlannerTimeBlockedViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());

  // Generate time blocks for the day (8 AM to 6 PM)
  const timeBlocks = useMemo(() => {
    const blocks: TimeBlock[] = [];
    const todayTasks = items.filter(item => {
      if (!item.target_date) return false;
      return isSameDay(new Date(item.target_date), selectedDate);
    });

    // Create hourly blocks
    for (let hour = 8; hour < 18; hour++) {
      const taskForHour = todayTasks[Math.floor((hour - 8) / 2)] || null;
      const blockType = hour === 12 ? 'break' : hour % 3 === 0 ? 'focus' : 'task';
      
      blocks.push({
        id: `block-${hour}`,
        startHour: hour,
        endHour: hour + 1,
        task: blockType === 'task' || blockType === 'focus' ? taskForHour : null,
        type: taskForHour ? 'task' : blockType,
        isActive: activeBlockId === `block-${hour}`,
        isCompleted: completedBlocks.has(`block-${hour}`),
      });
    }

    return blocks;
  }, [items, selectedDate, activeBlockId, completedBlocks]);

  const todaysTasks = items.filter(item => {
    if (!item.target_date) return false;
    return isSameDay(new Date(item.target_date), selectedDate);
  });

  const completedCount = todaysTasks.filter(t => t.status === 'completed').length;
  const totalScheduled = todaysTasks.length;
  const completionRate = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;

  const currentHour = new Date().getHours();
  const focusedMinutes = completedBlocks.size * 60;

  const getBlockColor = (block: TimeBlock) => {
    if (block.isCompleted) return 'bg-green-500/20 border-green-500/50';
    if (block.isActive) return 'bg-primary/20 border-primary animate-pulse';
    switch (block.type) {
      case 'break': return 'bg-amber-500/10 border-amber-500/30';
      case 'focus': return 'bg-violet-500/10 border-violet-500/30';
      case 'meeting': return 'bg-blue-500/10 border-blue-500/30';
      case 'buffer': return 'bg-gray-500/10 border-gray-500/30';
      default: return 'bg-muted/50 border-border';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'medium': return <Clock className="h-3 w-3 text-amber-500" />;
      default: return null;
    }
  };

  const toggleBlockActive = (blockId: string) => {
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    } else {
      setActiveBlockId(blockId);
    }
  };

  const markBlockComplete = (blockId: string) => {
    setCompletedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Day Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-violet-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSelectedDate(prev => subDays(prev, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{format(selectedDate, 'EEEE')}</h2>
                  <p className="text-muted-foreground">{format(selectedDate, 'MMMM d, yyyy')}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSelectedDate(prev => addDays(prev, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {!isSameDay(selectedDate, new Date()) && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>
                  Today
                </Button>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{completionRate}%</div>
                <div className="text-xs text-muted-foreground">Day Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{focusedMinutes}</div>
                <div className="text-xs text-muted-foreground">Focus Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{completedCount}/{totalScheduled}</div>
                <div className="text-xs text-muted-foreground">Tasks Done</div>
              </div>
            </div>
          </div>

          {/* Day Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Daily execution progress</span>
              <span className="font-medium">{completedBlocks.size} of {timeBlocks.length} blocks completed</span>
            </div>
            <Progress value={(completedBlocks.size / timeBlocks.length) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Time Block Schedule */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Time Block Schedule
                </CardTitle>
                <CardDescription>Hour-by-hour execution plan</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Completed
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Active
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {timeBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={`relative p-4 rounded-xl border-2 transition-all ${getBlockColor(block)} ${
                      block.startHour === currentHour && isSameDay(selectedDate, new Date()) 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Time Column */}
                        <div className="w-20 text-center">
                          <div className="text-lg font-semibold">
                            {format(setHours(new Date(), block.startHour), 'h:mm')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(setHours(new Date(), block.startHour), 'a')}
                          </div>
                        </div>

                        {/* Block Type Badge */}
                        <Badge 
                          variant={block.type === 'break' ? 'secondary' : 'outline'}
                          className="capitalize"
                        >
                          {block.type}
                        </Badge>

                        {/* Task Info */}
                        {block.task ? (
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => onItemClick(block.task!)}
                          >
                            {getPriorityIcon(block.task.priority)}
                            <span className="font-medium">{block.task.item_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {block.task.item_type === 'job_application' ? 'Application' : 'Task'}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">
                            {block.type === 'break' ? '☕ Break Time' : 'Available slot'}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {block.isCompleted ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => markBlockComplete(block.id)}
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant={block.isActive ? 'default' : 'outline'}
                              onClick={() => toggleBlockActive(block.id)}
                            >
                              {block.isActive ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markBlockComplete(block.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Active Block Progress */}
                    {block.isActive && (
                      <div className="mt-3 pt-3 border-t border-primary/20">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-primary font-medium">⏱️ Timer running...</span>
                          <Button size="sm" variant="ghost" className="h-6 gap-1">
                            <SkipForward className="h-3 w-3" />
                            Skip to next
                          </Button>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sidebar - Today's Focus */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">🎯 Today's Focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaysTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-background/50 cursor-pointer hover:bg-background/80 transition-colors"
                  onClick={() => onItemClick(task)}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' : 
                    task.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  <span className={`text-sm flex-1 ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.item_name}
                  </span>
                  {task.status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              ))}
              {todaysTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks scheduled for today
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">⚡ Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Productivity Score</span>
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                  {completionRate}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Focus Time</span>
                <span className="font-semibold">{Math.floor(focusedMinutes / 60)}h {focusedMinutes % 60}m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Blocks Remaining</span>
                <span className="font-semibold">{timeBlocks.length - completedBlocks.size}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}