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
    <Card className="border-primary/20 h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <div className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Compliance Insights
          </CardTitle>
          <Button onClick={onGenerateReport} size="sm" variant="outline" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-4 flex-1 overflow-y-auto">
        <div className="space-y-3">
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
                className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-medium text-sm leading-tight">{insight.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${getConfidenceColor(insight.confidence)} w-fit text-xs`}
                      >
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed break-words">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1.5 h-7 text-xs w-full"
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
        {insights.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-xs font-medium mb-2">AI-Powered Features</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                  <span className="text-xs font-medium">Risk Detection</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Identifies emerging compliance risks
                </p>
              </div>
              
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-3 w-3 text-success" />
                  <span className="text-xs font-medium">Smart Suggestions</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommends remediation actions
                </p>
              </div>
              
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">Trend Analysis</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Analyzes compliance patterns
                </p>
              </div>
              
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">Auto Reports</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generates audit-ready reports
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
