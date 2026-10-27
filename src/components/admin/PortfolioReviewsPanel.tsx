import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Briefcase, Download, Eye, Loader2, Plus, RefreshCw, Save, Send, Sparkles, Star, Trash2, UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ReviewDocument, downloadReviewPdf } from "@/components/portfolio-review/ReviewDocument";
import {
  type Entitlement, type PortfolioReview, type ReviewMessage, type ReviewRequest, REVIEW_SECTIONS, STATUS_LABEL,
  adminDeliver, adminGenerateDraft, adminGetDraft, adminGrant, adminListEntitlements, adminListRequests,
  adminRevoke, adminSaveWorking, adminUpdateRequest, analyticsFor, findUsers, listMessages, money, pct, sendMessage,
} from "@/lib/portfolioReviews";

type Profile = { user_id: string; email: string | null; full_name: string | null };
type Working = Partial<PortfolioReview>;

const STATUS_TONE: Record<string, string> = {
  submitted: "bg-slate-100 text-slate-700",
  in_review: "bg-amber-100 text-amber-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-100 text-slate-500",
};

const RATINGS: PortfolioReview["overall_rating"][] = ["Well aligned", "Broadly aligned", "Needs attention", "Misaligned"];

const db = supabase as any;

async function loadProfiles(ids: string[]): Promise<Map<string, Profile>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map();
  const { data } = await db.from("user_profiles").select("user_id,email,full_name").in("user_id", unique);
  return new Map(((data ?? []) as Profile[]).map((p) => [p.user_id, p]));
}

const who = (p?: Profile) => p?.full_name || p?.email || "Unknown user";

/** Fills the house section structure so every section is editable. */
function withAllSections(w: Working | null): Working {
  const byKey = new Map((w?.sections ?? []).map((s) => [s.key, s.body]));
  return {
    headline: w?.headline ?? "",
    summary: w?.summary ?? "",
    overall_rating: w?.overall_rating,
    considerations: w?.considerations ?? [],
    sections: REVIEW_SECTIONS.map((s) => ({ key: s.key, title: s.title, body: byKey.get(s.key) ?? "" })),
  };
}

function deliveryProblems(w: Working): string[] {
  const out: string[] = [];
  if (!w.headline?.trim()) out.push("Add a headline.");
  if (!w.summary?.trim()) out.push("Add an executive summary.");
  if (!w.overall_rating) out.push("Choose an overall rating.");
  if (!(w.sections ?? []).some((s) => s.body.trim())) out.push("Write at least one section.");
  if ((w.considerations ?? []).some((c) => !c.title.trim())) out.push("Every key point needs a title.");
  return out;
}

