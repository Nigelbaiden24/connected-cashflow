import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ApiClientManagement } from "./ApiClientManagement";
import { ApiPermissionsManager } from "./ApiPermissionsManager";
import { ApiUsageDashboard } from "./ApiUsageDashboard";
import { ApiWebhooksManager } from "./ApiWebhooksManager";
import { Users, Shield, Activity, Webhook, Code, Globe } from "lucide-react";

export function ApiManagementPanel() {
  const [activeTab, setActiveTab] = useState("clients");
  const baseUrl = "https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/api-gateway";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
          <Globe className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">API Management</h2>
          <p className="text-muted-foreground">Manage external API access, clients, and monetisation</p>
        </div>
      </div>

      {/* Quick reference */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Code className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">API Base URL</p>
              <code className="text-xs bg-background px-2 py-1 rounded">{baseUrl}</code>
              <p className="text-xs text-muted-foreground mt-1">
                Example: <code>curl -H "Authorization: Bearer YOUR_API_KEY" {baseUrl}/deals?sector=fintech</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="clients" className="gap-2">
            <Users className="h-4 w-4" /> Clients
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="h-4 w-4" /> Access
          </TabsTrigger>
          <TabsTrigger value="usage" className="gap-2">
            <Activity className="h-4 w-4" /> Usage
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" /> Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients"><ApiClientManagement /></TabsContent>
        <TabsContent value="permissions"><ApiPermissionsManager /></TabsContent>
        <TabsContent value="usage"><ApiUsageDashboard /></TabsContent>
        <TabsContent value="webhooks"><ApiWebhooksManager /></TabsContent>
      </Tabs>
    </div>
  );
}
