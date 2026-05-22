import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Star,
  Shield,
  DollarSign,
  Leaf,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface PublicResearchPreview {
  id: string;
  asset_type: "stock" | "crypto";
  asset_id: string;
  asset_name: string;
  asset_symbol: string | null;
  overall_quality_score: number | null;
  risk_score: number | null;
  valuation_score: number | null;
  esg_score: number | null;
  confidence_level: "high" | "medium" | "low" | null;
  quality_analysis: any;
  version: number;
  generated_at: string;
}

export default function PublicResearchHub() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [reports, setReports] = useState<PublicResearchPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"stock" | "crypto">("stock");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("public-research-previews", {
        body: { asset_types: ["stock", "crypto"], limit: 60 },
      });

      if (error) {
        console.error("Error loading public research previews:", error);
        setReports([]);
      } else {
        setReports((data?.reports ?? []) as PublicResearchPreview[]);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => reports.filter((r) => r.asset_type === tab),
    [reports, tab],
  );

  const handleOpen = (r: PublicResearchPreview) => {
    if (!isAuthed) {
      navigate(`/login-investor?redirect=/investor/${r.asset_type}-research`);
      return;
    }
    navigate(`/investor/${r.asset_type}-research`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Subtle professional backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-slate-50 to-transparent" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[1100px] rounded-full bg-gradient-to-br from-sky-100/60 via-indigo-50/40 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.04)_1px,transparent_0)] [background-size:28px_28px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
            <span className="font-semibold tracking-tight text-slate-900">FlowPulse</span>
            <Badge variant="outline" className="ml-2 border-slate-300 bg-slate-50 text-[10px] uppercase tracking-widest text-slate-600">
              Research
            </Badge>
          </button>
          <div className="flex items-center gap-2">
            {!isAuthed && (
              <>
                <Button variant="ghost" className="text-slate-700 hover:text-slate-900 hover:bg-slate-100" onClick={() => navigate("/login-investor")}>
                  Sign in
                </Button>
                <Button className="bg-slate-900 text-white hover:bg-slate-800 font-semibold" onClick={() => navigate("/login-investor")}>
                  Get access <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs text-slate-600 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Institutional-grade analyst desk
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
          The FlowPulse <span className="bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">Research Vault</span>
        </h1>
        <p className="text-slate-600 mt-5 max-w-2xl mx-auto text-lg leading-relaxed">
          Deep-dive equity and digital asset research curated by our analyst desk. Quality, risk, valuation and ESG scored on a 0–5 institutional scale.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Independent coverage
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <Activity className="h-3.5 w-3.5 text-sky-500" /> Updated continuously
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <Gauge className="h-3.5 w-3.5 text-amber-500" /> 0–5 conviction scoring
          </span>
        </div>
      </section>

      {/* Tabs + Grid */}
      <section className="container mx-auto px-4 pb-24">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "stock" | "crypto")} className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="bg-slate-100 border border-slate-200 p-1 h-auto">
              <TabsTrigger
                value="stock"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 px-6 py-2.5 rounded-md"
              >
                <TrendingUp className="h-4 w-4 mr-2" /> Stock Research
              </TabsTrigger>
              <TabsTrigger
                value="crypto"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 px-6 py-2.5 rounded-md"
              >
                <Coins className="h-4 w-4 mr-2" /> Crypto Research
              </TabsTrigger>
            </TabsList>
          </div>

          {(["stock", "crypto"] as const).map((t) => (
            <TabsContent key={t} value={t}>
              {loading || authLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : filtered.length === 0 ? (
                <Card className="border-slate-200 bg-white">
                  <CardContent className="py-20 text-center">
                    <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No {t} reports published yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative">
                  <div
                    className={`grid gap-5 md:grid-cols-2 lg:grid-cols-3 ${
                      !isAuthed ? "max-h-[1100px] overflow-hidden" : ""
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
                    <div className="absolute inset-x-0 bottom-0 h-[500px] bg-gradient-to-t from-white via-white/95 to-transparent flex flex-col items-center justify-end pb-12">
                      <div className="text-center w-full max-w-lg mx-auto px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white shadow-lg mb-5">
                          <Lock className="h-7 w-7" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                          Unlock the full research desk
                        </h3>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                          Sign in to access complete reports, download institutional PDFs, and receive live coverage updates from our analyst team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            size="lg"
                            className="bg-slate-900 text-white hover:bg-slate-800 font-semibold"
                            onClick={() => navigate("/login-investor")}
                          >
                            Sign in to read <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
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

function ReportCard({
  report,
  blurred,
  onOpen,
}: {
  report: PublicResearchPreview;
  blurred: boolean;
  onOpen: () => void;
}) {
  const isStock = report.asset_type === "stock";
  const qualityTier = report.quality_analysis?.quality_tier || "—";

  const confidenceColor =
    report.confidence_level === "high"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : report.confidence_level === "medium"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : report.confidence_level === "low"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-50 text-slate-600 border-slate-200";

  const tierColor =
    qualityTier?.toLowerCase() === "high"
      ? "text-emerald-600"
      : qualityTier?.toLowerCase() === "medium"
      ? "text-amber-600"
      : qualityTier?.toLowerCase() === "low"
      ? "text-rose-600"
      : "text-slate-500";

  // Convert 0-5 score to 0-100 for Progress component
  const pct = (s: number | null) => Math.max(0, Math.min(100, ((s ?? 0) / 5) * 100));

  return (
    <Card
      onClick={onOpen}
      className={`group relative overflow-hidden cursor-pointer border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_50px_-18px_rgba(15,23,42,0.18)] ${blurred ? "select-none" : ""}`}
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${isStock ? "from-transparent via-sky-400/70 to-transparent" : "from-transparent via-amber-400/70 to-transparent"}`} />

      <div className={blurred ? "blur-[6px] saturate-75 pointer-events-none" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${isStock ? "border-sky-200 bg-sky-50 text-sky-600" : "border-amber-200 bg-amber-50 text-amber-600"}`}>
                {isStock ? <TrendingUp className="h-5 w-5" /> : <Coins className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${isStock ? "border-sky-200 bg-sky-50 text-sky-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                    {report.asset_type}
                  </Badge>
                  {report.asset_symbol && (
                    <span className="text-xs font-mono text-slate-500">{report.asset_symbol}</span>
                  )}
                </div>
                <CardTitle className="text-base font-semibold text-slate-900 truncate mt-1 group-hover:text-indigo-600 transition-colors">
                  {report.asset_name}
                </CardTitle>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ScoreRow icon={<Star className="h-3.5 w-3.5" />} label="Quality" score={report.overall_quality_score} pct={pct(report.overall_quality_score)} />
            <ScoreRow icon={<Shield className="h-3.5 w-3.5" />} label="Risk" score={report.risk_score} pct={pct(report.risk_score)} />
            <ScoreRow icon={<DollarSign className="h-3.5 w-3.5" />} label="Valuation" score={report.valuation_score} pct={pct(report.valuation_score)} />
            <ScoreRow icon={<Leaf className="h-3.5 w-3.5" />} label="ESG" score={report.esg_score} pct={pct(report.esg_score)} />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Quality Tier:</span>
              <span className={`text-sm font-semibold capitalize ${tierColor}`}>{qualityTier}</span>
            </div>
            <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${confidenceColor}`}>
              {report.confidence_level || "—"} confidence
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {(() => {
                const d = report.generated_at ? new Date(report.generated_at) : null;
                return d && !isNaN(d.getTime()) ? format(d, "MMM d, yyyy") : "—";
              })()}
            </div>
            <span>v{report.version}</span>
          </div>
        </CardContent>
      </div>

      {blurred && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/30">
          <div className="flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-900/90 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
            <Lock className="h-3.5 w-3.5" /> Sign in to read
          </div>
        </div>
      )}
    </Card>
  );
}

function ScoreRow({
  icon,
  label,
  score,
  pct,
}: {
  icon: React.ReactNode;
  label: string;
  score: number | null;
  pct: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        {icon}
        {label}
      </div>
      <div className="flex items-center gap-2">
        <Progress value={pct} className="h-2 flex-1" />
        <span className="text-sm font-medium text-slate-900 w-10 text-right">
          {score !== null ? `${score.toFixed(1)}` : "—"}
        </span>
      </div>
    </div>
  );
}
