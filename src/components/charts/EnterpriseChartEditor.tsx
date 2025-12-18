import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Settings2,
  Plus,
  Trash2,
  BarChart3,
  LineChart as LineChartIcon,
  TrendingUp,
  PieChart as PieChartIcon,
  Circle,
  Target,
  Database,
  Palette,
  FileText,
  Ruler,
  LayoutGrid,
} from "lucide-react";
import {
  EnterpriseChartConfig,
  EnterpriseDataItem,
  ChartType,
  CurrencyType,
  UnitType,
  ValueScale,
  NegativeFormat,
  NullHandling,
  ColorPalette,
  DataFrequency,
  ConfidenceLevel,
  BarOrientation,
  DataLabelPosition,
  DataLabelFormat,
  SortOrder,
  LineStyle,
  CurveType,
  LabelFrequency,
  TrendlineType,
  NegativeAreaHandling,
  PieLabelPosition,
  GridShape,
  colorPalettes,
  defaultBarConfig,
  defaultLineConfig,
  defaultAreaConfig,
  defaultPieConfig,
  defaultDonutConfig,
  defaultRadialConfig,
} from "@/types/enterpriseChart";

interface EnterpriseChartEditorProps {
  config: EnterpriseChartConfig;
  onChange: (config: EnterpriseChartConfig) => void;
}

