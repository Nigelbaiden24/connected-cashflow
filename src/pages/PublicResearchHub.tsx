import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Lock,
  TrendingUp,
  Coins,
  ArrowRight,
  Sparkles,
  Loader2,
  FileText,
  ShieldCheck,
  Activity,
  Gauge,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface ResearchRow {
  id: string;
  asset_type: "stock" | "crypto";
  asset_name: string;
  asset_symbol: string | null;
  overall_quality_score: number | null;
  risk_score: number | null;
  valuation_score: number | null;
  esg_score: number | null;
  confidence_level: "high" | "medium" | "low" | null;
  generated_at: string;
}

export default function PublicResearchHub() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [reports, setReports] = useState<ResearchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"stock" | "crypto">("stock");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("asset_research_reports")
        .select(
          "id,asset_type,asset_name,asset_symbol,overall_quality_score,risk_score,valuation_score,esg_score,confidence_level,generated_at"
        )
        .in("asset_type", ["stock", "crypto"])
        .order("generated_at", { ascending: false })
        .limit(60);
      setReports((data ?? []) as unknown as ResearchRow[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => reports.filter((r) => r.asset_type === tab),
    [reports, tab]
  );

  const handleOpen = (r: ResearchRow) => {
    if (!isAuthed) {
      navigate(`/login-investor?redirect=/investor/${r.asset_type}-research`);
      return;
    }
    navigate(`/investor/${r.asset_type}-research`);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-amber-400/30">
      {/* Ambient gradient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[1200px] rounded-full bg-gradient-to-br from-indigo-600/20 via-sky-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[800px] rounded-full bg-gradient-to-tl from-amber-500/10 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#070b14]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
            <span className="font-semibold tracking-tight text-white">FlowPulse</span>
            <Badge variant="outline" className="ml-2 border-white/10 text-[10px] uppercase tracking-widest text-slate-300">
              Research
            </Badge>
          </button>
          <div className="flex items-center gap-2">
            {!isAuthed && (
              <>
                <Button variant="ghost" className="text-slate-200 hover:text-white hover:bg-white/5" onClick={() => navigate("/login-investor")}>
                  Sign in
                </Button>
                <Button className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 font-semibold" onClick={() => navigate("/login-investor")}>
                  Get access <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Institutional-grade analyst desk
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight text-white">
          The FlowPulse <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Research Vault</span>
        </h1>
        <p className="text-slate-400 mt-5 max-w-2xl mx-auto text-lg leading-relaxed">
          Deep-dive equity and digital asset research curated by our analyst desk. Quality, risk, valuation and ESG scored on a 0–5 institutional scale.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Independent coverage
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <Activity className="h-3.5 w-3.5 text-sky-400" /> Updated continuously
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <Gauge className="h-3.5 w-3.5 text-amber-400" /> 0–5 conviction scoring
          </span>
        </div>
      </section>

      {/* Tabs + Grid */}
      <section className="container mx-auto px-4 pb-24">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "stock" | "crypto")} className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="bg-white/5 border border-white/10 backdrop-blur p-1 h-auto">
              <TabsTrigger
                value="stock"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-950 text-slate-300 px-6 py-2.5 rounded-md"
              >
                <TrendingUp className="h-4 w-4 mr-2" /> Stock Research
              </TabsTrigger>
              <TabsTrigger
                value="crypto"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-950 text-slate-300 px-6 py-2.5 rounded-md"
              >
                <Coins className="h-4 w-4 mr-2" /> Crypto Research
              </TabsTrigger>
            </TabsList>
          </div>

          {(["stock", "crypto"] as const).map((t) => (
            <TabsContent key={t} value={t}>
              {loading || authLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                </div>
              ) : filtered.length === 0 ? (
                <Card className="border-white/10 bg-white/[0.02]">
                  <CardContent className="py-20 text-center">
                    <FileText className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-400">No {t} reports published yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative">
                  <div
                    className={`grid gap-5 md:grid-cols-2 lg:grid-cols-3 ${
                      !isAuthed ? "max-h-[1200px] overflow-hidden" : ""
                    }`}
                  >
                    {filtered.map((r, i) => (
                      <ReportCard
                        key={r.id}
                        report={r}
                        blurred={!isAuthed && i >= 3}
                        onOpen={() => handleOpen(r)}
                      />
                    ))}
                  </div>

                  {!isAuthed && filtered.length > 3 && (
                    <div className="absolute inset-x-0 bottom-0 h-[500px] bg-gradient-to-t from-[#070b14] via-[#070b14]/95 to-transparent flex flex-col items-center justify-end pb-12">
                      <div className="text-center w-full max-w-lg mx-auto px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 mb-5">
                          <Lock className="h-7 w-7 text-amber-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">
                          Unlock the full research desk
                        </h3>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                          Sign in to access complete reports, download institutional PDFs, and receive live coverage updates from our analyst team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 font-semibold"
                            onClick={() => navigate("/login-investor")}
                          >
                            Sign in to read <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                            onClick={() => navigate("/login-investor")}
                          >
                            Create account
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  tint,
}: {
  label: string;
  value: number | null;
  tint: string;
}) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{label}</span>
        <span className="text-slate-200 font-medium tabular-nums">{value ?? 0}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div className={`h-full rounded-full ${tint}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function ReportCard({
  report,
  blurred,
  onOpen,
}: {
  report: ResearchRow;
  blurred: boolean;
  onOpen: () => void;
}) {
  const dateStr = format(new Date(report.generated_at), "PP");
  const isStock = report.asset_type === "stock";

  const confidenceColor =
    report.confidence_level === "high"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : report.confidence_level === "medium"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
      : report.confidence_level === "low"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
      : "bg-white/5 text-slate-300 border-white/10";

  return (
    <Card
      onClick={onOpen}
      className={`group relative overflow-hidden cursor-pointer border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_60px_-15px_rgba(251,191,36,0.25)] ${blurred ? "select-none" : ""}`}
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${isStock ? "from-transparent via-sky-400/60 to-transparent" : "from-transparent via-amber-400/60 to-transparent"} z-10`} />

      {/* First-page paper thumbnail */}
      <div className="relative h-72 overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/60 p-3">
        <div className={`relative h-full w-full overflow-hidden rounded-md bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover:scale-[1.02] ${blurred ? "blur-[6px] saturate-75" : ""}`}>
          <FirstPagePreview report={report} />
        </div>
        {blurred && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-amber-400/40 bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-amber-300 backdrop-blur-sm">
              <Lock className="h-3.5 w-3.5" /> Sign in to read
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${isStock ? "border-sky-400/30 bg-sky-500/10 text-sky-300" : "border-amber-400/30 bg-amber-500/10 text-amber-300"}`}>
              {isStock ? <TrendingUp className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">
                {report.asset_type}{report.asset_symbol ? ` · ${report.asset_symbol}` : ""}
              </div>
              <h3 className="text-base font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                {report.asset_name}
              </h3>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${confidenceColor}`}>
            {report.confidence_level ?? "n/a"} confidence
          </Badge>
          <span className="text-[11px] text-slate-500">{dateStr}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function FirstPagePreview({ report }: { report: ResearchRow }) {
  const isStock = report.asset_type === "stock";
  const scores = [
    { label: "Quality", v: report.overall_quality_score },
    { label: "Valuation", v: report.valuation_score },
    { label: "Risk", v: report.risk_score },
    { label: "ESG", v: report.esg_score },
  ];
  const lines = [94, 88, 96, 78, 92, 84, 70, 90, 82];

  return (
    <div className="flex h-full w-full flex-col p-3 text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
        <div className="flex items-center gap-1">
          <div className={`h-1.5 w-1.5 rounded-full ${isStock ? "bg-sky-600" : "bg-amber-500"}`} />
          <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-slate-700">
            FlowPulse Research
          </span>
        </div>
        <span className="text-[6px] uppercase tracking-widest text-slate-400">
          {report.asset_type} · {format(new Date(report.generated_at), "MMM yyyy")}
        </span>
      </div>

      <div className="mt-1.5">
        <div className="text-[7px] font-semibold uppercase tracking-wider text-slate-400">
          {report.asset_symbol ?? "Equity Research"}
        </div>
        <h4 className="mt-0.5 text-[11px] font-bold leading-tight text-slate-900 line-clamp-2">
          {report.asset_name}
        </h4>
        <div className="mt-0.5 text-[6px] italic text-slate-500">
          Institutional coverage · Confidence: {report.confidence_level ?? "medium"}
        </div>
      </div>

      <div className="mt-1.5 grid grid-cols-4 gap-1">
        {scores.map((s) => (
          <div key={s.label} className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5">
            <div className="text-[5.5px] uppercase tracking-wider text-slate-500">{s.label}</div>
            <div className="text-[9px] font-bold text-slate-900 tabular-nums">{s.v ?? 0}</div>
            <div className="mt-0.5 h-[2px] w-full rounded-full bg-slate-200">
              <div className={`h-full rounded-full ${isStock ? "bg-sky-600" : "bg-amber-500"}`} style={{ width: `${Math.max(0, Math.min(100, s.v ?? 0))}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1.5 text-[7px] font-bold uppercase tracking-wider text-slate-700">
        Executive Summary
      </div>
      <div className="mt-1 space-y-[3px]">
        {lines.map((w, i) => (
          <div key={i} className="h-[2.5px] rounded-full bg-slate-200" style={{ width: `${w}%` }} />
        ))}
      </div>

      <div className="mt-1.5 text-[7px] font-bold uppercase tracking-wider text-slate-700">
        Key Risks
      </div>
      <div className="mt-1 space-y-[3px]">
        {[80, 72, 64].map((w, i) => (
          <div key={i} className="h-[2.5px] rounded-full bg-slate-200" style={{ width: `${w}%` }} />
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-1">
        <span className="text-[6px] uppercase tracking-widest text-slate-400">Page 1 / 12</span>
        <span className="text-[6px] uppercase tracking-widest text-slate-400">flowpulse.co.uk</span>
      </div>
    </div>
  );
}
