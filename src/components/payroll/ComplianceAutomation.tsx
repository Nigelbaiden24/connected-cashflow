import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ComplianceDocument {
  id: string;
  employee_id: string;
  document_type: string;
  document_name: string;
  status: string;
  expiry_date: string | null;
  created_at: string;
}

export const ComplianceAutomation = () => {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    document_type: "W-4",
    document_name: "",
    expiry_date: "",
  });

  useEffect(() => {
    fetchDocuments();
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

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("compliance_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load compliance documents");
    }
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.document_type || !formData.document_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase.from("compliance_documents").insert([
        {
          ...formData,
          status: "pending",
          expiry_date: formData.expiry_date || null,
        },
      ]);

      if (error) throw error;
      toast.success("Document uploaded successfully");
      setShowDialog(false);
      resetForm();
      fetchDocuments();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(error.message || "Failed to upload document");
    }
  };

  const updateDocumentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("compliance_documents")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Document marked as ${status}`);
      fetchDocuments();
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document");
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      document_type: "W-4",
      document_name: "",
      expiry_date: "",
    });
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "Unknown";
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getStatusBadge = (doc: ComplianceDocument) => {
    if (isExpired(doc.expiry_date)) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }
    if (isExpiringSoon(doc.expiry_date)) {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Expiring Soon
        </Badge>
      );
    }
    if (doc.status === "approved") {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      );
    }
    return <Badge variant="secondary">{doc.status}</Badge>;
  };

  const getMissingDocuments = () => {
    const requiredDocs = ["W-4", "I-9", "Direct Deposit"];
    const activeEmployees = employees.filter((e) => e.status === "active");
    const missing: any[] = [];

    activeEmployees.forEach((emp) => {
      requiredDocs.forEach((docType) => {
        const hasDoc = documents.some(
          (doc) =>
            doc.employee_id === emp.id &&
            doc.document_type === docType &&
            doc.status === "approved"
        );
        if (!hasDoc) {
          missing.push({
            employee: `${emp.first_name} ${emp.last_name}`,
            document: docType,
          });
        }
      });
    });

    return missing;
  };

  const missingDocs = getMissingDocuments();

  return (
    <div className="space-y-4">
      {missingDocs.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive">
                  Missing Required Documents
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {missingDocs.length} required documents are missing
                </p>
                <div className="mt-2 space-y-1">
                  {missingDocs.slice(0, 5).map((item, idx) => (
                    <p key={idx} className="text-sm">
                      • {item.employee} - {item.document}
                    </p>
                  ))}
                  {missingDocs.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      ...and {missingDocs.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Compliance Documents</h3>
          <p className="text-sm text-muted-foreground">
            Automated tracking of W-4, I-9, and other required forms with expiry alerts
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Compliance Document</DialogTitle>
              <DialogDescription>
                Add required employment and compliance documents
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
                <Label>Document Type *</Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, document_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="W-4">W-4 (Tax Withholding)</SelectItem>
                    <SelectItem value="I-9">I-9 (Employment Eligibility)</SelectItem>
                    <SelectItem value="W-2">W-2 (Wage and Tax Statement)</SelectItem>
                    <SelectItem value="Direct Deposit">Direct Deposit Authorization</SelectItem>
                    <SelectItem value="Handbook">Employee Handbook Acknowledgment</SelectItem>
                    <SelectItem value="NDA">Non-Disclosure Agreement</SelectItem>
                    <SelectItem value="Background Check">Background Check</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Document Name *</Label>
                <Input
                  value={formData.document_name}
                  onChange={(e) =>
                    setFormData({ ...formData, document_name: e.target.value })
                  }
                  placeholder="e.g., 2024-W4-John-Doe.pdf"
                />
              </div>
              <div>
                <Label>Expiry Date (if applicable)</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expiry_date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Upload Document</Button>
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
                <TableHead>Document Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No compliance documents on file
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {getEmployeeName(doc.employee_id)}
                    </TableCell>
                    <TableCell>{doc.document_type}</TableCell>
                    <TableCell className="text-sm">{doc.document_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {doc.expiry_date
                        ? new Date(doc.expiry_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(doc)}</TableCell>
                    <TableCell>
                      {doc.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => updateDocumentStatus(doc.id, "approved")}
                        >
                          Approve
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