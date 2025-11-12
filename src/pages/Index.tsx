import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Calendar,
  Sparkles,
  Lock,
  Video,
  ChevronDown,
  Laptop
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import heroBackground from "@/assets/business-presentation-hero.jpg";
import financeScreenshot from "@/assets/finance-dashboard-screenshot.png";
import businessScreenshot from "@/assets/business-dashboard-screenshot.png";
import globalFinance from "@/assets/global-finance-districts.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });

  // Validation schema for demo request
  const demoRequestSchema = z.object({
    name: z.string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters"),
    email: z.string()
      .trim()
      .email("Invalid email address")
      .max(255, "Email must be less than 255 characters"),
    company: z.string()
      .trim()
      .max(200, "Company name must be less than 200 characters")
      .optional(),
    phone: z.string()
      .trim()
      .max(50, "Phone number must be less than 50 characters")
      .optional(),
    message: z.string()
      .trim()
      .max(1000, "Message must be less than 1000 characters")
      .optional(),
  });

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate input
      const validatedData = demoRequestSchema.parse(formData);
      
      // Prepare data for database insertion
      const dataToInsert = {
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company || null,
        phone: validatedData.phone || null,
        message: validatedData.message || null,
      };
      
      const { error } = await supabase
        .from('demo_requests')
        .insert([dataToInsert]);

      if (error) throw error;

      toast({
        title: "Demo Request Received!",
        description: "Our team will contact you within 24 hours to schedule your demo.",
      });
      
      setDemoDialogOpen(false);
      setFormData({ name: "", email: "", company: "", phone: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0]?.message || "Please check your input.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

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
              className="relative font-space-grotesk font-semibold text-lg group"
            >
              <span className="relative z-10">FlowPulse Finance</span>
              <span className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300" />
            </button>
            
            <button 
              onClick={() => navigate('/login-business')}
              className="relative font-space-grotesk font-semibold text-lg group"
            >
              <span className="relative z-10">FlowPulse Business</span>
              <span className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 group-hover:w-full transition-all duration-300" />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative font-space-grotesk font-semibold text-lg group flex items-center gap-2">
                  <span className="relative z-10">Features</span>
                  <ChevronDown className="h-4 w-4 group-data-[state=open]:rotate-180 transition-transform" />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[900px] p-8 bg-background/95 backdrop-blur-xl border-2 border-border/50 shadow-2xl" align="center">
                <div className="grid grid-cols-2 gap-8">
                  {/* Finance Platform Features */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          FlowPulse Finance
                        </h3>
                        <p className="text-sm text-muted-foreground">Wealth Management Platform</p>
                      </div>
                    </div>
                    
                    {/* Laptop Mockup */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl group-hover:blur-2xl transition-all" />
                      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-t-xl border-2 border-blue-500/30 p-2 pb-0">
                        <div className="bg-black rounded-t-lg overflow-hidden">
                          <img 
                            src={financeScreenshot} 
                            alt="Finance Platform" 
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                      <div className="h-3 bg-gradient-to-b from-slate-800 to-slate-700 rounded-b-lg border-x-2 border-b-2 border-blue-500/30" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                        <BarChart3 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Portfolio Management</h4>
                          <p className="text-xs text-muted-foreground">Real-time tracking of client investments with advanced analytics and performance metrics</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                        <Sparkles className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">AI-Powered Insights</h4>
                          <p className="text-xs text-muted-foreground">Intelligent recommendations and automated financial planning with machine learning</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                        <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Compliance & Security</h4>
                          <p className="text-xs text-muted-foreground">Built-in regulatory compliance tools with enterprise-grade security and encryption</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                        <Users className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Client Management</h4>
                          <p className="text-xs text-muted-foreground">Comprehensive CRM with onboarding workflows and relationship tracking</p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      onClick={() => navigate('/finance-features')}
                    >
                      Learn More About Finance
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {/* Business Platform Features */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                          FlowPulse Business
                        </h3>
                        <p className="text-sm text-muted-foreground">Business Operations Platform</p>
                      </div>
                    </div>
                    
                    {/* Laptop Mockup */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-xl group-hover:blur-2xl transition-all" />
                      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-t-xl border-2 border-green-500/30 p-2 pb-0">
                        <div className="bg-black rounded-t-lg overflow-hidden">
                          <img 
                            src={businessScreenshot} 
                            alt="Business Platform" 
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                      <div className="h-3 bg-gradient-to-b from-slate-800 to-slate-700 rounded-b-lg border-x-2 border-b-2 border-green-500/30" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors">
                        <Target className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Project Management</h4>
                          <p className="text-xs text-muted-foreground">Track tasks, milestones, and deliverables with visual boards and timelines</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors">
                        <Users className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Team Collaboration</h4>
                          <p className="text-xs text-muted-foreground">Seamless communication with integrated chat, video calls, and file sharing</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors">
                        <BarChart3 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Business Analytics</h4>
                          <p className="text-xs text-muted-foreground">Data-driven insights with customizable dashboards and real-time reporting</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors">
                        <Zap className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Workflow Automation</h4>
                          <p className="text-xs text-muted-foreground">Automate repetitive tasks and streamline business processes for efficiency</p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      onClick={() => navigate('/business-features')}
                    >
                      Learn More About Business
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <button 
              onClick={() => navigate('/pricing')}
              className="relative font-space-grotesk font-semibold text-lg group"
            >
              <span className="relative z-10">Pricing</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
            </button>
          </nav>

          <Dialog open={demoDialogOpen} onOpenChange={setDemoDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 font-semibold">
                <Video className="mr-2 h-4 w-4" />
                Book Demo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-space-grotesk">Book Your Demo</DialogTitle>
                <DialogDescription>
                  Fill out the form below and our team will contact you within 24 hours to schedule your personalized demo.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDemoSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+44 20 1234 5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">What would you like to see in the demo?</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Tell us about your needs..."
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  Request Demo
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] md:min-h-screen">
        {/* Background Image with Lighter Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroBackground} 
            alt="Business Presentation" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-background/60 to-green-900/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>

        <div className="relative container mx-auto px-6 py-40 md:py-52 pb-32 text-center">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500/30 to-green-500/30 backdrop-blur-md rounded-full border border-blue-500/40 mb-4">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-200 to-green-200 bg-clip-text text-transparent">
                ✨ AI-Powered Workflow Intelligence
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl">
              <span className="block mb-2">Transform Your Workflow with</span>
              <span className="font-space-grotesk bg-gradient-to-r from-blue-300 via-cyan-300 to-green-300 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                FlowPulse Intelligence
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-50 max-w-2xl mx-auto drop-shadow-lg font-medium">
              Enterprise platforms powered by AI for financial advisors and modern businesses
            </p>
          </div>
        </div>
      </section>

      {/* Platforms Showcase */}
      <section className="w-full pt-8 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2">
          {/* Finance Platform */}
          <Card className="relative overflow-hidden border-2 border-blue-500/30 hover:border-blue-500/60 transition-all group bg-gradient-to-br from-blue-950/50 to-background backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/30 blur-3xl opacity-0 group-hover:opacity-70 transition-opacity" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/20 blur-3xl opacity-0 group-hover:opacity-50 transition-opacity" />
            
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/50">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    FlowPulse Finance
                  </CardTitle>
                  <CardDescription className="text-base">For Financial Advisors & Wealth Managers</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                Complete financial advisory platform with portfolio management, client onboarding, compliance tools, and AI-powered insights.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {financeFeatures.map((feature, idx) => (
                  <div key={idx} className="space-y-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors">
                    <feature.icon className="h-6 w-6 text-blue-400" />
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </div>
              
              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30" onClick={() => navigate('/login')}>
                Access Finance Platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Business Platform */}
          <Card className="relative overflow-hidden border-2 border-green-500/30 hover:border-green-500/60 transition-all group bg-gradient-to-br from-green-950/50 to-background backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-500/30 blur-3xl opacity-0 group-hover:opacity-70 transition-opacity" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/20 blur-3xl opacity-0 group-hover:opacity-50 transition-opacity" />
            
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg shadow-green-500/50">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    FlowPulse Business
                  </CardTitle>
                  <CardDescription className="text-base">For Modern Teams & Enterprises</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive business management platform with project tracking, team collaboration, CRM, and advanced analytics.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {businessFeatures.map((feature, idx) => (
                  <div key={idx} className="space-y-2 p-3 rounded-lg bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-colors">
                    <feature.icon className="h-6 w-6 text-green-400" />
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </div>
              
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30" onClick={() => navigate('/login-business')}>
                Access Business Platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-green-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 blur-3xl rounded-full" />
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                Why Choose FlowPulse?
              </h2>
              <p className="text-muted-foreground text-lg">
                Enterprise features built for modern workflows
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((benefit, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 p-5 bg-background/80 backdrop-blur-sm rounded-lg border border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all group"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-blue-950/30 via-background to-green-950/30">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10" />
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/20 blur-3xl" />
            
            <CardContent className="relative text-center space-y-8 py-16 px-8">
              <div className="inline-block p-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold">Ready to Transform Your Workflow?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of professionals using FlowPulse to streamline their operations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  onClick={() => navigate('/pricing')}
                >
                  View Pricing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/about')}>
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Support Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <CardTitle className="text-2xl">Need Help?</CardTitle>
              <CardDescription>Our support team is here to assist you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                For support inquiries, please contact us at:
              </p>
              <p className="text-lg tracking-tight text-foreground">
                support@flowpulse.co.uk
              </p>
              <p className="text-sm text-muted-foreground">
                We typically respond within 24 hours during business days
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Global Finance Districts Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Trusted Globally
              </h2>
              <p className="text-xl text-muted-foreground">
                Powering financial institutions and businesses across the world
              </p>
            </div>
            
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={globalFinance} 
                alt="Global Finance Districts" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="flex items-center justify-center gap-8 md:gap-16 text-white">
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-bold drop-shadow-lg">50+</p>
                    <p className="text-sm md:text-base drop-shadow-lg">Countries</p>
                  </div>
                  <div className="w-px h-12 bg-white/30" />
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-bold drop-shadow-lg">10K+</p>
                    <p className="text-sm md:text-base drop-shadow-lg">Active Users</p>
                  </div>
                  <div className="w-px h-12 bg-white/30" />
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-bold drop-shadow-lg">$5B+</p>
                    <p className="text-sm md:text-base drop-shadow-lg">Assets Managed</p>
                  </div>
                </div>
              </div>
            </div>
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
