import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, Users, TrendingUp } from "lucide-react";

interface NextAction {
  id: string;
  type: "document" | "case" | "check" | "review";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: string;
}

interface NextActionsCardProps {
  actions: NextAction[];
  onActionClick: (action: NextAction) => void;
}

export function NextActionsCard({ actions, onActionClick }: NextActionsCardProps) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-4 w-4" />;
      case "case":
        return <AlertCircle className="h-4 w-4" />;
      case "check":
        return <TrendingUp className="h-4 w-4" />;
      case "review":
        return <Users className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Next Actions</CardTitle>
          <Badge variant="secondary">{actions.length} pending</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No pending actions. All compliance items are up to date!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="mt-0.5">{getActionIcon(action.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{action.title}</p>
                    <Badge variant={getPriorityColor(action.priority)} className="text-xs">
                      {action.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                  {action.dueDate && (
                    <p className="text-xs text-muted-foreground">Due: {action.dueDate}</p>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => onActionClick(action)}>
                  Review
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
