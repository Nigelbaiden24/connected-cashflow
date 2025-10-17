import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, FileText, Settings, Calendar, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeManagement } from "@/components/payroll/EmployeeManagement";
import { PayrollRuns } from "@/components/payroll/PayrollRuns";
import { BenefitsManagement } from "@/components/payroll/BenefitsManagement";
import { TimeOffManagement } from "@/components/payroll/TimeOffManagement";
import { ComplianceAutomation } from "@/components/payroll/ComplianceAutomation";
import { TaxSettings } from "@/components/payroll/TaxSettings";

export default function Payroll() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    grossPay: 0,
    netPay: 0,
    taxWithholding: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">HR & Payroll Management</h1>
            <p className="text-muted-foreground mt-1">
              Enterprise-grade payroll processing, tax calculations, and compliance automation
            </p>
          </div>
        </div>

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
              <div className="text-2xl font-bold">${stats.grossPay.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Gross payroll</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Pay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.netPay.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">After deductions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tax Withholding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.taxWithholding.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total taxes</p>
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
              <Settings className="h-4 w-4" />
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
      </div>
    </div>
  );
}
