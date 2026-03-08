import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gem, Building, Grape, Landmark, Bitcoin, TreePine, Warehouse, Coins } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface AlternativeAssetsViewProps {
  formatCurrency: (amount: number) => string;
}

export function AlternativeAssetsView({ formatCurrency }: AlternativeAssetsViewProps) {
  const altCategories = [
    { name: "Private Equity", icon: Landmark, value: 4200000, allocation: 18, ytd: 14.2, vintage: "2021-2024", jCurve: 72 },
    { name: "Real Estate", icon: Building, value: 3800000, allocation: 16, ytd: 8.5, vintage: "2019-2023", jCurve: 88 },
    { name: "Hedge Funds", icon: Coins, value: 2500000, allocation: 11, ytd: 11.3, vintage: "2022-2024", jCurve: 65 },
    { name: "Infrastructure", icon: Warehouse, value: 2100000, allocation: 9, ytd: 7.8, vintage: "2020-2023", jCurve: 91 },
    { name: "Commodities", icon: Gem, value: 1800000, allocation: 8, ytd: 22.1, vintage: "2023-2024", jCurve: 45 },
    { name: "Digital Assets", icon: Bitcoin, value: 950000, allocation: 4, ytd: 38.5, vintage: "2023-2024", jCurve: 30 },
    { name: "Fine Wine & Art", icon: Grape, value: 620000, allocation: 3, ytd: 6.2, vintage: "2018-2023", jCurve: 95 },
    { name: "Timber & Farmland", icon: TreePine, value: 480000, allocation: 2, ytd: 5.1, vintage: "2020-2022", jCurve: 85 },
  ];

  const totalAltValue = altCategories.reduce((s, c) => s + c.value, 0);

  // Risk/return profile for radar chart
  const radarData = [
    { dimension: "Liquidity", score: 35 },
    { dimension: "Volatility", score: 55 },
    { dimension: "Return", score: 78 },
    { dimension: "Correlation", score: 28 },
    { dimension: "Transparency", score: 45 },
    { dimension: "Scalability", score: 62 },
  ];

  // Vintage year performance
  const vintageData = [
    { year: "2019", dpi: 1.42, tvpi: 1.85, irr: 18.2 },
    { year: "2020", dpi: 0.95, tvpi: 1.62, irr: 22.1 },
    { year: "2021", dpi: 0.45, tvpi: 1.38, irr: 15.8 },
    { year: "2022", dpi: 0.22, tvpi: 1.15, irr: 12.4 },
    { year: "2023", dpi: 0.08, tvpi: 1.05, irr: 8.5 },
    { year: "2024", dpi: 0.0, tvpi: 0.95, irr: -2.1 },
  ];

  // Capital calls & distributions
  const cashflowMetrics = [
    { label: "Unfunded Commitments", value: 6200000, pct: 38 },
    { label: "Capital Called YTD", value: 2800000, pct: 45 },
    { label: "Distributions YTD", value: 1900000, pct: 31 },
    { label: "Net Cash Flow", value: -900000, pct: -14 },
  ];

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Total Alternatives</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAltValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{altCategories.length} asset classes</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Weighted Avg IRR</p>
            <p className="text-2xl font-bold text-primary">14.8%</p>
            <p className="text-xs text-muted-foreground mt-1">Net of fees</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Blended TVPI</p>
            <p className="text-2xl font-bold">1.42x</p>
            <p className="text-xs text-muted-foreground mt-1">Total value to paid-in</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Unfunded</p>
            <p className="text-2xl font-bold">{formatCurrency(6200000)}</p>
            <p className="text-xs text-muted-foreground mt-1">Outstanding commitments</p>
          </CardContent>
        </Card>
      </div>

      {/* Alt Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {altCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.name} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium">{cat.name}</p>
                  </div>
                  <Badge variant={cat.ytd >= 10 ? "default" : "secondary"} className="text-xs">
                    {cat.ytd >= 0 ? "+" : ""}{cat.ytd}%
                  </Badge>
                </div>
                <p className="text-xl font-bold mb-1">{formatCurrency(cat.value)}</p>
                <p className="text-xs text-muted-foreground mb-3">{cat.allocation}% allocation • Vintage {cat.vintage}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">J-Curve Progress</span>
                    <span className="font-medium">{cat.jCurve}%</span>
                  </div>
                  <Progress value={cat.jCurve} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Profile Radar */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Alternative Risk Profile</CardTitle>
            <CardDescription>Multi-dimensional risk assessment across alt portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vintage Year Performance */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Vintage Year Performance</CardTitle>
            <CardDescription>TVPI by commitment vintage year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={vintageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="tvpi" name="TVPI" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="dpi" name="DPI" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Capital Calls & Distributions */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Capital Calls & Distributions</CardTitle>
          <CardDescription>LP commitment tracking and cash flow management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {cashflowMetrics.map((m) => (
              <div key={m.label} className="p-4 rounded-lg border border-border/50 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <p className={`text-xl font-bold ${m.value < 0 ? 'text-destructive' : ''}`}>
                  {formatCurrency(Math.abs(m.value))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {m.pct >= 0 ? "+" : ""}{m.pct}% of commitments
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
