import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PlannerItem } from "./PlannerItemsTable";

const NONE_CRM_VALUE = "__none__";

interface CRMContact {
  id: string;
  name: string;
  company: string;
}

interface PlannerItemEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PlannerItem | null;
  onSave: () => void;
  onDelete: (id: string) => void;
}

export function PlannerItemEditor({
  open,
  onOpenChange,
  item,
  onSave,
  onDelete,
}: PlannerItemEditorProps) {
  const [loading, setLoading] = useState(false);
  const [crmContacts, setCrmContacts] = useState<CRMContact[]>([]);
  const [formData, setFormData] = useState({
    item_name: "",
    item_type: "task" as "task" | "job_application",
    crm_contact_id: NONE_CRM_VALUE,
    status: "todo" as PlannerItem["status"],
    priority: "medium" as PlannerItem["priority"],
    target_date: null as Date | null,
    description: "",
    outcome_notes: "",
  });

  useEffect(() => {
    fetchCRMContacts();
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        item_name: item.item_name,
        item_type: item.item_type,
        crm_contact_id: item.crm_contact_id || NONE_CRM_VALUE,
        status: item.status,
        priority: item.priority,
        target_date: item.target_date ? new Date(item.target_date) : null,
        description: item.description || "",
        outcome_notes: item.outcome_notes || "",
      });
    } else {
      setFormData({
        item_name: "",
        item_type: "task",
        crm_contact_id: NONE_CRM_VALUE,
        status: "todo",
        priority: "medium",
        target_date: null,
        description: "",
        outcome_notes: "",
      });
    }
  }, [item]);

  const fetchCRMContacts = async () => {
    const { data } = await supabase
      .from("crm_contacts")
      .select("id, name, company")
      .order("company");

    if (data) {
      setCrmContacts(data);
    }
  };

  const handleSubmit = async () => {
    if (!formData.item_name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        item_name: formData.item_name,
        item_type: formData.item_type,
        crm_contact_id: formData.crm_contact_id === NONE_CRM_VALUE ? null : formData.crm_contact_id,
        status: formData.status,
        priority: formData.priority,
        target_date: formData.target_date?.toISOString().split("T")[0] || null,
        description: formData.description || null,
        outcome_notes: formData.outcome_notes || null,
        user_id: user.id,
      };

      if (item) {
        const { error } = await supabase
          .from("admin_planner_items")
          .update(payload)
          .eq("id", item.id);
        
        if (error) throw error;
        toast.success("Item updated");
      } else {
        const { error } = await supabase
          .from("admin_planner_items")
          .insert(payload);
        
        if (error) throw error;
        toast.success("Item created");
      }

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving item:", error);
      toast.error(error.message || "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    
    if (!confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);
    try {
      await onDelete(item.id);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{item ? "Edit Item" : "New Item"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="item_name">Name *</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              placeholder="Task or application name..."
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={formData.item_type}
              onValueChange={(v) => setFormData({ ...formData, item_type: v as "task" | "job_application" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="job_application">Job Application</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CRM Link */}
          <div className="space-y-2">
            <Label>Link to CRM Contact</Label>
            <Select
              value={formData.crm_contact_id}
              onValueChange={(v) => setFormData({ ...formData, crm_contact_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a contact..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_CRM_VALUE}>None</SelectItem>
                {crmContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.company || contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v as PlannerItem["status"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To-Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(v) => setFormData({ ...formData, priority: v as PlannerItem["priority"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label>Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.target_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.target_date ? format(formData.target_date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.target_date || undefined}
                  onSelect={(date) => setFormData({ ...formData, target_date: date || null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details..."
              rows={3}
            />
          </div>

          {/* Outcome Notes */}
          <div className="space-y-2">
            <Label htmlFor="outcome_notes">Outcome Notes</Label>
            <Textarea
              id="outcome_notes"
              value={formData.outcome_notes}
              onChange={(e) => setFormData({ ...formData, outcome_notes: e.target.value })}
              placeholder="Record outcomes, feedback, results..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            {item && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
