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

  const popularRoleCategories = [
    {
      category: "Software Development",
      roles: [
        "Full Stack Developer",
        "Frontend Developer",
        "Backend Developer",
        "Software Engineer",
        "Senior Software Engineer",
        "Lead Software Engineer",
        "Principal Engineer",
        "Software Architect",
      ],
      icon: Code,
    },
    {
      category: "Cloud & Infrastructure",
      roles: [
        "DevOps Engineer",
        "Site Reliability Engineer (SRE)",
        "Cloud Architect",
        "Platform Engineer",
        "Infrastructure Engineer",
        "Cloud Solutions Architect",
        "Kubernetes Engineer",
      ],
      icon: Cloud,
    },
    {
      category: "Data & Analytics",
      roles: [
        "Data Engineer",
        "Data Scientist",
        "Data Analyst",
        "Business Intelligence Developer",
        "Analytics Engineer",
        "Data Architect",
        "Big Data Engineer",
      ],
      icon: Database,
    },
    {
      category: "Mobile Development",
      roles: [
        "iOS Developer",
        "Android Developer",
        "React Native Developer",
        "Flutter Developer",
        "Mobile App Developer",
        "Mobile Architect",
      ],
      icon: Smartphone,
    },
    {
      category: "AI & Machine Learning",
      roles: [
        "Machine Learning Engineer",
        "AI Engineer",
        "MLOps Engineer",
        "NLP Engineer",
        "Computer Vision Engineer",
        "Research Scientist",
        "AI Architect",
      ],
      icon: Cpu,
    },
    {
      category: "Security & Quality",
      roles: [
        "Security Engineer",
        "Cybersecurity Analyst",
        "Penetration Tester",
        "QA Engineer",
        "Test Automation Engineer",
        "Security Architect",
      ],
      icon: Globe,
    },
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        
        {/* Circuit pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="2" fill="currentColor" className="text-cyan-400"/>
              <circle cx="75" cy="75" r="2" fill="currentColor" className="text-blue-400"/>
              <line x1="25" y1="25" x2="75" y2="25" stroke="currentColor" strokeWidth="0.5" className="text-cyan-400"/>
              <line x1="75" y1="25" x2="75" y2="75" stroke="currentColor" strokeWidth="0.5" className="text-blue-400"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)"/>
        </svg>
      </div>

      <RecruitmentHeader onNavigate={handleNavigate} currentSection="tech" />
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm text-blue-300 font-medium">Connecting Tech Talent Globally</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Technology Recruitment
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Connecting top technology talent with innovative companies. Specializing in software development, 
              cloud infrastructure, data engineering, and emerging technologies.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/70 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">500+</div>
                <div className="text-sm text-slate-400">Active Tech Roles</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/70 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">2,000+</div>
                <div className="text-sm text-slate-400">Tech Candidates</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/70 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">150+</div>
                <div className="text-sm text-slate-400">Tech Companies</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/70 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">95%</div>
                <div className="text-sm text-slate-400">Success Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Tech Roles by Category */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">Popular Technology Roles</h2>
              <p className="text-slate-400">
                Explore the most in-demand tech positions companies are actively recruiting for
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularRoleCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.category} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/70 hover:border-blue-700/50 transition-all group">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all">
                          <Icon className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-lg text-white">{category.category}</h3>
                      </div>
                      <ul className="space-y-2">
                        {category.roles.map((role) => (
                          <li key={role} className="flex items-center gap-2 text-sm text-slate-400">
                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                            {role}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0" onClick={() => navigate("/candidate-registration")}>
                        View Opportunities
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Featured Roles */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Featured Technology Roles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {techRoles.map((role) => {
                const Icon = role.icon;
                return (
                  <Card key={role.id} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/70 hover:border-blue-700/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                            <Icon className="h-6 w-6 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-white">{role.title}</h3>
                            <p className="text-sm text-slate-400">{role.company}</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{role.type}</Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Location:</span>
                          <span className="font-medium text-slate-200">{role.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Salary:</span>
                          <span className="font-medium text-cyan-400">{role.salary}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {role.skills.map((skill) => (
                          <Badge key={skill} className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700">{skill}</Badge>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0" onClick={() => navigate("/candidate-registration")}>
                          Apply Now
                        </Button>
                        <Button className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_linear_infinite]"></div>
            <CardContent className="p-8 text-center space-y-4 relative z-10">
              <h2 className="text-3xl font-bold text-white">Ready to Find Your Next Tech Role?</h2>
              <p className="text-lg text-blue-50 max-w-2xl mx-auto">
                Register with our expert technology recruiters today and get access to exclusive opportunities 
                from leading tech companies across the UK and globally.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100" onClick={() => navigate("/candidate-registration")}>
                  Register as Candidate
                </Button>
                <Button size="lg" className="bg-slate-900 text-white border-slate-700 hover:bg-slate-800" onClick={() => navigate("/employer-vacancy")}>
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
