import { useBusinessNotifications } from "@/hooks/useNotifications";
import { NotificationsDropdown } from "./NotificationsDropdown";

interface FinanceNotificationsDropdownProps {
  variant?: "default" | "finance" | "business";
  className?: string;
}

export function FinanceNotificationsDropdown({ 
  variant = "finance",
  className 
}: FinanceNotificationsDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useBusinessNotifications();

  // Transform business notifications to the format expected by the dropdown
  const formattedNotifications = notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.notification_type,
    severity: notification.severity,
    isRead: notification.is_read,
    createdAt: notification.created_at,
    actionUrl: notification.action_url,
    entityType: notification.entity_type,
  }));

  return (
    <NotificationsDropdown
      notifications={formattedNotifications}
      unreadCount={unreadCount}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      variant={variant}
      className={className}
    />
  );
}
