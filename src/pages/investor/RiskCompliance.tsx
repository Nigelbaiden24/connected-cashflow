import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, CheckCircle, FileText, Upload, Loader2, Download, Brain, TrendingUp, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export default function RiskCompliance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [aiRiskInsights, setAiRiskInsights] = useState<any>(null);
  const [aiComplianceInsights, setAiComplianceInsights] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const riskMetrics = [
    { label: "Portfolio Risk Score", value: "6.5/10", status: "Medium", color: "yellow" },
    { label: "Compliance Status", value: "98%", status: "Good", color: "green" },
    { label: "Risk Alerts", value: "3 Active", status: "Attention", color: "red" },
  ];

  useEffect(() => {
    loadReports();
    loadRegulatoryUpdates();
  }, []);

  const loadReports = async () => {
    const { data } = await supabase
      .from("risk_assessment_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setReports(data);
  };

  const loadRegulatoryUpdates = async () => {
    const { data } = await supabase
      .from("regulatory_updates")
      .select("*")
      .order("update_date", { ascending: false })
      .limit(10);
    if (data) setRegulatoryUpdates(data);
  };

  const runStressTest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("risk-stress-test", {
        body: { testType: "comprehensive" },
      });

      if (error) throw error;

      toast({
        title: "Stress Test Complete",
        description: "Portfolio stress test completed successfully",
      });
      
      loadReports();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run stress test",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeExposure = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("exposure-analysis");

      if (error) throw error;

      toast({
        title: "Exposure Analysis Complete",
        description: "Portfolio exposure analysis completed successfully",
      });
      
      loadReports();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze exposure",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewReport = (report: any) => {
    setSelectedReport(report);
    setShowReportDialog(true);
  };

  const viewUpdate = (update: any) => {
    setSelectedUpdate(update);
    setShowUpdateDialog(true);
  };

  const generateRegulatoryUpdates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-regulatory-updates");

      if (error) throw error;

      toast({
        title: "Updates Generated",
        description: `${data?.count || 0} new regulatory updates generated`,
      });
      
      loadRegulatoryUpdates();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate updates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runAIRiskAnalysis = async () => {
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-risk-analysis");
      if (error) throw error;
      setAiRiskInsights(data);
      toast({
        title: "AI Risk Analysis Complete",
        description: "Portfolio risk analysis completed successfully",
      });
    } catch (error) {
      console.error("AI risk analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unable to complete AI risk analysis",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const runAIComplianceCheck = async () => {
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-compliance-monitor");
      if (error) throw error;
      setAiComplianceInsights(data);
      toast({
        title: "AI Compliance Check Complete",
        description: "Compliance monitoring completed successfully",
      });
    } catch (error) {
      console.error("AI compliance monitoring error:", error);
      toast({
        title: "Check Failed",
        description: error instanceof Error ? error.message : "Unable to complete AI compliance check",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Risk & Compliance Hub</h1>
          <p className="text-muted-foreground mt-2">AI-powered risk analysis and compliance monitoring</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiRiskInsights?.riskScore?.toFixed(1) || "—"}/10</div>
            <Badge 
              variant={
                !aiRiskInsights?.riskLevel ? "secondary" :
                aiRiskInsights.riskLevel === "low" ? "default" : 
                aiRiskInsights.riskLevel === "medium" ? "secondary" : 
                "destructive"
              }
              className="mt-2"
            >
              {aiRiskInsights?.riskLevel || "Calculating..."}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiComplianceInsights?.complianceScore || "—"}%</div>
            <Badge 
              variant={
                !aiComplianceInsights?.status ? "secondary" :
                aiComplianceInsights.status === "compliant" ? "default" : 
                aiComplianceInsights.status === "needs_attention" ? "secondary" : 
                "destructive"
              }
              className="mt-2"
            >
              {aiComplianceInsights?.status?.replace('_', ' ') || "Analyzing..."}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Priority Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aiComplianceInsights?.priorities?.filter((p: any) => p.level === "critical" || p.level === "high").length || 0}
            </div>
            <Badge variant="destructive" className="mt-2">
              {aiComplianceInsights?.priorities?.length || 0} Total Tasks
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              AI Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Run AI Risk Analysis</p>
                <p className="text-sm text-muted-foreground">
                  Analyze portfolio risk using AI
                </p>
              </div>
              <Button size="sm" onClick={runAIRiskAnalysis} disabled={loadingAI}>
                {loadingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              </Button>
            </div>
            {loadingAI && !aiRiskInsights ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : aiRiskInsights?.insights ? (
              <div className="space-y-3">
                {aiRiskInsights.insights.slice(0, 3).map((insight: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex items-start gap-2">
                      {insight.type === "risk" && <AlertTriangle className="h-4 w-4 text-destructive mt-1" />}
                      {insight.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1" />}
                      {insight.type === "opportunity" && <TrendingUp className="h-4 w-4 text-green-500 mt-1" />}
                      {insight.type === "recommendation" && <Activity className="h-4 w-4 text-primary mt-1" />}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{insight.title}</p>
                          <Badge variant={
                            insight.priority === "critical" ? "destructive" :
                            insight.priority === "high" ? "secondary" : "outline"
                          } className="text-xs">
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                        {insight.actionable && insight.action && (
                          <p className="text-xs text-primary mt-2">→ {insight.action}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Click "Run AI Risk Analysis" to get started
              </p>
            )}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Portfolio Stress Test</p>
                <p className="text-sm text-muted-foreground">
                  {reports.find(r => r.report_type === "stress_test") 
                    ? `Last run: ${new Date(reports.find(r => r.report_type === "stress_test").created_at).toLocaleDateString()}`
                    : "Not run yet"}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={runStressTest} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run Test"}
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Risk Assessment Reports</p>
                <p className="text-sm text-muted-foreground">{reports.length} reports available</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => reports[0] && viewReport(reports[0])}
                disabled={reports.length === 0}
              >
                View Reports
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Exposure Analysis</p>
                <p className="text-sm text-muted-foreground">By sector and region</p>
              </div>
              <Button size="sm" variant="outline" onClick={analyzeExposure} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              AI Compliance Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Run AI Compliance Check</p>
                <p className="text-sm text-muted-foreground">
                  Monitor compliance status with AI
                </p>
              </div>
              <Button size="sm" onClick={runAIComplianceCheck} disabled={loadingAI}>
                {loadingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              </Button>
            </div>
            {loadingAI && !aiComplianceInsights ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : aiComplianceInsights?.checks ? (
              <div className="space-y-3">
                {aiComplianceInsights.checks.map((check: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {check.status === "pass" && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {check.status === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                      {check.status === "fail" && <AlertTriangle className="h-5 w-5 text-destructive" />}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{check.title}</p>
                          <Badge variant="outline" className="text-xs">{check.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{check.finding}</p>
                        {check.action && check.status !== "pass" && (
                          <p className="text-xs text-primary mt-1">→ {check.action}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {aiComplianceInsights.priorities && aiComplianceInsights.priorities.length > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm mb-2">Priority Tasks:</p>
                    <div className="space-y-2">
                      {aiComplianceInsights.priorities.slice(0, 2).map((priority: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Badge variant={
                            priority.level === "critical" ? "destructive" : "secondary"
                          } className="text-xs mt-0.5">
                            {priority.level}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-xs">{priority.task}</p>
                            <p className="text-xs text-muted-foreground">Due: {priority.deadline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Click "Run AI Compliance Check" to get started
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Regulatory Updates</CardTitle>
          <Button size="sm" onClick={generateRegulatoryUpdates} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Updates"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {regulatoryUpdates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No regulatory updates available</p>
              <p className="text-sm mt-2">Click "Generate Updates" to create AI-powered updates</p>
            </div>
          ) : (
            regulatoryUpdates.map((update) => (
              <div key={update.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{update.title}</p>
                    <Badge variant="outline" className="text-xs">{update.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{update.summary}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(update.update_date).toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => viewUpdate(update)}>
                  Read More
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedReport?.report_name}</DialogTitle>
            <DialogDescription>{selectedReport?.summary}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Report Type</h3>
                  <Badge>{selectedReport.report_type}</Badge>
                </div>
                
                {selectedReport.report_data?.scenarios && (
                  <div>
                    <h3 className="font-semibold mb-2">Stress Test Scenarios</h3>
                    <div className="space-y-2">
                      {selectedReport.report_data.scenarios.map((scenario: any, idx: number) => (
                        <Card key={idx}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium">{scenario.scenario}</p>
                              <Badge variant={
                                scenario.riskLevel === "high" ? "destructive" : 
                                scenario.riskLevel === "medium" ? "secondary" : "default"
                              }>
                                {scenario.riskLevel}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Impact: {scenario.impact}%</div>
                              <div>Probability: {(scenario.probability * 100).toFixed(0)}%</div>
                              <div>Projected Value: ${scenario.projectedValue?.toFixed(0)}</div>
                              <div>Potential Loss: ${scenario.potentialLoss?.toFixed(0)}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.report_data?.sectorExposure && (
                  <div>
                    <h3 className="font-semibold mb-2">Sector Exposure</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedReport.report_data.sectorExposure).map(([sector, exposure]: [string, any]) => (
                        <div key={sector} className="flex justify-between p-2 border rounded">
                          <span>{sector}</span>
                          <span className="font-medium">{exposure}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.report_data?.recommendations && (
                  <div>
                    <h3 className="font-semibold mb-2">Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedReport.report_data.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Regulatory Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>{selectedUpdate?.title}</DialogTitle>
              <Badge variant="outline">{selectedUpdate?.category}</Badge>
            </div>
            <DialogDescription>
              {selectedUpdate?.source} • {selectedUpdate && new Date(selectedUpdate.update_date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            {selectedUpdate && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-sm">{selectedUpdate.summary}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Full Content</h3>
                  <div className="prose prose-sm max-w-none whitespace-pre-line">
                    {selectedUpdate.content}
                  </div>
                </div>
                {selectedUpdate.ai_generated && (
                  <Badge variant="secondary" className="mt-4">
                    AI Generated Content
                  </Badge>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
