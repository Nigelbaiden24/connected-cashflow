import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}

interface OneSignalState {
  initialized: boolean;
  permissionStatus: "default" | "granted" | "denied";
  subscribed: boolean;
}

export function useOneSignal() {
  const [state, setState] = useState<OneSignalState>({
    initialized: false,
    permissionStatus: "default",
    subscribed: false,
  });
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || typeof window === "undefined") return;
    initRef.current = true;

    const initOneSignal = async () => {
      try {
        // Fetch App ID from backend
        const { data, error } = await supabase.functions.invoke("get-onesignal-config");
        if (error || !data?.appId) {
          console.error("Failed to fetch OneSignal config:", error);
          setState((s) => ({ ...s, initialized: true }));
          return;
        }

        const appId = data.appId;

        // Load the SDK script
        if (!document.querySelector('script[src*="OneSignalSDK"]')) {
          const script = document.createElement("script");
          script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          try {
            await OneSignal.init({
              appId,
              autoPrompt: false,
              autoRegister: false,
              notifyButton: { enable: false },
              serviceWorkerParam: { scope: "/" },
              serviceWorkerPath: "/OneSignalSDKWorker.js",
            });

            const permission = OneSignal.Notifications?.permission ?? false;
            const subscribed = OneSignal.User?.PushSubscription?.optedIn ?? false;

            setState({
              initialized: true,
              permissionStatus: permission ? "granted" : "default",
              subscribed: !!subscribed,
            });

            OneSignal.Notifications?.addEventListener("permissionChange", (perm: boolean) => {
              setState((s) => ({
                ...s,
                permissionStatus: perm ? "granted" : "denied",
              }));
            });
          } catch (err) {
            console.error("OneSignal init error:", err);
            setState((s) => ({ ...s, initialized: true }));
          }
        });
      } catch (err) {
        console.error("OneSignal setup error:", err);
        setState((s) => ({ ...s, initialized: true }));
      }
    };

    initOneSignal();
  }, []);

  const promptForPermission = useCallback(async () => {
    try {
      const OneSignal = window.OneSignal;
      if (!OneSignal) return false;

      await OneSignal.Notifications.requestPermission();
      await OneSignal.User.PushSubscription.optIn();

      const granted = OneSignal.Notifications.permission;
      setState((s) => ({
        ...s,
        permissionStatus: granted ? "granted" : "denied",
        subscribed: granted,
      }));
      return granted;
    } catch (err) {
      console.error("OneSignal permission error:", err);
      return false;
    }
  }, []);

  const optOut = useCallback(async () => {
    try {
      const OneSignal = window.OneSignal;
      if (!OneSignal) return;
      await OneSignal.User.PushSubscription.optOut();
      setState((s) => ({ ...s, subscribed: false }));
    } catch (err) {
      console.error("OneSignal opt-out error:", err);
    }
  }, []);

  const setTags = useCallback(async (tags: Record<string, string>) => {
    try {
      const OneSignal = window.OneSignal;
      if (!OneSignal) return;
      for (const [key, value] of Object.entries(tags)) {
        await OneSignal.User.addTag(key, value);
      }
    } catch (err) {
      console.error("OneSignal tag error:", err);
    }
  }, []);

  const setExternalId = useCallback(async (userId: string) => {
    try {
      const OneSignal = window.OneSignal;
      if (!OneSignal) return;
      await OneSignal.login(userId);
    } catch (err) {
      console.error("OneSignal login error:", err);
    }
  }, []);

  return {
    ...state,
    promptForPermission,
    optOut,
    setTags,
    setExternalId,
  };
}
