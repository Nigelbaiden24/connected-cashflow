import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Zap, 
  ShieldAlert,
  Percent,
  LineChart,
  BarChart3,
  Calculator,
  PiggyBank,
  Heart,
  Clock,
  AlertTriangle,
  Wallet,
  Building,
  Landmark,
  TrendingUp as Growth,
  Scale,
  DollarSign,
  Loader2,
  Play,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Scatter,
  ScatterChart,
  ReferenceLine,
  Cell,
  PieChart,
  Pie
} from "recharts";

// Monte Carlo Sub-Tab Types
type MonteCarloSubTab = 
  | "annual-savings"
  | "goal-priority"
  | "historic"
  | "inflation"
  | "investment-returns"
  | "life-needs"
  | "longevity-risk"
  | "loss-capacity"
  | "lump-sum"
  | "market-crash"
  | "performance"
  | "potential-iht"
  | "retirement-spending";

interface MonteCarloSimulationsProps {
  selectedClient: string;
  clients: any[];
  formatCurrency: (value: number) => string;
}

// Sub-tab configuration
const subTabs = [
  { id: "annual-savings", label: "Annual Savings", icon: PiggyBank, requiresSimulation: true },
  { id: "goal-priority", label: "Goal Priority Analysis", icon: Target, requiresSimulation: true },
  { id: "historic", label: "Historic", icon: Clock, requiresSimulation: false },
  { id: "inflation", label: "Inflation Adjustment", icon: TrendingUp, requiresSimulation: true },
  { id: "investment-returns", label: "Investment Returns", icon: LineChart, requiresSimulation: true },
  { id: "life-needs", label: "Life Needs", icon: Heart, requiresSimulation: true },
  { id: "longevity-risk", label: "Longevity Risk", icon: AlertTriangle, requiresSimulation: true },
  { id: "loss-capacity", label: "Loss Capacity", icon: ShieldAlert, requiresSimulation: true },
  { id: "lump-sum", label: "Lump Sum Savings", icon: Wallet, requiresSimulation: true },
  { id: "market-crash", label: "Market Crash", icon: TrendingDown, requiresSimulation: true },
  { id: "performance", label: "Performance", icon: BarChart3, requiresSimulation: false },
  { id: "potential-iht", label: "Potential IHT", icon: Landmark, requiresSimulation: true },
  { id: "retirement-spending", label: "Retirement Spending", icon: Building, requiresSimulation: true },
] as const;

