import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";

interface ShowcaseDarkToggleProps {
  className?: string;
}

/**
 * Compact dark mode toggle for showcase tab pages.
 * Toggles the `dark` class on <html>.
 */
export function ShowcaseDarkToggle({ className }: ShowcaseDarkToggleProps) {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggle = useCallback(() => {
    const next = !isDark;
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setIsDark(next);
    window.dispatchEvent(new Event("darkmode-toggle"));
  }, [isDark]);

  // Sync if changed externally
  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"));
    window.addEventListener("darkmode-toggle", sync);
    return () => window.removeEventListener("darkmode-toggle", sync);
  }, []);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      className={cn(
        "h-9 w-9 rounded-full border-border/50 transition-all duration-300",
        isDark
          ? "bg-card hover:bg-accent border-primary/30 shadow-[0_0_8px_hsl(var(--primary)/0.3)]"
          : "bg-background hover:bg-muted",
        className
      )}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
}
