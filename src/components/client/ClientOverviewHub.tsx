import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, ComposedChart, Line, ReferenceLine
} from "recharts";
import { 
  ChevronRight, ChevronDown, ChevronUp, Globe, Users, Target, 
  Wallet, Building2, Landmark, CreditCard, Settings, TrendingUp,
  PiggyBank, Home, Briefcase, Shield, AlertTriangle, Calendar,
  Play, ZoomIn, Plus, BarChart3, PieChartIcon, ArrowUpRight,
  ArrowDownRight, Clock, FileText, CheckCircle2, XCircle,
  Calculator, Banknote, Receipt, Heart, GraduationCap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClientOverviewHubProps {
  client: any;
  goals: any[];
  portfolioHoldings: any[];
  formatCurrency: (amount: number) => string;
}

// Generate mock projection data for the timeline chart
const generateProjectionData = (client: any, goals: any[]) => {
  const currentAge = client?.date_of_birth 
    ? new Date().getFullYear() - new Date(client.date_of_birth).getFullYear() 
    : 45;
  const retirementAge = 65;
  const data = [];
  
  const currentNetWorth = client?.net_worth || 500000;
  const annualIncome = client?.annual_income || 80000;
  const savingsRate = 0.15;
  const investmentReturn = 0.06;
  const inflationRate = 0.025;
  
  let accumulation = currentNetWorth;
  let retirementAssets = 0;
  
  for (let age = currentAge; age <= 95; age++) {
    const isRetired = age >= retirementAge;
    const yearFromNow = age - currentAge;
    
    if (!isRetired) {
      accumulation = accumulation * (1 + investmentReturn) + (annualIncome * savingsRate);
      retirementAssets = 0;
    } else {
      const withdrawal = annualIncome * 0.7 * Math.pow(1 + inflationRate, yearFromNow);
      accumulation = Math.max(0, accumulation * (1 + investmentReturn * 0.7) - withdrawal);
      retirementAssets = withdrawal;
    }
    
    data.push({
      age,
      year: new Date().getFullYear() + yearFromNow,
      assets: Math.round(accumulation),
      income: isRetired ? 0 : Math.round(annualIncome * Math.pow(1 + 0.03, yearFromNow)),
      spending: Math.round((isRetired ? annualIncome * 0.7 : annualIncome * 0.6) * Math.pow(1 + inflationRate, yearFromNow)),
      surplus: isRetired ? 0 : Math.round(annualIncome * savingsRate * Math.pow(1 + 0.03, yearFromNow)),
      deficit: isRetired && accumulation < retirementAssets ? Math.round(retirementAssets - accumulation * 0.05) : 0,
      phase: isRetired ? 'Retirement' : 'Accumulation'
    });
  }
  
  return data;
};

// Asset allocation data generator
const generateAssetAllocation = (holdings: any[]) => {
  if (holdings.length > 0) {
    const grouped = holdings.reduce((acc: any, h) => {
      const type = h.asset_type || 'Other';
      acc[type] = (acc[type] || 0) + (h.current_value || 0);
      return acc;
    }, {});
    
    return Object.entries(grouped).map(([name, value], i) => ({
      name,
      value: value as number,
      color: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'][i % 5]
    }));
  }
  
  return [
    { name: 'Equities', value: 450000, color: 'hsl(var(--chart-1))' },
    { name: 'Fixed Income', value: 280000, color: 'hsl(var(--chart-2))' },
    { name: 'Property', value: 150000, color: 'hsl(var(--chart-3))' },
    { name: 'Cash', value: 70000, color: 'hsl(var(--chart-4))' },
    { name: 'Alternative', value: 50000, color: 'hsl(var(--chart-5))' },
  ];
};

export function ClientOverviewHub({ client, goals, portfolioHoldings, formatCurrency }: ClientOverviewHubProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    netWorth: true,
    people: false,
    goals: false,
    income: false,
    surplus: false,
    property: false,
    pensions: false,
    debt: false,
    assumptions: false,
    settings: false
  });
  
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  const projectionData = useMemo(() => generateProjectionData(client, goals), [client, goals]);
  const assetAllocation = useMemo(() => generateAssetAllocation(portfolioHoldings), [portfolioHoldings]);
  
  const currentAge = client?.date_of_birth 
    ? new Date().getFullYear() - new Date(client.date_of_birth).getFullYear() 
    : 45;
  
  const netWorth = client?.net_worth || 1050000;
  const goalsMetCount = goals.filter(g => g.status === 'On Track' || g.status === 'Completed').length;
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const runSimulation = () => {
    setSimulationRunning(true);
    setTimeout(() => setSimulationRunning(false), 2000);
  };

  // Section Row Component
  const SectionRow = ({ 
    icon: Icon, 
    title, 
    value, 
    count, 
    section, 
    children,
    onClick
  }: { 
    icon: any; 
    title: string; 
    value?: string; 
    count?: number; 
    section: string; 
    children?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Collapsible open={expandedSections[section]} onOpenChange={() => toggleSection(section)}>
      <CollapsibleTrigger asChild>
        <div 
          className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50"
          onClick={onClick}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            {value && <span className="font-semibold text-primary">{value}</span>}
            {count !== undefined && (
              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
                {count}
              </Badge>
            )}
            {expandedSections[section] ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-muted/20 border-b border-border/50">
        <div className="p-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  // Income sources mock data
  const incomeSources = [
    { name: 'Employment Income', amount: client?.annual_income || 85000, type: 'Primary', taxable: true },
    { name: 'Rental Income', amount: 12000, type: 'Secondary', taxable: true },
    { name: 'Dividend Income', amount: 8500, type: 'Investment', taxable: true },
  ];

  // Pension accounts mock data
  const pensionAccounts = [
    { name: 'SIPP - Hargreaves Lansdown', value: 285000, type: 'DC', provider: 'HL' },
    { name: 'Workplace Pension', value: 142000, type: 'DC', provider: 'Aviva' },
    { name: 'Previous Employer Pension', value: 67000, type: 'DC', provider: 'Scottish Widows' },
    { name: 'DB Pension (Deferred)', value: 0, annualAmount: 12500, type: 'DB', provider: 'BT' },
    { name: 'State Pension', value: 0, annualAmount: 10600, type: 'State', provider: 'HMRC' },
  ];

  // Property data
  const properties = [
    { name: 'Main Residence', value: 650000, mortgage: 180000, equity: 470000, type: 'Primary' },
    { name: 'Buy-to-Let Property', value: 320000, mortgage: 160000, equity: 160000, type: 'Investment' },
  ];

  // Debt data
  const debts = [
    { name: 'Main Residence Mortgage', balance: 180000, rate: 4.5, monthlyPayment: 1200, remaining: 18 },
    { name: 'BTL Mortgage', balance: 160000, rate: 5.2, monthlyPayment: 950, remaining: 22 },
  ];

  return (
    <div className="space-y-6">
      {/* Lifetime Cashflow Chart */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Lifetime Cashflow Projection</CardTitle>
            <p className="text-sm text-muted-foreground">Ages {currentAge} to 95 • Retirement at 65</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={runSimulation}
              disabled={simulationRunning}
            >
              <Play className="h-4 w-4 mr-1" />
              {simulationRunning ? 'Running...' : 'Run Simulation'}
            </Button>
            <Button variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                <defs>
                  <linearGradient id="surplusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="deficitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="age" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  tickFormatter={(val) => `£${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Age ${label}`}
                />
                <ReferenceLine 
                  x={65} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="5 5"
                  label={{ value: 'Retirement', position: 'top', fill: 'hsl(var(--primary))' }}
                />
                <Bar dataKey="surplus" fill="url(#surplusGradient)" stackId="a" name="Surplus" />
                <Bar dataKey="deficit" fill="url(#deficitGradient)" stackId="a" name="Deficit" />
                <Line 
                  type="monotone" 
                  dataKey="assets" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={false}
                  name="Total Assets"
                />
                <Line 
                  type="monotone" 
                  dataKey="spending" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  name="Spending"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Timeline Phase Indicator */}
          <div className="flex h-6 mx-6 mb-4">
            <div 
              className="flex items-center justify-center text-xs font-medium text-white rounded-l"
              style={{ 
                width: `${((65 - currentAge) / (95 - currentAge)) * 100}%`, 
                backgroundColor: 'hsl(var(--chart-2))' 
              }}
            >
              Accumulation
            </div>
            <div 
              className="flex items-center justify-center text-xs font-medium text-white rounded-r"
              style={{ 
                width: `${((95 - 65) / (95 - currentAge)) * 100}%`, 
                backgroundColor: 'hsl(var(--chart-1))' 
              }}
            >
              Retirement
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Expandable Sections */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-2 p-2 border-b border-border/50 bg-muted/30">
              <Button variant="ghost" size="sm" onClick={() => setExpandedSections(prev => {
                const newState = { ...prev };
                Object.keys(newState).forEach(k => newState[k] = false);
                return newState;
              })}>
                <ChevronUp className="h-4 w-4 mr-1" />
                Collapse All
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setExpandedSections(prev => {
                const newState = { ...prev };
                Object.keys(newState).forEach(k => newState[k] = true);
                return newState;
              })}>
                <ChevronDown className="h-4 w-4 mr-1" />
                Expand All
              </Button>
            </div>

            {/* Net Worth Section */}
            <SectionRow 
              icon={Globe} 
              title="Net Worth" 
              value={formatCurrency(netWorth)}
              section="netWorth"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Assets</p>
                  <p className="text-lg font-semibold text-chart-1">{formatCurrency(netWorth + 340000)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Liabilities</p>
                  <p className="text-lg font-semibold text-destructive">{formatCurrency(340000)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Net Worth</p>
                  <p className="text-lg font-semibold">{formatCurrency(netWorth)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">YoY Change</p>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-chart-1" />
                    <p className="text-lg font-semibold text-chart-1">+8.4%</p>
                  </div>
                </div>
              </div>
            </SectionRow>

            {/* People Section */}
            <SectionRow 
              icon={Users} 
              title="People" 
              count={2}
              section="people"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-chart-1/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                      <p className="font-medium">{client?.name || 'Primary Client'}</p>
                      <p className="text-sm text-muted-foreground">Age {currentAge} • Primary</p>
                    </div>
                  </div>
                  <Badge>Owner</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-chart-2/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <p className="font-medium">Spouse/Partner</p>
                      <p className="text-sm text-muted-foreground">Age {currentAge - 2} • Partner</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Co-Owner</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add Dependent
                </Button>
              </div>
            </SectionRow>

            {/* Goals Section */}
            <SectionRow 
              icon={Target} 
              title="Goals" 
              value={`${goalsMetCount} of ${goals.length || 2} goals met`}
              section="goals"
            >
              <div className="space-y-3">
                {goals.length > 0 ? goals.slice(0, 3).map((goal, i) => (
                  <div key={goal.id || i} className="p-3 bg-background rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {goal.goal_type === 'Retirement' && <Landmark className="h-4 w-4 text-chart-1" />}
                        {goal.goal_type === 'Education' && <GraduationCap className="h-4 w-4 text-chart-2" />}
                        {goal.goal_type === 'Property' && <Home className="h-4 w-4 text-chart-3" />}
                        {!['Retirement', 'Education', 'Property'].includes(goal.goal_type) && <Target className="h-4 w-4 text-chart-4" />}
                        <span className="font-medium">{goal.goal_name}</span>
                      </div>
                      <Badge variant={goal.status === 'On Track' ? 'default' : 'destructive'}>
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{Math.round((goal.current_amount / goal.target_amount) * 100)}%</span>
                      </div>
                      <Progress value={(goal.current_amount / goal.target_amount) * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(goal.current_amount)}</span>
                        <span>{formatCurrency(goal.target_amount)}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <>
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Landmark className="h-4 w-4 text-chart-1" />
                          <span className="font-medium">Retirement at 65</span>
                        </div>
                        <Badge>On Track</Badge>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-chart-2" />
                          <span className="font-medium">Children's Education Fund</span>
                        </div>
                        <Badge variant="secondary">In Progress</Badge>
                      </div>
                      <Progress value={42} className="h-2" />
                    </div>
                  </>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add Goal
                </Button>
              </div>
            </SectionRow>

            {/* Income Section */}
            <SectionRow 
              icon={Wallet} 
              title="Income" 
              count={incomeSources.length}
              section="income"
            >
              <div className="space-y-3">
                {incomeSources.map((source, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Banknote className="h-5 w-5 text-chart-1" />
                      <div>
                        <p className="font-medium">{source.name}</p>
                        <p className="text-sm text-muted-foreground">{source.type} • {source.taxable ? 'Taxable' : 'Tax-Free'}</p>
                      </div>
                    </div>
                    <span className="font-semibold">{formatCurrency(source.amount)}/yr</span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add Income Source
                </Button>
              </div>
            </SectionRow>

            {/* Surplus Accounts */}
            <SectionRow 
              icon={PiggyBank} 
              title="Default Surplus Accounts" 
              count={2}
              section="surplus"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-chart-2" />
                    <div>
                      <p className="font-medium">ISA (Stocks & Shares)</p>
                      <p className="text-sm text-muted-foreground">Tax-Free Wrapper</p>
                    </div>
                  </div>
                  <span className="font-semibold">{formatCurrency(85000)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-chart-3" />
                    <div>
                      <p className="font-medium">General Investment Account</p>
                      <p className="text-sm text-muted-foreground">Taxable</p>
                    </div>
                  </div>
                  <span className="font-semibold">{formatCurrency(125000)}</span>
                </div>
              </div>
            </SectionRow>

            {/* Property Section */}
            <SectionRow 
              icon={Home} 
              title="Property" 
              count={properties.length}
              section="property"
            >
              <div className="space-y-3">
                {properties.map((prop, i) => (
                  <div key={i} className="p-3 bg-background rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-chart-3" />
                        <span className="font-medium">{prop.name}</span>
                      </div>
                      <Badge variant="outline">{prop.type}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Value</p>
                        <p className="font-semibold">{formatCurrency(prop.value)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mortgage</p>
                        <p className="font-semibold text-destructive">{formatCurrency(prop.mortgage)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Equity</p>
                        <p className="font-semibold text-chart-1">{formatCurrency(prop.equity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add Property
                </Button>
              </div>
            </SectionRow>

            {/* Pensions Section */}
            <SectionRow 
              icon={Landmark} 
              title="Pensions" 
              count={pensionAccounts.length}
              section="pensions"
            >
              <div className="space-y-3">
                {pensionAccounts.map((pension, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                        pension.type === 'DB' ? 'bg-chart-1/20 text-chart-1' : 
                        pension.type === 'State' ? 'bg-chart-2/20 text-chart-2' : 
                        'bg-chart-3/20 text-chart-3'
                      }`}>
                        {pension.type}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{pension.name}</p>
                        <p className="text-xs text-muted-foreground">{pension.provider}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {pension.value > 0 ? (
                        <span className="font-semibold">{formatCurrency(pension.value)}</span>
                      ) : (
                        <span className="font-semibold">{formatCurrency(pension.annualAmount || 0)}/yr</span>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add Pension
                </Button>
              </div>
            </SectionRow>

            {/* Debt & Loans */}
            <SectionRow 
              icon={CreditCard} 
              title="Debt & Loans" 
              count={debts.length}
              section="debt"
            >
              <div className="space-y-3">
                {debts.map((debt, i) => (
                  <div key={i} className="p-3 bg-background rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{debt.name}</span>
                      <span className="font-semibold text-destructive">{formatCurrency(debt.balance)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Interest Rate</p>
                        <p className="font-medium">{debt.rate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Payment</p>
                        <p className="font-medium">{formatCurrency(debt.monthlyPayment)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Years Remaining</p>
                        <p className="font-medium">{debt.remaining} years</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add Debt/Loan
                </Button>
              </div>
            </SectionRow>

            {/* Carryover Assumptions */}
            <SectionRow 
              icon={Calculator} 
              title="Carryover Assumptions" 
              section="assumptions"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground">Inflation Rate</p>
                  <p className="text-lg font-semibold">2.5%</p>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground">Expected Return</p>
                  <p className="text-lg font-semibold">6.0%</p>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground">Salary Growth</p>
                  <p className="text-lg font-semibold">3.0%</p>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground">State Pension Age</p>
                  <p className="text-lg font-semibold">67</p>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground">Life Expectancy</p>
                  <p className="text-lg font-semibold">92</p>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground">Tax Band</p>
                  <p className="text-lg font-semibold">Higher</p>
                </div>
              </div>
            </SectionRow>

            {/* Plan Settings */}
            <SectionRow 
              icon={Settings} 
              title="Plan Settings" 
              section="settings"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Retirement Age</Label>
                    <Input type="number" defaultValue={65} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Planning Horizon</Label>
                    <Input type="number" defaultValue={95} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Scenario Mode</Label>
                  <Select defaultValue="base">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base">Base Case</SelectItem>
                      <SelectItem value="optimistic">Optimistic</SelectItem>
                      <SelectItem value="pessimistic">Pessimistic</SelectItem>
                      <SelectItem value="monte-carlo">Monte Carlo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Recalculate Plan
                </Button>
              </div>
            </SectionRow>
          </Card>
        </div>

        {/* Right Column - Asset Allocation & Quick Actions */}
        <div className="space-y-6">
          {/* Asset Allocation Chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Asset Allocation</CardTitle>
                <Select defaultValue="all">
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assets</SelectItem>
                    <SelectItem value="pension">Pensions</SelectItem>
                    <SelectItem value="isa">ISAs</SelectItem>
                    <SelectItem value="gia">GIA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {assetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {assetAllocation.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Run Scenario Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Risk Assessment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Review
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Receipt className="h-4 w-4 mr-2" />
                Tax Planning
              </Button>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Goal Success Rate</span>
                  <span className="font-semibold text-chart-1">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Retirement Readiness</span>
                  <span className="font-semibold text-chart-2">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax Efficiency</span>
                  <span className="font-semibold text-chart-3">65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estate Planning</span>
                  <span className="font-semibold text-chart-4">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Floating Action Button */}
          <Button 
            size="lg" 
            className="w-full h-14 text-lg shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Item
          </Button>
        </div>
      </div>
    </div>
  );
}
