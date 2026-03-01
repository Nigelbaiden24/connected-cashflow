import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Alert { id: string; alert_type: string; severity: string; title: string; message: string; action_url: string | null; created_at: string; is_read: boolean; }

export function DynamicAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const navigate = useNavigate();

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data, error } = await supabase.from('advisor_alerts').select('*').eq('user_id', user.user.id).eq('is_read', false).order('created_at', { ascending: false }).limit(10);
      if (error) throw error;
      setAlerts(data || []);
    } catch (error) { console.error('Error fetching alerts:', error); }
  };

  const handleAlertClick = async (alert: Alert) => {
    await supabase.from('advisor_alerts').update({ is_read: true }).eq('id', alert.id);
    if (alert.action_url) navigate(alert.action_url);
    fetchAlerts();
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) { case 'critical': return AlertCircle; case 'warning': return AlertTriangle; default: return Info; }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Alerts
          </div>
          {alerts.length > 0 && <Badge variant="destructive" className="text-xs">{alerts.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-1.5">
            {alerts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No new alerts</p>
              </div>
            ) : alerts.map((alert) => {
              const Icon = getSeverityIcon(alert.severity);
              return (
                <div key={alert.id} onClick={() => handleAlertClick(alert)} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-muted/10 hover:bg-muted/30 cursor-pointer transition-colors">
                  <Icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{alert.severity}</Badge>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
