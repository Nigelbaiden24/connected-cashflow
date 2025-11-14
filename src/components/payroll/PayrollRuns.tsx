import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Calendar, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PayrollRun {
  id: string;
  run_date: string;
  pay_period_start: string;
  pay_period_end: string;
  payment_date: string;
  total_gross: number;
  total_net: number;
  status: string;
}

export const PayrollRuns = () => {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    pay_period_start: "",
    pay_period_end: "",
    payment_date: "",
  });

  useEffect(() => {
    fetchPayrollRuns();
  }, []);

  const fetchPayrollRuns = async () => {
    try {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .order("run_date", { ascending: false });

      if (error) throw error;
      setPayrollRuns(data || []);
    } catch (error) {
      console.error("Error fetching payroll runs:", error);
      toast.error("Failed to load payroll runs");
    }
  };

  const calculatePayroll = async () => {
    if (!formData.pay_period_start || !formData.pay_period_end || !formData.payment_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Fetch employees
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("*")
        .eq("status", "active");

      if (empError) throw empError;

      if (!employees || employees.length === 0) {
        toast.error("No active employees found");
        return;
      }

      // Fetch tax settings
      const { data: taxSettings, error: taxError } = await supabase
        .from("tax_settings")
        .select("*")
        .order("year", { ascending: false })
        .limit(1)
        .single();

      if (taxError) throw taxError;

      let totalGross = 0;
      let totalNet = 0;

      // Create payroll run
      const { data: payrollRun, error: runError } = await supabase
        .from("payroll_runs")
        .insert([
          {
            run_date: new Date().toISOString().split("T")[0],
            pay_period_start: formData.pay_period_start,
            pay_period_end: formData.pay_period_end,
            payment_date: formData.payment_date,
            status: "draft",
          },
        ])
        .select()
        .single();

      if (runError) throw runError;

      // Calculate payroll items for each employee
      const payrollItems = employees.map((emp) => {
        const grossPay = emp.pay_rate;
        const federalTax = grossPay * (taxSettings.federal_rate || 0);
        const stateTax = grossPay * (taxSettings.state_rate || 0);
        const socialSecurity = grossPay * (taxSettings.social_security_rate || 0);
        const medicare = grossPay * (taxSettings.medicare_rate || 0);
        const netPay = grossPay - federalTax - stateTax - socialSecurity - medicare;

        totalGross += grossPay;
        totalNet += netPay;

        return {
          payroll_run_id: payrollRun.id,
          employee_id: emp.id,
          hours_worked: 80, // Default for bi-weekly
          gross_pay: grossPay,
          federal_tax: federalTax,
          state_tax: stateTax,
          social_security: socialSecurity,
          medicare: medicare,
          net_pay: netPay,
        };
      });

      // Insert payroll items
      const { error: itemsError } = await supabase
        .from("payroll_items")
        .insert(payrollItems);

      if (itemsError) throw itemsError;

      // Update payroll run totals
      const { error: updateError } = await supabase
        .from("payroll_runs")
        .update({
          total_gross: totalGross,
          total_net: totalNet,
        })
        .eq("id", payrollRun.id);

      if (updateError) throw updateError;

      toast.success(`Payroll calculated for ${employees.length} employees`);
      setShowCreateDialog(false);
      setFormData({ pay_period_start: "", pay_period_end: "", payment_date: "" });
      fetchPayrollRuns();
    } catch (error: any) {
      console.error("Error calculating payroll:", error);
      toast.error(error.message || "Failed to calculate payroll");
    }
  };

  const processPayroll = async (id: string) => {
    if (!confirm("Are you sure you want to process this payroll? This will mark it as completed.")) return;

    try {
      const { error } = await supabase
        .from("payroll_runs")
        .update({ status: "processed", processed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast.success("Payroll processed successfully");
      fetchPayrollRuns();
    } catch (error) {
      console.error("Error processing payroll:", error);
      toast.error("Failed to process payroll");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Payroll History</h3>
          <p className="text-sm text-muted-foreground">
            View and manage payroll runs with automatic tax calculations
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Payroll Run
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payroll Run</DialogTitle>
              <DialogDescription>
                Set the pay period and payment date. Taxes will be calculated automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Pay Period Start Date *</Label>
                <Input
                  type="date"
                  value={formData.pay_period_start}
                  onChange={(e) =>
                    setFormData({ ...formData, pay_period_start: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Pay Period End Date *</Label>
                <Input
                  type="date"
                  value={formData.pay_period_end}
                  onChange={(e) =>
                    setFormData({ ...formData, pay_period_end: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Payment Date *</Label>
                <Input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={calculatePayroll}>
                Calculate Payroll
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run Date</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Gross Pay (£)</TableHead>
                <TableHead>Net Pay (£)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRuns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No payroll runs yet
                  </TableCell>
                </TableRow>
              ) : (
                payrollRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>{new Date(run.run_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(run.pay_period_start).toLocaleDateString()} -{" "}
                        {new Date(run.pay_period_end).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(run.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        £{run.total_gross?.toLocaleString() || "0"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        £{run.total_net?.toLocaleString() || "0"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={run.status === "processed" ? "default" : "secondary"}
                      >
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {run.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => processPayroll(run.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};