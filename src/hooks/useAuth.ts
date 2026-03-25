import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "manager" | "analyst" | "viewer" | "client" | "hr_admin" | "payroll_admin";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  mfaEnabled: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
    mfaEnabled: false,
  });

  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase.rpc("get_user_role", { _user_id: userId });
      return (data as UserRole) || null;
    } catch {
      return null;
    }
  }, []);

  const checkMfaStatus = useCallback(async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const totpFactors = data?.totp || [];
      return totpFactors.some((f) => f.status === "verified");
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session?.user) {
        const [role, mfaEnabled] = await Promise.all([
          fetchRole(session.user.id),
          checkMfaStatus(),
        ]);
        if (mounted) {
          setState({ user: session.user, session, role, loading: false, mfaEnabled });
        }
      } else {
        setState({ user: null, session: null, role: null, loading: false, mfaEnabled: false });
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const [role, mfaEnabled] = await Promise.all([
          fetchRole(session.user.id),
          checkMfaStatus(),
        ]);
        if (mounted) {
          setState({ user: session.user, session, role, loading: false, mfaEnabled });
        }
      } else {
        setState({ user: null, session: null, role: null, loading: false, mfaEnabled: false });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRole, checkMfaStatus]);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!state.role) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(state.role);
    },
    [state.role]
  );

  const isAdmin = state.role === "admin";
  const isAnalyst = state.role === "analyst";
  const isClient = state.role === "client";

  return { ...state, hasRole, isAdmin, isAnalyst, isClient };
}
