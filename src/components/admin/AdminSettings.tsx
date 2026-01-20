import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  Clock, 
  Users, 
  Database, 
  Mail, 
  Lock, 
  Eye, 
  Loader2,
  Save,
  RotateCcw,
  Globe,
  Zap,
  FileText,
  CheckCircle2
} from "lucide-react";

interface AdminSettingsData {
  // Security Settings
  autoLogoutEnabled: boolean;
  autoLogoutMinutes: number;
  enforceStrongPasswords: boolean;
  sessionTimeoutEnabled: boolean;
  twoFactorRequired: boolean;
  
  // Notification Settings
  emailNotificationsEnabled: boolean;
  systemAlertsEnabled: boolean;
  userActivityAlertsEnabled: boolean;
  weeklyReportsEnabled: boolean;
  criticalAlertsOnly: boolean;
  
  // Platform Settings
  maintenanceMode: boolean;
  debugMode: boolean;
  analyticsEnabled: boolean;
  
  // User Management Defaults
  defaultUserRole: string;
  defaultPlatformAccess: string[];
  requireEmailVerification: boolean;
  allowSelfRegistration: boolean;
  
  // Appearance
  adminTheme: string;
  compactMode: boolean;
  showAnimations: boolean;
  
  // Data Management
  dataRetentionDays: number;
  autoBackupEnabled: boolean;
  backupFrequency: string;
}

const defaultSettings: AdminSettingsData = {
  autoLogoutEnabled: true,
  autoLogoutMinutes: 30,
  enforceStrongPasswords: true,
  sessionTimeoutEnabled: true,
  twoFactorRequired: false,
  
  emailNotificationsEnabled: true,
  systemAlertsEnabled: true,
  userActivityAlertsEnabled: true,
  weeklyReportsEnabled: true,
  criticalAlertsOnly: false,
  
  maintenanceMode: false,
  debugMode: false,
  analyticsEnabled: true,
  
  defaultUserRole: "viewer",
  defaultPlatformAccess: ["investor"],
  requireEmailVerification: true,
  allowSelfRegistration: false,
  
  adminTheme: "system",
  compactMode: false,
  showAnimations: true,
  
  dataRetentionDays: 365,
  autoBackupEnabled: true,
  backupFrequency: "daily",
};

interface AdminSettingsProps {
  onSettingsChange?: (settings: Partial<AdminSettingsData>) => void;
}

