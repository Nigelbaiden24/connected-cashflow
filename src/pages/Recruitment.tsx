import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Briefcase, 
  Code, 
  TrendingUp, 
  Building2,
  ArrowRight,
  CheckCircle2,
  Target,
  Sparkles
} from "lucide-react";
import { RecruitmentHeader } from "@/components/recruitment/RecruitmentHeader";
import { RecruitmentHero } from "@/components/recruitment/RecruitmentHero";
import { useNavigate } from "react-router-dom";

export default function Recruitment() {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  const handleNavigate = (section: string) => {
    if (section === "flowpulse") {
      navigate("/ai-generator");
    } else {
      setCurrentSection(section);
    }
  };

  const techJobs = [
    { id: 1, title: "Senior Full Stack Developer", company: "TechCorp", location: "London", salary: "£80k-£100k", type: "Permanent" },
    { id: 2, title: "DevOps Engineer", company: "CloudSystems", location: "Manchester", salary: "£70k-£90k", type: "Contract" },
    { id: 3, title: "Data Scientist", company: "AI Solutions", location: "Remote", salary: "£75k-£95k", type: "Permanent" },
  ];

  const financeJobs = [
    { id: 4, title: "Investment Analyst", company: "Global Finance", location: "London", salary: "£65k-£85k", type: "Permanent" },
    { id: 5, title: "Financial Controller", company: "Asset Management", location: "Edinburgh", salary: "£90k-£110k", type: "Permanent" },
    { id: 6, title: "Risk Manager", company: "Banking Group", location: "London", salary: "£85k-£105k", type: "Contract" },
  ];

  const sectors = [
    { icon: Code, title: "Technology", desc: "Software, Data, Cloud & IT", count: "150+ roles" },
    { icon: TrendingUp, title: "Finance", desc: "Banking, Investment & Accounting", count: "120+ roles" },
    { icon: Building2, title: "All Sectors", desc: "Retail, Healthcare, Manufacturing & more", count: "300+ roles" },
  ];

  const benefits = [
    "Expert career guidance",
    "Exclusive job opportunities",
    "Salary negotiation support",
    "Interview preparation",
    "Market insights",
    "Long-term career planning",
  ];

  if (currentSection === "tech") {
    return (
      <div className="min-h-screen bg-background">
        <RecruitmentHeader onNavigate={handleNavigate} currentSection={currentSection} />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Technology Recruitment</h1>
              <p className="text-xl text-muted-foreground">
                Specialist roles in software engineering, data science, cloud, and IT
              </p>
            </div>

            <div className="space-y-4">
              {techJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <Badge variant="outline">{job.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span>{job.location}</span>
                          <span className="font-semibold text-foreground">{job.salary}</span>
                        </div>
                      </div>
                      <Button>Apply Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentSection === "finance") {
    return (
      <div className="min-h-screen bg-background">
        <RecruitmentHeader onNavigate={handleNavigate} currentSection={currentSection} />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Finance Recruitment</h1>
              <p className="text-xl text-muted-foreground">
                Specialist roles in banking, investment, accounting, and financial services
              </p>
            </div>

            <div className="space-y-4">
              {financeJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <Badge variant="outline">{job.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span>{job.location}</span>
                          <span className="font-semibold text-foreground">{job.salary}</span>
                        </div>
                      </div>
                      <Button>Apply Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentSection === "general") {
    return (
      <div className="min-h-screen bg-background">
        <RecruitmentHeader onNavigate={handleNavigate} currentSection={currentSection} />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Generalist Recruitment</h1>
              <p className="text-xl text-muted-foreground">
                Opportunities across all sectors including retail, healthcare, manufacturing, and more
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Operations", "HR", "Marketing", "Sales", "Legal", "Supply Chain"].map((dept) => (
                <Card key={dept} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{dept}</CardTitle>
                    <CardDescription>View all {dept.toLowerCase()} roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Browse Jobs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home section (default)
  return (
    <div className="min-h-screen bg-background">
      <RecruitmentHeader onNavigate={handleNavigate} currentSection={currentSection} />
      <RecruitmentHero onSearch={setSearchQuery} />

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Sectors */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Specialist Sectors</h2>
            <p className="text-muted-foreground text-lg">
              Expert recruitment across technology, finance, and all other industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sectors.map((sector, idx) => (
              <Card 
                key={idx} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleNavigate(idx === 0 ? "tech" : idx === 1 ? "finance" : "general")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <sector.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{sector.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">{sector.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{sector.count}</span>
                    <Button variant="ghost" size="sm">
                      View Jobs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Jobs */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Opportunities</h2>
            <Button variant="outline">View All Jobs</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...techJobs.slice(0, 2), ...financeJobs.slice(0, 2)].map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{job.type}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {job.company}
                      </span>
                      <span>{job.location}</span>
                      <span className="font-semibold text-foreground text-base">{job.salary}</span>
                    </div>
                    <Button className="w-full">Apply Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-muted/30 -mx-4 px-4 py-16 md:mx-0 md:rounded-lg">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose FlowPulse Recruitment?</h2>
              <p className="text-muted-foreground text-lg">
                More than just job placement - we're your career partner
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-base">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Tool CTA */}
        <section>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold">FlowPulse AI Tool</h2>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Powered by advanced AI to match you with the perfect role. Get personalized job recommendations, 
                    CV analysis, and career insights instantly.
                  </p>
                  <Button size="lg" onClick={() => navigate("/ai-generator")}>
                    Try FlowPulse AI
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"></div>
                    <Target className="relative h-24 w-24 text-primary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
