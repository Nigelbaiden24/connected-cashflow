import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2, 
  Target, 
  Users, 
  BarChart3, 
  Zap,
  Calendar,
  MessageSquare,
  FileText,
  Workflow,
  UserCog,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield
} from "lucide-react";
import businessScreenshot from "@/assets/business-dashboard-screenshot.png";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

const BusinessFeatures = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Project Management",
      description: "Track tasks, milestones, and deliverables with visual boards and timelines. Manage projects from inception to completion with Kanban boards, Gantt charts, and real-time collaboration."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Seamless communication with integrated chat, video calls, and file sharing. Keep your team connected with real-time messaging, document collaboration, and video conferencing."
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Data-driven insights with customizable dashboards and real-time reporting. Track KPIs, visualize performance metrics, and make informed decisions with powerful analytics."
    },
    {
      icon: Zap,
      title: "Workflow Automation",
      description: "Automate repetitive tasks and streamline business processes for efficiency. Create custom workflows, set up triggers, and reduce manual work with intelligent automation."
    },
    {
      icon: Calendar,
      title: "Meeting Scheduler",
      description: "Integrated calendar and scheduling tools with automated reminders. Book meetings, manage availability, and sync across all your devices for seamless scheduling."
    },
    {
      icon: MessageSquare,
      title: "Team Chat",
      description: "Real-time communication with channels, threads, and direct messaging. Organize conversations by project, department, or topic with powerful search and integrations."
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Centralized document storage with version control and collaborative editing. Store, organize, and share documents securely with team members and clients."
    },
    {
      icon: Workflow,
      title: "CRM & Sales",
      description: "Complete customer relationship management with sales pipeline tracking. Manage leads, track deals, and automate follow-ups to close more sales."
    },
    {
      icon: UserCog,
      title: "HR & Payroll",
      description: "Employee management with automated payroll processing and benefits tracking. Handle onboarding, time tracking, and compliance all in one place."
    },
    {
      icon: DollarSign,
      title: "Revenue Management",
      description: "Track income, expenses, and financial performance with detailed reports. Monitor cash flow, create invoices, and manage billing with integrated accounting."
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Monitor project time and resource allocation with automated tracking. Track billable hours, analyze productivity, and optimize resource utilization."
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with role-based access control and audit logs. Keep your data secure with encryption, compliance tools, and security monitoring."
    }
  ];

  const benefits = [
    "Reduce operational costs by up to 40%",
    "Increase team productivity by 3x",
    "Centralize all business operations in one platform",
    "Scale seamlessly as your business grows",
    "Automate routine tasks and focus on growth",
    "Real-time visibility into business performance"
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
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={() => navigate('/login-business')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-background to-emerald-50 dark:from-green-950/20 dark:via-background dark:to-emerald-950/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg mb-4">
              <Building2 className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              FlowPulse Business
            </h1>
            <p className="text-2xl text-muted-foreground">
              The All-in-One Business Operations Platform
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Streamline your entire business with integrated tools for project management, team collaboration, 
              CRM, HR, and analytics. Everything you need to run and grow your business, all in one place.
            </p>
          </div>

          {/* Screenshot */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl" />
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-green-500/30 p-4 shadow-2xl">
                <div className="bg-black rounded-xl overflow-hidden">
                  <img 
                    src={businessScreenshot} 
                    alt="Business Platform Dashboard" 
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
            <h2 className="text-4xl font-bold mb-4">Everything Your Business Needs</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful tools to manage every aspect of your business operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-green-500/50">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
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
      <section className="py-20 bg-gradient-to-br from-green-50 via-background to-emerald-50 dark:from-green-950/20 dark:via-background dark:to-emerald-950/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Why Choose FlowPulse Business?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-background/80 backdrop-blur rounded-xl border-2 border-green-500/20">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
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
            <h2 className="text-4xl font-bold">Ready to Streamline Your Business?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of businesses using FlowPulse to manage operations and accelerate growth
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg px-8"
                onClick={() => navigate('/login-business')}
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

export default BusinessFeatures;
