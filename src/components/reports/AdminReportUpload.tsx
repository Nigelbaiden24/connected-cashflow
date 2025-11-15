import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

interface AdminReportUploadProps {
  platform: "finance" | "business";
  onUploadSuccess?: () => void;
}

export function AdminReportUpload({ platform, onUploadSuccess }: AdminReportUploadProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reportType, setReportType] = useState("");
  const [userIds, setUserIds] = useState("");

  const financeReportTypes = [
    "Market Analysis",
    "Portfolio Review",
    "Economic Outlook",
    "Investment Strategy",
    "Risk Assessment",
    "Performance Report"
  ];

  const businessReportTypes = [
    "Industry Benchmarking",
    "Market Trends",
    "Competitive Analysis",
    "Industry Outlook",
    "Performance Metrics",
    "Best Practices"
  ];

  const reportTypes = platform === "finance" ? financeReportTypes : businessReportTypes;

  const handleUpload = async () => {
    if (!file || !title || !reportType) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setUploading(true);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${platform}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Insert report metadata
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert({
          title,
          description,
          file_path: filePath,
          report_type: reportType,
          platform
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Grant access to specified users (comma-separated UUIDs) or all if empty
      if (userIds.trim()) {
        const userIdArray = userIds.split(',').map(id => id.trim()).filter(id => id);
        const accessRecords = userIdArray.map(userId => ({
          user_id: userId,
          report_id: reportData.id
        }));

        const { error: accessError } = await supabase
          .from('user_report_access')
          .insert(accessRecords);

        if (accessError) throw accessError;
      }

      toast.success("Report uploaded successfully");
      setOpen(false);
      resetForm();
      onUploadSuccess?.();
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error("Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setReportType("");
    setUserIds("");
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

          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userIds">User IDs (optional)</Label>
            <Textarea
              id="userIds"
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              placeholder="Comma-separated user UUIDs. Leave empty to manually assign later."
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Specify user UUIDs to grant access, or leave empty to assign manually later.
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
