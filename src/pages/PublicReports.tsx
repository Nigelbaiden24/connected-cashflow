import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { InsightAccessGate, useInsightAccess } from "@/components/insights/InsightAccessGate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  FileText,
  Search,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clock,
  Calendar,
  Sparkles,
  BookOpen,
  LayoutGrid,
  List,
} from "lucide-react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import {
  INSIGHT_CATEGORIES,
  mapToInsightCategory,
  getInsightCategory,
} from "@/lib/insightCategories";

interface Report {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  category: string | null;
  page_count: number | null;
  featured: boolean | null;
  teaser_content: string | null;
  key_insights: string[] | null;
  author_name: string | null;
  author_title: string | null;
  reading_time: string | null;
  tags: string[] | null;
  content_images: string[] | null;
}

type ViewMode = "grid" | "list";
type DateRange = "all" | "7" | "30" | "90" | "365";

export default function PublicReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { unlocked, setUnlocked } = useInsightAccess();
  const [gateOpen, setGateOpen] = useState<boolean>(false);
  const [pendingReportId, setPendingReportId] = useState<string | undefined>();
  const [pendingReportTitle, setPendingReportTitle] = useState<string | undefined>();

  // Read ?category= from URL (used by homepage Insights dropdown)
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("purchasable_reports")
        .select(
          "id, title, description, thumbnail_url, created_at, category, page_count, featured, teaser_content, key_insights, author_name, author_title, reading_time, tags, content_images"
        )
        .eq("is_published", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data as Report[]) || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  // Group reports by mapped insight category
  const reportsByCategory = useMemo(() => {
    const map: Record<string, Report[]> = {};
    INSIGHT_CATEGORIES.forEach((c) => (map[c.value] = []));
    reports.forEach((r) => {
      const cat = mapToInsightCategory(r.category);
      if (!map[cat]) map[cat] = [];
      map[cat].push(r);
    });
    return map;
  }, [reports]);

  // Filtered reports for the listing section (search, category, date)
  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const cutoffDays = dateRange === "all" ? null : parseInt(dateRange, 10);
    const cutoff = cutoffDays
      ? Date.now() - cutoffDays * 24 * 60 * 60 * 1000
      : null;

    return reports.filter((r) => {
      const cat = mapToInsightCategory(r.category);
      if (selectedCategory !== "all" && cat !== selectedCategory) return false;

      if (cutoff && new Date(r.created_at).getTime() < cutoff) return false;

      if (q) {
        const haystack = [
          r.title,
          r.description ?? "",
          r.author_name ?? "",
          ...(r.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [reports, searchQuery, selectedCategory, dateRange]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img
              src={flowpulseLogo}
              alt="FlowPulse"
              className="h-10 group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                FlowPulse
              </span>
              <span className="hidden md:inline text-slate-400 ml-2 text-sm font-medium">
                Insights
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 md:py-24">
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                                radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-5 py-2 text-sm font-medium backdrop-blur-sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Institutional Insights Library
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              Investment{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Browse expert insights across every major asset class. Choose a
              category below to explore the latest research.
            </p>
          </div>
        </div>
      </section>

      {/* Category Cards Grid (Pitchbook-style) */}
      <section className="container mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Browse by category
            </h2>
            <p className="text-slate-500 mt-1">
              Insights organised across {INSIGHT_CATEGORIES.length} investment
              categories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INSIGHT_CATEGORIES.map((cat) => {
            const count = reportsByCategory[cat.value]?.length || 0;
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  document
                    .getElementById("insights-listing")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`group text-left rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-xl"
                    : "bg-[#f5efe4] hover:bg-[#efe7d6] border-transparent"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl leading-none">{cat.emoji}</span>
                  <Badge
                    variant="secondary"
                    className={
                      isActive
                        ? "bg-white/15 text-white border-0"
                        : "bg-white/70 text-slate-700 border-0"
                    }
                  >
                    {count} report{count !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <h3
                  className={`text-lg font-bold mb-2 ${
                    isActive ? "text-white" : "text-slate-900"
                  }`}
                >
                  {cat.label}
                </h3>
                <p
                  className={`text-sm leading-relaxed mb-5 ${
                    isActive ? "text-slate-200" : "text-slate-600"
                  }`}
                >
                  {cat.description}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold border-b-2 pb-0.5 ${
                    isActive
                      ? "text-white border-amber-400"
                      : "text-slate-900 border-amber-500"
                  }`}
                >
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter / Search bar */}
      <section
        id="insights-listing"
        className="container mx-auto px-6 pt-8 pb-4 border-t border-slate-100"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 flex-1 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search insights, authors, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base shadow-sm rounded-full"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v)}
            >
              <SelectTrigger className="h-12 md:w-[220px] rounded-full bg-white border-slate-200 shadow-sm">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-[60vh]">
                <SelectItem value="all">All topics</SelectItem>
                {INSIGHT_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={dateRange}
              onValueChange={(v) => setDateRange(v as DateRange)}
            >
              <SelectTrigger className="h-12 md:w-[180px] rounded-full bg-white border-slate-200 shadow-sm">
                <SelectValue placeholder="Report date" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">Any date</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`h-11 w-11 rounded-full flex items-center justify-center border transition-colors ${
                viewMode === "grid"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`h-11 w-11 rounded-full flex items-center justify-center border transition-colors ${
                viewMode === "list"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {(searchQuery ||
          selectedCategory !== "all" ||
          dateRange !== "all") && (
          <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
            <span>
              Showing {filteredReports.length} of {reports.length} insights
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setDateRange("all");
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Listing */}
      <section className="container mx-auto px-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <div className="h-48 bg-slate-100" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-6 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="border-0 shadow-lg mt-6">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No insights match your filters
              </h3>
              <p className="text-slate-500 text-center max-w-md">
                Try changing topic, date range, or clearing your search.
              </p>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredReports.map((r) => (
              <ReportGridCard
                key={r.id}
                report={r}
                onClick={() => handleOpenReport(r.id, r.title)}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {filteredReports.map((r) => (
              <ReportListRow
                key={r.id}
                report={r}
                onClick={() => handleOpenReport(r.id, r.title)}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
              <span className="font-semibold text-white">FlowPulse</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} FlowPulse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <InsightAccessGate
        open={gateOpen}
        onOpenChange={setGateOpen}
        onUnlocked={() => {
          setUnlocked(true);
          if (pendingReportId) {
            const id = pendingReportId;
            setPendingReportId(undefined);
            setPendingReportTitle(undefined);
            navigate(`/reports/${id}`);
          }
        }}
        reportId={pendingReportId}
        reportTitle={pendingReportTitle}
        category={selectedCategory !== "all" ? selectedCategory : undefined}
        sourcePage="/reports"
      />
    </div>
  );

  function handleOpenReport(id: string, _title: string) {
    navigate(`/reports/${id}`);
  }
}

function ReportGridCard({
  report,
  onClick,
  formatDate,
}: {
  report: Report;
  onClick: () => void;
  formatDate: (d: string) => string;
}) {
  const cat = mapToInsightCategory(report.category);
  const catCfg = getInsightCategory(cat);
  return (
    <Card
      onClick={onClick}
      className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group bg-white hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        {report.thumbnail_url ? (
          <img
            src={report.thumbnail_url}
            alt={report.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <span className="text-6xl opacity-70">{catCfg?.emoji ?? "📄"}</span>
        )}
        {report.featured && (
          <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        <Badge className="absolute bottom-4 left-4 bg-white/90 text-slate-900 border-0 backdrop-blur-sm">
          {catCfg?.emoji} {cat}
        </Badge>
      </div>

      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
          {report.reading_time && (
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {report.reading_time}
            </span>
          )}
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(report.created_at)}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
          {report.title}
        </h3>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
          {report.description || "Expert analysis and strategic insights."}
        </p>

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 border-b-2 border-amber-500 pb-0.5">
          Learn more
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </CardContent>
    </Card>
  );
}

function ReportListRow({
  report,
  onClick,
  formatDate,
}: {
  report: Report;
  onClick: () => void;
  formatDate: (d: string) => string;
}) {
  const cat = mapToInsightCategory(report.category);
  const catCfg = getInsightCategory(cat);
  return (
    <Card
      onClick={onClick}
      className="overflow-hidden border-0 cursor-pointer group bg-[#f5efe4] hover:bg-[#efe7d6] transition-colors"
    >
      <div className="flex items-stretch gap-0">
        <div className="w-32 sm:w-44 shrink-0 bg-slate-900 flex items-center justify-center">
          {report.thumbnail_url ? (
            <img
              src={report.thumbnail_url}
              alt={report.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl opacity-80">
              {catCfg?.emoji ?? "📄"}
            </span>
          )}
        </div>
        <CardContent className="flex-1 p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            {cat}
          </p>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-700 transition-colors leading-snug">
            {report.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {report.description || "Expert analysis and strategic insights."}
          </p>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-slate-900">
              {formatDate(report.created_at)}
            </span>
            <span className="text-slate-300">|</span>
            <span className="inline-flex items-center gap-1 font-semibold text-slate-900 border-b-2 border-amber-500 pb-0.5">
              Learn more <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