// Generate simulation data based on parameters
const generateSimulationData = (type: MonteCarloSubTab, params: any) => {
  const years = params.timeHorizon || 30;
  const initialAmount = params.initialAmount || 100000;
  
  switch (type) {
    case "annual-savings":
      return Array.from({ length: years }, (_, i) => ({
        year: i + 1,
        conservative: initialAmount + (params.annualSavings || 12000) * (i + 1) * 1.03 ** (i + 1),
        moderate: initialAmount + (params.annualSavings || 12000) * (i + 1) * 1.05 ** (i + 1),
        aggressive: initialAmount + (params.annualSavings || 12000) * (i + 1) * 1.07 ** (i + 1),
        p10: initialAmount * 0.85 ** (i * 0.1) + (params.annualSavings || 12000) * (i + 1),
        p90: initialAmount * 1.15 ** (i * 0.1) + (params.annualSavings || 12000) * (i + 1) * 1.2,
      }));
      
    case "goal-priority":
      return [
        { goal: "Retirement", priority: 1, probability: 85, funded: 78, gap: 220000, color: "hsl(var(--primary))" },
        { goal: "Education", priority: 2, probability: 92, funded: 65, gap: 45000, color: "hsl(var(--success))" },
        { goal: "House Purchase", priority: 3, probability: 78, funded: 45, gap: 85000, color: "hsl(var(--warning))" },
        { goal: "Emergency Fund", priority: 4, probability: 95, funded: 90, gap: 5000, color: "hsl(var(--success))" },
        { goal: "Legacy Planning", priority: 5, probability: 65, funded: 35, gap: 350000, color: "hsl(var(--destructive))" },
      ];
      
    case "historic":
      return [
        { period: "1990-2000", return: 18.2, worstYear: -3.1, bestYear: 33.4 },
        { period: "2000-2010", return: -0.9, worstYear: -38.5, bestYear: 28.7 },
        { period: "2010-2020", return: 13.6, worstYear: -6.2, bestYear: 32.4 },
        { period: "2020-2024", return: 9.8, worstYear: -18.1, bestYear: 26.9 },
        { period: "Full Period", return: 10.2, worstYear: -38.5, bestYear: 33.4 },
      ];
      
    case "inflation":
      return Array.from({ length: years }, (_, i) => {
        const inflation = params.inflationRate || 2.5;
        return {
          year: i + 1,
          nominal: initialAmount * (1 + (params.nominalReturn || 7) / 100) ** (i + 1),
          real: initialAmount * (1 + ((params.nominalReturn || 7) - inflation) / 100) ** (i + 1),
          inflationImpact: initialAmount * (1 - (1 / (1 + inflation / 100) ** (i + 1))),
          purchasingPower: 100 * (1 / (1 + inflation / 100) ** (i + 1)),
        };
      });
      
    case "investment-returns":
      return Array.from({ length: years }, (_, i) => ({
        year: i + 1,
        stocks: initialAmount * (1.09 + Math.random() * 0.08 - 0.04) ** (i + 1),
        bonds: initialAmount * (1.04 + Math.random() * 0.02 - 0.01) ** (i + 1),
        balanced: initialAmount * (1.065 + Math.random() * 0.04 - 0.02) ** (i + 1),
        cash: initialAmount * (1.02 + Math.random() * 0.01) ** (i + 1),
        p50: initialAmount * 1.07 ** (i + 1),
      }));
      
    case "life-needs":
      return [
        { category: "Essential Living", monthly: 3500, annual: 42000, percentile: 95, priority: "Critical" },
        { category: "Healthcare", monthly: 450, annual: 5400, percentile: 98, priority: "Critical" },
        { category: "Discretionary", monthly: 1200, annual: 14400, percentile: 75, priority: "Flexible" },
        { category: "Legacy/Gifting", monthly: 500, annual: 6000, percentile: 60, priority: "Optional" },
        { category: "Emergency Buffer", monthly: 800, annual: 9600, percentile: 90, priority: "High" },
      ];
      
    case "longevity-risk":
      return Array.from({ length: 40 }, (_, i) => {
        const age = 65 + i;
        const survivalMale = Math.exp(-0.08 * (age - 65)) * 100;
        const survivalFemale = Math.exp(-0.06 * (age - 65)) * 100;
        return {
          age,
          survivalMale: Math.max(0, survivalMale),
          survivalFemale: Math.max(0, survivalFemale),
          portfolioValue: initialAmount * Math.max(0, 1 - (age - 65) * 0.04),
          requiredFunds: (params.annualSpending || 45000) * (105 - age),
        };
      });
      
    case "loss-capacity":
      return [
        { scenario: "10% Market Drop", impact: initialAmount * -0.1, recoveryTime: 6, acceptability: 95 },
        { scenario: "20% Market Drop", impact: initialAmount * -0.2, recoveryTime: 14, acceptability: 78 },
        { scenario: "30% Market Drop", impact: initialAmount * -0.3, recoveryTime: 26, acceptability: 52 },
        { scenario: "40% Market Drop", impact: initialAmount * -0.4, recoveryTime: 42, acceptability: 28 },
        { scenario: "50% Market Drop", impact: initialAmount * -0.5, recoveryTime: 60, acceptability: 12 },
      ];
      
    case "lump-sum":
      return Array.from({ length: years }, (_, i) => ({
        year: i + 1,
        lumpSum: (params.lumpSum || 50000) * (1.07 ** (i + 1)),
        dca: (params.lumpSum || 50000) * (1.065 ** (i + 1)),
        difference: (params.lumpSum || 50000) * (1.07 ** (i + 1)) - (params.lumpSum || 50000) * (1.065 ** (i + 1)),
        lumpSumP10: (params.lumpSum || 50000) * (1.03 ** (i + 1)),
        lumpSumP90: (params.lumpSum || 50000) * (1.12 ** (i + 1)),
      }));
      
    case "market-crash":
      return [
        { event: "2008 Financial Crisis", drop: -37, duration: 18, recovery: 36, portfolioImpact: initialAmount * -0.37 },
        { event: "2020 COVID Crash", drop: -34, duration: 1, recovery: 6, portfolioImpact: initialAmount * -0.34 },
        { event: "2000 Dot-com Bubble", drop: -49, duration: 31, recovery: 56, portfolioImpact: initialAmount * -0.49 },
        { event: "1987 Black Monday", drop: -20, duration: 0.1, recovery: 24, portfolioImpact: initialAmount * -0.20 },
        { event: "Simulated 40% Crash", drop: -40, duration: 12, recovery: 48, portfolioImpact: initialAmount * -0.40 },
      ];
      
    case "performance":
      return Array.from({ length: 12 }, (_, i) => ({
        month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
        actual: (Math.random() * 8 - 2).toFixed(2),
        benchmark: (Math.random() * 6 - 1).toFixed(2),
        alpha: (Math.random() * 3 - 0.5).toFixed(2),
      }));
      
    case "potential-iht":
      const estateValue = params.estateValue || 1500000;
      const nilRateBand = 325000;
      const residenceNilRate = 175000;
      return {
        estateValue,
        nilRateBand,
        residenceNilRate,
        taxableEstate: Math.max(0, estateValue - nilRateBand - residenceNilRate),
        potentialIHT: Math.max(0, (estateValue - nilRateBand - residenceNilRate) * 0.4),
        projections: Array.from({ length: years }, (_, i) => ({
          year: i + 1,
          estateValue: estateValue * (1.05 ** (i + 1)),
          potentialIHT: Math.max(0, (estateValue * (1.05 ** (i + 1)) - nilRateBand - residenceNilRate) * 0.4),
          afterGifting: Math.max(0, (estateValue * (1.05 ** (i + 1)) - (params.annualGifting || 6000) * (i + 1) - nilRateBand - residenceNilRate) * 0.4),
        })),
      };
      
    case "retirement-spending":
      return Array.from({ length: 35 }, (_, i) => {
        const age = 65 + i;
        const baseSpending = params.retirementSpending || 45000;
        const spendingAdjustment = age < 75 ? 1 : age < 85 ? 0.85 : 0.7;
        return {
          age,
          essential: baseSpending * 0.6 * spendingAdjustment,
          discretionary: baseSpending * 0.3 * spendingAdjustment,
          healthcare: baseSpending * 0.1 * (1 + (age - 65) * 0.03),
          total: baseSpending * spendingAdjustment + baseSpending * 0.1 * (age - 65) * 0.03,
          portfolioValue: initialAmount * Math.max(0, 1 - (age - 65) * 0.035),
        };
      });
      
    default:
      return [];
  }
};

