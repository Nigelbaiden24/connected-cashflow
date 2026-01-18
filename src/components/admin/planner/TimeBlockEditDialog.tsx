import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProductivityLogger } from "@/hooks/useProductivityLogger";
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

interface TimeBlockEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: TimeBlockSchedule | null;
  tasks: PlannerItem[];
  onSave: () => void;
}

const blockTypes = [
  { value: "task", label: "Task" },
  { value: "focus", label: "Focus Time" },
  { value: "meeting", label: "Meeting" },
  { value: "break", label: "Break" },
  { value: "buffer", label: "Buffer" },
];

export function TimeBlockEditDialog({ 
  open, 
  onOpenChange, 
  block, 
  tasks,
  onSave 
}: TimeBlockEditDialogProps) {
  const { logAction } = useProductivityLogger();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TimeBlockSchedule>({
    block_date: new Date().toISOString().split("T")[0],
    start_hour: 9,
    end_hour: 10,
    block_type: "task",
    task_id: null,
    custom_label: null,
    is_completed: false,
    notes: null,
  });

  useEffect(() => {
    if (block) {
      setFormData(block);
    } else {
      setFormData({
        block_date: new Date().toISOString().split("T")[0],
        start_hour: 9,
        end_hour: 10,
        block_type: "task",
        task_id: null,
        custom_label: null,
        is_completed: false,
        notes: null,
      });
    }
  }, [block, open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (formData.start_hour >= formData.end_hour) {
        toast.error("End time must be after start time");
        setLoading(false);
        return;
      }

      const payload = {
        user_id: user.id,
        block_date: formData.block_date,
        start_hour: formData.start_hour,
        end_hour: formData.end_hour,
        block_type: formData.block_type,
        task_id: formData.task_id || null,
        custom_label: formData.custom_label || null,
        is_completed: formData.is_completed,
        notes: formData.notes || null,
      };

      if (block?.id) {
        const { error } = await supabase
          .from("admin_time_block_schedules")
          .update(payload)
          .eq("id", block.id);
        
        if (error) throw error;
        
        await logAction({
          actionType: "time_block_updated",
          description: `Updated time block: ${formData.custom_label || formData.block_type} (${formData.start_hour}:00 - ${formData.end_hour}:00)`,
          entityType: "time_block",
          entityId: block.id,
        });
        
        toast.success("Time block updated");
      } else {
        const { data, error } = await supabase
          .from("admin_time_block_schedules")
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        
        await logAction({
          actionType: "time_block_created",
          description: `Created time block: ${formData.custom_label || formData.block_type} (${formData.start_hour}:00 - ${formData.end_hour}:00)`,
          entityType: "time_block",
          entityId: data.id,
        });
        
        toast.success("Time block created");
      }

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving time block:", error);
      toast.error("Failed to save time block");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!block?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("admin_time_block_schedules")
        .delete()
        .eq("id", block.id);

      if (error) throw error;

      await logAction({
        actionType: "time_block_deleted",
        description: `Deleted time block: ${block.custom_label || block.block_type}`,
        entityType: "time_block",
        entityId: block.id,
      });

      toast.success("Time block deleted");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting time block:", error);
      toast.error("Failed to delete time block");
    } finally {
      setLoading(false);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{block?.id ? "Edit Time Block" : "Add Time Block"}</DialogTitle>
          <DialogDescription>
            Configure your time block schedule
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_hour">Start Time</Label>
              <Select
                value={formData.start_hour.toString()}
                onValueChange={(v) => setFormData({ ...formData, start_hour: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_hour">End Time</Label>
              <Select
                value={formData.end_hour.toString()}
                onValueChange={(v) => setFormData({ ...formData, end_hour: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="block_type">Block Type</Label>
            <Select
              value={formData.block_type}
              onValueChange={(v) => setFormData({ ...formData, block_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {blockTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(formData.block_type === "task" || formData.block_type === "focus") && (
            <div className="space-y-2">
              <Label htmlFor="task">Assign Task (Optional)</Label>
              <Select
                value={formData.task_id || "none"}
                onValueChange={(v) => setFormData({ ...formData, task_id: v === "none" ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No task assigned</SelectItem>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.item_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="custom_label">Custom Label (Optional)</Label>
            <Input
              id="custom_label"
              value={formData.custom_label || ""}
              onChange={(e) => setFormData({ ...formData, custom_label: e.target.value })}
              placeholder="e.g., Deep work on project"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {block?.id && (
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
