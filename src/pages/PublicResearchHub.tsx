import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
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
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { ReportPdfPagePreview } from "@/components/research/ReportPdfPagePreview";
import { ResearchAuthDialog } from "@/components/research/ResearchAuthDialog";
import { ResearchReportReader } from "@/components/research/ResearchReportReader";
import { HomepageNavLinks } from "@/components/home/HomepageNavLinks";
import { PaywallCardOverlay, PreviewBar, ReportPaywallDialog, VaultPaywall, type PreviewImage, type Viewer } from "@/components/research/ResearchPaywall";
import { ReportFrontPage } from "@/components/research/ReportFrontPage";

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
  teaser?: string | null;
  locked?: boolean;
  preview_images?: PreviewImage[];
}

interface PublicResearchHubProps {
  initialTab?: "stock" | "crypto";
  platformAccess?: boolean;
}

export default function PublicResearchHub({ initialTab = "stock", platformAccess = false }: PublicResearchHubProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [reports, setReports] = useState<PublicResearchPreview[]>([]);
  // Who may read full reports is decided by the server (admins and Investor subscribers).
  const [viewer, setViewer] = useState<Viewer>({ signed_in: false, can_read: false });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"stock" | "crypto">(initialTab);
  const [authOpen, setAuthOpen] = useState(false);
  const [authRedirect, setAuthRedirect] = useState<string | undefined>();
  const [authReportTitle, setAuthReportTitle] = useState<string | undefined>();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerReportId, setReaderReportId] = useState<string | null>(null);
  const [paywallId, setPaywallId] = useState<string | null>(null);
  const canRead = platformAccess || viewer.can_read;
  const signedIn = viewer.signed_in || !!user;

  useEffect(() => { setTab(initialTab); }, [initialTab]);

  // Reload whenever the signed-in user changes, so access follows the session.
  useEffect(() => {
    if (authLoading) return;
    let live = true;
    (async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const { data, error } = await supabase.functions.invoke("public-research-previews", {
        body: { asset_types: ["stock", "crypto"], limit: 120 },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      if (!live) return;
      if (error) {
        console.error("Error loading research previews:", error);
        setReports([]);
      } else {
        setReports((data?.reports ?? []) as PublicResearchPreview[]);
        setViewer((data?.viewer as Viewer) ?? { signed_in: !!accessToken, can_read: false });
      }
      setLoading(false);
    })();
    return () => { live = false; };
  }, [authLoading, user?.id]);

  // Deep link: /research?id=…&asset=… opens the report, or its paywall.
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(location.search);
    const asset = params.get("asset");
    if (asset === "stock" || asset === "crypto") setTab(asset);
    const id = params.get("id");
    if (!id) return;
    if (canRead) { setPaywallId(null); setReaderReportId(id); setReaderOpen(true); }
    else if (reports.some((r) => r.id === id)) setPaywallId(id);
  }, [loading, canRead, location.search, reports]);

  const filtered = useMemo(() => reports.filter((r) => r.asset_type === tab), [reports, tab]);
  const paywallReport = useMemo(() => reports.find((r) => r.id === paywallId) ?? null, [reports, paywallId]);

  const openAuth = (redirect?: string, title?: string, mode: "signin" | "signup" = "signin") => {
    setAuthRedirect(redirect);
    setAuthReportTitle(title);
    setAuthMode(mode);
    setAuthOpen(true);
  };
  const subscribe = () => navigate("/pricing?from=research");

  const handleOpen = (r: PublicResearchPreview) => {
    navigate(`/research?id=${r.id}&asset=${r.asset_type}`, { replace: true });
    if (canRead) { setReaderReportId(r.id); setReaderOpen(true); }
    else setPaywallId(r.id);
  };

  const closeOverlay = () => navigate("/research" + (tab ? `?asset=${tab}` : ""), { replace: true });

  // After signing in the list reloads; the deep-link effect then opens the
  // report for subscribers or the paywall (with an upgrade offer) for others.
  const handleAuthenticated = () => { setAuthOpen(false); };

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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
            <span className="font-semibold tracking-tight text-slate-900">FlowPulse</span>
            <Badge variant="outline" className="ml-2 border-slate-200 text-[10px] uppercase tracking-widest text-slate-500">
              Research
            </Badge>
          </button>
          <HomepageNavLinks />
          <div className="flex items-center gap-2">
            {canRead && (
              <Button
                variant="outline"
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/investor/dashboard"))}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
            )}
            {!canRead && (
              <>
                {!signedIn && (
                  <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100" onClick={() => openAuth(undefined, undefined, "signin")}>
                    Sign in
                  </Button>
                )}
                <Button className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 font-semibold" onClick={subscribe}>
                  {signedIn ? "Upgrade" : "Subscribe"} <ArrowRight className="ml-1.5 h-4 w-4" />
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
              {authLoading || loading ? (
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
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((r) => (
                      <ReportCard
                        key={r.id}
                        report={r}
                        locked={!canRead}
                        signedIn={signedIn}
                        onOpen={() => handleOpen(r)}
                      />
                    ))}
                  </div>

                  {!canRead && (
                    <VaultPaywall
                      assetLabel={t === "stock" ? "equity" : "digital asset"}
                      reportCount={filtered.length}
                      sample={[...filtered].sort((a, b) => (b.ai_score ?? 0) - (a.ai_score ?? 0))[0]}
                      signedIn={signedIn}
                      onSubscribe={subscribe}
                      onSignIn={() => openAuth(undefined, undefined, "signin")}
                    />
                  )}
                </div>
              )}


            </TabsContent>
          ))}
        </Tabs>
      </section>

      {!authLoading && !loading && !canRead && !authOpen && !paywallId && (
        <PreviewBar signedIn={signedIn} onSubscribe={subscribe} onSignIn={() => openAuth(undefined, undefined, "signin")} />
      )}

      <ReportPaywallDialog
        report={paywallReport}
        viewer={{ signed_in: signedIn, can_read: canRead }}
        open={!!paywallReport}
        onOpenChange={(v) => { if (!v) { setPaywallId(null); closeOverlay(); } }}
        onSignIn={() => openAuth(paywallReport ? `/research?id=${paywallReport.id}&asset=${paywallReport.asset_type}` : undefined, paywallReport?.title, "signin")}
      />

      <ResearchReportReader
        open={readerOpen && canRead}
        onOpenChange={(v) => { setReaderOpen(v); if (!v) closeOverlay(); }}
        reportId={readerReportId}
        isAuthed={canRead}
        onRequestAuth={subscribe}
      />

      <ResearchAuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        redirectPath={authRedirect}
        reportTitle={authReportTitle}
        initialMode={authMode}
        onAuthenticated={handleAuthenticated}
      />

    </div>
  );
}

