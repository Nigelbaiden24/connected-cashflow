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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Calculator, Target, DollarSign, TrendingUp, AlertTriangle, Plus, Save } from "lucide-react";

// Dummy data for projections
const projectionData = [
  { age: 30, conservative: 50000, moderate: 50000, aggressive: 50000 },
  { age: 35, conservative: 78000, moderate: 89000, aggressive: 103000 },
  { age: 40, conservative: 112000, moderate: 138000, aggressive: 178000 },
  { age: 45, conservative: 152000, moderate: 201000, aggressive: 285000 },
  { age: 50, conservative: 199000, moderate: 281000, aggressive: 425000 },
  { age: 55, conservative: 255000, moderate: 384000, aggressive: 632000 },
  { age: 60, conservative: 321000, moderate: 515000, aggressive: 891000 },
  { age: 65, conservative: 398000, moderate: 672000, aggressive: 1249000 },
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
  const [expectedReturn, setExpectedReturn] = useState([7]);
  const [riskTolerance, setRiskTolerance] = useState("moderate");

  const yearsToRetirement = retirementAge - currentAge;
  const monthsToRetirement = yearsToRetirement * 12;

  const calculateFutureValue = (pv: number, pmt: number, rate: number, periods: number) => {
    const monthlyRate = rate / 100 / 12;
    const futureValuePV = pv * Math.pow(1 + monthlyRate, periods);
    const futureValuePMT = pmt * (Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate;
    return futureValuePV + futureValuePMT;
  };

  const projectedValue = calculateFutureValue(currentSavings, monthlyContribution, expectedReturn[0], monthsToRetirement);
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Parameters */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Planning Parameters
                </CardTitle>
                <CardDescription>Adjust your planning assumptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <div className="space-y-3">
                  <Label>Expected Annual Return: {expectedReturn[0]}%</Label>
                  <Slider
                    value={expectedReturn}
                    onValueChange={setExpectedReturn}
                    max={12}
                    min={3}
                    step={0.5}
                    className="w-full"
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
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Retirement Projection
                </CardTitle>
                <CardDescription>Based on your current plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-background border">
                    <div className="text-sm text-muted-foreground">Projected Value at {retirementAge}</div>
                    <div className="text-2xl font-bold">{formatCurrency(projectedValue)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-background border">
                    <div className="text-sm text-muted-foreground">
                      {shortfall >= 0 ? "Surplus" : "Shortfall"}
                    </div>
                    <div className={`text-2xl font-bold ${shortfall >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(Math.abs(shortfall))}
                    </div>
                  </div>
                </div>

                {/* Progress to Goal */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Goal</span>
                    <span>{((projectedValue / retirementGoal) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(projectedValue / retirementGoal) * 100} />
                </div>

                {/* Projection Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Line type="monotone" dataKey="conservative" stroke="#ffc658" strokeWidth={2} name="Conservative" />
                      <Line type="monotone" dataKey="moderate" stroke="#8884d8" strokeWidth={2} name="Moderate" />
                      <Line type="monotone" dataKey="aggressive" stroke="#82ca9d" strokeWidth={2} name="Aggressive" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Action Items */}
                {shortfall < 0 && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="font-semibold text-destructive">Action Required</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>To reach your goal, consider:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Increase monthly contribution by ${Math.ceil(Math.abs(shortfall) / monthsToRetirement)}</li>
                        <li>Extend retirement age by {Math.ceil(Math.abs(shortfall) / (monthlyContribution * 12))} years</li>
                        <li>Consider higher-return investments (with appropriate risk)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
              <CardDescription>Compare different planning scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {scenarios.map((scenario) => (
                  <Card key={scenario.name}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Monthly:</span>
                          <span>{formatCurrency(scenario.monthlyContribution)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Return:</span>
                          <span>{scenario.returnRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Projected:</span>
                          <span className="font-semibold">{formatCurrency(scenario.projectedValue)}</span>
                        </div>
                        {scenario.shortfall !== 0 && (
                          <div className="flex justify-between">
                            <span>{scenario.shortfall > 0 ? 'Surplus:' : 'Shortfall:'}</span>
                            <span className={scenario.shortfall > 0 ? 'text-success' : 'text-destructive'}>
                              {formatCurrency(Math.abs(scenario.shortfall))}
                            </span>
                          </div>
                        )}
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

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarios}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="projectedValue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
                <CardDescription>AI-powered suggestions to improve your plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border bg-background">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <div className="font-semibold">Increase 401(k) Contribution</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Maximize employer matching by increasing to $500/month
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Impact: +$47,000 at retirement
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-background">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-semibold">Optimize Asset Allocation</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Adjust to 70/30 stocks/bonds based on risk tolerance
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Impact: +$23,000 at retirement
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-background">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <div className="font-semibold">Consider Roth IRA</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Tax-free growth for retirement income flexibility
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Impact: Tax diversification
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Optimization</CardTitle>
                <CardDescription>Strategies to minimize tax impact</CardDescription>
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

                  <div className="flex justify-between items-center p-3 rounded-lg bg-background border">
                    <div>
                      <div className="font-medium">Roth IRA</div>
                      <div className="text-sm text-muted-foreground">Recommended addition</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">$6,000/year</div>
                      <div className="text-xs text-muted-foreground">Tax-free growth</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-success/10 border border-success/20">
                    <div>
                      <div className="font-medium text-success">Total Tax Savings</div>
                      <div className="text-sm text-muted-foreground">Annual benefit</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-success">$4,320</div>
                      <div className="text-xs text-muted-foreground">24% tax bracket</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}