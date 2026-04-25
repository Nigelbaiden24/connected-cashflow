import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { saveScrapeResult } from "@/hooks/useScrapeAutoSave";
import {
  Radar,
  Zap,
  Play,
  Pause,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
  Globe,
  Activity,
  BarChart3,
  Sparkles,
  Database,
  ArrowRight,
  Shield,
} from "lucide-react";

interface ScanTarget {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  enabled: boolean;
  lastScan?: string;
  lastCount?: number;
  status?: "idle" | "scanning" | "complete" | "error";
}

interface ScanResult {
  category: string;
  timestamp: string;
  opportunitiesFound: number;
  status: "success" | "error";
  error?: string;
  highlights?: string[];
}

const DEFAULT_TARGETS: ScanTarget[] = [
  {
    id: "crowdfunding",
    label: "Crowdfunding Platforms",
    icon: DollarSign,
    description: "Seedrs, Crowdcube, Republic, WeFunder — live equity & reward campaigns",
    enabled: true,
  },
  {
    id: "startup_funding",
    label: "Startup Funding News",
    icon: TrendingUp,
    description: "TechCrunch, Crunchbase, Sifted, PitchBook — latest rounds & deals",
    enabled: true,
  },
  {
    id: "property_opportunities",
    label: "Property Opportunities",
    icon: Building2,
    description: "Auctions, off-plan, distressed assets, student housing, co-living",
    enabled: true,
  },
  {
    id: "infrastructure",
    label: "Infrastructure Projects",
    icon: MapPin,
    description: "Renewables, data centres, transport, green hydrogen, utilities",
    enabled: true,
  },
  {
    id: "businesses",
    label: "Business M&A Intelligence",
    icon: Briefcase,
    description: "Acquisition targets, funding rounds, franchises, SME listings",
    enabled: false,
  },
  {
    id: "blockchain",
    label: "Blockchain & Web3",
    icon: Zap,
    description: "DeFi, RWA tokenisation, Layer 2, blockchain gaming, DAOs",
    enabled: false,
  },
];

