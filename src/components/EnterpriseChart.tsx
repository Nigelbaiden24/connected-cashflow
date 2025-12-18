import { useState, useEffect, useMemo } from "react";
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
  ReferenceLine,
  LabelList,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EnterpriseChartEditor } from "@/components/charts/EnterpriseChartEditor";
import {
  EnterpriseChartConfig,
  EnterpriseDataItem,
  ChartType,
  formatValue,
  getDefaultEnterpriseConfig,
  legacyToEnterpriseConfig,
  DataFormattingConfig,
} from "@/types/enterpriseChart";

// Legacy interface for backward compatibility
export interface ChartDataItem {
  label: string;
  value: number;
  color: string;
}

export interface LegacyChartConfig {
  type: ChartType;
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
  config: LegacyChartConfig | EnterpriseChartConfig;
  width?: number;
  height?: number;
  onConfigChange?: (config: LegacyChartConfig | EnterpriseChartConfig) => void;
  onSizeChange?: (width: number, height: number) => void;
  editable?: boolean;
  useEnterpriseConfig?: boolean;
}

// Type guard
function isEnterpriseConfig(config: any): config is EnterpriseChartConfig {
  return config && typeof config === "object" && "core" in config && "dimensions" in config;
}

// Convert legacy to enterprise
function normalizeConfig(config: LegacyChartConfig | EnterpriseChartConfig): EnterpriseChartConfig {
  if (isEnterpriseConfig(config)) {
    return config;
  }
  return legacyToEnterpriseConfig(config);
}

// Convert enterprise back to legacy for backward compatibility
function enterpriseToLegacy(config: EnterpriseChartConfig): LegacyChartConfig {
  return {
    type: config.core.chartType,
    title: config.core.chartTitle,
    data: config.data.map((d) => ({
      label: d.label,
      value: d.value,
      color: d.color || "#3b82f6",
    })),
    showGrid: true,
    showLegend: true,
    gradientEnabled: config.visualControls.gradientEnabled,
    animationDuration: config.visualControls.animationDurationMs,
    width: config.dimensions.widthPx,
    height: config.dimensions.heightPx,
    xAxisLabel: config.axis?.xAxisLabel,
    yAxisLabel: config.axis?.yAxisLabel,
  };
}

