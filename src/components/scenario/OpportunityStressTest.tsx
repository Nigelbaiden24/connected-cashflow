import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  ShieldAlert, Zap, TrendingDown, AlertTriangle, Clock, Building2,
  Loader2, ChevronDown, ChevronUp, Target, BanknoteIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StressScenario {
  id: string;
  title: string;
  description: string;
  trigger: string;
  severity: "low" | "medium" | "high" | "critical";
  probability: number;
  metrics: {
    original_irr: number;
    stressed_irr: number;
    irr_delta: number;
    original_moic: number;
    stressed_moic: number;
    moic_delta: number;
    original_return: number;
    stressed_return: number;
    return_delta: number;
    cashflow_impact_pct: number;
    recovery_months: number;
    capital_at_risk_pct: number;
  };
}

interface StressTestResult {
  scenarios: StressScenario[];
  overall_risk_score: number;
  risk_rating: string;
  worst_case_summary: string;
  mitigation_strategies: string[];
  stress_conclusion: string;
}

interface OpportunityStressTestProps {
  selectedClient: string;
  clients: any[];
  formatCurrency: (value: number) => string;
}

const ASSET_TYPES = [
  { value: "property", label: "Property / Real Estate" },
  { value: "private_equity", label: "Private Equity" },
  { value: "venture_capital", label: "Venture Capital" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "private_credit", label: "Private Credit / Lending" },
  { value: "fund", label: "Fund / ETF" },
  { value: "mini_bond", label: "Mini Bond" },
  { value: "crowdfunding", label: "Crowdfunding" },
  { value: "energy", label: "Renewable Energy" },
  { value: "stock", label: "Listed Equity / Stock" },
  { value: "crypto", label: "Crypto / Digital Asset" },
  { value: "bond", label: "Bond / Fixed Income" },
];

const SEVERITY_CONFIG = {
  low: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500" },
  medium: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", dot: "bg-amber-500" },
  high: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", dot: "bg-orange-500" },
  critical: { color: "bg-red-500/20 text-red-400 border-red-500/30", dot: "bg-red-500" },
};

