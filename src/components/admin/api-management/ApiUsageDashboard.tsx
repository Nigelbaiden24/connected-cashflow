import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, TrendingUp, AlertTriangle, Clock } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function ApiUsageDashboard() {
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [timeRange, setTimeRange] = useState("7d");

  const { data: clients } = useQuery({
    queryKey: ["api-clients-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("api_clients").select("id, company_name").order("company_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: usageLogs } = useQuery({
    queryKey: ["api-usage", selectedClientId, timeRange],
    queryFn: async () => {
      const days = timeRange === "1d" ? 1 : timeRange === "7d" ? 7 : 30;
      const since = new Date(Date.now() - days * 86400000).toISOString();

      let query = supabase
        .from("api_usage_logs")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (selectedClientId !== "all") {
        query = query.eq("api_client_id", selectedClientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Compute stats
  const totalRequests = usageLogs?.length || 0;
  const successCount = usageLogs?.filter((l) => l.response_status === 200).length || 0;
  const errorCount = usageLogs?.filter((l) => l.response_status && l.response_status >= 400).length || 0;
  const avgResponseTime = usageLogs?.length
    ? Math.round(usageLogs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / usageLogs.length)
    : 0;

  // Daily chart data
  const dailyData = (() => {
    const map: Record<string, { date: string; requests: number; errors: number }> = {};
    usageLogs?.forEach((log) => {
      const date = new Date(log.created_at).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      if (!map[date]) map[date] = { date, requests: 0, errors: 0 };
      map[date].requests++;
      if (log.response_status && log.response_status >= 400) map[date].errors++;
    });
    return Object.values(map).reverse();
  })();

  // Top endpoints
  const endpointData = (() => {
    const map: Record<string, number> = {};
    usageLogs?.forEach((log) => {
      map[log.endpoint] = (map[log.endpoint] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Usage Dashboard</h3>
          <p className="text-sm text-muted-foreground">Monitor API consumption and performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All clients" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">24h</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Activity className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold">{successCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div>
              <p className="text-2xl font-bold">{errorCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold">{avgResponseTime}ms</p>
              <p className="text-xs text-muted-foreground">Avg Response</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Requests Over Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="errors" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Top Endpoints</CardTitle></CardHeader>
          <CardContent>
            {endpointData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={endpointData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {endpointData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No usage data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent logs */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Requests</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 font-medium">Endpoint</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Response</th>
                  <th className="pb-2 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {usageLogs?.slice(0, 20).map((log) => (
                  <tr key={log.id} className="border-b border-border/50">
                    <td className="py-2 text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2"><code className="text-xs">{log.endpoint}</code></td>
                    <td className="py-2">
                      <Badge variant={log.response_status === 200 ? "default" : "destructive"} className="text-xs">
                        {log.response_status}
                      </Badge>
                    </td>
                    <td className="py-2 text-xs">{log.response_time_ms}ms</td>
                    <td className="py-2 text-xs text-muted-foreground">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!usageLogs || usageLogs.length === 0) && (
              <div className="py-8 text-center text-muted-foreground text-sm">No usage logs yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