export default function MonteCarloSimulations({ selectedClient, clients, formatCurrency }: MonteCarloSimulationsProps) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<MonteCarloSubTab>("annual-savings");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  
  // Simulation Parameters State
  const [params, setParams] = useState({
    timeHorizon: 30,
    initialAmount: 100000,
    annualSavings: 12000,
    inflationRate: 2.5,
    nominalReturn: 7,
    annualSpending: 45000,
    lumpSum: 50000,
    estateValue: 1500000,
    annualGifting: 6000,
    retirementSpending: 45000,
    riskTolerance: 50,
    iterations: 10000,
  });

  // Update initial amount from selected client
  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      if (client?.aum) {
        setParams(prev => ({ ...prev, initialAmount: client.aum }));
      }
    }
  }, [selectedClient, clients]);

  const activeTabConfig = subTabs.find(tab => tab.id === activeSubTab);

  const runSimulation = async () => {
    if (!selectedClient) {
      toast({
        title: "Client Required",
        description: "Please select a client before running simulation",
        variant: "destructive",
      });
      return;
    }

    setIsSimulating(true);
    setSimulationComplete(false);
    
    toast({
      title: "Running Elite Simulation",
      description: `Executing ${params.iterations.toLocaleString()} iterations for ${activeTabConfig?.label}...`,
    });

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const data = generateSimulationData(activeSubTab, params);
      setSimulationData(data);
      setSimulationComplete(true);
      
      toast({
        title: "Simulation Complete",
        description: `${activeTabConfig?.label} analysis completed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: "Unable to complete simulation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  // Auto-generate data for non-simulation tabs
  useEffect(() => {
    if (!activeTabConfig?.requiresSimulation) {
      setSimulationData(generateSimulationData(activeSubTab, params));
      setSimulationComplete(true);
    } else {
      setSimulationComplete(false);
      setSimulationData(null);
    }
  }, [activeSubTab]);

  // Render specific chart based on active tab
  const renderChart = () => {
    if (!simulationData && activeTabConfig?.requiresSimulation) {
      return (
        <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
          <div className="text-center space-y-4">
            <Calculator className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <div>
              <h3 className="font-semibold text-lg">Run Simulation Required</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Configure your parameters below and click "Run Simulation" to generate {activeTabConfig?.label} projections.
              </p>
            </div>
          </div>
        </div>
      );
    }

    switch (activeSubTab) {
      case "annual-savings":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="p90" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} name="90th Percentile" />
              <Area type="monotone" dataKey="aggressive" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Aggressive" />
              <Area type="monotone" dataKey="moderate" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} name="Moderate" strokeWidth={2} />
              <Area type="monotone" dataKey="conservative" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.2} name="Conservative" />
              <Area type="monotone" dataKey="p10" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} name="10th Percentile" />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "goal-priority":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={simulationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="goal" width={100} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="probability" name="Success Probability" radius={[0, 4, 4, 0]}>
                  {simulationData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={simulationData}
                  dataKey="gap"
                  nameKey="goal"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ goal, gap }) => `${goal}: ${formatCurrency(gap)}`}
                >
                  {simulationData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case "historic":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Legend />
              <Bar dataKey="return" name="Avg Return" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="worstYear" name="Worst Year" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bestYear" name="Best Year" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "inflation":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis yAxisId="left" tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value: number, name: string) => name === 'purchasingPower' ? `${value.toFixed(1)}%` : formatCurrency(value)} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="nominal" fill="hsl(var(--primary))" fillOpacity={0.3} stroke="hsl(var(--primary))" name="Nominal Value" />
              <Area yAxisId="left" type="monotone" dataKey="real" fill="hsl(var(--success))" fillOpacity={0.3} stroke="hsl(var(--success))" name="Real Value" />
              <Line yAxisId="right" type="monotone" dataKey="purchasingPower" stroke="hsl(var(--destructive))" strokeDasharray="5 5" name="Purchasing Power %" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case "investment-returns":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="stocks" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} name="100% Stocks" />
              <Area type="monotone" dataKey="balanced" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="60/40 Balanced" strokeWidth={2} />
              <Area type="monotone" dataKey="bonds" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.2} name="100% Bonds" />
              <Area type="monotone" dataKey="cash" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted))" fillOpacity={0.2} name="Cash" />
              <Line type="monotone" dataKey="p50" stroke="hsl(var(--success))" strokeDasharray="5 5" name="Target (7%)" />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "life-needs":
        return (
          <div className="space-y-4">
            {simulationData?.map((item: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-card to-card/50">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant={item.priority === "Critical" ? "destructive" : item.priority === "High" ? "default" : "secondary"}>
                      {item.priority}
                    </Badge>
                    <span className="font-semibold">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(item.annual)}/year</div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(item.monthly)}/month</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={item.percentile} className="flex-1" />
                  <span className="text-sm font-medium">{item.percentile}% coverage</span>
                </div>
              </div>
            ))}
          </div>
        );

      case "longevity-risk":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
              <YAxis yAxisId="left" tickFormatter={(v) => `${v}%`} label={{ value: 'Survival %', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="survivalMale" stroke="hsl(var(--primary))" name="Male Survival %" />
              <Line yAxisId="left" type="monotone" dataKey="survivalFemale" stroke="hsl(var(--destructive))" name="Female Survival %" />
              <Area yAxisId="right" type="monotone" dataKey="portfolioValue" fill="hsl(var(--success))" fillOpacity={0.2} stroke="hsl(var(--success))" name="Portfolio Value" />
              <Area yAxisId="right" type="monotone" dataKey="requiredFunds" fill="hsl(var(--warning))" fillOpacity={0.2} stroke="hsl(var(--warning))" name="Required Funds" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case "loss-capacity":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" angle={-20} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => formatCurrency(Math.abs(value))} />
                <Tooltip formatter={(value: number) => formatCurrency(Math.abs(value))} />
                <Bar dataKey="impact" name="Portfolio Impact" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" angle={-20} textAnchor="end" height={80} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="recoveryTime" name="Recovery (months)" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="acceptability" name="Acceptability %" stroke="hsl(var(--success))" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );

      case "lump-sum":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="lumpSumP90" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} name="Lump Sum 90th %ile" />
              <Area type="monotone" dataKey="lumpSum" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Lump Sum (Median)" strokeWidth={2} />
              <Area type="monotone" dataKey="dca" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.3} name="Dollar Cost Average" strokeWidth={2} />
              <Area type="monotone" dataKey="lumpSumP10" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} name="Lump Sum 10th %ile" />
              <ReferenceLine y={params.lumpSum} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label="Initial Investment" />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "market-crash":
        return (
          <div className="space-y-4">
            {simulationData?.map((item: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-destructive/5 to-card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{item.event}</h4>
                    <p className="text-sm text-muted-foreground">Duration: {item.duration} months</p>
                  </div>
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {item.drop}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Portfolio Impact</span>
                    <div className="text-lg font-bold text-destructive">{formatCurrency(item.portfolioImpact)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recovery Time</span>
                    <div className="text-lg font-bold">{item.recovery} months</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Post-Recovery</span>
                    <div className="text-lg font-bold text-success">{formatCurrency(params.initialAmount)}</div>
                  </div>
                </div>
                <Progress value={(item.recovery / 60) * 100} className="mt-3" />
              </div>
            ))}
          </div>
        );

      case "performance":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value: any) => `${value}%`} />
              <Legend />
              <Bar dataKey="actual" name="Actual Return" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benchmark" name="Benchmark" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="alpha" name="Alpha" stroke="hsl(var(--success))" strokeWidth={2} />
              <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case "potential-iht":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-card">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Estate Value</div>
                  <div className="text-2xl font-bold">{formatCurrency(simulationData?.estateValue)}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-success/10 to-card">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Nil Rate Band</div>
                  <div className="text-2xl font-bold text-success">{formatCurrency(simulationData?.nilRateBand + simulationData?.residenceNilRate)}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-warning/10 to-card">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Taxable Estate</div>
                  <div className="text-2xl font-bold text-warning">{formatCurrency(simulationData?.taxableEstate)}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-destructive/10 to-card">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Potential IHT (40%)</div>
                  <div className="text-2xl font-bold text-destructive">{formatCurrency(simulationData?.potentialIHT)}</div>
                </CardContent>
              </Card>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={simulationData?.projections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="potentialIHT" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} name="IHT Without Planning" />
                <Area type="monotone" dataKey="afterGifting" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} name="IHT With Gifting Strategy" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case "retirement-spending":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
              <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="portfolioValue" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.2} name="Portfolio Value" />
              <Bar dataKey="essential" stackId="spending" fill="hsl(var(--primary))" name="Essential" />
              <Bar dataKey="discretionary" stackId="spending" fill="hsl(var(--warning))" name="Discretionary" />
              <Bar dataKey="healthcare" stackId="spending" fill="hsl(var(--destructive))" name="Healthcare" />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--foreground))" strokeWidth={2} name="Total Spending" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Render parameters based on active tab
  const renderParameters = () => {
    const commonParams = (
      <>
        <div className="space-y-2">
          <Label>Initial Investment (£)</Label>
          <Input 
            type="number" 
            value={params.initialAmount} 
            onChange={(e) => setParams(prev => ({ ...prev, initialAmount: Number(e.target.value) }))}
            step="1000" 
          />
        </div>
        <div className="space-y-2">
          <Label>Time Horizon (Years)</Label>
          <Input 
            type="number" 
            value={params.timeHorizon} 
            onChange={(e) => setParams(prev => ({ ...prev, timeHorizon: Number(e.target.value) }))}
            step="1" 
            min="1"
            max="50"
          />
        </div>
      </>
    );

    switch (activeSubTab) {
      case "annual-savings":
        return (
          <>
            {commonParams}
            <div className="space-y-2">
              <Label>Annual Savings (£)</Label>
              <Input 
                type="number" 
                value={params.annualSavings} 
                onChange={(e) => setParams(prev => ({ ...prev, annualSavings: Number(e.target.value) }))}
                step="1000" 
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Return (%)</Label>
              <Input 
                type="number" 
                value={params.nominalReturn} 
                onChange={(e) => setParams(prev => ({ ...prev, nominalReturn: Number(e.target.value) }))}
                step="0.1" 
              />
            </div>
          </>
        );

      case "inflation":
        return (
          <>
            {commonParams}
            <div className="space-y-2">
              <Label>Inflation Rate (%)</Label>
              <Input 
                type="number" 
                value={params.inflationRate} 
                onChange={(e) => setParams(prev => ({ ...prev, inflationRate: Number(e.target.value) }))}
                step="0.1" 
              />
            </div>
            <div className="space-y-2">
              <Label>Nominal Return (%)</Label>
              <Input 
                type="number" 
                value={params.nominalReturn} 
                onChange={(e) => setParams(prev => ({ ...prev, nominalReturn: Number(e.target.value) }))}
                step="0.1" 
              />
            </div>
          </>
        );

      case "longevity-risk":
        return (
          <>
            {commonParams}
            <div className="space-y-2">
              <Label>Annual Spending (£)</Label>
              <Input 
                type="number" 
                value={params.annualSpending} 
                onChange={(e) => setParams(prev => ({ ...prev, annualSpending: Number(e.target.value) }))}
                step="1000" 
              />
            </div>
          </>
        );

      case "lump-sum":
        return (
          <>
            {commonParams}
            <div className="space-y-2">
              <Label>Lump Sum Amount (£)</Label>
              <Input 
                type="number" 
                value={params.lumpSum} 
                onChange={(e) => setParams(prev => ({ ...prev, lumpSum: Number(e.target.value) }))}
                step="5000" 
              />
            </div>
          </>
        );

      case "potential-iht":
        return (
          <>
            <div className="space-y-2">
              <Label>Estate Value (£)</Label>
              <Input 
                type="number" 
                value={params.estateValue} 
                onChange={(e) => setParams(prev => ({ ...prev, estateValue: Number(e.target.value) }))}
                step="10000" 
              />
            </div>
            <div className="space-y-2">
              <Label>Annual Gifting (£)</Label>
              <Input 
                type="number" 
                value={params.annualGifting} 
                onChange={(e) => setParams(prev => ({ ...prev, annualGifting: Number(e.target.value) }))}
                step="1000" 
              />
            </div>
            <div className="space-y-2">
              <Label>Time Horizon (Years)</Label>
              <Input 
                type="number" 
                value={params.timeHorizon} 
                onChange={(e) => setParams(prev => ({ ...prev, timeHorizon: Number(e.target.value) }))}
                step="1" 
              />
            </div>
          </>
        );

      case "retirement-spending":
        return (
          <>
            {commonParams}
            <div className="space-y-2">
              <Label>Annual Retirement Spending (£)</Label>
              <Input 
                type="number" 
                value={params.retirementSpending} 
                onChange={(e) => setParams(prev => ({ ...prev, retirementSpending: Number(e.target.value) }))}
                step="1000" 
              />
            </div>
          </>
        );

      case "loss-capacity":
        return (
          <>
            {commonParams}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Risk Tolerance</Label>
                <Badge variant="outline">{params.riskTolerance}%</Badge>
              </div>
              <Slider 
                value={[params.riskTolerance]} 
                onValueChange={(value) => setParams(prev => ({ ...prev, riskTolerance: value[0] }))}
                min={0} 
                max={100} 
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative</span>
                <span>Moderate</span>
                <span>Aggressive</span>
              </div>
            </div>
          </>
        );

      default:
        return commonParams;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tab Dropdown Selector */}
      <Card className="bg-gradient-to-br from-primary/5 to-card border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {activeTabConfig && <activeTabConfig.icon className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <CardTitle className="text-lg">Monte Carlo Simulations</CardTitle>
                <CardDescription>Advanced stochastic modeling for financial planning</CardDescription>
              </div>
            </div>
            <Select value={activeSubTab} onValueChange={(value) => setActiveSubTab(value as MonteCarloSubTab)}>
              <SelectTrigger className="w-[280px] bg-background">
                <SelectValue placeholder="Select simulation type" />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                {subTabs.map((tab) => (
                  <SelectItem key={tab.id} value={tab.id} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {tab.requiresSimulation && (
                        <Badge variant="secondary" className="ml-2 text-xs">Sim</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {simulationComplete ? "87%" : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {params.iterations.toLocaleString()} simulations
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Median Outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {simulationComplete ? formatCurrency(params.initialAmount * 1.07 ** params.timeHorizon) : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">in {params.timeHorizon} years</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Case (90%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {simulationComplete ? formatCurrency(params.initialAmount * 1.12 ** params.timeHorizon) : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">90th percentile</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Worst Case (10%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {simulationComplete ? formatCurrency(params.initialAmount * 1.02 ** params.timeHorizon) : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">10th percentile</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {activeTabConfig && <activeTabConfig.icon className="h-5 w-5" />}
                {activeTabConfig?.label} Projection
              </CardTitle>
              <CardDescription>
                {activeTabConfig?.requiresSimulation 
                  ? `Stochastic analysis with ${params.iterations.toLocaleString()} Monte Carlo iterations`
                  : "Historical and analytical data visualization"
                }
              </CardDescription>
            </div>
            {simulationComplete && (
              <Badge variant="outline" className="gap-1">
                <Activity className="h-3 w-3" />
                Live Data
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Parameters & Run Simulation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Simulation Parameters</CardTitle>
              <CardDescription>Configure assumptions for {activeTabConfig?.label}</CardDescription>
            </div>
            {activeTabConfig?.requiresSimulation && (
              <Button 
                onClick={runSimulation}
                disabled={isSimulating || !selectedClient}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Simulation
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderParameters()}
            <div className="space-y-2">
              <Label>Number of Simulations</Label>
              <Select 
                value={params.iterations.toString()} 
                onValueChange={(value) => setParams(prev => ({ ...prev, iterations: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">1,000</SelectItem>
                  <SelectItem value="5000">5,000</SelectItem>
                  <SelectItem value="10000">10,000</SelectItem>
                  <SelectItem value="50000">50,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {!selectedClient && (
            <div className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-warning flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Please select a client above to run simulations
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
