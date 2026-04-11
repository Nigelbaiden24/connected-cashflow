import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, Plus, Trash2, Edit, Loader2 } from "lucide-react";

interface CompanyForm {
  company_name: string;
  ticker: string;
  sector: string;
  industry: string;
  location: string;
  country: string;
  revenue_estimate: string;
  employee_count: string;
  ownership_type: string;
  founded_year: string;
  website: string;
  description: string;
  competitors: string;
}

const emptyForm: CompanyForm = {
  company_name: "", ticker: "", sector: "", industry: "", location: "", country: "UK",
  revenue_estimate: "", employee_count: "", ownership_type: "private", founded_year: "",
  website: "", description: "", competitors: "",
};

export function AdminCompanyIntelligence() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("company_intelligence").select("*").order("created_at", { ascending: false });
    setCompanies(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.company_name.trim()) { toast.error("Company name required"); return; }
    setSaving(true);
    const payload = {
      company_name: form.company_name,
      ticker: form.ticker || null,
      sector: form.sector || null,
      industry: form.industry || null,
      location: form.location || null,
      country: form.country || "UK",
      revenue_estimate: form.revenue_estimate ? parseFloat(form.revenue_estimate) : null,
      employee_count: form.employee_count ? parseInt(form.employee_count) : null,
      ownership_type: form.ownership_type || "private",
      founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      website: form.website || null,
      description: form.description || null,
      competitors: form.competitors ? form.competitors.split(",").map(c => c.trim()).filter(Boolean) : [],
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from("company_intelligence").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("company_intelligence").insert(payload));
    }

    if (error) { toast.error("Failed to save: " + error.message); }
    else { toast.success(editId ? "Company updated" : "Company added"); setDialogOpen(false); setForm(emptyForm); setEditId(null); fetch(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("company_intelligence").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); fetch(); }
  };

  const startEdit = (c: any) => {
    setForm({
      company_name: c.company_name || "",
      ticker: c.ticker || "",
      sector: c.sector || "",
      industry: c.industry || "",
      location: c.location || "",
      country: c.country || "UK",
      revenue_estimate: c.revenue_estimate?.toString() || "",
      employee_count: c.employee_count?.toString() || "",
      ownership_type: c.ownership_type || "private",
      founded_year: c.founded_year?.toString() || "",
      website: c.website || "",
      description: c.description || "",
      competitors: c.competitors?.join(", ") || "",
    });
    setEditId(c.id);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6" /> Company Intelligence (Finance)</h2>
          <p className="text-muted-foreground">Manage PitchBook-style company data for FlowPulse Finance</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setForm(emptyForm); setEditId(null); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Company</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Edit Company" : "Add Company"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Company Name *</Label><Input value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Ticker</Label><Input value={form.ticker} onChange={e => setForm(p => ({ ...p, ticker: e.target.value }))} placeholder="e.g. AAPL" /></div>
              <div className="space-y-2"><Label>Sector</Label>
                <Select value={form.sector} onValueChange={v => setForm(p => ({ ...p, sector: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                  <SelectContent>
                    {["Technology", "Financial Services", "Healthcare", "Real Estate", "Energy", "Consumer", "Industrial", "Media", "Telecoms", "Other"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Industry</Label><Input value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Revenue Estimate (£)</Label><Input type="number" value={form.revenue_estimate} onChange={e => setForm(p => ({ ...p, revenue_estimate: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Employee Count</Label><Input type="number" value={form.employee_count} onChange={e => setForm(p => ({ ...p, employee_count: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Ownership Type</Label>
                <Select value={form.ownership_type} onValueChange={v => setForm(p => ({ ...p, ownership_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["private", "public", "pe_backed", "vc_backed", "family_owned"].map(o => <SelectItem key={o} value={o} className="capitalize">{o.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Founded Year</Label><Input type="number" value={form.founded_year} onChange={e => setForm(p => ({ ...p, founded_year: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} /></div>
              <div className="col-span-2 space-y-2"><Label>Website</Label><Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} /></div>
              <div className="col-span-2 space-y-2"><Label>Competitors (comma-separated)</Label><Input value={form.competitors} onChange={e => setForm(p => ({ ...p, competitors: e.target.value }))} /></div>
              <div className="col-span-2 space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editId ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : companies.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-muted-foreground">No companies yet. Click "Add Company" to start.</p></Card>
      ) : (
        <div className="grid gap-3">
          {companies.map(c => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{c.company_name}</p>
                  <div className="flex gap-2 mt-1">
                    {c.sector && <Badge variant="outline" className="text-xs">{c.sector}</Badge>}
                    {c.country && <Badge variant="secondary" className="text-xs">{c.country}</Badge>}
                    <span className="text-xs text-muted-foreground capitalize">{c.ownership_type?.replace("_", " ")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.revenue_estimate && <span className="text-sm font-medium text-primary">£{(c.revenue_estimate / 1e6).toFixed(1)}M</span>}
                <Button variant="ghost" size="icon" onClick={() => startEdit(c)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
