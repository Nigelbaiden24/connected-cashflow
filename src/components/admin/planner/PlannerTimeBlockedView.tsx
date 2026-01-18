import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, CheckCircle2, AlertCircle, Play, Pause, SkipForward, ChevronLeft, ChevronRight, Plus, Edit2 } from "lucide-react";
import { format, addDays, subDays, isSameDay, setHours } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProductivityLogger } from "@/hooks/useProductivityLogger";
import { TimeBlockEditDialog } from "./TimeBlockEditDialog";
import type { PlannerItem } from "./PlannerItemsTable";

interface TimeBlockSchedule {
  id?: string;
  block_date: string;
  start_hour: number;
  end_hour: number;
  block_type: string;
  task_id: string | null;
  custom_label: string | null;
  is_completed: boolean;
  notes: string | null;
}

interface TimeBlock {
  id: string;
  startHour: number;
  endHour: number;
  task: PlannerItem | null;
  type: 'task' | 'break' | 'meeting' | 'focus' | 'buffer';
  isActive?: boolean;
  isCompleted?: boolean;
  customLabel?: string | null;
  scheduleId?: string;
  notes?: string | null;
}

interface PlannerTimeBlockedViewProps {
  items: PlannerItem[];
  onItemClick: (item: PlannerItem) => void;
}

