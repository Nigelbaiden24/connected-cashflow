import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";

interface AddWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWorkflowDialog({ open, onOpenChange }: AddWorkflowDialogProps) {
  const { toast } = useToast();
  const [workflowName, setWorkflowName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("manual");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!workflowName) {
      toast({
        title: "Missing information",
        description: "Please enter a workflow name",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("User not authenticated");

      const { error } = await supabase.from('business_workflows').insert({
        user_id: userId,
        workflow_name: workflowName,
        description,
        trigger_type: triggerType,
        status: 'active',
        execution_count: 0,
        success_count: 0,
        failure_count: 0,
        time_saved_minutes: 0
      });

      if (error) throw error;

      await supabase.from('business_activity_feed').insert({
        user_id: userId,
        actor_id: userId,
        activity_type: 'workflow_created',
        title: 'Workflow created',
        description: `Created workflow: ${workflowName}`
      });

      toast({ title: "Workflow created successfully" });
      onOpenChange(false);
      setWorkflowName("");
      setDescription("");
      setTriggerType("manual");
    } catch (error: any) {
      toast({
        title: "Error creating workflow",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Set up an automated workflow for your business processes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Workflow Name</Label>
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workflow does"
            />
          </div>
          <div>
            <Label>Trigger Type</Label>
            <Select value={triggerType} onValueChange={setTriggerType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="event">Event-based</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} className="w-full" disabled={creating}>
            <FileText className="h-4 w-4 mr-2" />
            {creating ? "Creating..." : "Create Workflow"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
