import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Webhook, Trash2 } from "lucide-react";

const EVENT_TYPES = ["new_deal", "new_insight", "new_report", "deal_updated", "market_alert"];

export function ApiWebhooksManager() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ api_client_id: "", url: "", event_type: "new_deal" });

  const { data: clients } = useQuery({
    queryKey: ["api-clients-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("api_clients").select("id, company_name").order("company_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: webhooks } = useQuery({
    queryKey: ["api-webhooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_webhooks")
        .select("*, api_clients(company_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const { error } = await supabase.from("api_webhooks").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-webhooks"] });
      setShowCreate(false);
      setForm({ api_client_id: "", url: "", event_type: "new_deal" });
      toast.success("Webhook created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("api_webhooks").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-webhooks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("api_webhooks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-webhooks"] });
      toast.success("Webhook deleted");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Webhooks</h3>
          <p className="text-sm text-muted-foreground">Push notifications to API clients when events occur</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Webhook</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Webhook</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Client</Label>
                <Select value={form.api_client_id} onValueChange={(v) => setForm({ ...form, api_client_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Callback URL</Label>
                <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://api.client.com/webhook" />
              </div>
              <div>
                <Label>Event Type</Label>
                <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate(form)} disabled={!form.api_client_id || !form.url}>
                Create Webhook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {webhooks?.map((wh: any) => (
          <Card key={wh.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Webhook className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{wh.api_clients?.company_name}</p>
                  <code className="text-xs text-muted-foreground">{wh.url}</code>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{wh.event_type.replace(/_/g, " ")}</Badge>
                    {wh.failure_count > 0 && (
                      <Badge variant="destructive" className="text-xs">{wh.failure_count} failures</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={wh.is_active} onCheckedChange={(v) => toggleMutation.mutate({ id: wh.id, is_active: v })} />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(wh.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!webhooks || webhooks.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Webhook className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No webhooks configured yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
