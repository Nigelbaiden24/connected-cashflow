import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Award, BellRing, Bitcoin, ChartBar, Search, Sparkles, TrendingUp, TrendingDown, Calendar, Zap, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  symbol: string;
  name: string;
  asset_type: string;
  logo_url: string | null;
  activity_type: string;
  headline: string;
  summary: string | null;
  analyst_rating: string | null;
  conviction_score: number | null;
  past_performance: string | null;
  future_outlook: string | null;
  catalysts: string[] | null;
  risks: string[] | null;
  scan_date: string;
  source: string;
  platform: string | null;
  created_at: string;
}

const ratingStyles: Record<string, string> = {
  Gold: "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow shadow-amber-200",
  Silver: "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900",
  Bronze: "bg-gradient-to-r from-orange-400 to-amber-600 text-white",
  Neutral: "bg-slate-200 text-slate-700",
  Negative: "bg-gradient-to-r from-rose-400 to-red-500 text-white",
};

interface Props {
  platform: "finance" | "investor";
}

export function AnalystActivityFeed({ platform }: Props) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "stock" | "crypto">("all");
  const [q, setQ] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("stocks_crypto_analyst_activity")
      .select("*")
      .eq("is_promoted", true)
      .or(`platform.is.null,platform.eq.${platform},platform.eq.both`)
      .order("created_at", { ascending: false })
      .limit(120);
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    const ch = supabase
      .channel(`analyst-activity-${platform}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "stocks_crypto_analyst_activity" }, () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  const filtered = useMemo(() => items.filter((i) => {
    const t = filter === "all" || i.asset_type === filter;
    const s = !q || i.headline.toLowerCase().includes(q.toLowerCase()) || i.symbol.toLowerCase().includes(q.toLowerCase()) || i.name.toLowerCase().includes(q.toLowerCase());
    return t && s;
  }), [items, filter, q]);

  const stats = useMemo(() => ({
    total: items.length,
    avg: items.length ? (items.reduce((a, b) => a + (Number(b.conviction_score) || 0), 0) / items.length).toFixed(2) : "—",
    today: items.filter((i) => i.scan_date === new Date().toISOString().slice(0, 10)).length,
    high: items.filter((i) => (Number(i.conviction_score) || 0) >= 4).length,
  }), [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Analyst Activity Live Feed
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Real-time analyst posts, AI-driven scans and rating updates from the FlowPulse desk.</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 min-w-[420px]">
              <Stat label="Total" value={stats.total} icon={Activity} />
              <Stat label="Today" value={stats.today} icon={Calendar} />
              <Stat label="High Conv." value={stats.high} icon={Sparkles} />
              <Stat label="Avg Score" value={stats.avg} icon={Award} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by symbol, name or headline..." className="pl-10" />
          </div>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
            {(["all", "stock", "crypto"] as const).map((t) => (
              <Button key={t} size="sm" variant={filter === t ? "default" : "ghost"} className="capitalize" onClick={() => setFilter(t)}>
                {t === "stock" ? <ChartBar className="h-3.5 w-3.5 mr-1" /> : t === "crypto" ? <Bitcoin className="h-3.5 w-3.5 mr-1" /> : null}
                {t === "all" ? "All" : t === "stock" ? "Equities" : "Digital"}
              </Button>
            ))}
          </div>
          <Badge className="ml-auto bg-primary/10 text-primary border-0">{filtered.length} live</Badge>
        </CardContent>
      </Card>

      {/* Feed */}
      <ScrollArea className="h-[640px] pr-3">
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          ) : filtered.length === 0 ? (
            <Card className="border-dashed border-slate-300">
              <CardContent className="py-14 text-center text-slate-500">
                <Activity className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                No analyst activity yet. New posts will stream in here in real time.
              </CardContent>
            </Card>
          ) : (
            filtered.map((it) => <ActivityCard key={it.id} item={it} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-white border border-slate-200">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-lg font-bold text-slate-900 leading-tight">{value}</div>
    </div>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  const score = Number(item.conviction_score) || 0;
  const ratingClass = ratingStyles[item.analyst_rating || "Neutral"] || ratingStyles.Neutral;
  const isHigh = score >= 4;
  return (
    <Card className={`border-l-4 ${isHigh ? "border-l-emerald-500" : score >= 3 ? "border-l-blue-500" : "border-l-slate-300"} bg-white hover:shadow-md transition-all`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {item.logo_url ? (
              <img src={item.logo_url} alt={item.symbol} className="h-10 w-10 rounded-full bg-slate-100" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
                {item.symbol.slice(0, 3)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900">{item.symbol}</span>
                  <span className="text-xs text-slate-500 truncate">· {item.name}</span>
                  <Badge variant="outline" className="text-[10px]">{item.asset_type === "crypto" ? "Crypto" : "Equity"}</Badge>
                  {item.source === "ai_scan" && (
                    <Badge className="text-[10px] bg-violet-100 text-violet-700 border-0"><Sparkles className="h-2.5 w-2.5 mr-1" />AI Scan</Badge>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mt-1 leading-snug">{item.headline}</h3>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge className={`${ratingClass} border-0 text-[10px] px-2 py-0.5`}>{item.analyst_rating}</Badge>
                <div className="text-xs font-bold text-slate-700">{score.toFixed(1)}<span className="text-slate-400 font-normal">/5</span></div>
              </div>
            </div>

            {item.summary && <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.summary}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              {item.past_performance && (
                <div className="p-2 rounded-md bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Past Performance</div>
                  <p className="text-xs text-slate-700 mt-0.5">{item.past_performance}</p>
                </div>
              )}
              {item.future_outlook && (
                <div className="p-2 rounded-md bg-emerald-50/60 border border-emerald-100">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Future Outlook</div>
                  <p className="text-xs text-emerald-900 mt-0.5">{item.future_outlook}</p>
                </div>
              )}
            </div>

            {(item.catalysts?.length || item.risks?.length) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {!!item.catalysts?.length && (
                  <div className="p-2 rounded-md bg-blue-50/60 border border-blue-100">
                    <div className="text-[10px] uppercase tracking-wider text-blue-700 font-semibold flex items-center gap-1"><Zap className="h-3 w-3" /> Catalysts</div>
                    <ul className="list-disc list-inside text-xs text-blue-900 mt-0.5 space-y-0.5">{item.catalysts.slice(0,4).map((c,i)=><li key={i}>{c}</li>)}</ul>
                  </div>
                )}
                {!!item.risks?.length && (
                  <div className="p-2 rounded-md bg-rose-50/60 border border-rose-100">
                    <div className="text-[10px] uppercase tracking-wider text-rose-700 font-semibold flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Risks</div>
                    <ul className="list-disc list-inside text-xs text-rose-900 mt-0.5 space-y-0.5">{item.risks.slice(0,4).map((c,i)=><li key={i}>{c}</li>)}</ul>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
              <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
              <span>Scan date · {item.scan_date}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
