import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { UserPlus, Calendar as CalendarIcon, FileText, Shield, Target, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Onboarding steps
const onboardingSteps = [
  { id: 1, title: "Personal Information", status: "completed" },
  { id: 2, title: "Financial Profile", status: "completed" },
  { id: 3, title: "Risk Assessment", status: "current" },
  { id: 4, title: "Investment Goals", status: "pending" },
  { id: 5, title: "Account Setup", status: "pending" },
  { id: 6, title: "Document Upload", status: "pending" }
];

// Client onboarding data structure
const clientData = {
  personalInfo: {
    firstName: "Sarah",
    lastName: "Johnson",
    dateOfBirth: new Date(1985, 5, 15),
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, ST 12345",
    occupation: "Marketing Manager",
    employer: "Tech Solutions Inc.",
    annualIncome: 125000,
    netWorth: 350000
  },
  financialProfile: {
    investmentExperience: "intermediate",
    currentInvestments: 180000,
    liquidSavings: 45000,
    monthlyInvestmentCapacity: 3500,
    debt: 85000,
    insurance: ["life", "disability", "health"]
  },
  goals: [
    { goal: "retirement", target: 1200000, timeframe: 25, priority: "high" },
    { goal: "house", target: 100000, timeframe: 5, priority: "medium" },
    { goal: "education", target: 80000, timeframe: 15, priority: "medium" }
  ]
};

// Required documents (UK)
const requiredDocuments = [
  { name: "Government-issued Photo ID (Passport/Driving Licence)", type: "identification", required: true, status: "uploaded" },
  { name: "National Insurance Number", type: "identification", required: true, status: "pending" },
  { name: "Recent Payslip", type: "income", required: true, status: "uploaded" },
  { name: "Self Assessment Tax Return (Last 2 Years)", type: "income", required: true, status: "uploaded" },
  { name: "Bank Statements (Last 3 Months)", type: "financial", required: true, status: "pending" },
  { name: "Investment Account Statements", type: "financial", required: false, status: "uploaded" },
  { name: "Proof of Address (Utility Bill/Council Tax)", type: "identification", required: true, status: "pending" }
];

export default function ClientOnboarding() {
  const [currentStep, setCurrentStep] = useState(3);
  const [riskAnswers, setRiskAnswers] = useState<Record<string, string>>({});
  const [investmentGoals, setInvestmentGoals] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteOnboarding = async () => {
    setIsCompleting(true);
    try {
      // Generate a unique client ID
      const clientId = `CLI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Map investment experience to proper risk profile values
      const riskProfileMap: Record<string, string> = {
        'beginner': 'Conservative',
        'intermediate': 'Moderate',
        'experienced': 'Aggressive'
      };
      
      const riskProfile = riskProfileMap[clientData.financialProfile.investmentExperience] || 'Moderate';
      
      // Insert client data into Supabase
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            client_id: clientId,
            name: `${clientData.personalInfo.firstName} ${clientData.personalInfo.lastName}`,
            email: clientData.personalInfo.email,
            phone: clientData.personalInfo.phone,
            address: clientData.personalInfo.address,
            occupation: clientData.personalInfo.occupation,
            date_of_birth: clientData.personalInfo.dateOfBirth.toISOString().split('T')[0],
            annual_income: clientData.personalInfo.annualIncome,
            net_worth: clientData.personalInfo.netWorth,
            aum: clientData.financialProfile.currentInvestments,
            risk_profile: riskProfile,
            status: 'active',
            investment_experience: clientData.financialProfile.investmentExperience,
            investment_objectives: clientData.goals.map(g => g.goal),
            liquidity_needs: clientData.financialProfile.liquidSavings.toString(),
            time_horizon: clientData.goals.length > 0 ? clientData.goals[0].timeframe : null,
            notes: `Onboarded on ${new Date().toLocaleDateString('en-GB')}`
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Client ${clientData.personalInfo.firstName} ${clientData.personalInfo.lastName} has been successfully onboarded.`,
      });

      // Reset form or redirect as needed
      console.log('Client onboarded successfully:', data);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const getStepStatus = (stepId: number) => {
    const step = onboardingSteps.find(s => s.id === stepId);
    return step?.status || "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success";
      case "current": return "text-primary";
      case "pending": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle2;
      case "current": return Clock;
      case "pending": return AlertCircle;
      default: return Clock;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = () => {
    const completedSteps = onboardingSteps.filter(step => step.status === "completed").length;
    return (completedSteps / onboardingSteps.length) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Client Onboarding</h1>
          <p className="text-muted-foreground">Streamlined client intake and setup process</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toast({
              title: "Generating Summary",
              description: "Creating client onboarding summary document...",
            })}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Summary
          </Button>
          <Button size="sm" onClick={handleCompleteOnboarding} disabled={isCompleting}>
            <UserPlus className="h-4 w-4 mr-2" />
            {isCompleting ? 'Completing...' : 'Complete Onboarding'}
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Onboarding Progress</CardTitle>
              <CardDescription>Client: {clientData.personalInfo.firstName} {clientData.personalInfo.lastName}</CardDescription>
            </div>
            <Badge variant="outline">{Math.round(calculateProgress())}% Complete</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={calculateProgress()} className="w-full" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {onboardingSteps.map((step) => {
                const StatusIcon = getStatusIcon(step.status);
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center text-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      step.status === "current" ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <StatusIcon className={`h-6 w-6 mb-2 ${getStatusColor(step.status)}`} />
                    <span className="text-sm font-medium">{step.title}</span>
                    <Badge variant="outline" className={`mt-1 text-xs ${getStatusColor(step.status)}`}>
                      {step.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={`step-${currentStep}`} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          {onboardingSteps.map((step) => (
            <TabsTrigger
              key={step.id}
              value={`step-${step.id}`}
              onClick={() => setCurrentStep(step.id)}
              className="text-xs"
            >
              Step {step.id}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Step 1: Personal Information */}
        <TabsContent value="step-1" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic client details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={clientData.personalInfo.firstName} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={clientData.personalInfo.lastName} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={clientData.personalInfo.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={clientData.personalInfo.phone} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal" disabled>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(clientData.personalInfo.dateOfBirth, "PPP")}
                      </Button>
                    </PopoverTrigger>
                  </Popover>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea value={clientData.personalInfo.address} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input value={clientData.personalInfo.occupation} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Employer</Label>
                  <Input value={clientData.personalInfo.employer} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Financial Profile */}
        <TabsContent value="step-2" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Profile</CardTitle>
              <CardDescription>Client's current financial situation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">Annual Income</div>
                  <div className="text-2xl font-bold">{formatCurrency(clientData.personalInfo.annualIncome)}</div>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">Net Worth</div>
                  <div className="text-2xl font-bold">{formatCurrency(clientData.personalInfo.netWorth)}</div>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">Current Investments</div>
                  <div className="text-2xl font-bold">{formatCurrency(clientData.financialProfile.currentInvestments)}</div>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">Liquid Savings</div>
                  <div className="text-2xl font-bold">{formatCurrency(clientData.financialProfile.liquidSavings)}</div>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">Monthly Investment Capacity</div>
                  <div className="text-2xl font-bold">{formatCurrency(clientData.financialProfile.monthlyInvestmentCapacity)}</div>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">Outstanding Debt</div>
                  <div className="text-2xl font-bold">{formatCurrency(clientData.financialProfile.debt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Risk Assessment */}
        <TabsContent value="step-3" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk Assessment Questionnaire
              </CardTitle>
              <CardDescription>Evaluate the client's risk tolerance and investment preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">What is your investment time horizon?</Label>
                  <RadioGroup>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="short" id="short" />
                      <Label htmlFor="short">Less than 3 years</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">3-10 years</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="long" id="long" />
                      <Label htmlFor="long">More than 10 years</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">How would you react to a 20% portfolio decline?</Label>
                  <RadioGroup>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sell" id="sell" />
                      <Label htmlFor="sell">Sell immediately to avoid further losses</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hold" id="hold" />
                      <Label htmlFor="hold">Hold and wait for recovery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="buy" id="buy" />
                      <Label htmlFor="buy">Buy more while prices are low</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">What is your primary investment goal?</Label>
                  <RadioGroup>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="preserve" id="preserve" />
                      <Label htmlFor="preserve">Preserve capital</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="income" id="income" />
                      <Label htmlFor="income">Generate steady income</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="growth" id="growth" />
                      <Label htmlFor="growth">Maximize long-term growth</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Investment Goals */}
        <TabsContent value="step-4" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Investment Goals
              </CardTitle>
              <CardDescription>Define specific financial objectives and timelines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {clientData.goals.map((goal, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold capitalize">{goal.goal} Planning</h3>
                        <p className="text-sm text-muted-foreground">
                          Target: {formatCurrency(goal.target)} in {goal.timeframe} years
                        </p>
                      </div>
                      <Badge variant={goal.priority === "high" ? "destructive" : goal.priority === "medium" ? "default" : "secondary"}>
                        {goal.priority} priority
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Target Amount</div>
                        <div className="font-semibold">{formatCurrency(goal.target)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Time Frame</div>
                        <div className="font-semibold">{goal.timeframe} years</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Monthly Needed</div>
                        <div className="font-semibold">{formatCurrency(goal.target / (goal.timeframe * 12))}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 5: Account Setup */}
        <TabsContent value="step-5" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Setup</CardTitle>
              <CardDescription>Configure investment accounts and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual Taxable</SelectItem>
                        <SelectItem value="ira">Traditional IRA</SelectItem>
                        <SelectItem value="roth">Roth IRA</SelectItem>
                        <SelectItem value="401k">401(k) Rollover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Investment Strategy</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative Growth</SelectItem>
                        <SelectItem value="balanced">Balanced Portfolio</SelectItem>
                        <SelectItem value="growth">Growth Focused</SelectItem>
                        <SelectItem value="aggressive">Aggressive Growth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Initial Deposit</Label>
                    <Input type="number" placeholder="Enter amount" />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Contribution</Label>
                    <Input type="number" placeholder="Enter monthly amount" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 6: Document Upload */}
        <TabsContent value="step-6" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Upload
              </CardTitle>
              <CardDescription>Required documents for account opening and compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        doc.status === "uploaded" ? "bg-success/20 text-success" :
                        doc.status === "pending" ? "bg-warning/20 text-warning" : "bg-muted"
                      }`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">{doc.type} document</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {doc.required && (
                        <Badge variant="outline" className="text-destructive">Required</Badge>
                      )}
                      <Badge variant={
                        doc.status === "uploaded" ? "default" :
                        doc.status === "pending" ? "secondary" : "outline"
                      }>
                        {doc.status}
                      </Badge>
                      {doc.status === "pending" && (
                        <Button size="sm">Upload</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous Step
        </Button>
        <Button 
          onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
          disabled={currentStep === 6}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}