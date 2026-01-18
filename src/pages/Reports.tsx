import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, Filter, TrendingUp, BarChart3, Shield, Globe, Briefcase, Target, Activity, Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminReportUpload } from "@/components/reports/AdminReportUpload";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { TranslatedText } from "@/components/TranslatedText";

interface Report {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  report_type: string;
  platform: string;
  thumbnail_url: string | null;
  published_date: string;
  created_at: string;
  target_user_id?: string | null;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReports();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    setIsAdmin(!!data);
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setReports([]);
        setLoading(false);
        return;
      }

      // Fetch reports the user has access to via user_report_access
      const { data: accessData, error: accessError } = await supabase
        .from('user_report_access')
        .select(`
          report_id,
          reports (
            id,
            title,
            description,
            file_path,
            report_type,
            platform,
            thumbnail_url,
            published_date,
            created_at,
            target_user_id
          )
        `)
        .eq('user_id', user.id);

      if (accessError) throw accessError;
      
      // Also fetch universal reports (target_user_id is null) for finance platform
      const { data: universalData, error: universalError } = await supabase
        .from('reports')
        .select('*')
        .eq('platform', 'finance')
        .is('target_user_id', null);
        
      if (universalError) throw universalError;
      
      // Filter for finance platform reports from access data
      const accessReports: Report[] = (accessData || [])
        .map(item => item.reports as unknown as Report | null)
        .filter((report): report is Report => 
          report !== null && 
          typeof report === 'object' && 
          'platform' in report && 
          report.platform === 'finance'
        );
      
      // Combine and deduplicate reports
      const allReports: Report[] = [...accessReports];
      (universalData || []).forEach(report => {
        if (!allReports.some(r => r.id === report.id)) {
          allReports.push({
            ...report,
            target_user_id: report.target_user_id ?? null
          } as Report);
        }
      });
      
      // Sort by published date
      const financeReports = allReports.sort((a, b) => 
        new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
      );
      
      setReports(financeReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const viewReport = async (report: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from('reports')
        .createSignedUrl(report.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
        toast.success("Opening report...");
      }
    } catch (error) {
      console.error('Error viewing report:', error);
      toast.error("Failed to open report");
    }
  };

  const downloadReport = async (report: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from('reports')
        .download(report.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error("Failed to download report");
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesType = selectedType === "all" || report.report_type === selectedType;
    const matchesSearch = !searchQuery || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.report_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const reportTypes = [...new Set(reports.map(r => r.report_type))].sort();

  // Category mapping for Morningstar-style organization
  const reportCategories = {
    "Market Commentary": {
      icon: TrendingUp,
      color: "from-blue-600 to-cyan-600",
      types: ["Market Commentary", "Market Update", "Market Analysis"]
    },
    "Research & Analysis": {
      icon: BarChart3,
      color: "from-purple-600 to-fuchsia-600",
      types: ["Research Report", "Investment Analysis", "Industry Report", "Whitepaper"]
    },
    "Sector & Industry": {
      icon: Globe,
      color: "from-green-600 to-emerald-600",
      types: ["Sector Analysis", "Industry Report", "Sector Flows"]
    },
    "Portfolio & Performance": {
      icon: Target,
      color: "from-orange-600 to-red-600",
      types: ["Portfolio Summary", "Performance Report", "Annual Report"]
    },
    "Risk & Compliance": {
      icon: Shield,
      color: "from-red-600 to-pink-600",
      types: ["Risk Assessment", "Compliance Report", "Regulatory Update"]
    },
    "Strategic Planning": {
      icon: Briefcase,
      color: "from-indigo-600 to-purple-600",
      types: ["Strategic Analysis", "Business Plan", "M&A Report", "Cross-Border M&A"]
    }
  };

  // Group reports by category
  const groupedReports: Record<string, Report[]> = {};
  
  filteredReports.forEach(report => {
    let assigned = false;
    
    for (const [category, config] of Object.entries(reportCategories)) {
      if (config.types.some(type => report.report_type.toLowerCase().includes(type.toLowerCase()))) {
        if (!groupedReports[category]) {
          groupedReports[category] = [];
        }
        groupedReports[category].push(report);
        assigned = true;
        break;
      }
    }
    
    // If not assigned to any category, put in "Other Reports"
    if (!assigned) {
      if (!groupedReports["Other Reports"]) {
        groupedReports["Other Reports"] = [];
      }
      groupedReports["Other Reports"].push(report);
    }
  });

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              <TranslatedText>Investment Research</TranslatedText>
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              <TranslatedText>Access comprehensive market analysis and investment insights</TranslatedText>
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && <AdminReportUpload platform="finance" onUploadSuccess={fetchReports} />}
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="border border-border bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports by title, description, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[280px] bg-background border-border">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all"><TranslatedText>All Reports</TranslatedText></SelectItem>
                  {reportTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border border-border">
                <div className="h-48 bg-muted" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="border border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-muted mb-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground"><TranslatedText>No Reports Available</TranslatedText></h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchQuery 
                  ? <><TranslatedText>No reports match</TranslatedText> "{searchQuery}"</>
                  : <TranslatedText>Research reports and analysis will appear here once they are published.</TranslatedText>}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedReports).map(([category, categoryReports]) => {
              const categoryConfig = reportCategories[category as keyof typeof reportCategories];
              const IconComponent = categoryConfig?.icon || Activity;
              const colorClass = categoryConfig?.color || "from-gray-600 to-slate-600";
              
              return (
                <div key={category} className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 pb-4 border-b border-border">
                    <div className={`p-3 bg-gradient-to-br ${colorClass} rounded-xl shadow-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-foreground">{category}</h2>
                      <p className="text-sm text-muted-foreground">
                        {categoryReports.length} <TranslatedText>report</TranslatedText>{categoryReports.length !== 1 ? 's' : ''} <TranslatedText>available</TranslatedText>
                      </p>
                    </div>
                  </div>
                  
                  {/* Reports Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryReports.map((report) => (
                      <Card key={report.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-border bg-card">
                        <div className={`relative h-48 ${report.thumbnail_url ? '' : `bg-gradient-to-br ${colorClass}`} flex items-center justify-center overflow-hidden`}>
                          {report.thumbnail_url ? (
                            <img 
                              src={report.thumbnail_url} 
                              alt={report.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <FileText className="h-20 w-20 text-white/40" />
                          )}
                          <Badge className="absolute top-4 right-4 text-xs bg-background/90 text-foreground border border-border shadow-sm">
                            {report.report_type}
                          </Badge>
                        </div>
                        <CardContent className="p-6 bg-card">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors leading-tight text-foreground">
                                {report.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-2">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(report.published_date).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                            {report.description && (
                              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                {report.description}
                              </p>
                            )}
                            <div className="flex gap-2 pt-2">
                              <Button 
                                onClick={() => viewReport(report)}
                                variant="outline"
                                className="flex-1 border-border hover:bg-accent hover:text-accent-foreground"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <TranslatedText>View</TranslatedText>
                              </Button>
                              <Button 
                                onClick={() => downloadReport(report)}
                                className="flex-1"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                <TranslatedText>Download</TranslatedText>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
