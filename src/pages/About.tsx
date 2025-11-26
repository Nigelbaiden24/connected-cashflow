import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  TrendingUp, 
  Briefcase, 
  Target, 
  Users, 
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

const About = () => {
  const navigate = useNavigate();
  const [aiContent, setAiContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateAIContent();
  }, []);

  const generateAIContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/generate-about-content",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc21kY2RmeXVkdHZibmJxZm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTEyMTYsImV4cCI6MjA3Mzk2NzIxNn0.EChqxdjqS0FmjSoC65x557HdB2sY9AFiAsN5fXH-AmU`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to generate content");

      const data = await response.json();
      setAiContent(data.content);
    } catch (error) {
      console.error("Error generating AI content:", error);
      setAiContent("FlowPulse is revolutionizing professional services with three integrated platforms designed for financial advisors, business professionals, and investors.");
    } finally {
      setIsLoading(false);
    }
  };

  const platforms = [
    {
      icon: TrendingUp,
      name: "FlowPulse Finance",
      tagline: "Professional Financial Advisory Suite",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "A comprehensive platform designed specifically for financial advisors, wealth managers, and paraplanning professionals. Streamline client management, portfolio analysis, compliance tracking, and financial planning with AI-powered insights.",
      features: [
        "Advanced Portfolio Management & Tracking",
        "Comprehensive Financial Planning Tools",
        "Integrated Client Relationship Management",
        "Built-in Compliance & Regulatory Support",
        "AI-Powered Investment Analysis",
        "Real-time Market Data Integration",
        "Automated Report Generation",
        "Secure Document Management"
      ]
    },
    {
      icon: Building2,
      name: "FlowPulse Business",
      tagline: "Enterprise Operations Platform",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Transform your business operations with intelligent project management, team collaboration, and workflow automation. Perfect for consultancies, agencies, and professional services firms looking to scale efficiently.",
      features: [
        "Smart Project Management",
        "Team Collaboration & Communication",
        "Workflow Automation Engine",
        "Business Analytics & Insights",
        "Resource Planning & Allocation",
        "Time Tracking & Billing",
        "Document Generation & Management",
        "Integrated Payroll & HR Tools"
      ]
    },
    {
      icon: Briefcase,
      name: "FlowPulse Investor",
      tagline: "Professional Investment Intelligence",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Institutional-grade investment research and analysis tools for serious investors. Access comprehensive market data, AI-driven insights, and advanced screening tools to make informed investment decisions.",
      features: [
        "Professional Research Reports",
        "Advanced Market Analysis",
        "AI-Powered Stock Discovery",
        "Multi-Asset Screeners",
        "Real-time Market Commentary",
        "Portfolio Benchmarking Tools",
        "Risk & Compliance Monitoring",
        "Custom Watchlists & Alerts"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={flowpulseLogo} 
                alt="FlowPulse" 
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold">FlowPulse</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            About FlowPulse
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Three Platforms.<br />
            One Unified Vision.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            FlowPulse delivers enterprise-grade solutions across financial services, business operations, and investment intelligence.
          </p>
        </section>

        {/* AI-Generated Overview */}
        <section className="max-w-4xl mx-auto">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {aiContent}
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Platforms Overview */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Our Three Platforms</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Specialized solutions designed for specific professional needs
            </p>
          </div>

          <div className="grid gap-8 lg:gap-12">
            {platforms.map((platform, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all">
                <CardHeader className={`${platform.bgColor} pb-8`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-background shadow-sm`}>
                      <platform.icon className={`h-8 w-8 ${platform.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{platform.name}</CardTitle>
                      <CardDescription className="text-base font-medium">
                        {platform.tagline}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {platform.description}
                  </p>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Key Features
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {platform.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <ChevronRight className={`h-4 w-4 mt-0.5 ${platform.color} flex-shrink-0`} />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Why Choose FlowPulse?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built on principles that drive professional excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Sparkles className="h-8 w-8 text-primary mb-2" />
                <CardTitle>AI-Powered Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced AI and machine learning capabilities provide insights, automation, and predictive analytics across all platforms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bank-grade encryption, role-based access control, and comprehensive audit trails ensure your data remains secure.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Seamless Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with your existing tools and workflows through our comprehensive API and integration ecosystem.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl">
          <h2 className="text-3xl font-bold">Ready to Transform Your Operations?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of professionals who trust FlowPulse for their mission-critical operations
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/pricing")}>
              View Pricing
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/contact")}>
              Contact Sales
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
