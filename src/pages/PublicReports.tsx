import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  FileText, 
  Search, 
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Shield,
  Globe,
  Briefcase,
  Clock,
  User,
  Calendar,
  ChevronRight,
  Sparkles,
  BookOpen,
  Target,
  LineChart
} from "lucide-react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface Report {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  category: string | null;
  page_count: number | null;
  featured: boolean | null;
  teaser_content: string | null;
  key_insights: string[] | null;
  author_name: string | null;
  author_title: string | null;
  reading_time: string | null;
  tags: string[] | null;
  content_images: string[] | null;
}

// Categories matching FlowPulse Finance Reports page
const categoryConfig: Record<string, { 
  icon: typeof TrendingUp; 
  gradient: string; 
  iconColor: string;
  bgAccent: string;
  description: string;
}> = {
  "Market Commentary": { 
    icon: TrendingUp, 
    gradient: "from-blue-600 via-cyan-500 to-blue-400",
    iconColor: "text-blue-500",
    bgAccent: "bg-blue-500/10",
    description: "Daily and weekly market updates and analysis"
  },
  "Research & Analysis": { 
    icon: BarChart3, 
    gradient: "from-violet-600 via-purple-500 to-fuchsia-400",
    iconColor: "text-violet-500",
    bgAccent: "bg-violet-500/10",
    description: "In-depth research reports and investment analysis"
  },
  "Sector & Industry": { 
    icon: Globe, 
    gradient: "from-emerald-600 via-green-500 to-teal-400",
    iconColor: "text-emerald-500",
    bgAccent: "bg-emerald-500/10",
    description: "Sector-specific insights and industry trends"
  },
  "Portfolio & Performance": { 
    icon: Target, 
    gradient: "from-orange-600 via-amber-500 to-yellow-400",
    iconColor: "text-orange-500",
    bgAccent: "bg-orange-500/10",
    description: "Portfolio analysis and performance metrics"
  },
  "Risk & Compliance": { 
    icon: Shield, 
    gradient: "from-rose-600 via-red-500 to-pink-400",
    iconColor: "text-rose-500",
    bgAccent: "bg-rose-500/10",
    description: "Risk assessments and regulatory updates"
  },
  "Strategic Planning": { 
    icon: Briefcase, 
    gradient: "from-indigo-600 via-blue-500 to-purple-400",
    iconColor: "text-indigo-500",
    bgAccent: "bg-indigo-500/10",
    description: "Strategic analysis and business planning"
  },
};

const categoryMapping: Record<string, string[]> = {
  "Market Commentary": ["Market Commentary", "Market Update", "Market Analysis"],
  "Research & Analysis": ["Research Report", "Investment Analysis", "Industry Report", "Whitepaper", "Research"],
  "Sector & Industry": ["Sector Analysis", "Industry Report", "Sector Flows", "Industry Reports"],
  "Portfolio & Performance": ["Portfolio Summary", "Performance Report", "Annual Report"],
  "Risk & Compliance": ["Risk Assessment", "Compliance Report", "Regulatory Update", "Risk & Compliance"],
  "Strategic Planning": ["Strategic Analysis", "Business Plan", "M&A Report", "Cross-Border M&A", "Strategic"],
};

