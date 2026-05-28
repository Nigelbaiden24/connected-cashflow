import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart as PieIcon, Activity, TrendingUp } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, RadialBarChart, RadialBar, Legend
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ef4444', '#f97316'];

interface AnalyticsData {
  contentCounts: { name: string; value: number; color: string }[];
  categoryBreakdown: { name: string; count: number }[];
  engagementData: { name: string; value: number; fill: string }[];
  totalContent: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-0.5">{label || payload[0]?.name}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

export function PlatformAnalyticsCharts({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Content Distribution Donut */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Content Distribution</CardTitle>
          </div>
          <CardDescription className="text-xs">Across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.contentCounts}
                  cx="50%" cy="50%"
                  innerRadius="50%" outerRadius="80%"
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1200}
                  animationBegin={100}
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

      {/* Category Bar Chart */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Top Categories</CardTitle>
          </div>
          <CardDescription className="text-xs">Most active investment categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryBreakdown.slice(0, 6)} layout="vertical" margin={{ left: 5, right: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  type="category" dataKey="name" width={70}
                  tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
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
            <CardTitle className="text-sm">Engagement Metrics</CardTitle>
          </div>
          <CardDescription className="text-xs">Platform activity overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="25%" outerRadius="90%"
                data={data.engagementData}
                startAngle={180} endAngle={-180}
              >
                <RadialBar
                  background={{ fill: 'hsl(var(--muted))' }}
                  dataKey="value"
                  animationDuration={1500}
                  cornerRadius={6}
                />
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
  );
}
