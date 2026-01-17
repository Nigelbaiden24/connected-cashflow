import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Target, TrendingUp, Calendar, Edit2, Trash2, MessageSquare, CheckCircle2, AlertCircle, Clock, Pause } from "lucide-react";

interface AdminTarget {
  id: string;
  title: string;
  description: string | null;
  target_type: string;
  category: string | null;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface TargetUpdate {
  id: string;
  target_id: string;
  update_text: string;
  previous_value: number | null;
  new_value: number | null;
  created_at: string;
}

export function PlannerTargetsTab() {
  const [targets, setTargets] = useState<AdminTarget[]>([]);
  const [updates, setUpdates] = useState<Record<string, TargetUpdate[]>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<AdminTarget | null>(null);
  const [editingTarget, setEditingTarget] = useState<AdminTarget | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    target_type: "quarterly",
    category: "",
    target_value: "",
    current_value: "",
    unit: "",
    status: "in_progress",
    start_date: "",
    end_date: "",
  });

  // Update form state
  const [updateForm, setUpdateForm] = useState({
    update_text: "",
    new_value: "",
  });

  const fetchTargets = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("admin_targets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTargets(data || []);

      // Fetch updates for each target
      if (data && data.length > 0) {
        const targetIds = data.map(t => t.id);
        const { data: updatesData, error: updatesError } = await supabase
          .from("admin_target_updates")
          .select("*")
          .in("target_id", targetIds)
          .order("created_at", { ascending: false });

        if (!updatesError && updatesData) {
          const groupedUpdates: Record<string, TargetUpdate[]> = {};
          updatesData.forEach(update => {
            if (!groupedUpdates[update.target_id]) {
              groupedUpdates[update.target_id] = [];
            }
            groupedUpdates[update.target_id].push(update);
          });
          setUpdates(groupedUpdates);
        }
      }
    } catch (error) {
      console.error("Error fetching targets:", error);
      toast.error("Failed to load targets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  const handleSaveTarget = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const targetData = {
        title: form.title,
        description: form.description || null,
        target_type: form.target_type,
        category: form.category || null,
        target_value: form.target_value ? parseFloat(form.target_value) : null,
        current_value: form.current_value ? parseFloat(form.current_value) : 0,
        unit: form.unit || null,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        user_id: user.id,
      };

      if (editingTarget) {
        const { error } = await supabase
          .from("admin_targets")
          .update(targetData)
          .eq("id", editingTarget.id);
        if (error) throw error;
        toast.success("Target updated successfully");
      } else {
        const { error } = await supabase
          .from("admin_targets")
          .insert(targetData);
        if (error) throw error;
        toast.success("Target created successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchTargets();
    } catch (error: any) {
      console.error("Error saving target:", error);
      toast.error(error.message || "Failed to save target");
    }
  };

  const handleAddUpdate = async () => {
    if (!selectedTarget) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const updateData = {
        target_id: selectedTarget.id,
        update_text: updateForm.update_text,
        previous_value: selectedTarget.current_value,
        new_value: updateForm.new_value ? parseFloat(updateForm.new_value) : null,
        user_id: user.id,
      };

      const { error: updateError } = await supabase
        .from("admin_target_updates")
        .insert(updateData);

      if (updateError) throw updateError;

      // Update the target's current value if provided
      if (updateForm.new_value) {
        const { error: targetError } = await supabase
          .from("admin_targets")
          .update({ current_value: parseFloat(updateForm.new_value) })
          .eq("id", selectedTarget.id);

        if (targetError) throw targetError;
      }

      toast.success("Update added successfully");
      setUpdateDialogOpen(false);
      setUpdateForm({ update_text: "", new_value: "" });
      fetchTargets();
    } catch (error: any) {
      console.error("Error adding update:", error);
      toast.error(error.message || "Failed to add update");
    }
  };

  const handleDeleteTarget = async (id: string) => {
    if (!confirm("Are you sure you want to delete this target?")) return;

    try {
      const { error } = await supabase
        .from("admin_targets")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Target deleted");
      fetchTargets();
    } catch (error: any) {
      console.error("Error deleting target:", error);
      toast.error("Failed to delete target");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      target_type: "quarterly",
      category: "",
      target_value: "",
      current_value: "",
      unit: "",
      status: "in_progress",
      start_date: "",
      end_date: "",
    });
    setEditingTarget(null);
  };

  const openEditDialog = (target: AdminTarget) => {
    setEditingTarget(target);
    setForm({
      title: target.title,
      description: target.description || "",
      target_type: target.target_type,
      category: target.category || "",
      target_value: target.target_value?.toString() || "",
      current_value: target.current_value?.toString() || "",
      unit: target.unit || "",
      status: target.status,
      start_date: target.start_date || "",
      end_date: target.end_date || "",
    });
    setDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "achieved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "missed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "on_hold":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      achieved: "default",
      in_progress: "secondary",
      missed: "destructive",
      on_hold: "outline",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getProgress = (target: AdminTarget) => {
    if (!target.target_value || target.target_value === 0) return 0;
    return Math.min(100, Math.round(((target.current_value || 0) / target.target_value) * 100));
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading targets...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Long-term Targets</h3>
          <p className="text-sm text-muted-foreground">
            Track quarterly and annual goals with progress updates
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Target
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTarget ? "Edit Target" : "Create New Target"}</DialogTitle>
              <DialogDescription>
                Define a long-term target with measurable goals
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Target Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Increase quarterly revenue by 20%"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed description of this target..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Type</Label>
                  <Select value={form.target_type} onValueChange={(v) => setForm({ ...form, target_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="project">Project-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="clients">Clients</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_value">Target Value</Label>
                  <Input
                    id="target_value"
                    type="number"
                    value={form.target_value}
                    onChange={(e) => setForm({ ...form, target_value: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_value">Current Value</Label>
                  <Input
                    id="current_value"
                    type="number"
                    value={form.current_value}
                    onChange={(e) => setForm({ ...form, current_value: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="%"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="achieved">Achieved</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTarget} disabled={!form.title}>
                {editingTarget ? "Update Target" : "Create Target"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{targets.length}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total Targets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {targets.filter(t => t.status === "in_progress").length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {targets.filter(t => t.status === "achieved").length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Achieved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">
                {targets.length > 0
                  ? Math.round(
                      targets.reduce((sum, t) => sum + getProgress(t), 0) / targets.length
                    )
                  : 0}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Avg Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Targets List */}
      {targets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No targets yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first long-term target to track progress
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Target
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {targets.map((target) => (
            <Card key={target.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(target.status)}
                    <CardTitle className="text-base">{target.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedTarget(target);
                        setUpdateDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(target)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteTarget(target.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(target.status)}
                  <Badge variant="outline" className="capitalize">
                    {target.target_type}
                  </Badge>
                  {target.category && (
                    <Badge variant="outline" className="capitalize">
                      {target.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {target.description && (
                  <p className="text-sm text-muted-foreground">{target.description}</p>
                )}

                {target.target_value && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {target.current_value || 0} / {target.target_value} {target.unit}
                      </span>
                    </div>
                    <Progress value={getProgress(target)} />
                    <p className="text-xs text-muted-foreground text-right">
                      {getProgress(target)}% complete
                    </p>
                  </div>
                )}

                {(target.start_date || target.end_date) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {target.start_date && format(new Date(target.start_date), "MMM d, yyyy")}
                    {target.start_date && target.end_date && " - "}
                    {target.end_date && format(new Date(target.end_date), "MMM d, yyyy")}
                  </div>
                )}

                {/* Recent Updates */}
                {updates[target.id] && updates[target.id].length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium mb-2">Recent Updates</p>
                    <ScrollArea className="h-24">
                      <div className="space-y-2">
                        {updates[target.id].slice(0, 3).map((update) => (
                          <div key={update.id} className="text-xs">
                            <p className="text-muted-foreground">
                              {format(new Date(update.created_at), "MMM d, HH:mm")}
                              {update.new_value !== null && (
                                <span className="ml-1 text-primary">
                                  → {update.new_value}
                                </span>
                              )}
                            </p>
                            <p>{update.update_text}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Progress Update</DialogTitle>
            <DialogDescription>
              {selectedTarget?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update_text">Update Notes *</Label>
              <Textarea
                id="update_text"
                value={updateForm.update_text}
                onChange={(e) => setUpdateForm({ ...updateForm, update_text: e.target.value })}
                placeholder="Describe your progress or achievements..."
                rows={4}
              />
            </div>
            {selectedTarget?.target_value && (
              <div className="space-y-2">
                <Label htmlFor="new_value">
                  New Value (current: {selectedTarget.current_value || 0} {selectedTarget.unit})
                </Label>
                <Input
                  id="new_value"
                  type="number"
                  value={updateForm.new_value}
                  onChange={(e) => setUpdateForm({ ...updateForm, new_value: e.target.value })}
                  placeholder="Enter new progress value"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUpdate} disabled={!updateForm.update_text}>
              Add Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
