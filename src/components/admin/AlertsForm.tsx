import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Loader2, Upload } from "lucide-react";

interface AlertsFormProps {
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  uploading: boolean;
}

export function AlertsForm({ form, setForm, onSubmit, uploading }: AlertsFormProps) {
  const alertTypes = [
    { value: "price_surge", label: "Price Surge" },
    { value: "volume_spike", label: "Volume Spike" },
    { value: "insider_buying", label: "Insider Buying" },
    { value: "analyst_rating", label: "Analyst Rating" },
    { value: "filing", label: "SEC Filing" },
    { value: "macro", label: "Macro Economic" }
  ];

  const updateAlertData = (key: string, value: any) => {
    setForm({
      ...form,
      alertData: { ...form.alertData, [key]: value }
    });
  };

  return (
    <Card className="shadow-xl border-2 hover:shadow-2xl transition-shadow">
      <CardHeader className="bg-gradient-to-r from-accent/20 via-primary/10 to-secondary/20 border-b">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Create Investor Signal/Alert
        </CardTitle>
        <CardDescription>Create alerts that will appear in the Signals & Alerts tab</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="alert-type">Alert Type *</Label>
            <Select 
              value={form.alertType} 
              onValueChange={(value) => setForm({ ...form, alertType: value })}
            >
              <SelectTrigger id="alert-type">
                <SelectValue placeholder="Select alert type" />
              </SelectTrigger>
              <SelectContent>
                {alertTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alert-ticker">Ticker Symbol</Label>
              <Input
                id="alert-ticker"
                value={form.ticker}
                onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
                placeholder="e.g., AAPL, TSLA, NVDA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert-company">Company Name</Label>
              <Input
                id="alert-company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g., Apple Inc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alert-title">Alert Title *</Label>
            <Input
              id="alert-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Brief, attention-grabbing title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alert-description">Description *</Label>
            <Textarea
              id="alert-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of the alert"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alert-severity">Severity</Label>
            <Select 
              value={form.severity} 
              onValueChange={(value) => setForm({ ...form, severity: value })}
            >
              <SelectTrigger id="alert-severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type-specific fields */}
          {form.alertType === "price_surge" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Current Price</Label>
                <Input
                  value={form.alertData.price || ""}
                  onChange={(e) => updateAlertData("price", e.target.value)}
                  placeholder="$XXX.XX"
                />
              </div>
              <div className="space-y-2">
                <Label>Price Change</Label>
                <Input
                  value={form.alertData.change || ""}
                  onChange={(e) => updateAlertData("change", e.target.value)}
                  placeholder="+X.X%"
                />
              </div>
            </div>
          )}

          {form.alertType === "volume_spike" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Volume Increase</Label>
                <Input
                  value={form.alertData.volumeIncrease || ""}
                  onChange={(e) => updateAlertData("volumeIncrease", e.target.value)}
                  placeholder="+XXX%"
                />
              </div>
              <div className="space-y-2">
                <Label>Price Change</Label>
                <Input
                  value={form.alertData.priceChange || ""}
                  onChange={(e) => updateAlertData("priceChange", e.target.value)}
                  placeholder="+X.X%"
                />
              </div>
            </div>
          )}

          {form.alertType === "insider_buying" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Insider Name</Label>
                <Input
                  value={form.alertData.insider || ""}
                  onChange={(e) => updateAlertData("insider", e.target.value)}
                  placeholder="e.g., John Doe (CEO)"
                />
              </div>
              <div className="space-y-2">
                <Label>Transaction Value</Label>
                <Input
                  value={form.alertData.value || ""}
                  onChange={(e) => updateAlertData("value", e.target.value)}
                  placeholder="$XX.XM"
                />
              </div>
              <div className="space-y-2">
                <Label>Price at Purchase</Label>
                <Input
                  value={form.alertData.priceAtPurchase || ""}
                  onChange={(e) => updateAlertData("priceAtPurchase", e.target.value)}
                  placeholder="$XXX.XX"
                />
              </div>
            </div>
          )}

          {form.alertType === "analyst_rating" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Analyst/Firm</Label>
                <Input
                  value={form.alertData.analyst || ""}
                  onChange={(e) => updateAlertData("analyst", e.target.value)}
                  placeholder="e.g., Goldman Sachs"
                />
              </div>
              <div className="space-y-2">
                <Label>Price Target</Label>
                <Input
                  value={form.alertData.priceTarget || ""}
                  onChange={(e) => updateAlertData("priceTarget", e.target.value)}
                  placeholder="$XXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Current Price</Label>
                <Input
                  value={form.alertData.currentPrice || ""}
                  onChange={(e) => updateAlertData("currentPrice", e.target.value)}
                  placeholder="$XXX.XX"
                />
              </div>
              <div className="space-y-2">
                <Label>Upside/Downside</Label>
                <Input
                  value={form.alertData.upside || ""}
                  onChange={(e) => updateAlertData("upside", e.target.value)}
                  placeholder="+XX.X%"
                />
              </div>
            </div>
          )}

          {form.alertType === "filing" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Filing Type</Label>
                <Input
                  value={form.alertData.filingType || ""}
                  onChange={(e) => updateAlertData("filingType", e.target.value)}
                  placeholder="e.g., 8-K, 10-Q"
                />
              </div>
              <div className="space-y-2">
                <Label>Impact</Label>
                <Select 
                  value={form.alertData.impact || ""} 
                  onValueChange={(value) => updateAlertData("impact", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select impact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Positive">Positive</SelectItem>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                    <SelectItem value="Negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Market Reaction</Label>
                <Input
                  value={form.alertData.marketReaction || ""}
                  onChange={(e) => updateAlertData("marketReaction", e.target.value)}
                  placeholder="e.g., +3.2%"
                />
              </div>
            </div>
          )}

          {form.alertType === "macro" && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Impact</Label>
                <Textarea
                  value={form.alertData.impact || ""}
                  onChange={(e) => updateAlertData("impact", e.target.value)}
                  placeholder="Describe the market impact"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Market Reaction</Label>
                <Input
                  value={form.alertData.marketReaction || ""}
                  onChange={(e) => updateAlertData("marketReaction", e.target.value)}
                  placeholder="e.g., S&P 500 +1.8%, Nasdaq +2.3%"
                />
              </div>
            </div>
          )}

          <div className="space-y-2 p-4 bg-muted/20 rounded-lg">
            <Label>Send Notification Via (Optional)</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="notify-platform"
                  checked={form.sendVia.includes("platform")}
                  onCheckedChange={(checked) => {
                    setForm({
                      ...form,
                      sendVia: checked 
                        ? [...form.sendVia, "platform"]
                        : form.sendVia.filter((v: string) => v !== "platform")
                    });
                  }}
                />
                <Label htmlFor="notify-platform" className="font-normal cursor-pointer">
                  Platform Notification
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="notify-email"
                  checked={form.sendVia.includes("email")}
                  onCheckedChange={(checked) => {
                    setForm({
                      ...form,
                      sendVia: checked 
                        ? [...form.sendVia, "email"]
                        : form.sendVia.filter((v: string) => v !== "email")
                    });
                  }}
                />
                <Label htmlFor="notify-email" className="font-normal cursor-pointer">
                  Email Notification
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="notify-sms"
                  checked={form.sendVia.includes("sms")}
                  onCheckedChange={(checked) => {
                    setForm({
                      ...form,
                      sendVia: checked 
                        ? [...form.sendVia, "sms"]
                        : form.sendVia.filter((v: string) => v !== "sms")
                    });
                  }}
                />
                <Label htmlFor="notify-sms" className="font-normal cursor-pointer">
                  SMS Notification
                </Label>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Create Alert
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}