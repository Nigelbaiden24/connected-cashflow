import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Play, RefreshCw, Activity, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
        <div className="flex gap-2">
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
                        {e.source_url && (
                          <a href={e.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
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
