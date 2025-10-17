import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Benefit {
  id: string;
  employee_id: string;
  benefit_type: string;
  provider: string;
  plan_name: string;
  employee_contribution: number;
  employer_contribution: number;
  coverage_start_date: string;
  status: string;
}

export const BenefitsManagement = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    benefit_type: "health_insurance",
    provider: "",
    plan_name: "",
    employee_contribution: "",
    employer_contribution: "",
    coverage_start_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchBenefits();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, employee_id")
        .eq("status", "active");

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchBenefits = async () => {
    try {
      const { data, error } = await supabase
        .from("benefits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBenefits(data || []);
    } catch (error) {
      console.error("Error fetching benefits:", error);
      toast.error("Failed to load benefits");
    }
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.benefit_type || !formData.provider) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        ...formData,
        employee_contribution: parseFloat(formData.employee_contribution) || 0,
        employer_contribution: parseFloat(formData.employer_contribution) || 0,
        status: "active",
      };

      const { error } = await supabase.from("benefits").insert([payload]);

      if (error) throw error;
      toast.success("Benefit added successfully");
      setShowDialog(false);
      resetForm();
      fetchBenefits();
    } catch (error: any) {
      console.error("Error adding benefit:", error);
      toast.error(error.message || "Failed to add benefit");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this benefit?")) return;

    try {
      const { error } = await supabase.from("benefits").delete().eq("id", id);

      if (error) throw error;
      toast.success("Benefit deleted successfully");
      fetchBenefits();
    } catch (error) {
      console.error("Error deleting benefit:", error);
      toast.error("Failed to delete benefit");
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      benefit_type: "health_insurance",
      provider: "",
      plan_name: "",
      employee_contribution: "",
      employer_contribution: "",
      coverage_start_date: new Date().toISOString().split("T")[0],
    });
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Benefits Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage employee benefits including health insurance, 401(k), and other perks
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Benefit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Employee Benefit</DialogTitle>
              <DialogDescription>
                Assign benefits to employees and configure contribution amounts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Employee *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employee_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Benefit Type *</Label>
                <Select
                  value={formData.benefit_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, benefit_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health_insurance">Health Insurance</SelectItem>
                    <SelectItem value="dental_insurance">Dental Insurance</SelectItem>
                    <SelectItem value="vision_insurance">Vision Insurance</SelectItem>
                    <SelectItem value="401k">401(k)</SelectItem>
                    <SelectItem value="life_insurance">Life Insurance</SelectItem>
                    <SelectItem value="disability">Disability Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Provider *</Label>
                <Input
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g., Blue Cross Blue Shield"
                />
              </div>
              <div>
                <Label>Plan Name</Label>
                <Input
                  value={formData.plan_name}
                  onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                  placeholder="e.g., Premium PPO"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employee Contribution ($/month)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.employee_contribution}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_contribution: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Employer Contribution ($/month)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.employer_contribution}
                    onChange={(e) =>
                      setFormData({ ...formData, employer_contribution: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Coverage Start Date *</Label>
                <Input
                  type="date"
                  value={formData.coverage_start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, coverage_start_date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add Benefit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Benefit Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Employee Cost</TableHead>
                <TableHead>Employer Cost</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benefits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No benefits configured yet
                  </TableCell>
                </TableRow>
              ) : (
                benefits.map((benefit) => (
                  <TableRow key={benefit.id}>
                    <TableCell className="font-medium">
                      {getEmployeeName(benefit.employee_id)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {benefit.benefit_type.replace("_", " ")}
                    </TableCell>
                    <TableCell>{benefit.provider}</TableCell>
                    <TableCell>{benefit.plan_name || "-"}</TableCell>
                    <TableCell>${benefit.employee_contribution.toFixed(2)}</TableCell>
                    <TableCell>${benefit.employer_contribution.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(benefit.coverage_start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={benefit.status === "active" ? "default" : "secondary"}>
                        {benefit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(benefit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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