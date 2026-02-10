import { useInvestorAlerts } from "@/hooks/useNotifications";
import { NotificationsDropdown } from "./NotificationsDropdown";

interface InvestorNotificationsDropdownProps {
  variant?: "default" | "investor";
  className?: string;
}

export function InvestorNotificationsDropdown({ 
  variant = "investor",
  className 
}: InvestorNotificationsDropdownProps) {
  const { alerts, unreadCount, markAsRead, markAllAsRead, unreadIds } = useInvestorAlerts();

  const notifications = alerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    message: alert.description,
    type: alert.alert_type,
    severity: alert.severity,
    isRead: !unreadIds.has(alert.id),
    createdAt: alert.created_at,
    actionUrl: alert.metadata?.action_url as string | undefined,
    entityType: alert.metadata?.entity_type as string | undefined,
  }));

  return (
    <NotificationsDropdown
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      variant={variant}
      className={className}
    />
  );
}
