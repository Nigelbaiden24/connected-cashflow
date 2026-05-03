import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Search, Copy, Download, ExternalLink, ShieldCheck, Mail, Phone,
  Users, Sparkles, Target, Activity, Linkedin, Filter, History, Zap,
} from "lucide-react";

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
    case "high": return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "medium": return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "low": return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    default: return "bg-slate-700/30 text-slate-400 border-slate-600";
  }
};

const confRank: Record<string, number> = { high: 3, medium: 2, low: 1 };

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
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low" | "saved">("all");

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from("dm_finder_searches")
      .select("id, job_title, company_name, status, results_count, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory(data ?? []);
  }, []);

  useEffect(() => { void loadHistory(); }, [loadHistory]);

  const runSearch = async () => {
    if (!form.job_title.trim() || !form.company_name.trim()) {
      toast.error("Job title and company name are required");
      return;
    }
    setLoading(true);
    setContacts([]);
    try {
      const { data, error } = await supabase.functions.invoke("dm-finder-search", { body: form });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSearchId(data.search_id);
      const { data: rows } = await supabase
        .from("dm_finder_contacts")
        .select("*")
        .eq("search_id", data.search_id);
      // sort: high → low confidence, in-memory (faster + correct)
      const sorted = ((rows ?? []) as DMContact[]).sort(
        (a, b) => (confRank[b.email_confidence ?? ""] ?? 0) - (confRank[a.email_confidence ?? ""] ?? 0),
      );
      setContacts(sorted);
      toast.success(`Found ${sorted.length} contact${sorted.length === 1 ? "" : "s"} from ${data.sources} source${data.sources === 1 ? "" : "s"}`);
      void loadHistory();
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
    const sorted = ((data ?? []) as DMContact[]).sort(
      (a, b) => (confRank[b.email_confidence ?? ""] ?? 0) - (confRank[a.email_confidence ?? ""] ?? 0),
    );
    setContacts(sorted);
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
    // Optimistic
    setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, saved_to_crm: true } : x));
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) { toast.error("Not signed in"); return; }
      const { error } = await supabase.from("crm_contacts").insert([{
        user_id: u.user.id,
        name: c.full_name || "Unknown",
        email: c.email,
        phone: c.phone,
        company: c.company,
        position: c.role,
        notes: `DM Finder import. Source: ${c.email_source_url ?? c.phone_source_url ?? "pattern-generated"}. Relevance: ${c.relevance_tag ?? "n/a"}.`,
      }]);
      if (error) throw error;
      await supabase.from("dm_finder_contacts").update({ saved_to_crm: true }).eq("id", c.id);
      toast.success("Saved to CRM");
    } catch (e: any) {
      setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, saved_to_crm: false } : x));
      toast.error(e.message || "Failed to save");
    }
  };

  const filtered = useMemo(() => {
    if (filter === "all") return contacts;
    if (filter === "saved") return contacts.filter(c => c.saved_to_crm);
    return contacts.filter(c => c.email_confidence === filter);
  }, [contacts, filter]);

  const stats = useMemo(() => ({
    total: contacts.length,
    high: contacts.filter(c => c.email_confidence === "high").length,
    withEmail: contacts.filter(c => !!c.email).length,
    withPhone: contacts.filter(c => !!c.phone).length,
    saved: contacts.filter(c => c.saved_to_crm).length,
  }), [contacts]);

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-fuchsia-950/40 p-6 md:p-8">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-fuchsia-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
              <ShieldCheck className="h-3 w-3" /> UK GDPR & PECR aware
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-fuchsia-100 to-purple-200 bg-clip-text text-transparent">
              DM Finder
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Decision Maker Contact Intelligence Engine. Surfaces only publicly listed professional details — inferred emails are flagged Low confidence and never SMTP-probed.
            </p>
          </div>
        </div>

        {/* KPI strip */}
        <div className="relative grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          {[
            { label: "Contacts", value: stats.total, color: "text-fuchsia-300", icon: Users },
            { label: "High confidence", value: stats.high, color: "text-emerald-300", icon: Target },
            { label: "With email", value: stats.withEmail, color: "text-sky-300", icon: Mail },
            { label: "With phone", value: stats.withPhone, color: "text-amber-300", icon: Phone },
            { label: "Saved to CRM", value: stats.saved, color: "text-purple-300", icon: ShieldCheck },
          ].map(k => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="relative rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-xl p-4 hover:border-fuchsia-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">{k.label}</span>
                  <Icon className={`h-3.5 w-3.5 ${k.color}`} />
                </div>
                <div className={`text-2xl font-bold mt-1.5 ${k.color}`}>{k.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search form */}
      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-fuchsia-400" /> Search Intelligence
          </CardTitle>
          <CardDescription>Provide job title and company. Add optional context for sharper matches.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: "full_name", label: "Full Name", placeholder: "(optional)" },
              { id: "job_title", label: "Job Title / Role *", placeholder: "Head of Procurement" },
              { id: "company_name", label: "Company Name *", placeholder: "Acme Ltd" },
              { id: "location", label: "Location", placeholder: "(optional)" },
              { id: "sector", label: "Sector", placeholder: "(optional)" },
            ].map(f => (
              <div key={f.id} className="space-y-1.5">
                <Label htmlFor={f.id} className="text-slate-300 text-xs uppercase tracking-wider">{f.label}</Label>
                <Input
                  id={f.id}
                  placeholder={f.placeholder}
                  value={(form as any)[f.id]}
                  onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") void runSearch(); }}
                  className="bg-slate-950/70 border-slate-800 text-slate-100 focus-visible:ring-fuchsia-500/50 focus-visible:border-fuchsia-500/40"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={runSearch}
            disabled={loading}
            className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-fuchsia-900/30 border-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Search Intelligence
          </Button>
        </CardContent>
      </Card>

      {contacts.length > 0 && (
        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                Results
                <Badge className="bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30 ml-1">{filtered.length}/{contacts.length}</Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                <span className="text-emerald-400">High</span> = official source · <span className="text-amber-400">Medium</span> = secondary · <span className="text-rose-400">Low</span> = pattern-generated, unverified.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 p-0.5">
                {(["all","high","medium","low","saved"] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setFilter(p)}
                    className={`px-2.5 py-1 text-[11px] rounded-md capitalize transition-colors ${filter === p ? "bg-fuchsia-500/20 text-fuchsia-200" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Button onClick={exportCsv} variant="outline" size="sm" className="border-slate-700 text-slate-200 hover:border-fuchsia-500/40">
                <Download className="h-4 w-4 mr-2" />Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 bg-slate-950/60 hover:bg-slate-950/60">
                    <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider">Name / Role</TableHead>
                    <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider">Email</TableHead>
                    <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider">Phone</TableHead>
                    <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider">Source</TableHead>
                    <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider">Tag</TableHead>
                    <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} className="border-slate-800 hover:bg-fuchsia-500/[0.03] transition-colors">
                      <TableCell className="text-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-fuchsia-500/30 to-purple-500/30 border border-fuchsia-500/20 flex items-center justify-center text-xs font-semibold text-fuchsia-200">
                            {(c.full_name ?? "?").slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{c.full_name || "—"}</div>
                            <div className="text-xs text-slate-400 truncate">{c.role}{c.company ? ` · ${c.company}` : ""}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-slate-500 shrink-0" />
                            <span className="text-slate-200 text-sm truncate max-w-[180px]">{c.email}</span>
                            <Badge variant="outline" className={`${confidenceColor(c.email_confidence)} text-[10px]`}>{c.email_confidence}</Badge>
                            <button onClick={() => copyValue(c.email!)} className="text-slate-500 hover:text-fuchsia-300 transition-colors">
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        ) : <span className="text-slate-600">—</span>}
                      </TableCell>
                      <TableCell>
                        {c.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-slate-500 shrink-0" />
                            <span className="text-slate-200 text-sm">{c.phone}</span>
                            <Badge variant="outline" className={`${confidenceColor(c.phone_confidence)} text-[10px]`}>{c.phone_confidence}</Badge>
                            <button onClick={() => copyValue(c.phone!)} className="text-slate-500 hover:text-fuchsia-300 transition-colors">
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        ) : <span className="text-slate-600">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {c.email_source_url || c.phone_source_url ? (
                            <a href={c.email_source_url ?? c.phone_source_url ?? "#"} target="_blank" rel="noopener noreferrer"
                              className="text-fuchsia-400 hover:text-fuchsia-300 inline-flex items-center gap-1 text-xs">
                              source <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : <span className="text-slate-600 text-xs">inferred</span>}
                          {c.linkedin_url && (
                            <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
                              <Linkedin className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.relevance_tag && <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">{c.relevance_tag}</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" disabled={c.saved_to_crm} onClick={() => saveToCrm(c)}
                          className={`border-slate-700 text-slate-200 ${c.saved_to_crm ? "opacity-60" : "hover:border-emerald-500/40 hover:text-emerald-300"}`}>
                          {c.saved_to_crm ? <ShieldCheck className="h-3 w-3 mr-1" /> : null}
                          {c.saved_to_crm ? "Saved" : "Save to CRM"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow className="border-slate-800">
                      <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                        <Filter className="h-6 w-6 mx-auto mb-2 text-slate-700" />
                        No contacts match the current filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100 text-base flex items-center gap-2">
            <History className="h-4 w-4 text-slate-400" /> Recent searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-slate-500 text-sm">No searches yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {history.map((h) => (
                <button key={h.id} onClick={() => loadSearch(h.id)}
                  className={`group w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border transition-all text-left ${searchId === h.id ? "border-fuchsia-500/50 shadow-lg shadow-fuchsia-900/10" : "border-slate-800 hover:border-fuchsia-500/30"}`}>
                  <div className="min-w-0">
                    <div className="text-slate-100 text-sm font-medium truncate group-hover:text-fuchsia-200 transition-colors">
                      {h.job_title} <span className="text-slate-500">@</span> {h.company_name}
                    </div>
                    <div className="text-xs text-slate-500">{new Date(h.created_at).toLocaleString()}</div>
                  </div>
                  <Badge variant="outline" className="border-slate-700 text-slate-300 shrink-0 ml-2">{h.results_count} results</Badge>
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
