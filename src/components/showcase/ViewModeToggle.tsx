import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List, Presentation } from "lucide-react";

interface ViewModeToggleProps {
  value: string;
  onChange: (value: string) => void;
  options?: ("grid" | "list" | "showcase")[];
}

export function ViewModeToggle({ value, onChange, options = ["grid", "showcase"] }: ViewModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v)}
      className="bg-muted rounded-lg p-1"
    >
      {options.includes("grid") && (
        <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3">
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
      )}
      {options.includes("list") && (
        <ToggleGroupItem value="list" aria-label="List view" className="px-3">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      )}
      {options.includes("showcase") && (
        <ToggleGroupItem value="showcase" aria-label="Showcase view" className="px-3">
          <Presentation className="h-4 w-4" />
        </ToggleGroupItem>
      )}
    </ToggleGroup>
  );
}
