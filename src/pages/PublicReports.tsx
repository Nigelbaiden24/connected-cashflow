import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, Eye, ShoppingCart, Lock, TrendingUp, BarChart3, Shield, Globe, Briefcase, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface PublicReport {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  report_type: string;
  thumbnail_url: string | null;
  published_date: string;
  price: number;
}

export default function PublicReports() {
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [purchasedReports, setPurchasedReports] = useState<string[]>([]);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
    checkPurchasedReports();
  }, []);

  const checkPurchasedReports = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_report_access')
      .select('report_id')
      .eq('user_id', user.id);

    if (data) {
      setPurchasedReports(data.map(d => d.report_id));
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('id, title, description, file_path, report_type, thumbnail_url, published_date, price')
        .eq('is_public', true)
        .order('published_date', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (report: PublicReport) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please log in to purchase reports");
      navigate("/login");
      return;
    }

    if (purchasedReports.includes(report.id)) {
      // Already purchased - download directly
      downloadReport(report);
      return;
    }

    if (report.price === 0) {
      // Free report - grant access directly
      const { error } = await supabase
        .from('user_report_access')
        .insert({ user_id: user.id, report_id: report.id });

      if (!error) {
        setPurchasedReports([...purchasedReports, report.id]);
        toast.success("Report added to your library!");
        downloadReport(report);
      }
      return;
    }

    // Paid report - create Stripe checkout
    setProcessingPayment(report.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: `report_${report.id}`,
          mode: 'payment',
          planName: report.title,
          platform: 'reports',
          reportId: report.id,
          amount: report.price,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Failed to initiate checkout. Please try again.");
    } finally {
      setProcessingPayment(null);
    }
  };

  const downloadReport = async (report: PublicReport) => {
    try {
      const { data, error } = await supabase.storage
        .from('reports')
        .download(report.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error("Failed to download report");
    }
  };

  const filteredReports = reports.filter(report => 
    !searchQuery || 
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const reportCategories = {
    "Market Analysis": { icon: TrendingUp, color: "from-blue-600 to-cyan-600" },
    "Research": { icon: BarChart3, color: "from-purple-600 to-fuchsia-600" },
    "Industry": { icon: Globe, color: "from-green-600 to-emerald-600" },
    "Strategy": { icon: Briefcase, color: "from-orange-600 to-red-600" },
    "Risk": { icon: Shield, color: "from-red-600 to-pink-600" },
    "Portfolio": { icon: Target, color: "from-indigo-600 to-purple-600" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-6 py-16 relative">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">Premium Research</Badge>
            <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Investment Research Reports
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Access comprehensive market analysis, sector insights, and professional investment research from industry experts.
            </p>
            <div className="relative max-w-md">
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-4 py-6 text-lg bg-background/80 backdrop-blur border-border/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-20 w-20 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reports Available</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchQuery 
                  ? `No reports match "${searchQuery}"`
                  : "Research reports will appear here once published."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => {
              const isPurchased = purchasedReports.includes(report.id);
              const isFree = report.price === 0;
              const categoryConfig = Object.entries(reportCategories).find(
                ([key]) => report.report_type.toLowerCase().includes(key.toLowerCase())
              );
              const IconComponent = categoryConfig?.[1]?.icon || FileText;
              const colorClass = categoryConfig?.[1]?.color || "from-gray-600 to-slate-600";

              return (
                <Card 
                  key={report.id} 
                  className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm"
                >
                  <div className={`relative h-52 bg-gradient-to-br ${colorClass} flex items-center justify-center overflow-hidden`}>
                    {report.thumbnail_url ? (
                      <img 
                        src={report.thumbnail_url} 
                        alt={report.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-white/90">
                        <IconComponent className="h-16 w-16 mb-2" />
                        <span className="text-sm font-medium">{report.report_type}</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                        {report.report_type}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      {isPurchased ? (
                        <Badge className="bg-green-600 text-white">Purchased</Badge>
                      ) : isFree ? (
                        <Badge className="bg-blue-600 text-white">Free</Badge>
                      ) : (
                        <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                          £{(report.price / 100).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-2">
                          {report.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {new Date(report.published_date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {report.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {report.description}
                        </p>
                      )}

                      <Button 
                        onClick={() => handlePurchase(report)}
                        className="w-full group/btn"
                        disabled={processingPayment === report.id}
                        variant={isPurchased ? "default" : "default"}
                      >
                        {processingPayment === report.id ? (
                          <span className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </span>
                        ) : isPurchased ? (
                          <>
                            <Download className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                            Download Report
                          </>
                        ) : isFree ? (
                          <>
                            <Download className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                            Get Free Report
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                            Purchase Report
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}