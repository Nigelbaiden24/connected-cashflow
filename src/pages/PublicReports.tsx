import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  FileText, 
  Download, 
  ShoppingCart, 
  Loader2, 
  Search, 
  ArrowLeft,
  Star,
  TrendingUp,
  BarChart3,
  Shield,
  Globe,
  Briefcase,
  Eye,
  Sparkles,
  Award,
  Lock,
  Zap,
  Crown,
  Flame,
  Target,
  Rocket
} from "lucide-react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Report {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price_cents: number;
  currency: string;
  download_count: number;
  created_at: string;
  category: string | null;
  preview_images: string[] | null;
  page_count: number | null;
  featured: boolean | null;
}

const categoryConfig: Record<string, { icon: typeof TrendingUp; color: string; gradient: string; bgGradient: string }> = {
  "Market Analysis": { icon: TrendingUp, color: "text-cyan-400", gradient: "from-cyan-500 to-blue-600", bgGradient: "from-cyan-500/20 to-blue-600/20" },
  "Research": { icon: BarChart3, color: "text-violet-400", gradient: "from-violet-500 to-purple-600", bgGradient: "from-violet-500/20 to-purple-600/20" },
  "Industry Reports": { icon: Globe, color: "text-emerald-400", gradient: "from-emerald-500 to-teal-600", bgGradient: "from-emerald-500/20 to-teal-600/20" },
  "Risk & Compliance": { icon: Shield, color: "text-rose-400", gradient: "from-rose-500 to-red-600", bgGradient: "from-rose-500/20 to-red-600/20" },
  "Strategic": { icon: Briefcase, color: "text-amber-400", gradient: "from-amber-500 to-orange-600", bgGradient: "from-amber-500/20 to-orange-600/20" },
  "General": { icon: FileText, color: "text-slate-400", gradient: "from-slate-500 to-slate-600", bgGradient: "from-slate-500/20 to-slate-600/20" },
};