export function AIAutoScanner() {
  const [targets, setTargets] = useState<ScanTarget[]>(DEFAULT_TARGETS);
  const [isAutoScanActive, setIsAutoScanActive] = useState(false);
  const [scanInterval, setScanInterval] = useState("6"); // hours
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [currentScanTarget, setCurrentScanTarget] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [totalOppsFound, setTotalOppsFound] = useState(0);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent scan history
  useEffect(() => {
    loadRecentHistory();
  }, []);

  const loadRecentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_scrape_history")
        .select("id, category, sub_category, opportunities_count, created_at, status")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setRecentHistory(data || []);
      
      // Update targets with last scan info
      if (data?.length) {
        setTargets(prev => prev.map(t => {
          const latest = data.find(d => d.category === t.id);
          if (latest) {
            return {
              ...t,
              lastScan: latest.created_at,
              lastCount: latest.opportunities_count || 0,
            };
          }
          return t;
        }));
      }
    } catch (err) {
      console.error("Failed to load scan history:", err);
    }
  };

  const toggleTarget = (id: string) => {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const runSingleScan = async (categoryId: string): Promise<ScanResult> => {
    const result: ScanResult = {
      category: categoryId,
      timestamp: new Date().toISOString(),
      opportunitiesFound: 0,
      status: "error",
    };

    try {
      setCurrentScanTarget(categoryId);
      setTargets(prev => prev.map(t => t.id === categoryId ? { ...t, status: "scanning" } : t));

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/opportunity-research`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ category: categoryId }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      // Read the SSE stream fully
      if (!response.body) throw new Error("No response stream");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullOutput = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === "source_metadata") continue;
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullOutput += content;
          } catch { /* skip */ }
        }
      }

      // Count opportunities from JSON
      const jsonMatch = fullOutput.match(/```json\s*([\s\S]*?)```/);
      let opps: any[] = [];
      if (jsonMatch) {
        try { opps = JSON.parse(jsonMatch[1]); } catch { /* skip */ }
      }
      if (!opps.length) {
        const rawMatch = fullOutput.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (rawMatch) {
          try { opps = JSON.parse(rawMatch[0]); } catch { /* skip */ }
        }
      }

      result.opportunitiesFound = opps.length;
      result.status = "success";
      result.highlights = opps.slice(0, 3).map((o: any) => o.name || "Unknown");

      setTargets(prev => prev.map(t => t.id === categoryId ? {
        ...t,
        status: "complete",
        lastScan: new Date().toISOString(),
        lastCount: opps.length,
      } : t));

    } catch (err: any) {
      result.error = err.message;
      result.status = "error";
      setTargets(prev => prev.map(t => t.id === categoryId ? { ...t, status: "error" } : t));
    }

    return result;
  };

  const runFullScan = async () => {
    const enabledTargets = targets.filter(t => t.enabled);
    if (enabledTargets.length === 0) {
      toast.error("Enable at least one scan target");
      return;
    }

    setIsScanning(true);
    setOverallProgress(0);
    setScanResults([]);
    setTotalOppsFound(0);

    toast.info(`Starting AI scan across ${enabledTargets.length} categories...`);

    let totalOpps = 0;
    const results: ScanResult[] = [];

    for (let i = 0; i < enabledTargets.length; i++) {
      const target = enabledTargets[i];
      const result = await runSingleScan(target.id);
      results.push(result);
      setScanResults([...results]);
      totalOpps += result.opportunitiesFound;
      setTotalOppsFound(totalOpps);
      setOverallProgress(((i + 1) / enabledTargets.length) * 100);

      if (result.status === "success") {
        toast.success(`${target.label}: Found ${result.opportunitiesFound} opportunities`);
        saveScrapeResult({
          source: "ai-scanner",
          platform: "investor",
          title: `${target.label} — ${result.opportunitiesFound} opps`,
          category: target.label,
          subCategory: target.id,
          payload: result,
          opportunities: (result as any).opportunities,
          opportunitiesCount: result.opportunitiesFound,
        });
      } else {
        toast.error(`${target.label}: ${result.error}`);
      }

      // Brief pause between scans to avoid rate limiting
      if (i < enabledTargets.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    setIsScanning(false);
    setCurrentScanTarget(null);
    loadRecentHistory();

    const successCount = results.filter(r => r.status === "success").length;
    toast.success(`Scan complete: ${totalOpps} opportunities found across ${successCount}/${enabledTargets.length} categories`);
  };

  // Auto-scan interval
  useEffect(() => {
    if (isAutoScanActive && !isScanning) {
      const intervalMs = parseInt(scanInterval) * 60 * 60 * 1000;
      intervalRef.current = setInterval(() => {
        runFullScan();
      }, intervalMs);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isAutoScanActive, scanInterval, isScanning]);

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Never";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "scanning": return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "complete": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="absolute top-4 right-4 opacity-10">
          <Radar className="h-32 w-32 animate-[spin_8s_linear_infinite]" />
        </div>
        
        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                  <Radar className="h-6 w-6" />
                </div>
                AI Opportunity Scanner
              </h2>
              <p className="text-white/60 mt-1 text-sm">
                Enterprise-grade continuous intelligence — scanning crowdfunding, startups, property & infrastructure
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-white/20 text-white bg-white/5 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Enterprise
              </Badge>
              {isAutoScanActive && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  <Activity className="h-3 w-3 mr-1" />
                  LIVE
                </Badge>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Categories Active", value: targets.filter(t => t.enabled).length, icon: Globe },
              { label: "Last Scan Opps", value: totalOppsFound, icon: TrendingUp },
              { label: "Scan Interval", value: `${scanInterval}h`, icon: Clock },
              { label: "Total Historical", value: recentHistory.reduce((s, h) => s + (h.opportunities_count || 0), 0), icon: Database },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="h-3.5 w-3.5 text-white/40" />
                  <span className="text-[10px] uppercase tracking-wider text-white/40">{stat.label}</span>
                </div>
                <span className="text-xl font-bold tabular-nums">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="border-b border-border/30 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Scanner Controls
              </CardTitle>
              <CardDescription>Configure and manage continuous AI opportunity scanning</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-scan" className="text-sm text-muted-foreground">Auto-Scan</Label>
                <Switch
                  id="auto-scan"
                  checked={isAutoScanActive}
                  onCheckedChange={setIsAutoScanActive}
                />
              </div>
              <Select value={scanInterval} onValueChange={setScanInterval}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Every 1 hour</SelectItem>
                  <SelectItem value="3">Every 3 hours</SelectItem>
                  <SelectItem value="6">Every 6 hours</SelectItem>
                  <SelectItem value="12">Every 12 hours</SelectItem>
                  <SelectItem value="24">Every 24 hours</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={runFullScan}
                disabled={isScanning}
                className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Full Scan
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Progress Bar */}
          {isScanning && (
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Scanning: {targets.find(t => t.id === currentScanTarget)?.label || "..."}
                </span>
                <span className="font-medium tabular-nums">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* Scan Targets Grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {targets.map((target) => (
              <div
                key={target.id}
                className={`group relative rounded-xl border p-4 transition-all duration-300 ${
                  target.enabled
                    ? "border-primary/20 bg-primary/[0.02] hover:border-primary/40 hover:shadow-md"
                    : "border-border/30 bg-muted/20 opacity-60"
                } ${target.status === "scanning" ? "ring-2 ring-primary/30 animate-pulse" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${
                      target.enabled
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <target.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{target.label}</h4>
                      <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        {target.description}
                      </p>
                    </div>
                  </div>
                  <Checkbox
                    checked={target.enabled}
                    onCheckedChange={() => toggleTarget(target.id)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {getStatusIcon(target.status)}
                    <span>{formatTimeAgo(target.lastScan)}</span>
                  </div>
                  {target.lastCount !== undefined && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {target.lastCount} opps
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scan Results Feed */}
      {scanResults.length > 0 && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Scan Results
              <Badge variant="outline" className="ml-2">{totalOppsFound} total opportunities</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {scanResults.map((result, i) => {
                const target = targets.find(t => t.id === result.category);
                const isExpanded = expandedResult === result.category;
                return (
                  <div
                    key={i}
                    className={`rounded-lg border p-4 transition-all ${
                      result.status === "success"
                        ? "border-emerald-200/50 bg-emerald-50/30"
                        : "border-red-200/50 bg-red-50/30"
                    }`}
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedResult(isExpanded ? null : result.category)}
                    >
                      <div className="flex items-center gap-3">
                        {result.status === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <span className="font-medium">{target?.label || result.category}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {result.status === "success"
                              ? `${result.opportunitiesFound} opportunities found`
                              : result.error}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </Badge>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                    {isExpanded && result.highlights && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Top Opportunities:</p>
                        <div className="space-y-1">
                          {result.highlights.map((h, j) => (
                            <div key={j} className="flex items-center gap-2 text-sm">
                              <ArrowRight className="h-3 w-3 text-primary" />
                              {h}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent History */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="border-b border-border/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              Scan History
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={loadRecentHistory}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {recentHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No scan history yet. Run your first scan above.
            </p>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {recentHistory.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between rounded-lg border border-border/30 p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {h.status === "complete" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <div>
                        <span className="text-sm font-medium capitalize">
                          {(h.category || "").replace(/_/g, " ")}
                        </span>
                        {h.sub_category && (
                          <span className="text-xs text-muted-foreground ml-1">/ {h.sub_category}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {h.opportunities_count || 0} opps
                      </Badge>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
