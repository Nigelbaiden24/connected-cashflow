import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  id: string;
  document_name: string;
  status: string;
  requires_signature: boolean;
  created_at: string;
}

export function DocumentHub() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from('business_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending_approval':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Uploaded</Badge>;
    }
  };

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending_approval').length,
    needsSignature: documents.filter(d => d.requires_signature).length
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Hub
        </CardTitle>
        <CardDescription>Recent uploads and document status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Documents</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending Approval</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50">
            <div className="text-2xl font-bold text-blue-600">{stats.needsSignature}</div>
            <div className="text-xs text-muted-foreground">Needs Signature</div>
          </div>
        </div>

        {/* Document List */}
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.document_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {doc.requires_signature && (
                    <Badge variant="outline" className="text-xs">Signature Required</Badge>
                  )}
                  {getStatusBadge(doc.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
