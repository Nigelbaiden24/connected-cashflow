import { RecruitmentHeader } from "@/components/recruitment/RecruitmentHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Shield, 
  Sparkles,
  Building2,
  Code,
  Globe,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutUs() {
  const navigate = useNavigate();

  const handleNavigate = (section: string) => {
    if (section === "home") {
      navigate("/");
    } else if (section === "login") {
      navigate("/login");
    } else if (section === "business-dashboard") {
      navigate("/business-dashboard");
    } else if (section === "candidate-register") {
      navigate("/candidate-registration");
    } else if (section === "employer-register") {
      navigate("/employer-vacancy");
    }
  };

  const services = [
    {
      icon: Users,
      title: "Recruitment Services",
      description: "Specialist recruitment in Technology, Finance, and all sectors with expert consultants who understand your industry.",
      features: ["Executive Search", "Permanent Placement", "Contract Recruitment", "Volume Hiring"]
    },
    {
      icon: Code,
      title: "SaaS Solutions",
      description: "Comprehensive financial management and investment platforms including FlowPulse Finance and FlowPulse Investor for modern enterprises.",
      features: ["Financial Planning", "Investment Analytics", "Portfolio Management", "Compliance Tools"]
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Operating across multiple markets with deep local expertise and international capabilities.",
      features: ["UK & Europe", "North America", "Asia Pacific", "Remote Positions"]
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "We deliver exceptional results through deep industry knowledge and commitment to quality."
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "Trust and transparency are at the core of every relationship we build."
    },
    {
      icon: Sparkles,
      title: "Innovation",
      description: "We leverage cutting-edge technology to transform recruitment and business management."
    },
    {
      icon: TrendingUp,
      title: "Growth",
      description: "We're invested in the long-term success of our candidates, clients, and partners."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <RecruitmentHeader onNavigate={handleNavigate} currentSection="about" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
              About FlowPulse
            </h1>
            <p className="text-xl md:text-2xl text-white/95 drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
              Leading recruitment agency and SaaS provider transforming how businesses find talent and manage operations
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold neon-text-subtle">Our Story</h2>
            <p className="text-lg text-muted-foreground">
              FlowPulse was founded with a vision to revolutionize recruitment and business management through innovation, expertise, and technology.
            </p>
          </div>
          
          <Card className="border-2">
            <CardContent className="p-8 space-y-4">
              <p className="text-lg leading-relaxed">
                We've grown from a boutique recruitment firm to a comprehensive talent and technology partner, serving hundreds of organizations worldwide. Our dual focus on specialist recruitment services and powerful SaaS platforms sets us apart in the market.
              </p>
              <p className="text-lg leading-relaxed">
                Today, FlowPulse combines deep industry expertise in Technology and Finance recruitment with cutting-edge business management software that helps companies streamline operations, manage finances, and build high-performing teams.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services */}
      <section className="relative py-16 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-purple-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 neon-text-subtle">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions for recruitment and business management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, idx) => (
              <Card key={idx} className="hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-2 duration-300 border-2 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30">
                <CardHeader>
                  <div className="p-3 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl w-fit mb-4 shadow-lg">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 neon-text-subtle">Our Values</h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <value.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{value.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdHMiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNkb3RzKSIvPjwvc3ZnPg==')] opacity-40" />
        <div className="container mx-auto px-4 text-center space-y-6 relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl">
            Ready to Work With Us?
          </h2>
          <p className="text-xl text-white/95 max-w-2xl mx-auto drop-shadow-lg">
            Whether you're looking for your next career move or need to build your team, we're here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/candidate-registration")}
              className="bg-white text-primary hover:bg-white/90"
            >
              <Users className="mr-2 h-5 w-5" />
              Register as Candidate
            </Button>
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => navigate("/employer-vacancy")}
              className="bg-white text-primary hover:bg-white/90"
            >
              <Building2 className="mr-2 h-5 w-5" />
              Post a Vacancy
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
