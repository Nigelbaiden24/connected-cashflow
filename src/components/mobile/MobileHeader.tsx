import { ReactNode } from "react";
import { Menu, Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TranslatedText } from "@/components/TranslatedText";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  userEmail?: string;
  onLogout?: () => void;
  notificationCount?: number;
  className?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
  rightContent?: ReactNode;
  variant?: "default" | "business" | "finance" | "investor";
}

export function MobileHeader({
  title,
  subtitle,
  userEmail = "",
  onLogout,
  notificationCount = 0,
  className,
  showSearch = true,
  onSearchClick,
  rightContent,
  variant = "default",
}: MobileHeaderProps) {
  const getUserInitials = (email: string) => {
    if (!email) return "U";
    return email
      .split("@")[0]
      .split(".")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "business":
        return "bg-gradient-to-r from-[hsl(142_76%_36%)] to-[hsl(142_70%_45%)]";
      case "finance":
        return "bg-gradient-to-r from-[hsl(221_83%_53%)] to-[hsl(217_91%_60%)]";
      case "investor":
        return "bg-gradient-to-r from-[hsl(270_75%_45%)] to-[hsl(270_75%_55%)]";
      default:
        return "bg-background border-b border-border";
    }
  };

  const getTextColor = () => {
    return variant === "default" ? "text-foreground" : "text-white";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 md:hidden",
        "safe-area-top",
        getVariantStyles(),
        className
      )}
    >
      {/* Main header row */}
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        {/* Left: Menu trigger and title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <SidebarTrigger className={cn("h-9 w-9 touch-target", getTextColor())}>
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <div className="flex flex-col min-w-0">
            <TranslatedText
              as="h1"
              className={cn("text-base font-semibold truncate", getTextColor())}
            >
              {title}
            </TranslatedText>
            {subtitle && (
              <span className={cn("text-xs truncate opacity-75", getTextColor())}>
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9 touch-target", getTextColor())}
              onClick={onSearchClick}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {rightContent}

          {/* Notifications - only show if no custom rightContent */}
          {!rightContent && (
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9 touch-target relative", getTextColor())}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
                >
                  {notificationCount > 99 ? "99+" : notificationCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          )}

          {/* User menu */}
          {userEmail && onLogout && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-9 w-9 touch-target", getTextColor())}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback
                      className={cn(
                        "text-xs",
                        variant === "default"
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/20 text-white"
                      )}
                    >
                      {getUserInitials(userEmail)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <TranslatedText>Sign Out</TranslatedText>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