function ReportCard({
  report,
  locked,
  signedIn,
  onOpen,
}: {
  report: PublicResearchPreview;
  locked: boolean;
  signedIn: boolean;
  onOpen: () => void;
}) {
  const dateStr = format(new Date(report.report_date ?? report.promoted_at ?? report.created_at), "d MMM yyyy");
  const isStock = report.asset_type === "stock";
  const score = typeof report.ai_score === "number" ? report.ai_score : null;
  const confidenceColor =
    score !== null && score >= 4 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : score !== null && score >= 3 ? "bg-amber-50 text-amber-700 border-amber-200"
    : score !== null ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      aria-label={locked ? `Preview ${report.title} (subscribers only)` : `Read ${report.title}`}
      className="group relative cursor-pointer overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_60px_-20px_rgba(15,23,42,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      {locked ? (
        <div className="relative h-[340px] select-none overflow-hidden">
          <ReportFrontPage report={report} size="card" className="h-full" blurFrom={22} />
          <PaywallCardOverlay pages={report.page_count} signedIn={signedIn} />
        </div>
      ) : (
        /* Actual generated report page, scaled down */
        <div className="relative h-80 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-3">
          <ReportPdfPagePreview report={report} />
        </div>
      )}

      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${isStock ? "border-sky-200 bg-sky-50 text-sky-600" : "border-amber-200 bg-amber-50 text-amber-600"}`}>
              {isStock ? <TrendingUp className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-slate-400">
                {report.asset_type}{report.ticker ? ` · ${report.ticker}` : ""}
              </div>
              <h3 className="truncate text-base font-semibold text-slate-900 transition-colors group-hover:text-amber-600">{report.title}</h3>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-amber-600" />
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${confidenceColor}`}>
            {score !== null ? `${score.toFixed(1)}/5 conviction` : "Research"}
          </Badge>
          <span className="text-[11px] text-slate-400">{dateStr}</span>
        </div>
      </CardContent>
    </Card>
  );
}
