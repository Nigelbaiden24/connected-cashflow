import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { useEffect } from "react";
import type { AdminPlatform } from "./adminNavConfig";
import { platformMeta } from "./adminNavConfig";

interface PlatformSwitcherProps {
  platform: AdminPlatform;
  onChange: (p: AdminPlatform) => void;
  collapsed?: boolean;
}

// NOTE: FlowPulse Finance is temporarily hidden from view across the admin.
// All platform code and data remain on disk for future resurrection — this
// switcher simply forces the Investor platform.
export function PlatformSwitcher({ platform, onChange, collapsed }: PlatformSwitcherProps) {
  // Force investor whenever this mounts or the parent thinks it is something else.
  useEffect(() => {
    if (platform !== "investor") {
      onChange("investor");
    }
  }, [platform, onChange]);

  const meta = platformMeta.investor;

  if (collapsed) {
    return (
      <div className="flex flex-col gap-1.5 px-1">
        <div
          title="FlowPulse Investor"
          className={cn(
            "h-10 w-full rounded-lg flex items-center justify-center",
            `bg-gradient-to-br ${meta.gradient} text-white shadow-md`
          )}
        >
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
      <div
        className={cn(
          "relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-xs font-semibold",
          `bg-gradient-to-br ${meta.gradient} text-white shadow-md ring-1 ring-white/20`
        )}
      >
        <TrendingUp className="h-4 w-4" />
        <span className="leading-tight">Investor</span>
      </div>
    </div>
  );
}
