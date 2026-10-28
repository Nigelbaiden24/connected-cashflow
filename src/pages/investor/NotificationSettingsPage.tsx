import { useCallback, useEffect, useState } from "react";
import { BellRing, CheckCircle2, Loader2, Send, Smartphone, Laptop, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { isNativeApp } from "@/lib/native";
import { getPushPermission, requestPushPermission, setDevicePush, syncDevice, type PushPermission } from "@/lib/nativePush";
import { PushNotificationSettings } from "@/components/notifications/PushNotificationSettings";

interface Prefs {
  push_enabled: boolean;
  research: boolean;
  deals: boolean;
  deal_categories: string[];
  portfolio: boolean;
  market: boolean;
  account: boolean;
}
interface Device { id: string; platform: "ios" | "android" | "web"; device_label: string | null; push_enabled: boolean; last_seen_at: string; subscription_id: string }

const DEFAULTS: Prefs = { push_enabled: true, research: true, deals: true, deal_categories: [], portfolio: true, market: false, account: true };

const TOPICS: Array<{ key: keyof Prefs; label: string; text: string }> = [
  { key: "research", label: "New research reports", text: "When the analyst desk publishes a new stock or crypto dossier." },
  { key: "deals", label: "New investment opportunities", text: "When a new deal is published in the categories you follow." },
  { key: "portfolio", label: "Portfolio review updates", text: "When your review is ready or your analyst replies." },
  { key: "market", label: "Market Pulse highlights", text: "Occasional alerts on big market moves and why they're happening." },
  { key: "account", label: "Account and subscription", text: "Important notices about your account and billing." },
];

const DEAL_CATEGORIES: Record<string, string> = {
  real_estate: "Real Estate", land: "Land", rent_to_rent: "Rent to Rent", rent_to_sa: "Rent to SA", commodities: "Commodities",
  alternatives: "Alternatives", esg: "ESG & Impact", fractional_pe_vc: "Fractional PE/VC", private_market_platforms: "Private Markets",
  capital_protected_notes: "Capital-Protected Notes", thematics_packaged: "Thematics", copy_trading: "Copy Trading", royalties: "Royalties",
  businesses: "Businesses", mini_bonds: "Mini Bonds", timepieces: "Timepieces", fine_wine: "Fine Wine", art: "Art", collectibles: "Collectibles",
  luxury_assets: "Luxury Assets", entertainment_finance: "Entertainment Finance", insurance_investments: "Insurance-Based", sports_investments: "Sports",
};

const db = supabase as any;

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [devices, setDevices] = useState<Device[]>([]);
  const [permission, setPermission] = useState<PushPermission>(isNativeApp ? "prompt" : "unsupported");
  const [loading, setLoading] = useState(true);
  const [notReady, setNotReady] = useState(false);
  const [testing, setTesting] = useState(false);
  const [thisDevice, setThisDevice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    if (isNativeApp) {
      setPermission(await getPushPermission());
      await syncDevice();
      const mod = (await import("onesignal-cordova-plugin")).default;
      setThisDevice(await mod.User.pushSubscription.getIdAsync().catch(() => null));
    }
    const [p, d] = await Promise.all([
      db.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      db.from("user_push_devices").select("id,platform,device_label,push_enabled,last_seen_at,subscription_id").eq("user_id", user.id).order("last_seen_at", { ascending: false }),
    ]);
    if (p.error && /does not exist|schema cache/i.test(p.error.message)) setNotReady(true);
    setPrefs({ ...DEFAULTS, ...(p.data ?? {}) });
    setDevices((d.data ?? []) as Device[]);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const save = async (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await db.from("notification_preferences").upsert({ user_id: user.id, ...next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) toast.error(notReady ? "Notification settings will be available shortly." : error.message);
    if (patch.push_enabled !== undefined && isNativeApp) await setDevicePush(patch.push_enabled);
  };

  const enableOnDevice = async () => {
    const granted = await requestPushPermission();
    setPermission(await getPushPermission());
    if (granted) { toast.success("Notifications are on for this device"); await save({ push_enabled: true }); await load(); }
    else toast.message("Notifications are off in your phone's settings for FlowPulse.");
  };

  const removeDevice = async (d: Device) => {
    const { error } = await db.from("user_push_devices").delete().eq("id", d.id);
    if (error) return toast.error(error.message);
    if (d.subscription_id === thisDevice) await setDevicePush(false);
    setDevices((xs) => xs.filter((x) => x.id !== d.id));
    toast.success("Device removed");
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("push-test", { body: {} });
      if (error) {
        const ctx = (error as any)?.context;
        const detail = ctx?.json ? await ctx.json().catch(() => null) : null;
        throw new Error(detail?.error || detail?.message || error.message);
      }
      if (data?.ok) toast.success(data.message ?? "Test notification sent");
      else toast.message(data?.message ?? "No device received the test");
    } catch (e) {
      toast.error((e as Error).message || "Couldn't send a test notification");
    } finally {
      setTesting(false);
    }
  };

  const toggleCategory = (key: string) => {
    const set = new Set(prefs.deal_categories);
    set.has(key) ? set.delete(key) : set.add(key);
    void save({ deal_categories: [...set] });
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight"><BellRing className="h-6 w-6 text-amber-500" /> Notifications</h1>
        <p className="mt-1 text-muted-foreground">Choose what FlowPulse tells you about, and on which devices.</p>
      </div>

      {notReady && (
        <p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" /> Notification settings are being set up and will save shortly.
        </p>
      )}

      {/* This device */}
      {isNativeApp ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">This device</CardTitle>
            <CardDescription>
              {permission === "granted" ? "Notifications are allowed for FlowPulse on this phone."
                : permission === "denied" ? "Notifications are blocked for FlowPulse in your phone's settings."
                : "Allow notifications so FlowPulse can reach you on this phone."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            {permission === "granted" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Allowed</span>
            ) : (
              <Button onClick={enableOnDevice}>{permission === "denied" ? "Open settings" : "Turn on notifications"}</Button>
            )}
            <Button variant="outline" onClick={sendTest} disabled={testing}>
              {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Send test notification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <PushNotificationSettings />
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <p className="text-sm text-muted-foreground">Check notifications reach your phone or browser.</p>
              <Button variant="outline" onClick={sendTest} disabled={testing}>
                {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Send test notification
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* What to notify */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Notify me about</CardTitle>
              <CardDescription>Applies to all your devices.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="push-all" className="text-sm">{prefs.push_enabled ? "On" : "Off"}</Label>
              <Switch id="push-all" checked={prefs.push_enabled} onCheckedChange={(v) => save({ push_enabled: v })} />
            </div>
          </div>
        </CardHeader>
        <CardContent className={`divide-y ${prefs.push_enabled ? "" : "pointer-events-none opacity-50"}`}>
          {TOPICS.map((t) => (
            <div key={t.key} className="py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={`t-${t.key}`} className="text-sm font-medium">{t.label}</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.text}</p>
                </div>
                <Switch id={`t-${t.key}`} checked={!!prefs[t.key]} onCheckedChange={(v) => save({ [t.key]: v } as Partial<Prefs>)} />
              </div>
              {t.key === "deals" && prefs.deals && (
                <div className="mt-3">
                  <p className="mb-2 text-xs text-muted-foreground">{prefs.deal_categories.length ? `Only these ${prefs.deal_categories.length} categories:` : "All categories. Pick some to narrow it down:"}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(DEAL_CATEGORIES).map(([k, label]) => {
                      const on = prefs.deal_categories.includes(k);
                      return (
                        <button key={k} onClick={() => toggleCategory(k)}
                          className={`rounded-full border px-2.5 py-1 text-xs transition ${on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Devices */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your devices</CardTitle>
          <CardDescription>Phones and browsers signed in to receive FlowPulse notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">No devices yet. Turn on notifications in the FlowPulse app or in your browser.</p>
          ) : (
            <div className="divide-y">
              {devices.map((d) => (
                <div key={d.id} className="flex items-center gap-3 py-3">
                  {d.platform === "web" ? <Laptop className="h-5 w-5 text-slate-400" /> : <Smartphone className="h-5 w-5 text-slate-400" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{d.device_label ?? d.platform}{d.subscription_id === thisDevice ? " · this device" : ""}</p>
                    <p className="text-xs text-muted-foreground">{d.push_enabled ? "Receiving notifications" : "Paused"} · last active {new Date(d.last_seen_at).toLocaleDateString("en-GB")}</p>
                  </div>
                  <Button size="icon" variant="ghost" aria-label="Remove device" onClick={() => removeDevice(d)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
