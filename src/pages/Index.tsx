import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Building2, 
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Users,
  Shield,
  Zap,
  Target,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const financeFeatures = [
    { icon: TrendingUp, title: "Portfolio Management", desc: "Advanced investment tracking" },
    { icon: BarChart3, title: "Financial Planning", desc: "Comprehensive wealth strategies" },
    { icon: Users, title: "Client Management", desc: "Centralized CRM system" },
    { icon: Shield, title: "Compliance", desc: "Built-in regulatory tools" },
  ];

  const businessFeatures = [
    { icon: Building2, title: "Project Management", desc: "Track tasks and deliverables" },
    { icon: Calendar, title: "Team Collaboration", desc: "Seamless communication" },
    { icon: Target, title: "Business Analytics", desc: "Data-driven insights" },
    { icon: Zap, title: "Workflow Automation", desc: "Streamline operations" },
  ];

  const benefits = [
    "AI-Powered Intelligence",
    "Enterprise-Grade Security",
    "Real-Time Analytics",
    "Cloud-Based Platform",
    "Customizable Workflows",
    "24/7 Support",
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
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate('/login')}
              className="relative font-semibold text-lg group"
            >
              <span className="relative z-10">FlowPulse Finance</span>
              <span className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300" />
            </button>
            
            <button 
              onClick={() => navigate('/business-login')}
              className="relative font-semibold text-lg group"
            >
              <span className="relative z-10">FlowPulse Business</span>
              <span className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 group-hover:w-full transition-all duration-300" />
            </button>
            
            <button 
              onClick={() => navigate('/pricing')}
              className="relative font-semibold text-lg group"
            >
              <span className="relative z-10">Pricing</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
            <Button onClick={() => navigate('/pricing')}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-primary">Two Powerful Platforms, One Vision</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Workflow Intelligence for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Finance
            </span>
            {" "}and{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Business
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade platforms powered by AI to transform how financial advisors and businesses operate
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg" onClick={() => navigate('/login')}>
              Explore Finance Platform
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg" onClick={() => navigate('/business-login')}>
              Explore Business Platform
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Platforms Showcase */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Finance Platform */}
          <Card className="relative overflow-hidden border-2 hover:border-blue-500/50 transition-all group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">FlowPulse Finance</CardTitle>
                  <CardDescription>For Financial Advisors & Wealth Managers</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              <p className="text-muted-foreground">
                Complete financial advisory platform with portfolio management, client onboarding, compliance tools, and AI-powered insights.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {financeFeatures.map((feature, idx) => (
                  <div key={idx} className="space-y-2">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </div>
              
              <Button className="w-full" onClick={() => navigate('/login')}>
                Access Finance Platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Business Platform */}
          <Card className="relative overflow-hidden border-2 hover:border-green-500/50 transition-all group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">FlowPulse Business</CardTitle>
                  <CardDescription>For Modern Teams & Enterprises</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              <p className="text-muted-foreground">
                Comprehensive business management platform with project tracking, team collaboration, CRM, and advanced analytics.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {businessFeatures.map((feature, idx) => (
                  <div key={idx} className="space-y-2">
                    <feature.icon className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </div>
              
              <Button className="w-full" onClick={() => navigate('/business-login')}>
                Access Business Platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose FlowPulse?</h2>
              <p className="text-muted-foreground text-lg">
                Enterprise features built for modern workflows
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of professionals using FlowPulse to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/pricing')}>
              View Pricing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/about')}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
              <span className="font-semibold">FlowPulse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FlowPulse. Enterprise workflow intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
