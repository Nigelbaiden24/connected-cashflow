import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Download, Search, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { supabase } from "@/integrations/supabase/client";

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

const AnalysisReports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
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

  const { analyzeWithAI, isLoading } = useAIAnalyst({
    onDelta: (text) => setAiResponse(prev => prev + text),
    onDone: () => {
      toast.success("AI analysis complete");
    },
    onError: (error) => {
      toast.error(error);
      setAiResponse("");
    }
  });

  const handleAIAnalysis = async () => {
    setAiResponse("");
    await analyzeWithAI(
      "Provide a comprehensive market analysis covering current trends, key sectors, and investment opportunities for today's market conditions.",
      "research-summary"
    );
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

  const renderReportGrid = (filterType?: string) => {
    const reportsToShow = filterType 
      ? filteredReports.filter(r => r.report_type.toLowerCase().includes(filterType.toLowerCase()))
      : filteredReports;

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      );
    }

    if (reportsToShow.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No reports available</p>
            <p className="text-sm text-muted-foreground text-center">
              {reports.length === 0 
                ? "Analysis reports uploaded by administrators will appear here"
                : "No reports match your search criteria"}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportsToShow.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <BarChart3 className="h-8 w-8 text-primary" />
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
                  View Analysis
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
    );
  };

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analysis Reports</h1>
          <p className="text-muted-foreground mt-2">
            Technical, fundamental, and quantitative analysis across all asset classes
          </p>
        </div>
        <Button 
          onClick={handleAIAnalysis} 
          className="bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Analysis
            </>
          )}
        </Button>
      </div>

      {aiResponse && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Market Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {aiResponse}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="fundamental">Fundamental</TabsTrigger>
          <TabsTrigger value="quantitative">Quantitative</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search analysis reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {renderReportGrid()}
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search technical reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {renderReportGrid('technical')}
        </TabsContent>

        <TabsContent value="fundamental" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fundamental reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {renderReportGrid('fundamental')}
        </TabsContent>

        <TabsContent value="quantitative" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quantitative reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {renderReportGrid('quantitative')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisReports;
