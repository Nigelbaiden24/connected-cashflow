import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Download, ShoppingCart, Loader2, Search, CheckCircle, ArrowLeft } from "lucide-react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface Report {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price_cents: number;
  currency: string;
  download_count: number;
  created_at: string;
}

export default function PublicReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
        .select("id, title, description, thumbnail_url, price_cents, currency, download_count, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
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
        
        // Trigger download
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
        // Store session for verification
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

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={flowpulseLogo} alt="FlowPulse" className="h-10" />
            <span className="font-bold text-xl">FlowPulse</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Premium Research Reports
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access expert analysis and insights to make informed investment decisions
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Reports Available</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "No reports match your search" : "Check back soon for new reports"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                {report.thumbnail_url ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={report.thumbnail_url}
                      alt={report.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <FileText className="h-16 w-16 text-primary/40" />
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{report.title}</CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      £{(report.price_cents / 100).toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <CardDescription className="line-clamp-3">
                    {report.description || "Premium research report with expert analysis and insights."}
                  </CardDescription>
                </CardContent>
                
                <CardFooter className="pt-0 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {report.download_count} downloads
                  </span>
                  <Button 
                    onClick={() => handlePurchase(report)}
                    disabled={purchasing === report.id}
                    size="sm"
                  >
                    {purchasing === report.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Purchase
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto bg-muted/50 rounded-lg p-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-muted-foreground">
              All payments are processed securely through Stripe. After purchase, you'll receive instant access to download your report.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
