import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend, Area, AreaChart
} from "recharts";
import {
  TrendingUp, TrendingDown, Calculator, Briefcase, Target, ShieldAlert, Zap
} from "lucide-react";

interface PEVCScenarioAnalysisProps {
  selectedClient: string;
  clients: any[];
  formatCurrency: (value: number) => string;
}

const DEAL_TYPES = [
  { value: "buyout", label: "Leveraged Buyout (LBO)" },
  { value: "growth", label: "Growth Equity" },
  { value: "vc", label: "Venture Capital" },
  { value: "real_assets", label: "Real Assets / Infrastructure" },
  { value: "fund_of_funds", label: "Fund of Funds" },
  { value: "co_invest", label: "Co-Investment" },
];

export default function PEVCScenarioAnalysis({ selectedClient, clients, formatCurrency }: PEVCScenarioAnalysisProps) {
  const [entryPrice, setEntryPrice] = useState(5000000);
  const [holdingPeriod, setHoldingPeriod] = useState(5);
  const [revenueGrowth, setRevenueGrowth] = useState(15);
  const [ebitdaMarginExit, setEbitdaMarginExit] = useState(25);
  const [entryMultiple, setEntryMultiple] = useState(8);
  const [exitMultiple, setExitMultiple] = useState(10);
  const [leverageRatio, setLeverageRatio] = useState(50);
  const [debtInterestRate, setDebtInterestRate] = useState(6);
  const [dealType, setDealType] = useState("buyout");
  const [calculated, setCalculated] = useState(false);

  // Derived calculations
  const equityInvested = entryPrice * (1 - leverageRatio / 100);
  const debtAmount = entryPrice * (leverageRatio / 100);
  const entryEBITDA = entryPrice / entryMultiple;

  // Project forward
  const exitRevenue = (entryEBITDA / (ebitdaMarginExit / 100)) * Math.pow(1 + revenueGrowth / 100, holdingPeriod);
  const exitEBITDA = exitRevenue * (ebitdaMarginExit / 100);
  const enterpriseValueAtExit = exitEBITDA * exitMultiple;

  // Debt paydown (simplified - interest only, principal at exit)
  const totalInterest = debtAmount * (debtInterestRate / 100) * holdingPeriod;
  const equityValueAtExit = enterpriseValueAtExit - debtAmount;
  const netProceeds = equityValueAtExit;

  const moic = equityInvested > 0 ? netProceeds / equityInvested : 0;
  const irr = equityInvested > 0 ? (Math.pow(netProceeds / equityInvested, 1 / holdingPeriod) - 1) * 100 : 0;

  // Downside scenarios
  const scenarios = [
    { name: "Severe Downside", growthAdj: -10, multipleAdj: -3, color: "#ef4444" },
    { name: "Downside", growthAdj: -5, multipleAdj: -1.5, color: "#f59e0b" },
    { name: "Base Case", growthAdj: 0, multipleAdj: 0, color: "#3b82f6" },
    { name: "Upside", growthAdj: 5, multipleAdj: 1, color: "#10b981" },
    { name: "Strong Upside", growthAdj: 10, multipleAdj: 2, color: "#8b5cf6" },
  ].map(s => {
    const adjGrowth = revenueGrowth + s.growthAdj;
    const adjExitMultiple = exitMultiple + s.multipleAdj;
    const adjExitRevenue = (entryEBITDA / (ebitdaMarginExit / 100)) * Math.pow(1 + adjGrowth / 100, holdingPeriod);
    const adjExitEBITDA = adjExitRevenue * (ebitdaMarginExit / 100);
    const adjEV = adjExitEBITDA * adjExitMultiple;
    const adjEquity = adjEV - debtAmount;
    const adjMOIC = equityInvested > 0 ? adjEquity / equityInvested : 0;
    const adjIRR = equityInvested > 0 ? (Math.pow(Math.max(0, adjEquity) / equityInvested, 1 / holdingPeriod) - 1) * 100 : 0;
    return { ...s, moic: adjMOIC, irr: adjIRR, equity: adjEquity, ev: adjEV };
  });

  // Yearly projection for chart
  const yearlyProjection = Array.from({ length: holdingPeriod + 1 }, (_, i) => {
    const yearRevenue = (entryEBITDA / (ebitdaMarginExit / 100)) * Math.pow(1 + revenueGrowth / 100, i);
    const yearEBITDA = yearRevenue * (ebitdaMarginExit / 100);
    const yearEV = yearEBITDA * (entryMultiple + (exitMultiple - entryMultiple) * (i / holdingPeriod));
    const yearDebt = debtAmount;
    const yearEquity = yearEV - yearDebt;
    return { year: `Y${i}`, ev: yearEV, equity: yearEquity, ebitda: yearEBITDA, debt: yearDebt };
  });

  const getIRRColor = (v: number) => v >= 25 ? "text-emerald-500" : v >= 15 ? "text-primary" : v >= 8 ? "text-amber-500" : "text-destructive";
  const getMOICColor = (v: number) => v >= 3 ? "text-emerald-500" : v >= 2 ? "text-primary" : v >= 1.5 ? "text-amber-500" : "text-destructive";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
          <Briefcase className="h-5 w-5 text-violet-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold">PE / VC / Family Office Analysis</h3>
          <p className="text-sm text-muted-foreground">Deal-level IRR, MOIC & downside modelling for institutional investors</p>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Deal Type */}
        <Card className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deal Type</Label>
            <Select value={dealType} onValueChange={setDealType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEAL_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Entry Price */}
        <Card className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entry Price / Enterprise Value</Label>
            <Input
              type="number"
              value={entryPrice}
              onChange={e => setEntryPrice(Number(e.target.value))}
              className="text-lg font-bold"
            />
            <p className="text-xs text-muted-foreground">{formatCurrency(entryPrice)}</p>
          </CardContent>
        </Card>

        {/* Holding Period */}
        <Card className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Holding Period (Years)</Label>
            <Slider value={[holdingPeriod]} onValueChange={v => setHoldingPeriod(v[0])} min={1} max={15} step={1} />
            <p className="text-2xl font-bold text-center">{holdingPeriod} <span className="text-sm text-muted-foreground font-normal">years</span></p>
          </CardContent>
        </Card>

        {/* Leverage */}
        <Card className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Leverage (Debt %)</Label>
            <Slider value={[leverageRatio]} onValueChange={v => setLeverageRatio(v[0])} min={0} max={80} step={5} />
            <div className="flex justify-between text-xs">
              <span>Equity: {formatCurrency(equityInvested)}</span>
              <span className="font-bold">{leverageRatio}%</span>
              <span>Debt: {formatCurrency(debtAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth & Multiples */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revenue Growth (% p.a.)</Label>
            <Slider value={[revenueGrowth]} onValueChange={v => setRevenueGrowth(v[0])} min={-10} max={50} step={1} />
            <p className="text-2xl font-bold text-center">{revenueGrowth}%</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exit EBITDA Margin (%)</Label>
            <Slider value={[ebitdaMarginExit]} onValueChange={v => setEbitdaMarginExit(v[0])} min={5} max={60} step={1} />
            <p className="text-2xl font-bold text-center">{ebitdaMarginExit}%</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entry Multiple (EV/EBITDA)</Label>
            <Slider value={[entryMultiple]} onValueChange={v => setEntryMultiple(v[0])} min={3} max={30} step={0.5} />
            <p className="text-2xl font-bold text-center">{entryMultiple}x</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exit Multiple (EV/EBITDA)</Label>
            <Slider value={[exitMultiple]} onValueChange={v => setExitMultiple(v[0])} min={3} max={30} step={0.5} />
            <p className="text-2xl font-bold text-center">{exitMultiple}x</p>
          </CardContent>
        </Card>
      </div>

      {/* Results Dashboard */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Projected IRR */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Projected IRR</span>
            </div>
            <p className={`text-5xl font-black ${getIRRColor(irr)}`}>{irr.toFixed(1)}%</p>
            <Badge variant="outline" className="text-xs">{irr >= 25 ? "Exceptional" : irr >= 15 ? "Strong" : irr >= 8 ? "Moderate" : "Below Target"}</Badge>
          </CardContent>
        </Card>

        {/* MOIC */}
        <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
          <CardContent className="pt-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">MOIC</span>
            </div>
            <p className={`text-5xl font-black ${getMOICColor(moic)}`}>{moic.toFixed(2)}x</p>
            <Badge variant="outline" className="text-xs">Net Proceeds: {formatCurrency(netProceeds)}</Badge>
          </CardContent>
        </Card>

        {/* Deal Summary */}
        <Card className="border-border/50">
          <CardContent className="pt-5 space-y-2.5">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Deal Economics</span>
            </div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Entry EV</span><span className="font-medium">{formatCurrency(entryPrice)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Equity Check</span><span className="font-medium">{formatCurrency(equityInvested)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Exit EV</span><span className="font-medium">{formatCurrency(enterpriseValueAtExit)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Exit EBITDA</span><span className="font-medium">{formatCurrency(exitEBITDA)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Debt Cost</span><span className="font-medium text-destructive">{formatCurrency(totalInterest)}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Equity Value Progression */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Value Bridge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearlyProjection} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-xl text-xs space-y-1">
                        <p className="font-bold">{payload[0]?.payload?.year}</p>
                        {payload.map((p: any, i: number) => (
                          <p key={i} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
                        ))}
                      </div>
                    );
                  }} />
                  <Area type="monotone" dataKey="ev" name="Enterprise Value" stroke="#3b82f6" fill="url(#evGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="equity" name="Equity Value" stroke="#10b981" fill="url(#eqGrad)" strokeWidth={2} />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Downside Scenario Bar Chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" /> Scenario Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarios} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v.toFixed(0)}%`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v.toFixed(1)}x`} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-lg px-3 py-2 shadow-xl text-xs space-y-1">
                        <p className="font-bold">{d?.name}</p>
                        <p>IRR: {d?.irr?.toFixed(1)}%</p>
                        <p>MOIC: {d?.moic?.toFixed(2)}x</p>
                        <p>Equity: {formatCurrency(d?.equity || 0)}</p>
                      </div>
                    );
                  }} />
                  <Bar yAxisId="left" dataKey="irr" name="IRR %" radius={[4, 4, 0, 0]}>
                    {scenarios.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Bar>
                  <Bar yAxisId="right" dataKey="moic" name="MOIC" radius={[4, 4, 0, 0]} fillOpacity={0.5}>
                    {scenarios.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Scenario Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Sensitivity Matrix</CardTitle>
          <CardDescription>Impact across growth & multiple assumptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground">Scenario</th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">Growth Adj.</th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">Exit Multiple</th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">Exit EV</th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">Equity Value</th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">IRR</th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">MOIC</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </td>
                    <td className="py-2.5 px-3 text-right">{s.growthAdj >= 0 ? "+" : ""}{s.growthAdj}%</td>
                    <td className="py-2.5 px-3 text-right">{(exitMultiple + s.multipleAdj).toFixed(1)}x</td>
                    <td className="py-2.5 px-3 text-right">{formatCurrency(s.ev)}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(s.equity)}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${getIRRColor(s.irr)}`}>{s.irr.toFixed(1)}%</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${getMOICColor(s.moic)}`}>{s.moic.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