export function AdminSettings({ onSettingsChange }: AdminSettingsProps) {
  const [settings, setSettings] = useState<AdminSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_key, setting_value")
        .eq("user_id", user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedSettings: Partial<AdminSettingsData> = {};
        data.forEach((row) => {
          const value = row.setting_value as any;
          if (value && typeof value.value !== 'undefined') {
            (loadedSettings as any)[row.setting_key] = value.value;
          }
        });
        setSettings({ ...defaultSettings, ...loadedSettings });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof AdminSettingsData>(
    key: K,
    value: AdminSettingsData[K]
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      setHasChanges(true);
      return newSettings;
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save each setting
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        user_id: user.id,
        setting_key: key,
        setting_value: { value },
      }));

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from("admin_settings")
          .upsert(setting, { onConflict: "user_id,setting_key" });

        if (error) throw error;
      }

      setHasChanges(false);
      toast.success("Settings saved successfully");
      
      // Notify parent component
      if (onSettingsChange) {
        onSettingsChange(settings);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    toast.info("Settings reset to defaults. Click Save to apply.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Admin Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure platform-wide settings and security policies
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" onClick={resetToDefaults} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={saving || !hasChanges}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid grid-cols-6 gap-2 h-auto p-1 bg-slate-100/80">
          <TabsTrigger value="security" className="flex items-center gap-2 py-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 py-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center gap-2 py-2">
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline">Platform</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2 py-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 py-2">
            <Palette className="h-4 w-4" />
            <span className="hidden md:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2 py-2">
            <Database className="h-4 w-4" />
            <span className="hidden md:inline">Data</span>
          </TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="grid gap-6 pr-4">
              {/* Auto Logout Settings */}
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-lg">Auto Logout</CardTitle>
                  </div>
                  <CardDescription>
                    Automatically log out administrators after a period of inactivity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Auto Logout</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically sign out after inactivity
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoLogoutEnabled}
                      onCheckedChange={(checked) => updateSetting("autoLogoutEnabled", checked)}
                    />
                  </div>
                  
                  {settings.autoLogoutEnabled && (
                    <div className="space-y-2">
                      <Label>Inactivity Timeout</Label>
                      <Select
                        value={settings.autoLogoutMinutes.toString()}
                        onValueChange={(value) => updateSetting("autoLogoutMinutes", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        You will receive a warning 1 minute before being logged out
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Password & Authentication */}
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Authentication Security</CardTitle>
                  </div>
                  <CardDescription>
                    Configure password policies and authentication requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enforce Strong Passwords</Label>
                      <p className="text-sm text-muted-foreground">
                        Require complex passwords for all users
                      </p>
                    </div>
                    <Switch
                      checked={settings.enforceStrongPasswords}
                      onCheckedChange={(checked) => updateSetting("enforceStrongPasswords", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">
                        End sessions after extended inactivity
                      </p>
                    </div>
                    <Switch
                      checked={settings.sessionTimeoutEnabled}
                      onCheckedChange={(checked) => updateSetting("sessionTimeoutEnabled", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Mandate 2FA for all admin users
                      </p>
                    </div>
                    <Switch
                      checked={settings.twoFactorRequired}
                      onCheckedChange={(checked) => updateSetting("twoFactorRequired", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="grid gap-6 pr-4">
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg">Email Notifications</CardTitle>
                  </div>
                  <CardDescription>
                    Configure email notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important updates via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotificationsEnabled}
                      onCheckedChange={(checked) => updateSetting("emailNotificationsEnabled", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly summary reports
                      </p>
                    </div>
                    <Switch
                      checked={settings.weeklyReportsEnabled}
                      onCheckedChange={(checked) => updateSetting("weeklyReportsEnabled", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Critical Alerts Only</Label>
                      <p className="text-sm text-muted-foreground">
                        Only receive critical security alerts
                      </p>
                    </div>
                    <Switch
                      checked={settings.criticalAlertsOnly}
                      onCheckedChange={(checked) => updateSetting("criticalAlertsOnly", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-lg">System Alerts</CardTitle>
                  </div>
                  <CardDescription>
                    Configure in-app notification settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive system status notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.systemAlertsEnabled}
                      onCheckedChange={(checked) => updateSetting("systemAlertsEnabled", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>User Activity Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified of user registrations and activity
                      </p>
                    </div>
                    <Switch
                      checked={settings.userActivityAlertsEnabled}
                      onCheckedChange={(checked) => updateSetting("userActivityAlertsEnabled", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Platform Tab */}
        <TabsContent value="platform">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="grid gap-6 pr-4">
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-lg">Platform Status</CardTitle>
                  </div>
                  <CardDescription>
                    Control platform-wide features and modes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        Maintenance Mode
                        {settings.maintenanceMode && (
                          <Badge variant="destructive" className="text-xs">Active</Badge>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable user access for maintenance
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable verbose logging for troubleshooting
                      </p>
                    </div>
                    <Switch
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => updateSetting("debugMode", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Collect usage analytics and metrics
                      </p>
                    </div>
                    <Switch
                      checked={settings.analyticsEnabled}
                      onCheckedChange={(checked) => updateSetting("analyticsEnabled", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="grid gap-6 pr-4">
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">User Management Defaults</CardTitle>
                  </div>
                  <CardDescription>
                    Set default settings for new user accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default User Role</Label>
                    <Select
                      value={settings.defaultUserRole}
                      onValueChange={(value) => updateSetting("defaultUserRole", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="user">Standard User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Users must verify email before access
                      </p>
                    </div>
                    <Switch
                      checked={settings.requireEmailVerification}
                      onCheckedChange={(checked) => updateSetting("requireEmailVerification", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Self Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to create accounts themselves
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowSelfRegistration}
                      onCheckedChange={(checked) => updateSetting("allowSelfRegistration", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="grid gap-6 pr-4">
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-pink-500" />
                    <CardTitle className="text-lg">Admin Panel Appearance</CardTitle>
                  </div>
                  <CardDescription>
                    Customize how the admin dashboard looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={settings.adminTheme}
                      onValueChange={(value) => updateSetting("adminTheme", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use smaller spacing and elements
                      </p>
                    </div>
                    <Switch
                      checked={settings.compactMode}
                      onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable UI animations and transitions
                      </p>
                    </div>
                    <Switch
                      checked={settings.showAnimations}
                      onCheckedChange={(checked) => updateSetting("showAnimations", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="grid gap-6 pr-4">
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-cyan-500" />
                    <CardTitle className="text-lg">Data Management</CardTitle>
                  </div>
                  <CardDescription>
                    Configure data retention and backup settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data Retention Period</Label>
                    <Select
                      value={settings.dataRetentionDays.toString()}
                      onValueChange={(value) => updateSetting("dataRetentionDays", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="730">2 years</SelectItem>
                        <SelectItem value="1825">5 years</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How long to keep historical data before archiving
                    </p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup database
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoBackupEnabled}
                      onCheckedChange={(checked) => updateSetting("autoBackupEnabled", checked)}
                    />
                  </div>
                  {settings.autoBackupEnabled && (
                    <div className="space-y-2">
                      <Label>Backup Frequency</Label>
                      <Select
                        value={settings.backupFrequency}
                        onValueChange={(value) => updateSetting("backupFrequency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-green-200/80 shadow-sm bg-green-50/50">
                <CardContent className="flex items-center gap-3 py-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">System Status: Healthy</p>
                    <p className="text-sm text-green-600">All services are running normally</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
