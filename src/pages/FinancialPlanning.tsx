import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Area, AreaChart } from "recharts";
import { Calculator, Target, PoundSterling, TrendingUp, AlertTriangle, Plus, Save, Users, Home, Briefcase, Shield, PieChart, FileText, Calendar, Zap } from "lucide-react";
import { CashFlowChart } from "@/components/CashFlowChart";
import { AssetAllocationChart } from "@/components/AssetAllocationChart";

// Industry-standard financial planning data
const cashFlowData = [
  { age: 25, cashFlow: 8000, cumulative: 8000, phase: "career-building", milestone: null },
  { age: 30, cashFlow: 15000, cumulative: 23000, phase: "career-building", milestone: null },
  { age: 35, cashFlow: 22000, cumulative: 45000, phase: "wealth-accumulation", milestone: "First Property" },
  { age: 40, cashFlow: 28000, cumulative: 73000, phase: "wealth-accumulation", milestone: null },
  { age: 45, cashFlow: 35000, cumulative: 108000, phase: "wealth-accumulation", milestone: "Peak Earnings" },
  { age: 50, cashFlow: 32000, cumulative: 140000, phase: "pre-retirement", milestone: null },
  { age: 55, cashFlow: 28000, cumulative: 168000, phase: "pre-retirement", milestone: "Pension Review" },
  { age: 60, cashFlow: 25000, cumulative: 193000, phase: "pre-retirement", milestone: null },
  { age: 65, cashFlow: -18000, cumulative: 175000, phase: "retirement", milestone: "State Pension Age" },
  { age: 70, cashFlow: -20000, cumulative: 155000, phase: "retirement", milestone: null },
  { age: 75, cashFlow: -22000, cumulative: 133000, phase: "retirement", milestone: null },
  { age: 80, cashFlow: -25000, cumulative: 108000, phase: "retirement", milestone: "Healthcare Planning" },
  { age: 85, cashFlow: -28000, cumulative: 80000, phase: "retirement", milestone: null },
  { age: 90, cashFlow: -30000, cumulative: 50000, phase: "late-retirement", milestone: null },
];

const portfolioData = [
  { name: "UK Equities", value: 180000, allocation: 35, color: "hsl(var(--financial-blue))" },
  { name: "Global Equities", value: 128000, allocation: 25, color: "hsl(var(--financial-green))" },
  { name: "Government Bonds", value: 77000, allocation: 15, color: "hsl(var(--financial-purple))" },
  { name: "Corporate Bonds", value: 51000, allocation: 10, color: "hsl(var(--financial-orange))" },
  { name: "Property (REITs)", value: 41000, allocation: 8, color: "hsl(var(--financial-pink))" },
  { name: "Cash & Equivalents", value: 36000, allocation: 7, color: "hsl(var(--financial-cyan))" },
];

// UK-specific retirement scenarios
const scenarios = [
  {
    name: "Basic State Pension",
    monthlyContribution: 800,
    returnRate: 4,
    projectedValue: 320000,
    shortfall: -130000,
    color: "#ffc658",
    description: "State pension only with minimal private savings"
  },
  {
    name: "Workplace Pension",
    monthlyContribution: 1200,
    returnRate: 6,
    projectedValue: 465000,
    shortfall: 0,
    color: "#8884d8",
    description: "Auto-enrolment with employer contributions"
  },
  {
    name: "Enhanced Plan",
    monthlyContribution: 1800,
    returnRate: 7,
    projectedValue: 620000,
    shortfall: 0,
    color: "#82ca9d",
    description: "Optimized contributions with SIPP and ISAs"
  }
];

// UK tax allowances and thresholds (2024/25)
const taxAllowances = {
  personalAllowance: 12570,
  basicRateThreshold: 50270,
  higherRateThreshold: 125140,
  isaAllowance: 20000,
  pensionAnnualAllowance: 40000
};

