import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Lock, TrendingUp, Coins, ArrowRight, Sparkles, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface PromotedReport {
  id: string;
  asset_type: "stock" | "crypto";
  title: string;
  slug: string;
  ticker: string | null;
  excerpt: string | null;
  hero_image_url: string | null;
  ai_score: number | null;
  ai_tags: string[] | null;
  reading_time_minutes: number | null;
  promoted_at: string | null;
  created_at: string;
}

const FALLBACK_IMG = [
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=1200&q=80",
];

export default function PublicResearchHub() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [reports, setReports] = useState<PromotedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"stock" | "crypto">("stock");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("generated_research_reports")
        .select("id,asset_type,title,slug,ticker,excerpt,hero_image_url,ai_score,ai_tags,reading_time_minutes,promoted_at,created_at")
        .eq("status", "promoted")
        .in("asset_type", ["stock", "crypto"])
        .order("promoted_at", { ascending: false })
        .limit(60);
      setReports((data ?? []) as unknown as PromotedReport[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => reports.filter((r) => r.asset_type === tab),
    [reports, tab]
  );

  const handleOpen = (r: PromotedReport) => {
    if (!isAuthed) {
      navigate(`/login-investor?redirect=/investor/${r.asset_type}-research`);
      return;
    }
    navigate(`/investor/${r.asset_type}-research`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
            <span className="font-bold text-slate-900">FlowPulse</span>
          </button>
          <div className="flex items-center gap-2">
            {!isAuthed && (
              <>
                <Button variant="ghost" onClick={() => navigate("/login-investor")}>Sign in</Button>
                <Button onClick={() => navigate("/login-investor")}>Get access</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-12 pb-8 text-center">
        <Badge variant="secondary" className="mb-3"><Sparkles className="h-3 w-3 mr-1" /> Institutional research</Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Reports</h1>
        <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
          Stock and crypto research reports curated by FlowPulse analysts. Sign in to read in full.
        </p>
      </section>

      {/* Tabs */}
      <section className="container mx-auto px-4 pb-16">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "stock" | "crypto")} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="stock"><TrendingUp className="h-4 w-4 mr-2" />Stock Research</TabsTrigger>
              <TabsTrigger value="crypto"><Coins className="h-4 w-4 mr-2" />Crypto Research</TabsTrigger>
            </TabsList>
          </div>

          {(["stock", "crypto"] as const).map((t) => (
            <TabsContent key={t} value={t}>
              {loading || authLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-slate-600">No {t} reports published yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative">
                  <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${!isAuthed ? "max-h-[1100px] overflow-hidden" : ""}`}>
                    {filtered.map((r, i) => (
                      <ReportCard
                        key={r.id}
                        report={r}
                        index={i}
                        blurred={!isAuthed && i >= 3}
                        onOpen={() => handleOpen(r)}
                      />
                    ))}
                  </div>

                  {!isAuthed && filtered.length > 0 && (
                    <div className="absolute inset-x-0 bottom-0 h-[420px] bg-gradient-to-t from-white via-white/95 to-transparent flex flex-col items-end justify-end pb-10">
                      <div className="text-center w-full max-w-md mx-auto px-4">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                          <Lock className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                          Unlock the full research desk
                        </h3>
                        <p className="text-slate-600 mb-5">
                          Create a free account or sign in to read the complete reports, download PDFs, and access live updates.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <Button size="lg" onClick={() => navigate("/login-investor")}>
                            Sign in to read <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <Button size="lg" variant="outline" onClick={() => navigate("/login-investor")}>
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
  index,
  blurred,
  onOpen,
}: {
  report: PromotedReport;
  index: number;
  blurred: boolean;
  onOpen: () => void;
}) {
  const img = report.hero_image_url || FALLBACK_IMG[index % FALLBACK_IMG.length];
  const dateStr = report.promoted_at
    ? format(new Date(report.promoted_at), "PP")
    : format(new Date(report.created_at), "PP");

  return (
    <Card
      onClick={onOpen}
      className={`group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 ${
        blurred ? "select-none" : ""
      }`}
    >
      <div className="relative h-44 overflow-hidden bg-slate-200">
        <img
          src={img}
          alt={report.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            blurred ? "blur-md" : ""
          }`}
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="uppercase text-[10px] tracking-wide">{report.asset_type}</Badge>
          {report.ticker && <Badge variant="secondary" className="text-[10px]">{report.ticker}</Badge>}
        </div>
        {typeof report.ai_score === "number" && (
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {report.ai_score.toFixed(1)}/5
          </div>
        )}
      </div>
      <CardContent className={`p-5 ${blurred ? "blur-sm" : ""}`}>
        <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
          {report.title}
        </h3>
        {report.excerpt && (
          <p className="text-sm text-slate-600 mt-2 line-clamp-3">{report.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <span>{dateStr}</span>
          <span>{report.reading_time_minutes ?? 6} min read</span>
        </div>
      </CardContent>
    </Card>
  );
}
