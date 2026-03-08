import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Briefcase, Globe, TrendingUp, Shield, Layers, Network } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface MultiEntityViewProps {
  clients: any[];
  formatCurrency: (amount: number) => string;
}

export function MultiEntityView({ clients, formatCurrency }: MultiEntityViewProps) {
  // Entity classifications based on client base
  const entityTypes = [
    { type: "Family Office", icon: Building2, color: "hsl(var(--primary))", count: 0, aum: 0 },
    { type: "Investment Club", icon: Users, color: "hsl(var(--chart-2))", count: 0, aum: 0 },
    { type: "Holding Company", icon: Briefcase, color: "hsl(var(--chart-3))", count: 0, aum: 0 },
    { type: "Individual Investor", icon: Globe, color: "hsl(var(--chart-4))", count: 0, aum: 0 },
    { type: "Corporate Entity", icon: Layers, color: "hsl(var(--chart-5))", count: 0, aum: 0 },
  ];

  // Simulate entity distribution from clients
  clients.forEach((client, i) => {
    const idx = i % entityTypes.length;
    entityTypes[idx].count += 1;
    entityTypes[idx].aum += client.aum || 0;
  });

  const totalAUM = entityTypes.reduce((s, e) => s + e.aum, 0);
  const totalEntities = entityTypes.reduce((s, e) => s + e.count, 0);

  const pieData = entityTypes.filter(e => e.count > 0).map(e => ({
    name: e.type,
    value: e.aum,
    color: e.color,
  }));

  // Cross-entity exposure data
  const exposureData = [
    { asset: "UK Equities", familyOffice: 35, investClub: 28, holding: 42, individual: 20, corporate: 15 },
    { asset: "US Equities", familyOffice: 25, investClub: 32, holding: 18, individual: 35, corporate: 10 },
    { asset: "Fixed Income", familyOffice: 15, investClub: 10, holding: 8, individual: 25, corporate: 40 },
    { asset: "Real Estate", familyOffice: 12, investClub: 18, holding: 22, individual: 8, corporate: 25 },
    { asset: "Private Equity", familyOffice: 8, investClub: 5, holding: 6, individual: 2, corporate: 5 },
    { asset: "Alternatives", familyOffice: 5, investClub: 7, holding: 4, individual: 10, corporate: 5 },
  ];

  // Concentration metrics
  const concentrationMetrics = [
    { label: "Geographic Concentration", value: 68, risk: "moderate", detail: "68% UK-domiciled assets" },
    { label: "Sector Concentration", value: 42, risk: "low", detail: "Well-diversified across 12 sectors" },
    { label: "Counterparty Risk", value: 23, risk: "low", detail: "Top 3 custodians hold 23%" },
    { label: "Currency Exposure", value: 55, risk: "moderate", detail: "55% GBP-denominated" },
    { label: "Liquidity Coverage", value: 82, risk: "good", detail: "82% liquid within 5 days" },
    { label: "Regulatory Compliance", value: 96, risk: "good", detail: "96% compliant positions" },
  ];

  return (
    <div className="space-y-6">
      {/* Entity Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {entityTypes.map((entity) => {
          const Icon = entity.icon;
          return (
            <Card key={entity.type} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${entity.color}15` }}>
                    <Icon className="h-4 w-4" style={{ color: entity.color }} />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground truncate">{entity.type}</p>
                </div>
                <p className="text-2xl font-bold">{entity.count}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(entity.aum)} AUM</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AUM Distribution */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              AUM Distribution by Entity
            </CardTitle>
            <CardDescription>Aggregate assets under management across entity types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Concentration Risk Matrix */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Cross-Entity Risk Concentration
            </CardTitle>
            <CardDescription>Aggregate concentration metrics across all managed entities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {concentrationMetrics.map((metric) => (
                <div key={metric.label} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <Badge variant={
                      metric.risk === "good" ? "default" :
                      metric.risk === "moderate" ? "secondary" : "destructive"
                    } className="text-xs">
                      {metric.value}%
                    </Badge>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                  <p className="text-xs text-muted-foreground">{metric.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cross-Entity Exposure Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Cross-Entity Asset Exposure Matrix
          </CardTitle>
          <CardDescription>Allocation breakdown (%) by entity type and asset class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 font-medium text-muted-foreground">Asset Class</th>
                  <th className="text-right py-3 px-3 font-medium text-muted-foreground">Family Office</th>
                  <th className="text-right py-3 px-3 font-medium text-muted-foreground">Invest. Club</th>
                  <th className="text-right py-3 px-3 font-medium text-muted-foreground">Holding Co.</th>
                  <th className="text-right py-3 px-3 font-medium text-muted-foreground">Individual</th>
                  <th className="text-right py-3 px-3 font-medium text-muted-foreground">Corporate</th>
                </tr>
              </thead>
              <tbody>
                {exposureData.map((row) => (
                  <tr key={row.asset} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4 font-medium">{row.asset}</td>
                    <td className="text-right py-3 px-3">{row.familyOffice}%</td>
                    <td className="text-right py-3 px-3">{row.investClub}%</td>
                    <td className="text-right py-3 px-3">{row.holding}%</td>
                    <td className="text-right py-3 px-3">{row.individual}%</td>
                    <td className="text-right py-3 px-3">{row.corporate}%</td>
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
