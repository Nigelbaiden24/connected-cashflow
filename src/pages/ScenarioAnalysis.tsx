import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import React from "react";
import html2pdf from "html2pdf.js";
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
  Download,
  ArrowLeft
} from "lucide-react";
import { generateFinancialReport } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import MonteCarloSimulations from "@/components/scenario/MonteCarloSimulations";
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
  Scatter,
  ScatterChart,
  ZAxis,
  Cell
} from "recharts";

// Monte Carlo Simulation Data
const monteCarloData = [
  { year: 0, p10: 100000, p25: 100000, p50: 100000, p75: 100000, p90: 100000 },
  { year: 5, p10: 110000, p25: 125000, p50: 145000, p75: 168000, p90: 195000 },
  { year: 10, p10: 125000, p25: 165000, p50: 215000, p75: 285000, p90: 385000 },
  { year: 15, p10: 145000, p25: 220000, p50: 320000, p75: 485000, p90: 765000 },
  { year: 20, p10: 170000, p25: 295000, p50: 475000, p75: 825000, p90: 1520000 },
  { year: 25, p10: 200000, p25: 395000, p50: 705000, p75: 1405000, p90: 3015000 },
  { year: 30, p10: 240000, p25: 530000, p50: 1050000, p75: 2395000, p90: 5985000 },
];

// What-If Scenarios
const whatIfScenarios = [
  {
    name: "Bear Market (-30%)",
    impact: -185000,
    percentage: -30,
    probability: 15,
    recovery: "18-36 months",
    color: "hsl(var(--destructive))"
  },
  {
    name: "Recession (-20%)",
    impact: -123000,
    percentage: -20,
    probability: 25,
    recovery: "12-24 months",
    color: "hsl(var(--warning))"
  },
  {
    name: "Base Case (+7%)",
    impact: 43000,
    percentage: 7,
    probability: 45,
    recovery: "N/A",
    color: "hsl(var(--primary))"
  },
  {
    name: "Bull Market (+15%)",
    impact: 92000,
    percentage: 15,
    probability: 12,
    recovery: "N/A",
    color: "hsl(var(--success))"
  },
  {
    name: "Exceptional (+25%)",
    impact: 154000,
    percentage: 25,
    probability: 3,
    recovery: "N/A",
    color: "hsl(var(--success))"
  }
];

// Stress Test Scenarios
const stressTestData = [
  { scenario: "2008 Financial Crisis", impact: -37, duration: "18 months", currentPortfolio: -28.5 },
  { scenario: "2020 COVID Crash", impact: -34, duration: "6 months", currentPortfolio: -22.8 },
  { scenario: "2000 Dot-com Bubble", impact: -49, duration: "31 months", currentPortfolio: -35.2 },
  { scenario: "1987 Black Monday", impact: -20, duration: "2 months", currentPortfolio: -14.8 },
  { scenario: "Rising Interest Rates", impact: -15, duration: "12 months", currentPortfolio: -10.2 }
];

// Goal Achievement Scenarios
const goalScenarios = [
  { 
    goal: "Retirement Fund",
    target: 1200000,
    current: 325000,
    years: 20,
    probability: 78,
    monthlySavings: 2500,
    scenarios: {
      conservative: { probability: 62, finalAmount: 985000 },
      moderate: { probability: 78, finalAmount: 1285000 },
      aggressive: { probability: 85, finalAmount: 1650000 }
    }
  },
  {
    goal: "House Deposit",
    target: 100000,
    current: 35000,
    years: 5,
    probability: 92,
    monthlySavings: 1000,
    scenarios: {
      conservative: { probability: 88, finalAmount: 95500 },
      moderate: { probability: 92, finalAmount: 106000 },
      aggressive: { probability: 94, finalAmount: 118000 }
    }
  },
  {
    goal: "Education Fund",
    target: 80000,
    current: 15000,
    years: 12,
    probability: 85,
    monthlySavings: 450,
    scenarios: {
      conservative: { probability: 78, finalAmount: 74500 },
      moderate: { probability: 85, finalAmount: 87000 },
      aggressive: { probability: 90, finalAmount: 102000 }
    }
  }
];

