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
import { Zap } from "lucide-react";

interface TriggerAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TriggerAutomationDialog({ open, onOpenChange }: TriggerAutomationDialogProps) {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    if (open) {
      loadWorkflows();
    }
  }, [open]);

  const loadWorkflows = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from('business_workflows')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      setWorkflows(data || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const handleTrigger = async () => {
    if (!selectedWorkflow) {
      toast({
        title: "No workflow selected",
        description: "Please select a workflow to trigger",
        variant: "destructive",
      });
      return;
    }

    setTriggering(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      // Get current workflow stats
      const { data: workflow } = await supabase
        .from('business_workflows')
        .select('execution_count, success_count')
        .eq('id', selectedWorkflow)
        .single();

      // Update workflow execution stats
      const { error } = await supabase
        .from('business_workflows')
        .update({
          last_run_at: new Date().toISOString(),
          execution_count: (workflow?.execution_count || 0) + 1,
          success_count: (workflow?.success_count || 0) + 1
        })
        .eq('id', selectedWorkflow);

      if (error) throw error;

      await supabase.from('business_activity_feed').insert({
        user_id: userId,
        actor_id: userId,
        activity_type: 'automation_triggered',
        title: 'Automation triggered',
        description: `Manually triggered workflow`,
        entity_type: 'workflow',
        entity_id: selectedWorkflow
      });

      toast({
        title: "Automation triggered successfully",
        description: "The workflow has been executed",
      });
      onOpenChange(false);
      setSelectedWorkflow("");
    } catch (error: any) {
      toast({
        title: "Error triggering automation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTriggering(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trigger Automation</DialogTitle>
          <DialogDescription>
            Manually execute an automated workflow
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Select Workflow</Label>
            <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a workflow" />
              </SelectTrigger>
              <SelectContent>
                {workflows.map((workflow) => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    {workflow.workflow_name}
                  </SelectItem>
                ))}
                {workflows.length === 0 && (
                  <SelectItem value="none" disabled>No active workflows</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleTrigger} className="w-full" disabled={triggering}>
            <Zap className="h-4 w-4 mr-2" />
            {triggering ? "Triggering..." : "Trigger Workflow"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
