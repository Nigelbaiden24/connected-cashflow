import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, DollarSign, ArrowLeft, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CRMBoard } from "@/components/CRMBoard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BulkImportDialog } from "@/components/crm/BulkImportDialog";

const CRM = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stageFilter = searchParams.get('stage');
  const [totalContacts, setTotalContacts] = useState(0);
  const [activeContacts, setActiveContacts] = useState(0);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  return (
    <div className="flex-1 p-6 space-y-6 animate-in fade-in duration-500">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            CRM
          </h1>
          <p className="text-muted-foreground text-sm">
            Customer Relationship Management
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setImportDialogOpen(true)}
            className="shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 hover:bg-accent/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contacts
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight">{totalContacts}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {activeContacts} active relationships
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <div className="p-2 rounded-lg bg-chart-1/10">
              <TrendingUp className="h-4 w-4 text-chart-1" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight">24.5%</div>
            <p className="text-xs text-muted-foreground">
              From leads to clients
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline Value
            </CardTitle>
            <div className="p-2 rounded-lg bg-chart-2/10">
              <DollarSign className="h-4 w-4 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight">£125K</div>
            <p className="text-xs text-muted-foreground">
              Potential revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <CRMBoard key={refreshTrigger} initialStage={stageFilter} />

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
