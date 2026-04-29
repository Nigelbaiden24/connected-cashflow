import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Copy, Download, ExternalLink, ShieldCheck, Mail, Phone } from "lucide-react";

interface DMContact {
  id: string;
  full_name: string | null;
  role: string | null;
  company: string | null;
  email: string | null;
  email_confidence: "high" | "medium" | "low" | null;
  email_source_url: string | null;
  phone: string | null;
  phone_confidence: "high" | "medium" | "low" | null;
  phone_source_url: string | null;
  linkedin_url: string | null;
  relevance_tag: string | null;
  is_inferred: boolean;
  saved_to_crm: boolean;
}

const confidenceColor = (c: string | null) => {
  switch (c) {
    case "high": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    case "medium": return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    case "low": return "bg-rose-500/20 text-rose-300 border-rose-500/40";
    default: return "bg-slate-700/40 text-slate-400 border-slate-600";
  }
};

export function DMFinderPanel() {
  const [form, setForm] = useState({
    full_name: "",
    job_title: "",
    company_name: "",
    location: "",
    sector: "",
  });
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<DMContact[]>([]);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from("dm_finder_searches")
      .select("id, job_title, company_name, status, results_count, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory(data ?? []);
  };

  useEffect(() => { loadHistory(); }, []);

  const runSearch = async () => {
    if (!form.job_title.trim() || !form.company_name.trim()) {
      toast.error("Job title and company name are required");
      return;
    }
    setLoading(true);
    setContacts([]);
    try {
      const { data, error } = await supabase.functions.invoke("dm-finder-search", {
        body: form,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSearchId(data.search_id);
      // Load persisted contacts (so we get IDs)
      const { data: rows } = await supabase
        .from("dm_finder_contacts")
        .select("*")
        .eq("search_id", data.search_id)
        .order("email_confidence", { ascending: true });
      setContacts((rows ?? []) as DMContact[]);
      toast.success(`Found ${rows?.length ?? 0} contact${rows?.length === 1 ? "" : "s"} from ${data.sources} source${data.sources === 1 ? "" : "s"}`);
      loadHistory();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const loadSearch = async (id: string) => {
    setSearchId(id);
    const { data } = await supabase.from("dm_finder_contacts").select("*").eq("search_id", id);
    setContacts((data ?? []) as DMContact[]);
  };

  const copyValue = (v: string) => {
    navigator.clipboard.writeText(v);
    toast.success("Copied");
  };

  const exportCsv = () => {
    if (!contacts.length) return;
    const headers = ["Name","Role","Company","Email","Email Confidence","Phone","Phone Confidence","LinkedIn","Source URL","Relevance"];
    const rows = contacts.map((c) => [
      c.full_name ?? "", c.role ?? "", c.company ?? "",
      c.email ?? "", c.email_confidence ?? "",
      c.phone ?? "", c.phone_confidence ?? "",
      c.linkedin_url ?? "", c.email_source_url ?? c.phone_source_url ?? "",
      c.relevance_tag ?? "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dm-finder-${searchId ?? Date.now()}.csv`;
    a.click();
  };

  const saveToCrm = async (c: DMContact) => {
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return;
      const { error } = await supabase.from("crm_contacts").insert([{
        user_id: u.user.id,
        first_name: (c.full_name || "").split(/\s+/)[0] || "Unknown",
        last_name: (c.full_name || "").split(/\s+/).slice(1).join(" ") || "",
        email: c.email,
        phone: c.phone,
        company: c.company,
        position: c.role,
        notes: `DM Finder import. Source: ${c.email_source_url ?? c.phone_source_url ?? "pattern-generated"}. Relevance: ${c.relevance_tag ?? "n/a"}.`,
      }]);
      if (error) throw error;
      await supabase.from("dm_finder_contacts").update({ saved_to_crm: true }).eq("id", c.id);
      setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, saved_to_crm: true } : x));
      toast.success("Saved to CRM");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">DM Finder</h2>
        <p className="text-slate-400 mt-1">Decision Maker Contact Intelligence Engine — UK GDPR & PECR aware.</p>
      </div>

      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Search Intelligence</CardTitle>
          <CardDescription>Only publicly listed professional details are returned. Inferred emails are flagged Low confidence.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="full_name" className="text-slate-300">Full Name</Label>
              <Input id="full_name" placeholder="(optional)" value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="bg-slate-950 border-slate-700 text-white" />
            </div>
            <div>
              <Label htmlFor="job_title" className="text-slate-300">Job Title / Role *</Label>
              <Input id="job_title" placeholder="Head of Procurement" value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                className="bg-slate-950 border-slate-700 text-white" />
            </div>
            <div>
              <Label htmlFor="company_name" className="text-slate-300">Company Name *</Label>
              <Input id="company_name" placeholder="Acme Ltd" value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="bg-slate-950 border-slate-700 text-white" />
            </div>
            <div>
              <Label htmlFor="location" className="text-slate-300">Location</Label>
              <Input id="location" placeholder="(optional)" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="bg-slate-950 border-slate-700 text-white" />
            </div>
            <div>
              <Label htmlFor="sector" className="text-slate-300">Sector</Label>
              <Input id="sector" placeholder="(optional)" value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                className="bg-slate-950 border-slate-700 text-white" />
            </div>
          </div>
          <Button onClick={runSearch} disabled={loading}
            className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:opacity-90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Search Intelligence
          </Button>
        </CardContent>
      </Card>

      {contacts.length > 0 && (
        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Results ({contacts.length})</CardTitle>
              <CardDescription>High = found on official source. Medium = secondary source. Low = pattern-generated, unverified.</CardDescription>
            </div>
            <Button onClick={exportCsv} variant="outline" size="sm" className="border-slate-700 text-slate-200">
              <Download className="h-4 w-4 mr-2" />Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Name / Role</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Phone</TableHead>
                  <TableHead className="text-slate-400">Source</TableHead>
                  <TableHead className="text-slate-400">Tag</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c.id} className="border-slate-800">
                    <TableCell className="text-white">
                      <div className="font-medium">{c.full_name || "—"}</div>
                      <div className="text-xs text-slate-400">{c.role}{c.company ? ` · ${c.company}` : ""}</div>
                    </TableCell>
                    <TableCell>
                      {c.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-slate-500" />
                          <span className="text-slate-200 text-sm">{c.email}</span>
                          <Badge variant="outline" className={confidenceColor(c.email_confidence)}>{c.email_confidence}</Badge>
                          <button onClick={() => copyValue(c.email!)} className="text-slate-500 hover:text-white">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      ) : <span className="text-slate-600">—</span>}
                    </TableCell>
                    <TableCell>
                      {c.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-slate-500" />
                          <span className="text-slate-200 text-sm">{c.phone}</span>
                          <Badge variant="outline" className={confidenceColor(c.phone_confidence)}>{c.phone_confidence}</Badge>
                          <button onClick={() => copyValue(c.phone!)} className="text-slate-500 hover:text-white">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      ) : <span className="text-slate-600">—</span>}
                    </TableCell>
                    <TableCell>
                      {c.email_source_url || c.phone_source_url ? (
                        <a href={c.email_source_url ?? c.phone_source_url ?? "#"} target="_blank" rel="noopener noreferrer"
                          className="text-fuchsia-400 hover:text-fuchsia-300 inline-flex items-center gap-1 text-xs">
                          source <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : <span className="text-slate-600 text-xs">inferred</span>}
                    </TableCell>
                    <TableCell>
                      {c.relevance_tag && <Badge variant="outline" className="border-slate-700 text-slate-300">{c.relevance_tag}</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" disabled={c.saved_to_crm} onClick={() => saveToCrm(c)}
                        className="border-slate-700 text-slate-200">
                        {c.saved_to_crm ? <ShieldCheck className="h-3 w-3 mr-1" /> : null}
                        {c.saved_to_crm ? "Saved" : "Save to CRM"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Recent searches</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-slate-500 text-sm">No searches yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <button key={h.id} onClick={() => loadSearch(h.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-fuchsia-500/40 transition">
                  <div className="text-left">
                    <div className="text-white text-sm font-medium">{h.job_title} @ {h.company_name}</div>
                    <div className="text-xs text-slate-500">{new Date(h.created_at).toLocaleString()}</div>
                  </div>
                  <Badge variant="outline" className="border-slate-700 text-slate-300">{h.results_count} results</Badge>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-600">
        Compliance: only publicly listed business contact details are surfaced. Inferred emails are flagged Low confidence and never SMTP-probed. All source URLs are logged for transparency under UK GDPR & PECR.
      </p>
    </div>
  );
}
