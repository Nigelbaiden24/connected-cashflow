import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  FileText, 
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Shield,
  Globe,
  Briefcase,
  Clock,
  User,
  Calendar,
  Lock,
  CheckCircle,
  ArrowRight,
  Share2,
  BookOpen
} from "lucide-react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

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

const categoryConfig: Record<string, { icon: typeof TrendingUp; color: string; bgColor: string }> = {
  "Market Analysis": { icon: TrendingUp, color: "text-blue-600", bgColor: "bg-blue-50" },
  "Research": { icon: BarChart3, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  "Industry Reports": { icon: Globe, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  "Risk & Compliance": { icon: Shield, color: "text-red-600", bgColor: "bg-red-50" },
  "Strategic": { icon: Briefcase, color: "text-amber-600", bgColor: "bg-amber-50" },
  "General": { icon: FileText, color: "text-slate-600", bgColor: "bg-slate-50" },
};

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchReport(id);
    }
  }, [id]);

  const fetchReport = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from("purchasable_reports")
        .select("id, title, description, thumbnail_url, created_at, category, page_count, featured, teaser_content, key_insights, author_name, author_title, reading_time, tags, content_images")
        .eq("id", reportId)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Report not found");
        navigate("/reports");
        return;
      }
      setReport(data as Report);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load report");
      navigate("/reports");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryConfig = (category: string | null) => {
    return categoryConfig[category || "General"] || categoryConfig["General"];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: report?.title,
        text: report?.description || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const config = getCategoryConfig(report.category);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <img src={flowpulseLogo} alt="FlowPulse" className="h-10 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-xl tracking-tight text-slate-900">FlowPulse</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/reports")} 
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Reports
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-12 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <span 
                className="hover:text-slate-700 cursor-pointer" 
                onClick={() => navigate("/reports")}
              >
                Reports
              </span>
              <span>/</span>
              <span className="text-slate-900">{report.category || "General"}</span>
            </nav>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge className={`${config.bgColor} ${config.color} hover:${config.bgColor}`}>
                <config.icon className="h-3 w-3 mr-1" />
                {report.category || "General"}
              </Badge>
              {report.reading_time && (
                <span className="flex items-center text-sm text-slate-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {report.reading_time}
                </span>
              )}
              <span className="flex items-center text-sm text-slate-500">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(report.created_at)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {report.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              {report.description || "Expert analysis and strategic insights from our research team."}
            </p>

            {/* Author */}
            {report.author_name && (
              <div className="flex items-center gap-4 pb-8 border-b border-slate-200">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{report.author_name}</p>
                  {report.author_title && (
                    <p className="text-sm text-slate-500">{report.author_title}</p>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {report.tags && report.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6">
                {report.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-slate-600 border-slate-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hero Image */}
      {report.thumbnail_url && (
        <section className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <img
              src={report.thumbnail_url}
              alt={report.title}
              className="w-full h-auto rounded-xl shadow-lg"
            />
            <p className="text-center text-sm text-slate-500 mt-4 italic">
              Featured image for: {report.title}
            </p>
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Key Insights */}
          {report.key_insights && report.key_insights.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                Key Insights
              </h2>
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-6">
                  <ul className="space-y-4">
                    {report.key_insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Teaser Content */}
          {report.teaser_content && (
            <div className="prose prose-lg prose-slate max-w-none mb-12">
              <div dangerouslySetInnerHTML={{ __html: report.teaser_content.replace(/\n/g, '<br/>') }} />
            </div>
          )}

          {/* Content Images */}
          {report.content_images && report.content_images.length > 0 && (
            <div className="space-y-8 mb-12">
              {report.content_images.map((imageUrl, idx) => (
                <div key={idx}>
                  <img
                    src={imageUrl}
                    alt={`Chart ${idx + 1}`}
                    className="w-full h-auto rounded-xl shadow-md"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Lock Gate */}
          <div className="relative mt-16">
            {/* Fade overlay */}
            <div className="absolute -top-32 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none z-10" />
            
            {/* Locked content card */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%20fill-rule%3D%22evenodd%22%3E%3Ccircle%20cx%3D%223%22%20cy%3D%223%22%20r%3D%223%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
              
              <CardContent className="p-8 md:p-12 relative z-10">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Unlock the Full Report
                  </h3>
                  
                  <p className="text-slate-300 mb-8 text-lg">
                    Sign up for FlowPulse to access the complete analysis, detailed charts, and actionable recommendations.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      onClick={() => navigate("/login")}
                    >
                      <TrendingUp className="h-5 w-5 mr-2" />
                      FlowPulse Finance
                    </Button>
                    <Button 
                      size="lg"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                      onClick={() => navigate("/login/investor")}
                    >
                      <BarChart3 className="h-5 w-5 mr-2" />
                      FlowPulse Investor
                    </Button>
                  </div>

                  <p className="text-sm text-slate-400 mt-6">
                    Already a member? <a href="/login" className="text-blue-400 hover:text-blue-300 underline">Sign in here</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related content CTA */}
      <section className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Explore More Research
            </h2>
            <p className="text-slate-600 mb-8">
              Browse our library of expert analysis and market insights
            </p>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/reports")}
              className="border-slate-300"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              View All Reports
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={flowpulseLogo} alt="FlowPulse" className="h-8" />
              <span className="font-semibold text-slate-900">FlowPulse</span>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} FlowPulse. Professional financial research and analysis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
