import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { BellRing, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { isNativeApp } from "@/lib/native";
import {
  getPushPermission, initNativePush, loginPush, logoutPush, onForegroundNotification, onNotificationRoute,
  requestPushPermission, syncDevice,
} from "@/lib/nativePush";

/**
 * Connects native push to the app: signs the device in and out with the user,
 * opens the screen a tapped notification points to, shows notifications that
 * arrive while the app is open, and refreshes the device record on resume.
 * Renders nothing; mount once inside the router.
 */
export function PushBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativeApp) return;
    void initNativePush();

    const offRoute = onNotificationRoute((route) => navigate(route));
    const offForeground = onForegroundNotification((n) => {
      toast(n.title, {
        description: n.body,
        duration: 6000,
        ...(n.route ? { action: { label: "Open", onClick: () => navigate(n.route!) } } : {}),
      });
    });

    supabase.auth.getSession().then(({ data }) => { if (data.session?.user) void loginPush(data.session.user.id); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) void loginPush(session.user.id);
      if (event === "SIGNED_OUT") void logoutPush();
    });

    let resumeHandle: { remove: () => void } | null = null;
    CapApp.addListener("resume", () => { void syncDevice(); }).then((h) => { resumeHandle = h; });

    return () => { offRoute(); offForeground(); subscription.unsubscribe(); resumeHandle?.remove(); };
  }, [navigate]);

  return null;
}

const DISMISS_KEY = "fp_push_prompt_dismissed_at";
const REPROMPT_DAYS = 14;

/**
 * Explains notifications before the system dialog. Shown in the app once the
 * user is signed in and settled (not on the splash or sign-in screens), and at
 * most every two weeks if they choose "Not now".
 */
export function PushPermissionPrompt() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isNativeApp) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const last = Number(localStorage.getItem(DISMISS_KEY) || 0);
        if (Date.now() - last < REPROMPT_DAYS * 86_400_000) return;
      } catch { /* storage blocked */ }
      const { data } = await supabase.auth.getSession();
      if (!data.session || cancelled) return;
      if ((await getPushPermission()) === "prompt" && !cancelled) setOpen(true);
    }, 4000);
    return () => { cancelled = true; clearTimeout(t); };
  }, [location.pathname]);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
    setOpen(false);
  };

  const enable = async () => {
    setBusy(true);
    try {
      const granted = await requestPushPermission();
      await (supabase as any).from("notification_preferences").upsert({ prompted_at: new Date().toISOString(), push_enabled: granted }, { onConflict: "user_id" }).then(() => {}, () => {});
      toast[granted ? "success" : "message"](granted ? "Notifications are on" : "You can turn notifications on any time in Settings");
    } finally {
      setBusy(false);
      dismiss();
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/40 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="push-prompt-title">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
        <button onClick={dismiss} aria-label="Not now" className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.8)]">
          <BellRing className="h-6 w-6" />
        </div>
        <h2 id="push-prompt-title" className="mt-4 text-xl font-bold tracking-tight text-slate-900">Stay ahead of the market</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">Get a heads-up when something matters to you. You choose the topics, and can change them any time in Settings.</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {["New research reports from the analyst desk", "New deals in the categories you follow", "Your portfolio review and analyst replies"].map((t) => (
            <li key={t} className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />{t}</li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={enable} disabled={busy} className="h-11 rounded-xl bg-slate-900 font-semibold text-white hover:bg-slate-800">Turn on notifications</Button>
          <Button onClick={dismiss} variant="ghost" className="h-11 rounded-xl text-slate-500">Not now</Button>
        </div>
      </div>
    </div>
  );
}
