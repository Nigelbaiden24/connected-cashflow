import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, Briefcase, CheckCircle2, Clock, Download, FileSpreadsheet, Loader2, Lock, MessageSquare,
  Plus, Send, ShieldCheck, Sparkles, Star, Upload, UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ReviewDocument, downloadReviewPdf } from "@/components/portfolio-review/ReviewDocument";
import {
  type Entitlement, type Holding, type ReviewMessage, type ReviewRequest, STATUS_LABEL,
  analyticsFor, cancelReview, getMyEntitlement, listMessages, listMyReviews, money, parseHoldingText,
  parsePortfolioFile, pct, rateReview, sendMessage, submitReview,
} from "@/lib/portfolioReviews";

const STATUS_TONE: Record<string, string> = {
  submitted: "bg-slate-100 text-slate-700",
  in_review: "bg-amber-100 text-amber-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-100 text-slate-500",
};

// ── Upsell for users without the add-on ─────────────────────────────────────
function EnterpriseUpsell() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const request = async () => {
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.functions.invoke("submit-contact-form", {
        body: {
          name: (user?.user_metadata as any)?.full_name || user?.email || "FlowPulse Investor user",
          email: user?.email ?? "",
          message: "I'd like to add the Analyst Portfolio Review enterprise add-on to my FlowPulse Investor account.",
          sourcePage: "Investor › Portfolio Review",
        },
      });
      if (error) throw error;
      setSent(true);
      toast.success("Thanks — our team will be in touch shortly.");
    } catch (e) {
      toast.error((e as Error).message || "Couldn't send your request");
    } finally {
      setSending(false);
    }
  };
  const features = [
    { icon: UserCheck, title: "A named FlowPulse analyst", text: "Every review is written and signed off by one of our analysts, not generated automatically." },
    { icon: FileSpreadsheet, title: "Upload in seconds", text: "Drop in a broker export (CSV or Excel) or paste from a spreadsheet." },
    { icon: Sparkles, title: "Bespoke to your goals", text: "Alignment with your objectives, risk and horizon; allocation, concentration, costs and income." },
    { icon: MessageSquare, title: "Ask follow-up questions", text: "Discuss the review with your analyst in the same thread." },
  ];
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 p-6 md:p-10 text-white">
          <Badge className="bg-white/15 text-white hover:bg-white/15 mb-4"><Lock className="h-3 w-3 mr-1" /> Enterprise add-on</Badge>
          <h1 className="text-2xl md:text-3xl font-bold">Analyst Portfolio Review</h1>
          <p className="mt-2 text-white/80 max-w-2xl">Upload your portfolio and receive a bespoke written review from a FlowPulse analyst.</p>
        </div>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3">
                <f.icon className="h-5 w-5 text-violet-600 mt-0.5 shrink-0" />
                <div><p className="font-medium">{f.title}</p><p className="text-sm text-muted-foreground">{f.text}</p></div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={request} disabled={sending || sent}>
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : sent ? <CheckCircle2 className="h-4 w-4 mr-2" /> : null}
              {sent ? "Request sent" : "Request access"}
            </Button>
            <p className="text-xs text-muted-foreground">Available to enterprise subscribers. Our team will confirm pricing and turnaround.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── New review wizard ───────────────────────────────────────────────────────
