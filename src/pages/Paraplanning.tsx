import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Users, Shield, Calculator, TrendingUp, Settings,
  Send, Sparkles, ArrowLeft, CheckCircle2, ChevronDown, ChevronUp,
  BookOpen, BarChart3, ClipboardList, Briefcase, HeadphonesIcon, Zap,
  ArrowRight, Star, Clock, Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

const enquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(50).optional(),
  service: z.string().trim().min(1, "Please select a service"),
  message: z.string().trim().max(2000).optional(),
});

const services = [
  {
    id: "core-report-writing",
    title: "Core Report Writing",
    icon: FileText,
    gradient: "from-violet-500 to-purple-600",
    lightGradient: "from-violet-50 to-purple-50",
    darkLightGradient: "dark:from-violet-950/40 dark:to-purple-950/40",
    accent: "violet",
    description: "Comprehensive suitability reports, annual review letters, and recommendation documents crafted to the highest professional standards. Every report is meticulously structured to meet FCA requirements while clearly communicating advice rationale to clients.",
    features: ["Suitability Reports", "Annual Review Letters", "Recommendation Documents", "Executive Summaries"],
  },
  {
    id: "research-analysis",
    title: "Research & Analysis",
    icon: BarChart3,
    gradient: "from-blue-500 to-cyan-600",
    lightGradient: "from-blue-50 to-cyan-50",
    darkLightGradient: "dark:from-blue-950/40 dark:to-cyan-950/40",
    accent: "blue",
    description: "Deep-dive fund research, asset allocation analysis, and comparative studies to support robust investment recommendations. We analyse provider propositions, platform features, and fund performance data to underpin every piece of advice.",
    features: ["Fund Research", "Asset Allocation Studies", "Provider Analysis", "Performance Comparisons"],
  },
  {
    id: "cashflow-modelling",
    title: "Cashflow Modelling",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-green-600",
    lightGradient: "from-emerald-50 to-green-50",
    darkLightGradient: "dark:from-emerald-950/40 dark:to-green-950/40",
    accent: "emerald",
    description: "Sophisticated cashflow modelling using industry-leading tools to illustrate financial planning outcomes. We create clear, visual projections that help clients understand their financial journey across retirement, inheritance, and wealth accumulation scenarios.",
    features: ["Retirement Projections", "Inheritance Planning", "Wealth Accumulation", "Scenario Testing"],
  },
  {
    id: "pension-transfer",
    title: "Pension Transfer Support",
    icon: Calculator,
    gradient: "from-amber-500 to-orange-600",
    lightGradient: "from-amber-50 to-orange-50",
    darkLightGradient: "dark:from-amber-950/40 dark:to-orange-950/40",
    accent: "amber",
    description: "Specialist pension transfer analysis including DB to DC transfers, TVAS reports, and transfer value comparisons. Our team ensures every pension transfer case is thoroughly researched and documented in line with FCA COBS requirements.",
    features: ["DB Transfer Analysis", "TVAS Reports", "Transfer Value Comparisons", "COBS Compliance"],
  },
  {
    id: "compliance-support",
    title: "Compliance File Support",
    icon: Shield,
    gradient: "from-rose-500 to-pink-600",
    lightGradient: "from-rose-50 to-pink-50",
    darkLightGradient: "dark:from-rose-950/40 dark:to-pink-950/40",
    accent: "rose",
    description: "End-to-end compliance file preparation and review to ensure every client file is audit-ready. We help maintain robust records including fact-finds, risk assessments, and attitude-to-risk questionnaires that satisfy regulatory requirements.",
    features: ["File Preparation", "Audit Readiness", "Risk Assessments", "Regulatory Reviews"],
  },
  {
    id: "admin-add-ons",
    title: "Administrative Add-Ons",
    icon: ClipboardList,
    gradient: "from-indigo-500 to-blue-600",
    lightGradient: "from-indigo-50 to-blue-50",
    darkLightGradient: "dark:from-indigo-950/40 dark:to-blue-950/40",
    accent: "indigo",
    description: "Supporting administrative services including new business processing, provider liaison, and platform administration. We handle the paperwork so advisers can focus on what they do best — advising clients and growing their practice.",
    features: ["New Business Processing", "Provider Liaison", "Platform Admin", "Client Correspondence"],
  },
];

