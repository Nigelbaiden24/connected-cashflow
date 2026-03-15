import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  first_name: string;
}

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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user || !mounted) return;

        const user = session.user;

        // Try to fetch existing profile
        const { data, error } = await supabase
          .from("user_profiles")
          .select("full_name, email, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!mounted) return;

        // If no profile row exists, create one from auth metadata
        if (!data && !error) {
          const metaName = user.user_metadata?.full_name || "";
          await supabase.from("user_profiles").upsert({
            user_id: user.id,
            email: user.email || "",
            full_name: metaName || user.email || "",
          }, { onConflict: "user_id" });

          if (!mounted) return;

          const firstName = metaName.split(" ")[0] || "";
          setProfile({
            full_name: metaName || null,
            email: user.email || null,
            avatar_url: null,
            first_name: firstName,
          });
        } else if (data) {
          const fullName = data.full_name || user.user_metadata?.full_name || "";
          const firstName = fullName.split(" ")[0] || "";

          setProfile({
            full_name: fullName || null,
            email: data.email || user.email || null,
            avatar_url: data.avatar_url || null,
            first_name: firstName,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && mounted) {
        // Re-fetch profile on auth change
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
