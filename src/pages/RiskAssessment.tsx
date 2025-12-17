import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { AlertTriangle, Shield, TrendingUp, Target, CheckCircle2, Info, Calculator, Download, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateFinancialReport } from "@/utils/pdfGenerator";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

// Risk assessment questionnaire
const riskQuestions = [
  {
    id: 1,
    question: "What is your investment time horizon?",
    options: [
      { value: "short", label: "Less than 3 years", score: 1 },
      { value: "medium", label: "3-10 years", score: 2 },
      { value: "long", label: "More than 10 years", score: 3 }
    ]
  },
  {
    id: 2,
    question: "How would you react to a 20% portfolio decline?",
    options: [
      { value: "sell", label: "Sell immediately to avoid further losses", score: 1 },
      { value: "hold", label: "Hold and wait for recovery", score: 2 },
      { value: "buy", label: "Buy more while prices are low", score: 3 }
    ]
  },
  {
    id: 3,
    question: "What is your primary investment goal?",
    options: [
      { value: "preserve", label: "Preserve capital", score: 1 },
      { value: "income", label: "Generate steady income", score: 2 },
      { value: "growth", label: "Maximize long-term growth", score: 3 }
    ]
  },
  {
    id: 4,
    question: "How much investment experience do you have?",
    options: [
      { value: "beginner", label: "Beginner (less than 2 years)", score: 1 },
      { value: "intermediate", label: "Intermediate (2-10 years)", score: 2 },
      { value: "experienced", label: "Experienced (more than 10 years)", score: 3 }
    ]
  }
];

// Portfolio risk metrics
const riskMetrics = [
  {
    metric: "Portfolio Beta",
    value: 1.15,
    description: "Volatility relative to market",
    target: "0.8 - 1.2",
    status: "normal"
  },
  {
    metric: "Sharpe Ratio",
    value: 1.82,
    description: "Risk-adjusted return",
    target: "> 1.0",
    status: "good"
  },
  {
    metric: "Maximum Drawdown",
    value: -8.4,
    description: "Largest peak-to-trough loss",
    target: "< -15%",
    status: "good"
  },
  {
    metric: "Value at Risk (95%)",
    value: -12.3,
    description: "Potential loss over 1 month",
    target: "< -20%",
    status: "normal"
  },
  {
    metric: "Standard Deviation",
    value: 14.2,
    description: "Volatility measure",
    target: "< 20%",
    status: "good"
  },
  {
    metric: "Correlation to S&P 500",
    value: 0.87,
    description: "Market correlation",
    target: "0.6 - 0.9",
    status: "normal"
  }
];

// Asset allocation scenarios
const allocationScenarios = [
  {
    name: "Conservative",
    risk: "Low",
    stocks: 30,
    bonds: 60,
    alternatives: 10,
    expectedReturn: 5.2,
    volatility: 8.1,
    color: "#82ca9d"
  },
  {
    name: "Moderate",
    risk: "Medium",
    stocks: 60,
    bonds: 30,
    alternatives: 10,
    expectedReturn: 7.8,
    volatility: 12.4,
    color: "#8884d8"
  },
  {
    name: "Aggressive",
    risk: "High", 
    stocks: 80,
    bonds: 10,
    alternatives: 10,
    expectedReturn: 9.5,
    volatility: 16.8,
    color: "#ffc658"
  },
  {
    name: "Current Portfolio",
    risk: "Medium",
    stocks: 65,
    bonds: 25,
    alternatives: 10,
    expectedReturn: 8.1,
    volatility: 13.2,
    color: "#ff7300"
  }
];

// Historical stress test scenarios
const stressTestScenarios = [
  { scenario: "2008 Financial Crisis", impact: -37.0, duration: "18 months", recovery: "24 months" },
  { scenario: "COVID-19 Pandemic", impact: -12.4, duration: "2 months", recovery: "6 months" },
  { scenario: "Dot-Com Crash", impact: -22.1, duration: "12 months", recovery: "36 months" },
  { scenario: "Interest Rate Shock", impact: -8.7, duration: "6 months", recovery: "12 months" }
];

