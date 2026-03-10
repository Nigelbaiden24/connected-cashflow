import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend, ComposedChart, Line,
} from "recharts";
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity, Maximize2, X } from "lucide-react";

interface OpportunityAnalyticsChartsProps {
  opportunity: any;
}

const GLOSS_COLORS = [
  "#0ea5e9", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
];

const GlossyGradientDefs = () => (
  <defs>
    {GLOSS_COLORS.map((color, i) => (
      <linearGradient key={i} id={`gloss-${i}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
        <stop offset="50%" stopColor={color} stopOpacity={0.7} />
        <stop offset="100%" stopColor={color} stopOpacity={0.4} />
      </linearGradient>
    ))}
    <linearGradient id="area-gradient-blue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.6} />
      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05} />
    </linearGradient>
    <linearGradient id="area-gradient-green" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.6} />
      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
    </linearGradient>
    <linearGradient id="area-gradient-purple" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
      <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export function OpportunityAnalyticsCharts({ opportunity }: OpportunityAnalyticsChartsProps) {
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // ── Build data from opportunity fields ──
  const scoreItems = [
    { name: "Risk", value: opportunity.risk_score, fullMark: 5 },
    { name: "Liquidity", value: opportunity.liquidity_score, fullMark: 5 },
    { name: "Value", value: opportunity.value_score, fullMark: 5 },
    { name: "Quality", value: opportunity.quality_score, fullMark: 5 },
    { name: "Sentiment", value: opportunity.market_sentiment_score, fullMark: 5 },
    { name: "Transparency", value: opportunity.transparency_score, fullMark: 5 },
    { name: "Complexity", value: opportunity.complexity_score, fullMark: 5 },
    { name: "Geo/Reg", value: opportunity.geographic_regulatory_score, fullMark: 5 },
  ].filter((s) => s.value != null);

  const hasScores = scoreItems.length >= 3;

  // Financial bar data
  const financialBars: { name: string; value: number; color: string }[] = [];
  if (opportunity.annual_revenue) financialBars.push({ name: "Revenue", value: opportunity.annual_revenue, color: GLOSS_COLORS[0] });
  if (opportunity.ebitda) financialBars.push({ name: "EBITDA", value: opportunity.ebitda, color: GLOSS_COLORS[2] });
  if (opportunity.minimum_investment) financialBars.push({ name: "Min. Investment", value: opportunity.minimum_investment, color: GLOSS_COLORS[1] });
  if (opportunity.price) financialBars.push({ name: "Price", value: opportunity.price, color: GLOSS_COLORS[3] });

  // Return metrics pie
  const returnPie: { name: string; value: number }[] = [];
  if (opportunity.expected_irr) returnPie.push({ name: "Expected IRR", value: opportunity.expected_irr });
  if (opportunity.rental_yield) returnPie.push({ name: "Rental Yield", value: opportunity.rental_yield });
  if (opportunity.growth_rate) returnPie.push({ name: "Growth Rate", value: opportunity.growth_rate });
  if (opportunity.estimated_appreciation) returnPie.push({ name: "Appreciation", value: opportunity.estimated_appreciation });
  if (returnPie.length === 0 && opportunity.overall_conviction_score) {
    returnPie.push({ name: "Conviction", value: opportunity.overall_conviction_score * 20 });
    if (opportunity.risk_score) returnPie.push({ name: "Risk Adj.", value: (10 - opportunity.risk_score) * 10 });
    if (opportunity.value_score) returnPie.push({ name: "Value", value: opportunity.value_score * 10 });
  }

  // Projected returns area chart (simulated projection based on available data)
  const irr = opportunity.expected_irr || opportunity.growth_rate || 8;
  const baseValue = opportunity.price || opportunity.minimum_investment || 100000;
  const projectedReturns = Array.from({ length: 6 }, (_, i) => ({
    year: `Year ${i}`,
    base: baseValue,
    projected: Math.round(baseValue * Math.pow(1 + irr / 100, i)),
    optimistic: Math.round(baseValue * Math.pow(1 + (irr * 1.5) / 100, i)),
    conservative: Math.round(baseValue * Math.pow(1 + (irr * 0.5) / 100, i)),
  }));

  // Score comparison bar chart (detailed view)
  const scoreComparison = scoreItems.map((s, i) => ({
    ...s,
    benchmark: 6.5, // industry average benchmark
    color: GLOSS_COLORS[i % GLOSS_COLORS.length],
  }));

  const hasAnyChart = hasScores || financialBars.length > 0 || returnPie.length > 0;
  if (!hasAnyChart) return null;

  const formatCurrency = (v: number) => {
    if (v >= 1e9) return `£${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `£${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `£${(v / 1e3).toFixed(0)}K`;
    return `£${v}`;
  };

  const ChartWrapper = ({ id, title, icon: Icon, children, accent }: {
    id: string; title: string; icon: any; children: React.ReactNode; accent: string;
  }) => (
    <Card
      className="group relative overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-500 cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
      onClick={() => setExpandedChart(id)}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${accent.replace("bg-gradient-to-r", "bg-gradient-to-br")} bg-opacity-20`}>
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          {title}
        </CardTitle>
        <Badge variant="outline" className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="h-2.5 w-2.5 mr-1" /> Expand
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );

  const renderRadarChart = (height = 220) => (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={scoreItems} cx="50%" cy="50%" outerRadius="70%">
        <GlossyGradientDefs />
        <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
        <PolarAngleAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
        <Radar name="Score" dataKey="value" stroke="#0ea5e9" fill="url(#area-gradient-blue)" strokeWidth={2} filter="url(#glow)" />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );

  const renderFinancialBars = (height = 220) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={financialBars} barSize={32}>
        <GlossyGradientDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.2} />
        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
        <YAxis tickFormatter={formatCurrency} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} formatter={(v: number) => formatCurrency(v)} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {financialBars.map((_, i) => (
            <Cell key={i} fill={`url(#gloss-${i})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderReturnPie = (height = 220) => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <GlossyGradientDefs />
        <Pie
          data={returnPie}
          cx="50%" cy="50%"
          innerRadius={height > 250 ? 55 : 40}
          outerRadius={height > 250 ? 85 : 65}
          paddingAngle={4}
          dataKey="value"
          strokeWidth={0}
        >
          {returnPie.map((_, i) => (
            <Cell key={i} fill={`url(#gloss-${i})`} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderProjectedReturns = (height = 220) => (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={projectedReturns}>
        <GlossyGradientDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.2} />
        <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
        <YAxis tickFormatter={formatCurrency} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} formatter={(v: number) => formatCurrency(v)} />
        <Area type="monotone" dataKey="optimistic" fill="url(#area-gradient-green)" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="5 5" name="Optimistic" />
        <Area type="monotone" dataKey="projected" fill="url(#area-gradient-blue)" stroke="#0ea5e9" strokeWidth={2} name="Projected" filter="url(#glow)" />
        <Area type="monotone" dataKey="conservative" fill="url(#area-gradient-purple)" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="5 5" name="Conservative" />
        <Line type="monotone" dataKey="base" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="3 3" name="Baseline" dot={false} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderScoreComparison = (height = 220) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={scoreComparison} layout="vertical" barGap={2} barSize={14}>
        <GlossyGradientDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.2} horizontal={false} />
        <XAxis type="number" domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={80} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name="Score" radius={[0, 6, 6, 0]}>
          {scoreComparison.map((entry, i) => (
            <Cell key={i} fill={`url(#gloss-${i % GLOSS_COLORS.length})`} />
          ))}
        </Bar>
        <Bar dataKey="benchmark" name="Benchmark" fill="hsl(var(--muted-foreground))" fillOpacity={0.25} radius={[0, 6, 6, 0]} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
      </BarChart>
    </ResponsiveContainer>
  );

  const chartRenderers: Record<string, { title: string; render: (h?: number) => React.ReactNode }> = {
    radar: { title: "Analyst Score Profile", render: renderRadarChart },
    financials: { title: "Financial Overview", render: renderFinancialBars },
    returns: { title: "Return Metrics Breakdown", render: renderReturnPie },
    projected: { title: "Projected Returns (5-Year)", render: renderProjectedReturns },
    comparison: { title: "Score vs. Benchmark", render: renderScoreComparison },
  };

  return (
    <>
      <Card className="overflow-hidden border-border/40">
        <div className="h-1 bg-gradient-to-r from-sky-500 via-violet-500 to-emerald-500" />
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Interactive Analytics
            <Badge variant="outline" className="ml-2 text-[10px]">Click any chart to expand</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {hasScores && (
              <ChartWrapper id="radar" title="Analyst Score Profile" icon={Activity} accent="bg-gradient-to-r from-sky-500 to-cyan-500">
                {renderRadarChart()}
              </ChartWrapper>
            )}
            {financialBars.length > 0 && (
              <ChartWrapper id="financials" title="Financial Overview" icon={BarChart3} accent="bg-gradient-to-r from-emerald-500 to-green-500">
                {renderFinancialBars()}
              </ChartWrapper>
            )}
            {returnPie.length > 0 && (
              <ChartWrapper id="returns" title="Return Metrics" icon={PieIcon} accent="bg-gradient-to-r from-violet-500 to-purple-500">
                {renderReturnPie()}
              </ChartWrapper>
            )}
            <ChartWrapper id="projected" title="Projected Returns (5Y)" icon={TrendingUp} accent="bg-gradient-to-r from-amber-500 to-orange-500">
              {renderProjectedReturns()}
            </ChartWrapper>
            {hasScores && (
              <ChartWrapper id="comparison" title="Score vs. Benchmark" icon={BarChart3} accent="bg-gradient-to-r from-rose-500 to-pink-500">
                {renderScoreComparison()}
              </ChartWrapper>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expanded Chart Dialog */}
      <Dialog open={!!expandedChart} onOpenChange={() => setExpandedChart(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {expandedChart && chartRenderers[expandedChart]?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            {expandedChart && chartRenderers[expandedChart]?.render(420)}
          </div>
          {expandedChart && (
            <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/30">
              <h4 className="text-sm font-semibold mb-2">Detailed Insights</h4>
              {expandedChart === "radar" && (
                <div className="grid grid-cols-2 gap-3">
                  {scoreItems.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: GLOSS_COLORS[i % GLOSS_COLORS.length] }} />
                        <span className="text-xs text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="text-sm font-bold">{s.value}/10</span>
                    </div>
                  ))}
                </div>
              )}
              {expandedChart === "financials" && (
                <div className="grid grid-cols-2 gap-3">
                  {financialBars.map((f) => (
                    <div key={f.name} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-xs text-muted-foreground">{f.name}</span>
                      <span className="text-sm font-bold">{formatCurrency(f.value)}</span>
                    </div>
                  ))}
                </div>
              )}
              {expandedChart === "returns" && (
                <div className="grid grid-cols-2 gap-3">
                  {returnPie.map((r, i) => (
                    <div key={r.name} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: GLOSS_COLORS[i % GLOSS_COLORS.length] }} />
                        <span className="text-xs text-muted-foreground">{r.name}</span>
                      </div>
                      <span className="text-sm font-bold">{r.value}%</span>
                    </div>
                  ))}
                </div>
              )}
              {expandedChart === "projected" && (
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>Based on {irr}% projected annual return from a {formatCurrency(baseValue)} base investment.</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-background/50 text-center">
                      <p className="text-[10px] uppercase tracking-wider mb-1">Conservative</p>
                      <p className="text-sm font-bold text-violet-400">{formatCurrency(projectedReturns[5].conservative)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background/50 text-center">
                      <p className="text-[10px] uppercase tracking-wider mb-1">Projected</p>
                      <p className="text-sm font-bold text-sky-400">{formatCurrency(projectedReturns[5].projected)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background/50 text-center">
                      <p className="text-[10px] uppercase tracking-wider mb-1">Optimistic</p>
                      <p className="text-sm font-bold text-emerald-400">{formatCurrency(projectedReturns[5].optimistic)}</p>
                    </div>
                  </div>
                </div>
              )}
              {expandedChart === "comparison" && (
                <p className="text-xs text-muted-foreground">
                  Scores compared against an industry benchmark of 6.5/10. Areas above benchmark indicate relative strength.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
