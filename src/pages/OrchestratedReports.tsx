import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Plus, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ReportOrchestrator } from '@/components/research/ReportOrchestrator';
import { ReportViewer, OrchestatedReport } from '@/components/research/ReportViewer';
import { format } from 'date-fns';

interface SavedReport {
  id: string;
  report_title: string;
  asset_name: string | null;
  asset_type: string | null;
  selected_modules: string[];
  report_content: any;
  status: string;
  generated_at: string | null;
  created_at: string;
}

export default function OrchestratedReportsPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSavedReports();
  }, []);

  const fetchSavedReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orchestrated_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSavedReports((data as SavedReport[]) || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'generating':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Generating</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (selectedReport) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Button 
          variant="outline" 
          onClick={() => setSelectedReport(null)}
          className="mb-4"
        >
          ← Back to Reports
        </Button>
        <ReportViewer report={selectedReport.report_content} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Research Report Orchestrator</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage institutional-grade research reports
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <FileText className="h-4 w-4" />
          {savedReports.length} Report{savedReports.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'generate' | 'history')}>
        <TabsList className="mb-6">
          <TabsTrigger value="generate" className="gap-2">
            <Plus className="h-4 w-4" />
            Generate Report
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            Report History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <ReportOrchestrator />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Reports</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchSavedReports}>
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : savedReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No reports yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate your first research report to see it here
                  </p>
                  <Button onClick={() => setActiveTab('generate')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {savedReports.map((report) => (
                      <Card 
                        key={report.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedReport(report)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{report.report_title}</h4>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                {report.asset_name && (
                                  <span>{report.asset_name}</span>
                                )}
                                {report.asset_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {report.asset_type}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {report.selected_modules.map((moduleId) => (
                                  <Badge key={moduleId} variant="secondary" className="text-xs">
                                    {moduleId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              {getStatusBadge(report.status)}
                              <p className="text-xs text-muted-foreground mt-2">
                                {report.generated_at 
                                  ? format(new Date(report.generated_at), 'MMM d, yyyy HH:mm')
                                  : format(new Date(report.created_at), 'MMM d, yyyy HH:mm')
                                }
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <Card className="mt-8 bg-muted/30">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Platform Disclaimer:</strong> All reports generated through this platform are for informational 
            and research purposes only. They do not constitute investment advice, recommendations, or suitability 
            assessments. Users should conduct their own due diligence before making any investment decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
