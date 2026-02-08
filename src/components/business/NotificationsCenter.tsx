import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications & Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
              )}
            </CardTitle>
            <CardDescription>Important updates and alerts</CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-2" />
              <p className="text-sm text-muted-foreground">All caught up! No new notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.notification_type);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      notification.is_read ? 'bg-background' : 'bg-muted/50 border-primary/20'
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${
                        notification.severity === 'critical' ? 'text-destructive' :
                        notification.severity === 'warning' ? 'text-yellow-600' :
                        'text-muted-foreground'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <Badge variant={getSeverityColor(notification.severity) as any} className="text-xs">
                            {notification.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
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
