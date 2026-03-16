import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  userName?: string;
  avatarUrl?: string;
  settingsPath?: string;
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
  userName,
  avatarUrl,
  settingsPath,
  onLogout,
  notificationCount = 0,
  className,
  showSearch = true,
  onSearchClick,
  rightContent,
  variant = "default",
}: MobileHeaderProps) {
  const navigate = useNavigate();

  const getUserInitials = (value: string) => {
    if (!value) return "U";

    return value
      .split("@")[0]
      .split(/[.\s_-]+/)
      .filter(Boolean)
      .map((part) => part[0])
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

  const displayName = userName || userEmail || "Account";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 md:hidden",
        "safe-area-top",
        getVariantStyles(),
        className
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 px-4">
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

          {userEmail && onLogout && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-9 w-9 touch-target", getTextColor())}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback
                      className={cn(
                        "text-xs",
                        variant === "default"
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/20 text-white"
                      )}
                    >
                      {getUserInitials(userName || userEmail)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback>{getUserInitials(userName || userEmail)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                {settingsPath && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(settingsPath)}>
                      <Settings className="mr-2 h-4 w-4" />
                      <TranslatedText>Settings</TranslatedText>
                    </DropdownMenuItem>
                  </>
                )}
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
