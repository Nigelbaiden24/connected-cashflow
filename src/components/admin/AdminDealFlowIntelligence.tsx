import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Play, RefreshCw, Activity, AlertTriangle, CheckCircle2, ExternalLink, Rocket, X, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { autoPromoteScrape } from "@/lib/autoPromoteScrape";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface IntelEvent {
  id: string;
  title: string | null;
  summary: string | null;
  event_type: string;
  funding_stage: string | null;
  amount_value: number | null;
  amount_currency: string | null;
  status: string;
  confidence: string | null;
  confidence_score: number | null;
  source_url: string | null;
  created_at: string;
  company_id: string | null;
}

const statusColors: Record<string, string> = {
  new: "bg-slate-500",
  validated: "bg-emerald-600",
  rejected: "bg-rose-600",
  reviewed: "bg-blue-600",
};

export function AdminDealFlowIntelligence() {
  const [events, setEvents] = useState<IntelEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ total: 0, validated: 0, alerts: 0 });
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [targetPlatform, setTargetPlatform] = useState<"finance" | "investor" | "both">("both");
  const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set());
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [manual, setManual] = useState({
    title: "",
    summary: "",
    event_type: "funding_round",
    funding_stage: "",
    amount_value: "",
    amount_currency: "GBP",
    source_url: "",
  });

  const reject = async (e: IntelEvent) => {
    setRejectingId(e.id);
    try {
      const { error } = await supabase.from("intel_events").update({ status: "rejected" }).eq("id", e.id);
      if (error) throw error;
      setRejectedIds((s) => new Set(s).add(e.id));
      setEvents((evs) => evs.map((x) => (x.id === e.id ? { ...x, status: "rejected" } : x)));
      toast.success("Deal rejected");
    } catch (err: any) {
      toast.error(`Reject failed: ${err.message ?? err}`);
    } finally {
      setRejectingId(null);
    }
  };

  const addManualDeal = async () => {
    if (!manual.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setAddSaving(true);
    try {
      const amt = manual.amount_value ? Number(manual.amount_value.replace(/[^0-9.]/g, "")) : null;
      const { data, error } = await supabase.from("intel_events").insert({
        title: manual.title.trim(),
        summary: manual.summary || null,
        event_type: manual.event_type || "manual",
        funding_stage: manual.funding_stage || null,
        amount_value: amt,
        amount_currency: manual.amount_currency || "GBP",
        source_url: manual.source_url || null,
        status: "new",
        confidence: "high",
        confidence_score: 0.9,
        raw_data: { source: "manual_admin_entry" } as any,
        structured_data: { source: "manual_admin_entry" } as any,
      }).select().single();
      if (error) throw error;
      toast.success("Manual deal added");
      setAddOpen(false);
      setManual({ title: "", summary: "", event_type: "funding_round", funding_stage: "", amount_value: "", amount_currency: "GBP", source_url: "" });
      await load();
      // Auto-promote if user wants — leave to manual click. Surface row.
      void data;
    } catch (err: any) {
      toast.error(`Add failed: ${err.message ?? err}`);
    } finally {
      setAddSaving(false);
    }
  };

  const promote = async (e: IntelEvent) => {
    setPromotingId(e.id);
    try {
      const platforms: Array<"finance" | "investor"> =
        targetPlatform === "both" ? ["finance", "investor"] : [targetPlatform];
      let ok = 0;
      for (const p of platforms) {
        const res = await autoPromoteScrape({
          source: "deal-flow-intelligence",
          platform: p,
          targetTable: p === "investor" ? "investor_finder_opportunities" : "opportunity_products",
          title: e.title ?? "Untitled deal",
          summary: e.summary,
          category: e.event_type,
          sourceUrl: e.source_url,
          enriched: {
            description: e.summary,
            sector: e.event_type,
            stage: e.funding_stage,
            ticket_size_min: e.amount_value,
            currency: e.amount_currency ?? "GBP",
            confidence: e.confidence,
          },
          aiScore: Math.min(5, Math.max(0, (e.confidence_score ?? 0.6) * 5)),
          aiTags: [e.event_type, e.funding_stage].filter(Boolean) as string[],
        });
        if (res.ok) ok++;
        else toast.error(`Promote to ${p} failed: ${res.error}`);
      }
      if (ok > 0) {
        toast.success(`Promoted to ${ok} platform${ok > 1 ? "s" : ""}`);
        setPromotedIds((s) => new Set(s).add(e.id));
        await supabase.from("intel_events").update({ status: "validated" }).eq("id", e.id);
      }
    } finally {
      setPromotingId(null);
    }
  };

  const load = async () => {
    setLoading(true);
    const [{ data: ev }, { count: total }, { count: validated }, { count: alerts }] = await Promise.all([
      supabase.from("intel_events").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("intel_events").select("*", { count: "exact", head: true }),
      supabase.from("intel_events").select("*", { count: "exact", head: true }).eq("status", "validated"),
      supabase.from("intel_alerts").select("*", { count: "exact", head: true }).eq("status", "new"),
    ]);
    setEvents((ev as IntelEvent[]) ?? []);
    setStats({ total: total ?? 0, validated: validated ?? 0, alerts: alerts ?? 0 });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runPipeline = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("intel-orchestrate", { body: {} });
      if (error) throw error;
      toast.success(`Pipeline complete · ingested ${data?.ingest?.ingested ?? 0}, validated ${data?.validate?.processed ?? 0}`);
      await load();
    } catch (e: any) {
      toast.error(`Pipeline failed: ${e.message ?? e}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-fuchsia-600" />
            Deal Flow Intelligence
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            PitchBook-lite ingestion — Firecrawl → AI extraction → structured deal events.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={targetPlatform} onValueChange={(v) => setTargetPlatform(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Both platforms</SelectItem>
              <SelectItem value="finance">Finance only</SelectItem>
              <SelectItem value="investor">Investor only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={runPipeline} disabled={running} className="bg-gradient-to-r from-fuchsia-600 to-pink-600">
            {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Run Pipeline Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total Events</CardDescription><CardTitle className="text-3xl">{stats.total}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Validated</CardDescription><CardTitle className="text-3xl flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" />{stats.validated}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Open Alerts</CardDescription><CardTitle className="text-3xl flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />{stats.alerts}</CardTitle></CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest 50 candidate & validated events from the intelligence pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No events yet. Click <strong>Run Pipeline Now</strong> to start ingesting.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Seen</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="max-w-md">
                        <div className="font-medium truncate">{e.title}</div>
                        {e.summary && <div className="text-xs text-muted-foreground truncate">{e.summary}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{e.event_type}{e.funding_stage ? ` · ${e.funding_stage}` : ""}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {e.amount_value ? `${e.amount_currency ?? ""} ${e.amount_value.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell>
                        {e.confidence_score != null ? `${Math.round(e.confidence_score * 100)}%` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[e.status] ?? "bg-slate-500"} text-white`}>{e.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {e.source_url && (
                            <a href={e.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant={promotedIds.has(e.id) ? "secondary" : "default"}
                            disabled={promotedIds.has(e.id) || promotingId === e.id}
                            onClick={() => promote(e)}
                            className="h-7 gap-1"
                          >
                            {promotingId === e.id ? <Loader2 className="h-3 w-3 animate-spin" /> :
                              promotedIds.has(e.id) ? <CheckCircle2 className="h-3 w-3" /> : <Rocket className="h-3 w-3" />}
                            {promotedIds.has(e.id) ? "Promoted" : "Promote"}
                          </Button>
                        </div>
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
