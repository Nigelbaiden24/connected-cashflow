import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const SecurityDashboard = () => {
  const [stats, setStats] = useState({
    totalRisks: 0,
    criticalRisks: 0,
    vaultItems: 0,
    auditLogs: 0,
    complianceScore: 85,
  });

  useEffect(() => {
    fetchSecurityStats();
  }, []);

  const fetchSecurityStats = async () => {
    try {
      const [risksData, vaultData, auditData] = await Promise.all([
        supabase.from("cyber_risk_assessments").select("risk_level", { count: "exact" }),
        supabase.from("secure_vault").select("id", { count: "exact" }),
        supabase.from("audit_logs").select("id", { count: "exact" }),
      ]);

      const criticalCount = risksData.data?.filter((r) => r.risk_level === "critical").length || 0;

      setStats({
        totalRisks: risksData.count || 0,
        criticalRisks: criticalCount,
        vaultItems: vaultData.count || 0,
        auditLogs: auditData.count || 0,
        complianceScore: 85,
      });
    } catch (error) {
      console.error("Error fetching security stats:", error);
    }
  };

  const securityMetrics = [
    {
      title: "Security Score",
      value: "92%",
      change: "+5%",
      status: "good",
      icon: Shield,
      description: "Overall security posture",
    },
    {
      title: "Active Risks",
      value: stats.totalRisks.toString(),
      critical: stats.criticalRisks,
      status: stats.criticalRisks > 0 ? "warning" : "good",
      icon: AlertTriangle,
      description: `${stats.criticalRisks} critical risks`,
    },
    {
      title: "Vault Items",
      value: stats.vaultItems.toString(),
      change: "Encrypted",
      status: "good",
      icon: Lock,
      description: "AES-256 encrypted",
    },
    {
      title: "Audit Events",
      value: stats.auditLogs.toString(),
      change: "24h",
      status: "info",
      icon: Activity,
      description: "Last 24 hours",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-500/10";
      case "warning":
        return "bg-yellow-500/10";
      case "critical":
        return "bg-red-500/10";
      default:
        return "bg-blue-500/10";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {securityMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`p-2 rounded-lg ${getStatusBg(metric.status)}`}>
                <metric.icon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>GDPR & ISO 27001 alignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">GDPR Compliance</span>
                <span className="text-sm text-muted-foreground">90%</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ISO 27001</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Protection</span>
                <span className="text-sm text-muted-foreground">95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Controls</CardTitle>
            <CardDescription>Active protection measures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">End-to-End Encryption</span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Role-Based Access Control</span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Audit Logging</span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Multi-Factor Authentication</span>
              </div>
              <Badge variant="outline">Recommended</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Data Masking</span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest security-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Security scan completed</p>
                <p className="text-xs text-muted-foreground">No vulnerabilities detected</p>
              </div>
              <span className="text-xs text-muted-foreground">2 min ago</span>
            </div>
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New vault item added</p>
                <p className="text-xs text-muted-foreground">API credentials encrypted</p>
              </div>
              <span className="text-xs text-muted-foreground">15 min ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Risk assessment updated</p>
                <p className="text-xs text-muted-foreground">1 new medium risk identified</p>
              </div>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
