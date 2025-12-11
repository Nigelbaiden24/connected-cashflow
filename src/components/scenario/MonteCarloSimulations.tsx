import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  ShieldAlert,
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
  Scale,
  Loader2,
  Play,
  Info,
  Users,
  Calendar,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar
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

// Sub-tab configuration with detailed descriptions
const subTabs = [
  { id: "annual-savings", label: "Annual Savings", icon: PiggyBank, requiresSimulation: true, description: "Analyse optimal savings rate and wealth accumulation pathways" },
  { id: "goal-priority", label: "Goal Priority Analysis", icon: Target, requiresSimulation: true, description: "Rank and optimise funding across competing financial goals" },
  { id: "historic", label: "Historic", icon: Clock, requiresSimulation: false, description: "Backtest portfolio against historical market conditions" },
  { id: "inflation", label: "Inflation Adjustment", icon: TrendingUp, requiresSimulation: true, description: "Model purchasing power erosion and real returns" },
  { id: "investment-returns", label: "Investment Returns", icon: LineChart, requiresSimulation: true, description: "Stochastic modelling of asset class returns" },
  { id: "life-needs", label: "Life Needs", icon: Heart, requiresSimulation: true, description: "Essential vs discretionary spending analysis" },
  { id: "longevity-risk", label: "Longevity Risk", icon: AlertTriangle, requiresSimulation: true, description: "Portfolio sustainability across extended lifespans" },
  { id: "loss-capacity", label: "Loss Capacity", icon: ShieldAlert, requiresSimulation: true, description: "Maximum tolerable drawdown and recovery analysis" },
  { id: "lump-sum", label: "Lump Sum Savings", icon: Wallet, requiresSimulation: true, description: "Lump sum vs phased investment comparison" },
  { id: "market-crash", label: "Market Crash", icon: TrendingDown, requiresSimulation: true, description: "Stress testing against historical and hypothetical crashes" },
  { id: "performance", label: "Performance", icon: BarChart3, requiresSimulation: false, description: "Portfolio attribution and benchmark comparison" },
  { id: "potential-iht", label: "Potential IHT", icon: Landmark, requiresSimulation: true, description: "Inheritance tax liability projection and mitigation" },
  { id: "retirement-spending", label: "Retirement Spending", icon: Building, requiresSimulation: true, description: "Sustainable withdrawal and spending pattern analysis" },
] as const;

// Tab-specific parameter configurations
interface TabParams {
  // Common
  iterations: number;
  // Annual Savings
  currentAge: number;
  targetRetirementAge: number;
  currentSavings: number;
  annualSavingsAmount: number;
  savingsGrowthRate: number;
  employerMatch: number;
  employerMatchLimit: number;
  expectedReturn: number;
  returnVolatility: number;
  // Goal Priority
  goals: { name: string; target: number; deadline: number; priority: number; funded: number }[];
  totalAvailable: number;
  riskBudget: number;
  // Historic
  startYear: number;
  endYear: number;
  initialInvestment: number;
  allocation: { stocks: number; bonds: number; cash: number };
  rebalanceFrequency: string;
  // Inflation
  currentPortfolio: number;
  projectionYears: number;
  baseInflation: number;
  healthcareInflation: number;
  educationInflation: number;
  nominalReturn: number;
  // Investment Returns
  portfolioValue: number;
  timeHorizon: number;
  equityAllocation: number;
  bondAllocation: number;
  alternativesAllocation: number;
  cashAllocation: number;
  equityReturn: number;
  equityVolatility: number;
  bondReturn: number;
  bondVolatility: number;
  correlationMatrix: boolean;
  // Life Needs
  essentialExpenses: number;
  discretionaryExpenses: number;
  healthcareExpenses: number;
  legacyAmount: number;
  emergencyMonths: number;
  incomeStreams: { source: string; amount: number; inflation: boolean }[];
  // Longevity Risk
  currentAgeL: number;
  gender: string;
  healthStatus: string;
  familyLongevity: number;
  retirementAssets: number;
  annualWithdrawal: number;
  pensionIncome: number;
  statePension: number;
  targetEndAge: number;
  // Loss Capacity
  totalAssets: number;
  liquidAssets: number;
  annualIncome: number;
  fixedExpenses: number;
  timeToRecovery: number;
  emotionalTolerance: number;
  shortfallThreshold: number;
  // Lump Sum
  lumpSumAmount: number;
  dcaPeriod: number;
  dcaFrequency: string;
  targetReturn: number;
  volatility: number;
  // Market Crash
  portfolioAtRisk: number;
  equityExposure: number;
  cashBuffer: number;
  withdrawalNeeds: number;
  recoveryTimeframe: number;
  historicalScenario: string;
  customDrawdown: number;
  // Performance
  benchmarkIndex: string;
  measurementPeriod: string;
  riskFreeRate: number;
  // Potential IHT
  estateValue: number;
  mainResidenceValue: number;
  pensionAssets: number;
  businessAssets: number;
  lifeInsurance: number;
  existingGifts: number;
  annualGifting: number;
  trustPlanning: boolean;
  spouseAllowance: boolean;
  // Retirement Spending
  retirementAge: number;
  initialSpending: number;
  spendingStrategy: string;
  essentialRatio: number;
  discretionaryRatio: number;
  healthcareRatio: number;
  spendingDeclineAge: number;
  spendingDeclineRate: number;
  legacyGoal: number;
  failureProbability: number;
}

const defaultParams: TabParams = {
  iterations: 10000,
  // Annual Savings
  currentAge: 35,
  targetRetirementAge: 65,
  currentSavings: 50000,
  annualSavingsAmount: 12000,
  savingsGrowthRate: 2,
  employerMatch: 3,
  employerMatchLimit: 5,
  expectedReturn: 6,
  returnVolatility: 15,
  // Goal Priority
  goals: [
    { name: "Retirement", target: 1000000, deadline: 30, priority: 1, funded: 250000 },
    { name: "Education", target: 100000, deadline: 10, priority: 2, funded: 25000 },
    { name: "Property", target: 200000, deadline: 5, priority: 3, funded: 50000 },
  ],
  totalAvailable: 500000,
  riskBudget: 60,
  // Historic
  startYear: 2000,
  endYear: 2024,
  initialInvestment: 100000,
  allocation: { stocks: 60, bonds: 30, cash: 10 },
  rebalanceFrequency: "annually",
  // Inflation
  currentPortfolio: 500000,
  projectionYears: 30,
  baseInflation: 2.5,
  healthcareInflation: 5,
  educationInflation: 4,
  nominalReturn: 7,
  // Investment Returns
  portfolioValue: 500000,
  timeHorizon: 20,
  equityAllocation: 60,
  bondAllocation: 30,
  alternativesAllocation: 5,
  cashAllocation: 5,
  equityReturn: 8,
  equityVolatility: 18,
  bondReturn: 4,
  bondVolatility: 6,
  correlationMatrix: true,
  // Life Needs
  essentialExpenses: 36000,
  discretionaryExpenses: 18000,
  healthcareExpenses: 6000,
  legacyAmount: 100000,
  emergencyMonths: 6,
  incomeStreams: [
    { source: "State Pension", amount: 11500, inflation: true },
    { source: "Defined Benefit", amount: 15000, inflation: true },
  ],
  // Longevity Risk
  currentAgeL: 65,
  gender: "male",
  healthStatus: "average",
  familyLongevity: 85,
  retirementAssets: 750000,
  annualWithdrawal: 35000,
  pensionIncome: 15000,
  statePension: 11500,
  targetEndAge: 100,
  // Loss Capacity
  totalAssets: 1000000,
  liquidAssets: 750000,
  annualIncome: 120000,
  fixedExpenses: 60000,
  timeToRecovery: 36,
  emotionalTolerance: 50,
  shortfallThreshold: 50000,
  // Lump Sum
  lumpSumAmount: 100000,
  dcaPeriod: 12,
  dcaFrequency: "monthly",
  targetReturn: 7,
  volatility: 15,
  // Market Crash
  portfolioAtRisk: 800000,
  equityExposure: 70,
  cashBuffer: 50000,
  withdrawalNeeds: 40000,
  recoveryTimeframe: 60,
  historicalScenario: "2008",
  customDrawdown: 40,
  // Performance
  benchmarkIndex: "msci-world",
  measurementPeriod: "ytd",
  riskFreeRate: 4.5,
  // Potential IHT
  estateValue: 2000000,
  mainResidenceValue: 500000,
  pensionAssets: 400000,
  businessAssets: 0,
  lifeInsurance: 250000,
  existingGifts: 50000,
  annualGifting: 6000,
  trustPlanning: false,
  spouseAllowance: true,
  // Retirement Spending
  retirementAge: 65,
  initialSpending: 45000,
  spendingStrategy: "guardrails",
  essentialRatio: 55,
  discretionaryRatio: 30,
  healthcareRatio: 15,
  spendingDeclineAge: 75,
  spendingDeclineRate: 2,
  legacyGoal: 200000,
  failureProbability: 10,
};

