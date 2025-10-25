import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecruitmentHeader } from "@/components/recruitment/RecruitmentHeader";
import { useNavigate } from "react-router-dom";
import { Users, Building2, MapPin, Briefcase, Package, Heart, Scale, ShoppingCart, Factory, Truck, ChevronRight, Award } from "lucide-react";

export default function AllSectors() {
  const navigate = useNavigate();

  const handleNavigate = (section: string) => {
    if (section === "login") {
      navigate("/login");
    } else if (section === "tech") {
      navigate("/technology");
    } else if (section === "finance") {
      navigate("/finance");
    }
  };

  const sectors = [
    { 
      title: "Operations", 
      desc: "Process improvement, supply chain, logistics", 
      icon: Package,
      roles: "80+ roles",
      avgSalary: "£35,000 - £65,000"
    },
    { 
      title: "Human Resources", 
      desc: "Talent acquisition, employee relations, HRIS", 
      icon: Heart,
      roles: "60+ roles",
      avgSalary: "£30,000 - £55,000"
    },
    { 
      title: "Legal", 
      desc: "Corporate law, compliance, contracts", 
      icon: Scale,
      roles: "45+ roles",
      avgSalary: "£50,000 - £90,000"
    },
    { 
      title: "Sales & Marketing", 
      desc: "Business development, digital marketing, CRM", 
      icon: ShoppingCart,
      roles: "95+ roles",
      avgSalary: "£28,000 - £60,000"
    },
    { 
      title: "Manufacturing", 
      desc: "Production, quality control, engineering", 
      icon: Factory,
      roles: "70+ roles",
      avgSalary: "£25,000 - £55,000"
    },
    { 
      title: "Supply Chain", 
      desc: "Procurement, logistics, inventory management", 
      icon: Truck,
      roles: "55+ roles",
      avgSalary: "£32,000 - £58,000"
    },
  ];

  const featuredRoles = [
    {
      title: "Operations Manager",
      company: "Global Manufacturing Ltd",
      location: "Birmingham, UK",
      salary: "£45,000 - £60,000",
      type: "Permanent",
      skills: ["Process Improvement", "Lean", "Project Management", "KPIs"],
      icon: Package,
      description: "Lead operational excellence initiatives across manufacturing facilities"
    },
    {
      title: "HR Business Partner",
      company: "Enterprise Solutions",
      location: "Manchester, UK",
      salary: "£40,000 - £55,000",
      type: "Permanent",
      skills: ["Employee Relations", "Talent Management", "CIPD", "HR Analytics"],
      icon: Heart,
      description: "Strategic HR support for business units with focus on people development"
    },
    {
      title: "Legal Counsel",
      company: "Corporate Legal Services",
      location: "London, UK",
      salary: "£65,000 - £85,000",
      type: "Permanent",
      skills: ["Contract Law", "Commercial", "Compliance", "Risk"],
      icon: Scale,
      description: "Provide legal advisory services for commercial transactions and compliance"
    },
    {
      title: "Sales Director",
      company: "Growth Ventures",
      location: "Leeds, UK",
      salary: "£55,000 - £75,000",
      type: "Permanent",
      skills: ["Business Development", "Team Leadership", "Strategy", "B2B"],
      icon: ShoppingCart,
      description: "Drive revenue growth through strategic sales initiatives and team development"
    },
  ];

  const stats = [
    { label: "Active Roles", value: "400+", icon: Briefcase },
    { label: "Candidates", value: "8,000+", icon: Users },
    { label: "Companies", value: "300+", icon: Building2 },
    { label: "Success Rate", value: "94%", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      <RecruitmentHeader onNavigate={handleNavigate} currentSection="" />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-600 via-gray-600 to-zinc-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-white/20 text-white border-white/30">All Sectors Recruitment</Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Opportunities Across All Industries
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              From operations to HR, legal to sales - connecting professionals with employers across retail, healthcare, manufacturing, and beyond
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <Card key={idx} className="border-2">
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sectors */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Browse by Sector</h2>
              <p className="text-muted-foreground">Explore opportunities across diverse industries and functions</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectors.map((sector, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-all cursor-pointer hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <sector.icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{sector.title}</CardTitle>
                    <CardDescription>{sector.desc}</CardDescription>
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <Badge variant="secondary">{sector.roles}</Badge>
                      <span className="text-muted-foreground">{sector.avgSalary}</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Featured Roles */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Featured Opportunities</h2>
              <Button variant="outline">View All <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
            <div className="grid gap-6">
              {featuredRoles.map((role, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-gradient-to-br from-slate-600 to-gray-600 rounded-lg">
                          <role.icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-semibold">{role.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                            <div className="flex flex-wrap items-center gap-3 text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {role.company}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {role.location}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline">{role.type}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {role.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-semibold text-primary">{role.salary}</span>
                          <div className="flex gap-2">
                            <Button onClick={() => navigate("/candidate-registration")}>
                              Apply Now
                            </Button>
                            <Button variant="outline">View Details</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <Card className="bg-muted/50">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Award className="h-12 w-12 text-primary" />
                  <h3 className="text-2xl font-bold">Why Choose Our Generalist Recruitment?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Broad network across multiple industries and sectors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Expert recruiters with sector-specific knowledge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Career development support and guidance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Competitive salary benchmarking</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">For Professionals</h3>
                  <p className="text-muted-foreground">
                    Access opportunities across diverse sectors including retail, healthcare, manufacturing, 
                    logistics, and professional services. Get personalized career guidance from recruiters 
                    who understand your industry.
                  </p>
                  <h3 className="text-2xl font-bold mt-6">For Employers</h3>
                  <p className="text-muted-foreground">
                    Find qualified candidates with proven experience in your sector. Our generalist 
                    recruiters have the breadth of knowledge to match the right talent to your specific 
                    business needs across all functions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-slate-600 to-gray-600 text-white border-0">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-3xl font-bold">Ready to Take Your Career Forward?</h2>
              <p className="text-lg text-white/90">
                Register today to access opportunities across all sectors and industries
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate("/candidate-registration")}
                >
                  Register as Candidate
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 border-white text-white hover:bg-white/20"
                  onClick={() => navigate("/employer-vacancy")}
                >
                  Hire Talent
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
