import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, FileText, Settings as SettingsIcon, Calendar, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BusinessSidebar } from "@/components/BusinessSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeManagement } from "@/components/payroll/EmployeeManagement";
import { PayrollRuns } from "@/components/payroll/PayrollRuns";
import { BenefitsManagement } from "@/components/payroll/BenefitsManagement";
import { TimeOffManagement } from "@/components/payroll/TimeOffManagement";
import { ComplianceAutomation } from "@/components/payroll/ComplianceAutomation";
import { TaxSettings } from "@/components/payroll/TaxSettings";

export default function Payroll() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail] = useState("business@flowpulse.io");
  const [stats, setStats] = useState({
    totalEmployees: 0,
    grossPay: 0,
    netPay: 0,
    taxWithholding: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch employee count
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("id")
        .eq("status", "active");

      if (empError) throw empError;

      // Fetch latest payroll run
      const { data: latestRun, error: runError } = await supabase
        .from("payroll_runs")
        .select("total_gross, total_net")
        .eq("status", "draft")
        .order("run_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (runError && runError.code !== "PGRST116") throw runError;

      setStats({
        totalEmployees: employees?.length || 0,
        grossPay: latestRun?.total_gross || 0,
        netPay: latestRun?.total_net || 0,
        taxWithholding: (latestRun?.total_gross || 0) - (latestRun?.total_net || 0),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full business-theme">
        <BusinessSidebar userEmail={userEmail} onLogout={handleLogout} />
        
        <div className="flex-1">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/business-dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">HR & Payroll Management</h1>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6 ml-64">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground mt-1">Active employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.grossPay.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Gross payroll</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Pay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.netPay.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">After deductions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">PAYE & NI Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.taxWithholding.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total deductions</p>
            </CardContent>
              </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="employees" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="employees" className="gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="payroll" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Payroll Runs
            </TabsTrigger>
            <TabsTrigger value="benefits" className="gap-2">
              <Shield className="h-4 w-4" />
              Benefits
            </TabsTrigger>
            <TabsTrigger value="timeoff" className="gap-2">
              <Calendar className="h-4 w-4" />
              Time Off
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-2">
              <FileText className="h-4 w-4" />
              Compliance
            </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <SettingsIcon className="h-4 w-4" />
                Tax Settings
              </TabsTrigger>
              </TabsList>

              <TabsContent value="employees" className="space-y-4">
                <EmployeeManagement />
              </TabsContent>

              <TabsContent value="payroll" className="space-y-4">
                <PayrollRuns />
              </TabsContent>

              <TabsContent value="benefits" className="space-y-4">
                <BenefitsManagement />
              </TabsContent>

              <TabsContent value="timeoff" className="space-y-4">
                <TimeOffManagement />
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                <ComplianceAutomation />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <TaxSettings />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