const targetClientele = [
  {
    title: "Independent Financial Advisers (IFAs)",
    description: "Solo practitioners and small IFA firms looking to scale their advice capability without the overhead of in-house paraplanners.",
    icon: Briefcase,
  },
  {
    title: "Wealth Management Firms",
    description: "Boutique and mid-size wealth managers requiring white-label paraplanning to maintain service quality during peak periods.",
    icon: TrendingUp,
  },
  {
    title: "Restricted Advisers & Networks",
    description: "Adviser networks and restricted firms needing consistent, compliant report writing across their panel of advisers.",
    icon: Users,
  },
  {
    title: "Compliance & Regulatory Teams",
    description: "Firms seeking support with compliance file reviews, gap analysis, and maintaining audit-ready client records.",
    icon: Shield,
  },
  {
    title: "New & Growing Practices",
    description: "Newly authorised advisers and growing practices who need professional paraplanning support from day one without fixed costs.",
    icon: Zap,
  },
  {
    title: "Specialist Advisers",
    description: "Pension transfer specialists, later-life advisers, and other niche practitioners requiring deep technical paraplanning expertise.",
    icon: BookOpen,
  },
];

const stats = [
  { value: "500+", label: "Reports Delivered", icon: FileText },
  { value: "98%", label: "Client Satisfaction", icon: Star },
  { value: "48hr", label: "Average Turnaround", icon: Clock },
  { value: "FCA", label: "Fully Compliant", icon: Award },
];

