import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, Filter, TrendingUp, BarChart3, Shield, Globe, Briefcase, Target, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminReportUpload } from "@/components/reports/AdminReportUpload";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");

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
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('platform', 'finance')
        .order('published_date', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
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

  const filteredReports = selectedType === "all" 
    ? reports 
    : reports.filter(r => r.report_type === selectedType);

  const reportTypes = [...new Set(reports.map(r => r.report_type))];

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
    <div className="container mx-auto p-6 space-y-6 ml-64">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Research & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Professional analysis and insights from industry experts
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && <AdminReportUpload platform="finance" onUploadSuccess={fetchReports} />}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              {reportTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reports Available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Research reports and analysis will appear here once they are published.
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
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gradient-to-br ${colorClass} rounded-xl shadow-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{category}</h2>
                    <p className="text-sm text-muted-foreground">
                      {categoryReports.length} report{categoryReports.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Reports Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryReports.map((report) => (
                    <Card key={report.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/50">
                      <div className={`relative h-48 bg-gradient-to-br ${colorClass} opacity-10 flex items-center justify-center`}>
                        <FileText className="h-20 w-20 text-foreground opacity-20" />
                        <Badge className="absolute top-4 right-4">{report.report_type}</Badge>
                      </div>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                              {report.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(report.published_date).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                          {report.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {report.description}
                            </p>
                          )}
                          <Button 
                            onClick={() => downloadReport(report)} 
                            className="w-full gap-2"
                            variant="outline"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </Button>
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
  );
}
