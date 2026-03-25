import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tablet, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LoginEntry {
  id: string;
  device_type: string;
  user_agent: string;
  login_status: string;
  failure_reason: string | null;
  created_at: string;
  ip_address: string | null;
}

export function LoginActivityLog() {
  const [entries, setEntries] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("login_activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20) as any;

      if (!error && data) {
        setEntries(data);
      }
      setLoading(false);
    }
    fetchActivity();
  }, []);

  const DeviceIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "mobile": return <Smartphone className="h-4 w-4" />;
      case "tablet": return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getBrowserName = (ua: string): string => {
    if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Edg")) return "Edge";
    return "Unknown";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login Activity</CardTitle>
        <CardDescription>Recent sign-in events for your account</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No login activity recorded yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DeviceIcon type={entry.device_type} />
                      <span className="text-sm capitalize">{entry.device_type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{getBrowserName(entry.user_agent || "")}</TableCell>
                  <TableCell>
                    <Badge variant={entry.login_status === "success" ? "default" : "destructive"}>
                      {entry.login_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
