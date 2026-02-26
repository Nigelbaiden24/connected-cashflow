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
  BookOpen, BarChart3, ClipboardList, Briefcase, HeadphonesIcon, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

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
    color: "from-violet-500 to-purple-600",
    bgColor: "from-violet-500/10 to-purple-600/10",
    borderColor: "border-violet-500/20",
    description: "Comprehensive suitability reports, annual review letters, and recommendation documents crafted to the highest professional standards. Every report is meticulously structured to meet FCA requirements while clearly communicating advice rationale to clients.",
    features: ["Suitability Reports", "Annual Review Letters", "Recommendation Documents", "Executive Summaries"],
  },
  {
    id: "research-analysis",
    title: "Research & Analysis",
    icon: BarChart3,
    color: "from-blue-500 to-cyan-600",
    bgColor: "from-blue-500/10 to-cyan-600/10",
    borderColor: "border-blue-500/20",
    description: "Deep-dive fund research, asset allocation analysis, and comparative studies to support robust investment recommendations. We analyse provider propositions, platform features, and fund performance data to underpin every piece of advice.",
    features: ["Fund Research", "Asset Allocation Studies", "Provider Analysis", "Performance Comparisons"],
  },
  {
    id: "cashflow-modelling",
    title: "Cashflow Modelling",
    icon: TrendingUp,
    color: "from-emerald-500 to-green-600",
    bgColor: "from-emerald-500/10 to-green-600/10",
    borderColor: "border-emerald-500/20",
    description: "Sophisticated cashflow modelling using industry-leading tools to illustrate financial planning outcomes. We create clear, visual projections that help clients understand their financial journey across retirement, inheritance, and wealth accumulation scenarios.",
    features: ["Retirement Projections", "Inheritance Planning", "Wealth Accumulation", "Scenario Testing"],
  },
  {
    id: "pension-transfer",
    title: "Pension Transfer Support",
    icon: Calculator,
    color: "from-amber-500 to-orange-600",
    bgColor: "from-amber-500/10 to-orange-600/10",
    borderColor: "border-amber-500/20",
    description: "Specialist pension transfer analysis including DB to DC transfers, TVAS reports, and transfer value comparisons. Our team ensures every pension transfer case is thoroughly researched and documented in line with FCA COBS requirements.",
    features: ["DB Transfer Analysis", "TVAS Reports", "Transfer Value Comparisons", "COBS Compliance"],
  },
  {
    id: "compliance-support",
    title: "Compliance File Support",
    icon: Shield,
    color: "from-rose-500 to-pink-600",
    bgColor: "from-rose-500/10 to-pink-600/10",
    borderColor: "border-rose-500/20",
    description: "End-to-end compliance file preparation and review to ensure every client file is audit-ready. We help maintain robust records including fact-finds, risk assessments, and attitude-to-risk questionnaires that satisfy regulatory requirements.",
    features: ["File Preparation", "Audit Readiness", "Risk Assessments", "Regulatory Reviews"],
  },
  {
    id: "admin-add-ons",
    title: "Administrative Add-Ons",
    icon: ClipboardList,
    color: "from-indigo-500 to-blue-600",
    bgColor: "from-indigo-500/10 to-blue-600/10",
    borderColor: "border-indigo-500/20",
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
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-primary/10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/15 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative px-6 py-12 md:px-12 md:py-16 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/25">
            <Sparkles className="h-3 w-3 mr-1" /> Fixed Fee Services
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Paraplanning Services
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Professional, fixed-fee paraplanning support for financial advisers. 
            Quality without compromise, delivered on time, every time.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Our Services</h2>
        <p className="text-muted-foreground">Click any service to get an AI-powered detailed breakdown</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`group cursor-pointer transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border-2 ${
                expandedService === service.id ? service.borderColor + " shadow-lg" : "border-border/50 hover:border-primary/30"
              }`}
              onClick={() => toggleService(service.id, service.title)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${service.bgColor} border ${service.borderColor}`}>
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  {expandedService === service.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <CardTitle className="text-lg mt-2">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {service.features.map((f) => (
                    <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                  ))}
                </div>
                
                {expandedService === service.id && (
                  <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">AI Detailed Breakdown</span>
                    </div>
                    {loadingAi[service.id] ? (
                      <div className="flex items-center gap-2 py-3">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-sm text-muted-foreground">Generating explanation...</span>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                        {aiExplanation[service.id]}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Target Clientele */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <Users className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Who We Serve</h2>
            <p className="text-muted-foreground text-sm">Our paraplanning services are tailored for</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {targetClientele.map((client, idx) => (
            <Card key={idx} className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-border/50 hover:border-emerald-500/30">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                    <client.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">{client.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{client.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact / Enquiry Form */}
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-primary/20 shadow-xl shadow-primary/5">
          <CardHeader className="text-center bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-b">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-3">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Get in Touch</CardTitle>
            <p className="text-muted-foreground text-sm">
              Send us an enquiry and we'll respond within 24 hours with a tailored quote
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pp-name">Full Name *</Label>
                  <Input id="pp-name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pp-email">Email *</Label>
                  <Input id="pp-email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@company.com" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pp-company">Company</Label>
                  <Input id="pp-company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Your firm name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pp-phone">Phone</Label>
                  <Input id="pp-phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+44 20 1234 5678" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pp-service">Service Required *</Label>
                <select
                  id="pp-service"
                  required
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pp-message">Additional Details</Label>
                <Textarea id="pp-message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Tell us about your requirements..." rows={4} />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Send Enquiry"}
                <Send className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Paraplanning;
