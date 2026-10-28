// Native push notifications (iOS and Android) via OneSignal.
// The web keeps using the OneSignal web SDK (hooks/useOneSignal.ts); both
// address users by their Supabase user id, so the backend sends the same way.
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { isNativeApp } from "@/lib/native";

type OneSignalPlugin = typeof import("onesignal-cordova-plugin").default;

export type PushPermission = "granted" | "denied" | "prompt" | "unsupported";

let os: OneSignalPlugin | null = null;
let initPromise: Promise<OneSignalPlugin | null> | null = null;
let currentUser: string | null = null;
let pendingRoute: string | null = null;
const routeListeners = new Set<(route: string) => void>();
const foregroundListeners = new Set<(n: { title: string; body: string; route?: string }) => void>();

const platform = (): "ios" | "android" => (Capacitor.getPlatform() === "ios" ? "ios" : "android");

/** Only same-app paths are followed from a notification. */
function safeRoute(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
    const u = new URL(raw);
    if (/(^|\.)flowpulse\.co\.uk$/.test(u.hostname)) return `${u.pathname}${u.search}${u.hash}`;
  } catch { /* not a URL */ }
  return null;
}

function emitRoute(route: string) {
  if (routeListeners.size) routeListeners.forEach((l) => l(route));
  else pendingRoute = route; // cold start: the router subscribes after mounting
}

/** Subscribe to notification taps; returns an unsubscribe function. A tap that launched the app is delivered immediately. */
export function onNotificationRoute(listener: (route: string) => void) {
  routeListeners.add(listener);
  if (pendingRoute) { const r = pendingRoute; pendingRoute = null; listener(r); }
  return () => routeListeners.delete(listener);
}

export function onForegroundNotification(listener: (n: { title: string; body: string; route?: string }) => void) {
  foregroundListeners.add(listener);
  return () => foregroundListeners.delete(listener);
}

async function appId(): Promise<string | null> {
  const fromEnv = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;
  if (fromEnv) return fromEnv;
  const { data, error } = await supabase.functions.invoke("get-onesignal-config");
  if (error || !data?.appId) { console.warn("[push] OneSignal app id unavailable", error); return null; }
  return data.appId as string;
}

/** Initialises OneSignal once (native only). Safe to call repeatedly. */
export function initNativePush(): Promise<OneSignalPlugin | null> {
  if (!isNativeApp) return Promise.resolve(null);
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const id = await appId();
      if (!id) return null;
      const mod = (await import("onesignal-cordova-plugin")).default;
      mod.initialize(id);

      mod.Notifications.addEventListener("click", (event) => {
        const n = event.notification as any;
        const route = safeRoute(n?.additionalData?.route) ?? safeRoute(n?.launchURL) ?? safeRoute(event.result?.url);
        if (route) emitRoute(route);
      });

      // App open: show our own banner instead of the system one, so it never covers the screen.
      mod.Notifications.addEventListener("foregroundWillDisplay", (event) => {
        const n = event.getNotification() as any;
        if (foregroundListeners.size) {
          event.preventDefault();
          foregroundListeners.forEach((l) => l({ title: n?.title ?? "FlowPulse", body: n?.body ?? "", route: safeRoute(n?.additionalData?.route) ?? undefined }));
        } else {
          n?.display?.();
        }
      });

      // Token or opt-in changed (granted, refreshed, revoked): keep our device record current.
      mod.User.pushSubscription.addEventListener("change", () => { void syncDevice(); });
      os = mod;
      return mod;
    } catch (e) {
      console.warn("[push] init failed", e);
      initPromise = null;
      return null;
    }
  })();
  return initPromise;
}

/** Records this device against the signed-in user (upsert by OneSignal subscription id). */
export async function syncDevice(): Promise<void> {
  if (!os || !currentUser) return;
  try {
    const [subId, optedIn, onesignalId, granted] = await Promise.all([
      os.User.pushSubscription.getIdAsync(),
      os.User.pushSubscription.getOptedInAsync(),
      os.User.getOnesignalId(),
      os.Notifications.getPermissionAsync(),
    ]);
    if (!subId) return; // not registered with APNs/FCM yet; the change listener calls back later
    const db = supabase as any;
    await db.from("user_push_devices").upsert({
      user_id: currentUser,
      platform: platform(),
      subscription_id: subId,
      onesignal_id: onesignalId ?? null,
      push_enabled: optedIn,
      permission: granted ? "granted" : "denied",
      app_version: (import.meta.env.VITE_APP_VERSION as string | undefined) ?? null,
      device_label: `${platform() === "ios" ? "iPhone / iPad" : "Android"} app`,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "subscription_id" });
  } catch (e) {
    console.warn("[push] device sync failed", e);
  }
}

/** Ties this device to the user (call on sign-in and app start). */
export async function loginPush(userId: string) {
  const mod = await initNativePush();
  if (!mod) return;
  if (currentUser !== userId) mod.login(userId);
  currentUser = userId;
  await syncDevice();
}

/** Detaches the device on sign-out so the next user doesn't get the previous user's notifications. */
export async function logoutPush() {
  const mod = await initNativePush();
  if (!mod) return;
  const subId = await mod.User.pushSubscription.getIdAsync().catch(() => null);
  if (subId && currentUser) {
    await (supabase as any).from("user_push_devices").delete().eq("subscription_id", subId).then(() => {}, () => {});
  }
  mod.logout();
  currentUser = null;
}

export async function getPushPermission(): Promise<PushPermission> {
  const mod = await initNativePush();
  if (!mod) return "unsupported";
  const [granted, canAsk] = await Promise.all([mod.Notifications.getPermissionAsync(), mod.Notifications.canRequestPermission()]);
  return granted ? "granted" : canAsk ? "prompt" : "denied";
}

/** Shows the system prompt (or, if previously refused, offers the system settings). */
export async function requestPushPermission(): Promise<boolean> {
  const mod = await initNativePush();
  if (!mod) return false;
  const granted = await mod.Notifications.requestPermission(true);
  if (granted) mod.User.pushSubscription.optIn();
  await syncDevice();
  return granted;
}

/** Turns push on/off for this device without touching OS permission. */
export async function setDevicePush(enabled: boolean) {
  const mod = await initNativePush();
  if (!mod) return;
  if (enabled) mod.User.pushSubscription.optIn(); else mod.User.pushSubscription.optOut();
  await syncDevice();
}

export async function clearBadge() {
  const mod = await initNativePush();
  mod?.Notifications.clearAll();
}
