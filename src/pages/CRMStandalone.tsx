import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, DollarSign, Upload, LayoutGrid, LogOut, Sparkles, Activity, Zap } from "lucide-react";
import { PinchZoomContainer } from "@/components/crm/PinchZoomContainer";
import { supabase } from "@/integrations/supabase/client";
import { CRMBoard } from "@/components/CRMBoard";
import { useNavigate } from "react-router-dom";
import { BulkImportDialog } from "@/components/crm/BulkImportDialog";
import { TranslatedText } from "@/components/TranslatedText";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface CRMStandaloneProps {
  userEmail: string;
  onLogout: () => void;
}

const CRMStandalone = ({ userEmail, onLogout }: CRMStandaloneProps) => {
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background crm-orb-bg">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 crm-header-shimmer"
        style={{
          background: 'linear-gradient(135deg, hsl(221 83% 48%) 0%, hsl(199 89% 45%) 50%, hsl(221 83% 53%) 100%)',
        }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { if (e.detail === 0) return; navigate('/'); }}>
            <div className="relative">
              <img src={flowpulseLogo} alt="FlowPulse CRM" className="h-10 transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute -inset-1 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div>
              <span className="font-bold text-xl text-white tracking-tight">FlowPulse CRM</span>
              <p className="text-xs text-white/60 font-medium">{userEmail}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:shadow-white/5"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-8 animate-in fade-in duration-500">
        {/* Hero Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 crm-icon-glow">
                <LayoutGrid className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-chart-3 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  <TranslatedText>CRM Dashboard</TranslatedText>
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  <TranslatedText>Enterprise Relationship Management</TranslatedText>
                </p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setImportDialogOpen(true)}
            className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-chart-3 hover:from-primary/90 hover:to-chart-3/90 hover:-translate-y-0.5 group"
          >
            <Upload className="h-4 w-4 mr-2 transition-transform group-hover:-translate-y-0.5" />
            <TranslatedText>Bulk Import</TranslatedText>
          </Button>
        </div>

        {/* 3D Stats Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {/* Total Contacts */}
          <Card className="crm-card-3d crm-glass-card rounded-xl border-0 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <TranslatedText>Total Contacts</TranslatedText>
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 crm-icon-glow transition-transform duration-300 group-hover:scale-110">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 relative z-10">
              <div className="text-4xl font-bold tracking-tight crm-metric">{totalContacts}</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
                  <Activity className="h-3 w-3 text-success" />
                  <span className="text-xs font-semibold text-success">{activeContacts}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  <TranslatedText>active relationships</TranslatedText>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card className="crm-card-3d crm-glass-card rounded-xl border-0 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <TranslatedText>Conversion Rate</TranslatedText>
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-chart-1/20 to-chart-1/5 border border-chart-1/10 crm-icon-glow transition-transform duration-300 group-hover:scale-110">
                <TrendingUp className="h-5 w-5 text-chart-1" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 relative z-10">
              <div className="text-4xl font-bold tracking-tight crm-metric">24.5%</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-1/10 border border-chart-1/20">
                  <Zap className="h-3 w-3 text-chart-1" />
                  <span className="text-xs font-semibold text-chart-1">+3.2%</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  <TranslatedText>From leads to clients</TranslatedText>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Value */}
          <Card className="crm-card-3d crm-glass-card rounded-xl border-0 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <TranslatedText>Pipeline Value</TranslatedText>
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 border border-chart-2/10 crm-icon-glow transition-transform duration-300 group-hover:scale-110">
                <DollarSign className="h-5 w-5 text-chart-2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 relative z-10">
              <div className="text-4xl font-bold tracking-tight crm-metric">£125K</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-2/10 border border-chart-2/20">
                  <Sparkles className="h-3 w-3 text-chart-2" />
                  <span className="text-xs font-semibold text-chart-2">12 deals</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  <TranslatedText>Potential revenue</TranslatedText>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <PinchZoomContainer minScale={0.25} maxScale={3}>
          <CRMBoard key={refreshTrigger} />
        </PinchZoomContainer>

        <BulkImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImportComplete={() => {
            fetchStats();
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      </div>
    </div>
  );
};

export default CRMStandalone;