// Cash Flow Projection Data
const cashFlowData = [
  { year: 2025, income: 125000, expenses: 85000, savings: 40000, investments: 35000 },
  { year: 2026, income: 131250, expenses: 88700, savings: 42550, investments: 37000 },
  { year: 2027, income: 137813, expenses: 92571, savings: 45242, investments: 39150 },
  { year: 2028, income: 144703, expenses: 96636, savings: 48067, interactions: 41450 },
  { year: 2029, income: 151938, expenses: 100903, savings: 51035, investments: 43900 },
  { year: 2030, income: 159535, expenses: 105381, savings: 54154, investments: 46500 },
];

// Retirement Projection Data
const retirementData = Array.from({ length: 41 }, (_, i) => {
  const year = 2025 + i;
  const age = 45 + i;
  const isRetired = age >= 65;
  
  if (!isRetired) {
    return {
      year,
      age,
      portfolio: 325000 * Math.pow(1.07, i),
      contributions: 30000 * i,
      withdrawals: 0
    };
  } else {
    const yearsRetired = age - 65;
    const peakPortfolio = 325000 * Math.pow(1.07, 20);
    return {
      year,
      age,
      portfolio: peakPortfolio * Math.pow(1.04, yearsRetired) - (45000 * yearsRetired * 1.02),
      contributions: 0,
      withdrawals: 45000 * Math.pow(1.02, yearsRetired)
    };
  }
});

