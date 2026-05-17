import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Compass, Search, Loader2, TrendingUp, AlertTriangle, Activity, Sparkles } from "lucide-react";

interface Pick {
  id: string;
  symbol: string | null;
  asset_name: string | null;
  asset_type: string | null;
  discovery_bucket: string | null;
  sector: string | null;
  thesis: string | null;
  catalysts: any;
  risks: any;
  score: number | null;
  conviction: string | null;
  valuation_metrics: any;
  momentum_metrics: any;
  promoted_at: string;
}

interface Props {
  platform: "finance" | "investor";
}

const accent = (p: "finance" | "investor") =>
  p === "finance"
    ? { ring: "from-blue-500/20 to-cyan-500/10", chip: "border-blue-500/40 text-blue-300", title: "text-blue-300", glow: "from-blue-600 to-cyan-600" }
    : { ring: "from-violet-500/20 to-fuchsia-500/10", chip: "border-violet-500/40 text-violet-300", title: "text-violet-300", glow: "from-violet-600 to-fuchsia-600" };

export default function DiscoveryEnginePage({ platform }: Props) {
  const a = accent(platform);
  const [rows, setRows] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bucket, setBucket] = useState<string>("all");
  const [minScore, setMinScore] = useState<string>("0");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("platform_discovery_picks")
        .select("*")
        .eq("status", "active")
        .or(`platform.eq.${platform},platform.eq.both,platform.is.null`)
        .order("score", { ascending: false })
        .order("promoted_at", { ascending: false })
        .limit(120);
      setRows((data as Pick[]) || []);
      setLoading(false);
    })();
  }, [platform]);

  const buckets = useMemo(() => Array.from(new Set(rows.map((r) => r.discovery_bucket).filter(Boolean) as string[])).sort(), [rows]);

  const filtered = rows.filter((r) => {
    if (bucket !== "all" && r.discovery_bucket !== bucket) return false;
    if (Number(minScore) > 0 && (r.score ?? 0) < Number(minScore)) return false;
    if (search) {
      const s = search.toLowerCase();
      if (![r.symbol, r.asset_name, r.sector, r.thesis].some((x) => (x || "").toLowerCase().includes(s))) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <div className={`relative border-b border-slate-800 bg-gradient-to-br ${a.ring} backdrop-blur-xl`}>
        <div className="px-6 py-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${a.glow} shadow-lg`}>
              <Compass className="w-5 h-5 text-white" />
            </div>
            <Badge variant="outline" className={`uppercase tracking-wider text-[10px] ${a.chip}`}>AI Analyst</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Discovery Engine</h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            Forward-looking opportunities surfaced by FlowPulse's analyst engine — valuation, momentum, earnings, sentiment
            and institutional flow signals fused into a single conviction score.
          </p>
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto space-y-5">
        <Card className="p-4 bg-slate-900/60 border-slate-800 backdrop-blur-xl flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search symbol, sector or thesis…" className="pl-8 bg-slate-950/60 border-slate-800" />
          </div>
          <Select value={bucket} onValueChange={setBucket}>
            <SelectTrigger className="w-[200px] bg-slate-950/60 border-slate-800"><SelectValue placeholder="Bucket" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All buckets</SelectItem>
              {buckets.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={minScore} onValueChange={setMinScore}>
            <SelectTrigger className="w-[180px] bg-slate-950/60 border-slate-800"><SelectValue placeholder="Min conviction" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any conviction</SelectItem>
              <SelectItem value="2.5">≥ 2.5 / 5</SelectItem>
              <SelectItem value="3.5">≥ 3.5 / 5</SelectItem>
              <SelectItem value="4">≥ 4.0 / 5</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="ml-auto text-slate-300 border-slate-700">{filtered.length} picks</Badge>
        </Card>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading discovery picks…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <Card className="p-10 bg-slate-900/60 border-slate-800 text-center">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No discovery picks promoted yet. New AI opportunities will appear here as soon as the analyst desk promotes them.</p>
          </Card>
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r) => {
            const score = Number(r.score ?? 0);
            const pct = Math.min(100, (score / 5) * 100);
            return (
              <Card key={r.id} className="p-5 bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:-translate-y-0.5 transition shadow-xl shadow-black/20">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className={`font-bold text-lg ${a.title}`}>{r.symbol || r.asset_name}</h3>
                    {r.asset_name && r.symbol && <p className="text-xs text-slate-400">{r.asset_name}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-500 tracking-wider">Conviction</p>
                    <p className="text-xl font-bold text-white tabular-nums">{score.toFixed(1)}<span className="text-xs text-slate-500">/5</span></p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">
                  <div className={`h-full bg-gradient-to-r ${a.glow}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {r.discovery_bucket && <Badge variant="outline" className={`text-[10px] ${a.chip}`}>{r.discovery_bucket}</Badge>}
                  {r.sector && <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">{r.sector}</Badge>}
                  {r.asset_type && <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">{r.asset_type}</Badge>}
                  {r.conviction && <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-300">{r.conviction}</Badge>}
                </div>
                {r.thesis && <p className="text-xs text-slate-200 leading-relaxed line-clamp-4">{r.thesis}</p>}
                {Array.isArray(r.catalysts) && r.catalysts.length > 0 && (
                  <div className="mt-3 p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/>Catalysts</p>
                    <ul className="space-y-0.5 text-[11px] text-slate-200">{r.catalysts.slice(0, 3).map((c: any, i: number) => <li key={i}>• {String(c?.title || c?.text || c)}</li>)}</ul>
                  </div>
                )}
                {Array.isArray(r.risks) && r.risks.length > 0 && (
                  <div className="mt-2 p-2 rounded bg-rose-500/5 border border-rose-500/20">
                    <p className="text-[10px] uppercase tracking-wider text-rose-300 font-semibold mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>Risks</p>
                    <ul className="space-y-0.5 text-[11px] text-slate-200">{r.risks.slice(0, 3).map((c: any, i: number) => <li key={i}>• {String(c?.title || c?.text || c)}</li>)}</ul>
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-3 flex items-center gap-1"><Activity className="w-3 h-3"/>Promoted {new Date(r.promoted_at).toLocaleDateString()}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
