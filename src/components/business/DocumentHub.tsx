import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      case 'approved': return <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/20 bg-emerald-500/10">Approved</Badge>;
      case 'pending_approval': return <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/20 bg-amber-500/10">Pending</Badge>;
      case 'rejected': return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
      default: return <Badge variant="outline" className="text-xs">Uploaded</Badge>;
    }
  };

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending_approval').length,
    needsSignature: documents.filter(d => d.requires_signature).length
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FileText className="h-4 w-4 text-primary" />
          Document Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 rounded-lg border border-border bg-muted/20">
            <div className="text-xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
            <div className="text-xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center p-2.5 rounded-lg border border-primary/20 bg-primary/5">
            <div className="text-xl font-bold text-primary">{stats.needsSignature}</div>
            <div className="text-xs text-muted-foreground">Signature</div>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
            <p className="text-sm text-muted-foreground">No documents yet</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/10 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.document_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {getStatusBadge(doc.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
