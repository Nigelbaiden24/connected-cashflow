import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Opportunity {
  id: string;
  ref_number: string;
  title: string;
  short_description: string;
  industry: string;
  location: string;
  business_description: string | null;
  business_highlights: string[] | null;
  financial_summary: string | null;
  industry_overview: string | null;
  team_overview: string | null;
  image_url: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export function OpportunitiesManagement() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  
  const [form, setForm] = useState({
    refNumber: "",
    title: "",
    shortDescription: "",
    industry: "",
    location: "",
    businessDescription: "",
    businessHighlights: "",
    financialSummary: "",
    industryOverview: "",
    teamOverview: "",
    imageUrl: "",
    status: "active",
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error: any) {
      console.error("Error fetching opportunities:", error);
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.refNumber || !form.title || !form.shortDescription || !form.industry || !form.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      // Parse business highlights
      const businessHighlights = form.businessHighlights 
        ? form.businessHighlights.split(",").map(h => h.trim()).filter(Boolean) 
        : null;

      const opportunityData = {
        ref_number: form.refNumber,
        title: form.title,
        short_description: form.shortDescription,
        industry: form.industry,
        location: form.location,
        business_description: form.businessDescription || null,
        business_highlights: businessHighlights,
        financial_summary: form.financialSummary || null,
        industry_overview: form.industryOverview || null,
        team_overview: form.teamOverview || null,
        image_url: form.imageUrl || null,
        status: form.status,
      };

      if (editingOpportunity) {
        const { error } = await supabase
          .from("opportunities")
          .update(opportunityData)
          .eq("id", editingOpportunity.id);

        if (error) throw error;
        toast.success("Opportunity updated successfully!");
      } else {
        const { error } = await supabase
          .from("opportunities")
          .insert([opportunityData]);

        if (error) throw error;
        toast.success("Opportunity created successfully!");
      }

      resetForm();
      setIsDialogOpen(false);
      fetchOpportunities();
    } catch (error: any) {
      console.error("Error saving opportunity:", error);
      toast.error(error.message || "Failed to save opportunity");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setForm({
      refNumber: opportunity.ref_number,
      title: opportunity.title,
      shortDescription: opportunity.short_description,
      industry: opportunity.industry,
      location: opportunity.location,
      businessDescription: opportunity.business_description || "",
      businessHighlights: opportunity.business_highlights?.join(", ") || "",
      financialSummary: opportunity.financial_summary || "",
      industryOverview: opportunity.industry_overview || "",
      teamOverview: opportunity.team_overview || "",
      imageUrl: opportunity.image_url || "",
      status: opportunity.status || "active",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;

    try {
      const { error } = await supabase
        .from("opportunities")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Opportunity deleted successfully!");
      fetchOpportunities();
    } catch (error: any) {
      console.error("Error deleting opportunity:", error);
      toast.error("Failed to delete opportunity");
    }
  };

  const resetForm = () => {
    setForm({
      refNumber: "",
      title: "",
      shortDescription: "",
      industry: "",
      location: "",
      businessDescription: "",
      businessHighlights: "",
      financialSummary: "",
      industryOverview: "",
      teamOverview: "",
      imageUrl: "",
      status: "active",
    });
    setEditingOpportunity(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Investment Opportunities</CardTitle>
            <CardDescription>
              Manage investment opportunities visible to FlowPulse Investor users
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingOpportunity ? "Edit" : "Add"} Opportunity</DialogTitle>
                <DialogDescription>
                  Fill in the details for the investment opportunity
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="refNumber">Reference Number *</Label>
                    <Input
                      id="refNumber"
                      value={form.refNumber}
                      onChange={(e) => setForm({ ...form, refNumber: e.target.value })}
                      placeholder="INV-2024-001"
                      required
                      disabled={uploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) => setForm({ ...form, status: value })}
                      disabled={uploading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Sustainable Energy Fund"
                    required
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    placeholder="Brief overview of the opportunity"
                    rows={2}
                    required
                    disabled={uploading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Input
                      id="industry"
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      placeholder="Technology, Healthcare, etc."
                      required
                      disabled={uploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="London, UK"
                      required
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea
                    id="businessDescription"
                    value={form.businessDescription}
                    onChange={(e) => setForm({ ...form, businessDescription: e.target.value })}
                    placeholder="Detailed description of the business"
                    rows={4}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessHighlights">Business Highlights (comma-separated)</Label>
                  <Textarea
                    id="businessHighlights"
                    value={form.businessHighlights}
                    onChange={(e) => setForm({ ...form, businessHighlights: e.target.value })}
                    placeholder="Strong market position, Experienced team, Proven track record"
                    rows={2}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financialSummary">Financial Summary</Label>
                  <Textarea
                    id="financialSummary"
                    value={form.financialSummary}
                    onChange={(e) => setForm({ ...form, financialSummary: e.target.value })}
                    placeholder="Key financial metrics and projections"
                    rows={3}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industryOverview">Industry Overview</Label>
                  <Textarea
                    id="industryOverview"
                    value={form.industryOverview}
                    onChange={(e) => setForm({ ...form, industryOverview: e.target.value })}
                    placeholder="Overview of the industry landscape"
                    rows={3}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamOverview">Team Overview</Label>
                  <Textarea
                    id="teamOverview"
                    value={form.teamOverview}
                    onChange={(e) => setForm({ ...form, teamOverview: e.target.value })}
                    placeholder="Information about the management team"
                    rows={3}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                    disabled={uploading}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingOpportunity ? "Update" : "Create"} Opportunity
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No opportunities created yet
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-mono text-sm">{opportunity.ref_number}</TableCell>
                  <TableCell className="font-medium">{opportunity.title}</TableCell>
                  <TableCell>{opportunity.industry}</TableCell>
                  <TableCell>{opportunity.location}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      opportunity.status === 'active' ? 'bg-green-100 text-green-800' :
                      opportunity.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {opportunity.status || 'active'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(opportunity)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(opportunity.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
