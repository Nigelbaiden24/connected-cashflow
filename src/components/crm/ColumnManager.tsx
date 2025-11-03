import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ColumnManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onColumnAdded: () => void;
  existingColumns: any[];
}

const COLUMN_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Single Select" },
  { value: "multi-select", label: "Multi Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "url", label: "URL" },
];

export function ColumnManager({ open, onOpenChange, onColumnAdded, existingColumns }: ColumnManagerProps) {
  const [columnName, setColumnName] = useState("");
  const [columnType, setColumnType] = useState("text");
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const { toast } = useToast();

  const needsOptions = columnType === "select" || columnType === "multi-select";

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!columnName.trim()) {
      toast({
        title: "Error",
        description: "Column name is required",
        variant: "destructive",
      });
      return;
    }

    if (needsOptions && options.length === 0) {
      toast({
        title: "Error",
        description: "At least one option is required for select columns",
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert the new column
      const { data: newColumn, error: columnError } = await supabase
        .from("crm_custom_columns")
        .insert({
          column_name: columnName,
          column_type: columnType,
          column_options: needsOptions ? options : [],
          is_required: isRequired,
          column_order: existingColumns.length,
        })
        .select()
        .single();

      if (columnError) throw columnError;

      // Fetch all contacts and create empty data entries for the new column
      const { data: contacts, error: contactsError } = await supabase
        .from("crm_contacts")
        .select("id");

      if (contactsError) throw contactsError;

      if (contacts && contacts.length > 0) {
        const dataInserts = contacts.map((contact) => ({
          contact_id: contact.id,
          column_id: newColumn.id,
          value: "",
        }));

        const { error: dataError } = await supabase
          .from("crm_contact_data")
          .insert(dataInserts);

        if (dataError) throw dataError;
      }

      toast({
        title: "Success",
        description: "Column added successfully",
      });

      setColumnName("");
      setColumnType("text");
      setIsRequired(false);
      setOptions([]);
      onOpenChange(false);
      onColumnAdded();
    } catch (error) {
      console.error("Error adding column:", error);
      toast({
        title: "Error",
        description: "Failed to add column",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Column</DialogTitle>
          <DialogDescription>Create a new column for your CRM contacts</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="columnName">Column Name</Label>
            <Input
              id="columnName"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="e.g., Budget, Industry, Source"
            />
          </div>

          <div>
            <Label htmlFor="columnType">Column Type</Label>
            <Select value={columnType} onValueChange={setColumnType}>
              <SelectTrigger id="columnType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMN_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsOptions && (
            <div>
              <Label>Options</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddOption()}
                  placeholder="Add option"
                />
                <Button type="button" onClick={handleAddOption} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm">{option}</span>
                    <Button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="required">Required Field</Label>
            <Switch id="required" checked={isRequired} onCheckedChange={setIsRequired} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Add Column
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
