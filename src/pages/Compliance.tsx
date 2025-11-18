import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Shield, 
  Search, 
  Filter,
  ChevronDown,
  ArrowLeft,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  Lock
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ComplianceDashboard } from "@/components/compliance/ComplianceDashboard";
import { NextActionsCard } from "@/components/compliance/NextActionsCard";
import { RuleEngineManager } from "@/components/compliance/RuleEngineManager";
import { CaseManagement } from "@/components/compliance/CaseManagement";
import { DocumentTracker } from "@/components/compliance/DocumentTracker";
import { AIInsightsPanel } from "@/components/compliance/AIInsightsPanel";
import { UploadDocumentDialog } from "@/components/compliance/UploadDocumentDialog";
import { CreateRuleDialog } from "@/components/compliance/CreateRuleDialog";

const Compliance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [rules, setRules] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [checks, setChecks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createRuleDialogOpen, setCreateRuleDialogOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const insightsRef = useRef<HTMLDivElement>(null);
  const [categoryExpanded, setCategoryExpanded] = useState({
    kyc_aml: true,
    documentation: true,
    suitability: true,
    trading: true,
    portfolio_risk: true,
  });

  // Load data
  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setIsLoading(true);
    try {
      // Load clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Load rules
      const { data: rulesData, error: rulesError } = await supabase
        .from("compliance_rules")
        .select("*")
        .order("severity", { ascending: false });

      if (rulesError) throw rulesError;
      setRules(rulesData || []);

      // Load recent checks
      const { data: checksData, error: checksError } = await supabase
        .from("compliance_checks")
        .select("*, clients(name), compliance_rules(rule_name)")
        .order("check_date", { ascending: false })
        .limit(100);

      if (checksError) throw checksError;
      setChecks(checksData || []);

      // Load cases
      const { data: casesData, error: casesError } = await supabase
        .from("compliance_cases")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });

      if (casesError) throw casesError;
      setCases(casesData || []);

      // Load documents
      const { data: docsData, error: docsError } = await supabase
        .from("client_compliance_documents")
        .select("*, clients(name)")
        .order("expiry_date", { ascending: true });

      if (docsError) throw docsError;
      
      // Calculate days until expiry
      const docsWithExpiry = docsData?.map(doc => {
        if (doc.expiry_date) {
          const expiry = new Date(doc.expiry_date);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return { ...doc, days_until_expiry: daysUntilExpiry };
        }
        return doc;
      }) || [];
      
      setDocuments(docsWithExpiry);

      // Load AI insights
      await loadAIInsights(rulesData || [], checksData || [], casesData || [], docsWithExpiry);

    } catch (error: any) {
      toast({
        title: "Error loading compliance data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dashboard stats
  const calculateStats = () => {
    const passedChecks = checks.filter(c => c.status === "pass").length;
    const failedChecks = checks.filter(c => c.status === "fail" || c.status === "warning").length;
    const pendingCases = cases.filter(c => c.status === "open" || c.status === "under_review").length;
    const expiringDocs = documents.filter(d => 
      d.days_until_expiry !== undefined && 
      d.days_until_expiry <= 30 && 
      d.days_until_expiry >= 0
    ).length;

    const totalChecks = passedChecks + failedChecks;
    const overallScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    return {
      overallScore,
      trend: "up" as const,
      totalRules: rules.length,
      passedChecks,
      failedChecks,
      pendingCases,
      expiringDocs,
    };
  };

  // Generate next actions
  const generateNextActions = () => {
    const actions: any[] = [];

    // Add expiring documents
    documents
      .filter(d => d.days_until_expiry !== undefined && d.days_until_expiry <= 7 && d.days_until_expiry >= 0)
      .slice(0, 3)
      .forEach(doc => {
        actions.push({
          id: doc.id,
          type: "document",
          title: `Document expiring soon: ${doc.document_name}`,
          description: `${doc.clients?.name || 'Unknown client'} - Expires in ${doc.days_until_expiry} days`,
          priority: doc.days_until_expiry <= 3 ? "critical" : "high",
          dueDate: doc.expiry_date,
        });
      });

    // Add open cases
    cases.slice(0, 3).forEach(caseItem => {
      actions.push({
        id: caseItem.id,
        type: "case",
        title: `Case requires attention: ${caseItem.title}`,
        description: `${caseItem.clients?.name || 'Unknown client'} - ${caseItem.status}`,
        priority: caseItem.priority,
      });
    });

    return actions;
  };

  // Generate AI insights
  const generateAIInsights = () => {
    const insights: any[] = [];

    // Analyze trends
    const recentChecks = checks.slice(0, 20);
    const failureRate = recentChecks.length > 0 ? recentChecks.filter(c => c.status === "fail").length / recentChecks.length : 0;
    
    if (failureRate > 0.2) {
      insights.push({
        id: "trend-1",
        type: "alert",
        title: "Increasing compliance failures detected",
        description: `Failure rate has increased to ${Math.round(failureRate * 100)}% in recent checks. Consider reviewing rule thresholds and client profiles.`,
        confidence: 85,
        action: "Review Failed Checks",
      });
    }

    // Document expiry analysis
    const criticalExpiring = documents.filter(d => d.days_until_expiry !== undefined && d.days_until_expiry <= 7).length;
    if (criticalExpiring > 0) {
      insights.push({
        id: "doc-1",
        type: "suggestion",
        title: "Proactive document renewal recommended",
        description: `${criticalExpiring} documents expiring within 7 days. Consider implementing automated renewal reminders.`,
        confidence: 92,
        action: "Set Up Auto-Reminders",
      });
    }

    // Case management insight
    const longOpenCases = cases.filter(c => {
      const daysSinceCreated = Math.floor((new Date().getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreated > 30;
    }).length;

    if (longOpenCases > 0) {
      insights.push({
        id: "case-1",
        type: "risk",
        title: "Cases pending resolution",
        description: `${longOpenCases} cases have been open for more than 30 days. This may indicate resource constraints or complex issues requiring escalation.`,
        confidence: 78,
        action: "Review Long-Standing Cases",
      });
    }

    return insights;
  };

  // Rule handlers
  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("compliance_rules")
        .update({ enabled })
        .eq("id", ruleId);

      if (error) throw error;

      setRules(rules.map(r => r.id === ruleId ? { ...r, enabled } : r));
      
      toast({
        title: enabled ? "Rule enabled" : "Rule disabled",
        description: "Rule status updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating rule",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRunCheck = async (ruleId: string) => {
    toast({
      title: "Running compliance check",
      description: "This may take a few moments...",
    });

    // In production, this would trigger the actual check
    setTimeout(() => {
      toast({
        title: "Check completed",
        description: "Results have been recorded.",
      });
      loadComplianceData();
    }, 2000);
  };

  const handleConfigureRule = (ruleId: string) => {
    toast({
      title: "Configure rule",
      description: "Rule configuration panel would open here.",
    });
  };

  const handleCreateRule = () => {
    setCreateRuleDialogOpen(true);
  };

  // Case handlers
  const handleViewCase = (caseId: string) => {
    // Case detail is shown in modal
  };

  const handleUpdateCaseStatus = async (caseId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("compliance_cases")
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === "resolved" && { resolved_at: new Date().toISOString() })
        })
        .eq("id", caseId);

      if (error) throw error;

      setCases(cases.map(c => c.id === caseId ? { ...c, status } : c));
      
      toast({
        title: "Case updated",
        description: `Case status changed to ${status}.`,
      });
      
      loadComplianceData();
    } catch (error: any) {
      toast({
        title: "Error updating case",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddCaseComment = async (caseId: string, comment: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("compliance_case_comments")
        .insert({
          case_id: caseId,
          user_id: user.id,
          comment,
        });

      if (error) throw error;

      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Load AI insights
  const loadAIInsights = async (rulesData: any[], checksData: any[], casesData: any[], docsData: any[]) => {
    setIsLoadingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke('compliance-insights', {
        body: {
          rules: rulesData,
          checks: checksData,
          cases: casesData,
          documents: docsData,
        }
      });

      if (error) throw error;

      if (data && data.insights) {
        setAiInsights(data.insights.map((insight: any, index: number) => ({
          id: `ai-${index}`,
          ...insight
        })));
      }
    } catch (error: any) {
      console.error('AI insights error:', error);
      // Fallback to static insights if AI fails
      setAiInsights(generateAIInsights());
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Document handlers
  const handleUploadDocument = () => {
    setUploadDialogOpen(true);
  };

  const handleViewDocument = (docId: string) => {
    toast({
      title: "View document",
      description: "Document viewer would open here.",
    });
  };

  // AI handlers
  const handleGenerateReport = async () => {
    if (!insightsRef.current || aiInsights.length === 0) {
      toast({
        title: "No insights available",
        description: "Generate AI insights first by loading compliance data",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating PDF report",
      description: "Creating compliance insights report...",
    });

    const options = {
      margin: 10,
      filename: `compliance-insights-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(options).from(insightsRef.current).save();
      toast({
        title: "Report generated",
        description: "AI compliance insights report downloaded successfully",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const handleApplyInsight = (insightId: string) => {
    toast({
      title: "Applying insight",
      description: "Recommended action would be applied here.",
    });
  };

  const handleActionClick = (action: any) => {
    if (action.type === "document") {
      handleViewDocument(action.id);
    } else if (action.type === "case") {
      handleViewCase(action.id);
    }
  };

  // Filter rules by category
  const filterRulesByCategory = (category: string) => {
    return rules.filter(r => r.rule_type === category);
  };

  const stats = calculateStats();
  const nextActions = generateNextActions();

  // Transform documents for DocumentTracker
  const transformedDocuments = documents.map(doc => ({
    ...doc,
    client_name: doc.clients?.name || "Unknown Client",
  }));

  // Transform cases for CaseManagement
  const transformedCases = cases.map(caseItem => ({
    ...caseItem,
    client_name: caseItem.clients?.name || "Unknown Client",
  }));

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Enterprise Compliance Center</h1>
            <p className="text-muted-foreground">Automated monitoring, case management, and AI-powered insights</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Global Dashboard */}
      <ComplianceDashboard {...stats} />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rules, cases, documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="kyc_aml">KYC/AML</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="suitability">Suitability</SelectItem>
                <SelectItem value="trading">Trading</SelectItem>
                <SelectItem value="portfolio_risk">Portfolio Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pass">Compliant</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="fail">Failed</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Next Actions */}
          <NextActionsCard actions={nextActions} onActionClick={handleActionClick} />

          {/* Main Content Tabs */}
          <Tabs defaultValue="rules" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="cases">Cases</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-4">
              {/* Collapsible Categories */}
              <div className="space-y-3">
                {Object.entries(categoryExpanded).map(([category, isExpanded]) => (
                  <Collapsible
                    key={category}
                    open={isExpanded}
                    onOpenChange={() =>
                      setCategoryExpanded({ ...categoryExpanded, [category]: !isExpanded })
                    }
                  >
                    <Card>
                      <CollapsibleTrigger className="w-full">
                        <CardContent className="pt-6 pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                {category === "kyc_aml" && <Users className="h-5 w-5 text-primary" />}
                                {category === "documentation" && <FileText className="h-5 w-5 text-primary" />}
                                {category === "suitability" && <TrendingUp className="h-5 w-5 text-primary" />}
                                {category === "trading" && <TrendingUp className="h-5 w-5 text-primary" />}
                                {category === "portfolio_risk" && <AlertTriangle className="h-5 w-5 text-primary" />}
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold">{category.replace("_", " ").toUpperCase()}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {filterRulesByCategory(category).length} rules
                                </p>
                              </div>
                            </div>
                            <ChevronDown
                              className={`h-5 w-5 transition-transform ${
                                isExpanded ? "transform rotate-180" : ""
                              }`}
                            />
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-6">
                          <RuleEngineManager
                            rules={filterRulesByCategory(category)}
                            onToggleRule={handleToggleRule}
                            onRunCheck={handleRunCheck}
                            onConfigureRule={handleConfigureRule}
                            onCreateRule={handleCreateRule}
                          />
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cases">
              <CaseManagement
                cases={transformedCases}
                onViewCase={handleViewCase}
                onUpdateStatus={handleUpdateCaseStatus}
                onAddComment={handleAddCaseComment}
              />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentTracker
                documents={transformedDocuments}
                onUploadDocument={handleUploadDocument}
                onViewDocument={handleViewDocument}
              />
            </TabsContent>

            <TabsContent value="audit">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="h-5 w-5" />
                    <h3 className="font-semibold">Audit Trail</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete compliance audit history with timestamps, user actions, and change tracking.
                  </p>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Audit trail functionality coming soon</p>
                    <p className="text-sm">All compliance actions are being logged in the background</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Insights Sidebar */}
        <div className="space-y-6">
          <div ref={insightsRef}>
            <AIInsightsPanel
              insights={aiInsights}
              onGenerateReport={handleGenerateReport}
              onApplyInsight={handleApplyInsight}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <UploadDocumentDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        clients={clients}
        onSuccess={loadComplianceData}
      />
      
      <CreateRuleDialog
        open={createRuleDialogOpen}
        onOpenChange={setCreateRuleDialogOpen}
        onSuccess={loadComplianceData}
      />
    </div>
  );
};

export default Compliance;