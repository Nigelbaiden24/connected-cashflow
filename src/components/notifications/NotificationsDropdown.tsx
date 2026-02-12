import { useState } from "react";
import { Bell, Check, CheckCheck, ExternalLink, Lightbulb, FileText, TrendingUp, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  severity?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  entityType?: string;
}

interface NotificationsDropdownProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  variant?: "default" | "investor" | "finance" | "business";
  className?: string;
}

const getNotificationIcon = (type: string, entityType?: string) => {
  if (entityType === "opportunity" || type === "deal_alert") {
    return <Lightbulb className="h-4 w-4 text-amber-500" />;
  }
  if (entityType === "report" || type === "new_report") {
    return <FileText className="h-4 w-4 text-blue-500" />;
  }
  if (type === "market_update") {
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  }
  if (type === "newsletter") {
    return <Mail className="h-4 w-4 text-purple-500" />;
  }
  return <Bell className="h-4 w-4 text-muted-foreground" />;
};

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case "critical":
      return "bg-destructive/10 border-destructive/30";
    case "warning":
      return "bg-yellow-500/10 border-yellow-500/30";
    default:
      return "bg-muted/50 border-border/50";
  }
};

export function NotificationsDropdown({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  variant = "default",
  className,
}: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      // Ensure finance platform notifications stay within finance context
      let url = notification.actionUrl;
      if (variant === "finance" || variant === "business") {
        url = url.replace(/^\/investor\//, "/finance/");
      } else if (variant === "investor") {
        url = url.replace(/^\/finance\//, "/investor/");
      }
      navigate(url);
      setOpen(false);
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case "investor":
        return "text-white hover:bg-white/10";
      case "finance":
        return "text-white hover:bg-white/10";
      case "business":
        return "text-white hover:bg-white/10";
      default:
        return "";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-9 w-9 relative touch-target", getButtonClass(), className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center animate-pulse"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications ({unreadCount} unread)</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 sm:w-96 p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications list */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-full bg-muted mb-3">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50",
                    !notification.isRead && "bg-primary/5",
                    getSeverityColor(notification.severity)
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 mt-0.5 p-2 rounded-full",
                    !notification.isRead ? "bg-primary/10" : "bg-muted"
                  )}>
                    {getNotificationIcon(notification.type, notification.entityType)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm line-clamp-1",
                        !notification.isRead ? "font-semibold" : "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {notification.actionUrl && (
                        <span className="text-xs text-primary flex items-center gap-0.5">
                          <ExternalLink className="h-3 w-3" />
                          View
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mark as read button */}
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full h-9 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  if (variant === "investor") {
                    navigate("/investor/alerts");
                  } else if (variant === "finance" || variant === "business") {
                    navigate("/finance/notifications");
                  } else {
                    navigate("/notifications");
                  }
                  setOpen(false);
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
