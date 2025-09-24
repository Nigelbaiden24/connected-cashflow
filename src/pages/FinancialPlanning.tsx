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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Calculator, Target, DollarSign, TrendingUp, AlertTriangle, Plus, Save, Users, Home, Briefcase, Shield } from "lucide-react";
import { CashFlowChart } from "@/components/CashFlowChart";
import { AssetAllocationChart } from "@/components/AssetAllocationChart";

// Enhanced dummy data for cash flow projections (Voyant-style)
const cashFlowData = [
  { age: 25, cashFlow: 15000, cumulative: 15000, phase: "pre-retirement", milestone: null },
  { age: 30, cashFlow: 25000, cumulative: 40000, phase: "pre-retirement", milestone: null },
  { age: 35, cashFlow: 35000, cumulative: 75000, phase: "pre-retirement", milestone: null },
  { age: 40, cashFlow: 45000, cumulative: 120000, phase: "pre-retirement", milestone: "Career Peak" },
  { age: 45, cashFlow: 50000, cumulative: 170000, phase: "pre-retirement", milestone: null },
  { age: 50, cashFlow: 55000, cumulative: 225000, phase: "pre-retirement", milestone: null },
  { age: 55, cashFlow: 60000, cumulative: 285000, phase: "pre-retirement", milestone: null },
  { age: 60, cashFlow: 65000, cumulative: 350000, phase: "pre-retirement", milestone: null },
  { age: 65, cashFlow: -35000, cumulative: 315000, phase: "retirement", milestone: "Retirement" },
  { age: 70, cashFlow: -40000, cumulative: 275000, phase: "retirement", milestone: null },
  { age: 75, cashFlow: -45000, cumulative: 230000, phase: "retirement", milestone: null },
  { age: 80, cashFlow: -50000, cumulative: 180000, phase: "retirement", milestone: null },
  { age: 85, cashFlow: -55000, cumulative: 125000, phase: "retirement", milestone: null },
  { age: 90, cashFlow: -60000, cumulative: 65000, phase: "retirement", milestone: null },
];

const portfolioData = [
  { name: "Stocks", value: 320000, allocation: 60, color: "hsl(var(--financial-blue))" },
  { name: "Bonds", value: 106000, allocation: 20, color: "hsl(var(--financial-green))" },
  { name: "Real Estate", value: 85000, allocation: 16, color: "hsl(var(--financial-purple))" },
  { name: "Cash", value: 21000, allocation: 4, color: "hsl(var(--financial-orange))" },
];

const scenarios = [
  {
    name: "Current Path",
    monthlyContribution: 1500,
    returnRate: 7,
    projectedValue: 672000,
    shortfall: 0,
    color: "#8884d8"
  },
  {
    name: "Optimized Plan",
    monthlyContribution: 2000,
    returnRate: 8,
    projectedValue: 891000,
    shortfall: 0,
    color: "#82ca9d"
  },
  {
    name: "Conservative",
    monthlyContribution: 1500,
    returnRate: 5,
    projectedValue: 398000,
    shortfall: -402000,
    color: "#ffc658"
  }
];

