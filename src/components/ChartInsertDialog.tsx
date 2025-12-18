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
import { BarChart3, PieChart, LineChart, TrendingUp, Circle, Target, Palette } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChartInsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertChart: (chartConfig: ChartConfig) => void;
}

export interface ChartConfig {
  type: "bar" | "line" | "pie" | "area" | "donut" | "radial";
  title: string;
  data: { label: string; value: number; color: string }[];
  x: number;
  y: number;
  width: number;
  height: number;
  showGrid?: boolean;
  showLegend?: boolean;
  gradientEnabled?: boolean;
  animationDuration?: number;
}

const defaultColors = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1"
];

const colorPresets = [
  { name: "Ocean", colors: ["#1e3a8a", "#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd"] },
  { name: "Forest", colors: ["#14532d", "#15803d", "#22c55e", "#4ade80", "#86efac"] },
  { name: "Sunset", colors: ["#7c2d12", "#c2410c", "#f97316", "#fb923c", "#fdba74"] },
  { name: "Purple", colors: ["#4c1d95", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd"] },
  { name: "Teal", colors: ["#134e4a", "#0d9488", "#14b8a6", "#2dd4bf", "#5eead4"] },
];

export function ChartInsertDialog({ open, onOpenChange, onInsertChart }: ChartInsertDialogProps) {
  const [chartType, setChartType] = useState<ChartConfig["type"]>("bar");
  const [chartTitle, setChartTitle] = useState("Chart Title");
  const [dataInput, setDataInput] = useState("Q1, 100, #3b82f6\nQ2, 150, #10b981\nQ3, 120, #f59e0b\nQ4, 180, #ef4444");
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(200);
  const [chartWidth, setChartWidth] = useState(500);
  const [chartHeight, setChartHeight] = useState(350);
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [gradientEnabled, setGradientEnabled] = useState(true);
  const [animationDuration, setAnimationDuration] = useState(1200);

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

  const updateDataColor = (index: number, color: string) => {
    const lines = dataInput.split("\n").filter(line => line.trim());
    const newLines = lines.map((line, idx) => {
      if (idx === index) {
        const parts = line.split(",").map(p => p.trim());
        return `${parts[0]}, ${parts[1]}, ${color}`;
      }
      return line;
    });
    setDataInput(newLines.join("\n"));
  };

  const applyColorPreset = (colors: string[]) => {
    const lines = dataInput.split("\n").filter(line => line.trim());
    const newLines = lines.map((line, idx) => {
      const parts = line.split(",").map(p => p.trim());
      return `${parts[0]}, ${parts[1]}, ${colors[idx % colors.length]}`;
    });
    setDataInput(newLines.join("\n"));
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
      showGrid,
      showLegend,
      gradientEnabled,
      animationDuration,
    });
    onOpenChange(false);
  };

  const chartTypes = [
    { value: "bar", label: "Bar Chart", icon: BarChart3 },
    { value: "line", label: "Line Chart", icon: LineChart },
    { value: "area", label: "Area Chart", icon: TrendingUp },
    { value: "pie", label: "Pie Chart", icon: PieChart },
    { value: "donut", label: "Donut Chart", icon: Circle },
    { value: "radial", label: "Radial Chart", icon: Target },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Insert Enterprise Chart
          </DialogTitle>
          <DialogDescription>
            Create animated, interactive charts with custom colors. Format: Label, Value, Color (hex)
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label>Chart Type</Label>
              <Select value={chartType} onValueChange={(v: ChartConfig["type"]) => setChartType(v)}>
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

            <div>
              <Label>Animation Duration (ms)</Label>
              <Input
                type="number"
                value={animationDuration}
                onChange={(e) => setAnimationDuration(Number(e.target.value))}
                className="mt-1.5"
                min={0}
                max={5000}
                step={100}
              />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded"
                />
                Show Grid
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                  className="rounded"
                />
                Show Legend
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={gradientEnabled}
                  onChange={(e) => setGradientEnabled(e.target.checked)}
                  className="rounded"
                />
                Gradients
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Data (Label, Value, Color per line)</Label>
              <Textarea
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder="Q1, 100, #3b82f6&#10;Q2, 150, #10b981&#10;Q3, 120, #f59e0b"
                className="mt-1.5 h-[140px] font-mono text-sm"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color Presets
              </Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    className="h-8 rounded-md overflow-hidden border border-border hover:ring-2 ring-primary transition-all"
                    onClick={() => applyColorPreset(preset.colors)}
                    title={preset.name}
                  >
                    <div className="h-full flex">
                      {preset.colors.slice(0, 3).map((color, i) => (
                        <div
                          key={i}
                          className="flex-1 h-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg max-h-[180px] overflow-y-auto">
              <p className="text-xs text-muted-foreground mb-2">Data Preview & Colors:</p>
              <div className="space-y-2">
                {parseData().slice(0, 8).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="w-6 h-6 rounded border-2 border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: item.color }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3 z-[200]">
                        <div className="space-y-2">
                          <Label className="text-xs">Pick Color</Label>
                          <div className="grid grid-cols-5 gap-1">
                            {defaultColors.map((color) => (
                              <button
                                key={color}
                                className="w-5 h-5 rounded border hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => updateDataColor(idx, color)}
                              />
                            ))}
                          </div>
                          <Input
                            type="color"
                            value={item.color}
                            onChange={(e) => updateDataColor(idx, e.target.value)}
                            className="w-full h-7 cursor-pointer"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <span className="font-medium flex-1">{item.label}</span>
                    <span className="text-muted-foreground">{item.value}</span>
                  </div>
                ))}
                {parseData().length > 8 && (
                  <span className="text-xs text-muted-foreground">
                    +{parseData().length - 8} more...
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
