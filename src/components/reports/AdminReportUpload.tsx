import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createReportNotification } from "@/utils/notificationService";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";

interface Profile {
  user_id: string;
  email: string;
  full_name: string;
}

interface AdminReportUploadProps {
  section?: "finance_reports" | "research" | "analysis";
  onUploadSuccess?: () => void;
}

export function AdminReportUpload({ section, onUploadSuccess }: AdminReportUploadProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reportType, setReportType] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [reportSection, setReportSection] = useState<string>(section || "finance_reports");
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const financeReportTypes = [
    "Equity Research Reports",
    "Stock Analyst Reports",
    "Industry / Sector Research Reports",
    "Thematic Research Reports",
    "Economic Outlook Reports",
    "Moat Analysis Reports",
    "Fund Research Reports",
    "ETF Research Reports",
    "Manager Research Reports",
    "Fixed Income Research",
    "Alternative Investment Reports",
    "Credit Ratings Reports",
    "IPO Research Reports",
    "Derivative Strategy Reports"
  ];

  const researchReportTypes = [
    "Research Reports",
    "Market Analysis",
    "Investment Strategy",
    "Portfolio Analysis",
    "Risk Assessment",
    "Performance Reports",
    "ESG Reports"
  ];

  const analysisReportTypes = [
    "Technical Analysis",
    "Fundamental Analysis",
    "Sector Analysis",
    "Macro Analysis",
    "Quantitative Analysis",
    "Valuation Reports"
  ];

  const getReportTypes = () => {
    if (reportSection === "research") return researchReportTypes;
    if (reportSection === "analysis") return analysisReportTypes;
    return financeReportTypes;
  };

  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open]);

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

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setThumbnailFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleUpload = async () => {
    if (!file || !title || !reportType) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `finance/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Upload thumbnail if provided
      let thumbnailUrl: string | null = null;
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split('.').pop();
        const thumbFileName = `thumbnails/${Date.now()}-${Math.random().toString(36).substring(7)}.${thumbExt}`;
        
        const { error: thumbUploadError } = await supabase.storage
          .from('reports')
          .upload(thumbFileName, thumbnailFile);

        if (thumbUploadError) {
          console.error('Thumbnail upload error:', thumbUploadError);
        } else {
          const { data: thumbUrlData } = supabase.storage
            .from('reports')
            .getPublicUrl(thumbFileName);
          thumbnailUrl = thumbUrlData.publicUrl;
        }
      }

      // Determine report category based on section
      let reportCategory: string | null = null;
      if (reportSection === "research") {
        reportCategory = "research";
      } else if (reportSection === "analysis") {
        reportCategory = "analysis";
      }

      const { data: authData } = await supabase.auth.getUser();
      const uploadedBy = authData?.user?.id ?? null;

      const targetUserId = selectedUserId && selectedUserId !== "all" ? selectedUserId : null;
      
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert({
          title,
          description,
          file_path: filePath,
          report_type: reportType,
          platform: "finance",
          uploaded_by: uploadedBy,
          thumbnail_url: thumbnailUrl,
          target_user_id: targetUserId,
          ...(reportCategory && { report_category: reportCategory })
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Grant access to specified user or all users
      if (selectedUserId && selectedUserId !== "all") {
        const { error: accessError } = await supabase
          .from('user_report_access')
          .insert({
            user_id: selectedUserId,
            report_id: reportData.id
          });

        if (accessError) throw accessError;
      } else if (selectedUserId === "all") {
        const accessPayload = profiles.map((profile) => ({
          user_id: profile.user_id,
          report_id: reportData.id,
        }));

        if (accessPayload.length > 0) {
          const { error: accessError } = await supabase
            .from('user_report_access')
            .insert(accessPayload);

          if (accessError) throw accessError;
        }
      }

      // Create notification for users
      await createReportNotification({
        reportId: reportData.id,
        title,
        reportType,
        targetUserId: selectedUserId === "all" ? null : selectedUserId,
      });

      toast.success("Report uploaded successfully");
      setOpen(false);
      resetForm();
      onUploadSuccess?.();
    } catch (error) {
      console.error('Error uploading report:', error);
      const err = error as any;
      const message = err?.message || err?.error_description || err?.details || 'Unknown error';
      toast.error(`Failed to upload report: ${message}`);
    } finally {
      setUploading(false);
    }
  };

   const resetForm = () => {
     setFile(null);
     setThumbnailFile(null);
     setThumbnailPreview(null);
     setTitle("");
     setDescription("");
     setReportType("");
     setSelectedUserId("all");
   };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload New Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">PDF File *</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail Image (Optional)</Label>
            {thumbnailPreview ? (
              <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                <img 
                  src={thumbnailPreview} 
                  alt="Thumbnail preview" 
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={removeThumbnail}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('thumbnail')?.click()}
                  className="gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Add Thumbnail
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              This image will be displayed as the report cover in user listings
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q4 2024 Market Analysis"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the report content..."
              rows={3}
            />
          </div>

          {!section && (
            <div className="space-y-2">
              <Label htmlFor="reportSection">Report Section *</Label>
              <Select value={reportSection} onValueChange={setReportSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance_reports">General Finance Reports</SelectItem>
                  <SelectItem value="research">Research Reports</SelectItem>
                  <SelectItem value="analysis">Analysis Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {getReportTypes().map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId">Assign to User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
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
            <p className="text-xs text-muted-foreground">
              Select a specific user or make it available to all users
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
