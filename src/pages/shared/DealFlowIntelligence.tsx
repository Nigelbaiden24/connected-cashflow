import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Loader2, ExternalLink, Sparkles, Search, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface IntelEvent {
  id: string;
  title: string | null;
  summary: string | null;
  event_type: string;
  amount_value: number | null;
  amount_currency: string | null;
  status: string;
  confidence_score: number | null;
  source_url: string | null;
  created_at: string;
}

interface Promoted {
  id: string;
  title: string;
  summary: string | null;
  category: string | null;
  source: string;
  ai_score: number | null;
  source_url: string | null;
  reviewed_at: string | null;
  target_table: string | null;
  target_platform: string | null;
}

interface Props { platform: "finance" | "investor" }

export default function DealFlowIntelligence({ platform }: Props) {
  const [promoted, setPromoted] = useState<Promoted[]>([]);
  const [events, setEvents] = useState<IntelEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const accent = platform === "finance" ? "from-blue-600 to-cyan-600" : "from-violet-600 to-fuchsia-600";

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p }, { data: e }] = await Promise.all([
      supabase.from("pipeline_pending_items" as any)
        .select("id, source, target_table, target_platform, title, summary, category, source_url, ai_score, reviewed_at")
        .eq("status", "promoted")
        .or(`target_platform.eq.${platform},target_platform.is.null`)
        .order("reviewed_at", { ascending: false })
        .limit(80),
      supabase.from("intel_events" as any)
        .select("id, title, summary, event_type, amount_value, amount_currency, status, confidence_score, source_url, created_at")
        .in("status", ["validated", "verified"])
        .order("created_at", { ascending: false })
        .limit(40),
    ]);
    setPromoted(((p as any) ?? []) as Promoted[]);
    setEvents(((e as any) ?? []) as IntelEvent[]);
    setLoading(false);
  }, [platform]);

  useEffect(() => {
    void load();
    const ch = supabase
      .channel(`dealflow-${platform}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_pending_items" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "intel_events" }, () => void load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load, platform]);

  const filtered = promoted.filter(p => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (p.title?.toLowerCase().includes(q) || p.source?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${accent} p-6 text-white shadow-xl`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Activity className="h-7 w-7" /> Deal Flow Intelligence
            </h1>
            <p className="text-white/80 mt-1 text-sm max-w-2xl">
              Validated, analyst-promoted deal-flow signals from the FlowPulse intelligence pipeline.
            </p>
          </div>
          <Button onClick={load} variant="secondary" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/20">
            <div className="text-[10px] uppercase tracking-wider text-white/60">Promoted Deals</div>
            <div className="text-2xl font-bold">{promoted.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/20">
            <div className="text-[10px] uppercase tracking-wider text-white/60">Validated Events</div>
            <div className="text-2xl font-bold">{events.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/20">
            <div className="text-[10px] uppercase tracking-wider text-white/60">Avg AI Score</div>
            <div className="text-2xl font-bold">
              {promoted.length ? `${(promoted.reduce((a, p) => a + (Number(p.ai_score) || 0), 0) / promoted.length).toFixed(1)}/5` : "—"}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-500" /> Analyst-Promoted Deals</CardTitle>
            <CardDescription>Curated and verified by the FlowPulse research desk before being released to the platform.</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="h-9 pl-8 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No promoted deals yet. New deals will appear here as the research desk validates them.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <div key={p.id} className="rounded-xl border border-border p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[260px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{p.title}</h3>
                        {p.ai_score != null && (
                          <Badge variant="outline" className="text-[10px]">AI {Number(p.ai_score).toFixed(1)}/5</Badge>
                        )}
                        {p.category && <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>}
                        <Badge variant="outline" className="text-[10px]">{p.source}</Badge>
                        <Badge className="text-[10px] bg-emerald-600 text-white">Promoted</Badge>
                      </div>
                      {p.summary && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{p.summary}</p>}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        {p.reviewed_at && <span>{formatDistanceToNow(new Date(p.reviewed_at), { addSuffix: true })}</span>}
                        {p.source_url && (
                          <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            source <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Recent Intelligence Events</CardTitle>
          <CardDescription>Latest validated deal-flow signals from the intelligence pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No events yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Seen</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="max-w-md">
                        <div className="font-medium truncate text-sm">{e.title}</div>
                        {e.summary && <div className="text-xs text-muted-foreground truncate">{e.summary}</div>}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{e.event_type}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {e.amount_value ? `${e.amount_currency ?? ""} ${e.amount_value.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell className="text-xs">{e.confidence_score != null ? `${Math.round(Number(e.confidence_score) * 100)}%` : "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {e.source_url && (
                          <a href={e.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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
