import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Zap, 
  Clock, 
  Shield, 
  FileText, 
  BarChart3,
  Target,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Award,
  Briefcase,
  Headphones
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import paraplanningOffice from "@/assets/paraplanning-office.jpg";

const Paraplanning = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: FileText,
      title: "Report Generation",
      description: "Professional suitability reports, cashflow models, and client presentations crafted to the highest standards.",
      details: "Our team produces FCA-compliant reports with clear recommendations, visual data representations, and client-friendly language."
    },
    {
      icon: BarChart3,
      title: "Research & Analysis",
      description: "In-depth market research, fund analysis, and investment recommendations backed by data-driven insights.",
      details: "Access to premium research tools and databases, delivering evidence-based investment strategies and due diligence reports."
    },
    {
      icon: Target,
      title: "Financial Planning",
      description: "Comprehensive financial plans including retirement, tax, and estate planning strategies.",
      details: "Holistic planning approach covering lifetime cashflow modelling, tax-efficient strategies, and intergenerational wealth transfer."
    },
    {
      icon: Shield,
      title: "Compliance Support",
      description: "Regulatory compliance checks, documentation review, and audit preparation assistance.",
      details: "Stay ahead of FCA regulations with our compliance specialists ensuring all documentation meets current standards."
    },
    {
      icon: Users,
      title: "Client Communications",
      description: "Tailored client letters, review summaries, and ongoing communication support.",
      details: "Personalized client correspondence that maintains your firm's tone and strengthens adviser-client relationships."
    },
    {
      icon: TrendingUp,
      title: "Portfolio Reviews",
      description: "Regular portfolio analysis, rebalancing recommendations, and performance reporting.",
      details: "Comprehensive portfolio assessments with performance attribution, risk metrics, and strategic rebalancing guidance."
    }
  ];

  const expertise = [
    {
      icon: Award,
      title: "Qualified Professionals",
      description: "All paraplanners hold Level 4+ qualifications including DipPFS, CertPFS, and working towards Chartered status.",
      metric: "95%+ qualified to Diploma level"
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description: "Standard reports delivered within 48-72 hours. Priority service available for urgent requirements.",
      metric: "48-72 hour standard delivery"
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      description: "Each client assigned a dedicated paraplanner who understands your firm's processes and preferences.",
      metric: "1:1 paraplanner relationship"
    },
    {
      icon: Briefcase,
      title: "Industry Experience",
      description: "Our team brings combined 100+ years of financial services experience across diverse areas of advice.",
      metric: "100+ years combined experience"
    }
  ];

  const benefits = [
    "Highly qualified paraplanners with industry certifications",
    "Fast turnaround times without compromising quality",
    "Flexible capacity - scale up or down as needed",
    "Cost-effective alternative to in-house teams",
    "Latest technology and tools integration",
    "Dedicated account management"
  ];

  const process = [
    {
      step: "01",
      title: "Submit Brief",
      description: "Share your requirements through our secure portal"
    },
    {
      step: "02",
      title: "Assignment",
      description: "Matched with specialist paraplanner for your needs"
    },
    {
      step: "03",
      title: "Quality Review",
      description: "Multi-layer quality assurance and compliance checks"
    },
    {
      step: "04",
      title: "Delivery",
      description: "Receive polished deliverables ready for client presentation"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src={flowpulseLogo} alt="FlowPulse" className="h-10" />
              <span className="font-bold text-xl">FlowPulse</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Button variant="ghost" onClick={() => navigate('/')}>
              Home
            </Button>
            <Button variant="ghost" asChild>
              <a href="mailto:support@flowpulse.co.uk">Contact Us</a>
            </Button>
            <Button onClick={() => navigate('/login')}>
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(74,222,128,0.15),transparent_50%)]" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Elite Paraplanning Services</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold leading-tight animate-fade-in">
              Modern{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                Paraplanning
              </span>
              <br />
              Excellence
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Outsourced paraplanning that elevates your practice. Expert support that 
              seamlessly integrates with your workflow, delivering exceptional quality at scale.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="lg" className="text-lg px-8 group" onClick={() => navigate('/login')}>
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Office Image Section */}
      <section className="py-24 bg-background/50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <img 
                src={paraplanningOffice} 
                alt="FlowPulse Central London Office - Professional Paraplanning Team" 
                className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Your Trusted Paraplanning Partner
                </h3>
                <p className="text-lg md:text-xl mb-6 max-w-3xl">
                  Operating from our prestigious Central London office, our dedicated team of 
                  qualified paraplanners delivers exceptional support to financial advisers across the UK.
                </p>
                <Button size="lg" variant="secondary" asChild>
                  <a href="mailto:support@flowpulse.co.uk" className="inline-flex items-center">
                    Contact Our Team
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-background/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Comprehensive Paraplanning Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Full-spectrum support for financial advisers and wealth management firms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-card/50 backdrop-blur border-2 hover:border-primary/50"
              >
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                  <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">
                    {service.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Streamlined Workflow
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, efficient process from brief to delivery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <div key={index} className="relative group">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="text-7xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                      {item.step}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/4 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Our Expertise
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Qualified professionals delivering exceptional paraplanning services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {expertise.map((item, index) => (
              <Card key={index} className="text-center bg-background/50 backdrop-blur border-2 hover:border-primary/50 transition-all hover:scale-105">
                <CardHeader>
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                  <p className="text-sm font-semibold text-primary">
                    {item.metric}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">
                Why Choose FlowPulse Paraplanning?
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-6 rounded-2xl bg-background/50 backdrop-blur border hover:border-primary/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-lg font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.2),transparent_70%)]" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-5xl md:text-6xl font-bold">
              Ready to Elevate Your Practice?
            </h2>
            <p className="text-xl text-muted-foreground">
              Partner with FlowPulse for paraplanning services that enhance your 
              client relationships and grow your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 group" onClick={() => navigate('/login')}>
                Start Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <a href="mailto:support@flowpulse.co.uk">Schedule Consultation</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background/95">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
              <span className="font-bold text-lg">FlowPulse</span>
            </div>
            <p className="text-muted-foreground text-center md:text-left">
              © 2024 FlowPulse. Elite paraplanning services.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm">Privacy</Button>
              <Button variant="ghost" size="sm">Terms</Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="mailto:support@flowpulse.co.uk">Contact</a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Paraplanning;