export function PlannerTimeBlockedView({ items, onItemClick }: PlannerTimeBlockedViewProps) {
  const { logAction } = useProductivityLogger();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<TimeBlockSchedule[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlockSchedule | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("admin_time_block_schedules")
        .select("*")
        .eq("user_id", user.id)
        .eq("block_date", dateStr)
        .order("start_hour", { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Generate time blocks for the day (6 AM to 10 PM)
  const timeBlocks = useMemo(() => {
    const blocks: TimeBlock[] = [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // Create blocks from schedules
    for (let hour = 6; hour < 22; hour++) {
      const schedule = schedules.find(s => s.start_hour <= hour && s.end_hour > hour);
      
      if (schedule) {
        // Check if we already added this schedule's block
        const existingBlock = blocks.find(b => b.scheduleId === schedule.id);
        if (!existingBlock) {
          const task = schedule.task_id ? items.find(i => i.id === schedule.task_id) : null;
          blocks.push({
            id: `block-${schedule.id}`,
            startHour: schedule.start_hour,
            endHour: schedule.end_hour,
            task: task || null,
            type: schedule.block_type as TimeBlock['type'],
            isActive: activeBlockId === `block-${schedule.id}`,
            isCompleted: schedule.is_completed,
            customLabel: schedule.custom_label,
            scheduleId: schedule.id,
            notes: schedule.notes,
          });
        }
      } else {
        // Check if this hour is already covered by a multi-hour block
        const covered = blocks.some(b => b.startHour <= hour && b.endHour > hour);
        if (!covered) {
          blocks.push({
            id: `empty-${hour}`,
            startHour: hour,
            endHour: hour + 1,
            task: null,
            type: 'buffer',
            isActive: false,
            isCompleted: false,
          });
        }
      }
    }

    return blocks.sort((a, b) => a.startHour - b.startHour);
  }, [items, selectedDate, activeBlockId, schedules]);

  const todaysTasks = items.filter(item => {
    if (!item.target_date) return false;
    return isSameDay(new Date(item.target_date), selectedDate);
  });

  const completedCount = schedules.filter(s => s.is_completed).length;
  const totalScheduled = schedules.length;
  const completionRate = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;

  const currentHour = new Date().getHours();
  const focusedMinutes = completedCount * 60;

  const getBlockColor = (block: TimeBlock) => {
    if (block.isCompleted) return 'bg-green-500/20 border-green-500/50';
    if (block.isActive) return 'bg-primary/20 border-primary animate-pulse';
    if (!block.scheduleId) return 'bg-muted/30 border-dashed border-muted-foreground/30';
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

  const toggleBlockActive = async (block: TimeBlock) => {
    if (activeBlockId === block.id) {
      setActiveBlockId(null);
      await logAction({
        actionType: "focus_paused",
        description: `Paused focus on: ${block.customLabel || block.type}`,
        entityType: "time_block",
        entityId: block.scheduleId,
      });
    } else {
      setActiveBlockId(block.id);
      await logAction({
        actionType: "focus_started",
        description: `Started focus on: ${block.customLabel || block.type}`,
        entityType: "time_block",
        entityId: block.scheduleId,
      });
    }
  };

  const markBlockComplete = async (block: TimeBlock) => {
    if (!block.scheduleId) return;

    try {
      const newCompleted = !block.isCompleted;
      const { error } = await supabase
        .from("admin_time_block_schedules")
        .update({ is_completed: newCompleted })
        .eq("id", block.scheduleId);

      if (error) throw error;

      await logAction({
        actionType: "time_block_completed",
        description: `${newCompleted ? "Completed" : "Uncompleted"} time block: ${block.customLabel || block.type}`,
        entityType: "time_block",
        entityId: block.scheduleId,
      });

      fetchSchedules();
      if (activeBlockId === block.id) {
        setActiveBlockId(null);
      }
    } catch (error) {
      console.error("Error updating block:", error);
      toast.error("Failed to update block");
    }
  };

  const handleAddBlock = (hour?: number) => {
    setSelectedBlock({
      block_date: format(selectedDate, "yyyy-MM-dd"),
      start_hour: hour ?? 9,
      end_hour: (hour ?? 9) + 1,
      block_type: "task",
      task_id: null,
      custom_label: null,
      is_completed: false,
      notes: null,
    });
    setEditDialogOpen(true);
  };

  const handleEditBlock = (block: TimeBlock) => {
    if (block.scheduleId) {
      const schedule = schedules.find(s => s.id === block.scheduleId);
      if (schedule) {
        setSelectedBlock(schedule);
        setEditDialogOpen(true);
      }
    } else {
      handleAddBlock(block.startHour);
    }
  };

  return (
    <div className="space-y-6">
      {/* Day Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-violet-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
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
              <Button onClick={() => handleAddBlock()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Block
              </Button>
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
                <div className="text-xs text-muted-foreground">Blocks Done</div>
              </div>
            </div>
          </div>

          {/* Day Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Daily execution progress</span>
              <span className="font-medium">{completedCount} of {totalScheduled} blocks completed</span>
            </div>
            <Progress value={completionRate} className="h-3" />
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
                <CardDescription>Click on any block to edit or add new blocks</CardDescription>
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
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${getBlockColor(block)} ${
                      block.startHour === currentHour && isSameDay(selectedDate, new Date()) 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : ''
                    }`}
                    onClick={() => handleEditBlock(block)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Time Column */}
                        <div className="w-24 text-center">
                          <div className="text-lg font-semibold">
                            {format(setHours(new Date(), block.startHour), 'h:mm')} - {format(setHours(new Date(), block.endHour), 'h:mm')}
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
                        {block.customLabel ? (
                          <span className="font-medium">{block.customLabel}</span>
                        ) : block.task ? (
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onItemClick(block.task!);
                            }}
                          >
                            {getPriorityIcon(block.task.priority)}
                            <span className="font-medium">{block.task.item_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {block.task.item_type === 'job_application' ? 'Application' : 'Task'}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic flex items-center gap-2">
                            {block.scheduleId ? (
                              block.type === 'break' ? '☕ Break Time' : 'Scheduled block'
                            ) : (
                              <>
                                <Plus className="h-4 w-4" />
                                Click to add block
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {block.scheduleId && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditBlock(block);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {block.isCompleted ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markBlockComplete(block);
                                }}
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant={block.isActive ? 'default' : 'outline'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBlockActive(block);
                                  }}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markBlockComplete(block);
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
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

                    {/* Notes */}
                    {block.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">{block.notes}</p>
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
                <span className="font-semibold">{totalScheduled - completedCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <TimeBlockEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        block={selectedBlock}
        tasks={items}
        onSave={fetchSchedules}
      />
    </div>
  );
}
