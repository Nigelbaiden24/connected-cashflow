import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  action_url: string | null;
  created_at: string;
  is_read: boolean;
}

export function DynamicAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('advisor_alerts')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleAlertClick = async (alert: Alert) => {
    await supabase
      .from('advisor_alerts')
      .update({ is_read: true })
      .eq('id', alert.id);

    if (alert.action_url) {
      navigate(alert.action_url);
    }

    fetchAlerts();
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertCircle;
      case 'warning': return AlertTriangle;
      default: return Info;
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Bell className="h-4 w-4 text-amber-500" />
            </div>
            Dynamic Alerts
          </div>
          {alerts.length > 0 && (
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs animate-pulse">{alerts.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No new alerts</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const Icon = getSeverityIcon(alert.severity);
                
                return (
                  <div
                    key={alert.id}
                    onClick={() => handleAlertClick(alert)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm hover:bg-muted/40 hover:border-primary/20 cursor-pointer transition-all duration-300 group"
                  >
                    <div className="p-1.5 rounded-lg bg-muted/50 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{alert.title}</p>
                        <Badge className={`text-xs ${getSeverityStyle(alert.severity)}`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