const CustomTooltip = ({
  active,
  payload,
  label,
  formatting,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatting?: DataFormattingConfig;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3 animate-in fade-in-0 zoom-in-95 duration-200">
        <p className="font-semibold text-sm text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {formatting ? formatValue(entry.value, formatting) : entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap justify-center gap-4 mt-2">
    {payload?.map((entry: any, index: number) => (
      <div key={index} className="flex items-center gap-2 text-sm">
        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
        <span className="text-muted-foreground">{entry.value}</span>
      </div>
    ))}
  </div>
);

export function EnterpriseChart({
  config: inputConfig,
  width = 500,
  height = 300,
  onConfigChange,
  onSizeChange,
  editable = true,
  useEnterpriseConfig = false,
}: EnterpriseChartProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editConfig, setEditConfig] = useState<EnterpriseChartConfig>(() =>
    normalizeConfig(inputConfig)
  );

  const config = useMemo(() => normalizeConfig(inputConfig), [inputConfig]);

  useEffect(() => {
    setEditConfig(normalizeConfig(inputConfig));
  }, [inputConfig]);

  // Auto-apply changes in real-time when editConfig changes
  const handleConfigUpdate = (newConfig: EnterpriseChartConfig) => {
    setEditConfig(newConfig);
    
    // Apply dimension changes immediately
    const newDimensions = newConfig.dimensions;
    if (newDimensions.widthPx !== width || newDimensions.heightPx !== height) {
      onSizeChange?.(newDimensions.widthPx, newDimensions.heightPx);
    }

    // Apply config changes immediately
    if (useEnterpriseConfig || isEnterpriseConfig(inputConfig)) {
      onConfigChange?.(newConfig);
    } else {
      onConfigChange?.(enterpriseToLegacy(newConfig));
    }
  };

  const chartData = useMemo(() => {
    let data = config.data.map((d) => ({
      name: d.label,
      value: d.value,
      fill: d.color || "#3b82f6",
      series: d.series,
      date: d.date,
      confidence: d.confidence,
    }));

    // Apply sorting for bar charts
    if (config.core.chartType === "bar" && config.barConfig?.sortOrder !== "none") {
      data = [...data].sort((a, b) =>
        config.barConfig?.sortOrder === "asc" ? a.value - b.value : b.value - a.value
      );
    }

    // Apply sorting for pie/donut charts
    if (
      (config.core.chartType === "pie" || config.core.chartType === "donut") &&
      config.pieConfig?.sortSlices !== "none"
    ) {
      data = [...data].sort((a, b) =>
        config.pieConfig?.sortSlices === "asc" ? a.value - b.value : b.value - a.value
      );
    }

    return data;
  }, [config]);

  const animationDuration = config.visualControls.animationEnabled
    ? config.visualControls.animationDurationMs
    : 0;
  const isHorizontalBar = config.barConfig?.barOrientation === "horizontal";

  const getCurveType = () => {
    switch (config.lineConfig?.curveType) {
      case "linear":
        return "linear";
      case "step":
        return "step";
      default:
        return "monotone";
    }
  };

  const getStrokeDasharray = (style?: string) => {
    switch (style) {
      case "dashed":
        return "5 5";
      case "dotted":
        return "2 2";
      default:
        return undefined;
    }
  };

  const renderChart = () => {
    const commonMargin = { top: 20, right: 30, left: 20, bottom: 20 };

    switch (config.core.chartType) {
      case "bar":
        return (
          <BarChart
            data={chartData}
            margin={commonMargin}
            layout={isHorizontalBar ? "vertical" : "horizontal"}
          >
            <defs>
              {chartData.map((entry, index) => (
                <linearGradient
                  key={`gradient-${index}`}
                  id={`barGradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                  <stop
                    offset="100%"
                    stopColor={entry.fill}
                    stopOpacity={config.visualControls.opacity * 0.6}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            {isHorizontalBar ? (
              <>
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  domain={[
                    config.axis?.yAxisMin ?? "auto",
                    config.axis?.yAxisMax ?? "auto",
                  ]}
                  scale={config.axis?.logScaleY ? "log" : "auto"}
                  label={
                    config.axis?.xAxisLabel
                      ? { value: config.axis.xAxisLabel, position: "bottom", offset: 0 }
                      : undefined
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  width={80}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  label={
                    config.axis?.xAxisLabel
                      ? { value: config.axis.xAxisLabel, position: "bottom", offset: 0 }
                      : undefined
                  }
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  domain={[
                    config.axis?.yAxisMin ?? "auto",
                    config.axis?.yAxisMax ?? "auto",
                  ]}
                  scale={config.axis?.logScaleY ? "log" : "auto"}
                  label={
                    config.axis?.yAxisLabel
                      ? { value: config.axis.yAxisLabel, angle: -90, position: "insideLeft" }
                      : undefined
                  }
                />
              </>
            )}
            <Tooltip
              content={<CustomTooltip formatting={config.dataFormatting} />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            />
            <Legend content={<CustomLegend />} />
            {config.barConfig?.benchmarkValue !== undefined && (
              <ReferenceLine
                y={config.barConfig.benchmarkValue}
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                label={config.barConfig.benchmarkLabel || "Benchmark"}
              />
            )}
            {config.barConfig?.targetLineValue !== undefined && (
              <ReferenceLine
                y={config.barConfig.targetLineValue}
                stroke="hsl(var(--primary))"
                strokeDasharray="3 3"
                label="Target"
              />
            )}
            <Bar
              dataKey="value"
              animationDuration={animationDuration}
              animationEasing="ease-out"
              radius={[6, 6, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    config.visualControls.gradientEnabled
                      ? `url(#barGradient-${index})`
                      : entry.fill
                  }
                  opacity={config.visualControls.opacity}
                />
              ))}
              {config.barConfig?.showDataLabels && (
                <LabelList
                  dataKey="value"
                  position={config.barConfig.dataLabelPosition || "top"}
                  formatter={(value: number) => formatValue(value, config.dataFormatting)}
                  fill="hsl(var(--foreground))"
                  fontSize={11}
                />
              )}
            </Bar>
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={chartData} margin={commonMargin}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                {chartData.map((entry, index) => (
                  <stop
                    key={index}
                    offset={`${(index / Math.max(chartData.length - 1, 1)) * 100}%`}
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
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={
                config.axis?.xAxisLabel
                  ? { value: config.axis.xAxisLabel, position: "bottom", offset: 0 }
                  : undefined
              }
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              domain={[config.axis?.yAxisMin ?? "auto", config.axis?.yAxisMax ?? "auto"]}
              scale={config.axis?.logScaleY ? "log" : "auto"}
              label={
                config.axis?.yAxisLabel
                  ? { value: config.axis.yAxisLabel, angle: -90, position: "insideLeft" }
                  : undefined
              }
            />
            <Tooltip content={<CustomTooltip formatting={config.dataFormatting} />} />
            <Legend content={<CustomLegend />} />
            <Line
              type={getCurveType()}
              dataKey="value"
              stroke={config.visualControls.gradientEnabled ? "url(#lineGradient)" : chartData[0]?.fill}
              strokeWidth={config.lineConfig?.lineWidth || 2}
              strokeDasharray={getStrokeDasharray(config.lineConfig?.lineStyle)}
              dot={
                config.lineConfig?.showMarkers
                  ? {
                      r: config.lineConfig?.markerSize || 4,
                      fill: "hsl(var(--background))",
                      strokeWidth: 2,
                      stroke: chartData[0]?.fill,
                    }
                  : false
              }
              activeDot={{ r: 8, fill: chartData[0]?.fill, filter: "url(#glow)" }}
              animationDuration={animationDuration}
              animationEasing="ease-out"
            >
              {config.lineConfig?.showDataLabels && (
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(value: number) => formatValue(value, config.dataFormatting)}
                  fill="hsl(var(--foreground))"
                  fontSize={10}
                />
              )}
            </Line>
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={chartData} margin={commonMargin}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartData[0]?.fill || "#3b82f6"} stopOpacity={config.areaConfig?.fillOpacity ?? 0.8} />
                <stop offset="50%" stopColor={chartData[0]?.fill || "#3b82f6"} stopOpacity={(config.areaConfig?.fillOpacity ?? 0.8) * 0.5} />
                <stop offset="100%" stopColor={chartData[0]?.fill || "#3b82f6"} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              domain={[config.axis?.yAxisMin ?? "auto", config.axis?.yAxisMax ?? "auto"]}
            />
            <Tooltip content={<CustomTooltip formatting={config.dataFormatting} />} />
            <Legend content={<CustomLegend />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={config.areaConfig?.overlayLine !== false ? chartData[0]?.fill || "#3b82f6" : "transparent"}
              strokeWidth={2}
              fill="url(#areaGradient)"
              animationDuration={animationDuration}
              animationEasing="ease-out"
            />
          </AreaChart>
        );

      case "pie":
      case "donut":
        const innerRadius = config.core.chartType === "donut" ? (config.donutConfig?.innerRadius || 60) : 0;
        const total = chartData.reduce((sum, d) => sum + d.value, 0);
        return (
          <PieChart>
            <defs>
              {chartData.map((entry, index) => (
                <linearGradient
                  key={`pieGradient-${index}`}
                  id={`pieGradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
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
              startAngle={config.pieConfig?.startAngle ?? 0}
              endAngle={config.pieConfig?.endAngle ?? 360}
              animationDuration={animationDuration}
              animationEasing="ease-out"
              label={({ name, percent, value }) => {
                const parts: string[] = [];
                if (config.pieConfig?.showPercentages !== false) {
                  parts.push(`${(percent * 100).toFixed(config.pieConfig?.percentageDecimalPlaces ?? 0)}%`);
                }
                if (config.pieConfig?.showValues) {
                  parts.push(formatValue(value, config.dataFormatting));
                }
                return parts.length > 0 ? `${name}: ${parts.join(" ")}` : name;
              }}
              labelLine={config.pieConfig?.leaderLines !== false ? { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 } : false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={config.visualControls.gradientEnabled ? `url(#pieGradient-${index})` : entry.fill}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  style={{ filter: "url(#shadow)" }}
                />
              ))}
            </Pie>
            {config.core.chartType === "donut" && config.donutConfig?.totalValueDisplay && (
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground"
              >
                <tspan x="50%" dy="-0.5em" fontSize="14" fontWeight="600">
                  {config.donutConfig?.centerLabelPrimary || "Total"}
                </tspan>
                <tspan x="50%" dy="1.5em" fontSize="18" fontWeight="700">
                  {config.donutConfig?.centerLabelSecondary || formatValue(total, config.dataFormatting)}
                </tspan>
              </text>
            )}
            <Tooltip content={<CustomTooltip formatting={config.dataFormatting} />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        );

      case "radial":
        const radialData = chartData.map((d) => ({ ...d }));
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
              background={{ fill: "hsl(var(--muted))" }}
              dataKey="value"
              animationDuration={animationDuration}
              animationEasing="ease-out"
              cornerRadius={10}
            >
              {radialData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} opacity={config.visualControls.opacity} />
              ))}
            </RadialBar>
            <Tooltip content={<CustomTooltip formatting={config.dataFormatting} />} />
            <Legend content={<CustomLegend />} iconType="circle" />
          </RadialBarChart>
        );

      default:
        return null;
    }
  };

  const actualWidth = config.dimensions.widthPx || width;
  const actualHeight = config.dimensions.heightPx || height;

  return (
    <div className="relative group">
      {/* Title & Subtitle */}
      {config.core.chartTitle && (
        <div className="text-center mb-2">
          <h3 className="font-semibold text-foreground text-lg">{config.core.chartTitle}</h3>
          {config.core.subtitle && (
            <p className="text-sm text-muted-foreground">{config.core.subtitle}</p>
          )}
        </div>
      )}

      {/* Chart */}
      <div
        className="w-full cursor-pointer transition-all duration-300 hover:shadow-lg rounded-lg"
        onClick={() => editable && setShowEditor(true)}
        style={{ height: actualHeight - 60 }}
        title={config.core.description}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Metadata Footer */}
      {(config.metadata?.dataSource || config.metadata?.asOfDate || config.metadata?.footnote) && (
        <div className="mt-2 text-xs text-muted-foreground text-center space-y-1">
          {config.metadata.dataSource && <p>Source: {config.metadata.dataSource}</p>}
          {config.metadata.asOfDate && <p>As of: {config.metadata.asOfDate}</p>}
          {config.metadata.footnote && <p className="italic">{config.metadata.footnote}</p>}
        </div>
      )}

      {/* Disclaimer */}
      {config.metadata?.disclaimerText && (
        <p className="mt-2 text-[10px] text-muted-foreground/70 text-center">
          {config.metadata.disclaimerText}
        </p>
      )}

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
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Enterprise Chart Editor
            </DialogTitle>
          </DialogHeader>

          <EnterpriseChartEditor config={editConfig} onChange={handleConfigUpdate} />

          {/* Live Preview */}
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              Live Preview
              <span className="text-xs text-muted-foreground font-normal">(Changes apply automatically)</span>
            </p>
            <div className="h-[200px] bg-background/50 rounded-md border border-border/50">
              <ResponsiveContainer width="100%" height="100%">
                {(() => {
                  const previewData = editConfig.data.map((d) => ({
                    name: d.label,
                    value: d.value,
                    fill: d.color || "#3b82f6",
                  }));

                  switch (editConfig.core.chartType) {
                    case "bar":
                      return (
                        <BarChart data={previewData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                            {previewData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      );
                    case "line":
                      return (
                        <LineChart data={previewData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Line type="monotone" dataKey="value" stroke={previewData[0]?.fill} isAnimationActive={false} />
                        </LineChart>
                      );
                    case "area":
                      return (
                        <AreaChart data={previewData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Area type="monotone" dataKey="value" fill={previewData[0]?.fill} fillOpacity={0.6} stroke={previewData[0]?.fill} isAnimationActive={false} />
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
                            innerRadius={editConfig.core.chartType === "donut" ? 40 : 0}
                            outerRadius={70}
                            dataKey="value"
                            isAnimationActive={false}
                          >
                            {previewData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      );
                    case "radial":
                      return (
                        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={previewData}>
                          <RadialBar dataKey="value" isAnimationActive={false}>
                            {previewData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </RadialBar>
                        </RadialBarChart>
                      );
                    default:
                      return <div />;
                  }
                })()}
              </ResponsiveContainer>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowEditor(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Re-export for backward compatibility
export type { EnterpriseChartConfig, EnterpriseChartConfig as EnterpriseChartConfigFull } from "@/types/enterpriseChart";
