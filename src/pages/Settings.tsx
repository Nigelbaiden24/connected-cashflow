import { useLocation } from "react-router-dom";
import { ActivityLog } from "@/components/settings/ActivityLog";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { PushNotificationSettings } from "@/components/notifications/PushNotificationSettings";
import { TranslatedText } from "@/components/TranslatedText";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Activity, Bell, Settings2, Shield, UserCircle2 } from "lucide-react";

const getInitials = (value: string) =>
  value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

const Settings = () => {
  const location = useLocation();
  const { profile } = useUserProfile();
  const isBusiness = location.pathname.startsWith("/business");
  const platformLabel = isBusiness ? "FlowPulse Business" : "FlowPulse Finance";
  const displayName = profile.full_name || profile.first_name || "Your profile";
  const displayEmail = profile.email || "Add your email details in profile settings";

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <TranslatedText as="h1" className="text-3xl font-bold tracking-tight">
          Settings
        </TranslatedText>
        <TranslatedText as="p" className="text-muted-foreground">
          Manage your profile, preferences, and recent account activity.
        </TranslatedText>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar className="h-20 w-20 border border-border">
              <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-2xl font-semibold">{displayName}</h2>
                <Badge variant="secondary">{platformLabel}</Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">{displayEmail}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1">
                  <UserCircle2 className="h-3.5 w-3.5" />
                  Profile ready
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3.5 w-3.5" />
                  Recent updates below
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  Account controls enabled
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:w-[360px]">
            <Card className="bg-muted/40">
              <CardHeader className="pb-2">
                <CardDescription>Profile</CardDescription>
                <CardTitle className="text-base">Name, photo, company</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-muted/40">
              <CardHeader className="pb-2">
                <CardDescription>Updates</CardDescription>
                <CardTitle className="text-base">Recent activity log</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-muted/40">
              <CardHeader className="pb-2">
                <CardDescription>Controls</CardDescription>
                <CardTitle className="text-base">Language and account</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="profile" className="gap-2">
            <UserCircle2 className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="updates" className="gap-2">
            <Activity className="h-4 w-4" />
            Recent updates
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <Shield className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="updates">
          <ActivityLog />
        </TabsContent>
        <TabsContent value="preferences">
          <LanguageSettings />
        </TabsContent>
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
