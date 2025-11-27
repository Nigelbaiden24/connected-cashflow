import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Edit, Trash2, Calendar, Flag } from "lucide-react";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

interface Task {
  id: number;
  title: string;
  project: string;
  priority: string;
  dueDate: string;
  status: string;
  completed: boolean;
  description?: string;
  tags?: string[];
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getDueDateInfo = (dueDate: string) => {
    try {
      const date = parseISO(dueDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (isPast(date) && date < now && !task.completed) {
        return { text: "Overdue", variant: "destructive" as const };
      }
      if (isToday(date)) {
        return { text: "Today", variant: "default" as const };
      }
      if (isTomorrow(date)) {
        return { text: "Tomorrow", variant: "secondary" as const };
      }
      return { text: format(date, "MMM dd"), variant: "outline" as const };
    } catch {
      return { text: "Invalid date", variant: "outline" as const };
    }
  };

  const dueDateInfo = getDueDateInfo(task.dueDate);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox 
            checked={task.completed} 
            onCheckedChange={() => onToggle(task.id)}
            className="mt-1"
          />
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className={`font-semibold text-base mb-1 transition-all ${
                  task.completed ? 'line-through text-muted-foreground' : ''
                }`}>
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(task)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getPriorityVariant(task.priority)} className="gap-1">
                <Flag className="h-3 w-3" />
                {task.priority}
              </Badge>
              
              <Badge variant={dueDateInfo.variant} className="gap-1">
                <Calendar className="h-3 w-3" />
                {dueDateInfo.text}
              </Badge>

              <Badge variant="outline" className="gap-1 bg-primary/5">
                {task.project}
              </Badge>

              {task.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
