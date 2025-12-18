import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Trash2, FileText, Loader2, Image, Star, Eye, X, Plus } from "lucide-react";
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
  category: string | null;
  preview_images: string[] | null;
  page_count: number | null;
  featured: boolean | null;
}

const categories = [
  "Market Analysis",
  "Research",
  "Industry Reports",
  "Risk & Compliance",
  "Strategic",
  "General"
];

export function PurchasableReportUpload() {
  const [reports, setReports] = useState<PurchasableReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "General",
    pageCount: "",
    file: null as File | null,
    thumbnail: null as File | null,
    previewImages: [] as File[],
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

      // Upload preview images if provided
      const previewUrls: string[] = [];
      for (const previewFile of formData.previewImages) {
        const prevExt = previewFile.name.split(".").pop();
        const prevName = `previews/${Date.now()}-${Math.random().toString(36).substring(7)}.${prevExt}`;
        
        const { error: prevError } = await supabase.storage
          .from("reports")
          .upload(prevName, previewFile);

        if (!prevError) {
          const { data: urlData } = supabase.storage
            .from("reports")
            .getPublicUrl(prevName);
          previewUrls.push(urlData.publicUrl);
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
          category: formData.category,
          page_count: formData.pageCount ? parseInt(formData.pageCount) : null,
          preview_images: previewUrls.length > 0 ? previewUrls : null,
        });

      if (insertError) throw insertError;

      toast.success("Report uploaded successfully!");
      setFormData({ 
        title: "", 
        description: "", 
        price: "", 
        category: "General",
        pageCount: "",
        file: null, 
        thumbnail: null,
        previewImages: []
      });
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

  const toggleFeatured = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase
        .from("purchasable_reports")
        .update({ featured: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Report ${!currentStatus ? "featured" : "unfeatured"}`);
      fetchReports();
    } catch (error) {
      toast.error("Failed to update featured status");
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

  const handlePreviewImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData(prev => ({
        ...prev,
        previewImages: [...prev.previewImages, ...Array.from(files)]
      }));
    }
  };

  const removePreviewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      previewImages: prev.previewImages.filter((_, i) => i !== index)
    }));
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
            Upload reports that users can purchase and download from the public reports shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Basic Info */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pageCount">Page Count</Label>
                <Input
                  id="pageCount"
                  type="number"
                  min="1"
                  value={formData.pageCount}
                  onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                  placeholder="e.g., 25"
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
                rows={4}
              />
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="file">Report File (PDF) *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  required
                  className="cursor-pointer"
                />
                {formData.file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.file.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })}
                  className="cursor-pointer"
                />
                {formData.thumbnail && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.thumbnail.name}
                  </p>
                )}
              </div>
            </div>

            {/* Preview Images */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Page Preview Images (optional)
              </Label>
              <p className="text-sm text-muted-foreground">
                Upload screenshots of report pages to show customers a preview before purchase
              </p>
              
              <div className="flex flex-wrap gap-3">
                {formData.previewImages.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <div className="w-24 h-32 bg-muted rounded-lg flex items-center justify-center text-xs text-center p-2 border">
                      {file.name.slice(0, 15)}...
                    </div>
                    <button
                      type="button"
                      onClick={() => removePreviewImage(idx)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                <label className="w-24 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Add Page</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePreviewImageAdd}
                    className="hidden"
                  />
                </label>
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
          <CardDescription>Manage your purchasable reports - toggle publish status, feature reports, or delete them</CardDescription>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-center">Downloads</TableHead>
                    <TableHead className="text-center">Featured</TableHead>
                    <TableHead className="text-center">Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">{report.title}</p>
                          {report.page_count && (
                            <p className="text-xs text-muted-foreground">{report.page_count} pages</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.category || "General"}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        £{(report.price_cents / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">{report.download_count}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={report.featured || false}
                            onCheckedChange={() => toggleFeatured(report.id, report.featured)}
                          />
                          {report.featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={report.is_published}
                            onCheckedChange={() => togglePublished(report.id, report.is_published)}
                          />
                          <Badge variant={report.is_published ? "default" : "secondary"}>
                            {report.is_published ? "Live" : "Draft"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteReport(report.id, report.file_path)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}