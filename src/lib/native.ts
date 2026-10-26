import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { supabase } from "@/integrations/supabase/client";

export const isNativeApp = Capacitor.isNativePlatform();

// Public website origin. Inside the native app window.location.origin is
// https://localhost, which must never be sent out in emails or OAuth links.
export const PUBLIC_SITE_URL = (import.meta.env.VITE_PUBLIC_SITE_URL || "https://flowpulse.co.uk").replace(/\/$/, "");

const APP_SCHEME = "uk.co.flowpulse.app";

/** Origin to use for auth email links (confirm signup, password reset, magic links). */
export const getAuthRedirectOrigin = () => (isNativeApp ? PUBLIC_SITE_URL : window.location.origin);

/** Light haptic tick for taps on app chrome (tabs, toggles). No-op on the web. */
export const tapFeedback = () => {
  if (isNativeApp) void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
};

/** Opens a URL outside the app (system browser / custom tab, or mail/phone apps). */
export const openExternal = async (url: string) => {
  if (/^https?:\/\//i.test(url)) {
    await Browser.open({ url });
  } else {
    // mailto:, tel:, etc. are handed to Android intents by the Capacitor WebView
    window.location.href = url;
  }
};

const navigateInApp = (path: string) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

// Handles uk.co.flowpulse.app://path and https://flowpulse.co.uk/path links opened into the app,
// including Supabase auth callbacks (?code=... or #access_token=...).
const handleDeepLink = async (rawUrl: string) => {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return;
  }

  const isAppScheme = url.protocol === `${APP_SCHEME}:`;
  if (!isAppScheme && url.origin !== PUBLIC_SITE_URL) return;

  await Browser.close().catch(() => undefined);

  const code = url.searchParams.get("code");
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    url.searchParams.delete("code");
  } else if (accessToken && refreshToken) {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  }

  // For custom-scheme links the "host" is the first path segment (uk.co.flowpulse.app://settings)
  const path = isAppScheme ? `/${url.host}${url.pathname}`.replace(/\/+$/, "") || "/" : url.pathname;
  navigateInApp(`${path}${url.search}`);
};

const closeOpenOverlay = () => {
  const overlay = document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [role="menu"][data-state="open"]');
  if (!overlay) return false;
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  return true;
};

/** Native-only setup. Safe to call on the web (does nothing). */
export const initNativeApp = () => {
  if (!isNativeApp) return;

  document.documentElement.classList.add("native-app");

  // The PWA service worker is not built for the mobile bundle; also clear any stale registration.
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });

  // Android WebView has no tabs: route external window.open calls to the system browser.
  const originalOpen = window.open.bind(window);
  window.open = ((url?: string | URL, target?: string, features?: string) => {
    const href = url ? new URL(String(url), window.location.href).href : "";
    if (href && new URL(href).origin !== window.location.origin) {
      void openExternal(href);
      return { closed: false, close: () => void Browser.close() } as unknown as Window;
    }
    return originalOpen(url, target, features);
  }) as typeof window.open;

  App.addListener("backButton", ({ canGoBack }) => {
    if (closeOpenOverlay()) return;
    if (canGoBack) window.history.back();
    else void App.exitApp();
  });

  App.addListener("appUrlOpen", ({ url }) => void handleDeepLink(url));
};
