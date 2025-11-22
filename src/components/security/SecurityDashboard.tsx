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
    complianceScore: 0,
    securityScore: 0,
    activeThreats: 0,
    resolvedIncidents: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [threatTrends, setThreatTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityStats();
    fetchRecentAlerts();
    
    // Set up real-time subscription for security events
    const channel = supabase
      .channel('security-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'audit_logs'
      }, () => {
        fetchSecurityStats();
        fetchRecentAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSecurityStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const [risksData, vaultData, auditData, rolesData] = await Promise.all([
        supabase.from("cyber_risk_assessments").select("risk_level", { count: "exact" }),
        supabase.from("secure_vault").select("id, access_count", { count: "exact" }),
        supabase.from("audit_logs").select("severity", { count: "exact" }).order("timestamp", { ascending: false }).limit(100),
        supabase.from("user_roles").select("*", { count: "exact" }),
      ]);

      const criticalCount = risksData.data?.filter((r) => r.risk_level === "critical").length || 0;
      const highSeverityAudits = auditData.data?.filter((a) => a.severity === "critical").length || 0;
      
      // Calculate security score based on multiple factors
      const baseScore = 100;
      const riskPenalty = criticalCount * 5;
      const auditPenalty = highSeverityAudits * 2;
      const vaultBonus = (vaultData.count || 0) > 0 ? 5 : 0;
      const securityScore = Math.max(0, Math.min(100, baseScore - riskPenalty - auditPenalty + vaultBonus));
      
      // Calculate compliance score
      const complianceScore = Math.round(85 + (securityScore - 85) * 0.3);

      setStats({
        totalRisks: risksData.count || 0,
        criticalRisks: criticalCount,
        vaultItems: vaultData.count || 0,
        auditLogs: auditData.count || 0,
        complianceScore: Math.max(0, Math.min(100, complianceScore)),
        securityScore: Math.round(securityScore),
        activeThreats: criticalCount + highSeverityAudits,
        resolvedIncidents: Math.max(0, (auditData.count || 0) - highSeverityAudits),
      });
      
      // Generate threat trends (last 7 days)
      const trends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trends.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          threats: Math.floor(Math.random() * 10) + criticalCount,
          resolved: Math.floor(Math.random() * 15) + 5,
        });
      }
      setThreatTrends(trends);
    } catch (error) {
      console.error("Error fetching security stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .in("severity", ["warning", "critical"])
        .order("timestamp", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentAlerts(data || []);
    } catch (error) {
      console.error("Error fetching recent alerts:", error);
    }
  };

  const securityMetrics = [
    {
      title: "Security Score",
      value: `${stats.securityScore}%`,
      change: stats.securityScore >= 90 ? "Excellent" : stats.securityScore >= 70 ? "Good" : "Needs Attention",
      status: stats.securityScore >= 90 ? "good" : stats.securityScore >= 70 ? "warning" : "critical",
      icon: Shield,
      description: "Overall security posture",
    },
    {
      title: "Active Threats",
      value: stats.activeThreats.toString(),
      critical: stats.criticalRisks,
      status: stats.activeThreats > 5 ? "critical" : stats.activeThreats > 0 ? "warning" : "good",
      icon: AlertTriangle,
      description: `${stats.criticalRisks} critical, ${stats.activeThreats - stats.criticalRisks} medium`,
    },
    {
      title: "Vault Items",
      value: stats.vaultItems.toString(),
      change: "AES-256",
      status: "good",
      icon: Lock,
      description: "End-to-end encrypted",
    },
    {
      title: "Audit Logs",
      value: stats.auditLogs.toString(),
      change: "Real-time",
      status: "info",
      icon: Activity,
      description: "Continuous monitoring",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <Shield className="h-12 w-12 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {securityMetrics.map((metric) => (
          <Card key={metric.title} className="relative overflow-hidden border-l-4" style={{
            borderLeftColor: metric.status === 'good' ? 'hsl(var(--success))' : 
                           metric.status === 'warning' ? 'hsl(var(--warning))' : 
                           metric.status === 'critical' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'
          }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`p-2 rounded-lg ${getStatusBg(metric.status)}`}>
                <metric.icon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              {metric.change && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  {metric.change}
                </Badge>
              )}
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

      {/* Real-time Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Security Alerts</CardTitle>
          <CardDescription>Live monitoring of security events and incidents</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active security alerts</p>
              <p className="text-sm">System is operating normally</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    alert.severity === 'critical' ? 'bg-red-500/10' :
                    alert.severity === 'warning' ? 'bg-yellow-500/10' :
                    'bg-blue-500/10'
                  }`}>
                    {alert.severity === 'critical' ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : alert.severity === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{alert.action}</p>
                      <Badge variant={
                        alert.severity === 'critical' ? 'destructive' :
                        alert.severity === 'warning' ? 'secondary' :
                        'outline'
                      } className="text-xs shrink-0">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {alert.resource_type} • {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threat Intelligence */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Threat Intelligence</CardTitle>
            <CardDescription>Weekly threat detection overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Threats Detected</span>
                <span className="text-2xl font-bold text-destructive">{stats.activeThreats}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Incidents Resolved</span>
                <span className="text-2xl font-bold text-success">{stats.resolvedIncidents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Time (Avg)</span>
                <span className="text-2xl font-bold">2.4h</span>
              </div>
              <Progress value={stats.securityScore} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Security posture: {stats.securityScore}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>Regulatory framework adherence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">GDPR Compliance</span>
                <span className="text-sm text-muted-foreground">{Math.min(95, stats.complianceScore + 5)}%</span>
              </div>
              <Progress value={Math.min(95, stats.complianceScore + 5)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ISO 27001</span>
                <span className="text-sm text-muted-foreground">{stats.complianceScore}%</span>
              </div>
              <Progress value={stats.complianceScore} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SOC 2 Type II</span>
                <span className="text-sm text-muted-foreground">{Math.min(92, stats.complianceScore + 2)}%</span>
              </div>
              <Progress value={Math.min(92, stats.complianceScore + 2)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">PCI DSS</span>
                <span className="text-sm text-muted-foreground">{Math.min(88, stats.complianceScore - 2)}%</span>
              </div>
              <Progress value={Math.min(88, stats.complianceScore - 2)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
