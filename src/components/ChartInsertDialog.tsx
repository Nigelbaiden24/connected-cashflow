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
import { BarChart3, PieChart, LineChart, TrendingUp, Circle, Target, Palette, Plus, Trash2 } from "lucide-react";
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

export interface ChartDataItem {
  label: string;
  value: number;
  color: string;
}

export interface ChartConfig {
  type: "bar" | "line" | "pie" | "area" | "donut" | "radial";
  title: string;
  data: ChartDataItem[];
  x: number;
  y: number;
  width: number;
  height: number;
  showGrid?: boolean;
  showLegend?: boolean;
  gradientEnabled?: boolean;
  animationDuration?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  showValues?: boolean;
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

const defaultData: ChartDataItem[] = [
  { label: "Q1", value: 100, color: "#3b82f6" },
  { label: "Q2", value: 150, color: "#10b981" },
  { label: "Q3", value: 120, color: "#f59e0b" },
  { label: "Q4", value: 180, color: "#ef4444" },
];

export function ChartInsertDialog({ open, onOpenChange, onInsertChart }: ChartInsertDialogProps) {
  const [chartType, setChartType] = useState<ChartConfig["type"]>("bar");
  const [chartTitle, setChartTitle] = useState("Chart Title");
  const [chartData, setChartData] = useState<ChartDataItem[]>(defaultData);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(200);
  const [chartWidth, setChartWidth] = useState(500);
  const [chartHeight, setChartHeight] = useState(350);
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [gradientEnabled, setGradientEnabled] = useState(true);
  const [animationDuration, setAnimationDuration] = useState(1200);
  const [xAxisLabel, setXAxisLabel] = useState("");
  const [yAxisLabel, setYAxisLabel] = useState("");
  const [valuePrefix, setValuePrefix] = useState("");
  const [valueSuffix, setValueSuffix] = useState("");
  const [showValues, setShowValues] = useState(false);

  const updateDataField = (index: number, field: keyof ChartDataItem, value: string | number) => {
    setChartData(prev => prev.map((item, idx) => {
      if (idx === index) {
        if (field === 'value') {
          return { ...item, [field]: parseFloat(value as string) || 0 };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const addDataRow = () => {
    const newColor = defaultColors[chartData.length % defaultColors.length];
    setChartData(prev => [...prev, { label: `Item ${prev.length + 1}`, value: 100, color: newColor }]);
  };

  const removeDataRow = (index: number) => {
    if (chartData.length > 1) {
      setChartData(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  const applyColorPreset = (colors: string[]) => {
    setChartData(prev => prev.map((item, idx) => ({
      ...item,
      color: colors[idx % colors.length]
    })));
  };

  const handleInsert = () => {
    if (chartData.length === 0) return;

    onInsertChart({
      type: chartType,
      title: chartTitle,
      data: chartData,
      x: posX,
      y: posY,
      width: chartWidth,
      height: chartHeight,
      showGrid,
      showLegend,
      gradientEnabled,
      animationDuration,
      xAxisLabel,
      yAxisLabel,
      valuePrefix,
      valueSuffix,
      showValues,
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

  const isAxisChart = ["bar", "line", "area"].includes(chartType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Insert Enterprise Chart
          </DialogTitle>
          <DialogDescription>
            Create animated, interactive charts with full data customization
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 mt-4">
          {/* Left Column - Chart Settings */}
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

            {/* Axis Labels - Only for bar/line/area charts */}
            {isAxisChart && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>X-Axis Label</Label>
                  <Input
                    value={xAxisLabel}
                    onChange={(e) => setXAxisLabel(e.target.value)}
                    placeholder="e.g., Quarters"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Y-Axis Label</Label>
                  <Input
                    value={yAxisLabel}
                    onChange={(e) => setYAxisLabel(e.target.value)}
                    placeholder="e.g., Revenue"
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}

            {/* Value Formatting */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Value Prefix</Label>
                <Input
                  value={valuePrefix}
                  onChange={(e) => setValuePrefix(e.target.value)}
                  placeholder="e.g., $"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Value Suffix</Label>
                <Input
                  value={valueSuffix}
                  onChange={(e) => setValueSuffix(e.target.value)}
                  placeholder="e.g., %"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Width (px)</Label>
                <Input
                  type="number"
                  value={chartWidth}
                  onChange={(e) => setChartWidth(Number(e.target.value))}
                  className="mt-1.5"
                  min={200}
                  max={1200}
                />
              </div>
              <div>
                <Label>Height (px)</Label>
                <Input
                  type="number"
                  value={chartHeight}
                  onChange={(e) => setChartHeight(Number(e.target.value))}
                  className="mt-1.5"
                  min={150}
                  max={800}
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
              {isAxisChart && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded"
                  />
                  Show Grid
                </label>
              )}
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
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showValues}
                  onChange={(e) => setShowValues(e.target.checked)}
                  className="rounded"
                />
                Show Values
              </label>
            </div>

            {/* Color Presets */}
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
          </div>

          {/* Right Column - Data Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Chart Data</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addDataRow}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Row
              </Button>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-[40px_1fr_100px_32px] gap-2 px-2 text-xs font-medium text-muted-foreground">
              <span>Color</span>
              <span>Label</span>
              <span>Value</span>
              <span></span>
            </div>
            
            {/* Data Rows */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {chartData.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[40px_1fr_100px_32px] gap-2 items-center bg-muted/50 p-2 rounded-lg">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="w-8 h-8 rounded-md border-2 border-border hover:scale-105 transition-transform"
                        style={{ backgroundColor: item.color }}
                        title="Change color"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3 z-[200]">
                      <div className="space-y-2">
                        <Label className="text-xs">Pick Color</Label>
                        <div className="grid grid-cols-5 gap-1">
                          {defaultColors.map((color) => (
                            <button
                              key={color}
                              className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              onClick={() => updateDataField(idx, 'color', color)}
                            />
                          ))}
                        </div>
                        <Input
                          type="color"
                          value={item.color}
                          onChange={(e) => updateDataField(idx, 'color', e.target.value)}
                          className="w-full h-8 cursor-pointer"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Input
                    value={item.label}
                    onChange={(e) => updateDataField(idx, 'label', e.target.value)}
                    placeholder="Label"
                    className="h-8 text-sm"
                  />
                  
                  <Input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateDataField(idx, 'value', e.target.value)}
                    placeholder="Value"
                    className="h-8 text-sm"
                  />
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeDataRow(idx)}
                    disabled={chartData.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Data Summary */}
            <div className="bg-muted/30 p-3 rounded-lg text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Total Data Points:</span>
                <span className="font-medium text-foreground">{chartData.length}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Sum of Values:</span>
                <span className="font-medium text-foreground">
                  {valuePrefix}{chartData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}{valueSuffix}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Average Value:</span>
                <span className="font-medium text-foreground">
                  {valuePrefix}{(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toFixed(1)}{valueSuffix}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={chartData.length === 0}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Insert Chart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
