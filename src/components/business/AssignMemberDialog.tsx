import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AssignMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignMemberDialog({ open, onOpenChange }: AssignMemberDialogProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const [tasksRes, membersRes] = await Promise.all([
        supabase.from('business_tasks').select('*').eq('user_id', userId).is('assigned_to', null),
        supabase.from('team_members').select('*')
      ]);

      setTasks(tasksRes.data || []);
      setTeamMembers(membersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedTask || !selectedMember) {
      toast({
        title: "Missing information",
        description: "Please select both a task and team member",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('business_tasks')
        .update({ assigned_to: selectedMember })
        .eq('id', selectedTask);

      if (error) throw error;

      const userId = (await supabase.auth.getUser()).data.user?.id;
      await supabase.from('business_activity_feed').insert({
        user_id: userId,
        actor_id: userId,
        activity_type: 'task_assigned',
        title: 'Task assigned',
        description: `Task assigned to team member`,
        entity_type: 'task',
        entity_id: selectedTask
      });

      toast({ title: "Task assigned successfully" });
      onOpenChange(false);
      setSelectedTask("");
      setSelectedMember("");
    } catch (error: any) {
      toast({
        title: "Error assigning task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Task to Team Member</DialogTitle>
          <DialogDescription>
            Select a task and assign it to a team member
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Select Task</Label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a task" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.task_name} ({task.priority || 'no priority'})
                  </SelectItem>
                ))}
                {tasks.length === 0 && (
                  <SelectItem value="none" disabled>No unassigned tasks</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Assign To</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </SelectItem>
                ))}
                {teamMembers.length === 0 && (
                  <SelectItem value="none" disabled>No team members found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAssign} className="w-full" disabled={loading}>
            {loading ? "Assigning..." : "Assign Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
