import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Users, Briefcase, Target, TrendingUp, Shield, Landmark, Coins, Crown, Globe, Rocket, BarChart3 } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";

interface EnterpriseGoalTypesProps {
  formatCurrency: (amount: number) => string;
}

export function EnterpriseGoalTypes({ formatCurrency }: EnterpriseGoalTypesProps) {
  // Enterprise goal templates by entity type
  const goalTemplates = [
    {
      entity: "Family Office",
      icon: Crown,
      goals: [
        { name: "Intergenerational Wealth Transfer", target: 25000000, current: 18500000, priority: "Critical", category: "Succession" },
        { name: "Family Trust Endowment", target: 10000000, current: 7200000, priority: "High", category: "Trust" },
        { name: "Philanthropy Allocation", target: 2000000, current: 850000, priority: "Medium", category: "ESG/Impact" },
      ]
    },
    {
      entity: "Angel Investor / VC",
      icon: Rocket,
      goals: [
        { name: "Fund Deployment Target", target: 5000000, current: 3200000, priority: "High", category: "Deployment" },
        { name: "Portfolio IRR Target (25%+)", target: 25, current: 22.5, priority: "Critical", category: "Returns", isPercent: true },
        { name: "Follow-on Reserve", target: 2500000, current: 1800000, priority: "High", category: "Reserves" },
      ]
    },
    {
      entity: "Investment Club",
      icon: Users,
      goals: [
        { name: "Club AUM Growth", target: 1000000, current: 680000, priority: "High", category: "Growth" },
        { name: "Member Returns Distribution", target: 120000, current: 85000, priority: "Medium", category: "Distribution" },
        { name: "Deal Participation Rate", target: 85, current: 72, priority: "Medium", category: "Activity", isPercent: true },
      ]
    },
    {
      entity: "Holding Company",
      icon: Building2,
      goals: [
        { name: "Acquisition Pipeline", target: 15000000, current: 4200000, priority: "Critical", category: "M&A" },
        { name: "Subsidiary EBITDA Rollup", target: 3500000, current: 2100000, priority: "High", category: "Operating" },
        { name: "Debt-to-Equity Optimisation", target: 1.5, current: 2.1, priority: "High", category: "Capital Structure", isRatio: true },
      ]
    },
    {
      entity: "SMB Acquirer",
      icon: Briefcase,
      goals: [
        { name: "Acquisition Fund", target: 2000000, current: 1250000, priority: "Critical", category: "M&A" },
        { name: "SBA/Loan Pre-qualification", target: 5000000, current: 3500000, priority: "High", category: "Financing" },
        { name: "Post-Acquisition EBITDA", target: 500000, current: 320000, priority: "Medium", category: "Operating" },
      ]
    },
    {
      entity: "Wealth Manager",
      icon: Landmark,
      goals: [
        { name: "AUM Growth Target", target: 50000000, current: 38000000, priority: "Critical", category: "Business" },
        { name: "Client Retention Rate", target: 95, current: 92.5, priority: "High", category: "Retention", isPercent: true },
        { name: "Revenue per Client", target: 15000, current: 12800, priority: "Medium", category: "Revenue" },
      ]
    },
  ];

  // Goal health matrix radar
  const healthRadar = [
    { dimension: "On Track", value: 72 },
    { dimension: "Behind Schedule", value: 18 },
    { dimension: "At Risk", value: 8 },
    { dimension: "Exceeded", value: 15 },
    { dimension: "Not Started", value: 5 },
  ];

  // Milestone timeline data
  const milestoneData = [
    { quarter: "Q1 '25", completed: 12, planned: 15 },
    { quarter: "Q2 '25", completed: 8, planned: 18 },
    { quarter: "Q3 '25", completed: 0, planned: 22 },
    { quarter: "Q4 '25", completed: 0, planned: 14 },
    { quarter: "Q1 '26", completed: 0, planned: 20 },
    { quarter: "Q2 '26", completed: 0, planned: 16 },
  ];

  // Scenario projections
  const scenarioData = [
    { month: "Mar", base: 100, optimistic: 100, conservative: 100 },
    { month: "Jun", base: 108, optimistic: 115, conservative: 103 },
    { month: "Sep", base: 118, optimistic: 132, conservative: 108 },
    { month: "Dec", base: 128, optimistic: 152, conservative: 112 },
    { month: "Mar '26", base: 140, optimistic: 175, conservative: 118 },
    { month: "Jun '26", base: 155, optimistic: 198, conservative: 125 },
  ];

  return (
    <div className="space-y-6">
      {/* Entity Goal Boards */}
      {goalTemplates.map((template) => {
        const Icon = template.icon;
        return (
          <Card key={template.entity} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                {template.entity} Goals
              </CardTitle>
              <CardDescription>Strategic objectives and progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {template.goals.map((goal) => {
                  const isPercent = 'isPercent' in goal && goal.isPercent;
                  const isRatio = 'isRatio' in goal && goal.isRatio;
                  const progress = isRatio
                    ? Math.max(0, Math.min(100, ((goal.target as number) / (goal.current as number)) * 100))
                    : isPercent
                    ? ((goal.current as number) / (goal.target as number)) * 100
                    : ((goal.current as number) / (goal.target as number)) * 100;

                  return (
                    <div key={goal.name} className="p-4 rounded-lg border border-border/50 bg-muted/20 hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-semibold">{goal.name}</p>
                          <Badge variant="secondary" className="text-xs mt-1">{goal.category}</Badge>
                        </div>
                        <Badge variant={
                          goal.priority === "Critical" ? "destructive" :
                          goal.priority === "High" ? "default" : "secondary"
                        } className="text-xs shrink-0">{goal.priority}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.min(progress, 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {isPercent ? `${goal.current}%` : isRatio ? `${goal.current}x` : formatCurrency(goal.current as number)}
                          </span>
                          <span>
                            Target: {isPercent ? `${goal.target}%` : isRatio ? `${goal.target}x` : formatCurrency(goal.target as number)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Timeline */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Milestone Completion Tracker
            </CardTitle>
            <CardDescription>Quarterly milestone achievement across all goals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={milestoneData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="completed" name="Completed" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="planned" name="Planned" fill="hsl(var(--muted-foreground))" radius={[6, 6, 0, 0]} opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scenario Projections */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Goal Achievement Scenarios
            </CardTitle>
            <CardDescription>Projected goal completion under different market conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => `${v}%`} />
                <Legend />
                <Line type="monotone" dataKey="optimistic" name="Optimistic" stroke="hsl(var(--chart-3))" strokeWidth={2} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="base" name="Base Case" stroke="hsl(var(--primary))" strokeWidth={3} />
                <Line type="monotone" dataKey="conservative" name="Conservative" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
