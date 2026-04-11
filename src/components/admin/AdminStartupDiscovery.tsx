import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Rocket, Plus, Trash2, Edit, Loader2, Star } from "lucide-react";

interface StartupForm {
  company_name: string;
  sector: string;
  industry: string;
  founders: string;
  location: string;
  country: string;
  funding_total: string;
  headcount: string;
  founding_year: string;
  crowdfunding_platform: string;
  campaign_url: string;
  lead_score: number;
  website: string;
  description: string;
  prospect_tags: string;
  funding_stage: string;
}

const emptyForm: StartupForm = {
  company_name: "", sector: "", industry: "", founders: "", location: "", country: "UK",
  funding_total: "", headcount: "", founding_year: "", crowdfunding_platform: "", campaign_url: "",
  lead_score: 50, website: "", description: "", prospect_tags: "", funding_stage: "",
};

export function AdminStartupDiscovery() {
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<StartupForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("startup_discovery").select("*").order("created_at", { ascending: false });
    setStartups(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.company_name.trim()) { toast.error("Company name required"); return; }
    setSaving(true);
    const payload = {
      company_name: form.company_name,
      sector: form.sector || null,
      industry: form.industry || null,
      founders: form.founders ? form.founders.split(",").map(f => f.trim()).filter(Boolean) : [],
      location: form.location || null,
      country: form.country || "UK",
      funding_total: form.funding_total ? parseFloat(form.funding_total) : 0,
      headcount: form.headcount ? parseInt(form.headcount) : null,
      founding_year: form.founding_year ? parseInt(form.founding_year) : null,
      crowdfunding_platform: form.crowdfunding_platform || null,
      campaign_url: form.campaign_url || null,
      lead_score: form.lead_score,
      website: form.website || null,
      description: form.description || null,
      prospect_tags: form.prospect_tags ? form.prospect_tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      funding_stage: form.funding_stage || null,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from("startup_discovery").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("startup_discovery").insert(payload));
    }

    if (error) { toast.error("Failed to save: " + error.message); }
    else { toast.success(editId ? "Startup updated" : "Startup added"); setDialogOpen(false); setForm(emptyForm); setEditId(null); fetch(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("startup_discovery").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); fetch(); }
  };

  const startEdit = (s: any) => {
    setForm({
      company_name: s.company_name || "",
      sector: s.sector || "",
      industry: s.industry || "",
      founders: s.founders?.join(", ") || "",
      location: s.location || "",
      country: s.country || "UK",
      funding_total: s.funding_total?.toString() || "",
      headcount: s.headcount?.toString() || "",
      founding_year: s.founding_year?.toString() || "",
      crowdfunding_platform: s.crowdfunding_platform || "",
      campaign_url: s.campaign_url || "",
      lead_score: s.lead_score || 50,
      website: s.website || "",
      description: s.description || "",
      prospect_tags: s.prospect_tags?.join(", ") || "",
      funding_stage: s.funding_stage || "",
    });
    setEditId(s.id);
    setDialogOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Rocket className="h-6 w-6" /> Startup Discovery (Investor)</h2>
          <p className="text-muted-foreground">Manage crowdfunding/startup profiles for FlowPulse Investor</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setForm(emptyForm); setEditId(null); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Startup</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Edit Startup" : "Add Startup"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Company Name *</Label><Input value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Sector</Label>
                <Select value={form.sector} onValueChange={v => setForm(p => ({ ...p, sector: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                  <SelectContent>
                    {["Fintech", "SaaS", "HealthTech", "EdTech", "CleanTech", "PropTech", "AI/ML", "Consumer", "B2B", "Other"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Industry</Label><Input value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Funding Stage</Label>
                <Select value={form.funding_stage} onValueChange={v => setForm(p => ({ ...p, funding_stage: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>
                    {["Pre-Seed", "Seed", "Series A", "Series B", "Growth", "Pre-IPO"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Platform</Label>
                <Select value={form.crowdfunding_platform} onValueChange={v => setForm(p => ({ ...p, crowdfunding_platform: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>
                    {["Seedrs", "Crowdcube", "Republic", "Wefunder", "StartEngine", "Other"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Campaign URL</Label><Input value={form.campaign_url} onChange={e => setForm(p => ({ ...p, campaign_url: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Total Funding (£)</Label><Input type="number" value={form.funding_total} onChange={e => setForm(p => ({ ...p, funding_total: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Headcount</Label><Input type="number" value={form.headcount} onChange={e => setForm(p => ({ ...p, headcount: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Founded Year</Label><Input type="number" value={form.founding_year} onChange={e => setForm(p => ({ ...p, founding_year: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Website</Label><Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} /></div>
              <div className="col-span-2 space-y-2"><Label>Founders (comma-separated)</Label><Input value={form.founders} onChange={e => setForm(p => ({ ...p, founders: e.target.value }))} placeholder="e.g. John Smith, Jane Doe" /></div>
              <div className="col-span-2 space-y-2"><Label>Prospect Tags (comma-separated)</Label><Input value={form.prospect_tags} onChange={e => setForm(p => ({ ...p, prospect_tags: e.target.value }))} placeholder="e.g. B2B, SaaS, Fintech" /></div>
              <div className="col-span-2 space-y-2">
                <Label>Lead Score: <span className={`font-bold ${getScoreColor(form.lead_score)}`}>{form.lead_score}/100</span></Label>
                <Slider value={[form.lead_score]} onValueChange={([v]) => setForm(p => ({ ...p, lead_score: v }))} min={0} max={100} step={1} />
              </div>
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
      ) : startups.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-muted-foreground">No startups yet. Click "Add Startup" to start.</p></Card>
      ) : (
        <div className="grid gap-3">
          {startups.map(s => (
            <Card key={s.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Rocket className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{s.company_name}</p>
                  <div className="flex gap-2 mt-1">
                    {s.crowdfunding_platform && <Badge className="text-xs bg-violet-500/10 text-violet-600">{s.crowdfunding_platform}</Badge>}
                    {s.funding_stage && <Badge variant="outline" className="text-xs">{s.funding_stage}</Badge>}
                    {s.sector && <Badge variant="secondary" className="text-xs">{s.sector}</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className={`text-sm font-bold ${getScoreColor(s.lead_score || 0)}`}>{s.lead_score || 0}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => startEdit(s)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
