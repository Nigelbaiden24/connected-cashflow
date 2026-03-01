import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, AlertCircle, CheckCircle, XCircle, FileText, Zap } from "lucide-react";
import { useBusinessNotifications } from "@/hooks/useNotifications";

export function NotificationsCenter() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useBusinessNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_overdue': return AlertCircle;
      case 'workflow_failed': return XCircle;
      case 'new_report': return FileText;
      case 'deal_alert': return Zap;
      default: return Bell;
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" onClick={markAllAsRead} className="text-xs">
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[380px] pr-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-10 w-10 text-emerald-500 mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.notification_type);
                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.is_read 
                        ? 'border-border bg-muted/10' 
                        : 'border-primary/20 bg-primary/5'
                    } hover:bg-muted/30`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className={`h-4 w-4 mt-0.5 ${
                        notification.severity === 'critical' ? 'text-destructive' :
                        notification.severity === 'warning' ? 'text-amber-500' :
                        'text-muted-foreground'
                      }`} />
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="font-medium text-sm text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground/60">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {notification.severity}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
