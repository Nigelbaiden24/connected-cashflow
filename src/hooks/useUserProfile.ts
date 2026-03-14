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
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("user_profiles")
          .select("full_name, email, avatar_url")
          .eq("user_id", user.id)
          .single();

        const fullName = data?.full_name || user.user_metadata?.full_name || "";
        const firstName = fullName.split(" ")[0] || "";

        setProfile({
          full_name: fullName,
          email: data?.email || user.email || null,
          avatar_url: data?.avatar_url || null,
          first_name: firstName,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading };
};
