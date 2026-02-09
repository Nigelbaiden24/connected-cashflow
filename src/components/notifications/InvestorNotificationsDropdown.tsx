import { useInvestorAlerts } from "@/hooks/useNotifications";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useMemo } from "react";

interface InvestorNotificationsDropdownProps {
  variant?: "default" | "investor";
  className?: string;
}

export function InvestorNotificationsDropdown({ 
  variant = "investor",
  className 
}: InvestorNotificationsDropdownProps) {
  const { alerts, unreadCount, markAsRead, markAllAsRead } = useInvestorAlerts();

  // Transform alerts to the notification format expected by the dropdown
  // The unreadCount from useInvestorAlerts already tracks which alerts are unread
  const notifications = useMemo(() => {
    // Create a set of the first N alert IDs as unread
    const unreadSet = new Set(alerts.slice(0, unreadCount).map(a => a.id));
    
    return alerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      message: alert.description,
      type: alert.alert_type,
      severity: alert.severity,
      isRead: !unreadSet.has(alert.id),
      createdAt: alert.created_at,
      actionUrl: alert.metadata?.action_url as string | undefined,
      entityType: alert.metadata?.entity_type as string | undefined,
    }));
  }, [alerts, unreadCount]);

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
