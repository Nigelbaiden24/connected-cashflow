import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, LayoutDashboard, LogOut } from "lucide-react";
import {
  filterNavByPlatform,
  platformMeta,
  type AdminPlatform,
} from "./adminNavConfig";
import { PlatformSwitcher } from "./PlatformSwitcher";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const STORAGE_KEY = "admin-platform";

export function AdminSidebar({ activeTab, onTabChange, onLogout }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [platform, setPlatform] = useState<AdminPlatform>(() => {
    if (typeof window === "undefined") return "finance";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "investor" ? "investor" : "finance";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, platform);
  }, [platform]);

  // If the active tab isn't visible under the current platform, do nothing —
  // user can switch platform manually. (We don't auto-switch tabs to avoid surprises.)

  const navItems = filterNavByPlatform(platform);
  const meta = platformMeta[platform];

  return (
    <div
      className={cn(
        "relative flex flex-col h-screen sticky top-0 border-r transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-white/95 via-white/90 to-slate-50/95",
        "backdrop-blur-xl border-slate-200/60",
        "shadow-[4px_0_24px_-2px_rgba(0,0,0,0.08)]",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="relative p-4 border-b border-slate-200/50">
        <div className={cn("absolute inset-0 bg-gradient-to-r opacity-10", meta.gradient)} />
        <div className="relative flex items-center gap-3 mb-3">
          <div className={cn(
            "p-2.5 rounded-xl bg-gradient-to-br shadow-lg ring-2 ring-white/50",
            meta.gradient
          )}>
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-slate-900 truncate">{meta.label}</h2>
              <p className="text-xs text-slate-500 truncate">{meta.tagline}</p>
            </div>
          )}
        </div>

        {/* Platform switcher */}
        <PlatformSwitcher platform={platform} onChange={setPlatform} collapsed={collapsed} />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  "group relative overflow-hidden",
                  isActive
                    ? cn(
                        "bg-gradient-to-r text-white shadow-lg ring-1 ring-white/20",
                        item.gradient
                      )
                    : "text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-slate-50/80 hover:shadow-sm hover:ring-1 hover:ring-slate-200/50"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
                )}

                <div className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-white/20 shadow-inner"
                    : "bg-slate-100/60 group-hover:bg-slate-200/60"
                )}>
                  <Icon className={cn(
                    "h-4 w-4",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
                  )} />
                </div>

                {!collapsed && <span className="relative truncate">{item.label}</span>}

                {isActive && !collapsed && (
                  <div className="absolute right-2 w-2 h-2 rounded-full bg-white/60 shadow-inner" />
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200/50">
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-50/80 to-transparent pointer-events-none" />
        <Button
          onClick={onLogout}
          variant="outline"
          className={cn(
            "relative w-full justify-start gap-3",
            "bg-white/80 hover:bg-red-50/80 text-red-600 border-red-200/50 hover:border-red-300",
            "shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-20 z-10 w-6 h-6 rounded-full",
          "bg-white border border-slate-200 shadow-md flex items-center justify-center",
          "hover:bg-slate-50 hover:border-slate-300 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/20"
        )}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5 text-slate-600" /> : <ChevronLeft className="h-3.5 w-3.5 text-slate-600" />}
      </button>
    </div>
  );
}
