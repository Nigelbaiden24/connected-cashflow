import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Database } from "lucide-react";

const ENDPOINT_GROUPS = {
  "Deal Flow API": ["deals", "opportunities"],
  "Investor Intelligence API": ["investors", "clients", "crm-contacts"],
  "Market Insights API": ["market-commentary", "stocks-crypto", "insights"],
  "Reports API": ["reports", "research-reports"],
  "Companies API": ["companies", "scraped-companies"],
};

export function ApiPermissionsManager() {
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const { data: clients } = useQuery({
    queryKey: ["api-clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("api_clients").select("id, company_name, plan").order("company_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: permissions } = useQuery({
    queryKey: ["api-permissions", selectedClientId],
    enabled: !!selectedClientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_permissions")
        .select("*")
        .eq("api_client_id", selectedClientId);
      if (error) throw error;
      return data;
    },
  });

  const togglePermission = useMutation({
    mutationFn: async ({ endpoint, group, enabled }: { endpoint: string; group: string; enabled: boolean }) => {
      if (enabled) {
        const { error } = await supabase.from("api_permissions").upsert(
          { api_client_id: selectedClientId, endpoint_name: endpoint, endpoint_group: group, access_level: "read" },
          { onConflict: "api_client_id,endpoint_name" }
        );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("api_permissions")
          .delete()
          .eq("api_client_id", selectedClientId)
          .eq("endpoint_name", endpoint);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-permissions", selectedClientId] });
      toast.success("Permission updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleGroup = async (group: string, endpoints: string[], enabled: boolean) => {
    for (const endpoint of endpoints) {
      await togglePermission.mutateAsync({ endpoint, group, enabled });
    }
  };

  const isEndpointEnabled = (endpoint: string) => {
    return permissions?.some((p) => p.endpoint_name === endpoint && p.access_level !== "none") ?? false;
  };

  const isGroupFullyEnabled = (endpoints: string[]) => {
    return endpoints.every((ep) => isEndpointEnabled(ep));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Endpoint Access Control</h3>
        <p className="text-sm text-muted-foreground">Assign API products and endpoints to clients</p>
      </div>

      <div className="max-w-sm">
        <Label>Select Client</Label>
        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
          <SelectTrigger><SelectValue placeholder="Choose a client..." /></SelectTrigger>
          <SelectContent>
            {clients?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.company_name} ({c.plan})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClientId && (
        <div className="grid gap-4">
          {Object.entries(ENDPOINT_GROUPS).map(([group, endpoints]) => (
            <Card key={group}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">{group}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Enable All</span>
                    <Switch
                      checked={isGroupFullyEnabled(endpoints)}
                      onCheckedChange={(v) => toggleGroup(group, endpoints, v)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {endpoints.map((endpoint) => (
                    <div key={endpoint} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono">/api/{endpoint}</code>
                        {isEndpointEnabled(endpoint) && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">Active</Badge>
                        )}
                      </div>
                      <Switch
                        checked={isEndpointEnabled(endpoint)}
                        onCheckedChange={(v) => togglePermission.mutate({ endpoint, group, enabled: v })}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
