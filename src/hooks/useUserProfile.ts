import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  first_name: string;
}

const formatEmailFallbackName = (email?: string | null) => {
  if (!email) return "";

  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const resolveProfileValues = (
  user: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]["user"],
  data?: { full_name: string | null; email: string | null; avatar_url: string | null } | null,
) => {
  const metadata = user.user_metadata ?? {};
  const metadataFullName =
    (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    [metadata.first_name, metadata.last_name].filter(Boolean).join(" ").trim() ||
    "";

  const fullName = data?.full_name?.trim() || metadataFullName || formatEmailFallbackName(user.email) || null;
  const firstName =
    (typeof metadata.first_name === "string" && metadata.first_name.trim()) ||
    fullName?.split(/\s+/)[0] ||
    formatEmailFallbackName(user.email).split(" ")[0] ||
    "";

  return {
    full_name: fullName,
    email: data?.email || user.email || null,
    avatar_url:
      data?.avatar_url ||
      (typeof metadata.avatar_url === "string" ? metadata.avatar_url : null) ||
      null,
    first_name: firstName,
  } satisfies UserProfile;
};

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>({
    full_name: null,
    email: null,
    avatar_url: null,
    first_name: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (mounted) {
            setProfile({ full_name: null, email: null, avatar_url: null, first_name: "" });
            setLoading(false);
          }
          return;
        }

        const user = session.user;
        const { data, error } = await supabase
          .from("user_profiles")
          .select("full_name, email, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (!mounted) return;

        const resolvedProfile = resolveProfileValues(user, data);
        setProfile(resolvedProfile);

        const syncPayload = {
          user_id: user.id,
          ...(!data?.full_name && resolvedProfile.full_name ? { full_name: resolvedProfile.full_name } : {}),
          ...(!data?.email && resolvedProfile.email ? { email: resolvedProfile.email } : {}),
          ...(!data?.avatar_url && resolvedProfile.avatar_url ? { avatar_url: resolvedProfile.avatar_url } : {}),
        };

        if (Object.keys(syncPayload).length > 1) {
          await supabase.from("user_profiles").upsert(syncPayload, { onConflict: "user_id" });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && mounted) {
        loadProfile();
      } else if (!session && mounted) {
        setProfile({ full_name: null, email: null, avatar_url: null, first_name: "" });
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { profile, loading };
};
