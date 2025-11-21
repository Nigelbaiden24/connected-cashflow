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
import { Upload, FileText, Newspaper, TrendingUp, BookOpen, Video, List, Loader2 } from "lucide-react";

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
  const [newsletterForm, setNewsletterForm] = useState({ title: "", description: "", publishDate: "", file: null as File | null });
  const [portfolioForm, setPortfolioForm] = useState({ title: "", description: "", file: null as File | null });
  const [commentaryForm, setCommentaryForm] = useState({ title: "", description: "", file: null as File | null });
  const [learningForm, setLearningForm] = useState({ title: "", description: "", category: "", file: null as File | null });
  const [videoForm, setVideoForm] = useState({ title: "", description: "", category: "", file: null as File | null });
  const [watchlistForm, setWatchlistForm] = useState({ name: "", description: "", category: "", file: null as File | null });

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
      });

      if (error) throw error;

      toast.success("Newsletter uploaded successfully!");
      setNewsletterForm({ title: "", description: "", publishDate: "", file: null });
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
      });

      if (error) throw error;

      toast.success("Model portfolio uploaded successfully!");
      setPortfolioForm({ title: "", description: "", file: null });
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
      });

      if (error) throw error;

      toast.success("Market commentary uploaded successfully!");
      setCommentaryForm({ title: "", description: "", file: null });
    } catch (error: any) {
      console.error("Error uploading commentary:", error);
      toast.error(error.message || "Failed to upload commentary");
    } finally {
      setUploading(false);
    }
  };

  const handleLearningUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningForm.file || !learningForm.title || !learningForm.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      const filePath = await uploadFile("learning", learningForm.file);

      const { error } = await supabase.from("learning_content").insert({
        title: learningForm.title,
        content: learningForm.description,
        file_path: filePath,
        category: learningForm.category,
        is_published: true,
      });

      if (error) throw error;

      toast.success("Learning material uploaded successfully!");
      setLearningForm({ title: "", description: "", category: "", file: null });
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
      });

      if (error) throw error;

      toast.success("Video uploaded successfully!");
      setVideoForm({ title: "", description: "", category: "", file: null });
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
        is_public: true,
        created_by_admin: true,
      });

      if (error) throw error;

      toast.success("Watchlist created successfully!");
      setWatchlistForm({ name: "", description: "", category: "", file: null });
    } catch (error: any) {
      console.error("Error creating watchlist:", error);
      toast.error(error.message || "Failed to create watchlist");
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Upload and manage investor platform content</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/investor/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto">
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="newsletters">
            <Newspaper className="h-4 w-4 mr-2" />
            Newsletters
          </TabsTrigger>
          <TabsTrigger value="portfolios">
            <TrendingUp className="h-4 w-4 mr-2" />
            Portfolios
          </TabsTrigger>
          <TabsTrigger value="commentary">
            <FileText className="h-4 w-4 mr-2" />
            Commentary
          </TabsTrigger>
          <TabsTrigger value="learning">
            <BookOpen className="h-4 w-4 mr-2" />
            Learning
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="watchlists">
            <List className="h-4 w-4 mr-2" />
            Watchlists
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Upload Report</CardTitle>
              <CardDescription>Upload research reports for specific users</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReportUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-title">Title *</Label>
                  <Input
                    id="report-title"
                    value={reportForm.title}
                    onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    placeholder="Report title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-desc">Description</Label>
                  <Textarea
                    id="report-desc"
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Report description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-user">Select User *</Label>
                  <Select value={reportForm.userId} onValueChange={(value) => setReportForm({ ...reportForm, userId: value })}>
                    <SelectTrigger id="report-user">
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.full_name} ({profile.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-file">File (PDF) *</Label>
                  <Input
                    id="report-file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setReportForm({ ...reportForm, file: e.target.files?.[0] || null })}
                    required
                  />
                </div>

                <Button type="submit" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Report
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Newsletters Tab */}
        <TabsContent value="newsletters">
          <Card>
            <CardHeader>
              <CardTitle>Upload Newsletter</CardTitle>
              <CardDescription>Upload newsletters for all investors</CardDescription>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Upload Model Portfolio</CardTitle>
              <CardDescription>Upload model portfolios for investors to view</CardDescription>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Upload Market Commentary</CardTitle>
              <CardDescription>Upload market analysis and commentary</CardDescription>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Upload Learning Material</CardTitle>
              <CardDescription>Upload educational content for the learning hub</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLearningUpload} className="space-y-4">
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
                  <Label htmlFor="learning-desc">Description</Label>
                  <Textarea
                    id="learning-desc"
                    value={learningForm.description}
                    onChange={(e) => setLearningForm({ ...learningForm, description: e.target.value })}
                    placeholder="Content description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learning-category">Category *</Label>
                  <Select value={learningForm.category} onValueChange={(value) => setLearningForm({ ...learningForm, category: value })}>
                    <SelectTrigger id="learning-category">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guides">Guides</SelectItem>
                      <SelectItem value="sectors">Sectors</SelectItem>
                      <SelectItem value="risks">Risks</SelectItem>
                      <SelectItem value="tax">Tax</SelectItem>
                      <SelectItem value="videos">Videos</SelectItem>
                      <SelectItem value="glossary">Glossary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learning-file">File (PDF) *</Label>
                  <Input
                    id="learning-file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setLearningForm({ ...learningForm, file: e.target.files?.[0] || null })}
                    required
                  />
                </div>

                <Button type="submit" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Learning Material
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>Upload video content for investors</CardDescription>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Create Public Watchlist</CardTitle>
              <CardDescription>Create watchlists that all investors can view</CardDescription>
            </CardHeader>
            <CardContent>
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

                <Button type="submit" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Create Watchlist
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
