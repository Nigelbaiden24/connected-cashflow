import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Plus, Trash2, Power, PowerOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export function SmartAlertsManager() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    alert_type: "aum_change",
    threshold_value: "",
    plan_id: null as string | null
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("plan_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleCreateAlert = async () => {
    if (!formData.threshold_value) {
      toast.error("Please enter a threshold value");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("plan_alerts")
        .insert({
          user_id: user.id,
          alert_type: formData.alert_type,
          plan_id: formData.plan_id,
          condition_config: {
            threshold: parseFloat(formData.threshold_value),
            type: formData.alert_type
          }
        });

      if (error) throw error;

      toast.success("Alert created");
      setFormData({ alert_type: "aum_change", threshold_value: "", plan_id: null });
      setIsDialogOpen(false);
      fetchAlerts();
    } catch (error: any) {
      toast.error("Failed to create alert");
      console.error(error);
    }
  };

  const handleToggleAlert = async (alertId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("plan_alerts")
        .update({ is_active: !currentState })
        .eq("id", alertId);

      if (error) throw error;
      fetchAlerts();
    } catch (error: any) {
      toast.error("Failed to update alert");
      console.error(error);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("plan_alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
      toast.success("Alert deleted");
      fetchAlerts();
    } catch (error: any) {
      toast.error("Failed to delete alert");
      console.error(error);
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "aum_change": return "AUM Change";
      case "inactivity": return "Inactivity";
      case "time_horizon": return "Time Horizon";
      case "risk_score": return "Risk Score";
      default: return "Custom";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Smart Alerts
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Smart Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Alert Type</Label>
                  <Select
                    value={formData.alert_type}
                    onValueChange={(value) => setFormData({ ...formData, alert_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aum_change">AUM Change (%)</SelectItem>
                      <SelectItem value="inactivity">Inactivity (days)</SelectItem>
                      <SelectItem value="time_horizon">Time Horizon (years)</SelectItem>
                      <SelectItem value="risk_score">Risk Score Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Threshold Value</Label>
                  <Input
                    type="number"
                    value={formData.threshold_value}
                    onChange={(e) => setFormData({ ...formData, threshold_value: e.target.value })}
                    placeholder={
                      formData.alert_type === "aum_change" ? "e.g., 10 for 10%" :
                      formData.alert_type === "inactivity" ? "e.g., 30 for 30 days" :
                      formData.alert_type === "time_horizon" ? "e.g., 5 for 5 years" :
                      "Enter threshold"
                    }
                  />
                </div>
                <Button onClick={handleCreateAlert} className="w-full">Create Alert</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No alerts configured. Create one to stay informed!
            </p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {alert.is_active ? (
                    <Power className="h-4 w-4 text-financial-green" />
                  ) : (
                    <PowerOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{getAlertTypeLabel(alert.alert_type)}</p>
                    <p className="text-sm text-muted-foreground">
                      Threshold: {alert.condition_config.threshold}
                      {alert.alert_type === "aum_change" && "%"}
                      {alert.alert_type === "inactivity" && " days"}
                      {alert.alert_type === "time_horizon" && " years"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alert.is_active}
                    onCheckedChange={() => handleToggleAlert(alert.id, alert.is_active)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}