import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, XCircle, FileText, Download, Plus, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AVAILABLE_FRAMEWORKS = ["GDPR", "ISO 27001", "SOC 2", "HIPAA", "PCI DSS", "NIST"];

export const ComplianceCenter = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [newPolicy, setNewPolicy] = useState({
    policy_name: "",
    policy_type: "data_protection",
    description: "",
    status: "active",
    compliance_frameworks: [] as string[],
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from("security_policies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  const addPolicy = async () => {
    if (!newPolicy.policy_name) {
      toast.error("Please enter a policy name");
      return;
    }

    try {
      const { error } = await supabase.from("security_policies").insert([newPolicy]);

      if (error) throw error;

      toast.success("Policy created successfully");
      setShowAddDialog(false);
      setNewPolicy({
        policy_name: "",
        policy_type: "data_protection",
        description: "",
        status: "active",
        compliance_frameworks: [],
      });
      fetchPolicies();

      await supabase.from("audit_logs").insert({
        action: "policy_created",
        resource_type: "security_policies",
        severity: "info",
        details: { policy_name: newPolicy.policy_name },
      });
    } catch (error: any) {
      console.error("Error adding policy:", error);
      toast.error(error.message || "Failed to create policy");
    }
  };

  const updatePolicy = async () => {
    if (!editingPolicy || !newPolicy.policy_name) {
      toast.error("Please enter a policy name");
      return;
    }

    try {
      const { error } = await supabase
        .from("security_policies")
        .update({
          policy_name: newPolicy.policy_name,
          policy_type: newPolicy.policy_type,
          description: newPolicy.description,
          status: newPolicy.status,
          compliance_frameworks: newPolicy.compliance_frameworks,
        })
        .eq("id", editingPolicy.id);

      if (error) throw error;

      toast.success("Policy updated successfully");
      setEditingPolicy(null);
      setNewPolicy({
        policy_name: "",
        policy_type: "data_protection",
        description: "",
        status: "active",
        compliance_frameworks: [],
      });
      fetchPolicies();

      await supabase.from("audit_logs").insert({
        action: "policy_updated",
        resource_type: "security_policies",
        resource_id: editingPolicy.id,
        severity: "info",
      });
    } catch (error: any) {
      console.error("Error updating policy:", error);
      toast.error(error.message || "Failed to update policy");
    }
  };

  const deletePolicy = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the policy "${name}"?`)) return;

    try {
      const { error } = await supabase.from("security_policies").delete().eq("id", id);

      if (error) throw error;

      toast.success("Policy deleted successfully");
      fetchPolicies();

      await supabase.from("audit_logs").insert({
        action: "policy_deleted",
        resource_type: "security_policies",
        resource_id: id,
        severity: "warning",
        details: { policy_name: name },
      });
    } catch (error) {
      console.error("Error deleting policy:", error);
      toast.error("Failed to delete policy");
    }
  };

  const openEditDialog = (policy: any) => {
    setEditingPolicy(policy);
    setNewPolicy({
      policy_name: policy.policy_name,
      policy_type: policy.policy_type,
      description: policy.description || "",
      status: policy.status,
      compliance_frameworks: policy.compliance_frameworks || [],
    });
  };

  const toggleFramework = (framework: string) => {
    setNewPolicy((prev) => ({
      ...prev,
      compliance_frameworks: prev.compliance_frameworks.includes(framework)
        ? prev.compliance_frameworks.filter((f) => f !== framework)
        : [...prev.compliance_frameworks, framework],
    }));
  };

  const complianceFrameworks = [
    {
      name: "GDPR",
      fullName: "General Data Protection Regulation",
      score: 90,
      status: "compliant",
      requirements: 28,
      met: 25,
    },
    {
      name: "ISO 27001",
      fullName: "Information Security Management",
      score: 85,
      status: "compliant",
      requirements: 114,
      met: 97,
    },
    {
      name: "SOC 2",
      fullName: "Service Organization Control 2",
      score: 78,
      status: "in_progress",
      requirements: 64,
      met: 50,
    },
    {
      name: "HIPAA",
      fullName: "Health Insurance Portability",
      score: 92,
      status: "compliant",
      requirements: 45,
      met: 41,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "non_compliant":
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Center</h2>
          <p className="text-sm text-muted-foreground">
            GDPR & ISO 27001 aligned policies and frameworks
          </p>
        </div>
        <Dialog 
          open={showAddDialog || !!editingPolicy} 
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) {
              setEditingPolicy(null);
              setNewPolicy({
                policy_name: "",
                policy_type: "data_protection",
                description: "",
                status: "active",
                compliance_frameworks: [],
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPolicy ? "Edit Policy" : "Create Security Policy"}</DialogTitle>
              <DialogDescription>
                Define a new security policy with compliance frameworks
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Policy Name *</Label>
                <Input
                  value={newPolicy.policy_name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, policy_name: e.target.value })}
                  placeholder="e.g., Data Encryption Standard"
                />
              </div>
              <div>
                <Label>Policy Type</Label>
                <Select
                  value={newPolicy.policy_type}
                  onValueChange={(value) => setNewPolicy({ ...newPolicy, policy_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data_protection">Data Protection</SelectItem>
                    <SelectItem value="access_control">Access Control</SelectItem>
                    <SelectItem value="incident_response">Incident Response</SelectItem>
                    <SelectItem value="business_continuity">Business Continuity</SelectItem>
                    <SelectItem value="risk_management">Risk Management</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  placeholder="Describe the policy requirements and scope..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={newPolicy.status}
                  onValueChange={(value) => setNewPolicy({ ...newPolicy, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Compliance Frameworks</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {AVAILABLE_FRAMEWORKS.map((framework) => (
                    <div key={framework} className="flex items-center gap-2">
                      <Checkbox
                        checked={newPolicy.compliance_frameworks.includes(framework)}
                        onCheckedChange={() => toggleFramework(framework)}
                      />
                      <Label className="text-sm cursor-pointer">{framework}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={editingPolicy ? updatePolicy : addPolicy}>
                {editingPolicy ? "Update Policy" : "Create Policy"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {complianceFrameworks.map((framework) => (
          <Card key={framework.name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{framework.name}</CardTitle>
                  <CardDescription>{framework.fullName}</CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={getStatusColor(framework.status)}
                >
                  {framework.status === "compliant" ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Compliant
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      In Progress
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Compliance Score</span>
                  <span className="font-bold">{framework.score}%</span>
                </div>
                <Progress value={framework.score} className="h-2" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Requirements Met</span>
                <span className="font-medium">
                  {framework.met} / {framework.requirements}
                </span>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Policies ({policies.length})</CardTitle>
          <CardDescription>Active security and compliance policies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Frameworks</TableHead>
                <TableHead>Last Reviewed</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No policies configured</p>
                    <p className="text-sm text-muted-foreground">
                      Add your first security policy to get started
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.policy_name}</TableCell>
                    <TableCell className="capitalize">
                      {policy.policy_type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          policy.status === "active"
                            ? "bg-green-500/10 text-green-700"
                            : policy.status === "draft"
                            ? "bg-gray-500/10 text-gray-700"
                            : "bg-yellow-500/10 text-yellow-700"
                        }
                      >
                        {policy.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(policy.compliance_frameworks || []).slice(0, 2).map((fw: string) => (
                          <Badge key={fw} variant="secondary" className="text-xs">
                            {fw}
                          </Badge>
                        ))}
                        {(policy.compliance_frameworks || []).length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(policy.compliance_frameworks || []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {policy.last_reviewed
                        ? new Date(policy.last_reviewed).toLocaleDateString()
                        : "Not reviewed"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(policy)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePolicy(policy.id, policy.policy_name)}
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
