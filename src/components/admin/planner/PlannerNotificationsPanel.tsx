import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Calendar, 
  ListTodo, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  X,
  Settings,
  Volume2,
  VolumeX,
  BellRing,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow, addDays, isPast, differenceInHours } from "date-fns";
import { toast } from "sonner";
import type { PlannerItem } from "./PlannerItemsTable";

interface PlannerNotification {
  id: string;
  type: 'task_due' | 'task_overdue' | 'calendar_reminder' | 'streak_alert' | 'goal_achieved';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  relatedItemId?: string;
}

interface PlannerNotificationsPanelProps {
  items: PlannerItem[];
  calendarEvents?: any[];
}

export function PlannerNotificationsPanel({ items, calendarEvents = [] }: PlannerNotificationsPanelProps) {
  const [notifications, setNotifications] = useState<PlannerNotification[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    taskReminders: true,
    calendarReminders: true,
    overdueAlerts: true,
    soundEnabled: false,
    dailyDigest: true,
  });

  const generateNotifications = useCallback(() => {
    const newNotifications: PlannerNotification[] = [];
    const now = new Date();

    // Check for tasks due today
    items.forEach((item) => {
      if (!item.target_date || item.status === 'completed') return;

      const dueDate = new Date(item.target_date);
      
      // Overdue tasks
      if (isPast(dueDate) && !isToday(dueDate)) {
        newNotifications.push({
          id: `overdue-${item.id}`,
          type: 'task_overdue',
          title: '⚠️ Overdue Task',
          message: `"${item.item_name}" was due ${format(dueDate, 'MMM d')}`,
          severity: 'critical',
          timestamp: now,
          read: false,
          relatedItemId: item.id,
        });
      }

      // Due today
      if (isToday(dueDate)) {
        const hoursUntilDue = differenceInHours(dueDate, now);
        newNotifications.push({
          id: `today-${item.id}`,
          type: 'task_due',
          title: '📋 Due Today',
          message: `"${item.item_name}" is due ${hoursUntilDue > 0 ? `in ${hoursUntilDue}h` : 'now'}`,
          severity: hoursUntilDue <= 2 ? 'warning' : 'info',
          timestamp: now,
          read: false,
          relatedItemId: item.id,
        });
      }

      // Due tomorrow
      if (isTomorrow(dueDate)) {
        newNotifications.push({
          id: `tomorrow-${item.id}`,
          type: 'task_due',
          title: '📅 Due Tomorrow',
          message: `"${item.item_name}" is due tomorrow`,
          severity: 'info',
          timestamp: now,
          read: false,
          relatedItemId: item.id,
        });
      }
    });

    // Sort by severity and timestamp
    newNotifications.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setNotifications(newNotifications);
  }, [items]);

  useEffect(() => {
    generateNotifications();
    
    // Refresh every 5 minutes
    const interval = setInterval(generateNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [generateNotifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.severity === 'critical').length;

  const getIcon = (type: PlannerNotification['type']) => {
    switch (type) {
      case 'task_overdue': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'task_due': return <ListTodo className="h-5 w-5 text-amber-500" />;
      case 'calendar_reminder': return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'streak_alert': return <Clock className="h-5 w-5 text-purple-500" />;
      case 'goal_achieved': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getSeverityStyles = (severity: PlannerNotification['severity'], read: boolean) => {
    if (read) return 'bg-muted/30 border-border';
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500/30';
      case 'warning': return 'bg-amber-500/10 border-amber-500/30';
      default: return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 rounded-xl bg-primary/10">
                <BellRing className="h-5 w-5 text-primary" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>
                {criticalCount > 0 ? (
                  <span className="text-red-500 font-medium">{criticalCount} urgent alerts</span>
                ) : (
                  'Task & calendar reminders'
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-4">
            <h4 className="font-medium text-sm">Notification Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Task Reminders</span>
                </div>
                <Switch
                  checked={settings.taskReminders}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, taskReminders: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Calendar Reminders</span>
                </div>
                <Switch
                  checked={settings.calendarReminders}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, calendarReminders: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Overdue Alerts</span>
                </div>
                <Switch
                  checked={settings.overdueAlerts}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, overdueAlerts: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Sound Notifications</span>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, soundEnabled: checked }))}
                />
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-green-500/10 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="font-medium text-lg">All caught up!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No pending notifications or alerts
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${getSeverityStyles(notification.severity, notification.read)}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium text-sm ${notification.read ? 'text-muted-foreground' : ''}`}>
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mr-2 -mt-1 opacity-0 group-hover:opacity-100 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className={`text-sm mt-1 ${notification.read ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={
                            notification.severity === 'critical' ? 'destructive' :
                            notification.severity === 'warning' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {notification.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(notification.timestamp, 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!notification.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-500 hover:text-red-600">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}