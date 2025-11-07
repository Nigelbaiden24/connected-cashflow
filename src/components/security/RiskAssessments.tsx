import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, TrendingUp, TrendingDown, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const RiskAssessments = () => {
  const [risks, setRisks] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRisk, setEditingRisk] = useState<any>(null);
  const [newRisk, setNewRisk] = useState({
    assessment_name: "",
    category: "",
    description: "",
    risk_level: "medium",
    impact_score: 5,
    likelihood_score: 5,
    mitigation_status: "open",
  });

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      const { data, error } = await supabase
        .from("cyber_risk_assessments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRisks(data || []);
    } catch (error) {
      console.error("Error fetching risks:", error);
    }
  };

  const addRisk = async () => {
    if (!newRisk.assessment_name || !newRisk.category) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const { error } = await supabase.from("cyber_risk_assessments").insert(newRisk);

      if (error) throw error;

      toast.success("Risk assessment created");
      resetForm();
      fetchRisks();

      await supabase.from("audit_logs").insert({
        action: "risk_assessment_created",
        resource_type: "cyber_risk_assessments",
        severity: "info",
        details: { name: newRisk.assessment_name, level: newRisk.risk_level },
      });
    } catch (error) {
      console.error("Error adding risk:", error);
      toast.error("Failed to create risk assessment");
    }
  };

  const updateRisk = async () => {
    if (!editingRisk || !newRisk.assessment_name || !newRisk.category) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("cyber_risk_assessments")
        .update(newRisk)
        .eq("id", editingRisk.id);

      if (error) throw error;

      toast.success("Risk assessment updated");
      resetForm();
      fetchRisks();

      await supabase.from("audit_logs").insert({
        action: "risk_assessment_updated",
        resource_type: "cyber_risk_assessments",
        resource_id: editingRisk.id,
        severity: "info",
      });
    } catch (error) {
      console.error("Error updating risk:", error);
      toast.error("Failed to update risk assessment");
    }
  };

  const deleteRisk = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the risk assessment "${name}"?`)) return;

    try {
      const { error } = await supabase.from("cyber_risk_assessments").delete().eq("id", id);

      if (error) throw error;

      toast.success("Risk assessment deleted");
      fetchRisks();

      await supabase.from("audit_logs").insert({
        action: "risk_assessment_deleted",
        resource_type: "cyber_risk_assessments",
        resource_id: id,
        severity: "warning",
        details: { name },
      });
    } catch (error) {
      console.error("Error deleting risk:", error);
      toast.error("Failed to delete risk assessment");
    }
  };

  const openEditDialog = (risk: any) => {
    setEditingRisk(risk);
    setNewRisk({
      assessment_name: risk.assessment_name,
      category: risk.category,
      description: risk.description || "",
      risk_level: risk.risk_level,
      impact_score: risk.impact_score,
      likelihood_score: risk.likelihood_score,
      mitigation_status: risk.mitigation_status || "open",
    });
  };

  const resetForm = () => {
    setShowAddDialog(false);
    setEditingRisk(null);
    setNewRisk({
      assessment_name: "",
      category: "",
      description: "",
      risk_level: "medium",
      impact_score: 5,
      likelihood_score: 5,
      mitigation_status: "open",
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "high":
        return "bg-orange-500/10 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-500/10 text-green-700 border-green-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const riskStats = {
    total: risks.length,
    critical: risks.filter((r) => r.risk_level === "critical").length,
    high: risks.filter((r) => r.risk_level === "high").length,
    medium: risks.filter((r) => r.risk_level === "medium").length,
    low: risks.filter((r) => r.risk_level === "low").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cyber Risk Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Track and manage cybersecurity risks across your organization
          </p>
        </div>
        <Dialog open={showAddDialog || !!editingRisk} onOpenChange={(open) => {
          if (!open) resetForm();
          else setShowAddDialog(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRisk ? "Edit Risk Assessment" : "Create Risk Assessment"}</DialogTitle>
              <DialogDescription>Add a new cybersecurity risk</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Assessment Name *</Label>
                <Input
                  value={newRisk.assessment_name}
                  onChange={(e) =>
                    setNewRisk({ ...newRisk, assessment_name: e.target.value })
                  }
                  placeholder="e.g., Phishing Attack Risk"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select
                  value={newRisk.category}
                  onValueChange={(value) => setNewRisk({ ...newRisk, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data_breach">Data Breach</SelectItem>
                    <SelectItem value="malware">Malware</SelectItem>
                    <SelectItem value="phishing">Phishing</SelectItem>
                    <SelectItem value="ransomware">Ransomware</SelectItem>
                    <SelectItem value="insider_threat">Insider Threat</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newRisk.description}
                  onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                  placeholder="Describe the risk..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Risk Level</Label>
                <Select
                  value={newRisk.risk_level}
                  onValueChange={(value) => setNewRisk({ ...newRisk, risk_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Impact Score (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newRisk.impact_score}
                    onChange={(e) =>
                      setNewRisk({ ...newRisk, impact_score: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Likelihood Score (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newRisk.likelihood_score}
                    onChange={(e) =>
                      setNewRisk({ ...newRisk, likelihood_score: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={editingRisk ? updateRisk : addRisk}>
                {editingRisk ? "Update Assessment" : "Create Assessment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskStats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{riskStats.critical}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{riskStats.high}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{riskStats.medium}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{riskStats.low}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Assessments</CardTitle>
          <CardDescription>Active cybersecurity risks and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Likelihood</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No risk assessments found
                  </TableCell>
                </TableRow>
              ) : (
                risks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell className="font-medium">
                      {risk.assessment_name}
                    </TableCell>
                    <TableCell className="capitalize">
                      {risk.category.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRiskColor(risk.risk_level)}>
                        {risk.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{risk.impact_score}/10</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{risk.likelihood_score}/10</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          risk.mitigation_status === "resolved"
                            ? "bg-green-500/10 text-green-700"
                            : "bg-yellow-500/10 text-yellow-700"
                        }
                      >
                        {risk.mitigation_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(risk)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRisk(risk.id, risk.assessment_name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
