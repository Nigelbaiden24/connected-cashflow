import { useState, useEffect } from "react";
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
  FileText,
  Calendar,
  Loader2
} from "lucide-react";
import { RecruitmentHeader } from "@/components/recruitment/RecruitmentHeader";
import { RecruitmentHero } from "@/components/recruitment/RecruitmentHero";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AboutUs from "./AboutUs";

export default function Recruitment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroImage, setHeroImage] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(true);
  const [techJobs, setTechJobs] = useState<any[]>([]);
  const [financeJobs, setFinanceJobs] = useState<any[]>([]);
  const [generalJobs, setGeneralJobs] = useState<any[]>([]);

  const handleNavigate = (section: string) => {
    if (section === "login") {
      navigate("/login");
    } else if (section === "business-dashboard") {
      navigate("/business-dashboard");
    } else if (section === "candidate-register") {
      navigate("/candidate-registration");
    } else if (section === "employer-register") {
      navigate("/employer-vacancy");
    } else if (section === "admin-jobs") {
      navigate("/admin/jobs");
    } else if (section === "contact") {
      setCurrentSection("contact");
    } else {
      setCurrentSection(section);
    }
  };

  const handleApplyNow = (jobTitle: string) => {
    toast({
      title: "Application Started",
      description: `Redirecting you to apply for ${jobTitle}...`,
    });
    setTimeout(() => {
      navigate("/candidate-registration");
    }, 1500);
  };

  const handleBrowseJobs = (sector: string) => {
    toast({
      title: "Loading Jobs",
      description: `Fetching all ${sector} positions...`,
    });
    setCurrentSection(sector === "Operations" || sector === "HR" || sector === "Marketing" ? "general" : sector.toLowerCase());
  };

  const handleViewAllJobs = () => {
    toast({
      title: "Loading All Jobs",
      description: "Showing all available positions...",
    });
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      toast({
        title: "Searching Jobs",
        description: `Finding matches for "${query}"...`,
      });
      setSearchQuery(query);
    }
  };

  useEffect(() => {
    const generateHeroImage = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-recruitment-image");
        
        if (error) throw error;
        
        if (data?.imageUrl) {
          setHeroImage(data.imageUrl);
        }
      } catch (error) {
        console.error("Error generating hero image:", error);
      } finally {
        setImageLoading(false);
      }
    };

    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          setTechJobs(data.filter((job) => job.sector === "Technology"));
          setFinanceJobs(data.filter((job) => job.sector === "Finance"));
          setGeneralJobs(data.filter((job) => job.sector === "General"));
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    generateHeroImage();
    fetchJobs();
  }, []);


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

  if (currentSection === "about") {
    return <AboutUs />;
  }

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
                      <Button onClick={() => handleApplyNow(job.title)}>Apply Now</Button>
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
                      <Button onClick={() => handleApplyNow(job.title)}>Apply Now</Button>
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
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleBrowseJobs(dept)}
                    >
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
      <RecruitmentHero onSearch={handleSearch} heroImage={heroImage} imageLoading={imageLoading} />

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
                className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary"
                onClick={() => handleNavigate(idx === 0 ? "tech" : idx === 1 ? "finance" : "general")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                      <sector.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{sector.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">{sector.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                      {sector.count}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
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
            <Button variant="outline" onClick={handleViewAllJobs}>View All Jobs</Button>
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
                    <Button className="w-full" onClick={() => handleApplyNow(job.title)}>Apply Now</Button>
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
      </div>
    </div>
  );
}
