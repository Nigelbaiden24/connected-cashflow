// Enterprise Chart Configuration Types
// Comprehensive financial-grade chart configuration system

// ==================== DATA TYPES ====================

export interface EnterpriseDataItem {
  label: string;
  value: number;
  color?: string;
  series?: string;
  date?: string;
  confidence?: number;
}

// ==================== CORE IDENTITY ====================

export type ChartType = "bar" | "line" | "area" | "pie" | "donut" | "radial";

export interface CoreIdentityConfig {
  chartType: ChartType;
  chartTitle: string;
  subtitle?: string;
  description?: string; // Tooltip / accessibility
}

// ==================== DIMENSIONS & LAYOUT ====================

export interface DimensionsConfig {
  widthPx: number;
  heightPx: number;
  responsive: boolean;
}

// ==================== DATA FORMATTING (Finance Critical) ====================

export type CurrencyType = "GBP" | "USD" | "EUR" | "JPY" | "CHF" | "none";
export type UnitType = "%" | "bps" | "years" | "multiple" | "index" | "none";
export type ValueScale = "none" | "k" | "m" | "bn" | "tn";
export type NegativeFormat = "minus" | "parentheses";
export type NullHandling = "hide" | "zero" | "gap";

export interface DataFormattingConfig {
  currency: CurrencyType;
  unit: UnitType;
  valueScale: ValueScale;
  decimalPlaces: number;
  thousandsSeparator: boolean;
  negativeFormat: NegativeFormat;
  nullValueHandling: NullHandling;
}

// ==================== VISUAL CONTROLS ====================

export type ColorPalette = "blues" | "greens" | "warm" | "purple" | "teal" | "finance" | "custom";

export interface VisualControlsConfig {
  colorPalette: ColorPalette;
  customColors: string[];
  gradientEnabled: boolean;
  opacity: number;
  animationEnabled: boolean;
  animationDurationMs: number;
}

// ==================== METADATA / COMPLIANCE ====================

export type DataFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "annual";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface MetadataConfig {
  dataSource?: string;
  asOfDate?: string;
  frequency?: DataFrequency;
  footnote?: string;
  disclaimerText?: string;
  confidenceLevel?: ConfidenceLevel;
}

// ==================== AXIS CONFIGURATION ====================

export type AxisType = "category" | "time";

export interface AxisConfig {
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisType: AxisType;
  yAxisMin?: number;
  yAxisMax?: number;
  autoScaleY: boolean;
  logScaleY: boolean;
}

// ==================== BAR CHART SPECIFIC ====================

export type BarOrientation = "vertical" | "horizontal";
export type DataLabelPosition = "inside" | "top" | "outside";
export type DataLabelFormat = "full" | "abbreviated";
export type SortOrder = "none" | "asc" | "desc";

export interface BarChartConfig {
  barOrientation: BarOrientation;
  barWidth?: number;
  barSpacing?: number;
  stacked: boolean;
  grouped: boolean;
  showDataLabels: boolean;
  dataLabelPosition: DataLabelPosition;
  dataLabelFormat: DataLabelFormat;
  sortOrder: SortOrder;
  customOrder?: string[];
  benchmarkValue?: number;
  benchmarkLabel?: string;
  targetLineValue?: number;
}

// ==================== LINE CHART SPECIFIC ====================

export type LineStyle = "solid" | "dashed" | "dotted";
export type CurveType = "linear" | "smooth" | "step";
export type LabelFrequency = "all" | "last" | "max" | "min";
export type TrendlineType = "none" | "linear" | "exponential";

export interface LineChartConfig {
  lineStyle: LineStyle;
  lineWidth: number;
  curveType: CurveType;
  multiSeries: boolean;
  showMarkers: boolean;
  markerSize: number;
  showDataLabels: boolean;
  labelFrequency: LabelFrequency;
  movingAveragePeriod?: number;
  trendline: TrendlineType;
  volatilityBand: boolean;
  confidenceInterval: boolean;
}

// ==================== AREA CHART SPECIFIC ====================

export type NegativeAreaHandling = "mirror" | "split";

export interface AreaChartConfig {
  stacked: boolean;
  fillOpacity: number;
  baselineValue: number;
  negativeAreaHandling: NegativeAreaHandling;
  overlayLine: boolean;
  overlayBenchmark: boolean;
}

// ==================== PIE CHART SPECIFIC ====================

export type PieLabelPosition = "inside" | "outside";

export interface PieChartConfig {
  innerRadius: number; // 0 = pie
  startAngle: number;
  endAngle: number;
  clockwise: boolean;
  minSliceThreshold: number;
  groupedSliceLabel: string;
  explodeSlice: boolean;
  explodeOffset: number;
  showPercentages: boolean;
  percentageDecimalPlaces: number;
  showValues: boolean;
  labelPosition: PieLabelPosition;
  leaderLines: boolean;
  sortSlices: SortOrder;
}

