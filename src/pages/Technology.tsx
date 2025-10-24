import { RecruitmentHeader } from "@/components/recruitment/RecruitmentHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Cpu, Database, Globe, Smartphone, Cloud } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Technology = () => {
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

  const techRoles = [
    {
      id: 1,
      title: "Senior Full Stack Developer",
      company: "TechCorp Solutions",
      location: "London, UK",
      salary: "£80,000 - £100,000",
      type: "Permanent",
      skills: ["React", "Node.js", "TypeScript", "AWS"],
      icon: Code,
    },
    {
      id: 2,
      title: "DevOps Engineer",
      company: "Cloud Innovations Ltd",
      location: "Manchester, UK",
      salary: "£70,000 - £90,000",
      type: "Permanent",
      skills: ["Kubernetes", "Docker", "CI/CD", "Terraform"],
      icon: Cloud,
    },
    {
      id: 3,
      title: "Data Engineer",
      company: "DataFlow Systems",
      location: "Remote",
      salary: "£75,000 - £95,000",
      type: "Contract",
      skills: ["Python", "SQL", "Spark", "ETL"],
      icon: Database,
    },
    {
      id: 4,
      title: "Mobile Developer (iOS)",
      company: "AppVenture Inc",
      location: "Birmingham, UK",
      salary: "£65,000 - £85,000",
      type: "Permanent",
      skills: ["Swift", "SwiftUI", "iOS", "Firebase"],
      icon: Smartphone,
    },
    {
      id: 5,
      title: "ML Engineer",
      company: "AI Dynamics",
      location: "Cambridge, UK",
      salary: "£90,000 - £120,000",
      type: "Permanent",
      skills: ["Python", "TensorFlow", "PyTorch", "MLOps"],
      icon: Cpu,
    },
    {
      id: 6,
      title: "Frontend Architect",
      company: "Digital Experience Co",
      location: "London, UK",
      salary: "£95,000 - £115,000",
      type: "Permanent",
      skills: ["React", "Vue.js", "Micro-frontends", "Performance"],
      icon: Globe,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <RecruitmentHeader onNavigate={handleNavigate} currentSection="tech" />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Technology Recruitment</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connecting top technology talent with innovative companies. Specializing in software development, 
              cloud infrastructure, data engineering, and emerging technologies.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Active Tech Roles</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">2,000+</div>
                <div className="text-sm text-muted-foreground">Tech Candidates</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">150+</div>
                <div className="text-sm text-muted-foreground">Tech Companies</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Roles */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Featured Technology Roles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {techRoles.map((role) => {
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
              <h2 className="text-3xl font-bold">Ready to Find Your Next Tech Role?</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Register with our expert technology recruiters today and get access to exclusive opportunities 
                from leading tech companies across the UK and globally.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button size="lg" variant="secondary" onClick={() => navigate("/candidate-registration")}>
                  Register as Candidate
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/employer-vacancy")}>
                  Post a Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Technology;
