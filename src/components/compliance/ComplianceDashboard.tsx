import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

interface ComplianceDashboardProps {
  overallScore: number;
  trend: "up" | "down" | "stable";
  totalRules: number;
  passedChecks: number;
  failedChecks: number;
  pendingCases: number;
  expiringDocs: number;
}

export function ComplianceDashboard({
  overallScore,
  trend,
  totalRules,
  passedChecks,
  failedChecks,
  pendingCases,
  expiringDocs,
}: ComplianceDashboardProps) {
  const getStatusColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getStatusText = (score: number) => {
    if (score >= 90) return "Healthy";
    if (score >= 70) return "Needs Attention";
    return "Critical";
  };

  return (
    <div className="space-y-4">
      {/* Global Compliance Score */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">Overall Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4">
                <span className={`text-6xl font-bold ${getStatusColor(overallScore)}`}>
                  {overallScore}%
                </span>
                <div className="flex flex-col">
                  <Badge variant={overallScore >= 90 ? "default" : overallScore >= 70 ? "secondary" : "destructive"}>
                    {getStatusText(overallScore)}
                  </Badge>
                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    {trend === "up" && <TrendingUp className="h-4 w-4 text-success" />}
                    {trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
                    <span>{trend === "up" ? "+2.3%" : trend === "down" ? "-1.5%" : "No change"} from last month</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 mx-auto text-success mb-2" />
                    <div className="text-2xl font-bold">{passedChecks}</div>
                    <div className="text-xs text-muted-foreground">Passed Checks</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto text-destructive mb-2" />
                    <div className="text-2xl font-bold">{failedChecks}</div>
                    <div className="text-xs text-muted-foreground">Failed Checks</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRules}</div>
            <p className="text-xs text-muted-foreground mt-1">Monitoring compliance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingCases}</div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{expiringDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">Documents in 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {totalRules > 0 ? Math.round((passedChecks / (passedChecks + failedChecks)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
