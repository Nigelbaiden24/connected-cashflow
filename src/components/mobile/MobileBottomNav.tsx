import { NavLink, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TranslatedText } from "@/components/TranslatedText";

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface MobileBottomNavProps {
  items: NavItem[];
  className?: string;
  variant?: "default" | "business" | "finance" | "investor";
}

export function MobileBottomNav({
  items,
  className,
  variant = "default",
}: MobileBottomNavProps) {
  const location = useLocation();

  const getActiveStyles = () => {
    switch (variant) {
      case "business":
        return "text-[hsl(142_76%_36%)]";
      case "finance":
        return "text-[hsl(221_83%_53%)]";
      case "investor":
        return "text-[hsl(270_75%_55%)]";
      default:
        return "text-primary";
    }
  };

  // Only show first 5 items
  const displayItems = items.slice(0, 5);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-background/95 backdrop-blur-xl border-t border-border",
        "safe-area-bottom",
        className
      )}
    >
      <div className="flex items-center justify-around h-16">
        {displayItems.map((item) => {
          const isActive = location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1",
                "h-full px-1 touch-target",
                "transition-colors duration-200",
                isActive ? getActiveStyles() : "text-muted-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium truncate max-w-[60px]",
                  isActive && "font-semibold"
                )}
              >
                <TranslatedText>{item.label}</TranslatedText>
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
