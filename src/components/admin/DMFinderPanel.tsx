import { useState, useEffect, useMemo, useCallback, useTransition } from "react";
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
  Users, Sparkles, Target, Activity, Linkedin, Filter, History, Zap, Building2,
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
    case "high": return "bg-emerald-50 text-emerald-700 border-emerald-400/40 shadow-[0_0_10px_-3px_rgba(16,185,129,0.5)]";
    case "medium": return "bg-amber-50 text-amber-700 border-amber-400/40";
    case "low": return "bg-rose-50 text-rose-700 border-rose-400/40";
    default: return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const confRank: Record<string, number> = { high: 3, medium: 2, low: 1 };

const KpiTile = ({
  label, value, accent, icon: Icon,
}: { label: string; value: React.ReactNode; accent: string; icon: any }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 backdrop-blur-xl p-4 hover:border-slate-200 transition-all">
    <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity ${accent}`} />
    <div className="relative flex items-center justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">{label}</span>
      <Icon className="h-3.5 w-3.5 text-slate-600" />
    </div>
    <div className="relative mt-2 text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
  </div>
);

export function DMFinderPanel() {
  const [form, setForm] = useState({
    full_name: "",
    job_title: "",
    company_name: "",
    location: "",
    sector: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<DMContact[]>([]);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low" | "saved">("all");
  const [, startTransition] = useTransition();

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from("dm_finder_searches")
      .select("id, job_title, company_name, status, results_count, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    startTransition(() => setHistory(data ?? []));
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
      // Run history reload in parallel after the search returns
      const { data, error } = await supabase.functions.invoke("dm-finder-search", { body: form });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSearchId(data.search_id);
      const [{ data: rows }] = await Promise.all([
        supabase.from("dm_finder_contacts").select("*").eq("search_id", data.search_id),
        loadHistory(),
      ]);
      const sorted = ((rows ?? []) as DMContact[]).sort(
        (a, b) => (confRank[b.email_confidence ?? ""] ?? 0) - (confRank[a.email_confidence ?? ""] ?? 0),
      );
      startTransition(() => setContacts(sorted));
      toast.success(`Found ${sorted.length} contact${sorted.length === 1 ? "" : "s"} from ${data.sources} source${data.sources === 1 ? "" : "s"}`);
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
    startTransition(() => setContacts(sorted));
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
      // Fire-and-forget – don't block UI for the secondary status update
      void supabase.from("dm_finder_contacts").update({ saved_to_crm: true }).eq("id", c.id);
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
    <div className="relative space-y-6 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-white p-4 md:p-6 ring-1 ring-slate-200 shadow-2xl text-slate-900">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.08),transparent_60%),linear-gradient(135deg,#ffffff,#f1f5f9)] p-6 md:p-8">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
        <div className="absolute -top-32 left-0 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 right-1/3 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-700">
              <ShieldCheck className="h-3 w-3" /> UK GDPR & PECR aware · public-source intelligence only
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-violet-700 to-cyan-700 bg-clip-text text-transparent">
              DM Finder
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl">
              Decision Maker Contact Intelligence Engine. Surfaces only publicly listed professional details — inferred emails are flagged Low confidence and never SMTP-probed.
            </p>
          </div>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-5 gap-3 mt-7">
          <KpiTile label="Contacts" value={stats.total} accent="bg-violet-500/40" icon={Users} />
          <KpiTile label="High confidence" value={stats.high} accent="bg-emerald-500/40" icon={Target} />
          <KpiTile label="With email" value={stats.withEmail} accent="bg-sky-500/40" icon={Mail} />
          <KpiTile label="With phone" value={stats.withPhone} accent="bg-amber-500/40" icon={Phone} />
          <KpiTile label="Saved to CRM" value={stats.saved} accent="bg-cyan-500/40" icon={ShieldCheck} />
        </div>
      </div>

      {/* Search form */}
      <Card className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-violet-400" /> Search Intelligence
          </CardTitle>
          <CardDescription className="text-slate-600">Provide job title and company. Add optional context for sharper matches.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: "full_name", label: "Full Name", placeholder: "(optional)" },
              { id: "job_title", label: "Job Title / Role *", placeholder: "Head of Procurement" },
              { id: "company_name", label: "Company Name *", placeholder: "Acme Ltd" },
              { id: "website", label: "Website", placeholder: "acme.com (optional)" },
              { id: "location", label: "Location", placeholder: "(optional)" },
              { id: "sector", label: "Sector", placeholder: "(optional)" },
            ].map(f => (
              <div key={f.id} className="space-y-1.5">
                <Label htmlFor={f.id} className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">{f.label}</Label>
                <Input
                  id={f.id}
                  placeholder={f.placeholder}
                  value={(form as any)[f.id]}
                  onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") void runSearch(); }}
                  className="bg-white border-slate-300 text-slate-900 focus-visible:ring-violet-500/40 focus-visible:border-violet-500/60"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={runSearch}
            disabled={loading}
            className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 hover:opacity-95 shadow-[0_8px_32px_-8px_rgba(168,85,247,0.6)] border-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Search Intelligence
          </Button>
        </CardContent>
      </Card>

      {contacts.length > 0 && (
        <Card className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-emerald-400" />
                Results
                <Badge className="bg-violet-50 text-violet-700 border-violet-400/40 ml-1 text-[10px]">{filtered.length}/{contacts.length}</Badge>
              </CardTitle>
              <CardDescription className="mt-1 text-slate-600">
                <span className="text-emerald-400">High</span> = official source · <span className="text-amber-400">Medium</span> = secondary · <span className="text-rose-400">Low</span> = pattern-generated, unverified.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5">
                {(["all","high","medium","low","saved"] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setFilter(p)}
                    className={`px-2.5 py-1 text-[11px] rounded-md capitalize transition-all ${filter === p ? "bg-gradient-to-r from-violet-500/30 to-cyan-500/30 text-violet-700 shadow-inner" : "text-slate-600 hover:text-slate-700"}`}
                  >{p}</button>
                ))}
              </div>
              <Button onClick={exportCsv} variant="outline" size="sm" className="border-slate-200 bg-white text-slate-700 hover:border-violet-400/40 hover:text-violet-700">
                <Download className="h-4 w-4 mr-2" />Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Name / Role</TableHead>
                    <TableHead className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Email</TableHead>
                    <TableHead className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Phone</TableHead>
                    <TableHead className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Source</TableHead>
                    <TableHead className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Tag</TableHead>
                    <TableHead className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} className="border-slate-200 hover:bg-violet-50 transition-colors">
                      <TableCell className="text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-violet-800 shadow-inner">
                            {(c.full_name ?? "?").slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{c.full_name || "—"}</div>
                            <div className="text-xs text-slate-600 truncate flex items-center gap-1">
                              {c.role}{c.company ? <><span className="text-slate-600">·</span><Building2 className="h-3 w-3 text-slate-600" />{c.company}</> : null}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-slate-600 shrink-0" />
                            <span className="text-slate-700 text-sm truncate max-w-[180px]">{c.email}</span>
                            <Badge variant="outline" className={`${confidenceColor(c.email_confidence)} text-[10px] capitalize`}>{c.email_confidence}</Badge>
                            <button onClick={() => copyValue(c.email!)} className="text-slate-600 hover:text-violet-300 transition-colors">
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        ) : <span className="text-slate-600">—</span>}
                      </TableCell>
                      <TableCell>
                        {c.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-slate-600 shrink-0" />
                            <span className="text-slate-700 text-sm">{c.phone}</span>
                            <Badge variant="outline" className={`${confidenceColor(c.phone_confidence)} text-[10px] capitalize`}>{c.phone_confidence}</Badge>
                            <button onClick={() => copyValue(c.phone!)} className="text-slate-600 hover:text-violet-300 transition-colors">
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        ) : <span className="text-slate-600">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {c.email_source_url || c.phone_source_url ? (
                            <a href={c.email_source_url ?? c.phone_source_url ?? "#"} target="_blank" rel="noopener noreferrer"
                              className="text-violet-300 hover:text-violet-700 inline-flex items-center gap-1 text-xs">
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
                        {c.relevance_tag && <Badge variant="outline" className="border-slate-200 bg-slate-900/50 text-slate-600 text-[10px]">{c.relevance_tag}</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" disabled={c.saved_to_crm} onClick={() => saveToCrm(c)}
                          className={`border-slate-200 bg-white text-slate-700 ${c.saved_to_crm ? "opacity-60" : "hover:border-emerald-500/50 hover:text-emerald-700 hover:shadow-[0_4px_12px_-2px_rgba(16,185,129,0.4)]"}`}>
                          {c.saved_to_crm ? <ShieldCheck className="h-3 w-3 mr-1" /> : null}
                          {c.saved_to_crm ? "Saved" : "Save to CRM"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow className="border-slate-200">
                      <TableCell colSpan={6} className="text-center text-slate-600 py-8">
                        <Filter className="h-6 w-6 mx-auto mb-2 text-slate-500" />
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

      <Card className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 text-base flex items-center gap-2">
            <History className="h-4 w-4 text-slate-600" /> Recent searches
            <Badge className="ml-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px]">{history.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-slate-600 text-sm">No searches yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {history.map((h) => (
                <button key={h.id} onClick={() => loadSearch(h.id)}
                  className={`group w-full flex items-center justify-between p-3 rounded-2xl bg-white border transition-all text-left ${searchId === h.id ? "border-violet-400/50 shadow-[0_8px_28px_-12px_rgba(168,85,247,0.5)]" : "border-slate-200 hover:border-violet-400/30"}`}>
                  <div className="min-w-0">
                    <div className="text-slate-900 text-sm font-medium truncate group-hover:text-violet-700 transition-colors">
                      {h.job_title} <span className="text-slate-600">@</span> {h.company_name}
                    </div>
                    <div className="text-[11px] text-slate-600">{new Date(h.created_at).toLocaleString()}</div>
                  </div>
                  <Badge variant="outline" className="border-slate-200 bg-slate-900/50 text-slate-600 shrink-0 ml-2 text-[10px]">{h.results_count} results</Badge>
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
