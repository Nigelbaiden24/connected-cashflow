import { useBusinessNotifications, useInvestorAlerts } from "@/hooks/useNotifications";
import { NotificationsDropdown } from "./NotificationsDropdown";

interface FinanceNotificationsDropdownProps {
  variant?: "default" | "finance" | "business";
  className?: string;
}

export function FinanceNotificationsDropdown({ 
  variant = "finance",
  className 
}: FinanceNotificationsDropdownProps) {
  const { notifications: businessNotifications, unreadCount: businessUnread, markAsRead: markBusinessRead, markAllAsRead: markAllBusinessRead } = useBusinessNotifications();
  const { alerts, unreadCount: alertsUnread, unreadIds, markAsRead: markAlertRead, markAllAsRead: markAllAlertsRead } = useInvestorAlerts();

  // Combine business notifications and investor alerts into a single list
  const businessFormatted = businessNotifications.map((notification) => ({
    id: `biz-${notification.id}`,
    rawId: notification.id,
    source: "business" as const,
    title: notification.title,
    message: notification.message || "",
    type: notification.notification_type,
    severity: notification.severity,
    isRead: notification.is_read,
    createdAt: notification.created_at,
    actionUrl: notification.action_url,
    entityType: notification.entity_type,
  }));

  const alertsFormatted = alerts.map((alert) => ({
    id: `alert-${alert.id}`,
    rawId: alert.id,
    source: "alert" as const,
    title: alert.title,
    message: alert.description,
    type: alert.alert_type,
    severity: alert.severity,
    isRead: !unreadIds.has(alert.id),
    createdAt: alert.created_at,
    actionUrl: (alert.metadata as any)?.action_url as string | undefined,
    entityType: (alert.metadata as any)?.entity_type as string | undefined,
  }));

  // Merge and sort by date
  const allNotifications = [...businessFormatted, ...alertsFormatted]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalUnread = businessUnread + alertsUnread;

  const handleMarkAsRead = async (compositeId: string) => {
    const entry = allNotifications.find(n => n.id === compositeId);
    if (!entry) return;
    if (entry.source === "business") {
      await markBusinessRead(entry.rawId);
    } else {
      await markAlertRead(entry.rawId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await Promise.all([markAllBusinessRead(), markAllAlertsRead()]);
  };

  const formattedForDropdown = allNotifications.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    severity: n.severity,
    isRead: n.isRead,
    createdAt: n.createdAt,
    actionUrl: n.actionUrl,
    entityType: n.entityType,
  }));

  return (
    <NotificationsDropdown
      notifications={formattedForDropdown}
      unreadCount={totalUnread}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      variant={variant}
      className={className}
    />
  );
}
