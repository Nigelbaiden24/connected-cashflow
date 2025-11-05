import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Moon, Sun, Monitor } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const accentColors = [
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
  { name: "Red", value: "red", class: "bg-red-500" },
];

export const AppearanceSettings = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [accentColor, setAccentColor] = useState("blue");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from("user_settings")
        .select("dark_mode, compact_view, accent_color")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setDarkMode(data.dark_mode);
        setCompactView(data.compact_view);
        setAccentColor(data.accent_color || "blue");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          [key]: value,
        });

      if (error) throw error;

      toast.success("Appearance updated");
    } catch (error) {
      console.error("Error updating setting:", error);
      toast.error("Failed to update appearance");
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    updateSetting("dark_mode", checked);
  };

  const handleCompactViewToggle = (checked: boolean) => {
    setCompactView(checked);
    updateSetting("compact_view", checked);
  };

  const handleAccentColorChange = (value: string) => {
    setAccentColor(value);
    updateSetting("accent_color", value);
  };

  const resetToDefaults = async () => {
    setDarkMode(false);
    setCompactView(false);
    setAccentColor("blue");
    document.documentElement.classList.remove("dark");
    
    if (userId) {
      await updateSetting("dark_mode", false);
      await updateSetting("compact_view", false);
      await updateSetting("accent_color", "blue");
    }
    
    toast.success("Reset to default appearance");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Theme</CardTitle>
          </div>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <Label>Dark Mode</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Toggle dark mode theme
              </p>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact View</Label>
              <p className="text-sm text-muted-foreground">
                Use compact spacing in lists and tables
              </p>
            </div>
            <Switch
              checked={compactView}
              onCheckedChange={handleCompactViewToggle}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accent Color</CardTitle>
          <CardDescription>Choose your preferred accent color</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={accentColor} onValueChange={handleAccentColorChange}>
            <div className="grid grid-cols-5 gap-4">
              {accentColors.map((color) => (
                <div key={color.value} className="flex flex-col items-center gap-2">
                  <RadioGroupItem
                    value={color.value}
                    id={color.value}
                    className="sr-only"
                  />
                  <label
                    htmlFor={color.value}
                    className="cursor-pointer"
                  >
                    <div
                      className={`h-12 w-12 rounded-full ${color.class} ${
                        accentColor === color.value
                          ? "ring-4 ring-offset-2 ring-primary"
                          : "hover:ring-2 ring-offset-2 ring-primary/50"
                      }`}
                    />
                    <p className="text-xs text-center mt-2">{color.name}</p>
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
          <CardDescription>Customize your viewing experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <Label>Font Size</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Adjust the base font size for better readability
              </p>
            </div>
            <div className="text-sm text-muted-foreground">Coming soon</div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Your preferences are automatically saved and synced across devices.
            </div>
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};