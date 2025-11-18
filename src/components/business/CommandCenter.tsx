import { Button } from "@/components/ui/button";
import { Plus, Users, Upload, Zap, FileText, GitBranch } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CommandCenter() {
  const { toast } = useToast();
  const [taskDialog, setTaskDialog] = useState(false);
  const [projectDialog, setProjectDialog] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [priority, setPriority] = useState("medium");

  const createTask = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { error } = await supabase.from('business_tasks').insert({
        task_name: taskName,
        description: taskDesc,
        priority,
        user_id: userId,
        created_by: userId
      });

      if (error) throw error;

      await supabase.from('business_activity_feed').insert({
        user_id: userId,
        actor_id: userId,
        activity_type: 'task_created',
        title: 'New task created',
        description: `Created task: ${taskName}`
      });

      toast({ title: "Task created successfully" });
      setTaskDialog(false);
      setTaskName("");
      setTaskDesc("");
    } catch (error: any) {
      toast({ title: "Error creating task", description: error.message, variant: "destructive" });
    }
  };

  const createProject = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { error } = await supabase.from('business_projects').insert({
        project_name: projectName,
        description: projectDesc,
        user_id: userId,
        created_by: userId
      });

      if (error) throw error;

      await supabase.from('business_activity_feed').insert({
        user_id: userId,
        actor_id: userId,
        activity_type: 'project_created',
        title: 'New project created',
        description: `Created project: ${projectName}`
      });

      toast({ title: "Project created successfully" });
      setProjectDialog(false);
      setProjectName("");
      setProjectDesc("");
    } catch (error: any) {
      toast({ title: "Error creating project", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
      <Dialog open={taskDialog} onOpenChange={setTaskDialog}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to your workflow</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Name</Label>
              <Input value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Enter task name" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Task description" />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createTask} className="w-full">Create Task</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={projectDialog} onOpenChange={setProjectDialog}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Create Project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Start a new project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Name</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter project name" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="Project description" />
            </div>
            <Button onClick={createProject} className="w-full">Create Project</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button 
        size="sm" 
        variant="outline" 
        className="gap-2"
        onClick={() => toast({ title: "Team assignment", description: "Opening team member selector..." })}
      >
        <Users className="h-4 w-4" />
        Assign Member
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="gap-2"
        onClick={() => toast({ title: "Document upload", description: "Opening document uploader..." })}
      >
        <Upload className="h-4 w-4" />
        Upload Document
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="gap-2"
        onClick={() => toast({ title: "Automation", description: "Triggering automation workflow..." })}
      >
        <Zap className="h-4 w-4" />
        Trigger Automation
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="gap-2"
        onClick={() => toast({ title: "Workflow", description: "Adding new workflow..." })}
      >
        <FileText className="h-4 w-4" />
        Add Workflow
      </Button>
    </div>
  );
}