const defaultColors = [
  "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

type EditableDataItem = EnterpriseDataItem & { _id: string };

export function EnterpriseChartEditor({ config, onChange }: EnterpriseChartEditorProps) {
  const [editData, setEditData] = useState<EditableDataItem[]>(
    config.data.map((d, idx) => ({ ...d, _id: `row-${Date.now()}-${idx}` }))
  );

  const updateConfig = <K extends keyof EnterpriseChartConfig>(
    key: K,
    value: EnterpriseChartConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  const updateCore = <K extends keyof EnterpriseChartConfig["core"]>(
    key: K,
    value: EnterpriseChartConfig["core"][K]
  ) => {
    onChange({ ...config, core: { ...config.core, [key]: value } });
  };

  const updateDimensions = <K extends keyof EnterpriseChartConfig["dimensions"]>(
    key: K,
    value: EnterpriseChartConfig["dimensions"][K]
  ) => {
    onChange({ ...config, dimensions: { ...config.dimensions, [key]: value } });
  };

  const updateDataFormatting = <K extends keyof EnterpriseChartConfig["dataFormatting"]>(
    key: K,
    value: EnterpriseChartConfig["dataFormatting"][K]
  ) => {
    onChange({ ...config, dataFormatting: { ...config.dataFormatting, [key]: value } });
  };

  const updateVisualControls = <K extends keyof EnterpriseChartConfig["visualControls"]>(
    key: K,
    value: EnterpriseChartConfig["visualControls"][K]
  ) => {
    onChange({ ...config, visualControls: { ...config.visualControls, [key]: value } });
  };

  const updateMetadata = <K extends keyof NonNullable<EnterpriseChartConfig["metadata"]>>(
    key: K,
    value: NonNullable<EnterpriseChartConfig["metadata"]>[K]
  ) => {
    onChange({ ...config, metadata: { ...config.metadata, [key]: value } });
  };

  const updateAxis = <K extends keyof NonNullable<EnterpriseChartConfig["axis"]>>(
    key: K,
    value: NonNullable<EnterpriseChartConfig["axis"]>[K]
  ) => {
    onChange({ ...config, axis: { ...config.axis, [key]: value } });
  };

  const updateBarConfig = <K extends keyof NonNullable<EnterpriseChartConfig["barConfig"]>>(
    key: K,
    value: NonNullable<EnterpriseChartConfig["barConfig"]>[K]
  ) => {
    onChange({ ...config, barConfig: { ...(config.barConfig || defaultBarConfig), [key]: value } });
  };

  const updateLineConfig = <K extends keyof NonNullable<EnterpriseChartConfig["lineConfig"]>>(
    key: K,
    value: NonNullable<EnterpriseChartConfig["lineConfig"]>[K]
  ) => {
    onChange({ ...config, lineConfig: { ...(config.lineConfig || defaultLineConfig), [key]: value } });
  };

  const updateAreaConfig = <K extends keyof NonNullable<EnterpriseChartConfig["areaConfig"]>>(
    key: K,
    value: NonNullable<EnterpriseChartConfig["areaConfig"]>[K]
  ) => {
    onChange({ ...config, areaConfig: { ...(config.areaConfig || defaultAreaConfig), [key]: value } });
  };

  const updatePieConfig = <K extends keyof NonNullable<EnterpriseChartConfig["pieConfig"]>>(
    key: K,
    value: NonNullable<EnterpriseChartConfig["pieConfig"]>[K]
  ) => {
    onChange({ ...config, pieConfig: { ...(config.pieConfig || defaultPieConfig), [key]: value } });
  };

  const updateDonutConfig = <K extends keyof NonNullable<EnterpriseChartConfig["donutConfig"]>>(
    key: K,
    value: NonNullable<EnterpriseChartConfig["donutConfig"]>[K]
  ) => {
    onChange({ ...config, donutConfig: { ...(config.donutConfig || defaultDonutConfig), [key]: value } });
  };

  const updateRadialConfig = <K extends keyof NonNullable<EnterpriseChartConfig["radialConfig"]>>(
    key: K,
    value: NonNullable<EnterpriseChartConfig["radialConfig"]>[K]
  ) => {
    onChange({ ...config, radialConfig: { ...(config.radialConfig || defaultRadialConfig), [key]: value } });
  };

  // Data management
  const addDataRow = () => {
    const newColor = defaultColors[editData.length % defaultColors.length];
    const newData = [
      ...editData,
      { _id: `row-${Date.now()}`, label: `Item ${editData.length + 1}`, value: 100, color: newColor },
    ];
    setEditData(newData);
    syncDataToConfig(newData);
  };

  const removeDataRow = (id: string) => {
    if (editData.length <= 1) return;
    const newData = editData.filter((d) => d._id !== id);
    setEditData(newData);
    syncDataToConfig(newData);
  };

  const updateDataField = (id: string, field: keyof EnterpriseDataItem, value: any) => {
    const newData = editData.map((d) =>
      d._id === id ? { ...d, [field]: field === "value" ? parseFloat(value) || 0 : value } : d
    );
    setEditData(newData);
    syncDataToConfig(newData);
  };

  const syncDataToConfig = (data: EditableDataItem[]) => {
    const cleanData: EnterpriseDataItem[] = data.map(({ _id, ...rest }) => rest);
    onChange({ ...config, data: cleanData });
  };

  const applyColorPalette = (palette: ColorPalette) => {
    const colors = colorPalettes[palette];
    if (!colors.length) return;
    const newData = editData.map((d, idx) => ({ ...d, color: colors[idx % colors.length] }));
    setEditData(newData);
    syncDataToConfig(newData);
    updateVisualControls("colorPalette", palette);
  };

  const isAxisChart = ["bar", "line", "area"].includes(config.core.chartType);

  const chartTypeIcons: Record<ChartType, React.ReactNode> = {
    bar: <BarChart3 className="h-4 w-4" />,
    line: <LineChartIcon className="h-4 w-4" />,
    area: <TrendingUp className="h-4 w-4" />,
    pie: <PieChartIcon className="h-4 w-4" />,
    donut: <Circle className="h-4 w-4" />,
    radial: <Target className="h-4 w-4" />,
  };

  return (
    <Tabs defaultValue="core" className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-4 h-auto p-1">
        <TabsTrigger value="core" className="text-xs py-2 px-2 cursor-pointer hover:bg-accent/50 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
          <Settings2 className="h-3 w-3 mr-1" /> Core
        </TabsTrigger>
        <TabsTrigger value="data" className="text-xs py-2 px-2 cursor-pointer hover:bg-accent/50 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
          <Database className="h-3 w-3 mr-1" /> Data
        </TabsTrigger>
        <TabsTrigger value="format" className="text-xs py-2 px-2 cursor-pointer hover:bg-accent/50 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
          <LayoutGrid className="h-3 w-3 mr-1" /> Format
        </TabsTrigger>
        <TabsTrigger value="visual" className="text-xs py-2 px-2 cursor-pointer hover:bg-accent/50 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
          <Palette className="h-3 w-3 mr-1" /> Visual
        </TabsTrigger>
        <TabsTrigger value="chart" className="text-xs py-2 px-2 cursor-pointer hover:bg-accent/50 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
          <BarChart3 className="h-3 w-3 mr-1" /> Chart
        </TabsTrigger>
        <TabsTrigger value="meta" className="text-xs py-2 px-2 cursor-pointer hover:bg-accent/50 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
          <FileText className="h-3 w-3 mr-1" /> Meta
        </TabsTrigger>
      </TabsList>

      {/* CORE IDENTITY TAB */}
      <TabsContent value="core" className="space-y-4 focus-visible:outline-none">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="cursor-pointer">Chart Type</Label>
            <Select
              value={config.core.chartType}
              onValueChange={(v: ChartType) => updateCore("chartType", v)}
            >
              <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {(["bar", "line", "area", "pie", "donut", "radial"] as ChartType[]).map((type) => (
                  <SelectItem key={type} value={type} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      {chartTypeIcons[type]}
                      {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="cursor-pointer">Chart Title</Label>
            <Input
              value={config.core.chartTitle}
              onChange={(e) => updateCore("chartTitle", e.target.value)}
              className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
              placeholder="Enter chart title"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="cursor-pointer">Subtitle (Optional)</Label>
          <Input
            value={config.core.subtitle || ""}
            onChange={(e) => updateCore("subtitle", e.target.value)}
            className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
            placeholder="Enter subtitle"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="cursor-pointer">Description (Accessibility / Tooltip)</Label>
          <Textarea
            value={config.core.description || ""}
            onChange={(e) => updateCore("description", e.target.value)}
            className="cursor-text hover:border-primary/50 focus:border-primary transition-colors resize-y"
            placeholder="Describe the chart for accessibility"
            rows={2}
          />
        </div>

        <div className="border-t pt-4">
          <Label className="flex items-center gap-2 mb-3">
            <Ruler className="h-4 w-4" />
            Dimensions & Layout
          </Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground cursor-pointer">Width (px)</Label>
              <Input
                type="number"
                value={config.dimensions.widthPx}
                onChange={(e) => updateDimensions("widthPx", Math.max(200, Number(e.target.value)))}
                className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                min={200}
                max={1200}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground cursor-pointer">Height (px)</Label>
              <Input
                type="number"
                value={config.dimensions.heightPx}
                onChange={(e) => updateDimensions("heightPx", Math.max(150, Number(e.target.value)))}
                className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                min={150}
                max={800}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm pb-2 cursor-pointer hover:text-primary transition-colors">
                <Switch
                  checked={config.dimensions.responsive}
                  onCheckedChange={(v) => updateDimensions("responsive", v)}
                  className="cursor-pointer"
                />
                Responsive
              </label>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* DATA TAB */}
      <TabsContent value="data" className="space-y-4 focus-visible:outline-none">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Chart Data</Label>
          <Button size="sm" variant="outline" onClick={addDataRow} className="gap-1 cursor-pointer hover:bg-accent transition-colors">
            <Plus className="h-3 w-3" /> Add Row
          </Button>
        </div>

        <div className="grid grid-cols-[40px_1fr_100px_100px_80px_32px] gap-2 px-2 text-xs font-medium text-muted-foreground">
          <span>Color</span>
          <span>Label</span>
          <span>Value</span>
          <span>Series</span>
          <span>Date</span>
          <span></span>
        </div>

        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {editData.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-[40px_1fr_100px_100px_80px_32px] gap-2 items-center bg-muted/50 p-2 rounded-lg hover:bg-muted/70 transition-colors"
            >
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-md border-2 border-border hover:scale-105 hover:border-primary/50 transition-all cursor-pointer"
                    style={{ backgroundColor: item.color || defaultColors[0] }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3 z-[9999]">
                  <div className="grid grid-cols-5 gap-1">
                    {defaultColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="w-6 h-6 rounded border hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => updateDataField(item._id, "color", color)}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={item.color || "#3b82f6"}
                    onChange={(e) => updateDataField(item._id, "color", e.target.value)}
                    className="w-full h-8 mt-2 cursor-pointer"
                  />
                </PopoverContent>
              </Popover>
              <Input
                value={item.label}
                onChange={(e) => updateDataField(item._id, "label", e.target.value)}
                className="h-8 text-sm cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                placeholder="Label"
              />
              <Input
                type="number"
                value={item.value}
                onChange={(e) => updateDataField(item._id, "value", e.target.value)}
                className="h-8 text-sm cursor-text hover:border-primary/50 focus:border-primary transition-colors"
              />
              <Input
                value={item.series || ""}
                onChange={(e) => updateDataField(item._id, "series", e.target.value)}
                className="h-8 text-sm cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                placeholder="Series"
              />
              <Input
                value={item.date || ""}
                onChange={(e) => updateDataField(item._id, "date", e.target.value)}
                className="h-8 text-sm cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                placeholder="Date"
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                onClick={() => removeDataRow(item._id)}
                disabled={editData.length <= 1}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-muted/30 p-3 rounded-lg text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Total Points:</span>
            <span className="font-medium text-foreground">{editData.length}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Sum:</span>
            <span className="font-medium text-foreground">
              {editData.reduce((s, d) => s + d.value, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </TabsContent>

      {/* DATA FORMATTING TAB */}
      <TabsContent value="format" className="space-y-4 focus-visible:outline-none">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="cursor-pointer">Currency</Label>
            <Select
              value={config.dataFormatting.currency}
              onValueChange={(v: CurrencyType) => updateDataFormatting("currency", v)}
            >
              <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="none" className="cursor-pointer">None</SelectItem>
                <SelectItem value="GBP" className="cursor-pointer">£ GBP</SelectItem>
                <SelectItem value="USD" className="cursor-pointer">$ USD</SelectItem>
                <SelectItem value="EUR" className="cursor-pointer">€ EUR</SelectItem>
                <SelectItem value="JPY" className="cursor-pointer">¥ JPY</SelectItem>
                <SelectItem value="CHF" className="cursor-pointer">CHF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="cursor-pointer">Unit</Label>
            <Select
              value={config.dataFormatting.unit}
              onValueChange={(v: UnitType) => updateDataFormatting("unit", v)}
            >
              <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="none" className="cursor-pointer">None</SelectItem>
                <SelectItem value="%" className="cursor-pointer">Percentage (%)</SelectItem>
                <SelectItem value="bps" className="cursor-pointer">Basis Points (bps)</SelectItem>
                <SelectItem value="years" className="cursor-pointer">Years</SelectItem>
                <SelectItem value="multiple" className="cursor-pointer">Multiple (x)</SelectItem>
                <SelectItem value="index" className="cursor-pointer">Index</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="cursor-pointer">Value Scale</Label>
            <Select
              value={config.dataFormatting.valueScale}
              onValueChange={(v: ValueScale) => updateDataFormatting("valueScale", v)}
            >
              <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="none" className="cursor-pointer">None</SelectItem>
                <SelectItem value="k" className="cursor-pointer">Thousands (K)</SelectItem>
                <SelectItem value="m" className="cursor-pointer">Millions (M)</SelectItem>
                <SelectItem value="bn" className="cursor-pointer">Billions (B)</SelectItem>
                <SelectItem value="tn" className="cursor-pointer">Trillions (T)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="cursor-pointer">Decimal Places</Label>
            <Input
              type="number"
              value={config.dataFormatting.decimalPlaces}
              onChange={(e) => updateDataFormatting("decimalPlaces", parseInt(e.target.value) || 0)}
              className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
              min={0}
              max={6}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="cursor-pointer">Negative Format</Label>
            <Select
              value={config.dataFormatting.negativeFormat}
              onValueChange={(v: NegativeFormat) => updateDataFormatting("negativeFormat", v)}
            >
              <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="minus" className="cursor-pointer">Minus Sign (-100)</SelectItem>
                <SelectItem value="parentheses" className="cursor-pointer">Parentheses (100)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="cursor-pointer">Null Value Handling</Label>
            <Select
              value={config.dataFormatting.nullValueHandling}
              onValueChange={(v: NullHandling) => updateDataFormatting("nullValueHandling", v)}
            >
              <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="hide" className="cursor-pointer">Hide</SelectItem>
                <SelectItem value="zero" className="cursor-pointer">Show as Zero</SelectItem>
                <SelectItem value="gap" className="cursor-pointer">Show Gap (—)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
          <Switch
            checked={config.dataFormatting.thousandsSeparator}
            onCheckedChange={(v) => updateDataFormatting("thousandsSeparator", v)}
            className="cursor-pointer"
          />
          Thousands Separator (1,000)
        </label>
      </TabsContent>

      {/* VISUAL CONTROLS TAB */}
      <TabsContent value="visual" className="space-y-4 focus-visible:outline-none">
        <div className="space-y-2">
          <Label className="cursor-pointer">Color Palette</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(colorPalettes) as ColorPalette[])
              .filter((k) => k !== "custom")
              .map((palette) => (
                <button
                  key={palette}
                  type="button"
                  className={`h-10 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    config.visualControls.colorPalette === palette
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50 hover:scale-[1.02]"
                  }`}
                  onClick={() => applyColorPalette(palette)}
                >
                  <div className="h-full flex">
                    {colorPalettes[palette].slice(0, 5).map((color, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </button>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="cursor-pointer">Opacity</Label>
            <Input
              type="number"
              value={config.visualControls.opacity}
              onChange={(e) =>
                updateVisualControls("opacity", Math.min(1, Math.max(0, parseFloat(e.target.value) || 1)))
              }
              className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="cursor-pointer">Animation Duration (ms)</Label>
            <Input
              type="number"
              value={config.visualControls.animationDurationMs}
              onChange={(e) =>
                updateVisualControls("animationDurationMs", parseInt(e.target.value) || 800)
              }
              className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
              min={0}
              max={5000}
              step={100}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
            <Switch
              checked={config.visualControls.gradientEnabled}
              onCheckedChange={(v) => updateVisualControls("gradientEnabled", v)}
              className="cursor-pointer"
            />
            Enable Gradients
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
            <Switch
              checked={config.visualControls.animationEnabled}
              onCheckedChange={(v) => updateVisualControls("animationEnabled", v)}
              className="cursor-pointer"
            />
            Enable Animations
          </label>
        </div>
      </TabsContent>

      {/* CHART-SPECIFIC TAB */}
      <TabsContent value="chart" className="space-y-4 focus-visible:outline-none">
        {/* AXIS SETTINGS (for bar, line, area) */}
        {isAxisChart && (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Axis Configuration</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">X-Axis Label</Label>
                <Input
                  value={config.axis?.xAxisLabel || ""}
                  onChange={(e) => updateAxis("xAxisLabel", e.target.value)}
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                  placeholder="e.g., Quarters"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Y-Axis Label</Label>
                <Input
                  value={config.axis?.yAxisLabel || ""}
                  onChange={(e) => updateAxis("yAxisLabel", e.target.value)}
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                  placeholder="e.g., Revenue"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Y-Axis Min</Label>
                <Input
                  type="number"
                  value={config.axis?.yAxisMin ?? ""}
                  onChange={(e) =>
                    updateAxis("yAxisMin", e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                  placeholder="Auto"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Y-Axis Max</Label>
                <Input
                  type="number"
                  value={config.axis?.yAxisMax ?? ""}
                  onChange={(e) =>
                    updateAxis("yAxisMax", e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                  placeholder="Auto"
                />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-primary transition-colors">
                  <Switch
                    checked={config.axis?.autoScaleY ?? true}
                    onCheckedChange={(v) => updateAxis("autoScaleY", v)}
                    className="cursor-pointer"
                  />
                  Auto Scale
                </label>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
              <Switch
                checked={config.axis?.logScaleY ?? false}
                onCheckedChange={(v) => updateAxis("logScaleY", v)}
                className="cursor-pointer"
              />
              Logarithmic Y-Axis
            </label>
          </div>
        )}

        {/* BAR CHART SPECIFIC */}
        {config.core.chartType === "bar" && (
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Bar Chart Settings
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Orientation</Label>
                <Select
                  value={config.barConfig?.barOrientation || "vertical"}
                  onValueChange={(v: BarOrientation) => updateBarConfig("barOrientation", v)}
                >
                  <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="vertical" className="cursor-pointer">Vertical</SelectItem>
                    <SelectItem value="horizontal" className="cursor-pointer">Horizontal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Sort Order</Label>
                <Select
                  value={config.barConfig?.sortOrder || "none"}
                  onValueChange={(v: SortOrder) => updateBarConfig("sortOrder", v)}
                >
                  <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="none" className="cursor-pointer">None</SelectItem>
                    <SelectItem value="asc" className="cursor-pointer">Ascending</SelectItem>
                    <SelectItem value="desc" className="cursor-pointer">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch
                  checked={config.barConfig?.stacked ?? false}
                  onCheckedChange={(v) => updateBarConfig("stacked", v)}
                  className="cursor-pointer"
                />
                Stacked
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch
                  checked={config.barConfig?.grouped ?? false}
                  onCheckedChange={(v) => updateBarConfig("grouped", v)}
                  className="cursor-pointer"
                />
                Grouped
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch
                  checked={config.barConfig?.showDataLabels ?? false}
                  onCheckedChange={(v) => updateBarConfig("showDataLabels", v)}
                  className="cursor-pointer"
                />
                Data Labels
              </label>
            </div>
            {config.barConfig?.showDataLabels && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground cursor-pointer">Label Position</Label>
                  <Select
                    value={config.barConfig?.dataLabelPosition || "top"}
                    onValueChange={(v: DataLabelPosition) => updateBarConfig("dataLabelPosition", v)}
                  >
                    <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="inside" className="cursor-pointer">Inside</SelectItem>
                      <SelectItem value="top" className="cursor-pointer">Top</SelectItem>
                      <SelectItem value="outside" className="cursor-pointer">Outside</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground cursor-pointer">Label Format</Label>
                  <Select
                    value={config.barConfig?.dataLabelFormat || "abbreviated"}
                    onValueChange={(v: DataLabelFormat) => updateBarConfig("dataLabelFormat", v)}
                  >
                    <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="full" className="cursor-pointer">Full</SelectItem>
                      <SelectItem value="abbreviated" className="cursor-pointer">Abbreviated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Benchmark Value</Label>
                <Input
                  type="number"
                  value={config.barConfig?.benchmarkValue ?? ""}
                  onChange={(e) =>
                    updateBarConfig("benchmarkValue", e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Benchmark Label</Label>
                <Input
                  value={config.barConfig?.benchmarkLabel || ""}
                  onChange={(e) => updateBarConfig("benchmarkLabel", e.target.value)}
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                  placeholder="e.g., Target"
                />
              </div>
            </div>
          </div>
        )}

        {/* LINE CHART SPECIFIC */}
        {config.core.chartType === "line" && (
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <LineChartIcon className="h-4 w-4" /> Line Chart Settings
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Line Style</Label>
                <Select
                  value={config.lineConfig?.lineStyle || "solid"}
                  onValueChange={(v: LineStyle) => updateLineConfig("lineStyle", v)}
                >
                  <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="solid" className="cursor-pointer">Solid</SelectItem>
                    <SelectItem value="dashed" className="cursor-pointer">Dashed</SelectItem>
                    <SelectItem value="dotted" className="cursor-pointer">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Curve Type</Label>
                <Select
                  value={config.lineConfig?.curveType || "smooth"}
                  onValueChange={(v: CurveType) => updateLineConfig("curveType", v)}
                >
                  <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="linear" className="cursor-pointer">Linear</SelectItem>
                    <SelectItem value="smooth" className="cursor-pointer">Smooth</SelectItem>
                    <SelectItem value="step" className="cursor-pointer">Step</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Line Width</Label>
                <Input
                  type="number"
                  value={config.lineConfig?.lineWidth ?? 2}
                  onChange={(e) => updateLineConfig("lineWidth", Number(e.target.value) || 2)}
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                  min={1}
                  max={10}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch
                  checked={config.lineConfig?.showMarkers ?? true}
                  onCheckedChange={(v) => updateLineConfig("showMarkers", v)}
                  className="cursor-pointer"
                />
                Show Markers
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch
                  checked={config.lineConfig?.showDataLabels ?? false}
                  onCheckedChange={(v) => updateLineConfig("showDataLabels", v)}
                  className="cursor-pointer"
                />
                Data Labels
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Trendline</Label>
                <Select
                  value={config.lineConfig?.trendline || "none"}
                  onValueChange={(v: TrendlineType) => updateLineConfig("trendline", v)}
                >
                  <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="none" className="cursor-pointer">None</SelectItem>
                    <SelectItem value="linear" className="cursor-pointer">Linear</SelectItem>
                    <SelectItem value="exponential" className="cursor-pointer">Exponential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Moving Average Period</Label>
                <Input
                  type="number"
                  value={config.lineConfig?.movingAveragePeriod ?? ""}
                  onChange={(e) =>
                    updateLineConfig(
                      "movingAveragePeriod",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                  placeholder="e.g., 5"
                  min={2}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch
                  checked={config.lineConfig?.volatilityBand ?? false}
                  onCheckedChange={(v) => updateLineConfig("volatilityBand", v)}
                  className="cursor-pointer"
                />
                Volatility Band
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch
                  checked={config.lineConfig?.confidenceInterval ?? false}
                  onCheckedChange={(v) => updateLineConfig("confidenceInterval", v)}
                  className="cursor-pointer"
                />
                Confidence Interval
              </label>
            </div>
          </div>
        )}

        {/* AREA CHART SPECIFIC */}
        {config.core.chartType === "area" && (
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Area Chart Settings
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Fill Opacity</Label>
                <Input
                  type="number"
                  value={config.areaConfig?.fillOpacity ?? 0.6}
                  onChange={(e) =>
                    updateAreaConfig("fillOpacity", Math.min(1, Math.max(0, parseFloat(e.target.value) || 0.6)))
                  }
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Baseline Value</Label>
                <Input
                  type="number"
                  value={config.areaConfig?.baselineValue ?? 0}
                  onChange={(e) => updateAreaConfig("baselineValue", Number(e.target.value) || 0)}
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch
                  checked={config.areaConfig?.stacked ?? false}
                  onCheckedChange={(v) => updateAreaConfig("stacked", v)}
                  className="cursor-pointer"
                />
                Stacked
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch
                  checked={config.areaConfig?.overlayLine ?? true}
                  onCheckedChange={(v) => updateAreaConfig("overlayLine", v)}
                  className="cursor-pointer"
                />
                Overlay Line
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch
                  checked={config.areaConfig?.overlayBenchmark ?? false}
                  onCheckedChange={(v) => updateAreaConfig("overlayBenchmark", v)}
                  className="cursor-pointer"
                />
                Overlay Benchmark
              </label>
            </div>
          </div>
        )}

        {/* PIE CHART SPECIFIC */}
        {config.core.chartType === "pie" && (
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" /> Pie Chart Settings
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Start Angle</Label>
                <Input
                  type="number"
                  value={config.pieConfig?.startAngle ?? 0}
                  onChange={(e) => updatePieConfig("startAngle", Number(e.target.value))}
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                  min={0}
                  max={360}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">End Angle</Label>
                <Input
                  type="number"
                  value={config.pieConfig?.endAngle ?? 360}
                  onChange={(e) => updatePieConfig("endAngle", Number(e.target.value))}
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                  min={0}
                  max={360}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Min Slice %</Label>
                <Input
                  type="number"
                  value={config.pieConfig?.minSliceThreshold ?? 2}
                  onChange={(e) => updatePieConfig("minSliceThreshold", Number(e.target.value))}
                  className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
                  min={0}
                  max={100}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Label Position</Label>
                <Select
                  value={config.pieConfig?.labelPosition || "outside"}
                  onValueChange={(v: PieLabelPosition) => updatePieConfig("labelPosition", v)}
                >
                  <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="inside" className="cursor-pointer">Inside</SelectItem>
                    <SelectItem value="outside" className="cursor-pointer">Outside</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground cursor-pointer">Sort Slices</Label>
                <Select
                  value={config.pieConfig?.sortSlices || "desc"}
                  onValueChange={(v: SortOrder) => updatePieConfig("sortSlices", v)}
                >
                  <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="none" className="cursor-pointer">None</SelectItem>
                    <SelectItem value="asc" className="cursor-pointer">Ascending</SelectItem>
                    <SelectItem value="desc" className="cursor-pointer">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch checked={config.pieConfig?.showPercentages ?? true} onCheckedChange={(v) => updatePieConfig("showPercentages", v)} className="cursor-pointer" />
                Show Percentages
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch checked={config.pieConfig?.showValues ?? false} onCheckedChange={(v) => updatePieConfig("showValues", v)} className="cursor-pointer" />
                Show Values
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch checked={config.pieConfig?.leaderLines ?? true} onCheckedChange={(v) => updatePieConfig("leaderLines", v)} className="cursor-pointer" />
                Leader Lines
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                <Switch checked={config.pieConfig?.explodeSlice ?? false} onCheckedChange={(v) => updatePieConfig("explodeSlice", v)} className="cursor-pointer" />
                Explode Slice
              </label>
            </div>
          </div>
        )}

        {/* DONUT CHART SPECIFIC */}
        {config.core.chartType === "donut" && (
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Circle className="h-4 w-4" /> Donut Chart Settings
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Donut Thickness</Label>
                <Input
                  type="number"
                  value={config.donutConfig?.donutThickness ?? 30}
                  onChange={(e) => updateDonutConfig("donutThickness", Number(e.target.value))}
                  className="mt-1"
                  min={10}
                  max={100}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Inner Radius</Label>
                <Input
                  type="number"
                  value={config.donutConfig?.innerRadius ?? 60}
                  onChange={(e) => updateDonutConfig("innerRadius", Number(e.target.value))}
                  className="mt-1"
                  min={20}
                  max={100}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Center Label (Primary)</Label>
                <Input
                  value={config.donutConfig?.centerLabelPrimary || ""}
                  onChange={(e) => updateDonutConfig("centerLabelPrimary", e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Total AUM"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Center Label (Secondary)</Label>
                <Input
                  value={config.donutConfig?.centerLabelSecondary || ""}
                  onChange={(e) => updateDonutConfig("centerLabelSecondary", e.target.value)}
                  className="mt-1"
                  placeholder="e.g., £1.2M"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.donutConfig?.totalValueDisplay ?? true}
                  onCheckedChange={(v) => updateDonutConfig("totalValueDisplay", v)}
                />
                Display Total
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.donutConfig?.showPercentages ?? true}
                  onCheckedChange={(v) => updateDonutConfig("showPercentages", v)}
                />
                Show Percentages
              </label>
            </div>
          </div>
        )}

        {/* RADIAL CHART SPECIFIC */}
        {config.core.chartType === "radial" && (
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" /> Radial Chart Settings
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Axis Min</Label>
                <Input
                  type="number"
                  value={config.radialConfig?.axisMin ?? 0}
                  onChange={(e) => updateRadialConfig("axisMin", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Axis Max</Label>
                <Input
                  type="number"
                  value={config.radialConfig?.axisMax ?? 100}
                  onChange={(e) => updateRadialConfig("axisMax", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Grid Shape</Label>
                <Select
                  value={config.radialConfig?.gridShape || "polygon"}
                  onValueChange={(v: GridShape) => updateRadialConfig("gridShape", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Line Width</Label>
                <Input
                  type="number"
                  value={config.radialConfig?.lineWidth ?? 2}
                  onChange={(e) => updateRadialConfig("lineWidth", Number(e.target.value))}
                  className="mt-1"
                  min={1}
                  max={10}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Fill Opacity</Label>
                <Input
                  type="number"
                  value={config.radialConfig?.fillOpacity ?? 0.3}
                  onChange={(e) =>
                    updateRadialConfig("fillOpacity", Math.min(1, Math.max(0, parseFloat(e.target.value) || 0.3)))
                  }
                  className="mt-1"
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.radialConfig?.autoScaleAxes ?? true}
                  onCheckedChange={(v) => updateRadialConfig("autoScaleAxes", v)}
                />
                Auto Scale Axes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.radialConfig?.showAxisValues ?? true}
                  onCheckedChange={(v) => updateRadialConfig("showAxisValues", v)}
                />
                Show Axis Values
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.radialConfig?.compareBenchmark ?? false}
                  onCheckedChange={(v) => updateRadialConfig("compareBenchmark", v)}
                />
                Compare Benchmark
              </label>
            </div>
          </div>
        )}
      </TabsContent>

      {/* METADATA TAB */}
      <TabsContent value="meta" className="space-y-4 focus-visible:outline-none">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="cursor-pointer">Data Source</Label>
            <Input
              value={config.metadata?.dataSource || ""}
              onChange={(e) => updateMetadata("dataSource", e.target.value)}
              className="cursor-text hover:border-primary/50 focus:border-primary transition-colors"
              placeholder="e.g., Bloomberg, Internal Data"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="cursor-pointer">As Of Date</Label>
            <Input
              type="date"
              value={config.metadata?.asOfDate || ""}
              onChange={(e) => updateMetadata("asOfDate", e.target.value)}
              className="cursor-pointer hover:border-primary/50 focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="cursor-pointer">Frequency</Label>
            <Select
              value={config.metadata?.frequency || "monthly"}
              onValueChange={(v: DataFrequency) => updateMetadata("frequency", v)}
            >
              <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="daily" className="cursor-pointer">Daily</SelectItem>
                <SelectItem value="weekly" className="cursor-pointer">Weekly</SelectItem>
                <SelectItem value="monthly" className="cursor-pointer">Monthly</SelectItem>
                <SelectItem value="quarterly" className="cursor-pointer">Quarterly</SelectItem>
                <SelectItem value="annual" className="cursor-pointer">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="cursor-pointer">Confidence Level</Label>
            <Select
              value={config.metadata?.confidenceLevel || "high"}
              onValueChange={(v: ConfidenceLevel) => updateMetadata("confidenceLevel", v)}
            >
              <SelectTrigger className="cursor-pointer hover:border-primary/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="high" className="cursor-pointer">High</SelectItem>
                <SelectItem value="medium" className="cursor-pointer">Medium</SelectItem>
                <SelectItem value="low" className="cursor-pointer">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="cursor-pointer">Footnote</Label>
          <Textarea
            value={config.metadata?.footnote || ""}
            onChange={(e) => updateMetadata("footnote", e.target.value)}
            className="cursor-text hover:border-primary/50 focus:border-primary transition-colors resize-y"
            placeholder="Additional notes or clarifications"
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="cursor-pointer">Disclaimer Text</Label>
          <Textarea
            value={config.metadata?.disclaimerText || ""}
            onChange={(e) => updateMetadata("disclaimerText", e.target.value)}
            className="cursor-text hover:border-primary/50 focus:border-primary transition-colors resize-y"
            placeholder="Legal disclaimer or compliance text"
            rows={2}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
