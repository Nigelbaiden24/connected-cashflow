import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Bell, Users, Lightbulb, FileText, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePushNotificationTriggers } from "@/hooks/usePushNotificationTriggers";

export function AdminPushNotifications() {
  const { newDealAdded, newReportPublished, marketAlertTriggered } = usePushNotificationTriggers();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "deal" as "deal" | "report" | "market",
    title: "",
    message: "",
    url: "",
    sector: "",
  });

  const handleSend = async () => {
    if (!form.title || !form.message) {
      toast.error("Title and message are required");
      return;
    }
    setLoading(true);
    try {
      switch (form.type) {
        case "deal":
          await newDealAdded(form.title, form.sector || "General", form.url || undefined);
          break;
        case "report":
          await newReportPublished(form.title, form.url || undefined);
          break;
        case "market":
          await marketAlertTriggered(form.title, form.message, form.url || undefined);
          break;
      }
      toast.success("Push notification sent to subscribers");
      setForm({ type: "deal", title: "", message: "", url: "", sector: "" });
    } catch (err) {
      toast.error("Failed to send notification. Check edge function logs.");
    } finally {
      setLoading(false);
    }
  };

  const typeConfig = {
    deal: { icon: Lightbulb, color: "text-purple-500", label: "Deal Alert" },
    report: { icon: FileText, color: "text-blue-500", label: "Report Alert" },
    market: { icon: TrendingUp, color: "text-amber-500", label: "Market Alert" },
  };

  const TypeIcon = typeConfig[form.type].icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Push Notification Centre</CardTitle>
              <CardDescription>
                Send targeted push notifications to subscribed users via OneSignal
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type selector */}
          <div className="space-y-2">
            <Label>Notification Type</Label>
            <div className="flex gap-2">
              {(["deal", "report", "market"] as const).map((type) => {
                const cfg = typeConfig[type];
                const Icon = cfg.icon;
                return (
                  <Button
                    key={type}
                    variant={form.type === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setForm((f) => ({ ...f, type }))}
                    className="gap-1.5"
                  >
                    <Icon className="h-4 w-4" />
                    {cfg.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder={
                  form.type === "deal" ? "e.g. UK Property Fund – 8% IRR"
                    : form.type === "report" ? "e.g. Q1 Market Outlook 2026"
                    : "e.g. FTSE 100 Breaks Resistance"
                }
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            {form.type === "deal" && (
              <div className="space-y-2">
                <Label>Sector</Label>
                <Select value={form.sector} onValueChange={(v) => setForm((f) => ({ ...f, sector: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {["UK Property", "Overseas Property", "Stocks", "Crypto", "Private Equity", "Commodities", "Bonds", "Funds & ETFs", "Startups", "M&A", "Infrastructure", "Other"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label>Message *</Label>
              <Textarea
                placeholder="Notification body text..."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Deep Link URL (optional)</Label>
              <Input
                placeholder="/finance/opportunities or full URL"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              />
            </div>
          </div>

          {/* Preview */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Preview</p>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                  <TypeIcon className={`h-5 w-5 ${typeConfig[form.type].color}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{form.title || "Notification title"}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{form.message || "Notification message..."}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Send */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Sends to users with <Badge variant="outline" className="text-xs">{typeConfig[form.type].label}</Badge> enabled
            </div>
            <Button onClick={handleSend} disabled={loading || !form.title || !form.message} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Notification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
