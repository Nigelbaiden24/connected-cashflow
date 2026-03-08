import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Rocket, Clock, CheckCircle2, XCircle, Eye, Building2, TrendingUp, DollarSign, Target, Users, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart } from "recharts";

interface DealPipelineViewProps {
  formatCurrency: (amount: number) => string;
}

export function DealPipelineView({ formatCurrency }: DealPipelineViewProps) {
  // Pipeline stages
  const pipelineStages = [
    { stage: "Sourced", count: 24, value: 48000000, color: "hsl(var(--chart-1))" },
    { stage: "Screening", count: 16, value: 32000000, color: "hsl(var(--chart-2))" },
    { stage: "Due Diligence", count: 8, value: 22000000, color: "hsl(var(--chart-3))" },
    { stage: "Term Sheet", count: 4, value: 14000000, color: "hsl(var(--chart-4))" },
    { stage: "Negotiation", count: 3, value: 9500000, color: "hsl(var(--chart-5))" },
    { stage: "Closed", count: 2, value: 6800000, color: "hsl(var(--primary))" },
  ];

  const totalPipeline = pipelineStages.reduce((s, p) => s + p.value, 0);
  const conversionRate = ((pipelineStages[5].count / pipelineStages[0].count) * 100).toFixed(1);

  // Active deals
  const activeDeals = [
    { name: "TechScale AI Ltd", type: "Series A", sector: "AI/ML", stage: "Due Diligence", value: 3200000, irr: 28.5, multiple: "4.2x", daysInStage: 12, entity: "Angel Network" },
    { name: "GreenGrid Energy", type: "Growth Equity", sector: "Renewable Energy", stage: "Term Sheet", value: 5500000, irr: 22.0, multiple: "3.1x", daysInStage: 8, entity: "Family Office" },
    { name: "MediCore Diagnostics", type: "Pre-Seed", sector: "HealthTech", stage: "Screening", value: 750000, irr: 45.0, multiple: "8.0x", daysInStage: 5, entity: "Investment Club" },
    { name: "UrbanNest PropTech", type: "Bridge Round", sector: "PropTech", stage: "Negotiation", value: 2100000, irr: 18.5, multiple: "2.8x", daysInStage: 21, entity: "Holding Company" },
    { name: "CyberVault Security", type: "Series B", sector: "Cybersecurity", stage: "Due Diligence", value: 8000000, irr: 32.0, multiple: "5.5x", daysInStage: 18, entity: "VC Fund" },
    { name: "DataMesh Analytics", type: "Seed", sector: "Enterprise SaaS", stage: "Screening", value: 1500000, irr: 35.0, multiple: "6.0x", daysInStage: 3, entity: "Angel Investor" },
    { name: "Agritech Solutions", type: "Acquisition", sector: "Agriculture", stage: "Sourced", value: 4200000, irr: 15.5, multiple: "2.2x", daysInStage: 1, entity: "Corp Strategy" },
  ];

  const getStageColor = (stage: string) => {
    const map: Record<string, string> = {
      "Sourced": "secondary", "Screening": "outline", "Due Diligence": "default",
      "Term Sheet": "default", "Negotiation": "default", "Closed": "default"
    };
    return map[stage] || "secondary";
  };

  // Sector breakdown for bar chart
  const sectorData = [
    { sector: "AI/ML", deals: 6, value: 12 },
    { sector: "FinTech", deals: 4, value: 8.5 },
    { sector: "HealthTech", deals: 3, value: 5.2 },
    { sector: "PropTech", deals: 3, value: 7.8 },
    { sector: "CleanTech", deals: 5, value: 15.3 },
    { sector: "SaaS", deals: 3, value: 4.1 },
  ];

  return (
    <div className="space-y-6">
      {/* Pipeline KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Active Pipeline</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalPipeline)}</p>
            <p className="text-xs text-muted-foreground mt-1">{pipelineStages.reduce((s, p) => s + p.count, 0)} opportunities</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
            </div>
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Source to close</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Avg. Time to Close</p>
            </div>
            <p className="text-2xl font-bold">47 days</p>
            <p className="text-xs text-muted-foreground mt-1">-8 days vs Q3</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Avg. Deal Size</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalPipeline / pipelineStages.reduce((s, p) => s + p.count, 0))}</p>
            <p className="text-xs text-muted-foreground mt-1">+12% YoY</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Funnel */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Deal Flow Pipeline
          </CardTitle>
          <CardDescription>Investment pipeline from sourcing through close</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pipelineStages.map((stage, i) => {
              const widthPct = (stage.count / pipelineStages[0].count) * 100;
              return (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-28 text-sm font-medium text-right shrink-0">{stage.stage}</div>
                  <div className="flex-1 relative">
                    <div className="h-10 rounded-lg overflow-hidden bg-muted/30">
                      <div
                        className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                        style={{ width: `${Math.max(widthPct, 8)}%`, backgroundColor: stage.color }}
                      >
                        <span className="text-xs font-semibold text-white whitespace-nowrap">
                          {stage.count} deals • {formatCurrency(stage.value)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Deals */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Active Deal Flow</CardTitle>
              <CardDescription>Current opportunities across all entity types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeDeals.map((deal) => (
                  <div key={deal.name} className="p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-card to-card/50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{deal.name}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{deal.type}</Badge>
                            <Badge variant="secondary" className="text-xs">{deal.sector}</Badge>
                            <Badge variant="secondary" className="text-xs">{deal.entity}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">Value</p>
                          <p className="text-sm font-semibold">{formatCurrency(deal.value)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Target IRR</p>
                          <p className="text-sm font-semibold text-primary">{deal.irr}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Multiple</p>
                          <p className="text-sm font-semibold">{deal.multiple}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Stage</p>
                          <Badge variant={getStageColor(deal.stage) as any} className="text-xs">{deal.stage}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sector Breakdown */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Sector Breakdown</CardTitle>
            <CardDescription>Pipeline by sector (£M)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                <YAxis dataKey="sector" type="category" width={70} stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                <Tooltip
                  formatter={(value: number) => [`£${value}M`, 'Value']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