export default function OpportunityStressTest({ selectedClient, clients, formatCurrency }: OpportunityStressTestProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StressTestResult | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    assetType: "",
    investmentAmount: 250000,
    expectedReturn: 12,
    expectedIRR: 14,
    expectedMOIC: 2.0,
    holdingPeriod: 5,
    incomeType: "",
    annualIncome: 0,
    leverage: 0,
    sector: "",
    geography: "UK",
    additionalContext: "",
  });

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const runStressTest = async () => {
    if (!form.name || !form.assetType) {
      toast({ title: "Missing fields", description: "Please enter the opportunity name and asset type.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("opportunity-stress-test", {
        body: { opportunity: form },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data.data);
      toast({ title: "Stress Test Complete", description: `${data.data.scenarios?.length || 0} scenarios analysed` });
    } catch (err) {
      console.error("Stress test error:", err);
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to run stress test", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const radarData = result?.scenarios.map((s) => ({
    scenario: s.title.split(" ").slice(0, 2).join(" "),
    impact: Math.abs(s.metrics.irr_delta),
    probability: s.probability,
    capitalRisk: s.metrics.capital_at_risk_pct,
  })) || [];

  const barData = result?.scenarios.map((s) => ({
    name: s.title.length > 18 ? s.title.substring(0, 18) + "…" : s.title,
    original: s.metrics.original_irr,
    stressed: s.metrics.stressed_irr,
    delta: s.metrics.irr_delta,
  })) || [];

  const riskScoreColor = (score: number) => {
    if (score <= 30) return "text-emerald-400";
    if (score <= 55) return "text-amber-400";
    if (score <= 75) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
          <ShieldAlert className="h-6 w-6 text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Opportunity Stress Test</h2>
          <p className="text-sm text-muted-foreground">
            Stress test any investment opportunity against adverse scenarios using AI
          </p>
        </div>
      </div>

      {/* Input Form */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Opportunity Parameters
          </CardTitle>
          <CardDescription>Enter the investment details to stress test</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label>Opportunity Name *</Label>
              <Input placeholder="e.g. Manchester Buy-to-Let" value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Asset Type *</Label>
              <Select value={form.assetType} onValueChange={(v) => updateForm("assetType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Investment Amount (£)</Label>
              <Input type="number" value={form.investmentAmount} onChange={(e) => updateForm("investmentAmount", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Expected Return (%)</Label>
              <Input type="number" step="0.1" value={form.expectedReturn} onChange={(e) => updateForm("expectedReturn", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Expected IRR (%)</Label>
              <Input type="number" step="0.1" value={form.expectedIRR} onChange={(e) => updateForm("expectedIRR", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Expected MOIC (x)</Label>
              <Input type="number" step="0.1" value={form.expectedMOIC} onChange={(e) => updateForm("expectedMOIC", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Holding Period (years)</Label>
              <Input type="number" value={form.holdingPeriod} onChange={(e) => updateForm("holdingPeriod", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Annual Income / Cashflow (£)</Label>
              <Input type="number" value={form.annualIncome} onChange={(e) => updateForm("annualIncome", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Leverage / Debt (%)</Label>
              <Input type="number" value={form.leverage} onChange={(e) => updateForm("leverage", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Sector</Label>
              <Input placeholder="e.g. Technology, Healthcare" value={form.sector} onChange={(e) => updateForm("sector", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Geography</Label>
              <Input placeholder="e.g. UK, US, Europe" value={form.geography} onChange={(e) => updateForm("geography", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Income Type</Label>
              <Input placeholder="e.g. Rental, Dividend, Coupon" value={form.incomeType} onChange={(e) => updateForm("incomeType", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label>Additional Context</Label>
              <Textarea
                placeholder="Any extra details: development stage, tenancy status, market conditions..."
                value={form.additionalContext}
                onChange={(e) => updateForm("additionalContext", e.target.value)}
                className="min-h-[60px]"
              />
            </div>
          </div>

          <Button onClick={runStressTest} disabled={isLoading} className="mt-6 w-full md:w-auto" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running AI Stress Test…
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run AI Stress Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="py-12 text-center space-y-4">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-t-primary border-primary/30 animate-spin" />
              <ShieldAlert className="absolute inset-4 h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">AI Engine Processing</p>
              <p className="text-sm text-muted-foreground">Modelling 6 adverse scenarios against your opportunity…</p>
            </div>
            <Progress value={65} className="max-w-xs mx-auto" />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Risk Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Overall Risk Score</p>
                <p className={`text-5xl font-black ${riskScoreColor(result.overall_risk_score)}`}>
                  {result.overall_risk_score}
                </p>
                <Badge className="mt-2" variant="outline">{result.risk_rating}</Badge>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Worst IRR Impact</p>
                <p className="text-4xl font-black text-red-400">
                  {Math.min(...result.scenarios.map((s) => s.metrics.irr_delta)).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  IRR drops to {Math.min(...result.scenarios.map((s) => s.metrics.stressed_irr)).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Max Capital at Risk</p>
                <p className="text-4xl font-black text-orange-400">
                  {Math.max(...result.scenarios.map((s) => s.metrics.capital_at_risk_pct)).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {formatCurrency(form.investmentAmount * Math.max(...result.scenarios.map((s) => s.metrics.capital_at_risk_pct)) / 100)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* IRR Comparison Bar Chart */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">IRR: Base vs Stressed</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" domain={[0, "auto"]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                    <Bar dataKey="original" name="Base IRR" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={14} />
                    <Bar dataKey="stressed" name="Stressed IRR" radius={[0, 4, 4, 0]} barSize={14}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.stressed < 0 ? "#ef4444" : entry.stressed < entry.original * 0.5 ? "#f97316" : "#eab308"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Risk Dimensions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="scenario" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis tick={{ fontSize: 9 }} />
                    <Radar name="IRR Impact" dataKey="impact" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Radar name="Capital Risk" dataKey="capitalRisk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Individual Scenarios */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Scenario Breakdown
              </CardTitle>
              <CardDescription>Click each scenario for detailed metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/30">
              {result.scenarios.map((scenario) => {
                const isExpanded = expandedScenario === scenario.id;
                const cfg = SEVERITY_CONFIG[scenario.severity] || SEVERITY_CONFIG.medium;
                return (
                  <div key={scenario.id} className="hover:bg-muted/30 transition-colors">
                    <button
                      className="w-full flex items-center justify-between p-4 text-left"
                      onClick={() => setExpandedScenario(isExpanded ? null : scenario.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} shrink-0`} />
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{scenario.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{scenario.trigger}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                          {scenario.severity}
                        </Badge>
                        <span className="text-sm font-mono text-red-400">
                          IRR {scenario.metrics.irr_delta > 0 ? "+" : ""}{scenario.metrics.irr_delta.toFixed(1)}%
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-4 bg-muted/10">
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <MetricBox label="Stressed IRR" value={`${scenario.metrics.stressed_irr.toFixed(1)}%`} sub={`from ${scenario.metrics.original_irr.toFixed(1)}%`} negative />
                          <MetricBox label="Stressed MOIC" value={`${scenario.metrics.stressed_moic.toFixed(2)}x`} sub={`from ${scenario.metrics.original_moic.toFixed(2)}x`} negative />
                          <MetricBox label="Cashflow Impact" value={`−${scenario.metrics.cashflow_impact_pct.toFixed(0)}%`} sub="income reduction" negative />
                          <MetricBox label="Recovery" value={`${scenario.metrics.recovery_months} mo`} sub="estimated timeline" />
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">Probability:</span>
                          <Progress value={scenario.probability} className="flex-1 max-w-[200px]" />
                          <span className="font-mono">{scenario.probability}%</span>
                          <span className="text-muted-foreground ml-2">Capital at Risk:</span>
                          <span className="font-mono text-red-400">{scenario.metrics.capital_at_risk_pct.toFixed(0)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Worst Case & Mitigations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-red-500/5 to-card border-red-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  Worst-Case Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{result.worst_case_summary}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/5 to-card border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-emerald-400" />
                  Mitigation Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.mitigation_strategies.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Conclusion */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed">{result.stress_conclusion}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value, sub, negative }: { label: string; value: string; sub: string; negative?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/30 p-3 text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-bold ${negative ? "text-red-400" : "text-foreground"}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
