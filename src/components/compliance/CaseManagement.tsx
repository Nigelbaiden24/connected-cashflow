import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  MessageSquare, 
  User, 
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface ComplianceCase {
  id: string;
  case_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to?: string;
  client_name?: string;
  created_at: string;
  ai_suggestions?: any;
}

interface CaseComment {
  id: string;
  comment: string;
  created_at: string;
  user_name: string;
}

interface CaseManagementProps {
  cases: ComplianceCase[];
  onViewCase: (caseId: string) => void;
  onUpdateStatus: (caseId: string, status: string) => void;
  onAddComment: (caseId: string, comment: string) => void;
}

export function CaseManagement({
  cases,
  onViewCase,
  onUpdateStatus,
  onAddComment,
}: CaseManagementProps) {
  const [selectedCase, setSelectedCase] = useState<ComplianceCase | null>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<CaseComment[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive";
      case "under_review":
        return "default";
      case "resolved":
        return "secondary";
      case "closed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleOpenCase = (caseItem: ComplianceCase) => {
    setSelectedCase(caseItem);
    onViewCase(caseItem.id);
    // In real implementation, fetch comments here
  };

  const handleAddComment = () => {
    if (!selectedCase || !newComment.trim()) return;
    onAddComment(selectedCase.id, newComment);
    setNewComment("");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Compliance Cases</CardTitle>
            <Badge variant="secondary">{cases.length} active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleOpenCase(caseItem)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        #{caseItem.case_number}
                      </span>
                      <Badge variant={getStatusColor(caseItem.status)}>
                        {caseItem.status.replace("_", " ")}
                      </Badge>
                      <Badge variant={getPriorityColor(caseItem.priority)}>
                        {caseItem.priority}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium">{caseItem.title}</h4>
                    <p className="text-sm text-muted-foreground">{caseItem.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {caseItem.client_name && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {caseItem.client_name}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(caseItem.created_at).toLocaleDateString()}
                      </div>
                      {caseItem.ai_suggestions && (
                        <div className="flex items-center gap-1 text-primary">
                          <Sparkles className="h-3 w-3" />
                          AI Suggestions Available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Case Detail Dialog */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Case #{selectedCase?.case_number}</DialogTitle>
          </DialogHeader>
          
          {selectedCase && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">{selectedCase.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedCase.description}</p>
              </div>

              {selectedCase.ai_suggestions && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Remediation Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {Array.isArray(selectedCase.ai_suggestions) &&
                        selectedCase.ai_suggestions.map((suggestion: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                </h4>
                <div className="space-y-3 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-sm font-medium">{comment.user_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button onClick={handleAddComment}>Post</Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onUpdateStatus(selectedCase.id, "under_review")}
                >
                  Mark Under Review
                </Button>
                <Button
                  variant="default"
                  onClick={() => onUpdateStatus(selectedCase.id, "resolved")}
                >
                  Mark Resolved
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
