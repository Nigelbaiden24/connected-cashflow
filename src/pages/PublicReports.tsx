import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Lock,
  Sparkles,
  ArrowRight,
  BookOpen
} from "lucide-react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const categoryConfig: Record<string, { icon: typeof TrendingUp; color: string; bgColor: string }> = {
  "Market Analysis": { icon: TrendingUp, color: "text-blue-600", bgColor: "bg-blue-50" },
  "Research": { icon: BarChart3, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  "Industry Reports": { icon: Globe, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  "Risk & Compliance": { icon: Shield, color: "text-red-600", bgColor: "bg-red-50" },
  "Strategic": { icon: Briefcase, color: "text-amber-600", bgColor: "bg-amber-50" },
  "General": { icon: FileText, color: "text-slate-600", bgColor: "bg-slate-50" },
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

  const categories = [...new Set(reports.map(r => r.category || "General"))].sort();
  const featuredReports = reports.filter(r => r.featured);
  
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || (report.category || "General") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryConfig = (category: string | null) => {
    return categoryConfig[category || "General"] || categoryConfig["General"];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <img src={flowpulseLogo} alt="FlowPulse" className="h-10 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-xl tracking-tight text-slate-900">FlowPulse</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#reports" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">Reports</a>
            <a href="#about" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")} 
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1.5 text-sm font-medium">
              <BookOpen className="h-4 w-4 mr-2" />
              Research Library
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
              Expert Financial Research
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              In-depth market analysis, strategic insights, and actionable research from our team of professional analysts
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 pt-6">
              <div className="flex items-center gap-2 text-slate-500">
                <User className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Professional Analysts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium">Data-Driven Insights</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Shield className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">Institutional Quality</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section id="reports" className="container mx-auto px-6 py-8 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-slate-50 border-slate-200 focus:bg-white h-12 text-base"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px] bg-slate-50 border-slate-200 h-12">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Featured Report */}
      {featuredReports.length > 0 && (
        <section className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl font-bold text-slate-900">Featured Report</h2>
          </div>
          
          {featuredReports.slice(0, 1).map((report) => {
            const config = getCategoryConfig(report.category);
            return (
              <Card 
                key={report.id} 
                className="overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/reports/${report.id}`)}
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-2/5 relative overflow-hidden bg-slate-100">
                    {report.thumbnail_url ? (
                      <img
                        src={report.thumbnail_url}
                        alt={report.title}
                        className="w-full h-64 lg:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-64 lg:h-full ${config.bgColor} flex items-center justify-center`}>
                        <config.icon className={`h-20 w-20 ${config.color} opacity-30`} />
                      </div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-amber-500 text-white border-0 shadow-md">
                      Featured
                    </Badge>
                  </div>
                  
                  <CardContent className="lg:w-3/5 p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge className={`${config.bgColor} ${config.color} hover:${config.bgColor}`}>
                        {report.category || "General"}
                      </Badge>
                      {report.reading_time && (
                        <span className="flex items-center text-sm text-slate-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {report.reading_time}
                        </span>
                      )}
                      <span className="flex items-center text-sm text-slate-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(report.created_at)}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {report.title}
                    </h3>
                    
                    <p className="text-slate-600 mb-6 line-clamp-3 text-lg">
                      {report.description || "Expert analysis and strategic insights from our research team."}
                    </p>

                    {report.author_name && (
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{report.author_name}</p>
                          {report.author_title && (
                            <p className="text-sm text-slate-500">{report.author_title}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Button className="w-fit bg-blue-600 hover:bg-blue-700 text-white">
                      Read Report
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {/* Reports Grid */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">All Reports</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse border-slate-200">
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
          <Card className="border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Reports Found</h3>
              <p className="text-slate-500 text-center max-w-md">
                We're working on new research. Check back soon for the latest insights.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredReports.filter(r => !r.featured).map((report) => {
              const config = getCategoryConfig(report.category);
              return (
                <Card 
                  key={report.id} 
                  className="overflow-hidden border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/reports/${report.id}`)}
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    {report.thumbnail_url ? (
                      <img
                        src={report.thumbnail_url}
                        alt={report.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full ${config.bgColor} flex items-center justify-center`}>
                        <config.icon className={`h-16 w-16 ${config.color} opacity-30`} />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={`${config.bgColor} ${config.color} hover:${config.bgColor} text-xs`}>
                        {report.category || "General"}
                      </Badge>
                      {report.reading_time && (
                        <span className="text-xs text-slate-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {report.reading_time}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {report.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {report.description || "Expert analysis and strategic insights."}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        {formatDate(report.created_at)}
                      </span>
                      <span className="text-blue-600 text-sm font-medium flex items-center group-hover:gap-2 transition-all">
                        Read more <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section id="about" className="bg-slate-900 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Unlock Full Access to Our Research
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Sign up for FlowPulse to access complete reports, real-time analysis, and powerful tools for financial professionals
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
              <Card className="bg-white/5 border-white/10 p-6 text-left hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">FlowPulse Finance</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      For financial advisers and paraplanners. Full research access, client tools, and compliance features.
                    </p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => navigate("/login")}
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white/5 border-white/10 p-6 text-left hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">FlowPulse Investor</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      For individual investors. Market insights, portfolio tools, and educational resources.
                    </p>
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => navigate("/login/investor")}
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
              <span className="font-semibold text-slate-900">FlowPulse</span>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} FlowPulse. Professional financial research and analysis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
