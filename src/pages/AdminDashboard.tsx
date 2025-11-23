import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileText, Newspaper, TrendingUp, BookOpen, Video, List, Loader2, LogOut, LayoutDashboard, Shield, Bell, Users, Calendar, FileBarChart } from "lucide-react";
import { AlertsForm } from "@/components/admin/AlertsForm";
import { MarketTrendsUpload } from "@/components/admin/MarketTrendsUpload";
import { UserManagement } from "@/components/admin/UserManagement";
import { DemoRequests } from "@/components/admin/DemoRequests";
import { AdminReportUpload } from "@/components/reports/AdminReportUpload";

interface Profile {
  user_id: string;
  email: string;
  full_name: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Form states for each content type
  const [reportForm, setReportForm] = useState({ title: "", description: "", userId: "", file: null as File | null });
  const [newsletterForm, setNewsletterForm] = useState({ title: "", description: "", publishDate: "", userId: "all", file: null as File | null });
  const [portfolioForm, setPortfolioForm] = useState({ title: "", description: "", userId: "all", file: null as File | null });
  const [commentaryForm, setCommentaryForm] = useState({ title: "", description: "", userId: "all", file: null as File | null });
  const [learningForm, setLearningForm] = useState({ 
    title: "", 
    description: "", 
    content: "",
    category: "", 
    duration: "",
    difficultyLevel: "",
    topics: "",
    keyMetrics: "",
    majorPlayers: "",
    severity: "",
    mitigation: "",
    userId: "all", 
    file: null as File | null,
    videoUrl: ""
  });
  const [videoForm, setVideoForm] = useState({ title: "", description: "", category: "", userId: "all", file: null as File | null });
  const [watchlistForm, setWatchlistForm] = useState({ name: "", description: "", category: "", userId: "all", file: null as File | null });
  const [riskComplianceForm, setRiskComplianceForm] = useState({ 
    title: "", 
    description: "", 
    type: "", 
    severity: "",
    content: "",
    userId: "all", 
    file: null as File | null 
  });
  const [alertForm, setAlertForm] = useState({
    alertType: "",
    title: "",
    description: "",
    ticker: "",
    company: "",
    severity: "medium",
    alertData: {} as any,
    sendVia: [] as string[]
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/admin/login");
        return;
      }

      // Only allow specific admin email
      if (user.email?.toLowerCase() !== "nigelbaiden24@yahoo.com") {
        toast.error("Access denied. Only authorized administrators can access this dashboard.");
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      // Check if user has admin role
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !roleData) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/admin/login");
        return;
      }