function NewReviewDialog({ open, onOpenChange, onSubmitted }: { open: boolean; onOpenChange: (v: boolean) => void; onSubmitted: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [paste, setPaste] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", objectives: "", risk_profile: "balanced" as ReviewRequest["risk_profile"], time_horizon: "5–10 years",
    income_need: "", constraints: "", base_currency: "GBP",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setStep(1); setHoldings([]); setWarnings([]); setFileName(""); setPaste(""); }
  }, [open]);

  const analytics = useMemo(() => analyticsFor({ holdings }), [holdings]);

  const onFile = async (file?: File) => {
    if (!file) return;
    setParsing(true);
    try {
      const r = await parsePortfolioFile(file);
      setHoldings(r.holdings); setWarnings(r.warnings); setFileName(file.name);
      if (!form.title) setForm((f) => ({ ...f, title: file.name.replace(/\.[^.]+$/, "") }));
      if (!r.holdings.length) toast.error(r.warnings[0] ?? "No holdings found in that file");
    } catch (e) {
      toast.error(`Couldn't read that file: ${(e as Error).message}`);
    } finally {
      setParsing(false);
    }
  };

  const onPaste = () => {
    const r = parseHoldingText(paste);
    setHoldings(r.holdings); setWarnings(r.warnings); setFileName("Pasted holdings");
    if (!r.holdings.length) toast.error(r.warnings[0] ?? "No holdings found");
  };

  const submit = async () => {
    if (!form.objectives.trim()) { toast.error("Tell your analyst what you want the portfolio to achieve"); return; }
    setSaving(true);
    try {
      await submitReview({ ...form, title: form.title.trim() || "My portfolio", holdings, source_file_name: fileName });
      toast.success("Submitted — an analyst will pick up your review shortly.");
      onOpenChange(false);
      onSubmitted();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Upload your portfolio" : "Your objectives"}</DialogTitle>
          <DialogDescription>
            {step === 1 ? "Step 1 of 2 · CSV or Excel export from your broker or platform, or paste from a spreadsheet." : "Step 2 of 2 · This shapes the review your analyst writes."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); void onFile(e.dataTransfer.files?.[0]); }}
              className="w-full rounded-xl border-2 border-dashed p-6 text-center hover:bg-muted/50 transition-colors"
            >
              {parsing ? <Loader2 className="h-6 w-6 mx-auto animate-spin" /> : <Upload className="h-6 w-6 mx-auto text-muted-foreground" />}
              <p className="mt-2 font-medium">{fileName || "Choose a file or drop it here"}</p>
              <p className="text-xs text-muted-foreground">.csv or .xlsx · columns such as Name, Ticker, Quantity, Price, Value, Currency, Sector</p>
            </button>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.xlsx,.xls" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />

            <details className="rounded-lg border p-3">
              <summary className="cursor-pointer text-sm font-medium">…or paste from a spreadsheet</summary>
              <Textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={5} className="mt-3 font-mono text-xs"
                placeholder={"Name\tTicker\tValue\nVanguard FTSE Global All Cap\tVAFTGAG\t42000\nApple Inc\tAAPL\t8500"} />
              <Button size="sm" variant="secondary" className="mt-2" onClick={onPaste} disabled={!paste.trim()}>Read pasted holdings</Button>
            </details>

            {warnings.length > 0 && (
              <ul className="text-xs text-amber-700 space-y-1">{warnings.map((w) => <li key={w}>• {w}</li>)}</ul>
            )}

            {holdings.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="secondary">{analytics.holdings_count} holdings</Badge>
                  <Badge variant="secondary">{money(analytics.total_value, form.base_currency)}</Badge>
                  <Badge variant="secondary">Largest {analytics.largest ? pct(analytics.largest.weight) : "—"}</Badge>
                </div>
                <div className="max-h-64 overflow-auto rounded-lg border">
                  <Table>
                    <TableHeader><TableRow><TableHead>Holding</TableHead><TableHead className="text-right">Value</TableHead><TableHead className="text-right">Weight</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {analytics.positions.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm">{p.name}{p.symbol ? <span className="text-muted-foreground"> · {p.symbol}</span> : null}</TableCell>
                          <TableCell className="text-right tabular-nums text-sm">{money(p.value, p.currency || form.base_currency)}</TableCell>
                          <TableCell className="text-right tabular-nums text-sm">{pct(p.weight)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="pr-title">Name this portfolio</Label>
              <Input id="pr-title" value={form.title} onChange={(e) => set("title")(e.target.value)} placeholder="e.g. Family ISA & SIPP" />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="pr-obj">What do you want this portfolio to achieve? *</Label>
              <Textarea id="pr-obj" rows={3} value={form.objectives} onChange={(e) => set("objectives")(e.target.value)}
                placeholder="e.g. Grow capital for retirement in 15 years while keeping drawdowns manageable" />
            </div>
            <div className="space-y-1">
              <Label>Risk profile</Label>
              <Select value={form.risk_profile ?? "balanced"} onValueChange={(v) => set("risk_profile")(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cautious">Cautious</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="adventurous">Adventurous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Time horizon</Label>
              <Select value={form.time_horizon} onValueChange={set("time_horizon")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Under 3 years", "3–5 years", "5–10 years", "10–20 years", "20+ years"].map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="pr-income">Income need</Label>
              <Input id="pr-income" value={form.income_need} onChange={(e) => set("income_need")(e.target.value)} placeholder="e.g. £12,000 a year from 2030" />
            </div>
            <div className="space-y-1">
              <Label>Base currency</Label>
              <Select value={form.base_currency} onValueChange={set("base_currency")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["GBP", "USD", "EUR"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="pr-con">Anything else your analyst should know?</Label>
              <Textarea id="pr-con" rows={2} value={form.constraints} onChange={(e) => set("constraints")(e.target.value)}
                placeholder="Tax wrappers (ISA, SIPP, GIA), ethical preferences, holdings you won't sell…" />
            </div>
            <p className="sm:col-span-2 text-xs text-muted-foreground flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0" />
              Your holdings are visible only to you and FlowPulse analysts. A review is general research, not a personal recommendation.</p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 2 && <Button variant="outline" onClick={() => setStep(1)}>Back</Button>}
          {step === 1
            ? <Button onClick={() => setStep(2)} disabled={!holdings.length}>Continue</Button>
            : <Button onClick={submit} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Submit for review</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Review detail ───────────────────────────────────────────────────────────
function ReviewDetail({ request, onBack, onChanged }: { request: ReviewRequest; onBack: () => void; onChanged: () => void }) {
  const docRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ReviewMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [rating, setRating] = useState(request.user_rating ?? 0);
  const [feedback, setFeedback] = useState(request.user_feedback ?? "");
  const [downloading, setDownloading] = useState(false);
  const analytics = useMemo(() => request.review?.analytics ?? analyticsFor(request), [request]);

  const loadMessages = useCallback(async () => {
    try { setMessages(await listMessages(request.id)); } catch { /* ignore */ }
  }, [request.id]);
  useEffect(() => { void loadMessages(); }, [loadMessages]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try { await sendMessage(request.id, text.trim(), "client"); setText(""); await loadMessages(); }
    catch (e) { toast.error((e as Error).message); }
    finally { setSending(false); }
  };

  const saveRating = async (n: number) => {
    setRating(n);
    try { await rateReview(request.id, n, feedback); toast.success("Thanks for your feedback"); onChanged(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> All reviews</Button>
        <div className="flex gap-2">
          {request.status === "submitted" && (
            <Button variant="outline" size="sm" onClick={async () => {
              try { await cancelReview(request.id); toast.success("Review cancelled"); onChanged(); onBack(); } catch (e) { toast.error((e as Error).message); }
            }}>Cancel request</Button>
          )}
          {request.status === "delivered" && request.review && (
            <Button size="sm" disabled={downloading} onClick={async () => {
              if (!docRef.current) return;
              setDownloading(true);
              try { await downloadReviewPdf(docRef.current, `FlowPulse_Portfolio_Review_${request.title.replace(/[^a-z0-9]+/gi, "_")}.pdf`); }
              finally { setDownloading(false); }
            }}>
              {downloading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />} Download PDF
            </Button>
          )}
        </div>
      </div>

      {request.status === "delivered" && request.review ? (
        <Card><CardContent className="p-4 md:p-8">
          <ReviewDocument ref={docRef} title={request.title} review={request.review} analytics={analytics}
            currency={request.base_currency} analystName={request.analyst_name} deliveredAt={request.delivered_at}
            brief={request} />
        </CardContent></Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> {STATUS_LABEL[request.status]}</CardTitle>
            <CardDescription>
              {request.status === "cancelled" ? "This request was cancelled."
                : request.status === "in_review" ? "An analyst is working on your review. You'll see it here as soon as it's delivered."
                : "Your portfolio is in the queue. An analyst will pick it up shortly."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">{analytics.holdings_count} holdings</Badge>
            <Badge variant="secondary">{money(analytics.total_value, request.base_currency)}</Badge>
            <Badge variant="secondary">Submitted {new Date(request.created_at).toLocaleDateString("en-GB")}</Badge>
          </CardContent>
        </Card>
      )}

      {request.status === "delivered" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">How useful was this review?</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} aria-label={`${n} stars`} onClick={() => void saveRating(n)}>
                  <Star className={`h-6 w-6 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <Textarea rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Optional comments for the team"
              onBlur={() => { if (rating) void rateReview(request.id, rating, feedback).catch(() => undefined); }} />
          </CardContent>
        </Card>
      )}

      {request.status !== "cancelled" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Questions for your analyst</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
            {messages.map((m) => (
              <div key={m.id} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${m.sender_role === "client" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
                <p className="text-[10px] opacity-70 mb-0.5">{m.sender_role === "client" ? "You" : request.analyst_name || "FlowPulse analyst"} · {new Date(m.created_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}</p>
                {m.body}
              </div>
            ))}
            <div className="flex gap-2">
              <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a question about your review…" />
              <Button size="icon" onClick={send} disabled={sending || !text.trim()} aria-label="Send"><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function PortfolioReviewPage() {
  const [loading, setLoading] = useState(true);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [reviews, setReviews] = useState<ReviewRequest[]>([]);
  // ?review=<id> (e.g. from a notification) opens that review directly.
  const [selected, setSelected] = useState<string | null>(() => new URLSearchParams(window.location.search).get("review"));
  const [newOpen, setNewOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [ent, list] = await Promise.all([getMyEntitlement(), listMyReviews().catch(() => [])]);
      setEntitlement(ent);
      setReviews(list);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const current = reviews.find((r) => r.id === selected);
  if (current) return <ReviewDetail request={current} onBack={() => setSelected(null)} onChanged={load} />;

  // Past reviews stay readable even if the add-on lapses.
  if (!entitlement && reviews.length === 0) return <EnterpriseUpsell />;

  const used = reviews.filter((r) => r.status !== "cancelled").length;
  const remaining = entitlement?.reviews_included != null ? Math.max(0, entitlement.reviews_included - used) : null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 border-violet-300 text-violet-700">Enterprise</Badge>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><Briefcase className="h-7 w-7 text-violet-600" /> Analyst Portfolio Review</h1>
          <p className="text-muted-foreground mt-1">Upload a portfolio and get a bespoke written review from a FlowPulse analyst.</p>
        </div>
        <div className="flex items-center gap-3">
          {remaining !== null && <span className="text-sm text-muted-foreground">{remaining} review{remaining === 1 ? "" : "s"} remaining</span>}
          <Button onClick={() => setNewOpen(true)} disabled={!entitlement || remaining === 0}><Plus className="h-4 w-4 mr-1" /> New review</Button>
        </div>
      </div>

      {!entitlement && <p className="text-sm text-amber-700">Your Portfolio Review add-on isn't active, so you can read past reviews but not request new ones.</p>}

      {reviews.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-medium">No reviews yet</p>
            <p className="text-sm text-muted-foreground">Start by uploading an export of your holdings.</p>
            <Button onClick={() => setNewOpen(true)}><Upload className="h-4 w-4 mr-1" /> Upload portfolio</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {reviews.map((r) => (
            <button key={r.id} onClick={() => setSelected(r.id)} className="text-left">
              <Card className="hover:border-violet-300 transition-colors">
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.review?.headline || r.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.title} · {(r.holdings?.length ?? 0)} holdings · {money(r.total_value ?? 0, r.base_currency)} · {new Date(r.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${STATUS_TONE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      <NewReviewDialog open={newOpen} onOpenChange={setNewOpen} onSubmitted={load} />
    </div>
  );
}