export default function PublicReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("purchasable_reports")
        .select("id, title, description, thumbnail_url, created_at, category, page_count, featured, teaser_content, key_insights, author_name, author_title, reading_time, tags, content_images")
        .eq("is_published", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data as Report[]) || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const getMappedCategory = (reportCategory: string | null): string => {
    const cat = reportCategory || "General";
    for (const [mainCat, subCats] of Object.entries(categoryMapping)) {
      if (subCats.some(sub => cat.toLowerCase().includes(sub.toLowerCase()) || sub.toLowerCase().includes(cat.toLowerCase()))) {
        return mainCat;
      }
    }
    return "Research & Analysis";
  };

  const featuredReports = reports.filter(r => r.featured);
  
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const mappedCat = getMappedCategory(report.category);
    const matchesCategory = selectedCategory === "all" || mappedCat === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group reports by mapped category
  const groupedReports: Record<string, Report[]> = {};
  filteredReports.forEach(report => {
    const cat = getMappedCategory(report.category);
    if (!groupedReports[cat]) groupedReports[cat] = [];
    groupedReports[cat].push(report);
  });

  const getCategoryConfig = (category: string | null) => {
    const mapped = getMappedCategory(category);
    return categoryConfig[mapped] || categoryConfig["Research & Analysis"];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <img src={flowpulseLogo} alt="FlowPulse" className="h-10 group-hover:scale-105 transition-transform" />
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900">FlowPulse</span>
              <span className="hidden md:inline text-slate-400 ml-2 text-sm font-medium">Research</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")} 
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button 
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Premium Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 md:py-28">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
          }} />
        </div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-5 py-2 text-sm font-medium backdrop-blur-sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Expert Research Library
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              Institutional-Grade
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Financial Research
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Access in-depth market analysis, strategic insights, and actionable research crafted by our team of professional analysts
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{reports.length}+</p>
                <p className="text-sm text-slate-400">Research Reports</p>
              </div>
              <div className="text-center border-l border-slate-700 pl-8">
                <p className="text-3xl font-bold text-white">{Object.keys(categoryConfig).length}</p>
                <p className="text-sm text-slate-400">Categories</p>
              </div>
              <div className="text-center border-l border-slate-700 pl-8">
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="text-sm text-slate-400">Human Written</p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              {[
                { icon: User, text: "Professional Analysts" },
                { icon: TrendingUp, text: "Data-Driven Insights" },
                { icon: Shield, text: "Institutional Quality" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                  <item.icon className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="container mx-auto px-6 py-8 border-b border-slate-100">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base shadow-sm"
            />
          </div>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" 
                ? "bg-slate-900 text-white hover:bg-slate-800" 
                : "border-slate-200 hover:bg-slate-50"}
            >
              All Reports
            </Button>
            {Object.entries(categoryConfig).map(([cat, config]) => {
              const count = groupedReports[cat]?.length || 0;
              return (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={`${selectedCategory === cat 
                    ? "bg-slate-900 text-white hover:bg-slate-800" 
                    : "border-slate-200 hover:bg-slate-50"} ${count === 0 ? "opacity-50" : ""}`}
                  disabled={count === 0}
                >
                  <config.icon className="h-4 w-4 mr-1.5" />
                  {cat}
                  {count > 0 && (
                    <span className="ml-1.5 text-xs opacity-70">({count})</span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Report */}
      {featuredReports.length > 0 && selectedCategory === "all" && (
        <section className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Research</h2>
          </div>
          
          {featuredReports.slice(0, 1).map((report) => {
            const config = getCategoryConfig(report.category);
            return (
              <Card 
                key={report.id} 
                className="overflow-hidden border-0 shadow-2xl shadow-slate-200/50 hover:shadow-3xl transition-all duration-500 cursor-pointer group bg-white"
                onClick={() => navigate(`/reports/${report.id}`)}
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-2/5 relative overflow-hidden">
                    {report.thumbnail_url ? (
                      <img
                        src={report.thumbnail_url}
                        alt={report.title}
                        className="w-full h-64 lg:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className={`w-full h-64 lg:h-80 bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <config.icon className="h-24 w-24 text-white/30" />
                      </div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg px-3 py-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  
                  <CardContent className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <Badge className={`${config.bgAccent} ${config.iconColor} border-0`}>
                        <config.icon className="h-3 w-3 mr-1" />
                        {getMappedCategory(report.category)}
                      </Badge>
                      {report.reading_time && (
                        <span className="flex items-center text-sm text-slate-500">
                          <Clock className="h-4 w-4 mr-1.5" />
                          {report.reading_time}
                        </span>
                      )}
                      <span className="flex items-center text-sm text-slate-500">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        {formatDate(report.created_at)}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                      {report.title}
                    </h3>
                    
                    <p className="text-slate-600 mb-6 line-clamp-3 text-lg leading-relaxed">
                      {report.description || "Expert analysis and strategic insights from our research team."}
                    </p>

                    {report.key_insights && report.key_insights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {report.key_insights.slice(0, 3).map((insight, i) => (
                          <span key={i} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                            {insight}
                          </span>
                        ))}
                      </div>
                    )}

                    {report.author_name && (
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{report.author_name}</p>
                          {report.author_title && (
                            <p className="text-sm text-slate-500">{report.author_title}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Button className="w-fit bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 px-6">
                      Read Full Report
                      <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {/* Reports by Category */}
      <section className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <div className="h-48 bg-slate-100" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-6 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Reports Found</h3>
              <p className="text-slate-500 text-center max-w-md">
                We're working on new research. Check back soon for the latest insights.
              </p>
            </CardContent>
          </Card>
        ) : selectedCategory === "all" ? (
          // Show grouped by category when "All" is selected
          <div className="space-y-16">
            {Object.entries(categoryConfig).map(([category, config]) => {
              const categoryReports = groupedReports[category];
              if (!categoryReports?.length) return null;
              
              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}>
                        <config.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{category}</h2>
                        <p className="text-slate-500 text-sm">{config.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-slate-100">
                      {categoryReports.length} report{categoryReports.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  {/* Reports Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryReports.filter(r => !r.featured).slice(0, 6).map((report) => (
                      <ReportCard key={report.id} report={report} config={config} navigate={navigate} formatDate={formatDate} getMappedCategory={getMappedCategory} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Show flat grid when specific category is selected
          <div>
            <div className="flex items-center gap-4 mb-8">
              {(() => {
                const config = categoryConfig[selectedCategory];
                return config ? (
                  <>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}>
                      <config.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedCategory}</h2>
                      <p className="text-slate-500 text-sm">{config.description}</p>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.filter(r => !r.featured).map((report) => {
                const config = getCategoryConfig(report.category);
                return (
                  <ReportCard key={report.id} report={report} config={config} navigate={navigate} formatDate={formatDate} getMappedCategory={getMappedCategory} />
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-1.5">
              Unlock Premium Access
            </Badge>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Get Full Access to Our
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Complete Research Library
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Sign up for FlowPulse to access complete reports, real-time analysis, and powerful tools designed for financial professionals
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 max-w-3xl mx-auto">
              <Card className="bg-white/5 border-white/10 p-8 text-left hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] group">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <TrendingUp className="h-7 w-7 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">FlowPulse Finance</h3>
                    <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                      For financial advisers and paraplanners. Full research access, client tools, and compliance features.
                    </p>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all"
                      onClick={() => navigate("/login")}
                    >
                      Get Started
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white/5 border-white/10 p-8 text-left hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] group">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <LineChart className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">FlowPulse Investor</h3>
                    <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                      For individual investors. Portfolio tracking, market data, and curated research insights.
                    </p>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all"
                      onClick={() => navigate("/login-investor")}
                    >
                      Get Started
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
              <span className="font-semibold text-white">FlowPulse</span>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} FlowPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Extracted Report Card Component
function ReportCard({ 
  report, 
  config, 
  navigate, 
  formatDate,
  getMappedCategory 
}: { 
  report: Report; 
  config: typeof categoryConfig[string]; 
  navigate: (path: string) => void;
  formatDate: (date: string) => string;
  getMappedCategory: (cat: string | null) => string;
}) {
  return (
    <Card 
      className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group bg-white hover:-translate-y-1"
      onClick={() => navigate(`/reports/${report.id}`)}
    >
      <div className="relative h-48 overflow-hidden">
        {report.thumbnail_url ? (
          <img
            src={report.thumbnail_url}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
            <config.icon className="h-16 w-16 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <Badge className={`absolute top-4 left-4 ${config.bgAccent} ${config.iconColor} border-0 backdrop-blur-sm`}>
          <config.icon className="h-3 w-3 mr-1" />
          {getMappedCategory(report.category)}
        </Badge>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
          {report.reading_time && (
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {report.reading_time}
            </span>
          )}
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(report.created_at)}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
          {report.title}
        </h3>
        
        <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
          {report.description || "Expert analysis and strategic insights."}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {report.author_name ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="h-3 w-3 text-slate-500" />
              </div>
              <span className="text-xs text-slate-500 truncate max-w-[100px]">{report.author_name}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500">FlowPulse Research</span>
          )}
          <span className="text-blue-600 text-sm font-semibold flex items-center group-hover:gap-2 transition-all">
            Read <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}