import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Shield, 
  Sparkles,
  PieChart,
  Target,
  Calculator,
  AlertTriangle,
  Activity,
  UserPlus,
  Briefcase,
  FileText,
  CheckCircle2
} from "lucide-react";
import financeScreenshot from "@/assets/finance-dashboard-screenshot.png";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

const FinanceFeatures = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "Portfolio Management",
      description: "Real-time tracking of client investments with advanced analytics and performance metrics. Monitor asset allocation, track returns, and optimize portfolios with AI-powered insights."
    },
    {
      icon: Calculator,
      title: "Financial Planning",
      description: "Comprehensive wealth strategies with goal-based planning tools. Create detailed financial plans, retirement projections, and tax optimization strategies tailored to each client."
    },
    {
      icon: Sparkles,
      title: "AI-Powered Insights",
      description: "Intelligent recommendations and automated financial planning with machine learning. Get predictive analytics, risk assessments, and personalized investment suggestions powered by advanced AI."
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Comprehensive CRM with onboarding workflows and relationship tracking. Manage client communications, document sharing, and meeting schedules all in one centralized platform."
    },
    {
      icon: Shield,
      title: "Compliance & Security",
      description: "Built-in regulatory compliance tools with enterprise-grade security and encryption. Stay compliant with SEC, FINRA, and other regulations while protecting sensitive client data."
    },
    {
      icon: PieChart,
      title: "Investment Analysis",
      description: "Advanced portfolio analytics with performance attribution and risk analysis. Track investment performance, benchmark against indices, and generate detailed performance reports."
    },
    {
      icon: Target,
      title: "Goal Planning",
      description: "Visual goal tracking and progress monitoring for client objectives. Set financial milestones, track progress, and adjust strategies to keep clients on track to meet their goals."
    },
    {
      icon: AlertTriangle,
      title: "Risk Assessment",
      description: "Comprehensive risk profiling and portfolio stress testing. Evaluate client risk tolerance, perform scenario analysis, and ensure portfolios align with risk objectives."
    },
    {
      icon: Activity,
      title: "Scenario Analysis",
      description: "Model different market conditions and their impact on portfolios. Run what-if scenarios, test portfolio resilience, and make data-driven investment decisions."
    },
    {
      icon: UserPlus,
      title: "Client Onboarding",
      description: "Streamlined digital onboarding with KYC verification and document collection. Automate paperwork, compliance checks, and account setup for a seamless client experience."
    },
    {
      icon: Briefcase,
      title: "Practice Management",
      description: "Efficient operations management with billing, scheduling, and workflow automation. Manage your advisory practice with tools for time tracking, invoicing, and resource allocation."
    },
    {
      icon: FileText,
      title: "Reporting & Documents",
      description: "Automated report generation and branded client deliverables. Create professional investment reports, financial plans, and presentations with customizable templates."
    }
  ];

  const benefits = [
    "Save 10+ hours per week on administrative tasks",
    "Increase client satisfaction with real-time insights",
    "Reduce compliance risks with built-in regulatory tools",
    "Scale your practice without adding overhead",
    "Make better investment decisions with AI analytics",
    "Deliver professional client experiences"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src={flowpulseLogo} alt="FlowPulse" className="h-10" />
            <span className="font-bold text-xl">FlowPulse</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              onClick={() => navigate('/login')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-background to-cyan-50 dark:from-blue-950/20 dark:via-background dark:to-cyan-950/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg mb-4">
              <TrendingUp className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              FlowPulse Finance
            </h1>
            <p className="text-2xl text-muted-foreground">
              The Complete Wealth Management Platform for Financial Advisors
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Streamline your advisory practice with AI-powered tools for portfolio management, financial planning, 
              client relationships, and compliance. Built specifically for wealth managers and financial advisors.
            </p>
          </div>

          {/* Screenshot */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl" />
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-blue-500/30 p-4 shadow-2xl">
                <div className="bg-black rounded-xl overflow-hidden">
                  <img 
                    src={financeScreenshot} 
                    alt="Finance Platform Dashboard" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comprehensive Features for Modern Advisors</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to manage client relationships, portfolios, and grow your practice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-500/50">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-sm">{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-background to-cyan-50 dark:from-blue-950/20 dark:via-background dark:to-cyan-950/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Why Choose FlowPulse Finance?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-background/80 backdrop-blur rounded-xl border-2 border-blue-500/20">
                  <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-lg">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold">Ready to Transform Your Advisory Practice?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of financial advisors who trust FlowPulse Finance to manage their practices
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-8"
                onClick={() => navigate('/login')}
              >
                Get Started Free
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8"
                onClick={() => navigate('/')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FinanceFeatures;
