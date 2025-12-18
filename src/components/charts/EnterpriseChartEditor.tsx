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
      <TabsList className="grid w-full grid-cols-6 mb-4">
        <TabsTrigger value="core" className="text-xs">
          <Settings2 className="h-3 w-3 mr-1" /> Core
        </TabsTrigger>
        <TabsTrigger value="data" className="text-xs">
          <Database className="h-3 w-3 mr-1" /> Data
        </TabsTrigger>
        <TabsTrigger value="format" className="text-xs">
          <LayoutGrid className="h-3 w-3 mr-1" /> Format
        </TabsTrigger>
        <TabsTrigger value="visual" className="text-xs">
          <Palette className="h-3 w-3 mr-1" /> Visual
        </TabsTrigger>
        <TabsTrigger value="chart" className="text-xs">
          <BarChart3 className="h-3 w-3 mr-1" /> Chart
        </TabsTrigger>
        <TabsTrigger value="meta" className="text-xs">
          <FileText className="h-3 w-3 mr-1" /> Meta
        </TabsTrigger>
      </TabsList>

      {/* CORE IDENTITY TAB */}
      <TabsContent value="core" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Chart Type</Label>
            <Select
              value={config.core.chartType}
              onValueChange={(v: ChartType) => updateCore("chartType", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["bar", "line", "area", "pie", "donut", "radial"] as ChartType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {chartTypeIcons[type]}
                      {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Chart Title</Label>
            <Input
              value={config.core.chartTitle}
              onChange={(e) => updateCore("chartTitle", e.target.value)}
              className="mt-1.5"
              placeholder="Enter chart title"
            />
          </div>
        </div>

        <div>
          <Label>Subtitle (Optional)</Label>
          <Input
            value={config.core.subtitle || ""}
            onChange={(e) => updateCore("subtitle", e.target.value)}
            className="mt-1.5"
            placeholder="Enter subtitle"
          />
        </div>

        <div>
          <Label>Description (Accessibility / Tooltip)</Label>
          <Textarea
            value={config.core.description || ""}
            onChange={(e) => updateCore("description", e.target.value)}
            className="mt-1.5"
            placeholder="Describe the chart for accessibility"
            rows={2}
          />
        </div>

        <div className="border-t pt-4">
          <Label className="flex items-center gap-2 mb-2">
            <Ruler className="h-4 w-4" />
            Dimensions & Layout
          </Label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Width (px)</Label>
              <Input
                type="number"
                value={config.dimensions.widthPx}
                onChange={(e) => updateDimensions("widthPx", Math.max(200, Number(e.target.value)))}
                className="mt-1"
                min={200}
                max={1200}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Height (px)</Label>
              <Input
                type="number"
                value={config.dimensions.heightPx}
                onChange={(e) => updateDimensions("heightPx", Math.max(150, Number(e.target.value)))}
                className="mt-1"
                min={150}
                max={800}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm pb-2">
                <Switch
                  checked={config.dimensions.responsive}
                  onCheckedChange={(v) => updateDimensions("responsive", v)}
                />
                Responsive
              </label>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* DATA TAB */}
      <TabsContent value="data" className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Chart Data</Label>
          <Button size="sm" variant="outline" onClick={addDataRow} className="gap-1">
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
              className="grid grid-cols-[40px_1fr_100px_100px_80px_32px] gap-2 items-center bg-muted/50 p-2 rounded-lg"
            >
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-8 h-8 rounded-md border-2 border-border hover:scale-105 transition-transform"
                    style={{ backgroundColor: item.color || defaultColors[0] }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="grid grid-cols-5 gap-1">
                    {defaultColors.map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => updateDataField(item._id, "color", color)}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={item.color || "#3b82f6"}
                    onChange={(e) => updateDataField(item._id, "color", e.target.value)}
                    className="w-full h-8 mt-2"
                  />
                </PopoverContent>
              </Popover>
              <Input
                value={item.label}
                onChange={(e) => updateDataField(item._id, "label", e.target.value)}
                className="h-8 text-sm"
                placeholder="Label"
              />
              <Input
                type="number"
                value={item.value}
                onChange={(e) => updateDataField(item._id, "value", e.target.value)}
                className="h-8 text-sm"
              />
              <Input
                value={item.series || ""}
                onChange={(e) => updateDataField(item._id, "series", e.target.value)}
                className="h-8 text-sm"
                placeholder="Series"
              />
              <Input
                value={item.date || ""}
                onChange={(e) => updateDataField(item._id, "date", e.target.value)}
                className="h-8 text-sm"
                placeholder="Date"
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive"
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
      <TabsContent value="format" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Currency</Label>
            <Select
              value={config.dataFormatting.currency}
              onValueChange={(v: CurrencyType) => updateDataFormatting("currency", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="GBP">£ GBP</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
                <SelectItem value="EUR">€ EUR</SelectItem>
                <SelectItem value="JPY">¥ JPY</SelectItem>
                <SelectItem value="CHF">CHF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Unit</Label>
            <Select
              value={config.dataFormatting.unit}
              onValueChange={(v: UnitType) => updateDataFormatting("unit", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="%">Percentage (%)</SelectItem>
                <SelectItem value="bps">Basis Points (bps)</SelectItem>
                <SelectItem value="years">Years</SelectItem>
                <SelectItem value="multiple">Multiple (x)</SelectItem>
                <SelectItem value="index">Index</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Value Scale</Label>
            <Select
              value={config.dataFormatting.valueScale}
              onValueChange={(v: ValueScale) => updateDataFormatting("valueScale", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="k">Thousands (K)</SelectItem>
                <SelectItem value="m">Millions (M)</SelectItem>
                <SelectItem value="bn">Billions (B)</SelectItem>
                <SelectItem value="tn">Trillions (T)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Decimal Places</Label>
            <Input
              type="number"
              value={config.dataFormatting.decimalPlaces}
              onChange={(e) => updateDataFormatting("decimalPlaces", parseInt(e.target.value) || 0)}
              className="mt-1.5"
              min={0}
              max={6}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Negative Format</Label>
            <Select
              value={config.dataFormatting.negativeFormat}
              onValueChange={(v: NegativeFormat) => updateDataFormatting("negativeFormat", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minus">Minus Sign (-100)</SelectItem>
                <SelectItem value="parentheses">Parentheses (100)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Null Value Handling</Label>
            <Select
              value={config.dataFormatting.nullValueHandling}
              onValueChange={(v: NullHandling) => updateDataFormatting("nullValueHandling", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hide">Hide</SelectItem>
                <SelectItem value="zero">Show as Zero</SelectItem>
                <SelectItem value="gap">Show Gap (—)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={config.dataFormatting.thousandsSeparator}
            onCheckedChange={(v) => updateDataFormatting("thousandsSeparator", v)}
          />
          Thousands Separator (1,000)
        </label>
      </TabsContent>

      {/* VISUAL CONTROLS TAB */}
      <TabsContent value="visual" className="space-y-4">
        <div>
          <Label>Color Palette</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(Object.keys(colorPalettes) as ColorPalette[])
              .filter((k) => k !== "custom")
              .map((palette) => (
                <button
                  key={palette}
                  className={`h-10 rounded-md overflow-hidden border-2 transition-all ${
                    config.visualControls.colorPalette === palette
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50"
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
          <div>
            <Label>Opacity</Label>
            <Input
              type="number"
              value={config.visualControls.opacity}
              onChange={(e) =>
                updateVisualControls("opacity", Math.min(1, Math.max(0, parseFloat(e.target.value) || 1)))
              }
              className="mt-1.5"
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          <div>
            <Label>Animation Duration (ms)</Label>
            <Input
              type="number"
              value={config.visualControls.animationDurationMs}
              onChange={(e) =>
                updateVisualControls("animationDurationMs", parseInt(e.target.value) || 800)
              }
              className="mt-1.5"
              min={0}
              max={5000}
              step={100}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={config.visualControls.gradientEnabled}
              onCheckedChange={(v) => updateVisualControls("gradientEnabled", v)}
            />
            Enable Gradients
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={config.visualControls.animationEnabled}
              onCheckedChange={(v) => updateVisualControls("animationEnabled", v)}
            />
            Enable Animations
          </label>
        </div>
      </TabsContent>

      {/* CHART-SPECIFIC TAB */}
      <TabsContent value="chart" className="space-y-4">
        {/* AXIS SETTINGS (for bar, line, area) */}
        {isAxisChart && (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Axis Configuration</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">X-Axis Label</Label>
                <Input
                  value={config.axis?.xAxisLabel || ""}
                  onChange={(e) => updateAxis("xAxisLabel", e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Quarters"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Y-Axis Label</Label>
                <Input
                  value={config.axis?.yAxisLabel || ""}
                  onChange={(e) => updateAxis("yAxisLabel", e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Revenue"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Y-Axis Min</Label>
                <Input
                  type="number"
                  value={config.axis?.yAxisMin ?? ""}
                  onChange={(e) =>
                    updateAxis("yAxisMin", e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="mt-1"
                  placeholder="Auto"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Y-Axis Max</Label>
                <Input
                  type="number"
                  value={config.axis?.yAxisMax ?? ""}
                  onChange={(e) =>
                    updateAxis("yAxisMax", e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="mt-1"
                  placeholder="Auto"
                />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <label className="flex items-center gap-2 text-xs">
                  <Switch
                    checked={config.axis?.autoScaleY ?? true}
                    onCheckedChange={(v) => updateAxis("autoScaleY", v)}
                  />
                  Auto Scale
                </label>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={config.axis?.logScaleY ?? false}
                onCheckedChange={(v) => updateAxis("logScaleY", v)}
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
              <div>
                <Label className="text-xs text-muted-foreground">Orientation</Label>
                <Select
                  value={config.barConfig?.barOrientation || "vertical"}
                  onValueChange={(v: BarOrientation) => updateBarConfig("barOrientation", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sort Order</Label>
                <Select
                  value={config.barConfig?.sortOrder || "none"}
                  onValueChange={(v: SortOrder) => updateBarConfig("sortOrder", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.barConfig?.stacked ?? false}
                  onCheckedChange={(v) => updateBarConfig("stacked", v)}
                />
                Stacked
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.barConfig?.grouped ?? false}
                  onCheckedChange={(v) => updateBarConfig("grouped", v)}
                />
                Grouped
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.barConfig?.showDataLabels ?? false}
                  onCheckedChange={(v) => updateBarConfig("showDataLabels", v)}
                />
                Data Labels
              </label>
            </div>
            {config.barConfig?.showDataLabels && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Label Position</Label>
                  <Select
                    value={config.barConfig?.dataLabelPosition || "top"}
                    onValueChange={(v: DataLabelPosition) => updateBarConfig("dataLabelPosition", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inside">Inside</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="outside">Outside</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Label Format</Label>
                  <Select
                    value={config.barConfig?.dataLabelFormat || "abbreviated"}
                    onValueChange={(v: DataLabelFormat) => updateBarConfig("dataLabelFormat", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full</SelectItem>
                      <SelectItem value="abbreviated">Abbreviated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Benchmark Value</Label>
                <Input
                  type="number"
                  value={config.barConfig?.benchmarkValue ?? ""}
                  onChange={(e) =>
                    updateBarConfig("benchmarkValue", e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="mt-1"
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Benchmark Label</Label>
                <Input
                  value={config.barConfig?.benchmarkLabel || ""}
                  onChange={(e) => updateBarConfig("benchmarkLabel", e.target.value)}
                  className="mt-1"
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
              <div>
                <Label className="text-xs text-muted-foreground">Line Style</Label>
                <Select
                  value={config.lineConfig?.lineStyle || "solid"}
                  onValueChange={(v: LineStyle) => updateLineConfig("lineStyle", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Curve Type</Label>
                <Select
                  value={config.lineConfig?.curveType || "smooth"}
                  onValueChange={(v: CurveType) => updateLineConfig("curveType", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="smooth">Smooth</SelectItem>
                    <SelectItem value="step">Step</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Line Width</Label>
                <Input
                  type="number"
                  value={config.lineConfig?.lineWidth ?? 2}
                  onChange={(e) => updateLineConfig("lineWidth", Number(e.target.value) || 2)}
                  className="mt-1"
                  min={1}
                  max={10}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.lineConfig?.showMarkers ?? true}
                  onCheckedChange={(v) => updateLineConfig("showMarkers", v)}
                />
                Show Markers
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.lineConfig?.showDataLabels ?? false}
                  onCheckedChange={(v) => updateLineConfig("showDataLabels", v)}
                />
                Data Labels
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Trendline</Label>
                <Select
                  value={config.lineConfig?.trendline || "none"}
                  onValueChange={(v: TrendlineType) => updateLineConfig("trendline", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="exponential">Exponential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Moving Average Period</Label>
                <Input
                  type="number"
                  value={config.lineConfig?.movingAveragePeriod ?? ""}
                  onChange={(e) =>
                    updateLineConfig(
                      "movingAveragePeriod",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="mt-1"
                  placeholder="e.g., 5"
                  min={2}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.lineConfig?.volatilityBand ?? false}
                  onCheckedChange={(v) => updateLineConfig("volatilityBand", v)}
                />
                Volatility Band
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.lineConfig?.confidenceInterval ?? false}
                  onCheckedChange={(v) => updateLineConfig("confidenceInterval", v)}
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
              <div>
                <Label className="text-xs text-muted-foreground">Fill Opacity</Label>
                <Input
                  type="number"
                  value={config.areaConfig?.fillOpacity ?? 0.6}
                  onChange={(e) =>
                    updateAreaConfig("fillOpacity", Math.min(1, Math.max(0, parseFloat(e.target.value) || 0.6)))
                  }
                  className="mt-1"
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Baseline Value</Label>
                <Input
                  type="number"
                  value={config.areaConfig?.baselineValue ?? 0}
                  onChange={(e) => updateAreaConfig("baselineValue", Number(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.areaConfig?.stacked ?? false}
                  onCheckedChange={(v) => updateAreaConfig("stacked", v)}
                />
                Stacked
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.areaConfig?.overlayLine ?? true}
                  onCheckedChange={(v) => updateAreaConfig("overlayLine", v)}
                />
                Overlay Line
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.areaConfig?.overlayBenchmark ?? false}
                  onCheckedChange={(v) => updateAreaConfig("overlayBenchmark", v)}
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
              <div>
                <Label className="text-xs text-muted-foreground">Start Angle</Label>
                <Input
                  type="number"
                  value={config.pieConfig?.startAngle ?? 0}
                  onChange={(e) => updatePieConfig("startAngle", Number(e.target.value))}
                  className="mt-1"
                  min={0}
                  max={360}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Angle</Label>
                <Input
                  type="number"
                  value={config.pieConfig?.endAngle ?? 360}
                  onChange={(e) => updatePieConfig("endAngle", Number(e.target.value))}
                  className="mt-1"
                  min={0}
                  max={360}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Min Slice %</Label>
                <Input
                  type="number"
                  value={config.pieConfig?.minSliceThreshold ?? 2}
                  onChange={(e) => updatePieConfig("minSliceThreshold", Number(e.target.value))}
                  className="mt-1"
                  min={0}
                  max={100}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Label Position</Label>
                <Select
                  value={config.pieConfig?.labelPosition || "outside"}
                  onValueChange={(v: PieLabelPosition) => updatePieConfig("labelPosition", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inside">Inside</SelectItem>
                    <SelectItem value="outside">Outside</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sort Slices</Label>
                <Select
                  value={config.pieConfig?.sortSlices || "desc"}
                  onValueChange={(v: SortOrder) => updatePieConfig("sortSlices", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.pieConfig?.showPercentages ?? true}
                  onCheckedChange={(v) => updatePieConfig("showPercentages", v)}
                />
                Show Percentages
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.pieConfig?.showValues ?? false}
                  onCheckedChange={(v) => updatePieConfig("showValues", v)}
                />
                Show Values
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.pieConfig?.leaderLines ?? true}
                  onCheckedChange={(v) => updatePieConfig("leaderLines", v)}
                />
                Leader Lines
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={config.pieConfig?.explodeSlice ?? false}
                  onCheckedChange={(v) => updatePieConfig("explodeSlice", v)}
                />
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
      <TabsContent value="meta" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Data Source</Label>
            <Input
              value={config.metadata?.dataSource || ""}
              onChange={(e) => updateMetadata("dataSource", e.target.value)}
              className="mt-1.5"
              placeholder="e.g., Bloomberg, Internal Data"
            />
          </div>
          <div>
            <Label>As Of Date</Label>
            <Input
              type="date"
              value={config.metadata?.asOfDate || ""}
              onChange={(e) => updateMetadata("asOfDate", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Frequency</Label>
            <Select
              value={config.metadata?.frequency || "monthly"}
              onValueChange={(v: DataFrequency) => updateMetadata("frequency", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Confidence Level</Label>
            <Select
              value={config.metadata?.confidenceLevel || "high"}
              onValueChange={(v: ConfidenceLevel) => updateMetadata("confidenceLevel", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Footnote</Label>
          <Textarea
            value={config.metadata?.footnote || ""}
            onChange={(e) => updateMetadata("footnote", e.target.value)}
            className="mt-1.5"
            placeholder="Additional notes or clarifications"
            rows={2}
          />
        </div>

        <div>
          <Label>Disclaimer Text</Label>
          <Textarea
            value={config.metadata?.disclaimerText || ""}
            onChange={(e) => updateMetadata("disclaimerText", e.target.value)}
            className="mt-1.5"
            placeholder="Legal disclaimer or compliance text"
            rows={2}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
