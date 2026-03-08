import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area } from "recharts";
import { TrendingUp, Award, BarChart3, Activity, Crosshair, Zap } from "lucide-react";

interface AttributionBenchmarkProps {
  formatCurrency: (amount: number) => string;
  totalPortfolioValue: number;
}

export function AttributionBenchmark({ formatCurrency, totalPortfolioValue }: AttributionBenchmarkProps) {
  // Attribution analysis
  const attributionData = [
    { factor: "Asset Allocation", contribution: 4.2, benchmark: 3.8, alpha: 0.4 },
    { factor: "Security Selection", contribution: 2.1, benchmark: 0, alpha: 2.1 },
    { factor: "Timing", contribution: 0.8, benchmark: 0, alpha: 0.8 },
    { factor: "Currency Effect", contribution: -0.3, benchmark: -0.5, alpha: 0.2 },
    { factor: "Fees & Costs", contribution: -0.65, benchmark: -0.3, alpha: -0.35 },
    { factor: "Interaction", contribution: 0.15, benchmark: 0, alpha: 0.15 },
  ];

  const totalReturn = attributionData.reduce((s, a) => s + a.contribution, 0);
  const totalAlpha = attributionData.reduce((s, a) => s + a.alpha, 0);

  // Benchmark comparison
  const benchmarkComparison = [
    { period: "1M", portfolio: 1.8, ftse100: 1.2, sp500: 2.1, msciWorld: 1.6 },
    { period: "3M", portfolio: 4.5, ftse100: 3.2, sp500: 5.1, msciWorld: 4.0 },
    { period: "6M", portfolio: 7.8, ftse100: 5.5, sp500: 8.2, msciWorld: 6.8 },
    { period: "YTD", portfolio: 9.2, ftse100: 6.8, sp500: 10.1, msciWorld: 8.3 },
    { period: "1Y", portfolio: 12.5, ftse100: 8.2, sp500: 14.3, msciWorld: 11.0 },
    { period: "3Y", portfolio: 28.5, ftse100: 18.4, sp500: 32.1, msciWorld: 24.5 },
    { period: "5Y", portfolio: 52.3, ftse100: 32.1, sp500: 58.2, msciWorld: 45.8 },
  ];

  // Monthly tracking error
  const trackingData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    portfolio: (Math.random() * 3 - 0.5 + 1.2).toFixed(2),
    benchmark: (Math.random() * 2 - 0.3 + 0.8).toFixed(2),
    alpha: 0,
  })).map(d => ({ ...d, alpha: +(+d.portfolio - +d.benchmark).toFixed(2), portfolio: +d.portfolio, benchmark: +d.benchmark }));

  // Style analysis
  const styleFactors = [
    { factor: "Value", exposure: 0.35, contribution: 1.2 },
    { factor: "Growth", exposure: 0.42, contribution: 2.8 },
    { factor: "Momentum", exposure: 0.28, contribution: 1.5 },
    { factor: "Quality", exposure: 0.55, contribution: 1.8 },
    { factor: "Size (Small Cap)", exposure: 0.18, contribution: 0.6 },
    { factor: "Low Volatility", exposure: 0.22, contribution: 0.4 },
    { factor: "Yield", exposure: 0.38, contribution: 0.9 },
  ];

  return (
    <div className="space-y-6">
      {/* Top-Level Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Return", value: `${totalReturn.toFixed(1)}%`, sub: "YTD", icon: TrendingUp },
          { label: "Alpha Generated", value: `+${totalAlpha.toFixed(1)}%`, sub: "vs benchmark", icon: Award },
          { label: "Tracking Error", value: "2.8%", sub: "Annualised", icon: Crosshair },
          { label: "Information Ratio", value: "1.24", sub: "Risk-adjusted alpha", icon: Activity },
          { label: "Active Share", value: "68.5%", sub: "vs FTSE All-Share", icon: Zap },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attribution Waterfall */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Return Attribution Analysis
            </CardTitle>
            <CardDescription>Brinson-Fachler decomposition of portfolio returns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={attributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="factor" type="category" width={110} stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="contribution" name="Portfolio" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                <Bar dataKey="alpha" name="Alpha" fill="hsl(var(--chart-3))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Benchmark Comparison Table */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Benchmark Comparison</CardTitle>
            <CardDescription>Performance vs major indices across time horizons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-medium text-muted-foreground">Period</th>
                    <th className="text-right py-3 px-3 font-medium text-primary">Portfolio</th>
                    <th className="text-right py-3 px-3 font-medium text-muted-foreground">FTSE 100</th>
                    <th className="text-right py-3 px-3 font-medium text-muted-foreground">S&P 500</th>
                    <th className="text-right py-3 px-3 font-medium text-muted-foreground">MSCI World</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkComparison.map((row) => (
                    <tr key={row.period} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4 font-medium">{row.period}</td>
                      <td className="text-right py-3 px-3 font-semibold text-primary">{row.portfolio}%</td>
                      <td className="text-right py-3 px-3">{row.ftse100}%</td>
                      <td className="text-right py-3 px-3">{row.sp500}%</td>
                      <td className="text-right py-3 px-3">{row.msciWorld}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alpha Tracking */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Monthly Alpha Generation</CardTitle>
          <CardDescription>Portfolio vs benchmark monthly return differential</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={trackingData}>
              <defs>
                <linearGradient id="alphaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => `${v}%`} />
              <Legend />
              <Line type="monotone" dataKey="portfolio" name="Portfolio" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="alpha" name="Alpha" stroke="hsl(var(--chart-3))" fill="url(#alphaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Style Factor Analysis */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Style Factor Decomposition</CardTitle>
          <CardDescription>Factor exposure and return contribution analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {styleFactors.map((f) => (
              <div key={f.factor} className="p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors">
                <p className="text-sm font-medium mb-2">{f.factor}</p>
                <div className="flex justify-between items-baseline">
                  <div>
                    <p className="text-xs text-muted-foreground">Exposure</p>
                    <p className="text-lg font-bold">{(f.exposure * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Contribution</p>
                    <p className="text-lg font-bold text-primary">+{f.contribution}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
