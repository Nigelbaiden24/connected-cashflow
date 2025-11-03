import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Bell, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  task_reminders: boolean;
  weekly_reports: boolean;
  marketing_emails: boolean;
}

export const NotificationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    task_reminders: true,
    weekly_reports: true,
    marketing_emails: false,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          task_reminders: data.task_reminders,
          weekly_reports: data.weekly_reports,
          marketing_emails: data.marketing_emails,
        });
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      toast.error("Failed to load notification preferences");
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!userId) return;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          ...newPreferences,
        });

      if (error) throw error;

      toast.success("Notification preference updated");
    } catch (error) {
      console.error("Error updating preference:", error);
      toast.error("Failed to update preference");
      setPreferences(preferences);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>Manage your email notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your activity
              </p>
            </div>
            <Switch
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => handleToggle("email_notifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly summary reports via email
              </p>
            </div>
            <Switch
              checked={preferences.weekly_reports}
              onCheckedChange={(checked) => handleToggle("weekly_reports", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and updates
              </p>
            </div>
            <Switch
              checked={preferences.marketing_emails}
              onCheckedChange={(checked) => handleToggle("marketing_emails", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          <CardDescription>Manage browser and device notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on your devices
              </p>
            </div>
            <Switch
              checked={preferences.push_notifications}
              onCheckedChange={(checked) => handleToggle("push_notifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Task Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders about upcoming tasks and deadlines
              </p>
            </div>
            <Switch
              checked={preferences.task_reminders}
              onCheckedChange={(checked) => handleToggle("task_reminders", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>Communication Preferences</CardTitle>
          </div>
          <CardDescription>Choose how you want to be contacted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>
              You can manage additional communication preferences in your profile settings.
              For urgent matters, we'll always send critical notifications regardless of your preferences.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};