import { cn } from "@/lib/utils";
import { Briefcase, TrendingUp } from "lucide-react";
import type { AdminPlatform } from "./adminNavConfig";
import { platformMeta } from "./adminNavConfig";

interface PlatformSwitcherProps {
  platform: AdminPlatform;
  onChange: (p: AdminPlatform) => void;
  collapsed?: boolean;
}

const ICONS: Record<AdminPlatform, React.ElementType> = {
  finance: Briefcase,
  investor: TrendingUp,
};

export function PlatformSwitcher({ platform, onChange, collapsed }: PlatformSwitcherProps) {
  if (collapsed) {
    return (
      <div className="flex flex-col gap-1.5 px-1">
        {(["finance", "investor"] as AdminPlatform[]).map((p) => {
          const Icon = ICONS[p];
          const active = platform === p;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              title={platformMeta[p].label}
              className={cn(
                "h-10 w-full rounded-lg flex items-center justify-center transition-all",
                active
                  ? `bg-gradient-to-br ${platformMeta[p].gradient} text-white shadow-md`
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
      {(["finance", "investor"] as AdminPlatform[]).map((p) => {
        const Icon = ICONS[p];
        const active = platform === p;
        const meta = platformMeta[p];
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200",
              active
                ? `bg-gradient-to-br ${meta.gradient} text-white shadow-md ring-1 ring-white/20`
                : "text-slate-600 hover:bg-white/70"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="leading-tight">{p === "finance" ? "Finance" : "Investor"}</span>
          </button>
        );
      })}
    </div>
  );
}