export default function RiskAssessment() {
  const navigate = useNavigate();
  const [riskAnswers, setRiskAnswers] = useState<Record<number, string>>({});
  const [riskTolerance, setRiskTolerance] = useState([50]);
  const [currentStep, setCurrentStep] = useState(0);

  const calculateRiskScore = () => {
    const totalQuestions = riskQuestions.length;
    const answeredQuestions = Object.keys(riskAnswers).length;
    
    if (answeredQuestions === 0) return 0;
    
    const totalScore = Object.entries(riskAnswers).reduce((sum, [questionId, answer]) => {
      const question = riskQuestions.find(q => q.id === parseInt(questionId));
      const option = question?.options.find(opt => opt.value === answer);
      return sum + (option?.score || 0);
    }, 0);
    
    return Math.round((totalScore / (totalQuestions * 3)) * 100);
  };

  const riskScore = calculateRiskScore();

  const getRiskLevel = (score: number) => {
    if (score < 40) return { level: "Conservative", color: "text-success" };
    if (score < 70) return { level: "Moderate", color: "text-warning" };
    return { level: "Aggressive", color: "text-destructive" };
  };

  const getMetricStatus = (status: string) => {
    switch (status) {
      case "good": return { color: "text-success", icon: CheckCircle2 };
      case "normal": return { color: "text-warning", icon: Info };
      case "warning": return { color: "text-destructive", icon: AlertTriangle };
      default: return { color: "text-muted-foreground", icon: Info };
    }
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="p-6 space-y-6">
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
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Risk Assessment</h1>
            <p className="text-muted-foreground">Evaluate and manage investment risk exposure</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const reportContent = `Risk Assessment Report
              
Risk Profile Analysis:
- Risk Score: ${riskScore}%
- Risk Level: ${getRiskLevel(riskScore).level}
- Risk Tolerance: ${riskTolerance[0]}%

Portfolio Risk Metrics:
${riskMetrics.map(m => `- ${m.metric}: ${m.value}${typeof m.value === 'number' && m.value < 0 ? '%' : ''} (Target: ${m.target})`).join('\n')}

Recommended Asset Allocation:
${riskScore < 40 ? '- Stocks: 30%\n- Bonds: 60%\n- Alternatives: 10%' : riskScore >= 70 ? '- Stocks: 80%\n- Bonds: 10%\n- Alternatives: 10%' : '- Stocks: 60%\n- Bonds: 30%\n- Alternatives: 10%'}

Stress Test Results:
${stressTestScenarios.map(s => `${s.scenario}: ${s.impact}% impact over ${s.duration} with ${s.recovery} recovery time`).join('\n')}

Recommendations:
Based on your risk profile and tolerance, we recommend maintaining a ${getRiskLevel(riskScore).level.toLowerCase()} investment strategy that aligns with your financial goals and objectives.`;

              generateFinancialReport({
                title: 'Risk Assessment Report',
                content: reportContent,
                generatedBy: 'FlowPulse.io Risk Analysis Team',
                date: new Date(),
              });

              toast({
                title: "Report Ready",
                description: "Risk assessment report downloaded successfully.",
              });
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Risk Report
          </Button>
          <Button 
            size="sm"
            onClick={() => toast({
              title: "Rebalancing Portfolio",
              description: "Portfolio rebalancing has been initiated based on your risk profile.",
            })}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Rebalance Portfolio
          </Button>
        </div>
      </div>

      <Tabs defaultValue="assessment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="metrics">Risk Metrics</TabsTrigger>
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="stress">Stress Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Questionnaire */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Tolerance Assessment
                </CardTitle>
                <CardDescription>
                  Answer these questions to determine your risk profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  {riskQuestions.map((question) => (
                    <div key={question.id} className="space-y-3">
                      <Label className="text-base font-medium">{question.question}</Label>
                      <RadioGroup
                        value={riskAnswers[question.id] || ""}
                        onValueChange={(value) => setRiskAnswers(prev => ({
                          ...prev,
                          [question.id]: value
                        }))}
                      >
                        {question.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                            <Label htmlFor={`${question.id}-${option.value}`} className="font-normal">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Risk Tolerance Level: {riskTolerance[0]}%
                    </Label>
                    <Slider
                      value={riskTolerance}
                      onValueChange={setRiskTolerance}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Conservative</span>
                      <span>Moderate</span>
                      <span>Aggressive</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Profile Results */}
            <Card>
              <CardHeader>
                <CardTitle>Your Risk Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{riskScore}%</div>
                  <Badge className={getRiskLevel(riskScore).color}>
                    {getRiskLevel(riskScore).level}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Risk Assessment</span>
                    <span>{riskScore}%</span>
                  </div>
                  <Progress value={riskScore} />
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Recommended Allocation:</h4>
                  {riskScore < 40 && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Stocks:</span><span>30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonds:</span><span>60%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alternatives:</span><span>10%</span>
                      </div>
                    </div>
                  )}
                  {riskScore >= 40 && riskScore < 70 && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Stocks:</span><span>60%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonds:</span><span>30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alternatives:</span><span>10%</span>
                      </div>
                    </div>
                  )}
                  {riskScore >= 70 && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Stocks:</span><span>80%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonds:</span><span>10%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alternatives:</span><span>10%</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full"
                  onClick={() => toast({
                    title: "Allocation Applied",
                    description: "Your portfolio has been updated with the recommended allocation.",
                  })}
                >
                  Apply Recommended Allocation
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riskMetrics.map((metric) => {
              const statusInfo = getMetricStatus(metric.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <Card key={metric.metric}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                    <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {typeof metric.value === 'number' && metric.value < 0 ? 
                        `${metric.value.toFixed(1)}%` : 
                        metric.value
                      }
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Target: {metric.target}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Metrics Over Time</CardTitle>
              <CardDescription>Historical volatility and risk-adjusted returns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { month: "Jan", volatility: 12.1, sharpe: 1.65 },
                  { month: "Feb", volatility: 13.4, sharpe: 1.72 },
                  { month: "Mar", volatility: 15.2, sharpe: 1.58 },
                  { month: "Apr", volatility: 11.8, sharpe: 1.89 },
                  { month: "May", volatility: 14.2, sharpe: 1.82 },
                  { month: "Jun", volatility: 13.9, sharpe: 1.75 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="volatility" fill="hsl(var(--primary))" opacity={0.3} name="Volatility %" />
                  <Line yAxisId="right" type="monotone" dataKey="sharpe" stroke="hsl(var(--destructive))" strokeWidth={2} name="Sharpe Ratio" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation Scenarios</CardTitle>
              <CardDescription>Compare different allocation strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {allocationScenarios.map((scenario) => (
                  <Card key={scenario.name} className="relative">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                      <Badge variant="outline">{scenario.risk} Risk</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Stocks:</span>
                          <span>{scenario.stocks}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Bonds:</span>
                          <span>{scenario.bonds}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Alternatives:</span>
                          <span>{scenario.alternatives}%</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Expected Return:</span>
                          <span className="font-semibold text-success">{scenario.expectedReturn}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Volatility:</span>
                          <span className="font-semibold">{scenario.volatility}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Expected Return vs Risk</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={allocationScenarios}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="expectedReturn" fill="hsl(var(--success))" name="Expected Return %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Volatility Comparison</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={allocationScenarios}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="volatility" fill="hsl(var(--warning))" name="Volatility %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stress" className="space-y-6">
          {/* Key Stress Metrics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-destructive/20">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Worst Case Impact</div>
                    <div className="text-2xl font-bold text-destructive">-37.0%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-warning/20">
                    <TrendingUp className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Recovery Time</div>
                    <div className="text-2xl font-bold">19.5 months</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Resilience Score</div>
                    <div className="text-2xl font-bold text-primary">72/100</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-success/20">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Risk Adjusted</div>
                    <div className="text-2xl font-bold text-success">Strong</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stress Test Scenarios */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Historical Stress Scenarios
                </CardTitle>
                <CardDescription>Portfolio performance during major market events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stressTestScenarios.map((scenario, index) => (
                    <div 
                      key={scenario.scenario} 
                      className="p-5 rounded-xl border bg-gradient-to-r from-card to-muted/30 hover:shadow-lg transition-all duration-300 hover:border-primary/30"
                      style={{ animationDelay: `${index * 100}ms`, animation: 'fade-in 0.5s ease-out' }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{scenario.scenario}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Crisis Duration: {scenario.duration}
                          </p>
                        </div>
                        <Badge 
                          variant="outline"
                          className={`text-base px-3 py-1 ${
                            scenario.impact > -15 ? 'bg-warning/10 text-warning border-warning/30' : 'bg-destructive/10 text-destructive border-destructive/30'
                          }`}
                        >
                          {formatPercent(scenario.impact)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg bg-destructive/10 text-center">
                          <div className="text-xs text-muted-foreground mb-1">Portfolio Impact</div>
                          <div className="text-xl font-bold text-destructive">
                            {formatPercent(scenario.impact)}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-warning/10 text-center">
                          <div className="text-xs text-muted-foreground mb-1">Duration</div>
                          <div className="text-xl font-bold text-warning">{scenario.duration}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-success/10 text-center">
                          <div className="text-xs text-muted-foreground mb-1">Recovery</div>
                          <div className="text-xl font-bold text-success">{scenario.recovery}</div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Impact Severity</span>
                          <span>{Math.abs(scenario.impact)}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              Math.abs(scenario.impact) > 30 ? 'bg-gradient-to-r from-destructive to-destructive/70' :
                              Math.abs(scenario.impact) > 15 ? 'bg-gradient-to-r from-warning to-warning/70' :
                              'bg-gradient-to-r from-primary to-primary/70'
                            }`}
                            style={{ width: `${Math.min(Math.abs(scenario.impact) * 2.5, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Impact Visualization */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Impact Comparison Chart
                </CardTitle>
                <CardDescription>Visual comparison of stress test impacts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stressTestScenarios} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" domain={[-50, 0]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="scenario" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Impact']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar 
                      dataKey="impact" 
                      fill="hsl(var(--destructive))"
                      radius={[0, 4, 4, 0]}
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Portfolio Resilience Analysis</div>
                      <div className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        Based on historical stress tests, your current portfolio demonstrates <span className="text-primary font-semibold">strong resilience</span> with 
                        manageable drawdowns and reasonable recovery periods. The worst-case scenario (2008 Financial Crisis) 
                        would result in a 37% drawdown, but recovery is achievable within 24 months. Consider 
                        <span className="text-primary font-semibold"> increasing defensive positions</span> if you're concerned about near-term volatility.
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download Report
                        </Button>
                        <Button size="sm" className="gap-2">
                          <Calculator className="h-4 w-4" />
                          Run Custom Scenario
                        </Button>
                      </div>
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