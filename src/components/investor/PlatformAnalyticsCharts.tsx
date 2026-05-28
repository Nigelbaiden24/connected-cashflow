import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Sparkles,
  TrendingUp,
  Layers,
  Calendar,
  Award,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
} from "recharts";

interface AnalyticsData {
  contentCounts: { name: string; value: number; color: string }[];
  categoryBreakdown: { name: string; count: number }[];
  engagementData: { name: string; value: number; fill: string }[];
  totalContent: number;
  promotionTimeline: { date: string; promoted: number; curated: number }[];
  promotedKpis: {
    total: number;
    last7d: number;
    last30d: number;
    avgConviction: number;
    categoriesCovered: number;
    curatedTotal: number;
  };
  ratingDistribution: { name: string; value: number; fill: string }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-0.5">{label || payload[0]?.name}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: any;
  label: string;
  value: string | number;
  hint?: string;
  accent: string;
}) {
  return (
    <Card className="border-border/40 overflow-hidden relative">
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${accent}, transparent 60%)` }}
      />
      <CardContent className="pt-4 pb-4 relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: `${accent}22`, color: accent }}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        {hint && <p className="text-[10px] text-muted-foreground mt-1.5">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function PlatformAnalyticsCharts({ data }: { data: AnalyticsData }) {
  const { promotedKpis, promotionTimeline, ratingDistribution } = data;

  return (
    <div className="space-y-4">
      {/* Promoted KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          icon={Sparkles}
          label="Promoted Total"
          value={promotedKpis.total}
          hint="From Data Pipeline"
          accent="#22d3ee"
        />
        <KpiCard
          icon={TrendingUp}
          label="New · 7d"
          value={promotedKpis.last7d}
          hint="Last week"
          accent="#10b981"
        />
        <KpiCard
          icon={Calendar}
          label="New · 30d"
          value={promotedKpis.last30d}
          hint="Last 30 days"
          accent="#f59e0b"
        />
        <KpiCard
          icon={Award}
          label="Avg Conviction"
          value={promotedKpis.avgConviction.toFixed(1)}
          hint="0–5 analyst score"
          accent="#8b5cf6"
        />
        <KpiCard
          icon={Layers}
          label="Categories"
          value={promotedKpis.categoriesCovered}
          hint="Distinct sectors"
          accent="#ec4899"
        />
        <KpiCard
          icon={Activity}
          label="Curated"
          value={promotedKpis.curatedTotal}
          hint="Editor-added"
          accent="#3b82f6"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Promotion Timeline */}
        <Card className="border-border/40 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Promotion Activity · 14 days</CardTitle>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {promotionTimeline.reduce((s, d) => s + d.promoted, 0)} pipeline pushes
              </Badge>
            </div>
            <CardDescription className="text-xs">
              New opportunities added to the platform per day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={promotionTimeline} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="promotedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="curatedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="promoted"
                    name="Promoted"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fill="url(#promotedGrad)"
                    animationDuration={1200}
                  />
                  <Area
                    type="monotone"
                    dataKey="curated"
                    name="Curated"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#curatedGrad)"
                    animationDuration={1400}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Analyst Rating Mix (promoted) */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Promoted Rating Mix</CardTitle>
            </div>
            <CardDescription className="text-xs">Analyst conviction across pipeline pushes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingDistribution.length ? ratingDistribution : [{ name: "No Data", value: 1, fill: "hsl(var(--muted))" }]}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={1200}
                  >
                    {(ratingDistribution.length ? ratingDistribution : [{ fill: "hsl(var(--muted))" }]).map((entry: any, i) => (
                      <Cell key={i} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold">{promotedKpis.total}</p>
                  <p className="text-[10px] text-muted-foreground">Promoted</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {ratingDistribution.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Content Distribution Donut */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Content Distribution</CardTitle>
            </div>
            <CardDescription className="text-xs">All published content types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.contentCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="80%"
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={1200}
                  >
                    {data.contentCounts.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold">{data.totalContent}</p>
                  <p className="text-[10px] text-muted-foreground">Total Items</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {data.contentCounts.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Bar */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Top Opportunity Categories</CardTitle>
            </div>
            <CardDescription className="text-xs">Most represented sectors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryBreakdown.slice(0, 7)} layout="vertical" margin={{ left: 5, right: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={88}
                    tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[0, 6, 6, 0]} animationDuration={1400} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Radial */}
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Engagement Snapshot</CardTitle>
            </div>
            <CardDescription className="text-xs">Views, downloads & deal flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%" data={data.engagementData} startAngle={180} endAngle={-180}>
                  <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value" animationDuration={1500} cornerRadius={6} />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-1">
              {data.engagementData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.fill }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