// ==================== DONUT CHART SPECIFIC ====================

export interface DonutChartConfig extends PieChartConfig {
  donutThickness: number;
  centerLabelPrimary?: string;
  centerLabelSecondary?: string;
  centerValue?: string;
  totalValueDisplay: boolean;
  centerValueFormat?: string;
}

// ==================== RADIAL CHART SPECIFIC ====================

export type GridShape = "circle" | "polygon";

export interface RadialChartConfig {
  axisLabels: string[];
  axisMin: number;
  axisMax: number;
  axisTickCount: number;
  autoScaleAxes: boolean;
  gridShape: GridShape;
  lineWidth: number;
  fillOpacity: number;
  multiSeries: boolean;
  compareBenchmark: boolean;
  benchmarkStyle?: LineStyle;
  showAxisValues: boolean;
  valueLabelFormat?: string;
}

// ==================== REFERENCE LINES ====================

export interface ReferenceLine {
  value: number;
  label?: string;
  color?: string;
  style?: LineStyle;
}

// ==================== COMPLETE ENTERPRISE CHART CONFIG ====================

export interface EnterpriseChartConfig {
  // Core
  core: CoreIdentityConfig;
  dimensions: DimensionsConfig;
  dataFormatting: DataFormattingConfig;
  visualControls: VisualControlsConfig;
  metadata: MetadataConfig;
  
  // Axis (for bar, line, area)
  axis?: AxisConfig;
  
  // Chart-specific configs
  barConfig?: BarChartConfig;
  lineConfig?: LineChartConfig;
  areaConfig?: AreaChartConfig;
  pieConfig?: PieChartConfig;
  donutConfig?: DonutChartConfig;
  radialConfig?: RadialChartConfig;
  
  // Data
  data: EnterpriseDataItem[];
  
  // Reference lines
  referenceLines?: ReferenceLine[];
}

// ==================== DEFAULT CONFIGURATIONS ====================

export const defaultDataFormatting: DataFormattingConfig = {
  currency: "none",
  unit: "none",
  valueScale: "none",
  decimalPlaces: 0,
  thousandsSeparator: true,
  negativeFormat: "minus",
  nullValueHandling: "zero",
};

export const defaultVisualControls: VisualControlsConfig = {
  colorPalette: "finance",
  customColors: [],
  gradientEnabled: true,
  opacity: 1,
  animationEnabled: true,
  animationDurationMs: 800,
};

export const defaultAxis: AxisConfig = {
  xAxisType: "category",
  autoScaleY: true,
  logScaleY: false,
};

export const defaultBarConfig: BarChartConfig = {
  barOrientation: "vertical",
  barWidth: undefined,
  barSpacing: undefined,
  stacked: false,
  grouped: false,
  showDataLabels: false,
  dataLabelPosition: "top",
  dataLabelFormat: "abbreviated",
  sortOrder: "none",
  benchmarkValue: undefined,
  benchmarkLabel: undefined,
  targetLineValue: undefined,
};

export const defaultLineConfig: LineChartConfig = {
  lineStyle: "solid",
  lineWidth: 2,
  curveType: "smooth",
  multiSeries: false,
  showMarkers: true,
  markerSize: 4,
  showDataLabels: false,
  labelFrequency: "last",
  trendline: "none",
  volatilityBand: false,
  confidenceInterval: false,
};

export const defaultAreaConfig: AreaChartConfig = {
  stacked: false,
  fillOpacity: 0.6,
  baselineValue: 0,
  negativeAreaHandling: "mirror",
  overlayLine: true,
  overlayBenchmark: false,
};

export const defaultPieConfig: PieChartConfig = {
  innerRadius: 0,
  startAngle: 0,
  endAngle: 360,
  clockwise: true,
  minSliceThreshold: 2,
  groupedSliceLabel: "Other",
  explodeSlice: false,
  explodeOffset: 10,
  showPercentages: true,
  percentageDecimalPlaces: 0,
  showValues: false,
  labelPosition: "outside",
  leaderLines: true,
  sortSlices: "desc",
};

export const defaultDonutConfig: DonutChartConfig = {
  ...defaultPieConfig,
  innerRadius: 60,
  donutThickness: 30,
  centerLabelPrimary: "",
  centerLabelSecondary: "",
  totalValueDisplay: true,
};

export const defaultRadialConfig: RadialChartConfig = {
  axisLabels: [],
  axisMin: 0,
  axisMax: 100,
  axisTickCount: 5,
  autoScaleAxes: true,
  gridShape: "polygon",
  lineWidth: 2,
  fillOpacity: 0.3,
  multiSeries: false,
  compareBenchmark: false,
  showAxisValues: true,
};

export const defaultMetadata: MetadataConfig = {
  dataSource: "",
  asOfDate: "",
  frequency: "monthly",
  footnote: "",
  disclaimerText: "",
  confidenceLevel: "high",
};

