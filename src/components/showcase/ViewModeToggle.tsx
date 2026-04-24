import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Presentation } from "lucide-react";

interface ViewModeToggleProps {
  value: string;
  onChange: (value: string) => void;
  options?: ("grid" | "list" | "showcase")[];
}

export function ViewModeToggle({ value, onChange, options = ["grid", "showcase"] }: ViewModeToggleProps) {
  const items = [
    { key: "grid", label: "Grid view", icon: LayoutGrid },
    { key: "list", label: "List view", icon: List },
    { key: "showcase", label: "Showcase view", icon: Presentation },
  ] as const;

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
      {items
        .filter((item) => options.includes(item.key))
        .map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            type="button"
            variant={value === key ? "secondary" : "ghost"}
            size="icon"
            aria-label={label}
            className="h-8 w-8"
            onClick={() => onChange(key)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
    </div>
  );
}
