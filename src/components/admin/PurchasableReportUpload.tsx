import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Trash2, FileText, Loader2, Eye, EyeOff, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface PurchasableReport {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  file_path: string;
  price_cents: number;
  currency: string;
  is_published: boolean;
  download_count: number;
  created_at: string;
}

export function PurchasableReportUpload() {
  const [reports, setReports] = useState<PurchasableReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    file: null as File | null,
    thumbnail: null as File | null,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("purchasable_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data as PurchasableReport[]) || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !formData.title || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      // Upload report file
      const fileExt = formData.file.name.split(".").pop();
      const fileName = `purchasable/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (formData.thumbnail) {
        const thumbExt = formData.thumbnail.name.split(".").pop();
        const thumbName = `thumbnails/${Date.now()}.${thumbExt}`;
        
        const { error: thumbError } = await supabase.storage
          .from("reports")
          .upload(thumbName, formData.thumbnail);

        if (!thumbError) {
          const { data: urlData } = supabase.storage
            .from("reports")
            .getPublicUrl(thumbName);
          thumbnailUrl = urlData.publicUrl;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();

      // Insert report record
      const { error: insertError } = await supabase
        .from("purchasable_reports")
        .insert({
          title: formData.title,
          description: formData.description || null,
          file_path: fileName,
          thumbnail_url: thumbnailUrl,
          price_cents: Math.round(parseFloat(formData.price) * 100),
          currency: "GBP",
          uploaded_by: user?.id,
        });

      if (insertError) throw insertError;

      toast.success("Report uploaded successfully!");
      setFormData({ title: "", description: "", price: "", file: null, thumbnail: null });
      fetchReports();
    } catch (error: any) {
      console.error("Error uploading report:", error);
      toast.error(error.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("purchasable_reports")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Report ${!currentStatus ? "published" : "unpublished"}`);
      fetchReports();
    } catch (error) {
      toast.error("Failed to update report status");
    }
  };

  const deleteReport = async (id: string, filePath: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      await supabase.storage.from("reports").remove([filePath]);
      const { error } = await supabase
        .from("purchasable_reports")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Report deleted");
      fetchReports();
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Purchasable Report
          </CardTitle>
          <CardDescription>
            Upload reports that users can purchase and download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Q4 2024 Market Analysis"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (GBP) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 49.99"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the report content..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="file">Report File (PDF) *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })}
                />
              </div>
            </div>

            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Report
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Reports</CardTitle>
          <CardDescription>Manage your purchasable reports</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No reports uploaded yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {report.thumbnail_url ? (
                        <img
                          src={report.thumbnail_url}
                          alt={report.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>£{(report.price_cents / 100).toFixed(2)}</TableCell>
                    <TableCell>{report.download_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={report.is_published}
                          onCheckedChange={() => togglePublished(report.id, report.is_published)}
                        />
                        <Badge variant={report.is_published ? "default" : "secondary"}>
                          {report.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteReport(report.id, report.file_path)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