// ── Review workspace ─────────────────────────────────────────────────────────
function ReviewWorkspace({ request, client, onBack, onChanged }: {
  request: ReviewRequest; client?: Profile; onBack: () => void; onChanged: () => void;
}) {
  const analytics = useMemo(() => analyticsFor(request), [request]);
  const [working, setWorking] = useState<Working>(() => withAllSections(request.review));
  const [notes, setNotes] = useState("");
  const [aiDraft, setAiDraft] = useState<any>(null);
  const [analystName, setAnalystName] = useState(request.analyst_name ?? "");
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [confirmDraft, setConfirmDraft] = useState(false);
  const [confirmDeliver, setConfirmDeliver] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [messages, setMessages] = useState<ReviewMessage[]>([]);
  const [reply, setReply] = useState("");
  const docRef = useRef<HTMLDivElement>(null);
  const delivered = request.status === "delivered";

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [draft, { data: { user } }] = await Promise.all([adminGetDraft(request.id), supabase.auth.getUser()]);
        if (!live) return;
        if (draft?.working && !request.review) setWorking(withAllSections(draft.working));
        setNotes(draft?.internal_notes ?? "");
        setAiDraft(draft?.ai_draft ?? null);
        if (!request.analyst_name) {
          const p = user ? (await loadProfiles([user.id])).get(user.id) : undefined;
          if (live) setAnalystName(p?.full_name || "");
        }
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [request.id, request.review, request.analyst_name]);

  const loadMessages = useCallback(async () => {
    try { setMessages(await listMessages(request.id)); } catch { /* table may not exist yet */ }
  }, [request.id]);
  useEffect(() => { void loadMessages(); }, [loadMessages]);

  const edit = (patch: Working) => { setWorking((w) => ({ ...w, ...patch })); setDirty(true); };
  const editSection = (key: string, body: string) =>
    edit({ sections: (working.sections ?? []).map((s) => (s.key === key ? { ...s, body } : s)) });
  const editPoint = (i: number, patch: Partial<PortfolioReview["considerations"][number]>) =>
    edit({ considerations: (working.considerations ?? []).map((c, j) => (j === i ? { ...c, ...patch } : c)) });

  const save = async (quiet = false) => {
    setSaving(true);
    try {
      await adminSaveWorking(request.id, working, notes || null);
      if (request.status === "submitted") await adminUpdateRequest(request.id, { status: "in_review" });
      setDirty(false);
      if (!quiet) toast.success("Draft saved");
      onChanged();
    } catch (e) {
      toast.error((e as Error).message || "Couldn't save");
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const generate = async () => {
    setConfirmDraft(false);
    setDrafting(true);
    try {
      // Save first so the function keeps the analyst's edits instead of overwriting them.
      if (dirty) await save(true);
      const res = await adminGenerateDraft(request.id);
      setAiDraft(res.draft);
      if (!res.kept_working_copy) {
        setWorking(withAllSections(res.draft));
        if (res.draft.analyst_notes) setNotes(res.draft.analyst_notes);
        toast.success("AI draft ready — check and edit it before delivering");
      } else {
        toast.success("New AI draft ready — your edited copy was kept. Use \"Use AI text\" per section to pull it in.");
      }
      onChanged();
    } catch (e) {
      toast.error((e as Error).message || "Couldn't create the AI draft");
    } finally {
      setDrafting(false);
    }
  };

  const applyAiSection = (key: string) => {
    const body = aiDraft?.sections?.find((s: any) => s.key === key)?.body;
    if (body) editSection(key, body);
  };

  const deliver = async () => {
    setConfirmDeliver(false);
    setDelivering(true);
    try {
      const review: PortfolioReview = {
        headline: working.headline!.trim(),
        summary: working.summary!.trim(),
        overall_rating: working.overall_rating!,
        sections: (working.sections ?? []).filter((s) => s.body.trim()),
        considerations: (working.considerations ?? []).filter((c) => c.title.trim()),
        analytics,
      };
      await adminSaveWorking(request.id, working, notes || null);
      await adminDeliver(request.id, review, analystName.trim() || "FlowPulse Research");
      toast.success("Review delivered to the client");
      setDirty(false);
      onChanged();
    } catch (e) {
      toast.error((e as Error).message || "Couldn't deliver the review");
    } finally {
      setDelivering(false);
    }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    try { await sendMessage(request.id, reply.trim(), "analyst"); setReply(""); await loadMessages(); }
    catch (e) { toast.error((e as Error).message || "Couldn't send"); }
  };

  const problems = deliveryProblems(working);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Queue</Button>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">{request.title}</h2>
            <p className="text-sm text-muted-foreground">{who(client)} · submitted {new Date(request.created_at).toLocaleString("en-GB")}</p>
          </div>
          <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${STATUS_TONE[request.status]}`}>{STATUS_LABEL[request.status]}</span>
        </div>
        {!delivered && request.status !== "cancelled" && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setConfirmDraft(true)} disabled={drafting}>
              {drafting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
              {aiDraft ? "New AI draft" : "AI first draft"}
            </Button>
            <Button variant="outline" onClick={() => void save()} disabled={saving || !dirty}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
            <Button onClick={() => setConfirmDeliver(true)} disabled={delivering || problems.length > 0} title={problems.join(" ")}>
              {delivering ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />} Deliver to client
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue={delivered ? "preview" : "edit"}>
        <TabsList>
          <TabsTrigger value="brief">Brief & holdings</TabsTrigger>
          {!delivered && <TabsTrigger value="edit">Write review</TabsTrigger>}
          <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-1" /> {delivered ? "Delivered review" : "Preview"}</TabsTrigger>
          <TabsTrigger value="messages">Messages{messages.length ? ` (${messages.length})` : ""}</TabsTrigger>
        </TabsList>

        <TabsContent value="brief" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Client brief</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Client:</span> {who(client)}{client?.email && client.full_name ? ` (${client.email})` : ""}</p>
                <p><span className="text-muted-foreground">Objectives:</span> {request.objectives || "—"}</p>
                <p><span className="text-muted-foreground">Risk profile:</span> {request.risk_profile || "—"}</p>
                <p><span className="text-muted-foreground">Time horizon:</span> {request.time_horizon || "—"}</p>
                <p><span className="text-muted-foreground">Income need:</span> {request.income_need || "—"}</p>
                <p><span className="text-muted-foreground">Constraints:</span> {request.constraints || "—"}</p>
                <p><span className="text-muted-foreground">File:</span> {request.source_file_name || "pasted"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Computed figures</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Value:</span> {money(analytics.total_value, request.base_currency)} across {analytics.holdings_count} holdings</p>
                <p><span className="text-muted-foreground">Effective holdings:</span> {analytics.effective_holdings.toFixed(1)} · top 5 {pct(analytics.top5_weight)} · top 10 {pct(analytics.top10_weight)}</p>
                <p><span className="text-muted-foreground">Asset classes:</span> {analytics.by_asset_class.map((b) => `${b.label} ${pct(b.weight)}`).join(", ") || "—"}</p>
                <p><span className="text-muted-foreground">Regions:</span> {analytics.by_region.map((b) => `${b.label} ${pct(b.weight)}`).join(", ") || "—"}</p>
                {analytics.flags.length > 0 && (
                  <ul className="list-disc pl-5 text-amber-800">{analytics.flags.map((f) => <li key={f}>{f}</li>)}</ul>
                )}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Holding</TableHead><TableHead>Value</TableHead><TableHead>Weight</TableHead><TableHead>Asset class</TableHead><TableHead>Sector</TableHead><TableHead>Region</TableHead></TableRow></TableHeader>
                <TableBody>
                  {analytics.positions.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{p.name}{p.symbol ? <span className="text-muted-foreground"> ({p.symbol})</span> : null}</TableCell>
                      <TableCell>{money(p.value, p.currency || request.base_currency)}</TableCell>
                      <TableCell>{pct(p.weight)}</TableCell>
                      <TableCell>{p.asset_class || "—"}</TableCell>
                      <TableCell>{p.sector || "—"}</TableCell>
                      <TableCell>{p.region || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {!delivered && (
          <TabsContent value="edit" className="space-y-4">
            <Card>
              <CardContent className="pt-6 grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Headline</Label>
                  <Input value={working.headline ?? ""} maxLength={140} onChange={(e) => edit({ headline: e.target.value })} placeholder="One-line verdict" />
                </div>
                <div className="space-y-1.5">
                  <Label>Overall rating</Label>
                  <Select value={working.overall_rating ?? ""} onValueChange={(v) => edit({ overall_rating: v as PortfolioReview["overall_rating"] })}>
                    <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                    <SelectContent>{RATINGS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3 space-y-1.5">
                  <Label>Executive summary</Label>
                  <Textarea rows={5} value={working.summary ?? ""} onChange={(e) => edit({ summary: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Signed by (shown to client)</Label>
                  <Input value={analystName} onChange={(e) => { setAnalystName(e.target.value); setDirty(true); }} placeholder="Analyst name" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Key points to consider</CardTitle>
                <Button size="sm" variant="outline" onClick={() => edit({ considerations: [...(working.considerations ?? []), { title: "", detail: "", priority: "medium" }] })}>
                  <Plus className="h-4 w-4 mr-1" /> Add point
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {(working.considerations ?? []).length === 0 && <p className="text-sm text-muted-foreground">No points yet.</p>}
                {(working.considerations ?? []).map((c, i) => (
                  <div key={i} className="grid md:grid-cols-[1fr_140px_auto] gap-2 border rounded-md p-3">
                    <Input value={c.title} placeholder="Title" onChange={(e) => editPoint(i, { title: e.target.value })} />
                    <Select value={c.priority} onValueChange={(v) => editPoint(i, { priority: v as "high" | "medium" | "low" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" aria-label="Remove point"
                      onClick={() => edit({ considerations: (working.considerations ?? []).filter((_, j) => j !== i) })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Textarea className="md:col-span-3" rows={2} value={c.detail} placeholder="Detail" onChange={(e) => editPoint(i, { detail: e.target.value })} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {(working.sections ?? []).map((s) => {
              const meta = REVIEW_SECTIONS.find((r) => r.key === s.key);
              const aiBody = aiDraft?.sections?.find((a: any) => a.key === s.key)?.body;
              return (
                <Card key={s.key}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
                    <div>
                      <CardTitle className="text-base">{s.title}</CardTitle>
                      {meta && <CardDescription>{meta.hint}</CardDescription>}
                    </div>
                    {aiBody && aiBody !== s.body && (
                      <Button size="sm" variant="ghost" onClick={() => applyAiSection(s.key)}><Sparkles className="h-4 w-4 mr-1" /> Use AI text</Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Textarea rows={8} className="font-mono text-sm" value={s.body} onChange={(e) => editSection(s.key, e.target.value)}
                      placeholder="Markdown supported. Leave empty to leave this section out." />
                  </CardContent>
                </Card>
              );
            })}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Internal notes</CardTitle>
                <CardDescription>Never shown to the client.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea rows={4} value={notes} onChange={(e) => { setNotes(e.target.value); setDirty(true); }} placeholder="Data gaps, things to check before delivery…" />
              </CardContent>
            </Card>
            {problems.length > 0 && <p className="text-sm text-amber-700">Before delivering: {problems.join(" ")}</p>}
          </TabsContent>
        )}

        <TabsContent value="preview" className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={async () => {
              if (!docRef.current) return;
              try { await downloadReviewPdf(docRef.current, `FlowPulse_Portfolio_Review_${request.title.replace(/[^a-z0-9]+/gi, "_")}.pdf`); }
              catch { toast.error("Couldn't create the PDF"); }
            }}><Download className="h-4 w-4 mr-1" /> PDF</Button>
          </div>
          <ReviewDocument ref={docRef} title={request.title} review={delivered && request.review ? request.review : working}
            analytics={analytics} currency={request.base_currency} clientName={client?.full_name}
            analystName={delivered ? request.analyst_name : analystName} deliveredAt={request.delivered_at}
            brief={request} />
          {request.user_rating && (
            <Card>
              <CardContent className="pt-6 text-sm space-y-1">
                <p className="flex items-center gap-1">Client rating: {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < request.user_rating! ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                ))}</p>
                {request.user_feedback && <p className="text-muted-foreground">"{request.user_feedback}"</p>}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardContent className="pt-6 space-y-3">
              {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
              {messages.map((m) => (
                <div key={m.id} className={`rounded-lg p-3 text-sm max-w-[85%] ${m.sender_role === "analyst" ? "ml-auto bg-violet-50" : "bg-slate-100"}`}>
                  <p className="text-xs text-muted-foreground mb-1">{m.sender_role === "analyst" ? "Analyst" : who(client)} · {new Date(m.created_at).toLocaleString("en-GB")}</p>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
              ))}
              {request.status !== "cancelled" && (
                <div className="flex gap-2 pt-2">
                  <Textarea rows={2} value={reply} maxLength={4000} onChange={(e) => setReply(e.target.value)} placeholder="Reply to the client…" />
                  <Button onClick={sendReply} disabled={!reply.trim()}><Send className="h-4 w-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={confirmDraft} onOpenChange={setConfirmDraft}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create an AI first draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This uses one AI call (Gemini Pro) and counts towards the daily AI budget. The draft stays internal until you deliver.
              {dirty ? " Your unsaved edits will be saved first and kept." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={generate}>Create draft</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDeliver} onOpenChange={setConfirmDeliver}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deliver this review to {who(client)}?</AlertDialogTitle>
            <AlertDialogDescription>
              The client will see the review exactly as in Preview, signed by {analystName.trim() || "FlowPulse Research"}. It can't be edited after delivery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deliver}>Deliver</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Access management ────────────────────────────────────────────────────────
function AccessManager() {
  const [rows, setRows] = useState<Entitlement[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [picked, setPicked] = useState<Profile | null>(null);
  const [allowance, setAllowance] = useState("");
  const [expires, setExpires] = useState("");
  const [notes, setNotes] = useState("");
  const [granting, setGranting] = useState(false);
  const [revoking, setRevoking] = useState<Entitlement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminListEntitlements();
      setRows(list);
      setProfiles(await loadProfiles(list.map((r) => r.user_id)));
    } catch (e) {
      toast.error((e as Error).message || "Couldn't load access list");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (picked) return;
    const t = setTimeout(async () => setResults(await findUsers(query)), 250);
    return () => clearTimeout(t);
  }, [query, picked]);

  const grant = async () => {
    if (!picked) return;
    const n = allowance.trim() ? Number(allowance) : null;
    if (n !== null && (!Number.isInteger(n) || n < 1)) { toast.error("Allowance must be a whole number, or empty for unlimited"); return; }
    setGranting(true);
    try {
      await adminGrant(picked.user_id, {
        reviews_included: n,
        expires_at: expires ? new Date(`${expires}T23:59:59`).toISOString() : null,
        notes: notes.trim() || null,
      });
      toast.success(`Portfolio Review enabled for ${who(picked)}`);
      setPicked(null); setQuery(""); setAllowance(""); setExpires(""); setNotes("");
      await load();
    } catch (e) {
      toast.error((e as Error).message || "Couldn't grant access");
    } finally {
      setGranting(false);
    }
  };

  const revoke = async () => {
    if (!revoking) return;
    try { await adminRevoke(revoking.id); toast.success("Access revoked"); await load(); }
    catch (e) { toast.error((e as Error).message || "Couldn't revoke"); }
    finally { setRevoking(null); }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" /> Give a user the add-on</CardTitle>
          <CardDescription>Clients keep read access to delivered reviews if the add-on is revoked or expires.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {picked ? (
            <div className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span>{who(picked)}{picked.email && picked.full_name ? ` (${picked.email})` : ""}</span>
              <Button size="sm" variant="ghost" onClick={() => setPicked(null)}>Change</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by email or name" />
              {results.length > 0 && (
                <div className="rounded-md border divide-y">
                  {results.map((u) => (
                    <button key={u.user_id} className="w-full text-left px-3 py-2 text-sm hover:bg-muted" onClick={() => { setPicked(u); setResults([]); }}>
                      {who(u)}{u.email && u.full_name ? <span className="text-muted-foreground"> · {u.email}</span> : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label>Reviews included</Label><Input inputMode="numeric" value={allowance} onChange={(e) => setAllowance(e.target.value)} placeholder="Unlimited" /></div>
            <div className="space-y-1.5"><Label>Expires</Label><Input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contract ref, price…" /></div>
          </div>
          <Button onClick={grant} disabled={!picked || granting}>{granting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Enable add-on</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead>Allowance</TableHead><TableHead>Expires</TableHead><TableHead>Notes</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users have the add-on yet.</TableCell></TableRow>}
                {rows.map((r) => {
                  const expired = r.expires_at && new Date(r.expires_at) < new Date();
                  return (
                    <TableRow key={r.id}>
                      <TableCell>{who(profiles.get(r.user_id))}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "active" && !expired ? "default" : "secondary"}>{r.status === "revoked" ? "Revoked" : expired ? "Expired" : "Active"}</Badge>
                      </TableCell>
                      <TableCell>{r.reviews_included ?? "Unlimited"}</TableCell>
                      <TableCell>{r.expires_at ? new Date(r.expires_at).toLocaleDateString("en-GB") : "—"}</TableCell>
                      <TableCell className="max-w-[220px] truncate">{r.notes || "—"}</TableCell>
                      <TableCell className="text-right">
                        {r.status === "active" && <Button size="sm" variant="ghost" onClick={() => setRevoking(r)}>Revoke</Button>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!revoking} onOpenChange={(v) => !v && setRevoking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Portfolio Review for {who(revoking ? profiles.get(revoking.user_id) : undefined)}?</AlertDialogTitle>
            <AlertDialogDescription>They won't be able to request new reviews. Delivered reviews stay readable.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={revoke}>Revoke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Panel ────────────────────────────────────────────────────────────────────
export function PortfolioReviewsPanel() {
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [filter, setFilter] = useState<"open" | "delivered" | "all">("open");
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await adminListRequests();
      setRequests(list);
      setProfiles(await loadProfiles(list.map((r) => r.user_id)));
      setMissing(false);
    } catch (e) {
      const msg = (e as Error).message || "";
      if (/does not exist|schema cache/i.test(msg)) setMissing(true);
      else toast.error(msg || "Couldn't load reviews");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const current = requests.find((r) => r.id === selected);
  if (current) {
    return <ReviewWorkspace key={current.id} request={current} client={profiles.get(current.user_id)} onBack={() => setSelected(null)} onChanged={load} />;
  }

  const shown = requests.filter((r) =>
    filter === "all" ? true : filter === "delivered" ? r.status === "delivered" : r.status === "submitted" || r.status === "in_review");
  const waiting = requests.filter((r) => r.status === "submitted").length;
  const inReview = requests.filter((r) => r.status === "in_review").length;
  const ratings = requests.filter((r) => r.user_rating).map((r) => r.user_rating!);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="h-6 w-6 text-violet-600" /> Portfolio Reviews</h2>
          <p className="text-muted-foreground">Enterprise add-on: client portfolios waiting for an analyst review.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setLoading(true); void load(); }}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
      </div>

      {missing ? (
        <Card><CardContent className="py-8 text-sm text-muted-foreground">
          The Portfolio Review tables aren't in the database yet. Apply migration <code>20261027090000_portfolio_reviews.sql</code>, then refresh.
        </CardContent></Card>
      ) : (
        <Tabs defaultValue="queue">
          <TabsList>
            <TabsTrigger value="queue">Review queue{waiting ? ` (${waiting} new)` : ""}</TabsTrigger>
            <TabsTrigger value="access">Client access</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Waiting</p><p className="text-2xl font-semibold">{waiting}</p></CardContent></Card>
              <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">In review</p><p className="text-2xl font-semibold">{inReview}</p></CardContent></Card>
              <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Delivered</p><p className="text-2xl font-semibold">{requests.filter((r) => r.status === "delivered").length}</p></CardContent></Card>
              <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Avg client rating</p><p className="text-2xl font-semibold">{ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—"}</p></CardContent></Card>
            </div>

            <div className="flex gap-2">
              {(["open", "delivered", "all"] as const).map((f) => (
                <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
                  {f === "open" ? "Open" : f === "delivered" ? "Delivered" : "All"}
                </Button>
              ))}
            </div>

            <Card>
              <CardContent className="p-0 overflow-x-auto">
                {loading ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Portfolio</TableHead><TableHead>Value</TableHead><TableHead>Risk</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {shown.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nothing here.</TableCell></TableRow>}
                      {shown.map((r) => (
                        <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r.id)}>
                          <TableCell>{who(profiles.get(r.user_id))}</TableCell>
                          <TableCell className="max-w-[240px] truncate">{r.title}<span className="text-muted-foreground"> · {r.holdings?.length ?? 0} holdings</span></TableCell>
                          <TableCell>{money(r.total_value ?? 0, r.base_currency)}</TableCell>
                          <TableCell className="capitalize">{r.risk_profile || "—"}</TableCell>
                          <TableCell>{new Date(r.created_at).toLocaleDateString("en-GB")}</TableCell>
                          <TableCell><span className={`text-xs font-medium rounded-full px-2.5 py-1 ${STATUS_TONE[r.status]}`}>{STATUS_LABEL[r.status]}</span></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access"><AccessManager /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
