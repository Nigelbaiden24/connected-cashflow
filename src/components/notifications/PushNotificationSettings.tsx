import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, BellRing, TrendingUp, FileText, Lightbulb } from "lucide-react";
import { useOneSignal } from "@/hooks/useOneSignal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function PushNotificationSettings() {
  const { initialized, permissionStatus, subscribed, promptForPermission, optOut, setTags } = useOneSignal();
  const [prefs, setPrefs] = useState({
    deals: true,
    reports: true,
    marketAlerts: true,
  });

  useEffect(() => {
    // Load existing tag preferences from OneSignal
    const OneSignal = window.OneSignal;
    if (!OneSignal?.User) return;
    try {
      const tags = OneSignal.User.getTags?.() || {};
      setPrefs({
        deals: tags.push_deals !== "false",
        reports: tags.push_reports !== "false",
        marketAlerts: tags.push_market_alerts !== "false",
      });
    } catch {}
  }, [initialized]);

  const handleToggleSubscription = async () => {
    if (subscribed) {
      await optOut();
      toast.success("Push notifications disabled");
    } else {
      const granted = await promptForPermission();
      if (granted) {
        toast.success("Push notifications enabled!");
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const OneSignal = window.OneSignal;
          if (OneSignal) await OneSignal.login(user.id);
        }
      } else {
        toast.info("You can enable notifications in browser settings.");
      }
    }
  };

  const handleTogglePref = async (key: keyof typeof prefs) => {
    const newVal = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: newVal }));
    const tagMap: Record<string, string> = {
      deals: "push_deals",
      reports: "push_reports",
      marketAlerts: "push_market_alerts",
    };
    await setTags({ [tagMap[key]]: String(newVal) });
    toast.success("Notification preference updated");
  };

  const statusBadge = permissionStatus === "granted" && subscribed
    ? { label: "Active", variant: "default" as const, icon: BellRing }
    : permissionStatus === "denied"
    ? { label: "Blocked", variant: "destructive" as const, icon: BellOff }
    : { label: "Inactive", variant: "secondary" as const, icon: Bell };

  const StatusIcon = statusBadge.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          <Badge variant={statusBadge.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusBadge.label}
          </Badge>
        </div>
        <CardDescription>
          Receive real-time alerts for deals, reports, and market movements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="font-medium">Enable Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {permissionStatus === "denied"
                ? "Notifications blocked — enable in browser settings"
                : "Receive browser push notifications"}
            </p>
          </div>
          <Switch
            checked={subscribed}
            onCheckedChange={handleToggleSubscription}
            disabled={permissionStatus === "denied"}
          />
        </div>

        {/* Category toggles */}
        {subscribed && (
          <div className="space-y-4 border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground">Notification Types</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <Label>Deal Alerts</Label>
                  <p className="text-xs text-muted-foreground">New opportunities and deals</p>
                </div>
              </div>
              <Switch checked={prefs.deals} onCheckedChange={() => handleTogglePref("deals")} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <Label>Report Alerts</Label>
                  <p className="text-xs text-muted-foreground">New research & analysis reports</p>
                </div>
              </div>
              <Switch checked={prefs.reports} onCheckedChange={() => handleTogglePref("reports")} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <Label>Market Alerts</Label>
                  <p className="text-xs text-muted-foreground">Market movements & signals</p>
                </div>
              </div>
              <Switch checked={prefs.marketAlerts} onCheckedChange={() => handleTogglePref("marketAlerts")} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
