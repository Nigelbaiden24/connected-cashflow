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
        
        const { data } = await supabase
          .from("user_profiles")
          .select("full_name, email, avatar_url")
          .eq("user_id", user.id)
          .single();

        if (!mounted) return;

        const fullName = data?.full_name || user.user_metadata?.full_name || "";
        const firstName = fullName.split(" ")[0] || "";

        setProfile({
          full_name: fullName || null,
          email: data?.email || user.email || null,
          avatar_url: data?.avatar_url || null,
          first_name: firstName,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && mounted) {
        const user = session.user;
        const fullName = user.user_metadata?.full_name || "";
        const firstName = fullName.split(" ")[0] || "";
        setProfile(prev => ({
          ...prev,
          full_name: prev.full_name || fullName || null,
          email: prev.email || user.email || null,
          first_name: prev.first_name || firstName,
        }));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { profile, loading };
};