      setIsAdmin(true);
      await fetchProfiles();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("user_id, email, full_name")
        .order("email");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Failed to load user profiles");
    }
  };

  const uploadFile = async (bucket: string, file: File, folder: string = "") => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    return filePath;
  };

  const handleReportUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.file || !reportForm.title || !reportForm.userId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      const filePath = await uploadFile("reports", reportForm.file);

      const { error } = await supabase.from("reports").insert({
        title: reportForm.title,
        description: reportForm.description,
        file_path: filePath,
        report_type: "admin_upload",
        platform: "investor",
        uploaded_by: reportForm.userId,
      });

      // Grant access to the specific user
      const { data: reportData } = await supabase
        .from("reports")
        .select("id")
        .eq("file_path", filePath)
        .single();

      if (reportData) {
        await supabase.from("user_report_access").insert({
          user_id: reportForm.userId,
          report_id: reportData.id,
        });
      }

      if (error) throw error;

      toast.success("Report uploaded successfully!");
      setReportForm({ title: "", description: "", userId: "", file: null });
    } catch (error: any) {
      console.error("Error uploading report:", error);
      toast.error(error.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  const handleNewsletterUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterForm.file || !newsletterForm.title) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      const filePath = await uploadFile("newsletters", newsletterForm.file);

      const { error } = await supabase.from("newsletters").insert({
        title: newsletterForm.title,
        preview: newsletterForm.description,
        content: newsletterForm.description,
        file_path: filePath,
        category: "admin_upload",
        published_date: newsletterForm.publishDate || new Date().toISOString(),
        user_id: newsletterForm.userId && newsletterForm.userId !== "all" ? newsletterForm.userId : null,
      });

      if (error) throw error;

      toast.success(`Newsletter uploaded successfully${newsletterForm.userId && newsletterForm.userId !== "all" ? ' for selected user' : ' for all users'}!`);
      setNewsletterForm({ title: "", description: "", publishDate: "", userId: "all", file: null });
    } catch (error: any) {
      console.error("Error uploading newsletter:", error);
      toast.error(error.message || "Failed to upload newsletter");
    } finally {
      setUploading(false);
    }
  };

  const handlePortfolioUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioForm.file || !portfolioForm.title) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      const filePath = await uploadFile("portfolios", portfolioForm.file);

      const { error } = await supabase.from("model_portfolios").insert({
        title: portfolioForm.title,
        description: portfolioForm.description,
        file_path: filePath,
        user_id: portfolioForm.userId && portfolioForm.userId !== "all" ? portfolioForm.userId : null,
      });

      if (error) throw error;

      toast.success(`Model portfolio uploaded successfully${portfolioForm.userId && portfolioForm.userId !== "all" ? ' for selected user' : ' for all users'}!`);
      setPortfolioForm({ title: "", description: "", userId: "all", file: null });
    } catch (error: any) {
      console.error("Error uploading portfolio:", error);
      toast.error(error.message || "Failed to upload portfolio");
    } finally {
      setUploading(false);
    }
  };

  const handleCommentaryUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentaryForm.file || !commentaryForm.title) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      const filePath = await uploadFile("commentary", commentaryForm.file);

      const { error } = await supabase.from("market_commentary").insert({
        title: commentaryForm.title,
        description: commentaryForm.description,
        file_path: filePath,
        user_id: commentaryForm.userId && commentaryForm.userId !== "all" ? commentaryForm.userId : null,
      });

      if (error) throw error;

      toast.success(`Market commentary uploaded successfully${commentaryForm.userId && commentaryForm.userId !== "all" ? ' for selected user' : ' for all users'}!`);
      setCommentaryForm({ title: "", description: "", userId: "all", file: null });
    } catch (error: any) {
      console.error("Error uploading commentary:", error);
      toast.error(error.message || "Failed to upload commentary");
    } finally {
      setUploading(false);
    }
  };

  const handleLearningUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningForm.title || !learningForm.category || !learningForm.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      let filePath = null;
      if (learningForm.file) {
        filePath = await uploadFile("learning", learningForm.file);
      }

      // Parse comma-separated values into arrays
      const topics = learningForm.topics ? learningForm.topics.split(',').map(t => t.trim()).filter(Boolean) : null;
      const keyMetrics = learningForm.keyMetrics ? learningForm.keyMetrics.split(',').map(t => t.trim()).filter(Boolean) : null;
      const majorPlayers = learningForm.majorPlayers ? learningForm.majorPlayers.split(',').map(t => t.trim()).filter(Boolean) : null;

      const { error } = await supabase.from("learning_content").insert({
        title: learningForm.title,
        description: learningForm.description,
        content: learningForm.content,
        category: learningForm.category,
        duration: learningForm.duration || null,
        difficulty_level: learningForm.difficultyLevel || null,
        topics: topics,
        key_metrics: keyMetrics,
        major_players: majorPlayers,
        severity: learningForm.severity || null,
        mitigation: learningForm.mitigation || null,
        video_url: learningForm.videoUrl || null,
        file_path: filePath,
        is_published: true,
        uploaded_by: learningForm.userId && learningForm.userId !== "all" ? learningForm.userId : null,
      });

      if (error) throw error;

      toast.success(`Learning content uploaded successfully${learningForm.userId && learningForm.userId !== "all" ? ' for selected user' : ' for all users'}!`);
      setLearningForm({ 
        title: "", 
        description: "", 
        content: "",
        category: "", 
        duration: "",
        difficultyLevel: "",
        topics: "",
        keyMetrics: "",
        majorPlayers: "",
        severity: "",
        mitigation: "",
        userId: "all", 
        file: null,
        videoUrl: ""
      });
    } catch (error: any) {
      console.error("Error uploading learning material:", error);
      toast.error(error.message || "Failed to upload learning material");
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.file || !videoForm.title) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      const filePath = await uploadFile("videos", videoForm.file);

      const { error } = await supabase.from("investor_videos").insert({
        title: videoForm.title,
        description: videoForm.description,
        file_path: filePath,
        category: videoForm.category || "general",
        user_id: videoForm.userId && videoForm.userId !== "all" ? videoForm.userId : null,
      });

      if (error) throw error;

      toast.success(`Video uploaded successfully${videoForm.userId && videoForm.userId !== "all" ? ' for selected user' : ' for all users'}!`);
      setVideoForm({ title: "", description: "", category: "", userId: "all", file: null });
    } catch (error: any) {
      console.error("Error uploading video:", error);
      toast.error(error.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleWatchlistUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchlistForm.name) {
      toast.error("Please provide a watchlist name");
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase.from("investment_watchlists").insert({
        name: watchlistForm.name,
        description: watchlistForm.description,
        category: watchlistForm.category || "general",
        is_public: watchlistForm.userId && watchlistForm.userId !== "all" ? false : true,
        created_by_admin: true,
        user_id: watchlistForm.userId && watchlistForm.userId !== "all" ? watchlistForm.userId : null,
      });

      if (error) throw error;

      toast.success(`Watchlist created successfully${watchlistForm.userId && watchlistForm.userId !== "all" ? ' for selected user' : ' for all users'}!`);
      setWatchlistForm({ name: "", description: "", category: "", userId: "all", file: null });
    } catch (error: any) {
      console.error("Error creating watchlist:", error);
      toast.error(error.message || "Failed to create watchlist");
    } finally {
      setUploading(false);
    }
  };

  const handleRiskComplianceUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskComplianceForm.title || !riskComplianceForm.type || !riskComplianceForm.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      let filePath = null;
      if (riskComplianceForm.file) {
        filePath = await uploadFile("reports", riskComplianceForm.file);
      }

      const { error } = await supabase.from("risk_assessment_reports").insert({
        report_name: riskComplianceForm.title,
        report_type: riskComplianceForm.type,
        summary: riskComplianceForm.description,
        report_data: {
          content: riskComplianceForm.content,
          severity: riskComplianceForm.severity || "medium",
          file_path: filePath,
        },
        user_id: riskComplianceForm.userId && riskComplianceForm.userId !== "all" ? riskComplianceForm.userId : null,
      });

      if (error) throw error;

      toast.success(`Risk & Compliance content uploaded successfully${riskComplianceForm.userId && riskComplianceForm.userId !== "all" ? ' for selected user' : ' for all users'}!`);
      setRiskComplianceForm({ 
        title: "", 
        description: "", 
        type: "", 
        severity: "",
        content: "",
        userId: "all", 
        file: null 
      });
    } catch (error: any) {
      console.error("Error uploading risk/compliance content:", error);
      toast.error(error.message || "Failed to upload risk/compliance content");
    } finally {
      setUploading(false);
    }
  };

  const handleAlertUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertForm.alertType || !alertForm.title || !alertForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      const { data: alertData, error } = await supabase.from("investor_alerts").insert({
        alert_type: alertForm.alertType,
        title: alertForm.title,
        description: alertForm.description,
        ticker: alertForm.ticker || null,
        company: alertForm.company || null,
        severity: alertForm.severity,
        alert_data: alertForm.alertData,
        published_date: new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      // Send notifications if requested
      if (alertForm.sendVia.length > 0 && alertData) {
        await supabase.functions.invoke("send-investor-alert", {
          body: { alertId: alertData.id },
        });
      }

      toast.success("Alert created successfully!");
      setAlertForm({
        alertType: "",
        title: "",
        description: "",
        ticker: "",
        company: "",
        severity: "medium",
        alertData: {},
        sendVia: []
      });
    } catch (error: any) {
      console.error("Error creating alert:", error);
      toast.error(error.message || "Failed to create alert");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen admin-theme bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-primary via-secondary to-accent shadow-2xl">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <LayoutDashboard className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              </div>
              <p className="text-white/90 text-lg">Upload and manage investor platform content</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                onClick={() => navigate("/investor/dashboard")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-12 gap-2 bg-card/50 p-2 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg">
            <TabsTrigger 
              value="users"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="demo-requests"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Demo Requests
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
            >
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="newsletters"
              className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-lg transition-all"
            >
              <Newspaper className="h-4 w-4 mr-2" />
              Newsletters
            </TabsTrigger>
            <TabsTrigger 
              value="portfolios"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Portfolios
            </TabsTrigger>
            <TabsTrigger 
              value="commentary"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
            >
              <FileText className="h-4 w-4 mr-2" />
              Commentary
            </TabsTrigger>
            <TabsTrigger 
              value="learning"
              className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-lg transition-all"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Learning
            </TabsTrigger>
            <TabsTrigger 
              value="videos"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all"
            >
              <Video className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="watchlists"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
            >
              <List className="h-4 w-4 mr-2" />
              Watchlists
            </TabsTrigger>
            <TabsTrigger 
              value="risk-compliance"
              className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-lg transition-all"
            >
              <Shield className="h-4 w-4 mr-2" />
              Risk & Compliance
            </TabsTrigger>
            <TabsTrigger 
              value="alerts"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all"
            >
              <Bell className="h-4 w-4 mr-2" />
              Signals & Alerts
            </TabsTrigger>
            <TabsTrigger 
              value="market-trends"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Market Trends
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          {/* Demo Requests Tab */}
          <TabsContent value="demo-requests">
            <DemoRequests />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* General Reports Upload */}
            <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileBarChart className="h-6 w-6 text-primary" />
                  General Reports Upload
                </CardTitle>
                <CardDescription>
                  Upload reports for Finance, Business, or Investor platforms. Select platform, report type, and assign to specific users.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      • Select which platform (Finance, Business, or Investor)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      • Choose report type from platform-specific categories
                    </p>
                    <p className="text-sm text-muted-foreground">
                      • Assign to specific users or make available to all
                    </p>
                  </div>
                  <AdminReportUpload onUploadSuccess={fetchProfiles} />
                </div>
              </CardContent>
            </Card>

            {/* Research Reports for Investor Platform */}
            <Card className="border-accent/20 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-accent/10 bg-gradient-to-r from-accent/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileBarChart className="h-6 w-6 text-accent" />
                  Investor Research Reports
                </CardTitle>
                <CardDescription>
                  Upload research reports that will appear in the FlowPulse Investor Research Reports tab
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      • Upload PDF research reports for investors
                    </p>
                    <p className="text-sm text-muted-foreground">
                      • Reports will appear in the Investor Research Reports section
                    </p>
                    <p className="text-sm text-muted-foreground">
                      • Assign to specific users or make available to all investors
                    </p>
                  </div>
                  <AdminReportUpload platform="investor" onUploadSuccess={fetchProfiles} />
                </div>
              </CardContent>
            </Card>

            {/* Analysis Reports for Investor Platform */}
            <Card className="border-secondary/20 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-secondary/10 bg-gradient-to-r from-secondary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileBarChart className="h-6 w-6 text-secondary" />
                  Investor Analysis Reports
                </CardTitle>
                <CardDescription>
                  Upload analysis reports that will appear in the FlowPulse Investor Analysis Reports tab
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      • Upload PDF analysis reports for investors
                    </p>
                    <p className="text-sm text-muted-foreground">
                      • Reports will appear in the Investor Analysis Reports section
                    </p>
                    <p className="text-sm text-muted-foreground">
                      • Assign to specific users or make available to all investors
                    </p>
                  </div>
                  <AdminReportUpload platform="investor" onUploadSuccess={fetchProfiles} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Newsletters Tab */}
          <TabsContent value="newsletters">
            <Card className="border-secondary/20 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-secondary/10 bg-gradient-to-r from-secondary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Newspaper className="h-6 w-6 text-secondary" />
                  Upload Newsletter
                </CardTitle>
                <CardDescription>Upload newsletters for all investors</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleNewsletterUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newsletter-title">Title *</Label>
                  <Input
                    id="newsletter-title"
                    value={newsletterForm.title}
                    onChange={(e) => setNewsletterForm({ ...newsletterForm, title: e.target.value })}
                    placeholder="Newsletter title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsletter-desc">Description</Label>
                  <Textarea
                    id="newsletter-desc"
                    value={newsletterForm.description}
                    onChange={(e) => setNewsletterForm({ ...newsletterForm, description: e.target.value })}
                    placeholder="Newsletter description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsletter-date">Publish Date (Optional)</Label>
                  <Input
                    id="newsletter-date"
                    type="date"
                    value={newsletterForm.publishDate}
                    onChange={(e) => setNewsletterForm({ ...newsletterForm, publishDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsletter-user">Select User (Optional)</Label>
                  <Select value={newsletterForm.userId} onValueChange={(value) => setNewsletterForm({ ...newsletterForm, userId: value })}>
                    <SelectTrigger id="newsletter-user">
                      <SelectValue placeholder="All users or select specific user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.full_name} ({profile.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsletter-file">File (PDF) *</Label>
                  <Input
                    id="newsletter-file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setNewsletterForm({ ...newsletterForm, file: e.target.files?.[0] || null })}
                    required
                  />
                </div>

                <Button type="submit" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Newsletter
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Portfolios Tab */}
          <TabsContent value="portfolios">
            <Card className="border-accent/20 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-accent/10 bg-gradient-to-r from-accent/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <TrendingUp className="h-6 w-6 text-accent" />
                  Upload Model Portfolio
                </CardTitle>
                <CardDescription>Upload model portfolios for investors to view</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handlePortfolioUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolio-title">Title *</Label>
                  <Input
                    id="portfolio-title"
                    value={portfolioForm.title}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                    placeholder="Portfolio title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio-desc">Description</Label>
                  <Textarea
                    id="portfolio-desc"
                    value={portfolioForm.description}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                    placeholder="Portfolio description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio-user">Select User (Optional)</Label>
                  <Select value={portfolioForm.userId} onValueChange={(value) => setPortfolioForm({ ...portfolioForm, userId: value })}>
                    <SelectTrigger id="portfolio-user">
                      <SelectValue placeholder="All users or select specific user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.full_name} ({profile.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio-file">File (PDF) *</Label>
                  <Input
                    id="portfolio-file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, file: e.target.files?.[0] || null })}
                    required
                  />
                </div>

                <Button type="submit" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Portfolio
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Commentary Tab */}
          <TabsContent value="commentary">
            <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="h-6 w-6 text-primary" />
                  Upload Market Commentary
                </CardTitle>
                <CardDescription>Upload market analysis and commentary</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleCommentaryUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="commentary-title">Title *</Label>
                  <Input
                    id="commentary-title"
                    value={commentaryForm.title}
                    onChange={(e) => setCommentaryForm({ ...commentaryForm, title: e.target.value })}
                    placeholder="Commentary title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commentary-desc">Description</Label>
                  <Textarea
                    id="commentary-desc"
                    value={commentaryForm.description}
                    onChange={(e) => setCommentaryForm({ ...commentaryForm, description: e.target.value })}
                    placeholder="Commentary description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commentary-user">Select User (Optional)</Label>
                  <Select value={commentaryForm.userId} onValueChange={(value) => setCommentaryForm({ ...commentaryForm, userId: value })}>
                    <SelectTrigger id="commentary-user">
                      <SelectValue placeholder="All users or select specific user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.full_name} ({profile.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commentary-file">File (PDF) *</Label>
                  <Input
                    id="commentary-file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setCommentaryForm({ ...commentaryForm, file: e.target.files?.[0] || null })}
                    required
                  />
                </div>

                <Button type="submit" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Commentary
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning">
            <Card className="border-secondary/20 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-secondary/10 bg-gradient-to-r from-secondary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BookOpen className="h-6 w-6 text-secondary" />
                  Upload Learning Content
                </CardTitle>
                <CardDescription>Upload educational content for all 6 Learning Hub categories</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleLearningUpload} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="learning-title">Title *</Label>
                      <Input
                        id="learning-title"
                        value={learningForm.title}
                        onChange={(e) => setLearningForm({ ...learningForm, title: e.target.value })}
                        placeholder="Content title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="learning-category">Category *</Label>
                      <Select value={learningForm.category} onValueChange={(value) => setLearningForm({ ...learningForm, category: value })}>
                        <SelectTrigger id="learning-category">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guides">📚 Guides</SelectItem>
                          <SelectItem value="sectors">🏭 Sectors</SelectItem>
                          <SelectItem value="risks">🛡️ Risks</SelectItem>
                          <SelectItem value="tax">📋 Tax</SelectItem>
                          <SelectItem value="videos">🎥 Videos</SelectItem>
                          <SelectItem value="glossary">📖 Glossary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learning-desc">Short Description</Label>
                    <Input
                      id="learning-desc"
                      value={learningForm.description}
                      onChange={(e) => setLearningForm({ ...learningForm, description: e.target.value })}
                      placeholder="Brief description (appears in cards)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learning-content">Full Content *</Label>
                    <Textarea
                      id="learning-content"
                      value={learningForm.content}
                      onChange={(e) => setLearningForm({ ...learningForm, content: e.target.value })}
                      placeholder="Full content text (will be displayed in detail view)"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="learning-duration">Duration (e.g., "10 min read", "8:24")</Label>
                      <Input
                        id="learning-duration"
                        value={learningForm.duration}
                        onChange={(e) => setLearningForm({ ...learningForm, duration: e.target.value })}
                        placeholder="Duration or reading time"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="learning-difficulty">Difficulty Level</Label>
                      <Select value={learningForm.difficultyLevel} onValueChange={(value) => setLearningForm({ ...learningForm, difficultyLevel: value })}>
                        <SelectTrigger id="learning-difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Category-specific fields */}
                  {learningForm.category === "guides" && (
                    <div className="space-y-2">
                      <Label htmlFor="learning-topics">Topics (comma-separated)</Label>
                      <Input
                        id="learning-topics"
                        value={learningForm.topics}
                        onChange={(e) => setLearningForm({ ...learningForm, topics: e.target.value })}
                        placeholder="e.g., Stocks, Bonds, Markets, Risk"
                      />
                    </div>
                  )}

                  {learningForm.category === "sectors" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="learning-metrics">Key Metrics (comma-separated)</Label>
                        <Input
                          id="learning-metrics"
                          value={learningForm.keyMetrics}
                          onChange={(e) => setLearningForm({ ...learningForm, keyMetrics: e.target.value })}
                          placeholder="e.g., Revenue Growth, R&D Spending, Market Share"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="learning-players">Major Players (comma-separated)</Label>
                        <Input
                          id="learning-players"
                          value={learningForm.majorPlayers}
                          onChange={(e) => setLearningForm({ ...learningForm, majorPlayers: e.target.value })}
                          placeholder="e.g., Apple, Microsoft, NVIDIA, Google"
                        />
                      </div>
                    </>
                  )}

                  {learningForm.category === "risks" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="learning-severity">Risk Severity</Label>
                        <Select value={learningForm.severity} onValueChange={(value) => setLearningForm({ ...learningForm, severity: value })}>
                          <SelectTrigger id="learning-severity">
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Low-Medium">Low-Medium</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Medium-High">Medium-High</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="learning-mitigation">Mitigation Strategies</Label>
                        <Textarea
                          id="learning-mitigation"
                          value={learningForm.mitigation}
                          onChange={(e) => setLearningForm({ ...learningForm, mitigation: e.target.value })}
                          placeholder="How to mitigate this risk"
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  {learningForm.category === "videos" && (
                    <div className="space-y-2">
                      <Label htmlFor="learning-video-url">Video URL (YouTube, Vimeo, etc.)</Label>
                      <Input
                        id="learning-video-url"
                        value={learningForm.videoUrl}
                        onChange={(e) => setLearningForm({ ...learningForm, videoUrl: e.target.value })}
                        placeholder="https://youtube.com/embed/..."
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="learning-user">Select User (Optional)</Label>
                    <Select value={learningForm.userId} onValueChange={(value) => setLearningForm({ ...learningForm, userId: value })}>
                      <SelectTrigger id="learning-user">
                        <SelectValue placeholder="All users or select specific user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.user_id} value={profile.user_id}>
                            {profile.full_name} ({profile.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learning-file">Attachment (PDF, optional)</Label>
                    <Input
                      id="learning-file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setLearningForm({ ...learningForm, file: e.target.files?.[0] || null })}
                    />
                    <p className="text-sm text-muted-foreground">Optional: Attach a PDF document for additional resources</p>
                  </div>

                  <Button type="submit" disabled={uploading} className="w-full">
                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload Learning Content
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <Card className="border-accent/20 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-accent/10 bg-gradient-to-r from-accent/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Video className="h-6 w-6 text-accent" />
                  Upload Video
                </CardTitle>
                <CardDescription>Upload video content for investors</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleVideoUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-title">Title *</Label>
                  <Input
                    id="video-title"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    placeholder="Video title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-desc">Description</Label>
                  <Textarea
                    id="video-desc"
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    placeholder="Video description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-category">Category (Optional)</Label>
                  <Input
                    id="video-category"
                    value={videoForm.category}
                    onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                    placeholder="e.g., Market Analysis, Tutorial"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-user">Select User (Optional)</Label>
                  <Select value={videoForm.userId} onValueChange={(value) => setVideoForm({ ...videoForm, userId: value })}>
                    <SelectTrigger id="video-user">
                      <SelectValue placeholder="All users or select specific user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.full_name} ({profile.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-file">File (MP4) *</Label>
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoForm({ ...videoForm, file: e.target.files?.[0] || null })}
                    required
                  />
                </div>

                <Button type="submit" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Video
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Watchlists Tab */}
          <TabsContent value="watchlists">
            <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <List className="h-6 w-6 text-primary" />
                  Create Public Watchlist
                </CardTitle>
                <CardDescription>Create watchlists that all investors can view</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleWatchlistUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="watchlist-name">Name *</Label>
                  <Input
                    id="watchlist-name"
                    value={watchlistForm.name}
                    onChange={(e) => setWatchlistForm({ ...watchlistForm, name: e.target.value })}
                    placeholder="Watchlist name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="watchlist-desc">Description</Label>
                  <Textarea
                    id="watchlist-desc"
                    value={watchlistForm.description}
                    onChange={(e) => setWatchlistForm({ ...watchlistForm, description: e.target.value })}
                    placeholder="Watchlist description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="watchlist-category">Category (Optional)</Label>
                  <Input
                    id="watchlist-category"
                    value={watchlistForm.category}
                    onChange={(e) => setWatchlistForm({ ...watchlistForm, category: e.target.value })}
                    placeholder="e.g., Technology, Energy"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="watchlist-user">Select User (Optional)</Label>
                  <Select value={watchlistForm.userId} onValueChange={(value) => setWatchlistForm({ ...watchlistForm, userId: value })}>
                    <SelectTrigger id="watchlist-user">
                      <SelectValue placeholder="All users or select specific user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users (Public)</SelectItem>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.full_name} ({profile.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Create Watchlist
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Risk & Compliance Tab */}
          <TabsContent value="risk-compliance">
            <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Shield className="h-6 w-6 text-primary" />
                  Upload Risk & Compliance Content
                </CardTitle>
                <CardDescription>Upload risk analysis and compliance monitoring content for investors</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleRiskComplianceUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="risk-title">Title *</Label>
                  <Input
                    id="risk-title"
                    value={riskComplianceForm.title}
                    onChange={(e) => setRiskComplianceForm({ ...riskComplianceForm, title: e.target.value })}
                    placeholder="Report or analysis title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk-type">Type *</Label>
                  <Select value={riskComplianceForm.type} onValueChange={(value) => setRiskComplianceForm({ ...riskComplianceForm, type: value })}>
                    <SelectTrigger id="risk-type">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stress_test">Stress Test</SelectItem>
                      <SelectItem value="exposure_analysis">Exposure Analysis</SelectItem>
                      <SelectItem value="compliance_check">Compliance Check</SelectItem>
                      <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                      <SelectItem value="regulatory_update">Regulatory Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk-severity">Severity</Label>
                  <Select value={riskComplianceForm.severity} onValueChange={(value) => setRiskComplianceForm({ ...riskComplianceForm, severity: value })}>
                    <SelectTrigger id="risk-severity">
                      <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk-desc">Summary</Label>
                  <Textarea
                    id="risk-desc"
                    value={riskComplianceForm.description}
                    onChange={(e) => setRiskComplianceForm({ ...riskComplianceForm, description: e.target.value })}
                    placeholder="Brief summary of the analysis"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk-content">Full Content *</Label>
                  <Textarea
                    id="risk-content"
                    value={riskComplianceForm.content}
                    onChange={(e) => setRiskComplianceForm({ ...riskComplianceForm, content: e.target.value })}
                    placeholder="Detailed analysis and findings"
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk-user">Select User (Optional)</Label>
                  <Select value={riskComplianceForm.userId} onValueChange={(value) => setRiskComplianceForm({ ...riskComplianceForm, userId: value })}>
                    <SelectTrigger id="risk-user">
                      <SelectValue placeholder="All users or select specific user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.full_name} ({profile.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk-file">Supporting Document (Optional)</Label>
                  <Input
                    id="risk-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setRiskComplianceForm({ ...riskComplianceForm, file: e.target.files?.[0] || null })}
                  />
                </div>

                <Button type="submit" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Content
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <AlertsForm
            form={alertForm}
            setForm={setAlertForm}
            onSubmit={handleAlertUpload}
            uploading={uploading}
          />
        </TabsContent>

        {/* Market Trends Tab */}
        <TabsContent value="market-trends">
          <MarketTrendsUpload />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
