import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, FileText, Settings as SettingsIcon, Calendar, Shield, ArrowLeft, TrendingUp, Award, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EmployeeManagement } from "@/components/payroll/EmployeeManagement";
import { PayrollRuns } from "@/components/payroll/PayrollRuns";
import { BenefitsManagement } from "@/components/payroll/BenefitsManagement";
import { TimeOffManagement } from "@/components/payroll/TimeOffManagement";
import { ComplianceAutomation } from "@/components/payroll/ComplianceAutomation";
import { TaxSettings } from "@/components/payroll/TaxSettings";

export default function FinancePayroll() {
  const navigate = useNavigate();
  const { toast } = useToast();
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
    <div className="flex-1">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Payroll & Benefits Management</h1>
            <p className="text-sm text-muted-foreground">FlowPulse Finance Platform</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </header>

      <main className="flex-1 space-y-6 p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground mt-1">Active employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Gross Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.grossPay.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Current period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Net Pay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.netPay.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">After deductions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tax Withholding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.taxWithholding.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total taxes & deductions</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Enterprise Payroll Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Automated Tax Calculations</h4>
                  <p className="text-sm text-muted-foreground">Federal, state, and local tax compliance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Direct Deposit</h4>
                  <p className="text-sm text-muted-foreground">ACH transfers with payment tracking</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Compliance Automation</h4>
                  <p className="text-sm text-muted-foreground">Automated filing and reporting</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Employee Self-Service</h4>
                  <p className="text-sm text-muted-foreground">Payslips, tax forms, and updates</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Benefits Integration</h4>
                  <p className="text-sm text-muted-foreground">Health, retirement, and more</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Time Tracking</h4>
                  <p className="text-sm text-muted-foreground">Integrated time & attendance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage employee records, compensation, and direct deposit information
                </p>
              </CardHeader>
            </Card>
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Processing</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Run payroll with automated tax calculations and direct deposit
                </p>
              </CardHeader>
            </Card>
            <PayrollRuns />
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Benefits Administration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage health insurance, retirement plans, and other employee benefits
                </p>
              </CardHeader>
            </Card>
            <BenefitsManagement />
          </TabsContent>

          <TabsContent value="timeoff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Time Off Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track vacation, sick leave, and PTO requests with automated accrual
                </p>
              </CardHeader>
            </Card>
            <TimeOffManagement />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Reporting</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Automated tax filing, W-2s, 1099s, and regulatory compliance
                </p>
              </CardHeader>
            </Card>
            <ComplianceAutomation />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tax Settings & Configuration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure federal, state, and local tax rates for accurate payroll processing
                </p>
              </CardHeader>
            </Card>
            <TaxSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
