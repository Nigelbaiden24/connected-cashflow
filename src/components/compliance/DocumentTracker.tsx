import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, AlertCircle, CheckCircle, Clock, Upload } from "lucide-react";

interface ComplianceDocument {
  id: string;
  client_name: string;
  document_type: string;
  document_name: string;
  status: string;
  expiry_date?: string;
  signed_date?: string;
  days_until_expiry?: number;
}

interface DocumentTrackerProps {
  documents: ComplianceDocument[];
  onUploadDocument: () => void;
  onViewDocument: (docId: string) => void;
}

export function DocumentTracker({
  documents,
  onUploadDocument,
  onViewDocument,
}: DocumentTrackerProps) {
  const getStatusIcon = (status: string, daysUntilExpiry?: number) => {
    if (status === "expired" || (daysUntilExpiry !== undefined && daysUntilExpiry < 0)) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (status === "approved") {
      return <CheckCircle className="h-4 w-4 text-success" />;
    }
    if (daysUntilExpiry !== undefined && daysUntilExpiry <= 30) {
      return <Clock className="h-4 w-4 text-warning" />;
    }
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusColor = (status: string, daysUntilExpiry?: number) => {
    if (status === "expired" || (daysUntilExpiry !== undefined && daysUntilExpiry < 0)) {
      return "destructive";
    }
    if (status === "approved") {
      return "default";
    }
    if (status === "pending") {
      return "secondary";
    }
    if (daysUntilExpiry !== undefined && daysUntilExpiry <= 30) {
      return "outline";
    }
    return "secondary";
  };

  const calculateDocumentStats = () => {
    const total = documents.length;
    const approved = documents.filter(d => d.status === "approved").length;
    const pending = documents.filter(d => d.status === "pending").length;
    const expiring = documents.filter(d => d.days_until_expiry !== undefined && d.days_until_expiry <= 30 && d.days_until_expiry >= 0).length;
    const expired = documents.filter(d => d.status === "expired" || (d.days_until_expiry !== undefined && d.days_until_expiry < 0)).length;
    
    return { total, approved, pending, expiring, expired };
  };

  const stats = calculateDocumentStats();
  const completionRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Document Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Document Compliance</CardTitle>
            <Button onClick={onUploadDocument} size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Document Completion</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.approved}</div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{stats.pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{stats.expiring}</div>
              <div className="text-xs text-muted-foreground">Expiring Soon</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
              <div className="text-xs text-muted-foreground">Expired</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onViewDocument(doc.id)}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(doc.status, doc.days_until_expiry)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{doc.document_name}</span>
                      <Badge variant={getStatusColor(doc.status, doc.days_until_expiry)} className="text-xs">
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {doc.client_name} • {doc.document_type.replace("_", " ")}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {doc.expiry_date && (
                    <div className="text-xs">
                      <div className="text-muted-foreground">Expires</div>
                      <div className={doc.days_until_expiry !== undefined && doc.days_until_expiry <= 30 ? "text-warning font-medium" : ""}>
                        {new Date(doc.expiry_date).toLocaleDateString()}
                      </div>
                      {doc.days_until_expiry !== undefined && doc.days_until_expiry >= 0 && doc.days_until_expiry <= 30 && (
                        <div className="text-xs text-warning">
                          ({doc.days_until_expiry} days)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
