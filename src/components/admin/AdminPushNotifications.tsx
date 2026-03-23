import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send, Bell, Users, Lightbulb, FileText, TrendingUp,
  Loader2, User, Search, History, CheckCircle2, XCircle,
  UserCheck, Globe, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendPushNotification } from "@/hooks/usePushNotificationTriggers";
import { format } from "date-fns";

interface UserProfile {
  user_id: string;
  email: string;
  full_name: string | null;
}

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  target_type: string;
  recipients_count: number;
  created_at: string;
  target_user_ids: string[] | null;
}

type TargetMode = "all" | "individual" | "segment";
type NotificationType = "deal" | "report" | "market" | "custom";

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; label: string }> = {
  deal: { icon: Lightbulb, color: "text-purple-500", label: "Deal Alert" },
  report: { icon: FileText, color: "text-blue-500", label: "Report Alert" },
  market: { icon: TrendingUp, color: "text-amber-500", label: "Market Alert" },
  custom: { icon: Bell, color: "text-primary", label: "Custom" },
};

export function AdminPushNotifications() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [targetMode, setTargetMode] = useState<TargetMode>("all");
  const [form, setForm] = useState({
    type: "deal" as NotificationType,
    title: "",
    message: "",
    url: "",
    sector: "",
    schedule: "",
  });

  // Load users and logs in parallel
  useEffect(() => {
    const loadData = async () => {
      setLogsLoading(true);
      const [usersRes, logsRes] = await Promise.all([
        supabase.from("user_profiles").select("user_id, email, full_name").order("email"),
        supabase.from("push_notification_logs").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      if (usersRes.data) setUsers(usersRes.data);
      if (logsRes.data) setLogs(logsRes.data as unknown as NotificationLog[]);
      setLogsLoading(false);
    };
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.user_id));
    }
  };

  const handleSend = async () => {
    if (!form.title || !form.message) {
      toast.error("Title and message are required");
      return;
    }
    if (targetMode === "individual" && selectedUserIds.length === 0) {
      toast.error("Select at least one user");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.type === "market" ? `⚡ ${form.title}` : form.type === "deal" ? `🔔 ${form.title}` : form.type === "report" ? `📊 ${form.title}` : form.title,
        message: form.message,
        notification_type: form.type,
        ...(form.url && { url: form.url }),
        ...(form.schedule && { schedule: form.schedule }),
      };

      if (targetMode === "individual") {
        payload.target_user_ids = selectedUserIds;
      } else if (targetMode === "segment") {
        const tagMap: Record<string, string> = {
          deal: "push_deals",
          report: "push_reports",
          market: "push_market_alerts",
          custom: "push_deals",
        };
        payload.filters = [
          { field: "tag", key: tagMap[form.type], value: "true", relation: "=" },
        ];
      }
      // "all" = no filters, sends to all subscribed

      await sendPushNotification(payload as any);
      toast.success(
        targetMode === "individual"
          ? `Notification sent to ${selectedUserIds.length} user(s)`
          : "Notification sent to subscribers"
      );
      setForm({ type: "deal", title: "", message: "", url: "", sector: "", schedule: "" });
      setSelectedUserIds([]);

      // Refresh logs
      const { data } = await supabase
        .from("push_notification_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setLogs(data as unknown as NotificationLog[]);
    } catch (err) {
      toast.error("Failed to send notification. Check edge function logs.");
    } finally {
      setLoading(false);
    }
  };

  const TypeIcon = typeConfig[form.type].icon;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose" className="gap-1.5">
            <Send className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6 mt-4">
          {/* Compose Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Push Notification Centre</CardTitle>
                  <CardDescription>
                    Send targeted push notifications to all subscribers or individual users
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Mode */}
              <div className="space-y-2">
                <Label>Send To</Label>
                <div className="flex gap-2 flex-wrap">
                  {([
                    { id: "all" as const, label: "All Subscribers", icon: Globe },
                    { id: "segment" as const, label: "By Preference", icon: Users },
                    { id: "individual" as const, label: "Individual Users", icon: UserCheck },
                  ]).map((mode) => (
                    <Button
                      key={mode.id}
                      variant={targetMode === mode.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTargetMode(mode.id)}
                      className="gap-1.5"
                    >
                      <mode.icon className="h-4 w-4" />
                      {mode.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Individual User Picker */}
              {targetMode === "individual" && (
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Select Recipients ({selectedUserIds.length} selected)
                      </Label>
                      <Button variant="ghost" size="sm" onClick={selectAll}>
                        {selectedUserIds.length === filteredUsers.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <ScrollArea className="h-[240px]">
                      <div className="space-y-1">
                        {filteredUsers.map((user) => {
                          const selected = selectedUserIds.includes(user.user_id);
                          const initials = (user.full_name || user.email)
                            .split(/[\s@._-]+/)
                            .filter(Boolean)
                            .map((p) => p[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2);
                          return (
                            <div
                              key={user.user_id}
                              className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                                selected ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted"
                              }`}
                              onClick={() => toggleUser(user.user_id)}
                            >
                              <Checkbox checked={selected} className="pointer-events-none" />
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {user.full_name || "—"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.email}
                                </p>
                              </div>
                              {selected && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
                            </div>
                          );
                        })}
                        {filteredUsers.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-6">No users found</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Notification Type */}
              <div className="space-y-2">
                <Label>Notification Type</Label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(typeConfig) as NotificationType[]).map((type) => {
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

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder={
                      form.type === "deal"
                        ? "e.g. UK Property Fund – 8% IRR"
                        : form.type === "report"
                        ? "e.g. Q1 Market Outlook 2026"
                        : form.type === "market"
                        ? "e.g. FTSE 100 Breaks Resistance"
                        : "e.g. Platform Update"
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
                        {[
                          "UK Property", "Overseas Property", "Stocks", "Crypto",
                          "Private Equity", "Commodities", "Bonds", "Funds & ETFs",
                          "Startups", "M&A", "Infrastructure", "Timepieces", "Other",
                        ].map((s) => (
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

                <div className="space-y-2">
                  <Label>Deep Link URL (optional)</Label>
                  <Input
                    placeholder="/finance/opportunities or full URL"
                    value={form.url}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Schedule (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={form.schedule}
                    onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to send immediately</p>
                </div>
              </div>

              {/* Preview */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">
                    Preview
                  </p>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                      <TypeIcon className={`h-5 w-5 ${typeConfig[form.type].color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{form.title || "Notification title"}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {form.message || "Notification message..."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Send */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {targetMode === "individual" ? (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Sending to <Badge variant="outline" className="text-xs">{selectedUserIds.length} user(s)</Badge>
                    </>
                  ) : targetMode === "segment" ? (
                    <>
                      <Users className="h-4 w-4" />
                      Sending to users with <Badge variant="outline" className="text-xs">{typeConfig[form.type].label}</Badge> enabled
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4" />
                      Sending to <Badge variant="outline" className="text-xs">All Subscribers</Badge>
                    </>
                  )}
                  {form.schedule && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      Scheduled
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={handleSend}
                  disabled={loading || !form.title || !form.message || (targetMode === "individual" && selectedUserIds.length === 0)}
                  className="gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {form.schedule ? "Schedule Notification" : "Send Notification"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Notification History</CardTitle>
                  <CardDescription>Recent push notifications sent from this dashboard</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No notifications sent yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm truncate max-w-[200px]">{log.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{log.message}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {log.notification_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={log.target_type === "individual" ? "default" : "secondary"}
                            className="text-xs capitalize"
                          >
                            {log.target_type === "individual"
                              ? `${log.target_user_ids?.length || 0} users`
                              : log.target_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.recipients_count}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "MMM d, HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