export default function FinancialPlanning() {
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(75000);
  const [monthlyContribution, setMonthlyContribution] = useState(1500);
  const [retirementGoal, setRetirementGoal] = useState(800000);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [riskTolerance, setRiskTolerance] = useState("moderate");

  const yearsToRetirement = retirementAge - currentAge;
  const monthsToRetirement = yearsToRetirement * 12;

  const calculateFutureValue = (pv: number, pmt: number, rate: number, periods: number) => {
    const monthlyRate = rate / 100 / 12;
    const futureValuePV = pv * Math.pow(1 + monthlyRate, periods);
    const futureValuePMT = pmt * (Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate;
    return futureValuePV + futureValuePMT;
  };

  const projectedValue = calculateFutureValue(currentSavings, monthlyContribution, expectedReturn, monthsToRetirement);
  const shortfall = retirementGoal - projectedValue;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Planning Tools</h1>
          <p className="text-muted-foreground">Comprehensive retirement and financial planning</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Plan
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calculator">Retirement Calculator</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Plan Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          {/* Enhanced Cash Flow View - Voyant Style */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Cash Flow Chart */}
            <Card className="xl:col-span-3">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-financial-blue" />
                      Detailed Cash Flow
                    </CardTitle>
                    <CardDescription>Lifetime financial projection with key milestones</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-financial-blue border-financial-blue">
                      Base Plan
                    </Badge>
                    <Button variant="outline" size="sm">
                      Year: 2024
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CashFlowChart data={cashFlowData} retirementAge={retirementAge} />
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Pre-Retirement</div>
                    <div className="text-lg font-semibold text-financial-blue">
                      {yearsToRetirement} years
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Retirement Income</div>
                    <div className="text-lg font-semibold text-financial-pink">
                      {formatCurrency(35000)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Peak Savings</div>
                    <div className="text-lg font-semibold text-financial-green">
                      {formatCurrency(350000)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Final Balance</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(65000)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Side Panel - Client & Key Metrics */}
            <div className="xl:col-span-1 space-y-6">
              {/* Client Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Johnson Family</CardTitle>
                  <CardDescription>Financial Plan Overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">Net Worth</span>
                    </div>
                    <span className="font-bold text-success">
                      {formatCurrency(532000)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">People</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-chart-1"></div>
                        <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                        <div className="w-2 h-2 rounded-full bg-chart-3"></div>
                        <div className="w-2 h-2 rounded-full bg-chart-4"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Income</span>
                      </div>
                      <Badge variant="outline">2</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Savings & Investments</span>
                      </div>
                      <Badge variant="outline">4</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Property</span>
                      </div>
                      <Badge variant="outline">1</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Asset Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <AssetAllocationChart data={portfolioData} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Planning Parameters - Collapsible */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Planning Parameters
              </CardTitle>
              <CardDescription>Adjust your planning assumptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                  <Label htmlFor="retirementAge">Retirement Age</Label>
                  <Input
                    id="retirementAge"
                    type="number"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentSavings">Current Savings</Label>
                  <Input
                    id="currentSavings"
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(Number(e.target.value))}
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
                  <Label htmlFor="retirementGoal">Retirement Goal</Label>
                  <Input
                    id="retirementGoal"
                    type="number"
                    value={retirementGoal}
                    onChange={(e) => setRetirementGoal(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Risk Tolerance</Label>
                  <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <Label>Expected Annual Return: {expectedReturn}%</Label>
                <Slider
                  value={[expectedReturn]}
                  onValueChange={(value) => setExpectedReturn(value[0])}
                  max={12}
                  min={3}
                  step={0.5}
                  className="w-full mt-2"
                />
              </div>

              {/* Smart Recommendations */}
              {shortfall < 0 && (
                <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="font-semibold text-destructive">Smart Recommendations</span>
                  </div>
                  <div className="text-sm space-y-2">
                    <p className="text-muted-foreground">To meet your retirement goal:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button variant="outline" size="sm" className="justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Increase Savings</div>
                          <div className="text-xs text-muted-foreground">
                            +${Math.ceil(Math.abs(shortfall) / monthsToRetirement)}/mo
                          </div>
                        </div>
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Delay Retirement</div>
                          <div className="text-xs text-muted-foreground">
                            +{Math.ceil(Math.abs(shortfall) / (monthlyContribution * 12))} years
                          </div>
                        </div>
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Optimize Portfolio</div>
                          <div className="text-xs text-muted-foreground">
                            Higher returns
                          </div>
                        </div>
                      </Button>
                    </div>
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
                  <CardTitle>Monte Carlo Scenario Analysis</CardTitle>
                  <CardDescription>Compare different planning scenarios with probability outcomes</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Scenario
                  </Button>
                  <Button variant="outline" size="sm">
                    Run Analysis
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
                      
                      {/* Success Probability */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Success Probability</span>
                          <span className="font-medium">
                            {scenario.name === 'Current Path' ? '72%' : 
                             scenario.name === 'Optimized Plan' ? '89%' : '45%'}
                          </span>
                        </div>
                        <Progress 
                          value={scenario.name === 'Current Path' ? 72 : 
                                 scenario.name === 'Optimized Plan' ? 89 : 45} 
                          className="h-2"
                        />
                      </div>
                      
                      <Badge
                        variant={scenario.shortfall >= 0 ? "default" : "destructive"}
                        className="w-full justify-center"
                      >
                        {scenario.shortfall >= 0 ? "On Track" : "Needs Adjustment"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Enhanced Chart with Multiple Scenarios */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scenario Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <Tooltip 
                            formatter={(value) => formatCurrency(value as number)}
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

                {/* Risk Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Analysis</CardTitle>
                    <CardDescription>Probability of achieving retirement goals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-success/10">
                        <span className="font-medium">90th Percentile</span>
                        <span className="font-bold text-success">{formatCurrency(1250000)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                        <span className="font-medium">50th Percentile (Median)</span>
                        <span className="font-bold">{formatCurrency(850000)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-destructive/10">
                        <span className="font-medium">10th Percentile</span>
                        <span className="font-bold text-destructive">{formatCurrency(420000)}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-2">Key Insights</div>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-success"></div>
                          72% chance of meeting retirement goal
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-warning"></div>
                          Market volatility main risk factor
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          Inflation impact: 2.5% annually
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  AI Optimization Recommendations
                </CardTitle>
                <CardDescription>Smart suggestions to improve your financial plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border bg-gradient-to-r from-success/5 to-success/10 hover:from-success/10 hover:to-success/15 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center mt-1">
                      <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Maximize 401(k) Employer Match</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        You're leaving $2,400 annually in free money on the table. Increase contribution to capture full employer match.
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                          Impact: +$47,000 at retirement
                        </Badge>
                        <Button size="sm" variant="outline" className="text-xs">
                          Apply Change
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Rebalance Asset Allocation</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Current allocation is too conservative for your age. Suggested: 70% stocks, 25% bonds, 5% alternatives.
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                          Impact: +$23,000 at retirement
                        </Badge>
                        <Button size="sm" variant="outline" className="text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-gradient-to-r from-warning/5 to-warning/10 hover:from-warning/10 hover:to-warning/15 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center mt-1">
                      <Target className="h-4 w-4 text-warning" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Consider Roth IRA Conversion</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Tax diversification opportunity. Convert $15,000 annually during lower income years.
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                          Impact: Tax diversification
                        </Badge>
                        <Button size="sm" variant="outline" className="text-xs">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-gradient-to-r from-financial-blue/5 to-financial-cyan/10 hover:from-financial-blue/10 hover:to-financial-cyan/15 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-financial-blue/20 flex items-center justify-center mt-1">
                      <DollarSign className="h-4 w-4 text-financial-blue" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Optimize Emergency Fund</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Your emergency fund is 8 months of expenses. Consider moving excess to higher-yield investments.
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs bg-financial-blue/10 text-financial-blue border-financial-blue/30">
                          Impact: +$8,500 opportunity cost
                        </Badge>
                        <Button size="sm" variant="outline" className="text-xs">
                          Optimize Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Tax Optimization Strategy
                </CardTitle>
                <CardDescription>Maximize tax efficiency across all accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-background border">
                    <div>
                      <div className="font-medium">Traditional 401(k)</div>
                      <div className="text-sm text-muted-foreground">Current contribution</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">$18,000/year</div>
                      <div className="text-xs text-muted-foreground">Tax deferred</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-success/5 border border-success/20">
                    <div>
                      <div className="font-medium text-success">Recommended: Roth IRA</div>
                      <div className="text-sm text-muted-foreground">Add tax diversification</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-success">$6,000/year</div>
                      <div className="text-xs text-muted-foreground">Tax-free growth</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div>
                      <div className="font-medium text-primary">HSA Maximization</div>
                      <div className="text-sm text-muted-foreground">Triple tax advantage</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">$3,650/year</div>
                      <div className="text-xs text-muted-foreground">Tax-free contributions & growth</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-success/10 border border-success/30">
                    <div>
                      <div className="font-medium text-success">Total Annual Tax Savings</div>
                      <div className="text-sm text-muted-foreground">Estimated benefit (24% bracket)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success text-lg">$6,636</div>
                      <div className="text-xs text-muted-foreground">Per year</div>
                    </div>
                  </div>
                </div>

                {/* Implementation Timeline */}
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <div className="font-medium mb-3">Implementation Priority</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">1</div>
                      <span className="text-sm">Maximize 401(k) employer match (immediate)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-warning text-warning-foreground text-xs flex items-center justify-center font-bold">2</div>
                      <span className="text-sm">Open and fund Roth IRA (next month)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</div>
                      <span className="text-sm">Optimize asset allocation (quarterly review)</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    Create Implementation Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}