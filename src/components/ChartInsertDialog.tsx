import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3, PieChart, LineChart, TrendingUp } from "lucide-react";

interface ChartInsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertChart: (chartConfig: ChartConfig) => void;
}

export interface ChartConfig {
  type: "bar" | "line" | "pie" | "area";
  title: string;
  data: { label: string; value: number; color: string }[];
  x: number;
  y: number;
  width: number;
  height: number;
}

const defaultColors = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1"
];

export function ChartInsertDialog({ open, onOpenChange, onInsertChart }: ChartInsertDialogProps) {
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "area">("bar");
  const [chartTitle, setChartTitle] = useState("Chart Title");
  const [dataInput, setDataInput] = useState("Q1, 100\nQ2, 150\nQ3, 120\nQ4, 180");
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(200);
  const [chartWidth, setChartWidth] = useState(500);
  const [chartHeight, setChartHeight] = useState(300);

  const parseData = () => {
    const lines = dataInput.split("\n").filter(line => line.trim());
    return lines.map((line, idx) => {
      const parts = line.split(",").map(p => p.trim());
      const label = parts[0] || `Item ${idx + 1}`;
      const value = parseFloat(parts[1]) || 0;
      const color = parts[2] || defaultColors[idx % defaultColors.length];
      return { label, value, color };
    });
  };

  const handleInsert = () => {
    const data = parseData();
    if (data.length === 0) return;

    onInsertChart({
      type: chartType,
      title: chartTitle,
      data,
      x: posX,
      y: posY,
      width: chartWidth,
      height: chartHeight,
    });
    onOpenChange(false);
  };

  const chartTypes = [
    { value: "bar", label: "Bar Chart", icon: BarChart3 },
    { value: "line", label: "Line Chart", icon: LineChart },
    { value: "pie", label: "Pie Chart", icon: PieChart },
    { value: "area", label: "Area Chart", icon: TrendingUp },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Insert Chart
          </DialogTitle>
          <DialogDescription>
            Create a chart by entering your data below. Format: Label, Value (one per line)
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label>Chart Type</Label>
              <Select value={chartType} onValueChange={(v: "bar" | "line" | "pie" | "area") => setChartType(v)}>
                <SelectTrigger className="mt-1.5 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {chartTypes.map(ct => (
                    <SelectItem key={ct.value} value={ct.value}>
                      <div className="flex items-center gap-2">
                        <ct.icon className="h-4 w-4" />
                        {ct.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Chart Title</Label>
              <Input
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Enter chart title"
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>X Position</Label>
                <Input
                  type="number"
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Y Position</Label>
                <Input
                  type="number"
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Width</Label>
                <Input
                  type="number"
                  value={chartWidth}
                  onChange={(e) => setChartWidth(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Height</Label>
                <Input
                  type="number"
                  value={chartHeight}
                  onChange={(e) => setChartHeight(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Data (Label, Value per line)</Label>
              <Textarea
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder="Q1, 100&#10;Q2, 150&#10;Q3, 120"
                className="mt-1.5 h-[200px] font-mono text-sm"
              />
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Preview Data:</p>
              <div className="space-y-1">
                {parseData().slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="font-medium">{item.label}:</span>
                    <span>{item.value}</span>
                  </div>
                ))}
                {parseData().length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{parseData().length - 5} more...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={parseData().length === 0}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Insert Chart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
