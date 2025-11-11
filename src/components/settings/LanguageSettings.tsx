import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Globe, Loader2 } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "tw", name: "Twi (Ghanaian)", nativeName: "Twi" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
  { code: "ig", name: "Igbo", nativeName: "Igbo" },
  { code: "ha", name: "Hausa", nativeName: "Hausa" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu" },
  { code: "xh", name: "Xhosa", nativeName: "isiXhosa" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ" },
  { code: "so", name: "Somali", nativeName: "Soomaali" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
];

export function LanguageSettings() {
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguage();
  }, []);

  const fetchLanguage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("language")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data?.language) {
        setLanguage(data.language);
      }
    } catch (error) {
      console.error("Error fetching language:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: user.id,
          language,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Language preference saved successfully");
      
      // Store language in localStorage for immediate UI updates
      localStorage.setItem("preferredLanguage", language);
    } catch (error: any) {
      console.error("Error saving language:", error);
      toast.error(error.message || "Failed to save language preference");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language
          </CardTitle>
          <CardDescription>
            Choose your preferred language
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Language
        </CardTitle>
        <CardDescription>
          Choose your preferred language for the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language">Display Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span>{lang.name}</span>
                    <span className="text-muted-foreground text-sm">({lang.nativeName})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Note: Full translation support is coming soon. Currently, this setting will prepare your account for automatic translation when available.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Language Preference"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