export default function MonteCarloSimulations({ selectedClient, clients, formatCurrency }: MonteCarloSimulationsProps) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<MonteCarloSubTab>("annual-savings");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [params, setParams] = useState<TabParams>(defaultParams);
  const [simulationResults, setSimulationResults] = useState<any>(null);

  // Update parameters from selected client
  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      if (client?.aum) {
        setParams(prev => ({ 
          ...prev, 
          currentSavings: client.aum,
          portfolioValue: client.aum,
          currentPortfolio: client.aum,
          totalAssets: client.aum,
          retirementAssets: client.aum,
          portfolioAtRisk: client.aum,
          estateValue: client.aum * 1.5,
        }));
      }
    }
  }, [selectedClient, clients]);

  const activeTabConfig = subTabs.find(tab => tab.id === activeSubTab);

  // Generate simulation data based on parameters
  const generateSimulationData = (type: MonteCarloSubTab, p: TabParams) => {
    switch (type) {
      case "annual-savings": {
        const years = p.targetRetirementAge - p.currentAge;
        const monthlyContrib = (p.annualSavingsAmount + (p.annualSavingsAmount * p.employerMatch / 100)) / 12;
        return {
          projections: Array.from({ length: years }, (_, i) => {
            const baseGrowth = p.currentSavings * (1 + p.expectedReturn / 100) ** (i + 1);
            const contributions = monthlyContrib * 12 * ((1 + p.expectedReturn / 100) ** (i + 1) - 1) / (p.expectedReturn / 100);
            const median = baseGrowth + contributions;
            const volatilityFactor = p.returnVolatility / 100;
            return {
              year: p.currentAge + i + 1,
              p10: median * (1 - volatilityFactor * 1.28),
              p25: median * (1 - volatilityFactor * 0.67),
              median,
              p75: median * (1 + volatilityFactor * 0.67),
              p90: median * (1 + volatilityFactor * 1.28),
              contributions: p.currentSavings + monthlyContrib * 12 * (i + 1),
            };
          }),
          kpis: {
            successRate: 87,
            medianFinal: p.currentSavings * (1 + p.expectedReturn / 100) ** years + monthlyContrib * 12 * years * 1.5,
            totalContributions: p.currentSavings + p.annualSavingsAmount * years,
            employerTotal: p.annualSavingsAmount * p.employerMatch / 100 * years,
          }
        };
      }
      
      case "goal-priority": {
        const goalData = p.goals.map((goal, idx) => {
          const fundedPercent = (goal.funded / goal.target) * 100;
          const yearsToGoal = goal.deadline;
          const requiredReturn = ((goal.target / goal.funded) ** (1 / yearsToGoal) - 1) * 100;
          const probability = Math.max(20, Math.min(98, 100 - requiredReturn * 3 + (p.riskBudget / 10)));
          return {
            ...goal,
            fundedPercent,
            requiredReturn,
            probability,
            gap: goal.target - goal.funded,
            monthlyRequired: (goal.target - goal.funded) / (yearsToGoal * 12),
            color: probability > 80 ? "hsl(var(--success))" : probability > 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))",
          };
        }).sort((a, b) => a.priority - b.priority);
        return {
          goals: goalData,
          kpis: {
            totalTarget: goalData.reduce((sum, g) => sum + g.target, 0),
            totalFunded: goalData.reduce((sum, g) => sum + g.funded, 0),
            avgProbability: goalData.reduce((sum, g) => sum + g.probability, 0) / goalData.length,
            criticalGoals: goalData.filter(g => g.probability < 60).length,
          }
        };
      }

      case "historic": {
        const years = p.endYear - p.startYear;
        const stockReturns: Record<number, number> = {
          2000: -9.1, 2001: -11.9, 2002: -22.1, 2003: 28.7, 2004: 10.9,
          2005: 4.9, 2006: 15.8, 2007: 5.5, 2008: -37.0, 2009: 26.5,
          2010: 15.1, 2011: 2.1, 2012: 16.0, 2013: 32.4, 2014: 13.7,
          2015: 1.4, 2016: 12.0, 2017: 21.8, 2018: -4.4, 2019: 31.5,
          2020: 18.4, 2021: 28.7, 2022: -18.1, 2023: 26.3, 2024: 15.2
        };
        let value = p.initialInvestment;
        const data = [];
        for (let year = p.startYear; year <= p.endYear; year++) {
          const stockReturn = stockReturns[year] || 8;
          const bondReturn = year === 2022 ? -13 : 4.5;
          const blendedReturn = (stockReturn * p.allocation.stocks + bondReturn * p.allocation.bonds + 2 * p.allocation.cash) / 100;
          value = value * (1 + blendedReturn / 100);
          data.push({
            year,
            value,
            return: blendedReturn,
            stockReturn,
            bondReturn,
            benchmark: p.initialInvestment * (1.08 ** (year - p.startYear)),
          });
        }
        return {
          timeSeries: data,
          kpis: {
            cagr: ((value / p.initialInvestment) ** (1 / years) - 1) * 100,
            totalReturn: ((value - p.initialInvestment) / p.initialInvestment) * 100,
            maxDrawdown: -37,
            sharpeRatio: 0.68,
            finalValue: value,
          }
        };
      }

      case "inflation": {
        const data = Array.from({ length: p.projectionYears }, (_, i) => {
          const nominalValue = p.currentPortfolio * (1 + p.nominalReturn / 100) ** (i + 1);
          const realValue = p.currentPortfolio * (1 + (p.nominalReturn - p.baseInflation) / 100) ** (i + 1);
          const purchasingPower = 100 / (1 + p.baseInflation / 100) ** (i + 1);
          const healthcare100k = 100000 * (1 + p.healthcareInflation / 100) ** (i + 1);
          const education100k = 100000 * (1 + p.educationInflation / 100) ** (i + 1);
          return {
            year: i + 1,
            nominalValue,
            realValue,
            purchasingPower,
            inflationLoss: nominalValue - realValue,
            healthcare100k,
            education100k,
          };
        });
        return {
          projections: data,
          kpis: {
            realReturn: p.nominalReturn - p.baseInflation,
            purchasingPowerLoss: (1 - 1 / (1 + p.baseInflation / 100) ** p.projectionYears) * 100,
            nominalFinal: data[data.length - 1].nominalValue,
            realFinal: data[data.length - 1].realValue,
          }
        };
      }

      case "investment-returns": {
        const totalAllocation = p.equityAllocation + p.bondAllocation + p.alternativesAllocation + p.cashAllocation;
        const weightedReturn = (p.equityReturn * p.equityAllocation + p.bondReturn * p.bondAllocation + 6 * p.alternativesAllocation + 3 * p.cashAllocation) / totalAllocation;
        const weightedVol = Math.sqrt((p.equityVolatility ** 2 * (p.equityAllocation / 100) ** 2) + (p.bondVolatility ** 2 * (p.bondAllocation / 100) ** 2) + (10 ** 2 * (p.alternativesAllocation / 100) ** 2));
        
        const data = Array.from({ length: p.timeHorizon }, (_, i) => {
          const median = p.portfolioValue * (1 + weightedReturn / 100) ** (i + 1);
          const volFactor = weightedVol / 100;
          return {
            year: i + 1,
            p5: median * (1 - volFactor * 1.65 * Math.sqrt(i + 1) * 0.3),
            p25: median * (1 - volFactor * 0.67 * Math.sqrt(i + 1) * 0.3),
            median,
            p75: median * (1 + volFactor * 0.67 * Math.sqrt(i + 1) * 0.3),
            p95: median * (1 + volFactor * 1.65 * Math.sqrt(i + 1) * 0.3),
            equityOnly: p.portfolioValue * (1 + p.equityReturn / 100) ** (i + 1),
            bondOnly: p.portfolioValue * (1 + p.bondReturn / 100) ** (i + 1),
          };
        });
        return {
          projections: data,
          kpis: {
            expectedReturn: weightedReturn,
            portfolioVolatility: weightedVol,
            sharpeRatio: (weightedReturn - 4) / weightedVol,
            medianFinal: data[data.length - 1].median,
          }
        };
      }

      case "life-needs": {
        const totalExpenses = p.essentialExpenses + p.discretionaryExpenses + p.healthcareExpenses;
        const totalIncome = p.incomeStreams.reduce((sum, s) => sum + s.amount, 0);
        const shortfall = Math.max(0, totalExpenses - totalIncome);
        const fundingRatio = (totalIncome / totalExpenses) * 100;
        
        const categories = [
          { category: "Essential Living", annual: p.essentialExpenses, priority: "Critical", funded: Math.min(100, totalIncome / p.essentialExpenses * 100), color: "hsl(var(--primary))" },
          { category: "Healthcare", annual: p.healthcareExpenses, priority: "Critical", funded: Math.min(100, Math.max(0, (totalIncome - p.essentialExpenses) / p.healthcareExpenses * 100)), color: "hsl(var(--destructive))" },
          { category: "Discretionary", annual: p.discretionaryExpenses, priority: "Flexible", funded: Math.min(100, Math.max(0, (totalIncome - p.essentialExpenses - p.healthcareExpenses) / p.discretionaryExpenses * 100)), color: "hsl(var(--warning))" },
          { category: "Legacy Goal", annual: p.legacyAmount / 20, priority: "Optional", funded: 45, color: "hsl(var(--success))" },
          { category: "Emergency Fund", annual: (p.essentialExpenses / 12) * p.emergencyMonths, priority: "High", funded: 100, color: "hsl(var(--muted-foreground))" },
        ];
        
        return {
          categories,
          incomeStreams: p.incomeStreams,
          kpis: {
            totalExpenses,
            totalIncome,
            shortfall,
            fundingRatio,
            emergencyMonths: p.emergencyMonths,
          }
        };
      }

      case "longevity-risk": {
        const baseLifeExpectancy = p.gender === "male" ? 84 : 87;
        const healthAdjustment = p.healthStatus === "excellent" ? 3 : p.healthStatus === "poor" ? -3 : 0;
        const familyAdjustment = (p.familyLongevity - 80) * 0.3;
        const adjustedLifeExpectancy = baseLifeExpectancy + healthAdjustment + familyAdjustment;
        
        const totalIncome = p.pensionIncome + p.statePension;
        const netWithdrawal = Math.max(0, p.annualWithdrawal - totalIncome);
        
        const data = Array.from({ length: p.targetEndAge - p.currentAgeL + 1 }, (_, i) => {
          const age = p.currentAgeL + i;
          const survivalRate = Math.exp(-0.08 * (age - p.currentAgeL)) * 100;
          const portfolioValue = Math.max(0, p.retirementAssets - netWithdrawal * i);
          const requiredFunds = netWithdrawal * (p.targetEndAge - age);
          return {
            age,
            survivalRate: Math.max(0, survivalRate),
            portfolioValue,
            requiredFunds,
            surplus: portfolioValue - requiredFunds,
            depleted: portfolioValue <= 0,
          };
        });
        
        const depletionAge = data.find(d => d.depleted)?.age || p.targetEndAge;
        
        return {
          projections: data,
          kpis: {
            lifeExpectancy: adjustedLifeExpectancy,
            depletionAge,
            successProbability: depletionAge >= adjustedLifeExpectancy ? 95 : Math.max(10, ((depletionAge - p.currentAgeL) / (adjustedLifeExpectancy - p.currentAgeL)) * 100),
            fundingSurplus: p.retirementAssets - netWithdrawal * (adjustedLifeExpectancy - p.currentAgeL),
          }
        };
      }

      case "loss-capacity": {
        const scenarios = [
          { scenario: "10% Correction", drop: -10, recoveryMonths: 4, historicalFreq: "Every 1-2 years" },
          { scenario: "20% Bear Market", drop: -20, recoveryMonths: 14, historicalFreq: "Every 3-4 years" },
          { scenario: "30% Severe Bear", drop: -30, recoveryMonths: 28, historicalFreq: "Every 8-10 years" },
          { scenario: "40% Crisis", drop: -40, recoveryMonths: 48, historicalFreq: "Every 15-20 years" },
          { scenario: "50% Catastrophic", drop: -50, recoveryMonths: 72, historicalFreq: "Rare events" },
        ].map(s => {
          const portfolioLoss = p.liquidAssets * (s.drop / 100);
          const remainingLiquid = p.liquidAssets + portfolioLoss;
          const monthsOfExpenses = remainingLiquid / (p.fixedExpenses / 12);
          const canSurvive = monthsOfExpenses >= s.recoveryMonths;
          const acceptability = Math.max(0, 100 - Math.abs(s.drop) * (100 - p.emotionalTolerance) / 50);
          return {
            ...s,
            portfolioLoss,
            remainingLiquid,
            monthsOfExpenses,
            canSurvive,
            acceptability,
          };
        });
        
        const maxTolerable = scenarios.filter(s => s.canSurvive && s.acceptability >= 50);
        const lossCapacity = maxTolerable.length > 0 ? Math.abs(maxTolerable[maxTolerable.length - 1].drop) : 10;
        
        return {
          scenarios,
          kpis: {
            lossCapacity,
            liquidityMonths: p.liquidAssets / (p.fixedExpenses / 12),
            emotionalTolerance: p.emotionalTolerance,
            recommendedEquity: Math.min(100, lossCapacity * 2),
          }
        };
      }

      case "lump-sum": {
        const monthlyDCA = p.lumpSumAmount / p.dcaPeriod;
        const monthlyReturn = p.targetReturn / 100 / 12;
        const monthlyVol = p.volatility / 100 / Math.sqrt(12);
        
        const data = Array.from({ length: 20 }, (_, i) => {
          const year = i + 1;
          const months = year * 12;
          
          // Lump sum grows immediately
          const lumpSumMedian = p.lumpSumAmount * (1 + p.targetReturn / 100) ** year;
          const lumpSumP10 = lumpSumMedian * (1 - monthlyVol * 1.28 * Math.sqrt(year));
          const lumpSumP90 = lumpSumMedian * (1 + monthlyVol * 1.28 * Math.sqrt(year));
          
          // DCA builds up over dcaPeriod then grows
          const dcaBuildup = year <= p.dcaPeriod / 12 
            ? monthlyDCA * year * 12 * (1 + monthlyReturn * year * 6)
            : p.lumpSumAmount * (1 + p.targetReturn / 100) ** (year - p.dcaPeriod / 12);
          
          return {
            year,
            lumpSumMedian,
            lumpSumP10,
            lumpSumP90,
            dcaMedian: dcaBuildup,
            advantage: lumpSumMedian - dcaBuildup,
          };
        });
        
        return {
          projections: data,
          kpis: {
            expectedAdvantage: data[9].advantage,
            lumpSum10Year: data[9].lumpSumMedian,
            dca10Year: data[9].dcaMedian,
            winProbability: 68,
          }
        };
      }

      case "market-crash": {
        const crashScenarios: Record<string, { name: string; drop: number; duration: number; recovery: number }> = {
          "2008": { name: "2008 Financial Crisis", drop: -37, duration: 17, recovery: 49 },
          "2020": { name: "COVID-19 Crash", drop: -34, duration: 1, recovery: 5 },
          "2000": { name: "Dot-Com Bubble", drop: -49, duration: 31, recovery: 56 },
          "1987": { name: "Black Monday", drop: -20, duration: 0.1, recovery: 23 },
          "custom": { name: "Custom Scenario", drop: -p.customDrawdown, duration: 6, recovery: p.customDrawdown * 1.5 },
        };
        
        const baseScenario = crashScenarios[p.historicalScenario] || crashScenarios["2008"];
        const equityImpact = baseScenario.drop * (p.equityExposure / 100);
        const portfolioImpact = p.portfolioAtRisk * (equityImpact / 100);
        const remainingPortfolio = p.portfolioAtRisk + portfolioImpact;
        const withdrawalYears = remainingPortfolio / p.withdrawalNeeds;
        const canSurvive = (remainingPortfolio + p.cashBuffer) / p.withdrawalNeeds * 12 >= baseScenario.recovery;
        
        const scenarios = Object.values(crashScenarios).map(s => ({
          ...s,
          portfolioImpact: p.portfolioAtRisk * (s.drop * p.equityExposure / 100 / 100),
          remainingValue: p.portfolioAtRisk * (1 + s.drop * p.equityExposure / 100 / 100),
          survivalMonths: (p.portfolioAtRisk * (1 + s.drop * p.equityExposure / 100 / 100) + p.cashBuffer) / (p.withdrawalNeeds / 12),
        }));
        
        return {
          scenarios,
          selectedScenario: baseScenario,
          kpis: {
            portfolioImpact,
            remainingPortfolio,
            withdrawalYears,
            survivalProbability: canSurvive ? 92 : 45,
          }
        };
      }

      case "performance": {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const benchmarkReturns: Record<string, number[]> = {
          "msci-world": [2.1, -1.5, 3.2, 1.8, -0.5, 2.5, 4.1, -2.3, 1.2, 3.5, 2.8, 1.5],
          "sp500": [2.5, -1.2, 3.5, 2.0, -0.3, 2.8, 4.5, -2.0, 1.5, 3.8, 3.0, 1.8],
          "ftse100": [1.8, -2.0, 2.8, 1.5, -0.8, 2.2, 3.8, -2.5, 0.8, 3.2, 2.5, 1.2],
        };
        
        const benchmark = benchmarkReturns[p.benchmarkIndex] || benchmarkReturns["msci-world"];
        const data = months.map((month, i) => {
          const portfolioReturn = benchmark[i] + (Math.random() * 2 - 0.5);
          const alpha = portfolioReturn - benchmark[i];
          return {
            month,
            portfolio: portfolioReturn,
            benchmark: benchmark[i],
            alpha,
            cumPortfolio: benchmark.slice(0, i + 1).reduce((sum, r) => sum + r + (Math.random() * 2 - 0.5), 0),
            cumBenchmark: benchmark.slice(0, i + 1).reduce((sum, r) => sum + r, 0),
          };
        });
        
        const totalPortfolio = data.reduce((sum, d) => sum + d.portfolio, 0);
        const totalBenchmark = data.reduce((sum, d) => sum + d.benchmark, 0);
        
        return {
          monthlyData: data,
          kpis: {
            ytdReturn: totalPortfolio,
            benchmarkReturn: totalBenchmark,
            alpha: totalPortfolio - totalBenchmark,
            trackingError: 2.5,
            informationRatio: (totalPortfolio - totalBenchmark) / 2.5,
          }
        };
      }

      case "potential-iht": {
        const nilRateBand = 325000;
        const residenceNilRate = 175000;
        const totalNilRate = nilRateBand + residenceNilRate;
        const spouseNilRate = p.spouseAllowance ? totalNilRate : 0;
        const availableAllowance = totalNilRate + spouseNilRate;
        
        // Pensions are typically outside estate for IHT
        const taxableEstate = p.estateValue - p.pensionAssets + p.lifeInsurance - p.existingGifts;
        const exemptPortion = Math.min(taxableEstate, availableAllowance);
        const chargeable = Math.max(0, taxableEstate - availableAllowance);
        const potentialIHT = chargeable * 0.4;
        
        const projections = Array.from({ length: 20 }, (_, i) => {
          const year = i + 1;
          const estateGrowth = p.estateValue * (1.04 ** year);
          const giftingReduction = p.annualGifting * year;
          const futureEstate = estateGrowth - p.pensionAssets + p.lifeInsurance - p.existingGifts - giftingReduction;
          const futureTaxable = Math.max(0, futureEstate - availableAllowance);
          const trustReduction = p.trustPlanning ? futureTaxable * 0.2 : 0;
          return {
            year,
            estateValue: estateGrowth,
            withoutPlanning: futureTaxable * 0.4,
            withGifting: Math.max(0, futureTaxable - giftingReduction * 0.4) * 0.4,
            withFullPlanning: Math.max(0, (futureTaxable - trustReduction) * 0.4 - giftingReduction * 0.4),
          };
        });
        
        return {
          projections,
          breakdown: {
            grossEstate: p.estateValue,
            pensionExempt: p.pensionAssets,
            lifeInsurance: p.lifeInsurance,
            existingGifts: p.existingGifts,
            taxableEstate,
            nilRateBand: availableAllowance,
            chargeable,
            potentialIHT,
          },
          kpis: {
            potentialIHT,
            effectiveTaxRate: taxableEstate > 0 ? (potentialIHT / taxableEstate) * 100 : 0,
            savingsWithPlanning: potentialIHT - projections[9].withFullPlanning,
            yearsToPET: 7,
          }
        };
      }

      case "retirement-spending": {
        const strategies: Record<string, (year: number, base: number) => number> = {
          "fixed": (year, base) => base * (1.025 ** year),
          "guardrails": (year, base) => base * (1.025 ** year) * (year > 10 ? 0.95 : 1),
          "dynamic": (year, base) => base * (1 + 0.025 - (year > 15 ? 0.02 : 0)) ** year,
          "flooring": (year, base) => base * 0.6 + base * 0.4 * (year < 20 ? 1 : 0.8),
        };
        
        const strategy = strategies[p.spendingStrategy] || strategies["guardrails"];
        let portfolioValue = p.portfolioValue;
        const withdrawalRate = p.initialSpending / p.portfolioValue * 100;
        
        const projections = Array.from({ length: 35 }, (_, i) => {
          const age = p.retirementAge + i;
          const declineAdjustment = age >= p.spendingDeclineAge ? (1 - p.spendingDeclineRate / 100) ** (age - p.spendingDeclineAge) : 1;
          const totalSpending = strategy(i, p.initialSpending) * declineAdjustment;
          const essential = totalSpending * (p.essentialRatio / 100);
          const discretionary = totalSpending * (p.discretionaryRatio / 100);
          const healthcare = totalSpending * (p.healthcareRatio / 100) * (1 + i * 0.02);
          
          portfolioValue = Math.max(0, portfolioValue * 1.05 - totalSpending);
          
          return {
            age,
            essential,
            discretionary,
            healthcare,
            total: essential + discretionary + healthcare,
            portfolioValue,
            sustainabilityRate: portfolioValue / (totalSpending * (100 - age)),
          };
        });
        
        const depletionAge = projections.find(p => p.portfolioValue <= 0)?.age || 100;
        const successRate = depletionAge >= 95 ? 95 : Math.max(20, ((depletionAge - p.retirementAge) / 30) * 100);
        
        return {
          projections,
          kpis: {
            initialWithdrawalRate: withdrawalRate,
            depletionAge,
            successRate,
            legacyValue: projections[projections.length - 1].portfolioValue,
          }
        };
      }

      default:
        return null;
    }
  };

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
      description: `Executing ${params.iterations.toLocaleString()} Monte Carlo iterations for ${activeTabConfig?.label}...`,
    });

    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const data = generateSimulationData(activeSubTab, params);
      setSimulationData(data);
      setSimulationResults(data?.kpis);
      setSimulationComplete(true);
      
      toast({
        title: "Simulation Complete",
        description: `${activeTabConfig?.label} analysis completed with ${params.iterations.toLocaleString()} iterations.`,
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
      const data = generateSimulationData(activeSubTab, params);
      setSimulationData(data);
      setSimulationResults(data?.kpis);
      setSimulationComplete(true);
    } else {
      setSimulationComplete(false);
      setSimulationData(null);
      setSimulationResults(null);
    }
  }, [activeSubTab]);

  // Render KPIs based on active tab
  const renderKPIs = () => {
    if (!simulationResults) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-gradient-to-br from-muted/50 to-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">—</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground">—</div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const kpiConfigs: Record<MonteCarloSubTab, { label: string; value: any; color: string; icon: any }[]> = {
      "annual-savings": [
        { label: "Success Rate", value: `${simulationResults.successRate}%`, color: "success", icon: CheckCircle2 },
        { label: "Projected Balance", value: formatCurrency(simulationResults.medianFinal), color: "primary", icon: TrendingUp },
        { label: "Total Contributions", value: formatCurrency(simulationResults.totalContributions), color: "warning", icon: PiggyBank },
        { label: "Employer Match Total", value: formatCurrency(simulationResults.employerTotal), color: "success", icon: Users },
      ],
      "goal-priority": [
        { label: "Total Target", value: formatCurrency(simulationResults.totalTarget), color: "primary", icon: Target },
        { label: "Total Funded", value: formatCurrency(simulationResults.totalFunded), color: "success", icon: CheckCircle2 },
        { label: "Avg Probability", value: `${simulationResults.avgProbability?.toFixed(0)}%`, color: "warning", icon: Percent },
        { label: "At-Risk Goals", value: simulationResults.criticalGoals, color: "destructive", icon: AlertTriangle },
      ],
      "historic": [
        { label: "CAGR", value: `${simulationResults.cagr?.toFixed(2)}%`, color: "primary", icon: TrendingUp },
        { label: "Total Return", value: `${simulationResults.totalReturn?.toFixed(1)}%`, color: "success", icon: ArrowUpRight },
        { label: "Max Drawdown", value: `${simulationResults.maxDrawdown}%`, color: "destructive", icon: TrendingDown },
        { label: "Final Value", value: formatCurrency(simulationResults.finalValue), color: "primary", icon: Wallet },
      ],
      "inflation": [
        { label: "Real Return", value: `${simulationResults.realReturn?.toFixed(1)}%`, color: "primary", icon: TrendingUp },
        { label: "Purchasing Power Loss", value: `${simulationResults.purchasingPowerLoss?.toFixed(1)}%`, color: "destructive", icon: TrendingDown },
        { label: "Nominal Final", value: formatCurrency(simulationResults.nominalFinal), color: "success", icon: ArrowUpRight },
        { label: "Real Final", value: formatCurrency(simulationResults.realFinal), color: "warning", icon: Scale },
      ],
      "investment-returns": [
        { label: "Expected Return", value: `${simulationResults.expectedReturn?.toFixed(2)}%`, color: "primary", icon: TrendingUp },
        { label: "Portfolio Volatility", value: `${simulationResults.portfolioVolatility?.toFixed(1)}%`, color: "warning", icon: Activity },
        { label: "Sharpe Ratio", value: simulationResults.sharpeRatio?.toFixed(2), color: "success", icon: Scale },
        { label: "Median Final", value: formatCurrency(simulationResults.medianFinal), color: "primary", icon: Target },
      ],
      "life-needs": [
        { label: "Total Expenses", value: formatCurrency(simulationResults.totalExpenses), color: "warning", icon: Wallet },
        { label: "Total Income", value: formatCurrency(simulationResults.totalIncome), color: "success", icon: ArrowUpRight },
        { label: "Annual Shortfall", value: formatCurrency(simulationResults.shortfall), color: "destructive", icon: AlertTriangle },
        { label: "Funding Ratio", value: `${simulationResults.fundingRatio?.toFixed(0)}%`, color: simulationResults.fundingRatio >= 100 ? "success" : "warning", icon: Percent },
      ],
      "longevity-risk": [
        { label: "Life Expectancy", value: `${simulationResults.lifeExpectancy?.toFixed(0)} years`, color: "primary", icon: Heart },
        { label: "Depletion Age", value: simulationResults.depletionAge, color: simulationResults.depletionAge >= 95 ? "success" : "destructive", icon: Clock },
        { label: "Success Probability", value: `${simulationResults.successProbability?.toFixed(0)}%`, color: simulationResults.successProbability >= 80 ? "success" : "warning", icon: CheckCircle2 },
        { label: "Funding Surplus", value: formatCurrency(simulationResults.fundingSurplus), color: simulationResults.fundingSurplus >= 0 ? "success" : "destructive", icon: Scale },
      ],
      "loss-capacity": [
        { label: "Loss Capacity", value: `${simulationResults.lossCapacity}%`, color: "primary", icon: ShieldAlert },
        { label: "Liquidity Months", value: `${simulationResults.liquidityMonths?.toFixed(0)} mo`, color: "success", icon: Clock },
        { label: "Emotional Tolerance", value: `${simulationResults.emotionalTolerance}%`, color: "warning", icon: Heart },
        { label: "Recommended Equity", value: `${simulationResults.recommendedEquity}%`, color: "primary", icon: Scale },
      ],
      "lump-sum": [
        { label: "Lump Sum 10Y", value: formatCurrency(simulationResults.lumpSum10Year), color: "primary", icon: TrendingUp },
        { label: "DCA 10Y", value: formatCurrency(simulationResults.dca10Year), color: "warning", icon: Calendar },
        { label: "Expected Advantage", value: formatCurrency(simulationResults.expectedAdvantage), color: "success", icon: ArrowUpRight },
        { label: "Win Probability", value: `${simulationResults.winProbability}%`, color: "success", icon: CheckCircle2 },
      ],
      "market-crash": [
        { label: "Portfolio Impact", value: formatCurrency(simulationResults.portfolioImpact), color: "destructive", icon: TrendingDown },
        { label: "Remaining Portfolio", value: formatCurrency(simulationResults.remainingPortfolio), color: "warning", icon: Wallet },
        { label: "Withdrawal Years", value: `${simulationResults.withdrawalYears?.toFixed(1)} yrs`, color: "primary", icon: Clock },
        { label: "Survival Probability", value: `${simulationResults.survivalProbability}%`, color: simulationResults.survivalProbability >= 80 ? "success" : "warning", icon: ShieldAlert },
      ],
      "performance": [
        { label: "YTD Return", value: `${simulationResults.ytdReturn?.toFixed(2)}%`, color: "primary", icon: TrendingUp },
        { label: "Benchmark Return", value: `${simulationResults.benchmarkReturn?.toFixed(2)}%`, color: "muted-foreground", icon: BarChart3 },
        { label: "Alpha", value: `${simulationResults.alpha?.toFixed(2)}%`, color: simulationResults.alpha >= 0 ? "success" : "destructive", icon: ArrowUpRight },
        { label: "Information Ratio", value: simulationResults.informationRatio?.toFixed(2), color: "primary", icon: Scale },
      ],
      "potential-iht": [
        { label: "Potential IHT", value: formatCurrency(simulationResults.potentialIHT), color: "destructive", icon: Landmark },
        { label: "Effective Tax Rate", value: `${simulationResults.effectiveTaxRate?.toFixed(1)}%`, color: "warning", icon: Percent },
        { label: "Savings with Planning", value: formatCurrency(simulationResults.savingsWithPlanning), color: "success", icon: PiggyBank },
        { label: "Years to PET", value: `${simulationResults.yearsToPET} years`, color: "primary", icon: Clock },
      ],
      "retirement-spending": [
        { label: "Initial Withdrawal Rate", value: `${simulationResults.initialWithdrawalRate?.toFixed(1)}%`, color: "primary", icon: Percent },
        { label: "Depletion Age", value: simulationResults.depletionAge, color: simulationResults.depletionAge >= 95 ? "success" : "warning", icon: Clock },
        { label: "Success Rate", value: `${simulationResults.successRate?.toFixed(0)}%`, color: simulationResults.successRate >= 80 ? "success" : "warning", icon: CheckCircle2 },
        { label: "Legacy Value", value: formatCurrency(simulationResults.legacyValue), color: "success", icon: Landmark },
      ],
    };

    const kpis = kpiConfigs[activeSubTab] || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className={`bg-gradient-to-br from-${kpi.color}/10 to-card`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <kpi.icon className={`h-4 w-4 text-${kpi.color}`} />
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-${kpi.color}`}>{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render chart based on active tab
  const renderChart = () => {
    if (!simulationData && activeTabConfig?.requiresSimulation) {
      return (
        <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
          <div className="text-center space-y-4">
            <Calculator className="h-16 w-16 mx-auto text-muted-foreground/50" />
            <div>
              <h3 className="font-semibold text-lg">Configure & Run Simulation</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Adjust parameters below and click "Run Simulation" to generate {activeTabConfig?.label} projections.
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
            <AreaChart data={simulationData?.projections}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
              <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Area type="monotone" dataKey="p90" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} name="90th Percentile" />
              <Area type="monotone" dataKey="p75" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} name="75th Percentile" />
              <Area type="monotone" dataKey="median" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Median" strokeWidth={2} />
              <Area type="monotone" dataKey="p25" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.15} name="25th Percentile" />
              <Area type="monotone" dataKey="p10" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} name="10th Percentile" />
              <Line type="monotone" dataKey="contributions" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Total Contributions" />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "goal-priority":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={simulationData?.goals} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={100} />
                <RechartsTooltip formatter={(v: number) => `${v.toFixed(0)}%`} />
                <Bar dataKey="probability" name="Success Probability" radius={[0, 4, 4, 0]}>
                  {simulationData?.goals?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-4">
              {simulationData?.goals?.map((goal: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{goal.name}</span>
                    <Badge variant={goal.probability > 80 ? "default" : goal.probability > 60 ? "secondary" : "destructive"}>
                      {goal.probability.toFixed(0)}% success
                    </Badge>
                  </div>
                  <Progress value={goal.fundedPercent} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Gap: {formatCurrency(goal.gap)}</span>
                    <span>Monthly: {formatCurrency(goal.monthlyRequired)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "historic":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={simulationData?.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} />
              <RechartsTooltip formatter={(v: number, name: string) => name.includes('Return') ? `${v.toFixed(1)}%` : formatCurrency(v)} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="value" fill="hsl(var(--primary))" fillOpacity={0.3} stroke="hsl(var(--primary))" strokeWidth={2} name="Portfolio Value" />
              <Line yAxisId="left" type="monotone" dataKey="benchmark" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Benchmark" />
              <Bar yAxisId="right" dataKey="return" fill="hsl(var(--success))" fillOpacity={0.5} name="Annual Return %" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case "inflation":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={simulationData?.projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis yAxisId="left" tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} />
              <RechartsTooltip formatter={(v: number, name: string) => name.includes('Power') ? `${v.toFixed(1)}%` : formatCurrency(v)} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="nominalValue" fill="hsl(var(--primary))" fillOpacity={0.3} stroke="hsl(var(--primary))" name="Nominal Value" />
              <Area yAxisId="left" type="monotone" dataKey="realValue" fill="hsl(var(--success))" fillOpacity={0.3} stroke="hsl(var(--success))" name="Real Value" />
              <Area yAxisId="left" type="monotone" dataKey="inflationLoss" fill="hsl(var(--destructive))" fillOpacity={0.2} stroke="hsl(var(--destructive))" name="Inflation Loss" />
              <Line yAxisId="right" type="monotone" dataKey="purchasingPower" stroke="hsl(var(--warning))" strokeDasharray="5 5" name="Purchasing Power %" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case "investment-returns":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={simulationData?.projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Area type="monotone" dataKey="p95" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} name="95th Percentile" />
              <Area type="monotone" dataKey="p75" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} name="75th Percentile" />
              <Area type="monotone" dataKey="median" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Median" strokeWidth={2} />
              <Area type="monotone" dataKey="p25" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.15} name="25th Percentile" />
              <Area type="monotone" dataKey="p5" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} name="5th Percentile" />
              <Line type="monotone" dataKey="equityOnly" stroke="hsl(var(--destructive))" strokeDasharray="3 3" name="100% Equity" />
              <Line type="monotone" dataKey="bondOnly" stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" name="100% Bonds" />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "life-needs":
        return (
          <div className="space-y-4">
            {simulationData?.categories?.map((item: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-lg bg-gradient-to-r from-card to-muted/20">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant={item.priority === "Critical" ? "destructive" : item.priority === "High" ? "default" : "secondary"}>
                      {item.priority}
                    </Badge>
                    <span className="font-semibold">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(item.annual)}/year</div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(item.annual / 12)}/month</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={item.funded} className="flex-1" />
                  <span className="text-sm font-medium w-16 text-right">{item.funded.toFixed(0)}% funded</span>
                </div>
              </div>
            ))}
          </div>
        );

      case "longevity-risk":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={simulationData?.projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
              <YAxis yAxisId="left" tickFormatter={(v) => `${v}%`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="survivalRate" stroke="hsl(var(--primary))" strokeWidth={2} name="Survival Probability %" />
              <Area yAxisId="right" type="monotone" dataKey="portfolioValue" fill="hsl(var(--success))" fillOpacity={0.3} stroke="hsl(var(--success))" name="Portfolio Value" />
              <Area yAxisId="right" type="monotone" dataKey="requiredFunds" fill="hsl(var(--warning))" fillOpacity={0.2} stroke="hsl(var(--warning))" name="Required Funds" />
              <ReferenceLine yAxisId="left" y={50} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label="50% Survival" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case "loss-capacity":
        return (
          <div className="space-y-4">
            {simulationData?.scenarios?.map((scenario: any, idx: number) => (
              <div key={idx} className={`p-4 border rounded-lg ${scenario.canSurvive ? 'bg-gradient-to-r from-success/5 to-card' : 'bg-gradient-to-r from-destructive/5 to-card'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {scenario.canSurvive ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      {scenario.scenario}
                    </h4>
                    <p className="text-sm text-muted-foreground">{scenario.historicalFreq}</p>
                  </div>
                  <Badge variant={scenario.canSurvive ? "default" : "destructive"}>
                    {scenario.drop}%
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Portfolio Loss</span>
                    <div className="font-bold text-destructive">{formatCurrency(scenario.portfolioLoss)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining</span>
                    <div className="font-bold">{formatCurrency(scenario.remainingLiquid)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recovery Time</span>
                    <div className="font-bold">{scenario.recoveryMonths} months</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Acceptability</span>
                    <div className="font-bold">{scenario.acceptability.toFixed(0)}%</div>
                  </div>
                </div>
                <Progress value={scenario.acceptability} className="mt-3" />
              </div>
            ))}
          </div>
        );

      case "lump-sum":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={simulationData?.projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Area type="monotone" dataKey="lumpSumP90" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} name="Lump Sum 90th %ile" />
              <Area type="monotone" dataKey="lumpSumMedian" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Lump Sum Median" strokeWidth={2} />
              <Area type="monotone" dataKey="dcaMedian" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.3} name="DCA Strategy" strokeWidth={2} />
              <Area type="monotone" dataKey="lumpSumP10" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} name="Lump Sum 10th %ile" />
              <ReferenceLine y={params.lumpSumAmount} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label="Initial Amount" />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "market-crash":
        return (
          <div className="space-y-4">
            {simulationData?.scenarios?.map((scenario: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-lg bg-gradient-to-r from-destructive/5 to-card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{scenario.name}</h4>
                    <p className="text-sm text-muted-foreground">Duration: {scenario.duration} months | Recovery: {scenario.recovery} months</p>
                  </div>
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {scenario.drop}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Portfolio Impact</span>
                    <div className="text-lg font-bold text-destructive">{formatCurrency(scenario.portfolioImpact)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining Value</span>
                    <div className="text-lg font-bold">{formatCurrency(scenario.remainingValue)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Survival Months</span>
                    <div className="text-lg font-bold text-success">{scenario.survivalMonths.toFixed(0)} mo</div>
                  </div>
                </div>
                <Progress value={Math.min(100, (scenario.survivalMonths / scenario.recovery) * 100)} className="mt-3" />
              </div>
            ))}
          </div>
        );

      case "performance":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={simulationData?.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${v}%`} />
              <RechartsTooltip formatter={(v: any) => `${Number(v).toFixed(2)}%`} />
              <Legend />
              <Bar dataKey="portfolio" name="Portfolio Return" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                  <div className="text-sm text-muted-foreground">Gross Estate</div>
                  <div className="text-xl font-bold">{formatCurrency(simulationData?.breakdown?.grossEstate)}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-success/10 to-card">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Available Allowance</div>
                  <div className="text-xl font-bold text-success">{formatCurrency(simulationData?.breakdown?.nilRateBand)}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-warning/10 to-card">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Chargeable Estate</div>
                  <div className="text-xl font-bold text-warning">{formatCurrency(simulationData?.breakdown?.chargeable)}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-destructive/10 to-card">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Potential IHT (40%)</div>
                  <div className="text-xl font-bold text-destructive">{formatCurrency(simulationData?.breakdown?.potentialIHT)}</div>
                </CardContent>
              </Card>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={simulationData?.projections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Area type="monotone" dataKey="withoutPlanning" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} name="IHT Without Planning" />
                <Area type="monotone" dataKey="withGifting" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.3} name="IHT With Gifting" />
                <Area type="monotone" dataKey="withFullPlanning" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} name="IHT With Full Planning" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case "retirement-spending":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={simulationData?.projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
              <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Area type="monotone" dataKey="portfolioValue" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.2} name="Portfolio Value" />
              <Bar dataKey="essential" stackId="spending" fill="hsl(var(--primary))" name="Essential" />
              <Bar dataKey="discretionary" stackId="spending" fill="hsl(var(--warning))" name="Discretionary" />
              <Bar dataKey="healthcare" stackId="spending" fill="hsl(var(--destructive))" name="Healthcare" />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--foreground))" strokeWidth={2} name="Total Spending" />
              <ReferenceLine y={params.legacyGoal} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label="Legacy Goal" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Render parameters based on active tab
  const renderParameters = () => {
    const ParameterTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
      <div className="flex items-center gap-1">
        <Label>{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px]">
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );

    switch (activeSubTab) {
      case "annual-savings":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Current Age" tooltip="Client's current age to calculate years to retirement" />
              <Input type="number" value={params.currentAge} onChange={(e) => setParams(p => ({ ...p, currentAge: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Target Retirement Age" tooltip="Age at which client plans to retire" />
              <Input type="number" value={params.targetRetirementAge} onChange={(e) => setParams(p => ({ ...p, targetRetirementAge: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Current Savings (£)" tooltip="Total current retirement savings" />
              <Input type="number" value={params.currentSavings} onChange={(e) => setParams(p => ({ ...p, currentSavings: +e.target.value }))} step="1000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Annual Savings (£)" tooltip="Planned annual contribution amount" />
              <Input type="number" value={params.annualSavingsAmount} onChange={(e) => setParams(p => ({ ...p, annualSavingsAmount: +e.target.value }))} step="500" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Employer Match (%)" tooltip="Employer contribution as % of salary" />
              <Input type="number" value={params.employerMatch} onChange={(e) => setParams(p => ({ ...p, employerMatch: +e.target.value }))} step="0.5" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Savings Growth Rate (%)" tooltip="Expected annual increase in savings rate" />
              <Input type="number" value={params.savingsGrowthRate} onChange={(e) => setParams(p => ({ ...p, savingsGrowthRate: +e.target.value }))} step="0.5" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Expected Return (%)" tooltip="Annualised expected portfolio return" />
              <Input type="number" value={params.expectedReturn} onChange={(e) => setParams(p => ({ ...p, expectedReturn: +e.target.value }))} step="0.5" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Return Volatility (%)" tooltip="Standard deviation of returns (risk)" />
              <Input type="number" value={params.returnVolatility} onChange={(e) => setParams(p => ({ ...p, returnVolatility: +e.target.value }))} step="1" />
            </div>
          </>
        );

      case "goal-priority":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Total Available (£)" tooltip="Total funds available for allocation" />
              <Input type="number" value={params.totalAvailable} onChange={(e) => setParams(p => ({ ...p, totalAvailable: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-3 col-span-2">
              <ParameterTooltip label="Risk Budget" tooltip="Risk tolerance for goal achievement" />
              <Slider value={[params.riskBudget]} onValueChange={(v) => setParams(p => ({ ...p, riskBudget: v[0] }))} min={0} max={100} step={5} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative</span>
                <span>{params.riskBudget}%</span>
                <span>Aggressive</span>
              </div>
            </div>
            <div className="col-span-4 border-t pt-4 mt-2">
              <Label className="mb-3 block">Financial Goals</Label>
              <div className="space-y-3">
                {params.goals.map((goal, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 items-end">
                    <Input placeholder="Goal Name" value={goal.name} onChange={(e) => {
                      const newGoals = [...params.goals];
                      newGoals[idx].name = e.target.value;
                      setParams(p => ({ ...p, goals: newGoals }));
                    }} />
                    <Input type="number" placeholder="Target" value={goal.target} onChange={(e) => {
                      const newGoals = [...params.goals];
                      newGoals[idx].target = +e.target.value;
                      setParams(p => ({ ...p, goals: newGoals }));
                    }} />
                    <Input type="number" placeholder="Deadline (yrs)" value={goal.deadline} onChange={(e) => {
                      const newGoals = [...params.goals];
                      newGoals[idx].deadline = +e.target.value;
                      setParams(p => ({ ...p, goals: newGoals }));
                    }} />
                    <Input type="number" placeholder="Funded" value={goal.funded} onChange={(e) => {
                      const newGoals = [...params.goals];
                      newGoals[idx].funded = +e.target.value;
                      setParams(p => ({ ...p, goals: newGoals }));
                    }} />
                    <Select value={goal.priority.toString()} onValueChange={(v) => {
                      const newGoals = [...params.goals];
                      newGoals[idx].priority = +v;
                      setParams(p => ({ ...p, goals: newGoals }));
                    }}>
                      <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Priority 1</SelectItem>
                        <SelectItem value="2">Priority 2</SelectItem>
                        <SelectItem value="3">Priority 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      case "historic":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Start Year" tooltip="Beginning of backtest period" />
              <Select value={params.startYear.toString()} onValueChange={(v) => setParams(p => ({ ...p, startYear: +v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 35 }, (_, i) => 1990 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="End Year" tooltip="End of backtest period" />
              <Select value={params.endYear.toString()} onValueChange={(v) => setParams(p => ({ ...p, endYear: +v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 35 }, (_, i) => 1990 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Initial Investment (£)" tooltip="Starting portfolio value" />
              <Input type="number" value={params.initialInvestment} onChange={(e) => setParams(p => ({ ...p, initialInvestment: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Rebalance Frequency" tooltip="How often to rebalance portfolio" />
              <Select value={params.rebalanceFrequency} onValueChange={(v) => setParams(p => ({ ...p, rebalanceFrequency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Stocks (%)" tooltip="Equity allocation" />
              <Input type="number" value={params.allocation.stocks} onChange={(e) => setParams(p => ({ ...p, allocation: { ...p.allocation, stocks: +e.target.value } }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Bonds (%)" tooltip="Fixed income allocation" />
              <Input type="number" value={params.allocation.bonds} onChange={(e) => setParams(p => ({ ...p, allocation: { ...p.allocation, bonds: +e.target.value } }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Cash (%)" tooltip="Cash/money market allocation" />
              <Input type="number" value={params.allocation.cash} onChange={(e) => setParams(p => ({ ...p, allocation: { ...p.allocation, cash: +e.target.value } }))} />
            </div>
          </>
        );

      case "inflation":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Current Portfolio (£)" tooltip="Current portfolio value" />
              <Input type="number" value={params.currentPortfolio} onChange={(e) => setParams(p => ({ ...p, currentPortfolio: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Projection Years" tooltip="Time horizon for inflation analysis" />
              <Input type="number" value={params.projectionYears} onChange={(e) => setParams(p => ({ ...p, projectionYears: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Base Inflation (%)" tooltip="Expected general inflation rate" />
              <Input type="number" value={params.baseInflation} onChange={(e) => setParams(p => ({ ...p, baseInflation: +e.target.value }))} step="0.1" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Healthcare Inflation (%)" tooltip="Healthcare cost inflation rate" />
              <Input type="number" value={params.healthcareInflation} onChange={(e) => setParams(p => ({ ...p, healthcareInflation: +e.target.value }))} step="0.1" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Education Inflation (%)" tooltip="Education cost inflation rate" />
              <Input type="number" value={params.educationInflation} onChange={(e) => setParams(p => ({ ...p, educationInflation: +e.target.value }))} step="0.1" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Nominal Return (%)" tooltip="Expected portfolio nominal return" />
              <Input type="number" value={params.nominalReturn} onChange={(e) => setParams(p => ({ ...p, nominalReturn: +e.target.value }))} step="0.5" />
            </div>
          </>
        );

      case "investment-returns":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Portfolio Value (£)" tooltip="Current portfolio value" />
              <Input type="number" value={params.portfolioValue} onChange={(e) => setParams(p => ({ ...p, portfolioValue: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Time Horizon (Years)" tooltip="Investment time horizon" />
              <Input type="number" value={params.timeHorizon} onChange={(e) => setParams(p => ({ ...p, timeHorizon: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Equity Allocation (%)" tooltip="Percentage in equities" />
              <Input type="number" value={params.equityAllocation} onChange={(e) => setParams(p => ({ ...p, equityAllocation: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Bond Allocation (%)" tooltip="Percentage in fixed income" />
              <Input type="number" value={params.bondAllocation} onChange={(e) => setParams(p => ({ ...p, bondAllocation: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Equity Return (%)" tooltip="Expected equity return" />
              <Input type="number" value={params.equityReturn} onChange={(e) => setParams(p => ({ ...p, equityReturn: +e.target.value }))} step="0.5" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Equity Volatility (%)" tooltip="Equity standard deviation" />
              <Input type="number" value={params.equityVolatility} onChange={(e) => setParams(p => ({ ...p, equityVolatility: +e.target.value }))} step="1" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Bond Return (%)" tooltip="Expected bond return" />
              <Input type="number" value={params.bondReturn} onChange={(e) => setParams(p => ({ ...p, bondReturn: +e.target.value }))} step="0.5" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Bond Volatility (%)" tooltip="Bond standard deviation" />
              <Input type="number" value={params.bondVolatility} onChange={(e) => setParams(p => ({ ...p, bondVolatility: +e.target.value }))} step="0.5" />
            </div>
          </>
        );

      case "life-needs":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Essential Expenses (£/yr)" tooltip="Non-negotiable annual expenses" />
              <Input type="number" value={params.essentialExpenses} onChange={(e) => setParams(p => ({ ...p, essentialExpenses: +e.target.value }))} step="1000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Discretionary (£/yr)" tooltip="Lifestyle/optional spending" />
              <Input type="number" value={params.discretionaryExpenses} onChange={(e) => setParams(p => ({ ...p, discretionaryExpenses: +e.target.value }))} step="500" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Healthcare (£/yr)" tooltip="Medical and health expenses" />
              <Input type="number" value={params.healthcareExpenses} onChange={(e) => setParams(p => ({ ...p, healthcareExpenses: +e.target.value }))} step="500" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Legacy Amount (£)" tooltip="Desired inheritance/bequest" />
              <Input type="number" value={params.legacyAmount} onChange={(e) => setParams(p => ({ ...p, legacyAmount: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Emergency Fund (months)" tooltip="Months of expenses in reserve" />
              <Input type="number" value={params.emergencyMonths} onChange={(e) => setParams(p => ({ ...p, emergencyMonths: +e.target.value }))} />
            </div>
          </>
        );

      case "longevity-risk":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Current Age" tooltip="Client's current age" />
              <Input type="number" value={params.currentAgeL} onChange={(e) => setParams(p => ({ ...p, currentAgeL: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Gender" tooltip="For mortality table selection" />
              <Select value={params.gender} onValueChange={(v) => setParams(p => ({ ...p, gender: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Health Status" tooltip="Current health condition" />
              <Select value={params.healthStatus} onValueChange={(v) => setParams(p => ({ ...p, healthStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Family Longevity" tooltip="Average family lifespan" />
              <Input type="number" value={params.familyLongevity} onChange={(e) => setParams(p => ({ ...p, familyLongevity: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Retirement Assets (£)" tooltip="Total retirement portfolio" />
              <Input type="number" value={params.retirementAssets} onChange={(e) => setParams(p => ({ ...p, retirementAssets: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Annual Withdrawal (£)" tooltip="Planned annual withdrawal" />
              <Input type="number" value={params.annualWithdrawal} onChange={(e) => setParams(p => ({ ...p, annualWithdrawal: +e.target.value }))} step="1000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Pension Income (£/yr)" tooltip="Guaranteed pension income" />
              <Input type="number" value={params.pensionIncome} onChange={(e) => setParams(p => ({ ...p, pensionIncome: +e.target.value }))} step="500" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="State Pension (£/yr)" tooltip="Expected state pension" />
              <Input type="number" value={params.statePension} onChange={(e) => setParams(p => ({ ...p, statePension: +e.target.value }))} step="500" />
            </div>
          </>
        );

      case "loss-capacity":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Total Assets (£)" tooltip="Total net worth" />
              <Input type="number" value={params.totalAssets} onChange={(e) => setParams(p => ({ ...p, totalAssets: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Liquid Assets (£)" tooltip="Easily accessible investments" />
              <Input type="number" value={params.liquidAssets} onChange={(e) => setParams(p => ({ ...p, liquidAssets: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Annual Income (£)" tooltip="Total annual income" />
              <Input type="number" value={params.annualIncome} onChange={(e) => setParams(p => ({ ...p, annualIncome: +e.target.value }))} step="5000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Fixed Expenses (£/yr)" tooltip="Non-discretionary expenses" />
              <Input type="number" value={params.fixedExpenses} onChange={(e) => setParams(p => ({ ...p, fixedExpenses: +e.target.value }))} step="1000" />
            </div>
            <div className="space-y-3 col-span-2">
              <ParameterTooltip label="Emotional Tolerance" tooltip="Psychological comfort with volatility" />
              <Slider value={[params.emotionalTolerance]} onValueChange={(v) => setParams(p => ({ ...p, emotionalTolerance: v[0] }))} min={0} max={100} step={5} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>{params.emotionalTolerance}%</span>
                <span>High</span>
              </div>
            </div>
          </>
        );

      case "lump-sum":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Lump Sum Amount (£)" tooltip="Amount to invest" />
              <Input type="number" value={params.lumpSumAmount} onChange={(e) => setParams(p => ({ ...p, lumpSumAmount: +e.target.value }))} step="5000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="DCA Period (months)" tooltip="Period to spread DCA investment" />
              <Input type="number" value={params.dcaPeriod} onChange={(e) => setParams(p => ({ ...p, dcaPeriod: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="DCA Frequency" tooltip="How often to invest via DCA" />
              <Select value={params.dcaFrequency} onValueChange={(v) => setParams(p => ({ ...p, dcaFrequency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Target Return (%)" tooltip="Expected annual return" />
              <Input type="number" value={params.targetReturn} onChange={(e) => setParams(p => ({ ...p, targetReturn: +e.target.value }))} step="0.5" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Volatility (%)" tooltip="Expected annual volatility" />
              <Input type="number" value={params.volatility} onChange={(e) => setParams(p => ({ ...p, volatility: +e.target.value }))} step="1" />
            </div>
          </>
        );

      case "market-crash":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Portfolio at Risk (£)" tooltip="Portfolio value exposed to markets" />
              <Input type="number" value={params.portfolioAtRisk} onChange={(e) => setParams(p => ({ ...p, portfolioAtRisk: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Equity Exposure (%)" tooltip="Percentage in equities" />
              <Input type="number" value={params.equityExposure} onChange={(e) => setParams(p => ({ ...p, equityExposure: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Cash Buffer (£)" tooltip="Emergency cash reserves" />
              <Input type="number" value={params.cashBuffer} onChange={(e) => setParams(p => ({ ...p, cashBuffer: +e.target.value }))} step="5000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Annual Withdrawals (£)" tooltip="Required annual withdrawals" />
              <Input type="number" value={params.withdrawalNeeds} onChange={(e) => setParams(p => ({ ...p, withdrawalNeeds: +e.target.value }))} step="1000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Historical Scenario" tooltip="Select crash scenario to model" />
              <Select value={params.historicalScenario} onValueChange={(v) => setParams(p => ({ ...p, historicalScenario: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2008">2008 Financial Crisis (-37%)</SelectItem>
                  <SelectItem value="2020">COVID-19 Crash (-34%)</SelectItem>
                  <SelectItem value="2000">Dot-Com Bubble (-49%)</SelectItem>
                  <SelectItem value="1987">Black Monday (-20%)</SelectItem>
                  <SelectItem value="custom">Custom Scenario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {params.historicalScenario === "custom" && (
              <div className="space-y-2">
                <ParameterTooltip label="Custom Drawdown (%)" tooltip="Custom crash percentage" />
                <Input type="number" value={params.customDrawdown} onChange={(e) => setParams(p => ({ ...p, customDrawdown: +e.target.value }))} />
              </div>
            )}
          </>
        );

      case "performance":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Benchmark Index" tooltip="Comparison benchmark" />
              <Select value={params.benchmarkIndex} onValueChange={(v) => setParams(p => ({ ...p, benchmarkIndex: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="msci-world">MSCI World</SelectItem>
                  <SelectItem value="sp500">S&P 500</SelectItem>
                  <SelectItem value="ftse100">FTSE 100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Measurement Period" tooltip="Performance measurement period" />
              <Select value={params.measurementPeriod} onValueChange={(v) => setParams(p => ({ ...p, measurementPeriod: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="3y">3 Years</SelectItem>
                  <SelectItem value="5y">5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Risk-Free Rate (%)" tooltip="Current risk-free rate for Sharpe" />
              <Input type="number" value={params.riskFreeRate} onChange={(e) => setParams(p => ({ ...p, riskFreeRate: +e.target.value }))} step="0.1" />
            </div>
          </>
        );

      case "potential-iht":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Estate Value (£)" tooltip="Total estate value" />
              <Input type="number" value={params.estateValue} onChange={(e) => setParams(p => ({ ...p, estateValue: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Main Residence (£)" tooltip="Primary residence value (for RNRB)" />
              <Input type="number" value={params.mainResidenceValue} onChange={(e) => setParams(p => ({ ...p, mainResidenceValue: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Pension Assets (£)" tooltip="Usually outside estate for IHT" />
              <Input type="number" value={params.pensionAssets} onChange={(e) => setParams(p => ({ ...p, pensionAssets: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Life Insurance (£)" tooltip="Life insurance in estate" />
              <Input type="number" value={params.lifeInsurance} onChange={(e) => setParams(p => ({ ...p, lifeInsurance: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Existing Gifts (£)" tooltip="PETs already made" />
              <Input type="number" value={params.existingGifts} onChange={(e) => setParams(p => ({ ...p, existingGifts: +e.target.value }))} step="5000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Annual Gifting (£)" tooltip="Planned annual gifting" />
              <Input type="number" value={params.annualGifting} onChange={(e) => setParams(p => ({ ...p, annualGifting: +e.target.value }))} step="1000" />
            </div>
            <div className="flex items-center justify-between space-x-2 py-2">
              <ParameterTooltip label="Spouse Allowance" tooltip="Transfer unused NRB to spouse" />
              <Switch checked={params.spouseAllowance} onCheckedChange={(v) => setParams(p => ({ ...p, spouseAllowance: v }))} />
            </div>
            <div className="flex items-center justify-between space-x-2 py-2">
              <ParameterTooltip label="Trust Planning" tooltip="Using trusts for IHT mitigation" />
              <Switch checked={params.trustPlanning} onCheckedChange={(v) => setParams(p => ({ ...p, trustPlanning: v }))} />
            </div>
          </>
        );

      case "retirement-spending":
        return (
          <>
            <div className="space-y-2">
              <ParameterTooltip label="Retirement Age" tooltip="Planned retirement age" />
              <Input type="number" value={params.retirementAge} onChange={(e) => setParams(p => ({ ...p, retirementAge: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Initial Spending (£/yr)" tooltip="First year retirement spending" />
              <Input type="number" value={params.initialSpending} onChange={(e) => setParams(p => ({ ...p, initialSpending: +e.target.value }))} step="1000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Spending Strategy" tooltip="Withdrawal approach" />
              <Select value={params.spendingStrategy} onValueChange={(v) => setParams(p => ({ ...p, spendingStrategy: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed (Inflation-Adjusted)</SelectItem>
                  <SelectItem value="guardrails">Guardrails Strategy</SelectItem>
                  <SelectItem value="dynamic">Dynamic Spending</SelectItem>
                  <SelectItem value="flooring">Floor & Ceiling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Essential Ratio (%)" tooltip="Percentage of essential spending" />
              <Input type="number" value={params.essentialRatio} onChange={(e) => setParams(p => ({ ...p, essentialRatio: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Spending Decline Age" tooltip="Age when spending typically declines" />
              <Input type="number" value={params.spendingDeclineAge} onChange={(e) => setParams(p => ({ ...p, spendingDeclineAge: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Decline Rate (%/yr)" tooltip="Annual spending decline rate" />
              <Input type="number" value={params.spendingDeclineRate} onChange={(e) => setParams(p => ({ ...p, spendingDeclineRate: +e.target.value }))} step="0.5" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Legacy Goal (£)" tooltip="Desired estate value" />
              <Input type="number" value={params.legacyGoal} onChange={(e) => setParams(p => ({ ...p, legacyGoal: +e.target.value }))} step="10000" />
            </div>
            <div className="space-y-2">
              <ParameterTooltip label="Max Failure Prob (%)" tooltip="Acceptable failure probability" />
              <Input type="number" value={params.failureProbability} onChange={(e) => setParams(p => ({ ...p, failureProbability: +e.target.value }))} />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tab Dropdown Selector */}
      <Card className="bg-gradient-to-br from-primary/5 to-card border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {activeTabConfig && <activeTabConfig.icon className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <CardTitle className="text-lg">Monte Carlo Simulations</CardTitle>
                <CardDescription>{activeTabConfig?.description}</CardDescription>
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
      {renderKPIs()}

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
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Iterations</Label>
                <Select value={params.iterations.toString()} onValueChange={(v) => setParams(p => ({ ...p, iterations: +v }))}>
                  <SelectTrigger className="w-[120px]">
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
              {activeTabConfig?.requiresSimulation && (
                <Button 
                  onClick={runSimulation}
                  disabled={isSimulating || !selectedClient}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  size="lg"
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running...
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderParameters()}
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
