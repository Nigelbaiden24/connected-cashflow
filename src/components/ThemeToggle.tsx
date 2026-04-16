import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("fp-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("fp-theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((v) => !v)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground shadow-sm backdrop-blur transition-all hover:text-foreground hover:bg-accent hover:scale-105",
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
