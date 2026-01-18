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
  Menu
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import heroBackground from "@/assets/business-presentation-hero.jpg";
import financeScreenshot from "@/assets/finance-dashboard-screenshot.png";
import businessScreenshot from "@/assets/business-dashboard-screenshot.png";
import investorScreenshot from "@/assets/investor-dashboard-real.png";
import globalFinance from "@/assets/global-finance-districts.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
              onClick={() => navigate('/features')}
              className="text-gray-600 text-base font-medium tracking-wide transition-all duration-300 hover:text-primary hover:[text-shadow:0_0_10px_hsl(var(--primary)/0.5),0_0_20px_hsl(var(--primary)/0.3)]"
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
      <section className="relative overflow-hidden h-[60vh] md:h-[65vh]">
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

        <div className="relative container mx-auto px-6 py-20 md:py-28 text-center flex flex-col justify-center h-full">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500/30 to-green-500/30 backdrop-blur-md rounded-full border border-blue-500/40 mb-4">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-200 to-green-200 bg-clip-text text-transparent">
                ✨ AI-Powered Workflow Intelligence
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
              <span className="block mb-2">Transform Your Workflow with</span>
              <span className="font-space-grotesk bg-gradient-to-r from-blue-300 via-cyan-300 to-green-300 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                FlowPulse Intelligence
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto drop-shadow-lg font-medium">
              Enterprise platforms powered by AI for financial advisors and modern businesses
            </p>
          </div>
        </div>
      </section>

      {/* White Space Separator */}
      <div className="bg-white py-20 md:py-32 text-center">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold">
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 bg-clip-text text-transparent animate-pulse bg-[length:200%_auto]" style={{ animation: 'shimmer 3s ease-in-out infinite' }}>
              Expert Financial
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 bg-clip-text text-transparent blur-sm opacity-50" />
          </span>{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 bg-clip-text text-transparent" style={{ animation: 'shimmer 3s ease-in-out infinite', animationDelay: '0.5s' }}>
              research reports
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 bg-clip-text text-transparent blur-sm opacity-50" />
          </span>
        </h2>
        <p className="mt-6 text-gray-700 text-xl md:text-2xl font-medium tracking-wide">
          studied and written by expert human analysts
        </p>
      </div>


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
                  onClick={() => {
                    navigate('/pricing');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
              <span className="font-semibold">FlowPulse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FlowPulse. Enterprise workflow intelligence.
            </p>
          </div>
          
          {/* FCA Disclaimer */}
          <div className="border-t pt-6">
            <div className="max-w-4xl mx-auto">
              <p className="text-xs text-muted-foreground leading-relaxed text-center">
                <strong>Important Notice:</strong> FlowPulse is a technology platform providing software tools for information, research, and workflow management purposes only. FlowPulse is not authorised or regulated by the Financial Conduct Authority (FCA) or any other financial regulatory body. We do not provide financial advice, investment advice, or any other regulated financial services. Nothing on this platform constitutes a personal recommendation or advice on the merits of any transaction or investment. Any information provided is for general informational purposes only and should not be relied upon when making investment decisions. You should seek independent financial advice from a suitably qualified and FCA-authorised adviser before making any investment decisions. Past performance is not indicative of future results. The value of investments can go down as well as up, and you may get back less than you invest.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
