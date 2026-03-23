import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}

interface OneSignalState {
  initialized: boolean;
  initializing: boolean;
  permissionStatus: "default" | "granted" | "denied";
  subscribed: boolean;
  configError: string | null;
}

const getBrowserPermissionStatus = (): OneSignalState["permissionStatus"] => {
  if (typeof window === "undefined" || !("Notification" in window)) return "default";

  if (window.Notification.permission === "granted") return "granted";
  if (window.Notification.permission === "denied") return "denied";
  return "default";
};

const normalizeOneSignalError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  if (message.toLowerCase().includes("app not configured for web push")) {
    return "Web push is not enabled for your OneSignal app yet.";
  }

  return message;
};

const defaultState: OneSignalState = {
  initialized: false,
  initializing: false,
  permissionStatus: "default",
  subscribed: false,
  configError: null,
};

let sharedState: OneSignalState = defaultState;
let initPromise: Promise<void> | null = null;
const listeners = new Set<(state: OneSignalState) => void>();

const emitState = (nextState: OneSignalState) => {
  sharedState = nextState;
  listeners.forEach((listener) => listener(sharedState));
};

const updateSharedState = (updater: OneSignalState | ((state: OneSignalState) => OneSignalState)) => {
  const nextState = typeof updater === "function" ? updater(sharedState) : updater;
  emitState(nextState);
};

const loadOneSignalScript = async () => {
  if (typeof window === "undefined") return;
  if (window.OneSignal?.init) return;

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-onesignal-sdk="true"]');

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load OneSignal SDK.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    script.defer = true;
    script.dataset.onesignalSdk = "true";
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error("Failed to load OneSignal SDK.")), { once: true });
    document.head.appendChild(script);
  });
};

const ensureOneSignalInitialized = async () => {
  if (typeof window === "undefined") return;
  if (sharedState.initialized || sharedState.initializing) return initPromise ?? Promise.resolve();

  initPromise = (async () => {
    updateSharedState((state) => ({
      ...state,
      initializing: true,
      configError: null,
      permissionStatus: getBrowserPermissionStatus(),
    }));

    try {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        updateSharedState((state) => ({
          ...state,
          initialized: true,
          initializing: false,
          configError: "This browser does not support web notifications.",
        }));
        return;
      }

      const { data, error } = await supabase.functions.invoke("get-onesignal-config");
      if (error || !data?.appId) {
        throw new Error("OneSignal app ID is unavailable.");
      }

      await loadOneSignalScript();

      const boot = async (OneSignal: any) => {
        await OneSignal.init({
          appId: data.appId,
          autoPrompt: false,
          autoRegister: false,
          notifyButton: { enable: false },
          serviceWorkerParam: { scope: "/" },
          serviceWorkerPath: "/OneSignalSDKWorker.js",
        });

        updateSharedState((state) => ({
          ...state,
          initialized: true,
          initializing: false,
          permissionStatus: getBrowserPermissionStatus(),
          subscribed: !!OneSignal.User?.PushSubscription?.optedIn,
          configError: null,
        }));

        OneSignal.Notifications?.addEventListener("permissionChange", (permission: boolean) => {
          updateSharedState((state) => ({
            ...state,
            permissionStatus: permission ? "granted" : getBrowserPermissionStatus(),
          }));
        });

        OneSignal.User?.PushSubscription?.addEventListener?.("change", (event: { current?: { optedIn?: boolean } }) => {
          updateSharedState((state) => ({
            ...state,
            subscribed: !!event?.current?.optedIn,
          }));
        });
      };

      if (window.OneSignal?.init) {
        await boot(window.OneSignal);
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error("OneSignal SDK timed out during initialization.")), 10000);

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          try {
            await boot(OneSignal);
            window.clearTimeout(timeout);
            resolve();
          } catch (error) {
            window.clearTimeout(timeout);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error("OneSignal init error:", error);
      updateSharedState((state) => ({
        ...state,
        initialized: true,
        initializing: false,
        permissionStatus: getBrowserPermissionStatus(),
        subscribed: false,
        configError: normalizeOneSignalError(error),
      }));
    }
  })();

  return initPromise;
};

export function useOneSignal() {
  const [state, setState] = useState<OneSignalState>(sharedState);

  useEffect(() => {
    listeners.add(setState);
    void ensureOneSignalInitialized();

    return () => {
      listeners.delete(setState);
    };
  }, []);

  const promptForPermission = useCallback(async () => {
    try {
      await ensureOneSignalInitialized();

      if (sharedState.configError) return false;

      const OneSignal = window.OneSignal;
      if (!OneSignal) return false;

      await OneSignal.Notifications.requestPermission();
      const permissionStatus = getBrowserPermissionStatus();

      if (permissionStatus !== "granted") {
        updateSharedState((state) => ({
          ...state,
          permissionStatus,
          subscribed: false,
        }));
        return false;
      }

      await OneSignal.User.PushSubscription.optIn();

      updateSharedState((state) => ({
        ...state,
        permissionStatus: "granted",
        subscribed: !!OneSignal.User?.PushSubscription?.optedIn,
        configError: null,
      }));
      return true;
    } catch (error) {
      console.error("OneSignal permission error:", error);
      updateSharedState((state) => ({
        ...state,
        permissionStatus: getBrowserPermissionStatus(),
        configError: normalizeOneSignalError(error),
      }));
      return false;
    }
  }, []);

  const optOut = useCallback(async () => {
    try {
      await ensureOneSignalInitialized();

      const OneSignal = window.OneSignal;
      if (!OneSignal) return;
      await OneSignal.User.PushSubscription.optOut();
      updateSharedState((state) => ({ ...state, subscribed: false }));
    } catch (error) {
      console.error("OneSignal opt-out error:", error);
    }
  }, []);

  const setTags = useCallback(async (tags: Record<string, string>) => {
    try {
      await ensureOneSignalInitialized();

      const OneSignal = window.OneSignal;
      if (!OneSignal) return;
      for (const [key, value] of Object.entries(tags)) {
        await OneSignal.User.addTag(key, value);
      }
    } catch (error) {
      console.error("OneSignal tag error:", error);
    }
  }, []);

  const setExternalId = useCallback(async (userId: string) => {
    try {
      await ensureOneSignalInitialized();

      const OneSignal = window.OneSignal;
      if (!OneSignal) return;
      await OneSignal.login(userId);
    } catch (error) {
      console.error("OneSignal login error:", error);
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
