import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, X, BellOff } from "lucide-react";
import { useOneSignal } from "@/hooks/useOneSignal";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DISMISSED_KEY = "flowpulse_push_banner_dismissed";

export function PushNotificationBanner() {
  const [visible, setVisible] = useState(false);
  const {
    initialized,
    initializing,
    permissionStatus,
    subscribed,
    configError,
    promptForPermission,
    setTags,
    setExternalId,
  } = useOneSignal();
  const { profile } = useUserProfile();

  useEffect(() => {
    if (!initialized) return;
    if (subscribed || permissionStatus === "granted") return;
    if (permissionStatus === "denied") return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;
    // Show banner after a short delay
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, [initialized, subscribed, permissionStatus]);

  const handleEnable = async () => {
    const granted = await promptForPermission();
    if (granted) {
      toast.success("Push notifications enabled!");
      // Tag user with profile data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await setExternalId(user.id);
        await setTags({
          user_role: "investor",
          subscription_type: "free",
          push_deals: "true",
          push_reports: "true",
          push_market_alerts: "true",
        });
      }
    } else if (configError) {
      toast.error(configError);
    } else {
      toast.info("You can enable notifications later in browser settings.");
    }
    setVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-4 fade-in duration-500">
      <Card className="border-primary/20 bg-card shadow-2xl shadow-primary/10">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 rounded-xl bg-primary/10 p-3">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">
                Stay ahead of the market
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get real-time deal alerts, market updates, and investor signals delivered instantly.
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleEnable} className="gap-1.5" disabled={initializing}>
                  <Bell className="h-3.5 w-3.5" />
                  {initializing ? "Connecting..." : "Enable Notifications"}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  Not now
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {(permissionStatus === "denied" || configError) && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-muted-foreground">
              <BellOff className="h-4 w-4 text-destructive" />
              {configError || "Notifications are blocked. You can enable them in your browser settings."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