export default function ScenarioAnalysis() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, client_id, aum')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error loading clients",
        description: "Unable to fetch client list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-success";
    if (probability >= 60) return "text-primary";
    if (probability >= 40) return "text-warning";
    return "text-destructive";
  };

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  
  // Custom Scenario Builder State
  const [customScenario, setCustomScenario] = useState({
    name: "",
    marketReturn: -10,
    duration: 6
  });
  const [customScenarioResult, setCustomScenarioResult] = useState<{
    impact: number;
    finalValue: number;
    percentage: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleRunSimulation = async () => {
    if (!selectedClient) {
      toast({
        title: "Client Required",
        description: "Please select a client before running simulation",
        variant: "destructive",
      });
      return;
    }

    const client = clients.find(c => c.id === selectedClient);
    if (!client) return;

    setIsSimulating(true);
    toast({
      title: "Running Elite Simulation",
      description: "Executing advanced Monte Carlo simulation with 10,000 iterations...",
    });

    try {
      const { data, error } = await supabase.functions.invoke('scenario-simulation', {
        body: {
          simulationType: 'monte-carlo',
          initialAmount: client.aum || 100000,
          monthlyContribution: 2500,
          years: 30,
          expectedReturn: 0.07,
          volatility: 0.15,
        }
      });

      if (error) throw error;

      setSimulationResults(data);
      toast({
        title: "Simulation Complete",
        description: `Analysis completed with ${data.successRate.toFixed(1)}% success rate.`,
      });
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: "Simulation Failed",
        description: "Unable to complete simulation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!contentRef.current) return;

    toast({
      title: "Generating PDF",
      description: "Capturing scenario analysis content...",
    });

    const options = {
      margin: 10,
      filename: `scenario-analysis-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(options).from(contentRef.current).save();
      toast({
        title: "Report generated",
        description: "Scenario analysis PDF downloaded successfully",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handleCalculateCustomScenario = async () => {
    if (!selectedClient) {
      toast({
        title: "Client Required",
        description: "Please select a client first",
        variant: "destructive",
      });
      return;
    }

    if (!customScenario.name.trim()) {
      toast({
        title: "Scenario Name Required",
        description: "Please enter a name for your scenario",
        variant: "destructive",
      });
      return;
    }

    const client = clients.find(c => c.id === selectedClient);
    if (!client) return;

    setIsCalculating(true);
    toast({
      title: "Calculating Impact",
      description: "Analyzing custom scenario parameters...",
    });

    // Simulate calculation delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const portfolioValue = client.aum || 100000;
      const monthlyImpact = (customScenario.marketReturn / 100) / 12;
      const totalMonths = customScenario.duration;
      
      // Calculate compound return over duration
      const finalValue = portfolioValue * Math.pow(1 + monthlyImpact, totalMonths);
      const impact = finalValue - portfolioValue;
      const percentage = ((finalValue - portfolioValue) / portfolioValue) * 100;

      setCustomScenarioResult({
        impact,
        finalValue,
        percentage
      });

      toast({
        title: "Calculation Complete",
        description: `Scenario "${customScenario.name}" analyzed successfully`,
      });
    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Calculation Failed",
        description: "Unable to calculate scenario impact",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="p-6 space-y-6" ref={contentRef}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img 
            src={flowpulseLogo} 
            alt="The Flowpulse Group" 
            className="h-14 w-14 rounded-lg object-contain cursor-pointer" 
            onClick={() => navigate('/')}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Scenario Analysis</h1>
            <p className="text-muted-foreground">Advanced portfolio projections and stress testing</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRunSimulation}
            disabled={isSimulating || !selectedClient}
          >
            <Calculator className="h-4 w-4 mr-2" />
            {isSimulating ? "Running..." : "Run Simulation"}
          </Button>
          <Button size="sm" onClick={handleGenerateReport}>
            <Download className="h-4 w-4 mr-2" />
            Generate PDF Report
          </Button>
        </div>
      </div>

      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
          <CardDescription>Choose a client to perform scenario analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading clients..." : "Select a client"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.client_id}) - AUM: {formatCurrency(client.aum || 0)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClient && (
              <Badge variant="outline" className="mb-2">
                Client Selected
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="monte-carlo" className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="monte-carlo">Monte Carlo</TabsTrigger>
          <TabsTrigger value="what-if">What-If</TabsTrigger>
          <TabsTrigger value="stress-test">Stress Test</TabsTrigger>
          <TabsTrigger value="goals">Goal Planning</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="retirement">Retirement</TabsTrigger>
        </TabsList>

        {/* Monte Carlo Simulation - Elite Dropdown System */}
        <TabsContent value="monte-carlo" className="space-y-6">
          <MonteCarloSimulations 
            selectedClient={selectedClient}
            clients={clients}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        {/* What-If Scenarios - Enhanced Enterprise Design */}
        <TabsContent value="what-if" className="space-y-8">
          {/* Scenario Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {whatIfScenarios.map((scenario, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border-2 ${
                  scenario.percentage >= 15 ? 'border-green-500/50 bg-gradient-to-br from-green-500/5 to-green-500/10' :
                  scenario.percentage >= 0 ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10' :
                  scenario.percentage >= -20 ? 'border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-amber-500/10' :
                  'border-red-500/50 bg-gradient-to-br from-red-500/5 to-red-500/10'
                }`}
              >
                <CardContent className="p-4 text-center">
                  <div className={`text-3xl font-bold mb-1 ${
                    scenario.percentage >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatPercent(scenario.percentage)}
                  </div>
                  <div className="text-sm font-medium truncate">{scenario.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{scenario.probability}% probability</div>
                  <div className="absolute top-2 right-2">
                    {scenario.percentage >= 0 ? 
                      <TrendingUp className="h-4 w-4 text-green-500" /> : 
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    }
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenario Details */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-card via-card to-muted/20 border-border/50 shadow-lg">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Market Scenarios Analysis</CardTitle>
                    <CardDescription>Comprehensive impact assessment across market conditions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {whatIfScenarios.map((scenario, index) => (
                    <div 
                      key={index} 
                      className="group p-5 rounded-xl border border-border/50 bg-gradient-to-r from-background to-muted/30 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            scenario.percentage >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                          }`}>
                            {scenario.percentage >= 0 ? 
                              <TrendingUp className="h-5 w-5 text-green-500" /> : 
                              <TrendingDown className="h-5 w-5 text-red-500" />
                            }
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">{scenario.name}</h4>
                            <p className="text-sm text-muted-foreground">Recovery: {scenario.recovery}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={scenario.percentage >= 0 ? "default" : "destructive"}
                            className="text-lg px-4 py-1.5 font-bold"
                          >
                            {formatPercent(scenario.percentage)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg bg-background/80 border border-border/30">
                          <span className="text-xs text-muted-foreground block mb-1">Portfolio Impact</span>
                          <span className={`text-xl font-bold ${scenario.impact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(scenario.impact)}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-background/80 border border-border/30">
                          <span className="text-xs text-muted-foreground block mb-1">Probability</span>
                          <span className="text-xl font-bold">{scenario.probability}%</span>
                        </div>
                        <div className="p-3 rounded-lg bg-background/80 border border-border/30">
                          <span className="text-xs text-muted-foreground block mb-1">Recovery Time</span>
                          <span className="text-xl font-bold">{scenario.recovery}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Probability Distribution</span>
                          <span>{scenario.probability}%</span>
                        </div>
                        <Progress value={scenario.probability} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Scenario Builder */}
            <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 shadow-lg">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Custom Scenario Builder</CardTitle>
                    <CardDescription>Model your own market scenarios</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="scenario-name" className="text-sm font-medium">Scenario Name</Label>
                  <Input 
                    id="scenario-name"
                    placeholder="e.g., Tech Sector Correction"
                    value={customScenario.name}
                    onChange={(e) => setCustomScenario(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Market Return</Label>
                    <Badge 
                      variant={customScenario.marketReturn >= 0 ? "default" : "destructive"}
                      className="font-mono text-sm px-3"
                    >
                      {customScenario.marketReturn > 0 ? '+' : ''}{customScenario.marketReturn}%
                    </Badge>
                  </div>
                  <Slider 
                    value={[customScenario.marketReturn]} 
                    onValueChange={(value) => setCustomScenario(prev => ({ ...prev, marketReturn: value[0] }))}
                    min={-50} 
                    max={50} 
                    step={1}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-red-500">-50%</span>
                    <span>0%</span>
                    <span className="text-green-500">+50%</span>
                  </div>
                </div>
                
                <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Duration</Label>
                    <Badge variant="outline" className="font-mono text-sm px-3">
                      {customScenario.duration} {customScenario.duration === 1 ? 'month' : 'months'}
                    </Badge>
                  </div>
                  <Slider 
                    value={[customScenario.duration]} 
                    onValueChange={(value) => setCustomScenario(prev => ({ ...prev, duration: value[0] }))}
                    min={1} 
                    max={36} 
                    step={1}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 mo</span>
                    <span>18 mo</span>
                    <span>36 mo</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full gap-2 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                  onClick={handleCalculateCustomScenario}
                  disabled={isCalculating || !selectedClient}
                >
                  <Calculator className="h-5 w-5" />
                  {isCalculating ? "Calculating..." : "Calculate Impact"}
                </Button>

                {customScenarioResult && (
                  <div className="mt-4 p-5 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-primary/20">
                      <span className="font-semibold text-primary">Analysis Results</span>
                      <Badge variant={customScenarioResult.percentage >= 0 ? "default" : "destructive"} className="text-sm">
                        {customScenarioResult.percentage > 0 ? '+' : ''}{customScenarioResult.percentage.toFixed(2)}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 rounded-lg bg-background/60 border border-border/30">
                        <p className="text-xs text-muted-foreground mb-1">Portfolio Impact</p>
                        <p className={`text-2xl font-bold ${customScenarioResult.impact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(customScenarioResult.impact)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/60 border border-border/30">
                        <p className="text-xs text-muted-foreground mb-1">Projected Final Value</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(customScenarioResult.finalValue)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                      {customScenarioResult.impact >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span>Based on {customScenario.duration} month projection</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scenario Comparison Chart */}
          <Card className="bg-gradient-to-br from-card to-muted/10 border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Scenario Comparison</CardTitle>
                  <CardDescription>Portfolio value impact after 1 year across all scenarios</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={whatIfScenarios} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      angle={-35} 
                      textAnchor="end" 
                      height={80}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Bar dataKey="impact" radius={[8, 8, 0, 0]}>
                      {whatIfScenarios.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stress Test - Enhanced Enterprise Design */}
        <TabsContent value="stress-test" className="space-y-8">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-card to-green-500/5 border-green-500/30 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
              <CardContent className="pt-6 pb-6 relative">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <ShieldAlert className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Portfolio Resilience Score</p>
                    <p className="text-4xl font-bold text-green-500">8.2<span className="text-lg text-muted-foreground">/10</span></p>
                  </div>
                </div>
                <Progress value={82} className="mt-4 h-2" />
                <p className="text-xs text-muted-foreground mt-2">Above average risk management</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-500/10 via-card to-red-500/5 border-red-500/30 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
              <CardContent className="pt-6 pb-6 relative">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-500/20">
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Worst Historical Drawdown</p>
                    <p className="text-4xl font-bold text-red-500">-35.2%</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">2000 Dot-com Bubble</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-card to-blue-500/5 border-blue-500/30 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <CardContent className="pt-6 pb-6 relative">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Recovery Time</p>
                    <p className="text-4xl font-bold text-blue-500">14<span className="text-lg text-muted-foreground"> mo</span></p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Average recovery period</p>
              </CardContent>
            </Card>
          </div>

          {/* Historical Stress Tests */}
          <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">Historical Crisis Stress Tests</CardTitle>
                  <CardDescription>How your portfolio would perform in past market crises</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {stressTestData.map((test, index) => (
                  <div 
                    key={index} 
                    className="group p-6 rounded-xl border border-border/50 bg-gradient-to-r from-background via-background to-red-500/5 hover:shadow-xl hover:border-red-500/30 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 group-hover:scale-110 transition-transform">
                          <TrendingDown className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg group-hover:text-red-500 transition-colors">{test.scenario}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Activity className="h-3 w-3" />
                            Duration: {test.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Badge variant="destructive" className="text-lg px-4 py-2 font-bold">
                          Market: {test.impact}%
                        </Badge>
                        <Badge variant="outline" className="text-lg px-4 py-2 font-bold border-primary text-primary">
                          Your Portfolio: {test.currentPortfolio}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Market Drawdown</span>
                          <span className="font-semibold text-red-500">{test.impact}%</span>
                        </div>
                        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.abs(test.impact)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Your Portfolio Impact</span>
                          <span className="font-semibold text-primary">{test.currentPortfolio}%</span>
                        </div>
                        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                            style={{ width: `${Math.abs(test.currentPortfolio)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-5 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                      <ShieldAlert className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">
                        <span className="font-semibold text-green-500">
                          {Math.abs(test.impact - test.currentPortfolio).toFixed(1)}% better resilience
                        </span>
                        <span className="text-muted-foreground"> than market average during this crisis</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stress Test Comparison Chart */}
          <Card className="bg-gradient-to-br from-card to-muted/10 border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Crisis Impact Comparison</CardTitle>
                  <CardDescription>Market vs your portfolio during historical crises</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stressTestData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="scenario" 
                      angle={-35} 
                      textAnchor="end" 
                      height={80}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => `${value}%`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Legend />
                    <Bar name="Market Impact" dataKey="impact" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    <Bar name="Your Portfolio" dataKey="currentPortfolio" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goal Planning */}
        <TabsContent value="goals" className="space-y-6">
          {goalScenarios.map((goal, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{goal.goal}</CardTitle>
                    <CardDescription>Target: {formatCurrency(goal.target)} in {goal.years} years</CardDescription>
                  </div>
                  <Badge className={`text-lg ${getProbabilityColor(goal.probability)}`}>
                    {goal.probability}% likely
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground">Current Amount</div>
                    <div className="text-xl font-bold">{formatCurrency(goal.current)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground">Monthly Savings</div>
                    <div className="text-xl font-bold">{formatCurrency(goal.monthlySavings)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground">Time Remaining</div>
                    <div className="text-xl font-bold">{goal.years} years</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground">Still Needed</div>
                    <div className="text-xl font-bold">{formatCurrency(goal.target - goal.current)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Progress to Goal</div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-3" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {((goal.current / goal.target) * 100).toFixed(1)}% complete
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-3">Scenario Outcomes</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(goal.scenarios).map(([key, scenario]) => (
                      <div key={key} className="p-3 border rounded-lg">
                        <div className="text-sm font-medium capitalize mb-2">{key} Strategy</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Success Rate:</span>
                            <span className={`font-semibold ${getProbabilityColor(scenario.probability)}`}>
                              {scenario.probability}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Final Amount:</span>
                            <span className="font-semibold">{formatCurrency(scenario.finalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Cash Flow Projection */}
        <TabsContent value="cashflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Projection</CardTitle>
              <CardDescription>Annual income, expenses, and savings forecast</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="income" fill="hsl(var(--success))" name="Income" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="investments" fill="hsl(var(--primary))" name="Investments" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {cashFlowData.slice(-1).map((year, yearIndex) => (
              <React.Fragment key={`cashflow-metrics-${yearIndex}`}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Annual Income</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">{formatCurrency(year.income)}</div>
                    <p className="text-xs text-muted-foreground mt-1">+5% YoY growth</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Annual Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">{formatCurrency(year.expenses)}</div>
                    <p className="text-xs text-muted-foreground mt-1">+4.3% inflation</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(year.savings)}</div>
                    <p className="text-xs text-muted-foreground mt-1">{((year.savings / year.income) * 100).toFixed(1)}% savings rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Investments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(year.investments)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Annual contribution</p>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))}
          </div>
        </TabsContent>

        {/* Retirement Planning */}
        <TabsContent value="retirement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Retirement Age</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">65</div>
                <p className="text-xs text-muted-foreground mt-1">20 years away</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Portfolio at Retirement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{formatCurrency(1285000)}</div>
                <p className="text-xs text-muted-foreground mt-1">Projected value</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Annual Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(45000)}</div>
                <p className="text-xs text-muted-foreground mt-1">3.5% withdrawal rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Portfolio Longevity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">35+ years</div>
                <p className="text-xs text-muted-foreground mt-1">95% confidence</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Retirement Portfolio Projection</CardTitle>
              <CardDescription>Portfolio value throughout accumulation and withdrawal phases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={retirementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="age" 
                      label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Portfolio Value (£)', angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `£${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Age ${label}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="portfolio" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                      name="Portfolio Value"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retirement Assumptions</CardTitle>
              <CardDescription>Adjust parameters to model different scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Target Retirement Age</Label>
                  <Select defaultValue="65">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60 years</SelectItem>
                      <SelectItem value="62">62 years</SelectItem>
                      <SelectItem value="65">65 years</SelectItem>
                      <SelectItem value="67">67 years</SelectItem>
                      <SelectItem value="70">70 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Life Expectancy</Label>
                  <Select defaultValue="90">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="85">85 years</SelectItem>
                      <SelectItem value="90">90 years</SelectItem>
                      <SelectItem value="95">95 years</SelectItem>
                      <SelectItem value="100">100 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pre-Retirement Return (%)</Label>
                  <Input type="number" defaultValue="7.0" step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label>Post-Retirement Return (%)</Label>
                  <Input type="number" defaultValue="4.0" step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label>Annual Withdrawal (£)</Label>
                  <Input type="number" defaultValue="45000" step="1000" />
                </div>
                <div className="space-y-2">
                  <Label>Inflation Rate (%)</Label>
                  <Input type="number" defaultValue="2.0" step="0.1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