// ==================== COLOR PALETTES ====================

export const colorPalettes: Record<ColorPalette, string[]> = {
  blues: ["#1e3a8a", "#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd"],
  greens: ["#14532d", "#15803d", "#22c55e", "#4ade80", "#86efac"],
  warm: ["#7c2d12", "#c2410c", "#f97316", "#fb923c", "#fdba74"],
  purple: ["#4c1d95", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd"],
  teal: ["#134e4a", "#0d9488", "#14b8a6", "#2dd4bf", "#5eead4"],
  finance: ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"],
  custom: [],
};

// ==================== UTILITY FUNCTIONS ====================

export function formatValue(
  value: number,
  config: DataFormattingConfig
): string {
  if (value === null || value === undefined) {
    switch (config.nullValueHandling) {
      case "hide": return "";
      case "zero": return "0";
      case "gap": return "—";
    }
  }

  let formatted = value;
  
  // Apply scale
  switch (config.valueScale) {
    case "k": formatted = value / 1000; break;
    case "m": formatted = value / 1000000; break;
    case "bn": formatted = value / 1000000000; break;
    case "tn": formatted = value / 1000000000000; break;
  }

  // Format number
  let result = formatted.toFixed(config.decimalPlaces);
  
  // Add thousands separator
  if (config.thousandsSeparator) {
    const parts = result.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    result = parts.join(".");
  }

  // Handle negative
  if (value < 0 && config.negativeFormat === "parentheses") {
    result = `(${result.replace("-", "")})`;
  }

  // Add currency prefix
  const currencySymbols: Record<CurrencyType, string> = {
    GBP: "£",
    USD: "$",
    EUR: "€",
    JPY: "¥",
    CHF: "CHF ",
    none: "",
  };
  result = currencySymbols[config.currency] + result;

  // Add scale suffix
  const scaleSuffixes: Record<ValueScale, string> = {
    none: "",
    k: "K",
    m: "M",
    bn: "B",
    tn: "T",
  };
  result = result + scaleSuffixes[config.valueScale];

  // Add unit suffix
  const unitSuffixes: Record<UnitType, string> = {
    "%": "%",
    bps: " bps",
    years: " yrs",
    multiple: "x",
    index: "",
    none: "",
  };
  result = result + unitSuffixes[config.unit];

  return result;
}

export function getDefaultEnterpriseConfig(type: ChartType = "bar"): EnterpriseChartConfig {
  return {
    core: {
      chartType: type,
      chartTitle: "Chart Title",
      subtitle: "",
      description: "",
    },
    dimensions: {
      widthPx: 500,
      heightPx: 300,
      responsive: true,
    },
    dataFormatting: { ...defaultDataFormatting },
    visualControls: { ...defaultVisualControls },
    metadata: { ...defaultMetadata },
    axis: { ...defaultAxis },
    barConfig: { ...defaultBarConfig },
    lineConfig: { ...defaultLineConfig },
    areaConfig: { ...defaultAreaConfig },
    pieConfig: { ...defaultPieConfig },
    donutConfig: { ...defaultDonutConfig },
    radialConfig: { ...defaultRadialConfig },
    data: [
      { label: "Q1", value: 120, color: "#0ea5e9" },
      { label: "Q2", value: 165, color: "#22c55e" },
      { label: "Q3", value: 143, color: "#f59e0b" },
      { label: "Q4", value: 198, color: "#ef4444" },
    ],
    referenceLines: [],
  };
}

// Convert legacy config to enterprise config
export function legacyToEnterpriseConfig(legacy: any): EnterpriseChartConfig {
  return {
    core: {
      chartType: legacy.type || "bar",
      chartTitle: legacy.title || "",
      subtitle: "",
      description: "",
    },
    dimensions: {
      widthPx: legacy.width || 500,
      heightPx: legacy.height || 300,
      responsive: true,
    },
    dataFormatting: {
      ...defaultDataFormatting,
      decimalPlaces: 0,
    },
    visualControls: {
      ...defaultVisualControls,
      gradientEnabled: legacy.gradientEnabled ?? true,
      animationEnabled: true,
      animationDurationMs: legacy.animationDuration ?? 800,
    },
    metadata: { ...defaultMetadata },
    axis: {
      ...defaultAxis,
      xAxisLabel: legacy.xAxisLabel || "",
      yAxisLabel: legacy.yAxisLabel || "",
    },
    barConfig: { ...defaultBarConfig },
    lineConfig: { ...defaultLineConfig },
    areaConfig: { ...defaultAreaConfig },
    pieConfig: { ...defaultPieConfig },
    donutConfig: { ...defaultDonutConfig },
    radialConfig: { ...defaultRadialConfig },
    data: (legacy.data || []).map((d: any) => ({
      label: d.label,
      value: d.value,
      color: d.color,
    })),
    referenceLines: [],
  };
}