export default function PublicReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const purchasedReportId = searchParams.get("purchased");

  useEffect(() => {
    fetchReports();
    
    if (purchasedReportId) {
      handlePurchaseVerification(purchasedReportId);
    }
  }, [purchasedReportId]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("purchasable_reports")
        .select("id, title, description, thumbnail_url, price_cents, currency, download_count, created_at, category, preview_images, page_count, featured")
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

  const handlePurchaseVerification = async (reportId: string) => {
    try {
      const sessionId = sessionStorage.getItem(`purchase_session_${reportId}`);
      
      const { data, error } = await supabase.functions.invoke("verify-report-purchase", {
        body: { reportId, sessionId },
      });

      if (error) throw error;

      if (data.verified && data.downloadUrl) {
        toast.success("Purchase verified! Your download is starting...");
        
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.title || "report.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        sessionStorage.removeItem(`purchase_session_${reportId}`);
      }
    } catch (error) {
      console.error("Error verifying purchase:", error);
    }
  };

  const handlePurchase = async (report: Report) => {
    setPurchasing(report.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke("create-report-payment", {
        body: { 
          reportId: report.id,
          userEmail: user?.email 
        },
      });

      if (error) throw error;

      if (data.url) {
        sessionStorage.setItem(`purchase_session_${report.id}`, data.sessionId || "");
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      console.error("Error creating payment:", error);
      toast.error(error.message || "Failed to initiate purchase");
    } finally {
      setPurchasing(null);
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <img src={flowpulseLogo} alt="FlowPulse" className="h-10 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">FlowPulse</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")} 
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full border border-violet-500/30 text-sm font-medium backdrop-blur-sm animate-fade-in">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Premium Research Library</span>
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">Expert</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Research Reports
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Access <span className="text-cyan-400 font-semibold">institutional-grade analysis</span> and strategic insights crafted by industry experts
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-8 pt-8">
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20">
                <Shield className="h-6 w-6 text-emerald-400" />
                <div className="text-left">
                  <p className="text-emerald-400 font-bold">100%</p>
                  <p className="text-xs text-white/50">Secure</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-2xl border border-amber-500/20">
                <Zap className="h-6 w-6 text-amber-400" />
                <div className="text-left">
                  <p className="text-amber-400 font-bold">Instant</p>
                  <p className="text-xs text-white/50">Download</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-violet-500/10 to-violet-500/5 rounded-2xl border border-violet-500/20">
                <Award className="h-6 w-6 text-violet-400" />
                <div className="text-left">
                  <p className="text-violet-400 font-bold">Expert</p>
                  <p className="text-xs text-white/50">Quality</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 rounded-2xl border border-cyan-500/20">
                <Lock className="h-6 w-6 text-cyan-400" />
                <div className="text-left">
                  <p className="text-cyan-400 font-bold">Lifetime</p>
                  <p className="text-xs text-white/50">Access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Reports */}
      {featuredReports.length > 0 && (
        <section className="container mx-auto px-6 pb-16 relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/25">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Featured Reports</h2>
              <p className="text-white/50 text-sm">Hand-picked premium insights</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredReports.slice(0, 2).map((report, idx) => {
              const config = getCategoryConfig(report.category);
              return (
                <Card 
                  key={report.id} 
                  className="group relative overflow-hidden border-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl hover:from-white/[0.12] hover:to-white/[0.04] transition-all duration-500"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Featured Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/30 px-3 py-1">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col md:flex-row relative z-10">
                    <div className="md:w-2/5 relative overflow-hidden">
                      {report.thumbnail_url ? (
                        <img
                          src={report.thumbnail_url}
                          alt={report.title}
                          className="w-full h-56 md:h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className={`w-full h-56 md:h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                          <config.icon className="h-20 w-20 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0f]/80" />
                    </div>
                    
                    <div className="md:w-3/5 p-8 flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0`}>
                          <config.icon className="h-3 w-3 mr-1" />
                          {report.category || "General"}
                        </Badge>
                        {report.page_count && (
                          <Badge variant="outline" className="border-white/20 text-white/70">
                            {report.page_count} pages
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-violet-400 group-hover:bg-clip-text transition-all">
                        {report.title}
                      </h3>
                      
                      <p className="text-white/50 text-sm mb-6 line-clamp-3 flex-1">
                        {report.description || "Premium research report with expert analysis and actionable insights."}
                      </p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <div>
                          <span className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            £{(report.price_cents / 100).toFixed(2)}
                          </span>
                          <p className="text-xs text-white/40 mt-1">
                            <Download className="h-3 w-3 inline mr-1" />
                            {report.download_count} downloads
                          </p>
                        </div>
                        
                        <div className="flex gap-3">
                          {report.preview_images && report.preview_images.length > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setPreviewReport(report)}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                          )}
                          <Button 
                            onClick={() => handlePurchase(report)}
                            disabled={purchasing === report.id}
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 border-0"
                          >
                            {purchasing === report.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Rocket className="h-4 w-4 mr-2" />
                                Get Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <section className="container mx-auto px-6 pb-8 relative z-10">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 bg-gradient-to-r from-white/[0.05] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              placeholder="Search reports by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-violet-500/20"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[220px] h-14 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
              <SelectItem value="all" className="hover:bg-white/10 focus:bg-white/10">All Categories</SelectItem>
              {categories.map((cat) => {
                const config = getCategoryConfig(cat);
                return (
                  <SelectItem key={cat} value={cat} className="hover:bg-white/10 focus:bg-white/10">
                    <div className="flex items-center gap-2">
                      <config.icon className={`h-4 w-4 ${config.color}`} />
                      {cat}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              selectedCategory === "all" 
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30" 
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            All Reports
          </button>
          {categories.map((cat) => {
            const config = getCategoryConfig(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === cat 
                    ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg` 
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                <config.icon className="h-4 w-4" />
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Reports Grid */}
      <section className="container mx-auto px-6 pb-20 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-violet-500" />
              <div className="absolute inset-0 h-16 w-16 animate-ping bg-violet-500/20 rounded-full" />
            </div>
            <p className="text-white/50 mt-6 text-lg">Loading premium reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="p-8 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl mb-8">
              <Target className="h-20 w-20 text-white/20" />
            </div>
            <h3 className="text-3xl font-bold mb-3 text-white">No Reports Found</h3>
            <p className="text-white/50 max-w-md text-lg">
              {searchQuery || selectedCategory !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Check back soon for new premium research reports"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-10">
              <p className="text-white/50 text-lg">
                Showing <span className="font-bold text-white">{filteredReports.length}</span> premium reports
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredReports.map((report, idx) => {
                const config = getCategoryConfig(report.category);
                return (
                  <Card 
                    key={report.id} 
                    className="group flex flex-col overflow-hidden border-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl hover:from-white/[0.12] hover:to-white/[0.04] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-500/10"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {report.thumbnail_url ? (
                        <img
                          src={report.thumbnail_url}
                          alt={report.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                          <config.icon className="h-20 w-20 text-white/20" />
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 shadow-lg`}>
                          <config.icon className="h-3 w-3 mr-1" />
                          {report.category || "General"}
                        </Badge>
                      </div>
                      
                      {/* Featured Star */}
                      {report.featured && (
                        <div className="absolute top-4 right-4">
                          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-lg shadow-amber-500/30">
                            <Star className="h-4 w-4 text-white fill-current" />
                          </div>
                        </div>
                      )}
                      
                      {/* Preview Button */}
                      {report.preview_images && report.preview_images.length > 0 && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0"
                          onClick={() => setPreviewReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      )}
                      
                      {/* Price Tag */}
                      <div className="absolute bottom-4 left-4">
                        <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-white font-bold shadow-lg shadow-emerald-500/30">
                          £{(report.price_cents / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2 pt-6">
                      <CardTitle className="text-lg line-clamp-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-violet-400 group-hover:bg-clip-text transition-all">
                        {report.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex-1 pb-4">
                      <CardDescription className="line-clamp-2 text-sm text-white/50">
                        {report.description || "Premium research report with expert analysis and actionable insights."}
                      </CardDescription>
                      
                      <div className="flex items-center gap-4 mt-4 text-xs text-white/40">
                        {report.page_count && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {report.page_count} pages
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {report.download_count} downloads
                        </span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0 pb-6 px-6">
                      <Button 
                        onClick={() => handlePurchase(report)}
                        disabled={purchasing === report.id}
                        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 border-0 h-12"
                      >
                        {purchasing === report.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Buy Now
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Trust Section */}
      <section className="relative z-10 border-t border-white/10 bg-gradient-to-b from-transparent to-violet-950/20">
        <div className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-4">Why Choose FlowPulse Reports?</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">Premium quality research backed by security and expertise</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-white/[0.05] to-transparent rounded-3xl border border-white/10 group hover:border-emerald-500/30 transition-all duration-500">
              <div className="inline-flex p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Secure Payments</h3>
              <p className="text-white/50">
                All transactions are processed securely through Stripe with bank-level encryption.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-white/[0.05] to-transparent rounded-3xl border border-white/10 group hover:border-amber-500/30 transition-all duration-500">
              <div className="inline-flex p-5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Instant Delivery</h3>
              <p className="text-white/50">
                Download your reports immediately after purchase. No waiting, no delays.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-white/[0.05] to-transparent rounded-3xl border border-white/10 group hover:border-violet-500/30 transition-all duration-500">
              <div className="inline-flex p-5 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl mb-6 shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Expert Quality</h3>
              <p className="text-white/50">
                Every report is crafted by industry professionals with deep market expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Dialog */}
      <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0f] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{previewReport?.title} - Preview</DialogTitle>
          </DialogHeader>
          
          {previewReport?.preview_images && previewReport.preview_images.length > 0 ? (
            <div className="space-y-6">
              {previewReport.preview_images.map((img, idx) => (
                <img 
                  key={idx}
                  src={img}
                  alt={`Page ${idx + 1}`}
                  className="w-full rounded-xl border border-white/10 shadow-xl"
                />
              ))}
              
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <p className="text-white/50">
                  This is a preview. Purchase to access the full report.
                </p>
                <Button 
                  onClick={() => {
                    setPreviewReport(null);
                    if (previewReport) handlePurchase(previewReport);
                  }}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase for £{previewReport ? (previewReport.price_cents / 100).toFixed(2) : "0.00"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-white/50 text-center py-12">No preview available for this report.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-white/40">© {new Date().getFullYear()} FlowPulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