const FinancialPlanning = () => {
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(67); // UK State Pension Age
  const [currentPension, setCurrentPension] = useState(85000);
  const [monthlyContribution, setMonthlyContribution] = useState(1200);
  const [retirementIncome, setRetirementIncome] = useState(35000);
  const [expectedReturn, setExpectedReturn] = useState(6);
  const [riskTolerance, setRiskTolerance] = useState("moderate");
  const [annualSalary, setAnnualSalary] = useState(55000);

  const yearsToRetirement = Math.max(1, retirementAge - currentAge);
  const monthsToRetirement = yearsToRetirement * 12;

  const calculateFutureValue = (pv: number, pmt: number, rate: number, periods: number) => {
    const monthlyRate = rate / 100 / 12;
    const futureValuePV = pv * Math.pow(1 + monthlyRate, periods);
    const futureValuePMT = pmt * (Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate;
    return futureValuePV + futureValuePMT;
  };

  const projectedPension = calculateFutureValue(currentPension, monthlyContribution, expectedReturn, monthsToRetirement);
  const requiredPension = retirementIncome * 25; // 4% withdrawal rule
  const shortfall = requiredPension - projectedPension;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateStatePension = () => {
    const fullStatePension = 11502; // 2024/25 full new State Pension
    return fullStatePension;
  };

  const calculateTaxEfficiency = () => {
    const pensionContributions = monthlyContribution * 12;
    const taxRate = annualSalary > taxAllowances.higherRateThreshold ? 0.4 : 
                   annualSalary > taxAllowances.basicRateThreshold ? 0.2 : 0;
    const taxRelief = pensionContributions * taxRate;
    return taxRelief;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Planning & Retirement</h1>
          <p className="text-muted-foreground">UK-focused retirement and financial planning tools</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Plan
          </Button>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="retirement">Retirement Calculator</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Planning</TabsTrigger>
          <TabsTrigger value="tax">Tax Planning</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Pension Value</CardTitle>
                <PoundSterling className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(currentPension)}</div>
                <p className="text-xs text-muted-foreground">
                  Across all pension schemes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projected at Retirement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(projectedPension)}</div>
                <p className="text-xs text-muted-foreground">
                  Age {retirementAge} ({yearsToRetirement} years)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Tax Relief</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(calculateTaxEfficiency())}</div>
                <p className="text-xs text-muted-foreground">
                  On current contributions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">State Pension (est.)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(calculateStatePension())}</div>
                <p className="text-xs text-muted-foreground">
                  Annual from age {retirementAge}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Financial Health Score
              </CardTitle>
              <CardDescription>Overall assessment of your retirement readiness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Retirement Readiness</span>
                  <span className="text-sm text-muted-foreground">78/100</span>
                </div>
                <Progress value={78} className="h-3" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 rounded-lg bg-success/10">
                    <div className="text-2xl font-bold text-success">Good</div>
                    <div className="text-sm text-muted-foreground">Savings Rate</div>
                    <div className="text-xs">22% of salary</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-warning/10">
                    <div className="text-2xl font-bold text-warning">Fair</div>
                    <div className="text-sm text-muted-foreground">Diversification</div>
                    <div className="text-xs">Room for improvement</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <div className="text-2xl font-bold text-primary">Excellent</div>
                    <div className="text-sm text-muted-foreground">Tax Efficiency</div>
                    <div className="text-xs">Well optimized</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lifetime Cash Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-financial-blue" />
                Lifetime Financial Projection
              </CardTitle>
              <CardDescription>Your financial journey from now to retirement and beyond</CardDescription>
            </CardHeader>
            <CardContent>
              <CashFlowChart data={cashFlowData} retirementAge={retirementAge} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retirement" className="space-y-6">
          {/* Planning Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Retirement Planning Calculator
              </CardTitle>
              <CardDescription>Adjust your planning assumptions to see projections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="currentAge">Current Age</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retirementAge">Target Retirement Age</Label>
                  <Input
                    id="retirementAge"
                    type="number"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualSalary">Annual Salary</Label>
                  <Input
                    id="annualSalary"
                    type="number"
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentPension">Current Pension Value</Label>
                  <Input
                    id="currentPension"
                    type="number"
                    value={currentPension}
                    onChange={(e) => setCurrentPension(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retirementIncome">Target Annual Income</Label>
                  <Input
                    id="retirementIncome"
                    type="number"
                    value={retirementIncome}
                    onChange={(e) => setRetirementIncome(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Risk Profile</Label>
                  <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative (3-4%)</SelectItem>
                      <SelectItem value="moderate">Moderate (5-7%)</SelectItem>
                      <SelectItem value="aggressive">Growth (7-9%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Expected Return: {expectedReturn}%</Label>
                  <Slider
                    value={[expectedReturn]}
                    onValueChange={(value) => setExpectedReturn(value[0])}
                    max={10}
                    min={2}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Retirement Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                        <span className="font-medium">Projected Pension Value</span>
                        <span className="font-bold text-primary">{formatCurrency(projectedPension)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-success/10">
                        <span className="font-medium">Plus State Pension (annual)</span>
                        <span className="font-bold text-success">{formatCurrency(calculateStatePension())}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                        <span className="font-medium">Required Pension Value</span>
                        <span className="font-semibold">{formatCurrency(requiredPension)}</span>
                      </div>
                      {shortfall !== 0 && (
                        <div className={`flex justify-between items-center p-3 rounded-lg ${shortfall > 0 ? 'bg-destructive/10' : 'bg-success/10'}`}>
                          <span className="font-medium">
                            {shortfall > 0 ? 'Shortfall' : 'Surplus'}
                          </span>
                          <span className={`font-bold ${shortfall > 0 ? 'text-destructive' : 'text-success'}`}>
                            {formatCurrency(Math.abs(shortfall))}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Asset Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AssetAllocationChart data={portfolioData} />
                  </CardContent>
                </Card>
              </div>

              {/* Action Items */}
              {shortfall > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="font-semibold text-destructive">Action Required</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button variant="outline" size="sm" className="justify-start h-auto p-3">
                      <div className="text-left">
                        <div className="font-medium">Increase Contributions</div>
                        <div className="text-xs text-muted-foreground">
                          +£{Math.ceil(shortfall / monthsToRetirement)}/month
                        </div>
                      </div>
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start h-auto p-3">
                      <div className="text-left">
                        <div className="font-medium">Work {Math.ceil(shortfall / (monthlyContribution * 12))} More Years</div>
                        <div className="text-xs text-muted-foreground">
                          Retire at age {retirementAge + Math.ceil(shortfall / (monthlyContribution * 12))}
                        </div>
                      </div>
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start h-auto p-3">
                      <div className="text-left">
                        <div className="font-medium">Reduce Target Income</div>
                        <div className="text-xs text-muted-foreground">
                          To £{Math.ceil(projectedPension / 25 / 1000)}k annually
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>UK Retirement Scenarios</CardTitle>
                  <CardDescription>Compare different pension strategies and outcomes</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Scenario
                  </Button>
                  <Button variant="outline" size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Run Monte Carlo
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {scenarios.map((scenario, index) => (
                  <Card key={scenario.name} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{scenario.name}</CardTitle>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scenario.color }}></div>
                      </div>
                      <CardDescription className="text-xs">{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Contribution</span>
                          <span className="font-medium">{formatCurrency(scenario.monthlyContribution)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expected Return</span>
                          <span className="font-medium">{scenario.returnRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Projected Value</span>
                          <span className="font-semibold">{formatCurrency(scenario.projectedValue)}</span>
                        </div>
                        {scenario.shortfall !== 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {scenario.shortfall > 0 ? 'Surplus' : 'Shortfall'}
                            </span>
                            <span className={`font-medium ${scenario.shortfall > 0 ? 'text-success' : 'text-destructive'}`}>
                              {scenario.shortfall > 0 ? '+' : ''}{formatCurrency(Math.abs(scenario.shortfall))}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Success Probability</span>
                          <span className="font-medium">
                            {scenario.name === 'Basic State Pension' ? '35%' : 
                             scenario.name === 'Workplace Pension' ? '78%' : '92%'}
                          </span>
                        </div>
                        <Progress 
                          value={scenario.name === 'Basic State Pension' ? 35 : 
                                 scenario.name === 'Workplace Pension' ? 78 : 92} 
                          className="h-2"
                        />
                      </div>
                      
                      <Badge
                        variant={scenario.shortfall >= 0 ? "default" : "destructive"}
                        className="w-full justify-center"
                      >
                        {scenario.shortfall >= 0 ? "Meets Goals" : "Insufficient"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarios} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      tickFormatter={(value) => `£${(value / 1000).toFixed(0)}K`} 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value as number), "Projected Value"]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="projectedValue" radius={[4, 4, 0, 0]}>
                      {scenarios.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Tax-Efficient Planning
                </CardTitle>
                <CardDescription>Maximize your tax allowances and reliefs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <h4 className="font-semibold text-success mb-2">Annual Allowances (2024/25)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Personal Allowance</span>
                      <span className="font-medium">{formatCurrency(taxAllowances.personalAllowance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ISA Allowance</span>
                      <span className="font-medium">{formatCurrency(taxAllowances.isaAllowance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pension Annual Allowance</span>
                      <span className="font-medium">{formatCurrency(taxAllowances.pensionAnnualAllowance)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Current Tax Efficiency</h4>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                    <span className="font-medium">Pension Contributions</span>
                    <span className="font-semibold">{formatCurrency(monthlyContribution * 12)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-success/10">
                    <span className="font-medium">Annual Tax Relief</span>
                    <span className="font-semibold text-success">{formatCurrency(calculateTaxEfficiency())}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-warning/10">
                    <span className="font-medium">Unused Pension Allowance</span>
                    <span className="font-semibold text-warning">
                      {formatCurrency(Math.max(0, taxAllowances.pensionAnnualAllowance - (monthlyContribution * 12)))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Optimization Opportunities
                </CardTitle>
                <CardDescription>Suggested improvements to your tax strategy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border bg-gradient-to-r from-success/5 to-success/10">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                      <PoundSterling className="h-4 w-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Maximize Pension Contributions</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        You could contribute an additional £{Math.max(0, taxAllowances.pensionAnnualAllowance - (monthlyContribution * 12)).toLocaleString()} annually
                      </div>
                      <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                        Additional tax relief: £{Math.max(0, (taxAllowances.pensionAnnualAllowance - (monthlyContribution * 12)) * 0.2).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Stocks & Shares ISA</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Use your full £{taxAllowances.isaAllowance.toLocaleString()} ISA allowance for tax-free growth
                      </div>
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                        Tax-free growth potential
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-gradient-to-r from-warning/5 to-warning/10">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                      <Target className="h-4 w-4 text-warning" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Salary Sacrifice Optimization</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Consider salary sacrifice for pension contributions to save National Insurance
                      </div>
                      <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                        Additional 12% NI savings
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>AI-powered suggestions based on your financial profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-gradient-to-r from-success/5 to-success/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <Target className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Immediate Action: Employer Match</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Ensure you're getting the full employer pension contribution match. This is free money that significantly boosts your retirement savings.
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                        Priority: High
                      </Badge>
                      <Button size="sm" variant="outline" className="text-xs">
                        Review Match
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <PieChart className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Portfolio Rebalance</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      At age {currentAge}, consider a growth-focused allocation: 70% equities, 20% bonds, 10% alternatives for optimal long-term returns.
                    </div>
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                      Potential uplift: £{Math.round((projectedPension * 0.15) / 1000)}k
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-gradient-to-r from-warning/5 to-warning/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Protection Planning</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Review your life insurance and income protection. Consider increasing coverage as your pension contributions grow.
                    </div>
                    <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                      Review recommended
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-gradient-to-r from-financial-blue/5 to-financial-cyan/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-financial-blue/20 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-financial-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Annual Review Schedule</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Schedule annual reviews to track progress, rebalance investments, and adjust contributions based on salary changes.
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      Schedule Review
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Timeline</CardTitle>
              <CardDescription>Suggested order of actions for optimal results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground text-sm flex items-center justify-center font-bold">1</div>
                  <div className="flex-1">
                    <div className="font-semibold">This Month: Maximize Employer Match</div>
                    <div className="text-sm text-muted-foreground">Adjust payroll deductions to capture full employer contributions</div>
                  </div>
                  <Badge variant="destructive">Urgent</Badge>
                </div>
                
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-8 h-8 rounded-full bg-warning text-warning-foreground text-sm flex items-center justify-center font-bold">2</div>
                  <div className="flex-1">
                    <div className="font-semibold">Next 3 Months: Open Stocks & Shares ISA</div>
                    <div className="text-sm text-muted-foreground">Set up tax-efficient savings alongside pension</div>
                  </div>
                  <Badge variant="outline">3 Months</Badge>
                </div>
                
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">3</div>
                  <div className="flex-1">
                    <div className="font-semibold">Within 6 Months: Portfolio Review</div>
                    <div className="text-sm text-muted-foreground">Rebalance investments based on risk tolerance and timeline</div>
                  </div>
                  <Badge variant="outline">6 Months</Badge>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-success text-success-foreground text-sm flex items-center justify-center font-bold">4</div>
                  <div className="flex-1">
                    <div className="font-semibold">Annual: Full Financial Review</div>
                    <div className="text-sm text-muted-foreground">Comprehensive review of all aspects including protection and estate planning</div>
                  </div>
                  <Badge variant="outline">Annual</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialPlanning;