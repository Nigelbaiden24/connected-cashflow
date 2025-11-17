import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, FileText, Lightbulb } from "lucide-react";

interface AIInsight {
  id: string;
  type: "risk" | "trend" | "suggestion" | "alert";
  title: string;
  description: string;
  confidence: number;
  action?: string;
}

interface AIInsightsPanelProps {
  insights: AIInsight[];
  onGenerateReport: () => void;
  onApplyInsight: (insightId: string) => void;
}

export function AIInsightsPanel({
  insights,
  onGenerateReport,
  onApplyInsight,
}: AIInsightsPanelProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case "risk":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "trend":
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case "suggestion":
        return <Lightbulb className="h-4 w-4 text-success" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-success";
    if (confidence >= 70) return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Compliance Insights
          </CardTitle>
          <Button onClick={onGenerateReport} size="sm" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No AI insights available yet.</p>
              <p className="text-sm">Run compliance checks to generate insights.</p>
            </div>
          ) : (
            insights.map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant="outline" className={getConfidenceColor(insight.confidence)}>
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    {insight.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => onApplyInsight(insight.id)}
                      >
                        {insight.action}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Features Summary */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium mb-3">AI-Powered Features</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Risk Detection</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Identifies emerging compliance risks
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Smart Suggestions</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommends remediation actions
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Trend Analysis</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Analyzes compliance patterns
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Auto Reports</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Generates audit-ready reports
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