const Paraplanning = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", company: "", phone: "", service: "", message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = enquirySchema.parse(formData);
      setIsSubmitting(true);
      const { error } = await supabase
        .from("demo_requests")
        .insert([{
          name: validated.name,
          email: validated.email,
          company: validated.company || null,
          phone: validated.phone || null,
          message: `[Paraplanning Enquiry - ${validated.service}] ${validated.message || "No additional message"}`,
        }]);
      if (error) throw error;
      toast.success("Enquiry submitted! We'll be in touch within 24 hours.");
      setFormData({ name: "", email: "", company: "", phone: "", service: "", message: "" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0]?.message || "Please check your input.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAiExplanation = async (serviceId: string, serviceTitle: string) => {
    if (aiExplanation[serviceId]) return;
    setLoadingAi(prev => ({ ...prev, [serviceId]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("paraplanning-ai", {
        body: { type: "service", serviceTitle },
      });
      if (error) throw error;
      setAiExplanation(prev => ({ ...prev, [serviceId]: data.explanation }));
    } catch {
      setAiExplanation(prev => ({ ...prev, [serviceId]: "AI explanation is currently unavailable. Please contact us for detailed information about this service." }));
    } finally {
      setLoadingAi(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  const toggleService = (serviceId: string, title: string) => {
    if (expandedService === serviceId) {
      setExpandedService(null);
    } else {
      setExpandedService(serviceId);
      fetchAiExplanation(serviceId, title);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src={flowpulseLogo} alt="FlowPulse" className="h-10" />
            <span className="font-bold text-xl text-foreground">FlowPulse</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Home
            </Button>
            <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(236,72,153,0.15),transparent_55%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative container mx-auto px-6 py-24 md:py-32 text-center">
          <Badge className="mb-6 bg-white/10 text-violet-200 border-violet-400/30 hover:bg-white/15 backdrop-blur-sm px-4 py-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5 mr-2" /> Fixed-Fee Paraplanning Excellence
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            Professional{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Paraplanning
            </span>
            <br />
            <span className="text-white/90">Services</span>
          </h1>
          <p className="text-lg md:text-xl text-violet-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Enterprise-grade paraplanning support for financial advisers.
            Quality without compromise, transparent pricing, delivered on time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-8 py-6 text-lg shadow-xl shadow-violet-500/25"
              onClick={() => document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get a Quote <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm"
              onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Services
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-1 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-6 w-6 text-white/70" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/70 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services-section" className="container mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">Our Expertise</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Comprehensive Service Suite
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Click any service for an AI-powered detailed breakdown of deliverables, timelines, and pricing
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 overflow-hidden ${
                expandedService === service.id ? "ring-2 ring-primary shadow-2xl scale-[1.02]" : "shadow-lg hover:shadow-primary/10"
              }`}
              onClick={() => toggleService(service.id, service.title)}
            >
              {/* Gradient top accent */}
              <div className={`h-1.5 bg-gradient-to-r ${service.gradient}`} />
              <CardHeader className={`pb-3 bg-gradient-to-br ${service.lightGradient} ${service.darkLightGradient}`}>
                <div className="flex items-start justify-between">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${service.gradient} shadow-lg`}>
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`p-1.5 rounded-full transition-all duration-300 ${expandedService === service.id ? 'bg-primary/10 rotate-180' : 'bg-muted'}`}>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <CardTitle className="text-xl mt-3 text-foreground">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {service.features.map((f) => (
                    <Badge key={f} variant="secondary" className="text-xs font-medium px-2.5 py-1">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" /> {f}
                    </Badge>
                  ))}
                </div>

                {expandedService === service.id && (
                  <div className="mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1 rounded-md bg-gradient-to-r ${service.gradient}`}>
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-sm font-bold text-foreground">AI Detailed Breakdown</span>
                    </div>
                    {loadingAi[service.id] ? (
                      <div className="flex items-center gap-3 py-4">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-sm text-muted-foreground">Generating detailed explanation...</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {aiExplanation[service.id]}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Who We Serve */}
      <section className="bg-muted/30 border-y">
        <div className="container mx-auto px-6 py-20 md:py-28">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">Target Clientele</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Who We Serve
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our paraplanning expertise is tailored for firms across the UK financial advice sector
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targetClientele.map((client, idx) => (
              <Card key={idx} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-400 border-0 shadow-md bg-card">
                <CardContent className="pt-8 pb-6 px-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <client.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-foreground text-lg leading-tight">{client.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-[3.75rem]">{client.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="enquiry-form" className="container mx-auto px-6 py-20 md:py-28">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">Contact Us</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Get in Touch</h2>
            <p className="text-muted-foreground">
              Send us an enquiry and we'll respond within 24 hours with a tailored fixed-fee quote
            </p>
          </div>

          <Card className="border-0 shadow-2xl shadow-primary/5 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="pp-name" className="font-semibold">Full Name *</Label>
                    <Input id="pp-name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Smith" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pp-email" className="font-semibold">Email *</Label>
                    <Input id="pp-email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@company.com" className="h-11" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="pp-company" className="font-semibold">Company</Label>
                    <Input id="pp-company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Your firm name" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pp-phone" className="font-semibold">Phone</Label>
                    <Input id="pp-phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+44 20 1234 5678" className="h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pp-service" className="font-semibold">Service Required *</Label>
                  <select
                    id="pp-service"
                    required
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a service...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pp-message" className="font-semibold">Additional Details</Label>
                  <Textarea id="pp-message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Tell us about your requirements..." rows={4} />
                </div>
                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white py-6 text-lg shadow-xl shadow-violet-500/20" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Send Enquiry"}
                  <Send className="h-5 w-5 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
            <span className="font-semibold text-foreground">FlowPulse</span>
            <span className="text-muted-foreground text-sm ml-2">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</button>
            <button onClick={() => navigate('/pricing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
            <button onClick={() => navigate('/contact')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Paraplanning;
