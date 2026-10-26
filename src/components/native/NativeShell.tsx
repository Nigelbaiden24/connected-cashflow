// App-only behaviour for the Android/iOS build. Everything here is inert on the
// website (isNativeApp is false there).
import { ReactNode, useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";
import { isNativeApp } from "@/lib/native";

const LAST_PATH_KEY = "fp-app-last-path";

/** Remembers the signed-in screen so the app reopens where the user left off. */
export function useRememberAppPath() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (!isNativeApp) return;
    try { localStorage.setItem(LAST_PATH_KEY, pathname + search); } catch { /* storage unavailable */ }
  }, [pathname, search]);
}

/**
 * The app's start screen. The website shows the marketing homepage at "/";
 * the app goes straight to the user's last screen, or to sign-in.
 */
export function NativeHome({ authLoading, isAuthenticated, fallback }: { authLoading: boolean; isAuthenticated: boolean; fallback: ReactNode }) {
  if (!isNativeApp) return <>{fallback}</>;
  if (authLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login-investor" replace />;
  let last = "";
  try { last = localStorage.getItem(LAST_PATH_KEY) ?? ""; } catch { /* storage unavailable */ }
  const target = /^\/(investor|finance|dashboard|clients|financial-planning|calendar|settings|compliance)/.test(last) ? last : "/investor/dashboard";
  return <Navigate to={target} replace />;
}

/** Thin banner while the device is offline (website and app). */
export function OfflineBanner() {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (online) return null;
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-amber-500 px-3 py-1.5 text-xs font-medium text-amber-950" style={{ paddingTop: "max(0.375rem, env(safe-area-inset-top))" }}>
      <WifiOff className="h-3.5 w-3.5" /> You're offline — showing what's already loaded.
    </div>
  );
}

const PULL_THRESHOLD = 72;

/**
 * Pull-to-refresh for the app. Re-mounts the current screen (so its data
 * loads again) and refreshes cached queries. On the website it renders the
 * children untouched.
 */
export function PullToRefresh({ children }: { children: (refreshKey: number) => ReactNode }) {
  const queryClient = useQueryClient();
  const [key, setKey] = useState(0);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  if (!isNativeApp) return <>{children(0)}</>;

  const scrollTop = () => {
    // The scrolling element differs per layout (window or an inner container).
    let el: HTMLElement | null = ref.current;
    while (el) {
      if (el.scrollTop > 0) return el.scrollTop;
      el = el.parentElement;
    }
    return window.scrollY;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (refreshing || scrollTop() > 0) { startY.current = null; return; }
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const d = e.touches[0].clientY - startY.current;
    setPull(d > 0 ? Math.min(110, d * 0.5) : 0);
  };
  const onTouchEnd = async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pull < PULL_THRESHOLD) { setPull(0); return; }
    setRefreshing(true);
    setPull(PULL_THRESHOLD);
    try {
      await queryClient.invalidateQueries();
      setKey((k) => k + 1);
    } finally {
      setTimeout(() => { setRefreshing(false); setPull(0); }, 400);
    }
  };

  return (
    <div ref={ref} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden text-muted-foreground transition-[height] duration-150"
        style={{ height: pull }}
        aria-hidden={pull === 0}
      >
        <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} style={{ transform: refreshing ? undefined : `rotate(${pull * 3}deg)`, opacity: Math.min(1, pull / PULL_THRESHOLD) }} />
      </div>
      {children(key)}
    </div>
  );
}
