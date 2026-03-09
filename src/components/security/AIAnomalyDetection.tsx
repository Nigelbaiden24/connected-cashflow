import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Scan,
  Clock,
  User,
  Wifi,
  Zap,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

interface Anomaly {
  id?: string;
  user_email: string;
  anomaly_type: string;
  severity: string;
  title: string;
  description: string;
  recommendation?: string;
  details?: any;
  status?: string;
  detected_at?: string;
  scan_id?: string;
}

interface ScanResult {
  scan_id: string;
  anomalies: Anomaly[];
  summary: string;
  risk_score: number;
  logs_analyzed: number;
  users_analyzed: number;
}

export const AIAnomalyDetection = () => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [latestScan, setLatestScan] = useState<ScanResult | null>(null);
  const [historicalAnomalies, setHistoricalAnomalies] = useState<any[]>([]);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalAnomalies();
  }, []);

  const fetchHistoricalAnomalies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("security_anomalies")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setHistoricalAnomalies(data || []);
    } catch (error: any) {
      console.error("Error fetching anomalies:", error);
    } finally {
      setLoading(false);
    }
  };

  const runScan = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("security-anomaly-detection");

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setLatestScan(data as ScanResult);
      toast({ title: "AI Scan Complete", description: `Found ${data.anomalies?.length || 0} anomalies across ${data.logs_analyzed} logs` });
      await fetchHistoricalAnomalies();
    } catch (error: any) {
      toast({ title: "Scan Failed", description: error.message, variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const updateAnomalyStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("security_anomalies")
        .update({
          status,
          ...(status === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
        })
        .eq("id", id);

      if (error) throw error;
      toast({ title: `Anomaly ${status}` });
      await fetchHistoricalAnomalies();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
      case "low": return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case "high": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium": return <Shield className="h-4 w-4 text-yellow-500" />;
      case "low": return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "unusual_login": return <Clock className="h-4 w-4" />;
      case "rapid_actions": return <Zap className="h-4 w-4" />;
      case "multi_ip": return <Wifi className="h-4 w-4" />;
      case "privilege_escalation": return <ShieldAlert className="h-4 w-4" />;
      case "bulk_access": return <Eye className="h-4 w-4" />;
      case "auth_failure": return <XCircle className="h-4 w-4" />;
      case "scope_violation": return <AlertTriangle className="h-4 w-4" />;
      case "geo_anomaly": return <Wifi className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      unusual_login: "Unusual Login",
      rapid_actions: "Rapid Actions",
      multi_ip: "Multiple IPs",
      privilege_escalation: "Privilege Escalation",
      bulk_access: "Bulk Access",
      auth_failure: "Auth Failure",
      scope_violation: "Scope Violation",
      geo_anomaly: "Geo Anomaly",
      general_observation: "General",
    };
    return labels[type] || type;
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return "text-red-500";
    if (score >= 50) return "text-orange-500";
    if (score >= 25) return "text-yellow-500";
    return "text-green-500";
  };

  const filteredAnomalies = historicalAnomalies.filter(a => {
    if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  // Stats
  const openCount = historicalAnomalies.filter(a => a.status === "open").length;
  const criticalCount = historicalAnomalies.filter(a => a.severity === "critical" && a.status === "open").length;
  const resolvedCount = historicalAnomalies.filter(a => a.status === "resolved").length;

  return (
    <div className="space-y-6">
      {/* Header & Scan Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Anomaly Detection</h2>
            <p className="text-sm text-muted-foreground">AI-powered analysis of user activity patterns</p>
          </div>
        </div>
        <Button onClick={runScan} disabled={scanning} className="gap-2">
          {scanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Scan className="h-4 w-4" />
              Run AI Scan
            </>
          )}
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Anomalies</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCount}</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedCount}</div>
            <p className="text-xs text-muted-foreground">Issues addressed</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(latestScan?.risk_score ?? 0)}`}>
              {latestScan?.risk_score ?? "—"}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {latestScan ? `${latestScan.logs_analyzed} logs analyzed` : "Run a scan to calculate"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Scan Summary */}
      {latestScan && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Latest Scan Results
            </CardTitle>
            <CardDescription>
              Analyzed {latestScan.logs_analyzed} audit logs across {latestScan.users_analyzed} users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">{latestScan.summary}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Risk Score:</span>
                <Progress value={latestScan.risk_score} className="w-32 h-2" />
                <span className={`text-sm font-bold ${getRiskColor(latestScan.risk_score)}`}>
                  {latestScan.risk_score}/100
                </span>
              </div>
              <Badge variant="outline">{latestScan.anomalies.length} anomalies detected</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchHistoricalAnomalies} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-muted-foreground">Loading anomalies...</p>
            </CardContent>
          </Card>
        ) : filteredAnomalies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
              <p className="font-medium">No anomalies found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {historicalAnomalies.length === 0
                  ? "Run an AI scan to detect suspicious patterns"
                  : "All anomalies have been filtered out"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAnomalies.map((anomaly) => (
            <Card key={anomaly.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getSeverityIcon(anomaly.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium text-sm">{anomaly.title}</h4>
                      <Badge className={`text-xs ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs gap-1">
                        {getTypeIcon(anomaly.anomaly_type)}
                        {getTypeLabel(anomaly.anomaly_type)}
                      </Badge>
                      <Badge variant={anomaly.status === "open" ? "destructive" : anomaly.status === "resolved" ? "secondary" : "outline"} className="text-xs">
                        {anomaly.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {anomaly.user_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(anomaly.detected_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {anomaly.status === "open" && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAnomalyStatus(anomaly.id, "investigating")}
                        className="text-xs"
                      >
                        Investigate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAnomalyStatus(anomaly.id, "resolved")}
                        className="text-xs"
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateAnomalyStatus(anomaly.id, "dismissed")}
                        className="text-xs text-muted-foreground"
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                  {anomaly.status === "investigating" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAnomalyStatus(anomaly.id, "resolved")}
                      className="text-xs"
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
