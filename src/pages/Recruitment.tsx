import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Briefcase, 
  Search, 
  TrendingUp, 
  Code, 
  Building2, 
  Filter,
  Plus,
  Calendar,
  FileText,
  Target,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Recruitment() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { label: "Active Jobs", value: "24", icon: Briefcase, trend: "+12%" },
    { label: "Total Candidates", value: "847", icon: Users, trend: "+23%" },
    { label: "Interviews Scheduled", value: "18", icon: Calendar, trend: "+8%" },
    { label: "Placements This Month", value: "12", icon: Target, trend: "+15%" },
  ];

  const techJobs = [
    { id: 1, title: "Senior Full Stack Developer", company: "TechCorp", location: "London", salary: "£80k-£100k", candidates: 45, status: "Active" },
    { id: 2, title: "DevOps Engineer", company: "CloudSystems", location: "Manchester", salary: "£70k-£90k", candidates: 32, status: "Active" },
    { id: 3, title: "Data Scientist", company: "AI Solutions", location: "Remote", salary: "£75k-£95k", candidates: 28, status: "Active" },
  ];

  const financeJobs = [
    { id: 4, title: "Investment Analyst", company: "Global Finance", location: "London", salary: "£65k-£85k", candidates: 38, status: "Active" },
    { id: 5, title: "Financial Controller", company: "Asset Management Ltd", location: "Edinburgh", salary: "£90k-£110k", candidates: 22, status: "Active" },
    { id: 6, title: "Risk Manager", company: "Banking Group", location: "London", salary: "£85k-£105k", candidates: 19, status: "Active" },
  ];

  const generalJobs = [
    { id: 7, title: "Operations Manager", company: "Retail Chain", location: "Birmingham", salary: "£45k-£55k", candidates: 52, status: "Active" },
    { id: 8, title: "HR Director", company: "Manufacturing Co", location: "Leeds", salary: "£70k-£85k", candidates: 31, status: "Active" },
    { id: 9, title: "Marketing Manager", company: "Consumer Goods", location: "Bristol", salary: "£50k-£65k", candidates: 41, status: "Active" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recruitment Hub</h1>
            <p className="text-muted-foreground mt-1">
              Specialist recruitment for Tech & Finance, plus generalist services
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/ai-generator")}>
              <Sparkles className="h-4 w-4 mr-2" />
              FlowPulse AI Tool
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, candidates, or companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="tech" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tech" className="gap-2">
              <Code className="h-4 w-4" />
              Tech Recruitment
            </TabsTrigger>
            <TabsTrigger value="finance" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Finance Recruitment
            </TabsTrigger>
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4" />
              General Recruitment
            </TabsTrigger>
            <TabsTrigger value="candidates" className="gap-2">
              <Users className="h-4 w-4" />
              Candidate Pool
            </TabsTrigger>
          </TabsList>

          {/* Tech Recruitment Tab */}
          <TabsContent value="tech" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technology Sector Jobs</CardTitle>
                <CardDescription>
                  Specialist recruitment for software engineering, data science, and IT roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {techJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {job.company}
                          </span>
                          <span>{job.location}</span>
                          <span className="font-medium text-foreground">{job.salary}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{job.candidates} candidates</div>
                          <div className="text-xs text-muted-foreground">in pipeline</div>
                        </div>
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Tech Jobs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finance Recruitment Tab */}
          <TabsContent value="finance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Finance Sector Jobs</CardTitle>
                <CardDescription>
                  Specialist recruitment for banking, investment, and financial services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financeJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {job.company}
                          </span>
                          <span>{job.location}</span>
                          <span className="font-medium text-foreground">{job.salary}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{job.candidates} candidates</div>
                          <div className="text-xs text-muted-foreground">in pipeline</div>
                        </div>
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Finance Jobs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Recruitment Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Sector Jobs</CardTitle>
                <CardDescription>
                  Recruitment across all other sectors including retail, healthcare, education, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generalJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {job.company}
                          </span>
                          <span>{job.location}</span>
                          <span className="font-medium text-foreground">{job.salary}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{job.candidates} candidates</div>
                          <div className="text-xs text-muted-foreground">in pipeline</div>
                        </div>
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All General Jobs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidate Pool Tab */}
          <TabsContent value="candidates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Database</CardTitle>
                <CardDescription>
                  Search and manage your talent pool across all sectors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Candidate management system</p>
                  <p className="text-sm">Track applications, skills, and interview progress</p>
                  <Button className="mt-4">Import Candidates</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Job Templates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create job postings using pre-built templates
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Interview Scheduler</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage interviews and candidate meetings
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/ai-generator")}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">FlowPulse AI Tool</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-powered candidate matching and insights
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
