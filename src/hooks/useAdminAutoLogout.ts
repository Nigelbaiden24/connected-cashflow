import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseAdminAutoLogoutOptions {
  timeoutMinutes: number;
  enabled: boolean;
  warningMinutes?: number;
}

export function useAdminAutoLogout({ 
  timeoutMinutes, 
  enabled, 
  warningMinutes = 1 
}: UseAdminAutoLogoutOptions) {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.info("You have been logged out due to inactivity");
      navigate("/admin/login");
    } catch (error) {
      console.error("Error during auto-logout:", error);
    }
  }, [navigate]);

  const showWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      toast.warning(`You will be logged out in ${warningMinutes} minute(s) due to inactivity`, {
        duration: warningMinutes * 60 * 1000,
        id: "inactivity-warning",
      });
    }
  }, [warningMinutes]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Dismiss warning toast if shown
    toast.dismiss("inactivity-warning");

    if (enabled && timeoutMinutes > 0) {
      const timeoutMs = timeoutMinutes * 60 * 1000;
      const warningMs = Math.max(0, timeoutMs - warningMinutes * 60 * 1000);

      // Set warning timer
      if (warningMinutes > 0 && warningMs > 0) {
        warningRef.current = setTimeout(showWarning, warningMs);
      }

      // Set logout timer
      timeoutRef.current = setTimeout(handleLogout, timeoutMs);
    }
  }, [enabled, timeoutMinutes, warningMinutes, handleLogout, showWarning]);

  useEffect(() => {
    if (!enabled) return;

    // Activity events to track
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "focus",
    ];

    // Throttle reset to avoid excessive timer resets
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledReset = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
          resetTimer();
        }, 1000);
      }
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, throttledReset, true);
    });

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Check if we should have logged out while hidden
        const timeSinceActivity = Date.now() - lastActivityRef.current;
        const timeoutMs = timeoutMinutes * 60 * 1000;
        
        if (timeSinceActivity >= timeoutMs) {
          handleLogout();
        } else {
          resetTimer();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledReset, true);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [enabled, timeoutMinutes, resetTimer, handleLogout]);

  return { resetTimer };
}
