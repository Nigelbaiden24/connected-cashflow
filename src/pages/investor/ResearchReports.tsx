import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Search, Filter, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Report {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  report_type: string;
  platform: string;
  thumbnail_url: string | null;
  published_date: string | null;
  created_at: string;
}

const ResearchReports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setReports([]);
        setLoading(false);
        return;
      }

      // Fetch reports the user has access to
      const { data, error } = await supabase
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
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Filter for investor platform reports and flatten the data
      const investorReports = (data || [])
        .map(item => item.reports)
        .filter((report): report is Report => 
          report !== null && 
          typeof report === 'object' && 
          'platform' in report && 
          report.platform === 'investor'
        );
      
      setReports(investorReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (report: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from('reports')
        .createSignedUrl(report.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error accessing report:', error);
      toast.error('Failed to open report. Please ensure you have access to this report.');
    }
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from('reports')
        .download(report.file_path);

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.report_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research Reports</h1>
          <p className="text-muted-foreground mt-2">
            Expert research reports and professional analysis
          </p>
          <Badge variant="secondary" className="mt-2">
            Non-Advisory Research Only
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports by title, type, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Reports Display */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No reports available</p>
            <p className="text-sm text-muted-foreground text-center">
              {reports.length === 0 
                ? "Reports uploaded by administrators will appear here"
                : "No reports match your search criteria"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-primary" />
                  <Badge variant="outline">{report.report_type}</Badge>
                </div>
                <CardTitle className="text-lg mt-2">{report.title}</CardTitle>
                {report.description && (
                  <CardDescription className="line-clamp-2">{report.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {report.published_date && (
                  <p className="text-sm text-muted-foreground">
                    Published: {new Date(report.published_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleViewReport(report)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Report
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownloadReport(report)}
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResearchReports;
