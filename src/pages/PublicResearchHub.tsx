import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ReportPdfPagePreview } from "@/components/research/ReportPdfPagePreview";
import { ResearchAuthDialog } from "@/components/research/ResearchAuthDialog";

interface PublicResearchPreview {
  id: string;
  asset_type: "stock" | "crypto";
  title: string;
  ticker: string | null;
  excerpt: string | null;
  ai_score: number | null;
  ai_tags: string[] | null;
  reading_time_minutes: number | null;
  author_name: string | null;
  page_count: number | null;
  report_date: string | null;
  promoted_at: string | null;
  created_at: string;
  first_page_title: string;
  first_page_html: string;
}

interface PublicResearchHubProps {
  initialTab?: "stock" | "crypto";
}

export default function PublicResearchHub({ initialTab = "stock" }: PublicResearchHubProps = {}) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [reports, setReports] = useState<PublicResearchPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"stock" | "crypto">(initialTab);
  const [authOpen, setAuthOpen] = useState(false);
  const [authRedirect, setAuthRedirect] = useState<string | undefined>();
  const [authReportTitle, setAuthReportTitle] = useState<string | undefined>();

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

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
    [reports, tab]
  );

  const openAuth = (redirect?: string, title?: string) => {
    setAuthRedirect(redirect);
    setAuthReportTitle(title);
    setAuthOpen(true);
  };

  const handleOpen = (r: PublicResearchPreview) => {
    if (!isAuthed) {
      openAuth(`/investor/research?asset=${r.asset_type}&id=${r.id}`, r.title);
      return;
    }
    navigate(`/investor/research?asset=${r.asset_type}&id=${r.id}`);
  };


  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-amber-400/30">
      {/* Ambient gradient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[1200px] rounded-full bg-gradient-to-br from-indigo-500/[0.07] via-sky-400/[0.04] to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[800px] rounded-full bg-gradient-to-tl from-amber-400/[0.06] to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
            <span className="font-semibold tracking-tight text-slate-900">FlowPulse</span>
            <Badge variant="outline" className="ml-2 border-slate-200 text-[10px] uppercase tracking-widest text-slate-500">
              Research
            </Badge>
          </button>
          <div className="flex items-center gap-2">
            {!isAuthed && (
              <>
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100" onClick={() => openAuth()}>
                  Sign in
                </Button>
                <Button className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 font-semibold" onClick={() => openAuth()}>
                  Get access <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs text-slate-600 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Institutional-grade analyst desk
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
          The FlowPulse <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">Research Vault</span>
        </h1>
        <p className="text-slate-500 mt-5 max-w-2xl mx-auto text-lg leading-relaxed">
          Deep-dive equity and digital asset research curated by our analyst desk. Quality, risk, valuation and ESG scored on a 0–5 institutional scale.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Independent coverage
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <Activity className="h-3.5 w-3.5 text-sky-500" /> Updated continuously
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <Gauge className="h-3.5 w-3.5 text-amber-500" /> 0–5 conviction scoring
          </span>
        </div>
      </section>

      {/* Tabs + Grid */}
      <section className="container mx-auto px-4 pb-24">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "stock" | "crypto")} className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="bg-slate-100 border border-slate-200 backdrop-blur p-1 h-auto">
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
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : filtered.length === 0 ? (
                <Card className="border-slate-200 bg-slate-50">
                  <CardContent className="py-20 text-center">
                    <FileText className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                    <p className="text-slate-500">No {t} reports published yet.</p>
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
                    <div className="absolute inset-x-0 bottom-0 h-[500px] bg-gradient-to-t from-white via-white/95 to-transparent flex flex-col items-center justify-end pb-12">
                      <div className="text-center w-full max-w-lg mx-auto px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 mb-5">
                          <Lock className="h-7 w-7 text-amber-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                          Unlock the full research desk
                        </h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                          Sign in to access complete reports, download institutional PDFs, and receive live coverage updates from our analyst team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 font-semibold"
                            onClick={() => openAuth()}
                          >
                            Sign in to read <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                            onClick={() => openAuth()}
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

      <ResearchAuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        redirectPath={authRedirect}
        reportTitle={authReportTitle}
      />
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
  const dateStr = format(new Date(report.report_date ?? report.promoted_at ?? report.created_at), "PP");
  const isStock = report.asset_type === "stock";
  const score = typeof report.ai_score === "number" ? report.ai_score : null;

  const confidenceColor =
    score !== null && score >= 4
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : score !== null && score >= 3
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : score !== null
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <Card
      onClick={onOpen}
      className={`group relative overflow-hidden cursor-pointer border-slate-200 bg-white shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] ${blurred ? "select-none" : ""}`}
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${isStock ? "from-transparent via-sky-400/60 to-transparent" : "from-transparent via-amber-400/60 to-transparent"} z-10`} />

      {/* Actual generated report PDF page, scaled down */}
      <div className="relative h-80 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-3">
        <ReportPdfPagePreview report={report} blurred={blurred} />
        {blurred && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-amber-400/40 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-amber-300 backdrop-blur-sm">
              <Lock className="h-3.5 w-3.5" /> Sign in to read
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${isStock ? "border-sky-200 bg-sky-50 text-sky-600" : "border-amber-200 bg-amber-50 text-amber-600"}`}>
              {isStock ? <TrendingUp className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-slate-400">
                {report.asset_type}{report.ticker ? ` · ${report.ticker}` : ""}
              </div>
              <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                {report.title}
              </h3>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${confidenceColor}`}>
            {score !== null ? `${score.toFixed(1)}/5 conviction` : "Research"}
          </Badge>
          <span className="text-[11px] text-slate-400">{dateStr}</span>
        </div>
      </CardContent>
    </Card>
  );
}

