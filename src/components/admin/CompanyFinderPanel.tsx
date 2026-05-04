import { useState, useEffect, useMemo, useCallback, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Download, ExternalLink, ShieldCheck, Sparkles, Target, Activity,
  Filter, History, Zap, Building2, Globe, Layers, MapPin,
} from "lucide-react";

interface CompanyResult {
  id: string;
  company_name: string;
  website: string | null;
  country: string | null;
  sector: string | null;
  tier: string | null;
  role: string | null;
  description: string | null;
  key_signals: string | null;
  source_url: string | null;
  confidence: "high" | "medium" | "low" | null;
  relevance_tag: string | null;
  saved_to_crm: boolean;
}

const confidenceColor = (c: string | null) => {
  switch (c) {
    case "high": return "bg-emerald-50 text-emerald-700 border-emerald-400/40";
    case "medium": return "bg-amber-50 text-amber-700 border-amber-400/40";
    case "low": return "bg-rose-50 text-rose-700 border-rose-400/40";
    default: return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const tierColor = (t: string | null) => {
  if (!t) return "bg-slate-100 text-slate-600 border-slate-200";
  if (/oem/i.test(t)) return "bg-violet-50 text-violet-700 border-violet-400/40";
  if (/tier ?1/i.test(t)) return "bg-cyan-50 text-cyan-700 border-cyan-400/40";
  if (/tier ?2/i.test(t)) return "bg-sky-50 text-sky-700 border-sky-400/40";
  if (/tier ?3/i.test(t)) return "bg-indigo-50 text-indigo-700 border-indigo-400/40";
  return "bg-slate-100 text-slate-600 border-slate-200";
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

export function CompanyFinderPanel() {
  const [form, setForm] = useState({
    sector: "",
    sub_criteria: "",
    location: "",
    brief: "",
  });
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyResult[]>([]);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low" | "saved">("all");
  const [, startTransition] = useTransition();

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from("company_finder_searches")
      .select("id, sector, sub_criteria, status, results_count, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    startTransition(() => setHistory(data ?? []));
  }, []);

  useEffect(() => { void loadHistory(); }, [loadHistory]);

  const runSearch = async () => {
    if (!form.sector.trim()) {
      toast.error("Sector is required");
      return;
    }
    setLoading(true);
    setCompanies([]);
    setSearchId(null);
    try {
      const { data, error } = await supabase.functions.invoke("company-finder-search", { body: form });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const sid = data.search_id as string;
      setSearchId(sid);
      toast.info("Elite sector deep-dive running — scanning sources & extracting companies…");

      // Poll for completion (search runs in background via EdgeRuntime.waitUntil)
      const started = Date.now();
      const maxMs = 8 * 60 * 1000; // 8 minutes safety cap (elite multi-chunk extraction)
      let finalStatus: string | null = null;
      while (Date.now() - started < maxMs) {
        await new Promise((r) => setTimeout(r, 2500));
        const { data: row } = await supabase
          .from("company_finder_searches")
          .select("status, results_count")
          .eq("id", sid)
          .maybeSingle();
        if (row?.status === "completed" || row?.status === "failed") {
          finalStatus = row.status;
          break;
        }
      }

      if (finalStatus === "failed") throw new Error("Search failed — check edge function logs");
      if (!finalStatus) throw new Error("Search timed out — try a more focused brief");

      const { data: rows } = await supabase
        .from("company_finder_results")
        .select("*")
        .eq("search_id", sid);
      const sorted = ((rows ?? []) as CompanyResult[]).sort(
        (a, b) => (confRank[b.confidence ?? ""] ?? 0) - (confRank[a.confidence ?? ""] ?? 0),
      );
      startTransition(() => setCompanies(sorted));
      void loadHistory();
      toast.success(`Found ${sorted.length} compan${sorted.length === 1 ? "y" : "ies"}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const loadSearch = async (id: string) => {
    setSearchId(id);
    const { data } = await supabase.from("company_finder_results").select("*").eq("search_id", id);
    const sorted = ((data ?? []) as CompanyResult[]).sort(
      (a, b) => (confRank[b.confidence ?? ""] ?? 0) - (confRank[a.confidence ?? ""] ?? 0),
    );
    startTransition(() => setCompanies(sorted));
  };

  const exportCsv = () => {
    if (!companies.length) return;
    const headers = ["Company","Website","Country","Sector","Tier","Role","Description","Key Signals","Source","Confidence"];
    const rows = companies.map((c) => [
      c.company_name, c.website ?? "", c.country ?? "", c.sector ?? "", c.tier ?? "",
      c.role ?? "", c.description ?? "", c.key_signals ?? "", c.source_url ?? "", c.confidence ?? "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `company-finder-${searchId ?? Date.now()}.csv`;
    a.click();
  };

  const saveToCrm = async (c: CompanyResult) => {
    setCompanies((prev) => prev.map((x) => x.id === c.id ? { ...x, saved_to_crm: true } : x));
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) { toast.error("Not signed in"); return; }
      const { error } = await supabase.from("crm_contacts").insert([{
        user_id: u.user.id,
        name: c.company_name,
        company: c.company_name,
        notes: `Company Finder import. ${c.role ?? ""} ${c.tier ? `(${c.tier})` : ""}. ${c.description ?? ""} Source: ${c.source_url ?? "n/a"}.`.trim(),
      }]);
      if (error) throw error;
      void supabase.from("company_finder_results").update({ saved_to_crm: true }).eq("id", c.id);
      toast.success("Saved to CRM");
    } catch (e: any) {
      setCompanies((prev) => prev.map((x) => x.id === c.id ? { ...x, saved_to_crm: false } : x));
      toast.error(e.message || "Failed to save");
    }
  };

  const filtered = useMemo(() => {
    if (filter === "all") return companies;
    if (filter === "saved") return companies.filter(c => c.saved_to_crm);
    return companies.filter(c => c.confidence === filter);
  }, [companies, filter]);

  const stats = useMemo(() => ({
    total: companies.length,
    high: companies.filter(c => c.confidence === "high").length,
    withSite: companies.filter(c => !!c.website).length,
    tiered: companies.filter(c => !!c.tier).length,
    saved: companies.filter(c => c.saved_to_crm).length,
  }), [companies]);

  return (
    <div className="relative space-y-6 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-white p-4 md:p-6 ring-1 ring-slate-200 shadow-2xl text-slate-900">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.08),transparent_60%),linear-gradient(135deg,#ffffff,#f1f5f9)] p-6 md:p-8">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <div className="absolute -top-32 right-0 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] text-cyan-700">
            <ShieldCheck className="h-3 w-3" /> Sector Deep-Dive · Public-source company intelligence
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-cyan-700 to-violet-700 bg-clip-text text-transparent">
            Company Finder
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Map entire sectors with elite logic — discover OEMs, Tier 1/2/3 suppliers, distributors, niche specialists.
            Use the brief box for surgical targeting (e.g. "automotive companies supplying OEMs Tier 1, Tier 2 and Tier 3").
          </p>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-5 gap-3 mt-7">
          <KpiTile label="Companies" value={stats.total} accent="bg-cyan-500/40" icon={Building2} />
          <KpiTile label="High confidence" value={stats.high} accent="bg-emerald-500/40" icon={Target} />
          <KpiTile label="With website" value={stats.withSite} accent="bg-sky-500/40" icon={Globe} />
          <KpiTile label="Tiered" value={stats.tiered} accent="bg-violet-500/40" icon={Layers} />
          <KpiTile label="Saved to CRM" value={stats.saved} accent="bg-amber-500/40" icon={ShieldCheck} />
        </div>
      </div>

      {/* Search form */}
      <Card className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-cyan-400" /> Sector Intelligence Brief
          </CardTitle>
          <CardDescription className="text-slate-600">
            Sector is required. Use the optional <strong className="text-cyan-700">brief</strong> for elite logic — describe exactly what you're hunting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sector" className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Sector *</Label>
              <Input
                id="sector"
                placeholder="Automotive, Aerospace, Fintech…"
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                className="bg-white border-slate-300 text-slate-900 focus-visible:ring-cyan-500/40 focus-visible:border-cyan-500/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sub_criteria" className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Sub-criteria</Label>
              <Input
                id="sub_criteria"
                placeholder="Tier 1 suppliers, EV batteries…"
                value={form.sub_criteria}
                onChange={(e) => setForm({ ...form, sub_criteria: e.target.value })}
                className="bg-white border-slate-300 text-slate-900 focus-visible:ring-cyan-500/40 focus-visible:border-cyan-500/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Location</Label>
              <Input
                id="location"
                placeholder="UK, Europe, Germany…"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="bg-white border-slate-300 text-slate-900 focus-visible:ring-cyan-500/40 focus-visible:border-cyan-500/60"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brief" className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3 text-cyan-400" /> Detailed Brief (Elite Targeting)
            </Label>
            <Textarea
              id="brief"
              placeholder="e.g. companies within the automotive sector that supply OEMs Tier 1, Tier 2 and Tier 3 — focus on EV powertrain and battery cell manufacturers in Europe with revenues above £50m"
              value={form.brief}
              onChange={(e) => setForm({ ...form, brief: e.target.value })}
              rows={3}
              className="bg-white border-slate-300 text-slate-900 focus-visible:ring-cyan-500/40 focus-visible:border-cyan-500/60 resize-none"
            />
          </div>
          <Button
            onClick={runSearch}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 hover:opacity-95 shadow-[0_8px_32px_-8px_rgba(34,211,238,0.6)] border-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Run Sector Deep-Dive
          </Button>
        </CardContent>
      </Card>

      {companies.length > 0 && (
        <Card className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-emerald-400" />
                Results
                <Badge className="bg-cyan-50 text-cyan-700 border-cyan-400/40 ml-1 text-[10px]">{filtered.length}/{companies.length}</Badge>
              </CardTitle>
              <CardDescription className="mt-1 text-slate-600">
                <span className="text-emerald-400">High</span> = explicitly listed · <span className="text-amber-400">Medium</span> = inferred · <span className="text-rose-400">Low</span> = speculative.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5">
                {(["all","high","medium","low","saved"] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setFilter(p)}
                    className={`px-2.5 py-1 text-[11px] rounded-md capitalize transition-all ${filter === p ? "bg-gradient-to-r from-cyan-500/30 to-violet-500/30 text-cyan-700 shadow-inner" : "text-slate-600 hover:text-slate-700"}`}
                  >{p}</button>
                ))}
              </div>
              <Button onClick={exportCsv} variant="outline" size="sm" className="border-slate-200 bg-white text-slate-700 hover:border-cyan-400/40 hover:text-cyan-700">
                <Download className="h-4 w-4 mr-2" />Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Company</TableHead>
                    <TableHead className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Tier / Role</TableHead>
                    <TableHead className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Location</TableHead>
                    <TableHead className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Signals</TableHead>
                    <TableHead className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold">Source</TableHead>
                    <TableHead className="text-slate-600 text-[10px] uppercase tracking-[0.14em] font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} className="border-slate-200 hover:bg-cyan-50 transition-colors">
                      <TableCell className="text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-100 to-violet-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-cyan-800 shadow-inner">
                            {c.company_name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate flex items-center gap-2">
                              {c.company_name}
                              <Badge variant="outline" className={`${confidenceColor(c.confidence)} text-[10px] capitalize`}>{c.confidence}</Badge>
                            </div>
                            {c.website && (
                              <a href={/^https?:\/\//.test(c.website) ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-cyan-600 hover:text-cyan-700 truncate flex items-center gap-1">
                                <Globe className="h-3 w-3" />{c.website}
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {c.tier && <Badge variant="outline" className={`${tierColor(c.tier)} text-[10px] w-fit`}>{c.tier}</Badge>}
                          {c.role && <span className="text-xs text-slate-600">{c.role}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.country ? (
                          <div className="flex items-center gap-1 text-slate-700 text-sm">
                            <MapPin className="h-3 w-3 text-slate-500" />{c.country}
                          </div>
                        ) : <span className="text-slate-600">—</span>}
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <p className="text-xs text-slate-600 line-clamp-2">{c.key_signals || c.description || "—"}</p>
                      </TableCell>
                      <TableCell>
                        {c.source_url ? (
                          <a href={c.source_url} target="_blank" rel="noopener noreferrer"
                            className="text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1 text-xs">
                            source <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : <span className="text-slate-600 text-xs">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" disabled={c.saved_to_crm} onClick={() => saveToCrm(c)}
                          className={`border-slate-200 bg-white text-slate-700 ${c.saved_to_crm ? "opacity-60" : "hover:border-emerald-500/50 hover:text-emerald-700"}`}>
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
                        No companies match the current filter.
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
                  className={`group w-full flex items-center justify-between p-3 rounded-2xl bg-white border transition-all text-left ${searchId === h.id ? "border-cyan-400/50 shadow-[0_8px_28px_-12px_rgba(34,211,238,0.5)]" : "border-slate-200 hover:border-cyan-400/30"}`}>
                  <div className="min-w-0">
                    <div className="text-slate-900 text-sm font-medium truncate group-hover:text-cyan-700 transition-colors">
                      {h.sector}{h.sub_criteria ? <span className="text-slate-600"> · {h.sub_criteria}</span> : null}
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
    </div>
  );
}
