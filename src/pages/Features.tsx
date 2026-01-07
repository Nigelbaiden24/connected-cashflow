import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Shield, 
  Sparkles,
  Globe,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  PieChart,
  FileText,
  Users,
  Brain,
  LineChart,
  Briefcase,
  Search,
  Bell,
  Lock,
  Zap,
  Target,
  CheckCircle2,
  Award,
  BookOpen,
  Menu,
  Video
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import financeHero from "@/assets/features-finance-hero.jpg";
import investorHero from "@/assets/features-investor-hero.jpg";
import researchHero from "@/assets/features-research-hero.jpg";

export default function Features() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const financeFeatures = [
    {
      icon: Users,
      title: "Client Relationship Management",
      description: "Comprehensive CRM designed for financial advisors. Track client interactions, manage portfolios, and maintain detailed records of every touchpoint."
    },
    {
      icon: PieChart,
      title: "Portfolio Analytics",
      description: "Real-time portfolio tracking with advanced analytics. Monitor asset allocation, performance metrics, and risk exposure across all client holdings."
    },
    {
      icon: Shield,
      title: "Compliance & Regulatory Tools",
      description: "Built-in compliance monitoring ensures you meet FCA, MiFID II, and GDPR requirements. Automated audit trails and documentation management."
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Leverage artificial intelligence to identify opportunities, flag risks, and generate personalised recommendations for each client."
    },
    {
      icon: FileText,
      title: "Financial Planning Suite",
      description: "Create comprehensive financial plans with cash flow projections, retirement modelling, and goal-based planning tools."
    },
    {
      icon: Bell,
      title: "Smart Alerts & Notifications",
      description: "Stay informed with intelligent alerts for market movements, client milestones, compliance deadlines, and portfolio rebalancing triggers."
    }
  ];

  const investorFeatures = [
    {
      icon: Globe,
      title: "Global Market Access",
      description: "Access international markets including UK, US, European, and Asian exchanges. Track equities, ETFs, bonds, and alternative investments worldwide."
    },
    {
      icon: Search,
      title: "Advanced Screeners",
      description: "Powerful screening tools to discover investment opportunities. Filter by fundamentals, technicals, sectors, and custom criteria."
    },
    {
      icon: LineChart,
      title: "Real-Time Market Data",
      description: "Live market feeds with comprehensive charting, technical indicators, and historical data for informed decision-making."
    },
    {
      icon: BarChart3,
      title: "Fund & ETF Database",
      description: "Extensive database of over 500 funds and ETFs with detailed performance metrics, risk ratings, and cost analysis."
    },
    {
      icon: Target,
      title: "Watchlists & Alerts",
      description: "Create custom watchlists and set price alerts. Monitor your investments and never miss a critical market movement."
    },
    {
      icon: Brain,
      title: "AI Discovery Engine",
      description: "Our AI analyses market trends, earnings reports, and sentiment to surface high-potential investment opportunities."
    }
  ];

  const researchBenefits = [
    {
      icon: Award,
      title: "Expert Analysts",
      description: "Our team comprises seasoned financial analysts with decades of combined experience across equities, fixed income, and alternative investments."
    },
    {
      icon: CheckCircle2,
      title: "Actionable Insights",
      description: "Every report includes clear recommendations, price targets, and risk assessments—giving you the confidence to act decisively."
    },
    {
      icon: Zap,
      title: "Timely Delivery",
      description: "Receive reports ahead of market-moving events. Our analysts work around the clock to deliver insights when they matter most."
    },
    {
      icon: BookOpen,
      title: "Comprehensive Coverage",
      description: "From sector deep-dives to individual stock analysis, our reports cover the full spectrum of investment opportunities."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Consistent with Index page */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src={flowpulseLogo} alt="FlowPulse" className="h-10" />
            <span className="font-bold text-xl">FlowPulse</span>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
                  FlowPulse
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-semibold"
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    FlowPulse Finance
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-semibold"
                    onClick={() => {
                      navigate("/login-investor");
                      setMobileMenuOpen(false);
                    }}
                  >
                    FlowPulse Investor
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-semibold"
                    onClick={() => {
                      navigate("/reports");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Reports
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-semibold"
                    onClick={() => {
                      navigate("/pricing");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Pricing
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-semibold"
                    onClick={() => {
                      navigate("/features");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Features
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-semibold"
                    onClick={() => {
                      navigate("/contact");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Contact
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <nav className="hidden md:flex items-center gap-12">
            <button 
              onClick={() => navigate('/login')}
              className="text-gray-600 text-base font-medium tracking-wide transition-all duration-300 hover:text-primary hover:[text-shadow:0_0_10px_hsl(var(--primary)/0.5),0_0_20px_hsl(var(--primary)/0.3)]"
            >
              FlowPulse Finance
            </button>

            <button 
              onClick={() => navigate('/login-investor')}
              className="text-gray-600 text-base font-medium tracking-wide transition-all duration-300 hover:text-primary hover:[text-shadow:0_0_10px_hsl(var(--primary)/0.5),0_0_20px_hsl(var(--primary)/0.3)]"
            >
              FlowPulse Investor
            </button>

            <button 
              onClick={() => navigate('/reports')}
              className="text-gray-600 text-base font-medium tracking-wide transition-all duration-300 hover:text-primary hover:[text-shadow:0_0_10px_hsl(var(--primary)/0.5),0_0_20px_hsl(var(--primary)/0.3)]"
            >
              Reports
            </button>

            <button 
              onClick={() => navigate('/pricing')}
              className="text-gray-600 text-base font-medium tracking-wide transition-all duration-300 hover:text-primary hover:[text-shadow:0_0_10px_hsl(var(--primary)/0.5),0_0_20px_hsl(var(--primary)/0.3)]"
            >
              Pricing
            </button>

            <button 
              className="text-primary text-base font-medium tracking-wide"
            >
              Features
            </button>

            <button 
              onClick={() => navigate('/contact')}
              className="text-gray-600 text-base font-medium tracking-wide transition-all duration-300 hover:text-primary hover:[text-shadow:0_0_10px_hsl(var(--primary)/0.5),0_0_20px_hsl(var(--primary)/0.3)]"
            >
              Contact
            </button>
          </nav>

          <Button 
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 font-semibold"
            onClick={() => navigate('/contact')}
          >
            <Video className="mr-2 h-4 w-4" />
            Book Demo
          </Button>
        </div>
      </header>

      {/* Back Button */}
      <div className="container mx-auto px-6 pt-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-white/10 text-white border-white/20 text-sm px-4 py-1 backdrop-blur-sm">
              Enterprise-Grade Financial Technology
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Platform Features
            </h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 max-w-3xl mx-auto">
              Discover how FlowPulse empowers financial advisors and investors with cutting-edge technology, expert research, and AI-driven insights
            </p>
          </div>
        </div>
      </section>

      {/* FlowPulse Finance Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
              <div className="space-y-6">
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  For Financial Advisors
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  FlowPulse Finance
                </h2>
                <p className="text-xl text-muted-foreground">
                  The complete wealth management platform designed for modern financial advisors. Streamline your practice, delight your clients, and grow your business with intelligent tools built for the way you work.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span>Centralised client data and interaction history</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span>Automated compliance and audit trail management</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span>AI-powered portfolio recommendations</span>
                  </li>
                </ul>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Access FlowPulse Finance
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl" />
                <img 
                  src={financeHero} 
                  alt="FlowPulse Finance Dashboard" 
                  className="relative rounded-2xl shadow-2xl border border-blue-200/50 dark:border-blue-800/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {financeFeatures.map((feature, idx) => (
                <Card key={idx} className="hover:shadow-xl transition-all hover:-translate-y-1 duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30">
                  <CardHeader>
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl w-fit mb-3 shadow-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FlowPulse Investor Section */}
      <section className="relative py-24 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-pink-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
              <div className="order-2 lg:order-1 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
                <img 
                  src={investorHero} 
                  alt="FlowPulse Investor Dashboard" 
                  className="relative rounded-2xl shadow-2xl border border-purple-200/50 dark:border-purple-800/50"
                />
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  For Individual Investors
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  FlowPulse Investor
                </h2>
                <p className="text-xl text-muted-foreground">
                  Your gateway to global investment opportunities. Access institutional-grade research, real-time market data, and powerful analytical tools—all in one intuitive platform designed for serious investors.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                    <span>Access to global markets and 500+ funds</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                    <span>Advanced screening and discovery tools</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                    <span>AI-powered investment recommendations</span>
                  </li>
                </ul>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/login-investor")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Access FlowPulse Investor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investorFeatures.map((feature, idx) => (
                <Card key={idx} className="hover:shadow-xl transition-all hover:-translate-y-1 duration-300 border-2 hover:border-purple-200 dark:hover:border-purple-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl w-fit mb-3 shadow-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Research Reports Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                  Our Core Service
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold">
                  Expert Financial{" "}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Research Reports
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  At the heart of FlowPulse lies our commitment to delivering institutional-quality research to every investor. Our experienced team of analysts produces in-depth reports that cut through market noise and deliver genuine alpha.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Equity Research</h4>
                      <p className="text-muted-foreground">Deep-dive analysis on UK and international equities with clear buy/sell recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Sector Analysis</h4>
                      <p className="text-muted-foreground">Comprehensive sector reviews identifying trends, opportunities, and risks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Market Commentary</h4>
                      <p className="text-muted-foreground">Daily and weekly insights on market movements and macroeconomic developments</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Thematic Research</h4>
                      <p className="text-muted-foreground">Forward-looking reports on emerging trends like AI, clean energy, and digital assets</p>
                    </div>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/reports")}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  View Research Reports
                </Button>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl" />
                  <img 
                    src={researchHero} 
                    alt="Expert Research Analysts" 
                    className="relative rounded-2xl shadow-2xl border border-emerald-200/50 dark:border-emerald-800/50 mb-6"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {researchBenefits.map((benefit, idx) => (
                    <Card key={idx} className="hover:shadow-lg transition-shadow border-2 hover:border-emerald-200 dark:hover:border-emerald-800">
                      <CardContent className="p-5 space-y-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-fit">
                          <benefit.icon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-sm">{benefit.title}</h3>
                        <p className="text-xs text-muted-foreground">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose FlowPulse */}
      <section className="relative py-24 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose FlowPulse?</h2>
            <p className="text-xl text-muted-foreground">
              We combine cutting-edge technology with human expertise to deliver unparalleled value
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border-2 hover:shadow-2xl transition-all hover:-translate-y-2 duration-300">
              <CardContent className="p-10 space-y-4">
                <div className="mx-auto p-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-fit shadow-lg">
                  <Lock className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Bank-Level Security</h3>
                <p className="text-muted-foreground">
                  Your data is protected with enterprise-grade encryption, SOC 2 compliance, and rigorous security protocols trusted by leading financial institutions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:shadow-2xl transition-all hover:-translate-y-2 duration-300">
              <CardContent className="p-10 space-y-4">
                <div className="mx-auto p-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-fit shadow-lg">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold">AI-Powered Intelligence</h3>
                <p className="text-muted-foreground">
                  Our proprietary AI analyses millions of data points in real-time to surface insights and opportunities that give you a competitive edge.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:shadow-2xl transition-all hover:-translate-y-2 duration-300">
              <CardContent className="p-10 space-y-4">
                <div className="mx-auto p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl w-fit shadow-lg">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Proven Track Record</h3>
                <p className="text-muted-foreground">
                  Trusted by financial professionals and investors worldwide with a history of delivering measurable results and exceptional client satisfaction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdHMiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZG90cykiLz48L3N2Zz4=')] opacity-40" />
        <div className="container mx-auto px-4 text-center space-y-8 relative">
          <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl">
            Ready to Transform Your Financial Journey?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto drop-shadow-lg">
            Join thousands of professionals and investors who trust FlowPulse for their financial success.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/login")}
              className="bg-white text-blue-600 hover:bg-white/90 text-lg px-8 py-6"
            >
              <Briefcase className="mr-2 h-5 w-5" />
              FlowPulse Finance
            </Button>
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => navigate("/login-investor")}
              className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8 py-6"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              FlowPulse Investor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}