import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, DollarSign, ArrowLeft, Upload, Building2, LayoutGrid, Sparkles, Activity, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CRMBoard } from "@/components/CRMBoard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BulkImportDialog } from "@/components/crm/BulkImportDialog";
import { TranslatedText } from "@/components/TranslatedText";
import { CompaniesHouseScraper } from "@/components/crm/CompaniesHouseScraper";
import { AdminDocumentGenerator } from "@/components/admin/AdminDocumentGenerator";

const CRM = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stageFilter = searchParams.get('stage');
  const [totalContacts, setTotalContacts] = useState(0);
  const [activeContacts, setActiveContacts] = useState(0);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('board');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: allContacts, error: allError } = await supabase
        .from("crm_contacts")
        .select("id, status");

      if (allError) throw allError;

      setTotalContacts(allContacts?.length || 0);
      setActiveContacts(
        allContacts?.filter((c) => c.status === "active").length || 0
      );
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const conversionRate = totalContacts > 0 ? ((activeContacts / totalContacts) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex-1 p-3 md:p-6 lg:p-8 space-y-4 md:space-y-6 animate-in fade-in duration-500">
      {/* Premium Header with gradient accent */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-4 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-chart-1/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/15 backdrop-blur-sm border border-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">
                   <TranslatedText>CRM</TranslatedText>
                 </h1>
                <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                  <TranslatedText>Customer Relationship Management</TranslatedText>
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {activeTab === 'board' && (
              <Button 
                onClick={() => setImportDialogOpen(true)}
                className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 bg-primary hover:bg-primary/90"
              >
                <Upload className="h-4 w-4 mr-2" />
                <TranslatedText>Bulk Import</TranslatedText>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2 hover:bg-accent/50 transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <TranslatedText>Back</TranslatedText>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3 bg-muted/50 backdrop-blur-sm border border-border/50 p-1 rounded-xl h-auto">
          <TabsTrigger 
            value="board" 
            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-foreground py-2.5 transition-all duration-200"
          >
            <LayoutGrid className="h-4 w-4" />
            Contact Board
          </TabsTrigger>
          <TabsTrigger 
            value="scraper" 
            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-foreground py-2.5 transition-all duration-200"
          >
            <Building2 className="h-4 w-4" />
            Companies House
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-foreground py-2.5 transition-all duration-200"
          >
            <FileText className="h-4 w-4" />
            Document Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-6">
          {/* Enhanced Stats Cards - monday.com style */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="group relative overflow-hidden border-border/40 bg-gradient-to-br from-card to-card/80 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40 rounded-t-lg" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                  <TranslatedText>Total Contacts</TranslatedText>
                </CardTitle>
                <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300 group-hover:scale-110 transform">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 relative">
                <div className="text-4xl font-bold tracking-tight tabular-nums">{totalContacts}</div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {activeContacts} <TranslatedText>active</TranslatedText>
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-border/40 bg-gradient-to-br from-card to-card/80 hover:shadow-xl hover:shadow-chart-1/5 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-1/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chart-1 via-chart-1/80 to-chart-1/40 rounded-t-lg" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                  <TranslatedText>Conversion Rate</TranslatedText>
                </CardTitle>
                <div className="p-2.5 rounded-xl bg-chart-1/10 group-hover:bg-chart-1/15 transition-colors duration-300 group-hover:scale-110 transform">
                  <TrendingUp className="h-5 w-5 text-chart-1" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 relative">
                <div className="text-4xl font-bold tracking-tight tabular-nums">{conversionRate}%</div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-chart-1/10 text-chart-1 text-xs font-medium">
                    <Activity className="h-3 w-3" />
                    <TranslatedText>From leads to clients</TranslatedText>
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-border/40 bg-gradient-to-br from-card to-card/80 hover:shadow-xl hover:shadow-chart-2/5 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-2/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chart-2 via-chart-2/80 to-chart-2/40 rounded-t-lg" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                  <TranslatedText>Pipeline Value</TranslatedText>
                </CardTitle>
                <div className="p-2.5 rounded-xl bg-chart-2/10 group-hover:bg-chart-2/15 transition-colors duration-300 group-hover:scale-110 transform">
                  <DollarSign className="h-5 w-5 text-chart-2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 relative">
                <div className="text-4xl font-bold tracking-tight tabular-nums">£125K</div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-chart-2/10 text-chart-2 text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    <TranslatedText>Potential revenue</TranslatedText>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <CRMBoard key={refreshTrigger} initialStage={stageFilter} />
        </TabsContent>

        <TabsContent value="scraper">
          <CompaniesHouseScraper />
        </TabsContent>

        <TabsContent value="documents">
          <AdminDocumentGenerator />
        </TabsContent>
      </Tabs>

      <BulkImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={() => {
          fetchStats();
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </div>
  );
};

export default CRM;
