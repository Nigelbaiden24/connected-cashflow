import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Newspaper, Play, Check, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Landmark, Briefcase, Globe2 } from "lucide-react";

interface Commentary {
  id: string;
  headline: string;
  executive_summary: string | null;
  mobile_summary: string | null;
  analyst_commentary: string | null;
  retail_breakdown: string | null;
  push_summary: string | null;
  sections: any;
  why_moved: string | null;
  beneficiary_sectors: string | null;
  institutional_flows: string | null;
  risks_ahead: string | null;
  market_implications: string | null;
  confidence_score: number | null;
  status: string;
  created_at: string;
}

const SECTION_LABELS: Record<string, string> = {
  indices: "Indices",
  interest_rates: "Interest Rates",
  inflation: "Inflation",
  central_banks: "Central Banks",
  commodities: "Commodities",
  crypto: "Crypto",
  geopolitics: "Geopolitics",
  sector_rotation: "Sector Rotation",
  earnings_sentiment: "Earnings Sentiment",
};

export default function MarketCommentaryPanel() {
  const { toast } = useToast();
  const [items, setItems] = useState<Commentary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("analyst_market_commentary")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data as Commentary[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyst-market-commentary");
      if (error) throw error;
      toast({ title: "Commentary generated", description: `Drew on ${data?.signals_used || 0} signals.` });
      await load();
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message || "Unknown error", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const setStatus = async (id: string, status: "promoted" | "rejected") => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("analyst_market_commentary").update({
      status,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: status === "promoted" ? "Approved" : "Rejected" }); await load(); }
  };

  const promote = async (id: string, platform: "finance" | "investor" | "both") => {
    try {
      const { data, error } = await supabase.rpc("promote_analyst_market_commentary" as any, {
        _commentary_id: id,
        _platform: platform,
      });
      if (error) throw error;
      const result = data as { ok?: boolean; error?: string } | null;
      if (!result?.ok) throw new Error(result?.error || "Promotion failed");
      const dest = platform === "both" ? "Finance + Investor" : platform === "finance" ? "FlowPulse Finance" : "FlowPulse Investor";
      toast({ title: "Promoted", description: `Published to ${dest}.` });
      await load();
    } catch (e: any) {
      console.error("[MarketCommentaryPanel] promote failed", e);
      toast({ title: "Promote failed", description: e.message || "Unknown error", variant: "destructive" });
    }
  };

  return (
    <Card className="p-5 bg-slate-900/60 border-slate-700 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold">Daily Market Commentary</h3>
          <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">{items.filter((i) => i.status === "pending").length} pending</Badge>
        </div>
        <Button onClick={generate} disabled={generating} size="sm" className="bg-gradient-to-r from-amber-600 to-orange-600">
          {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
          Generate commentary
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No commentary yet — click <strong>Generate commentary</strong> to produce your first institutional market wrap.</p>
      )}

      <div className="space-y-3">
        {items.map((c) => (
          <div key={c.id} className="rounded-lg border border-slate-700 bg-slate-950/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="outline" className={
                    c.status === "promoted" ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                    : c.status === "rejected" ? "border-rose-500/40 text-rose-300 bg-rose-500/10"
                    : "border-amber-500/40 text-amber-300 bg-amber-500/10"
                  }>{c.status}</Badge>
                  {typeof c.confidence_score === "number" && (
                    <Badge variant="outline" className="border-violet-500/40 text-violet-300">Confidence {c.confidence_score}/100</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <h4 className="font-semibold text-base">{c.headline}</h4>
              </div>
              {c.status === "pending" && (
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="bg-emerald-600/90 hover:bg-emerald-600 text-white">
                        <Check className="w-3.5 h-3.5 mr-1.5" /> Promote
                        <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-slate-950 border-slate-800 text-slate-200">
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-500">
                        Publish to platform
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-800" />
                      <DropdownMenuItem onClick={() => promote(c.id, "finance")} className="focus:bg-slate-900 cursor-pointer">
                        <Landmark className="w-3.5 h-3.5 mr-2 text-blue-400" />
                        <span className="text-xs font-medium">FlowPulse Finance</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => promote(c.id, "investor")} className="focus:bg-slate-900 cursor-pointer">
                        <Briefcase className="w-3.5 h-3.5 mr-2 text-purple-400" />
                        <span className="text-xs font-medium">FlowPulse Investor</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-800" />
                      <DropdownMenuItem onClick={() => promote(c.id, "both")} className="focus:bg-slate-900 cursor-pointer">
                        <Globe2 className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                        <span className="text-xs font-medium">Both platforms</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "rejected")} className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10">
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>

            {c.mobile_summary && (
              <div className="mt-2 p-2 rounded bg-amber-500/5 border border-amber-500/20 text-sm text-amber-100">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold mr-2">Mobile</span>
                {c.mobile_summary}
              </div>
            )}
            {c.push_summary && (
              <div className="mt-2 p-2 rounded bg-purple-500/5 border border-purple-500/20 text-sm text-purple-100">
                <span className="text-[10px] uppercase tracking-wider text-purple-300 font-semibold mr-2">Push</span>
                {c.push_summary}
              </div>
            )}

            <details className="mt-3 group">
              <summary className="cursor-pointer text-xs text-amber-300 hover:text-amber-200 font-semibold uppercase tracking-wider">View full commentary ▾</summary>
              <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-3 text-sm">
                {c.executive_summary && <Section label="Executive Summary" body={c.executive_summary} />}
                {c.analyst_commentary && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">Analyst Commentary</p>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-200">
                      <ReactMarkdown>{c.analyst_commentary}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {c.retail_breakdown && <Section label="Retail Breakdown" body={c.retail_breakdown} />}
                {c.why_moved && <Section label="Why Markets Moved" body={c.why_moved} />}
                {c.beneficiary_sectors && <Section label="Beneficiary Sectors" body={c.beneficiary_sectors} />}
                {c.institutional_flows && <Section label="Institutional Flows" body={c.institutional_flows} />}
                {c.risks_ahead && <Section label="Risks Ahead" body={c.risks_ahead} />}
                {c.market_implications && <Section label="Market Implications" body={c.market_implications} />}

                {c.sections && typeof c.sections === "object" && (
                  <div className="grid md:grid-cols-2 gap-2 mt-2">
                    {Object.entries(c.sections).map(([k, v]) => (
                      v ? (
                        <div key={k} className="rounded border border-slate-700/60 bg-slate-900/40 p-2">
                          <p className="text-[10px] uppercase tracking-wider text-cyan-300 mb-1 font-semibold">{SECTION_LABELS[k] || k}</p>
                          <p className="text-xs text-slate-200">{String(v)}</p>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            </details>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">{label}</p>
      <p className="text-slate-200 leading-relaxed">{body}</p>
    </div>
  );
}
