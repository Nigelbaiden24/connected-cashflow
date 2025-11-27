import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CustomTableColumnManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onColumnAdded: (columnName: string, columnConfig: ColumnConfig) => void;
  existingColumns: string[];
}

export interface ColumnConfig {
  type: string;
  required: boolean;
  options?: string[];
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
  { value: "currency", label: "Currency" },
  { value: "percentage", label: "Percentage" },
];

const SUGGESTED_COLUMNS = [
  { name: "Status", type: "select", options: ["New", "In Progress", "Completed", "On Hold", "Cancelled"] },
  { name: "Priority", type: "select", options: ["Low", "Medium", "High", "Urgent"] },
  { name: "Assigned To", type: "text" },
  { name: "Due Date", type: "date" },
  { name: "Budget", type: "currency" },
  { name: "Progress", type: "percentage" },
  { name: "Category", type: "select", options: ["Internal", "External", "Client", "Vendor"] },
  { name: "Notes", type: "text" },
  { name: "Email", type: "email" },
  { name: "Phone", type: "phone" },
  { name: "Website", type: "url" },
  { name: "Completed", type: "checkbox" },
];

export function CustomTableColumnManager({ 
  open, 
  onOpenChange, 
  onColumnAdded, 
  existingColumns 
}: CustomTableColumnManagerProps) {
  const [columnName, setColumnName] = useState("");
  const [columnType, setColumnType] = useState("text");
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const needsOptions = columnType === "select" || columnType === "multi-select";

  // Filter suggestions to exclude already existing columns
  const availableSuggestions = SUGGESTED_COLUMNS.filter(
    suggestion => !existingColumns.includes(suggestion.name)
  );

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleUseSuggestion = (suggestion: typeof SUGGESTED_COLUMNS[0]) => {
    setColumnName(suggestion.name);
    setColumnType(suggestion.type);
    if (suggestion.options) {
      setOptions(suggestion.options);
    } else {
      setOptions([]);
    }
    setShowSuggestions(false);
  };

  const handleSave = () => {
    if (!columnName.trim()) {
      return;
    }

    if (needsOptions && options.length === 0) {
      return;
    }

    const config: ColumnConfig = {
      type: columnType,
      required: isRequired,
      ...(needsOptions && { options }),
    };

    onColumnAdded(columnName, config);
    
    // Reset form
    setColumnName("");
    setColumnType("text");
    setIsRequired(false);
    setOptions([]);
    setShowSuggestions(true);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setColumnName("");
    setColumnType("text");
    setIsRequired(false);
    setOptions([]);
    setShowSuggestions(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Custom Column</DialogTitle>
          <DialogDescription>
            Create a new column for this table with custom types and options
          </DialogDescription>
        </DialogHeader>

        {/* Quick Suggestions */}
        {showSuggestions && availableSuggestions.length > 0 && (
          <div className="space-y-2 pb-4 border-b">
            <Label className="text-sm font-medium">Quick Add (Suggested Columns)</Label>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.slice(0, 8).map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleUseSuggestion(suggestion)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {suggestion.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="columnName">Column Name *</Label>
            <Input
              id="columnName"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="e.g., Status, Budget, Assigned To"
              onFocus={() => setShowSuggestions(false)}
            />
          </div>

          <div>
            <Label htmlFor="columnType">Column Type *</Label>
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
            <p className="text-xs text-muted-foreground mt-1">
              Choose how data will be stored and displayed in this column
            </p>
          </div>

          {needsOptions && (
            <div className="space-y-2">
              <Label>Options * (for dropdown selections)</Label>
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOption())}
                  placeholder="Type option and press Enter"
                />
                <Button 
                  type="button" 
                  onClick={handleAddOption} 
                  size="icon" 
                  variant="outline"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {options.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {options.map((option, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between bg-muted p-2 rounded group hover:bg-muted/80 transition-colors"
                    >
                      <span className="text-sm font-medium">{option}</span>
                      <Button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-0.5">
              <Label htmlFor="required">Required Field</Label>
              <p className="text-xs text-muted-foreground">
                Users must fill this field
              </p>
            </div>
            <Switch 
              id="required" 
              checked={isRequired} 
              onCheckedChange={setIsRequired} 
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={!columnName.trim() || (needsOptions && options.length === 0)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
