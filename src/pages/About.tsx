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
  Loader2,
  Zap,
  Shield,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

const About = () => {
  const navigate = useNavigate();
  const [aiContent, setAiContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [heroImage, setHeroImage] = useState("");
  const [platformImages, setPlatformImages] = useState<Record<string, string>>({});

  useEffect(() => {
    generateAIContent();
    generateImages();
  }, []);

  const generateImages = async () => {
    try {
      // Generate hero image
      const heroResponse = await fetch(
        "https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/generate-page-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc21kY2RmeXVkdHZibmJxZm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTEyMTYsImV4cCI6MjA3Mzk2NzIxNn0.EChqxdjqS0FmjSoC65x557HdB2sY9AFiAsN5fXH-AmU"
          },
          body: JSON.stringify({
            prompt: "A sleek, modern, abstract digital illustration representing three interconnected business platforms in vibrant blue, purple and emerald colors with flowing data streams and professional icons, high-tech aesthetic, gradient background",
            pageType: "hero"
          }),
        }
      );

      if (heroResponse.ok) {
        const heroData = await heroResponse.json();
        if (heroData.imageUrl && !heroData.fallback) {
          setHeroImage(heroData.imageUrl);
        }
      }
    } catch (error) {
      console.error("Error generating images:", error);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={flowpulseLogo} 
                alt="FlowPulse" 
                className="h-10 w-auto drop-shadow-md"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                FlowPulse
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* AI-Generated Overview */}
        <section className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-emerald-500/10 backdrop-blur shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-blue-600" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {aiContent}
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Hero Section with AI Image */}
        <section className="text-center space-y-8 py-12">
          {heroImage && (
            <div className="w-full max-w-4xl mx-auto mb-8 rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="FlowPulse Platforms"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50">
            <Sparkles className="h-3 w-3 mr-1" />
            About FlowPulse
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
              Three Platforms.
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              One Unified Vision.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            FlowPulse delivers enterprise-grade solutions across financial services, business operations, and investment intelligence.
          </p>
        </section>

        <Separator className="my-16 bg-gradient-to-r from-transparent via-primary/50 to-transparent h-px" />

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
              <Card key={index} className={`overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02] border-2 ${
                index === 0 ? 'border-blue-500/40 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent' :
                index === 1 ? 'border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent' :
                'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent'
              }`}>
                <CardHeader className={`pb-8 relative overflow-hidden ${
                  index === 0 ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20' :
                  index === 1 ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20' :
                  'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20'
                }`}>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`p-4 rounded-xl bg-background shadow-xl`}>
                      <platform.icon className={`h-10 w-10 ${platform.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2">{platform.name}</CardTitle>
                      <CardDescription className="text-lg font-semibold text-foreground/80">
                        {platform.tagline}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {platform.description}
                  </p>
                  
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5" />
                      Key Features
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {platform.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <ChevronRight className={`h-5 w-5 mt-0.5 ${platform.color} flex-shrink-0`} />
                          <span className="text-sm font-medium">{feature}</span>
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
            <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent hover:shadow-xl transition-all hover:scale-105">
              <CardHeader>
                <div className="p-3 rounded-full bg-blue-500/20 w-fit mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">AI-Powered Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced AI and machine learning capabilities provide insights, automation, and predictive analytics across all platforms.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent hover:shadow-xl transition-all hover:scale-105">
              <CardHeader>
                <div className="p-3 rounded-full bg-purple-500/20 w-fit mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bank-grade encryption, role-based access control, and comprehensive audit trails ensure your data remains secure.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent hover:shadow-xl transition-all hover:scale-105">
              <CardHeader>
                <div className="p-3 rounded-full bg-emerald-500/20 w-fit mb-4">
                  <Globe className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">Seamless Integration</CardTitle>
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
        <section className="text-center space-y-6 py-16 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl border-2 border-primary/30 shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
            <h2 className="text-4xl font-bold">Ready to Transform Your Operations?</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of professionals who trust FlowPulse for their mission-critical operations
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg" onClick={() => navigate("/pricing")}>
              View Pricing
            </Button>
            <Button size="lg" variant="outline" className="border-2 hover:bg-primary/10" onClick={() => navigate("/contact")}>
              Contact Sales
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
