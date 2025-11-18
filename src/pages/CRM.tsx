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
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM</h1>
          <p className="text-muted-foreground">Customer Relationship Management</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
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
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              {activeContacts} active relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <p className="text-xs text-muted-foreground">From leads to clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£125K</div>
            <p className="text-xs text-muted-foreground">Potential revenue</p>
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
