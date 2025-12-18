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
  CheckCircle, 
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
  Filter
} from "lucide-react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

const categoryConfig: Record<string, { icon: typeof TrendingUp; color: string; gradient: string }> = {
  "Market Analysis": { icon: TrendingUp, color: "text-blue-500", gradient: "from-blue-600 to-cyan-500" },
  "Research": { icon: BarChart3, color: "text-purple-500", gradient: "from-purple-600 to-pink-500" },
  "Industry Reports": { icon: Globe, color: "text-green-500", gradient: "from-green-600 to-emerald-500" },
  "Risk & Compliance": { icon: Shield, color: "text-red-500", gradient: "from-red-600 to-orange-500" },
  "Strategic": { icon: Briefcase, color: "text-indigo-500", gradient: "from-indigo-600 to-blue-500" },
  "General": { icon: FileText, color: "text-slate-500", gradient: "from-slate-600 to-slate-400" },
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={flowpulseLogo} alt="FlowPulse" className="h-10" />
            <span className="font-bold text-xl tracking-tight">FlowPulse</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")} className="hidden sm:flex">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button variant="outline" size="icon" className="sm:hidden" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-sm font-medium text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              Premium Research Library
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
              Expert Investment
              <span className="block bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Research Reports
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Access institutional-grade analysis, market insights, and strategic reports crafted by industry experts to power your investment decisions.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Instant Download</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4 text-blue-500" />
                <span>Expert Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 text-purple-500" />
                <span>Lifetime Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Reports */}
      {featuredReports.length > 0 && (
        <section className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
              <Star className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Featured Reports</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredReports.slice(0, 2).map((report) => {
              const config = getCategoryConfig(report.category);
              return (
                <Card key={report.id} className="group relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 hover:border-primary/40 transition-all duration-300">
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/5 relative">
                      {report.thumbnail_url ? (
                        <img
                          src={report.thumbnail_url}
                          alt={report.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-48 md:h-full bg-gradient-to-br ${config.gradient} opacity-20 flex items-center justify-center`}>
                          <config.icon className="h-16 w-16 text-foreground/20" />
                        </div>
                      )}
                    </div>
                    
                    <div className="md:w-3/5 p-6 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className={config.color}>
                          <config.icon className="h-3 w-3 mr-1" />
                          {report.category || "General"}
                        </Badge>
                        {report.page_count && (
                          <Badge variant="secondary" className="text-xs">
                            {report.page_count} pages
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {report.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                        {report.description || "Premium research report with expert analysis and actionable insights."}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <span className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                            £{(report.price_cents / 100).toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {report.download_count} downloads
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          {report.preview_images && report.preview_images.length > 0 && (
                            <Button variant="outline" size="sm" onClick={() => setPreviewReport(report)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                          )}
                          <Button 
                            onClick={() => handlePurchase(report)}
                            disabled={purchasing === report.id}
                            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                          >
                            {purchasing === report.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Purchase
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
      <section className="container mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 bg-card/50 backdrop-blur-sm rounded-2xl border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search reports by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-background border-border/50"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="h-5 w-5 text-muted-foreground hidden sm:block" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px] h-12 bg-background">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Reports Grid */}
      <section className="container mx-auto px-6 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading premium reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-6 bg-muted/50 rounded-full mb-6">
              <FileText className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Reports Found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery || selectedCategory !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Check back soon for new premium research reports"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredReports.length}</span> reports
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => {
                const config = getCategoryConfig(report.category);
                return (
                  <Card key={report.id} className="group flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {report.thumbnail_url ? (
                        <img
                          src={report.thumbnail_url}
                          alt={report.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${config.gradient} opacity-15 flex items-center justify-center`}>
                          <config.icon className="h-20 w-20 text-foreground/20" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className={`${config.color} bg-background/90 backdrop-blur-sm`}>
                          <config.icon className="h-3 w-3 mr-1" />
                          {report.category || "General"}
                        </Badge>
                      </div>
                      
                      {report.featured && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                            <Star className="h-3 w-3" />
                          </Badge>
                        </div>
                      )}
                      
                      {report.preview_images && report.preview_images.length > 0 && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          onClick={() => setPreviewReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      )}
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {report.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex-1 pb-4">
                      <CardDescription className="line-clamp-3 text-sm">
                        {report.description || "Premium research report with expert analysis and actionable insights."}
                      </CardDescription>
                      
                      <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
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
                    
                    <CardFooter className="pt-0 border-t bg-muted/30">
                      <div className="flex items-center justify-between w-full py-3">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                            £{(report.price_cents / 100).toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">One-time purchase</span>
                        </div>
                        
                        <Button 
                          onClick={() => handlePurchase(report)}
                          disabled={purchasing === report.id}
                          className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25"
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
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Trust Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex p-4 bg-green-500/10 rounded-2xl mb-4">
                <Shield className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground text-sm">
                All transactions are processed securely through Stripe with bank-level encryption.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex p-4 bg-blue-500/10 rounded-2xl mb-4">
                <Zap className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Instant Delivery</h3>
              <p className="text-muted-foreground text-sm">
                Download your reports immediately after purchase. No waiting, no delays.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex p-4 bg-purple-500/10 rounded-2xl mb-4">
                <Award className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Expert Quality</h3>
              <p className="text-muted-foreground text-sm">
                Every report is crafted by industry professionals with deep market expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Dialog */}
      <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{previewReport?.title} - Preview</DialogTitle>
          </DialogHeader>
          
          {previewReport?.preview_images && previewReport.preview_images.length > 0 ? (
            <div className="space-y-4">
              {previewReport.preview_images.map((img, idx) => (
                <img 
                  key={idx}
                  src={img}
                  alt={`Page ${idx + 1}`}
                  className="w-full rounded-lg border shadow-sm"
                />
              ))}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-muted-foreground text-sm">
                  This is a preview. Purchase to access the full report.
                </p>
                <Button onClick={() => {
                  setPreviewReport(null);
                  if (previewReport) handlePurchase(previewReport);
                }}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase for £{previewReport ? (previewReport.price_cents / 100).toFixed(2) : "0.00"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No preview available for this report.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} FlowPulse. All rights reserved.
        </div>
      </footer>
    </div>
  );
}