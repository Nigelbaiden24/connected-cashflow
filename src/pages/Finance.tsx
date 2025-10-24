import { RecruitmentHeader } from "@/components/recruitment/RecruitmentHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Briefcase, Calculator, PieChart, BarChart3, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Finance = () => {
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

  const financeRoles = [
    {
      id: 1,
      title: "Financial Controller",
      company: "Global Finance Corp",
      location: "London, UK",
      salary: "£90,000 - £120,000",
      type: "Permanent",
      skills: ["IFRS", "Financial Reporting", "Audit", "Leadership"],
      icon: Calculator,
    },
    {
      id: 2,
      title: "Investment Analyst",
      company: "Capital Ventures Ltd",
      location: "Edinburgh, UK",
      salary: "£60,000 - £80,000",
      type: "Permanent",
      skills: ["Portfolio Analysis", "Financial Modeling", "CFA", "Research"],
      icon: TrendingUp,
    },
    {
      id: 3,
      title: "Risk Manager",
      company: "Premier Bank Group",
      location: "London, UK",
      salary: "£85,000 - £110,000",
      type: "Permanent",
      skills: ["Risk Assessment", "Compliance", "Basel III", "Analytics"],
      icon: BarChart3,
    },
    {
      id: 4,
      title: "Corporate Finance Director",
      company: "M&A Advisory Partners",
      location: "Manchester, UK",
      salary: "£120,000 - £150,000",
      type: "Permanent",
      skills: ["M&A", "Due Diligence", "Valuation", "Strategy"],
      icon: Briefcase,
    },
    {
      id: 5,
      title: "Wealth Manager",
      company: "Private Wealth Solutions",
      location: "Birmingham, UK",
      salary: "£70,000 - £95,000",
      type: "Permanent",
      skills: ["Wealth Planning", "Client Relations", "Portfolio Management", "Tax"],
      icon: PieChart,
    },
    {
      id: 6,
      title: "Treasury Analyst",
      company: "International Finance Hub",
      location: "London, UK",
      salary: "£55,000 - £75,000",
      type: "Contract",
      skills: ["Cash Management", "FX", "Hedging", "Treasury Systems"],
      icon: DollarSign,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <RecruitmentHeader onNavigate={handleNavigate} currentSection="finance" />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Finance Recruitment</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connecting elite finance professionals with leading financial institutions. Specializing in investment banking, 
              wealth management, risk, compliance, and corporate finance.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">300+</div>
                <div className="text-sm text-muted-foreground">Finance Roles</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">1,500+</div>
                <div className="text-sm text-muted-foreground">Finance Professionals</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Financial Institutions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Client Satisfaction</div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Roles */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Featured Finance Roles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {financeRoles.map((role) => {
                const Icon = role.icon;
                return (
                  <Card key={role.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{role.title}</h3>
                            <p className="text-sm text-muted-foreground">{role.company}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{role.type}</Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{role.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Salary:</span>
                          <span className="font-medium">{role.salary}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {role.skills.map((skill) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1" onClick={() => navigate("/candidate-registration")}>
                          Apply Now
                        </Button>
                        <Button variant="outline">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-3xl font-bold">Advance Your Finance Career</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Work with specialist finance recruiters who understand your career aspirations. Access exclusive 
                opportunities from top-tier financial institutions across the UK and internationally.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button size="lg" variant="secondary" onClick={() => navigate("/candidate-registration")}>
                  Register as Candidate
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/employer-vacancy")}>
                  Hire Finance Talent
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Finance;
