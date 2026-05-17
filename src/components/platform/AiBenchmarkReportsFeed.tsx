import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Loader2 } from "lucide-react";

interface Row {
  id: string;
  title: string;
  description: string;
  impact: string;
  timeframe: string;
  created_at: string;
}

export default function AiBenchmarkReportsFeed({ platform }: { platform: "finance" | "investor" }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("market_trends")
        .select("*")
        .eq("source", "ai_benchmark_report")
        .eq("is_published", true)
        .or(`platform.eq.${platform},platform.eq.both,platform.is.null`)
        .order("created_at", { ascending: false })
        .limit(15);
      setRows((data as Row[]) || []);
      setLoading(false);
    })();
  }, [platform]);

  if (!loading && rows.length === 0) return null;

  return (
    <Card className="p-5 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        <div>
          <h3 className="font-semibold text-base">AI Benchmark Reports</h3>
          <p className="text-xs text-muted-foreground">Cross-asset performance reports promoted from the analyst desk.</p>
        </div>
      </div>
      {loading && <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin"/>Loading…</div>}
      <div className="grid md:grid-cols-2 gap-3">
        {rows.map((r) => (
          <Card key={r.id} className="p-4 bg-slate-950/60 border-slate-800">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm text-cyan-300">{r.title}</h4>
              <Badge variant="outline" className="text-[10px] uppercase">{r.impact}</Badge>
            </div>
            <p className="text-xs text-slate-300 line-clamp-4">{r.description}</p>
            <p className="text-[10px] text-slate-500 mt-2">{new Date(r.created_at).toLocaleDateString()} · {r.timeframe}</p>
          </Card>
        ))}
      </div>
    </Card>
  );
}
