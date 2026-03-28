import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Key, Copy, RefreshCw, Trash2, Edit, Eye, EyeOff } from "lucide-react";

interface ApiClient {
  id: string;
  company_name: string;
  api_key: string;
  plan: string;
  status: string;
  contact_email: string | null;
  description: string | null;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  created_at: string;
}

export function ApiClientManagement() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<ApiClient | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    company_name: "",
    contact_email: "",
    description: "",
    plan: "free",
  });

  const { data: clients, isLoading } = useQuery({
    queryKey: ["api-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ApiClient[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const { error } = await supabase.from("api_clients").insert({
        company_name: values.company_name,
        contact_email: values.contact_email || null,
        description: values.description || null,
        plan: values.plan,
        rate_limit_per_minute: values.plan === "enterprise" ? 300 : values.plan === "pro" ? 60 : 10,
        rate_limit_per_day: values.plan === "enterprise" ? 50000 : values.plan === "pro" ? 5000 : 100,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-clients"] });
      setShowCreateDialog(false);
      setForm({ company_name: "", contact_email: "", description: "", plan: "free" });
      toast.success("API client created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...values }: any) => {
      const { error } = await supabase.from("api_clients").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-clients"] });
      setEditingClient(null);
      toast.success("Client updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("api_clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-clients"] });
      toast.success("Client deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const regenerateKey = async (id: string) => {
    const newKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const { error } = await supabase.from("api_clients").update({ api_key: newKey }).eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["api-clients"] });
      toast.success("API key regenerated");
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const planColors: Record<string, string> = {
    free: "bg-muted text-muted-foreground",
    pro: "bg-primary/10 text-primary",
    enterprise: "bg-amber-500/10 text-amber-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Clients</h3>
          <p className="text-sm text-muted-foreground">Manage API access for external consumers</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Company Name *</Label>
                <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Acme Corp" />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="api@acme.com" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="CRM integration" />
              </div>
              <div>
                <Label>Plan</Label>
                <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free (100/day)</SelectItem>
                    <SelectItem value="pro">Pro (5,000/day)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (50,000/day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate(form)} disabled={!form.company_name || createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Client"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading clients...</div>
      ) : (
        <div className="grid gap-4">
          {clients?.map((client) => (
            <Card key={client.id} className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{client.company_name}</h4>
                      <Badge className={planColors[client.plan]}>{client.plan}</Badge>
                      <Badge variant={client.status === "active" ? "default" : "secondary"}>
                        {client.status}
                      </Badge>
                    </div>
                    {client.contact_email && <p className="text-sm text-muted-foreground">{client.contact_email}</p>}
                    {client.description && <p className="text-sm text-muted-foreground">{client.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <Key className="h-3.5 w-3.5 text-muted-foreground" />
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {visibleKeys[client.id] ? client.api_key : client.api_key.substring(0, 8) + "••••••••••••••••"}
                      </code>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setVisibleKeys((v) => ({ ...v, [client.id]: !v[client.id] }))}>
                        {visibleKeys[client.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyKey(client.api_key)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Limits: {client.rate_limit_per_minute}/min • {client.rate_limit_per_day}/day
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => regenerateKey(client.id)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateMutation.mutate({ id: client.id, status: client.status === "active" ? "inactive" : "active" })}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm("Delete this client?")) deleteMutation.mutate(client.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!clients || clients.length === 0) && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No API clients yet. Create one to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
