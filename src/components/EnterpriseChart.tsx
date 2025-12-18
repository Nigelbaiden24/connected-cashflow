import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Settings2, Plus, Trash2, BarChart3, LineChart as LineChartIcon, TrendingUp, PieChart as PieChartIcon, Circle, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ChartDataItem {
  label: string;
  value: number;
  color: string;
}

export interface EnterpriseChartConfig {
  type: "bar" | "line" | "pie" | "area" | "radial" | "donut";
  title: string;
  data: ChartDataItem[];
  showGrid?: boolean;
  showLegend?: boolean;
  animationDuration?: number;
  gradientEnabled?: boolean;
  width?: number;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  showValues?: boolean;
}

interface EnterpriseChartProps {
  config: EnterpriseChartConfig;
  width?: number;
  height?: number;
  onConfigChange?: (config: EnterpriseChartConfig) => void;
  onSizeChange?: (width: number, height: number) => void;
  editable?: boolean;
}

const defaultColors = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#a855f7", "#22c55e", "#eab308", "#dc2626"
];

const colorPresets = [
  // Blues
  ["#1e3a8a", "#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd"],
  // Greens
  ["#14532d", "#15803d", "#22c55e", "#4ade80", "#86efac"],
  // Warm
  ["#7c2d12", "#c2410c", "#f97316", "#fb923c", "#fdba74"],
  // Purple
  ["#4c1d95", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd"],
  // Teal
  ["#134e4a", "#0d9488", "#14b8a6", "#2dd4bf", "#5eead4"],
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3 animate-in fade-in-0 zoom-in-95 duration-200">
        <p className="font-semibold text-sm text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-2">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function EnterpriseChart({
  config,
  width = 500,
  height = 300,
  onConfigChange,
  onSizeChange,
  editable = true,
}: EnterpriseChartProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editConfig, setEditConfig] = useState<EnterpriseChartConfig>(config);
  const [editData, setEditData] = useState<ChartDataItem[]>(config.data);
  const [editWidth, setEditWidth] = useState(width);
  const [editHeight, setEditHeight] = useState(height);

  useEffect(() => {
    setEditConfig(config);
    setEditData([...config.data]);
    setEditWidth(config.width ?? width);
    setEditHeight(config.height ?? height);
  }, [config, width, height]);

  const chartData = config.data.map(d => ({
    name: d.label,
    value: d.value,
    fill: d.color,
  }));

  const handleSave = () => {
    const newConfig = { ...editConfig, data: editData, width: editWidth, height: editHeight };
    onConfigChange?.(newConfig);
    onSizeChange?.(editWidth, editHeight);
    setShowEditor(false);
  };

  const updateDataColor = (index: number, color: string) => {
    setEditData(prev => prev.map((item, idx) => 
      idx === index ? { ...item, color } : item
    ));
  };

  const updateDataField = (index: number, field: 'label' | 'value', newValue: string) => {
    setEditData(prev => prev.map((item, idx) => {
      if (idx === index) {
        if (field === 'label') {
          return { ...item, label: newValue };
        } else {
          return { ...item, value: parseFloat(newValue) || 0 };
        }
      }
      return item;
    }));
  };

  const addDataRow = () => {
    const newColor = defaultColors[editData.length % defaultColors.length];
    setEditData(prev => [...prev, { label: `Item ${prev.length + 1}`, value: 100, color: newColor }]);
  };

  const removeDataRow = (index: number) => {
    if (editData.length > 1) {
      setEditData(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  const applyColorPreset = (preset: string[]) => {
    setEditData(prev => prev.map((item, idx) => ({
      ...item,
      color: preset[idx % preset.length]
    })));
  };

  const isAxisChart = ["bar", "line", "area"].includes(editConfig.type);

  const renderChart = () => {
    const animationDuration = config.animationDuration ?? 1200;
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (config.type) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <defs>
              {chartData.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                  <stop offset="100%" stopColor={entry.fill} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            {config.showGrid !== false && (
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            )}
            <XAxis
              dataKey="name"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
            {config.showLegend !== false && <Legend content={<CustomLegend />} />}
            <Bar
              dataKey="value"
              animationBegin={0}
              animationDuration={animationDuration}
              animationEasing="ease-out"
              radius={[6, 6, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={config.gradientEnabled ? `url(#barGradient-${index})` : entry.fill}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                {chartData.map((entry, index) => (
                  <stop
                    key={index}
                    offset={`${(index / (chartData.length - 1)) * 100}%`}
                    stopColor={entry.fill}
                  />
                ))}
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {config.showGrid !== false && (
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            )}
            <XAxis
              dataKey="name"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {config.showLegend !== false && <Legend content={<CustomLegend />} />}
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={{ r: 6, fill: 'hsl(var(--background))', strokeWidth: 3, stroke: chartData[0]?.fill }}
              activeDot={{ r: 8, fill: chartData[0]?.fill, filter: 'url(#glow)' }}
              animationBegin={0}
              animationDuration={animationDuration}
              animationEasing="ease-out"
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartData[0]?.fill || '#3b82f6'} stopOpacity={0.8} />
                <stop offset="50%" stopColor={chartData[0]?.fill || '#3b82f6'} stopOpacity={0.4} />
                <stop offset="100%" stopColor={chartData[0]?.fill || '#3b82f6'} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            {config.showGrid !== false && (
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            )}
            <XAxis
              dataKey="name"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {config.showLegend !== false && <Legend content={<CustomLegend />} />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartData[0]?.fill || '#3b82f6'}
              strokeWidth={2}
              fill="url(#areaGradient)"
              animationBegin={0}
              animationDuration={animationDuration}
              animationEasing="ease-out"
            />
          </AreaChart>
        );

      case "pie":
      case "donut":
        const innerRadius = config.type === "donut" ? 60 : 0;
        return (
          <PieChart>
            <defs>
              {chartData.map((entry, index) => (
                <linearGradient key={`pieGradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                  <stop offset="100%" stopColor={entry.fill} stopOpacity={0.7} />
                </linearGradient>
              ))}
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3" />
              </filter>
            </defs>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={animationDuration}
              animationEasing="ease-out"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={config.gradientEnabled ? `url(#pieGradient-${index})` : entry.fill}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  className="transition-all duration-300 hover:opacity-80"
                  style={{ filter: 'url(#shadow)' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {config.showLegend !== false && <Legend content={<CustomLegend />} />}
          </PieChart>
        );

      case "radial":
        const radialData = chartData.map((d, i) => ({
          ...d,
          fill: d.fill,
        }));
        return (
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="20%"
            outerRadius="90%"
            barSize={20}
            data={radialData}
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              background={{ fill: 'hsl(var(--muted))' }}
              dataKey="value"
              animationBegin={0}
              animationDuration={animationDuration}
              animationEasing="ease-out"
              cornerRadius={10}
            >
              {radialData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </RadialBar>
            <Tooltip content={<CustomTooltip />} />
            {config.showLegend !== false && <Legend content={<CustomLegend />} iconType="circle" />}
          </RadialBarChart>
        );

      default:
        return null;
    }
  };

  const getPreviewData = () => {
    return editData.map(d => ({
      name: d.label,
      value: d.value,
      fill: d.color,
    }));
  };

  return (
    <div className="relative group">
      {/* Chart Title */}
      {config.title && (
        <h3 className="text-center font-semibold text-foreground mb-2 text-lg">
          {config.title}
        </h3>
      )}

      {/* Chart Container */}
      <div 
        className="w-full cursor-pointer transition-all duration-300 hover:shadow-lg rounded-lg"
        onClick={() => editable && setShowEditor(true)}
        style={{ height: height - 40 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Edit Button */}
      {editable && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setShowEditor(true);
          }}
        >
          <Settings2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Edit Chart
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 mt-4">
            {/* Left Column - Settings */}
            <div className="space-y-4">
              <div>
                <Label>Chart Type</Label>
                <Select
                  value={editConfig.type}
                  onValueChange={(v: any) => setEditConfig({ ...editConfig, type: v })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Bar Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="line">
                      <div className="flex items-center gap-2">
                        <LineChartIcon className="h-4 w-4" />
                        Line Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="area">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Area Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center gap-2">
                        <PieChartIcon className="h-4 w-4" />
                        Pie Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="donut">
                      <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4" />
                        Donut Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="radial">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Radial Chart
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Chart Title</Label>
                <Input
                  value={editConfig.title}
                  onChange={(e) => setEditConfig({ ...editConfig, title: e.target.value })}
                  className="mt-1.5"
                  placeholder="Enter chart title"
                />
              </div>

              {/* Axis Labels - Only for bar/line/area charts */}
              {isAxisChart && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>X-Axis Label</Label>
                    <Input
                      value={editConfig.xAxisLabel || ''}
                      onChange={(e) => setEditConfig({ ...editConfig, xAxisLabel: e.target.value })}
                      placeholder="e.g., Quarters"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Y-Axis Label</Label>
                    <Input
                      value={editConfig.yAxisLabel || ''}
                      onChange={(e) => setEditConfig({ ...editConfig, yAxisLabel: e.target.value })}
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
                    value={editConfig.valuePrefix || ''}
                    onChange={(e) => setEditConfig({ ...editConfig, valuePrefix: e.target.value })}
                    placeholder="e.g., $"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Value Suffix</Label>
                  <Input
                    value={editConfig.valueSuffix || ''}
                    onChange={(e) => setEditConfig({ ...editConfig, valueSuffix: e.target.value })}
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
                    value={editWidth}
                    onChange={(e) => setEditWidth(Math.max(200, Number(e.target.value)))}
                    className="mt-1.5"
                    min={200}
                    max={1200}
                  />
                </div>
                <div>
                  <Label>Height (px)</Label>
                  <Input
                    type="number"
                    value={editHeight}
                    onChange={(e) => setEditHeight(Math.max(150, Number(e.target.value)))}
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
                  value={editConfig.animationDuration ?? 1200}
                  onChange={(e) => setEditConfig({ ...editConfig, animationDuration: parseInt(e.target.value) || 1200 })}
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
                      checked={editConfig.showGrid !== false}
                      onChange={(e) => setEditConfig({ ...editConfig, showGrid: e.target.checked })}
                      className="rounded"
                    />
                    Show Grid
                  </label>
                )}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editConfig.showLegend !== false}
                    onChange={(e) => setEditConfig({ ...editConfig, showLegend: e.target.checked })}
                    className="rounded"
                  />
                  Show Legend
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editConfig.gradientEnabled !== false}
                    onChange={(e) => setEditConfig({ ...editConfig, gradientEnabled: e.target.checked })}
                    className="rounded"
                  />
                  Gradients
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editConfig.showValues === true}
                    onChange={(e) => setEditConfig({ ...editConfig, showValues: e.target.checked })}
                    className="rounded"
                  />
                  Show Values
                </label>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Color Presets
                </Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {colorPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      className="h-8 rounded-md overflow-hidden border border-border hover:ring-2 ring-primary transition-all"
                      onClick={() => applyColorPreset(preset)}
                      title="Apply color preset"
                    >
                      <div className="h-full flex">
                        {preset.slice(0, 3).map((color, i) => (
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

            {/* Right Column - Data */}
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
              
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {editData.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[40px_1fr_100px_32px] gap-2 items-center bg-muted/50 p-2 rounded-lg">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="w-8 h-8 rounded-md border-2 border-border hover:scale-105 transition-transform"
                          style={{ backgroundColor: item.color }}
                          title="Change color"
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Pick Color</Label>
                          <div className="grid grid-cols-5 gap-1">
                            {defaultColors.map((color) => (
                              <button
                                key={color}
                                className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => updateDataColor(idx, color)}
                              />
                            ))}
                          </div>
                          <Input
                            type="color"
                            value={item.color}
                            onChange={(e) => updateDataColor(idx, e.target.value)}
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
                      disabled={editData.length <= 1}
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
                  <span className="font-medium text-foreground">{editData.length}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Sum of Values:</span>
                  <span className="font-medium text-foreground">
                    {editConfig.valuePrefix || ''}{editData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}{editConfig.valueSuffix || ''}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Average Value:</span>
                  <span className="font-medium text-foreground">
                    {editConfig.valuePrefix || ''}{(editData.reduce((sum, d) => sum + d.value, 0) / editData.length).toFixed(1)}{editConfig.valueSuffix || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <Label className="mb-2 block">Preview</Label>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                {(() => {
                  const previewData = getPreviewData();

                  switch (editConfig.type) {
                    case "bar":
                      return (
                        <BarChart data={previewData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {previewData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      );
                    case "line":
                      return (
                        <LineChart data={previewData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke={previewData[0]?.fill} strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      );
                    case "area":
                      return (
                        <AreaChart data={previewData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="value" stroke={previewData[0]?.fill} fill={previewData[0]?.fill} fillOpacity={0.3} />
                        </AreaChart>
                      );
                    case "pie":
                    case "donut":
                      return (
                        <PieChart>
                          <Pie
                            data={previewData}
                            cx="50%"
                            cy="50%"
                            innerRadius={editConfig.type === "donut" ? 40 : 0}
                            outerRadius={70}
                            dataKey="value"
                          >
                            {previewData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      );
                    case "radial":
                      return (
                        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={15} data={previewData} startAngle={180} endAngle={-180}>
                          <RadialBar background dataKey="value" cornerRadius={5}>
                            {previewData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </RadialBar>
                          <Tooltip />
                        </RadialBarChart>
                      );
                    default:
                      return <div />;
                  }
                })()}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
