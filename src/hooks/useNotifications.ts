import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  severity: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  entity_type?: string;
  entity_id?: string;
}

interface InvestorAlert {
  id: string;
  alert_type: string;
  title: string;
  description: string;
  severity: string;
  created_at: string;
  metadata?: any;
}

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface UseInvestorAlertsResult {
  alerts: InvestorAlert[];
  unreadCount: number;
  unreadIds: Set<string>;
  loading: boolean;
  markAsRead: (alertId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for Finance/Business platform notifications
 */
export function useBusinessNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('business_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching business notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase
        .from('business_notifications')
        .update({ is_read: true })
        .eq('id', id);

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('business_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime updates
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const channel = supabase
        .channel('business-notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'business_notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        })
        .subscribe();

      return channel;
    };

    let channel: any;
    setupSubscription().then(ch => { channel = ch; });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}

/**
 * Hook for Investor platform alerts/notifications
 */
export function useInvestorAlerts(): UseInvestorAlertsResult {
  const [alerts, setAlerts] = useState<InvestorAlert[]>([]);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('investor_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);

      // Fetch read status for this user
      if (user) {
        const { data: readData } = await supabase
          .from('investor_alert_notifications')
          .select('alert_id, is_read')
          .eq('user_id', user.id);

        const unread = new Set<string>();
        alertsData?.forEach(alert => {
          const notification = readData?.find(n => n.alert_id === alert.id);
          // If no notification record exists or is_read is false, it's unread
          if (!notification || !notification.is_read) {
            unread.add(alert.id);
          }
        });
        setUnreadIds(unread);
      }
    } catch (error) {
      console.error('Error fetching investor alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try update first (for existing records)
      const { data: updated, error: updateError } = await supabase
        .from('investor_alert_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('alert_id', alertId)
        .select();

      // If no row was updated, insert a new one
      if (!updateError && (!updated || updated.length === 0)) {
        await supabase
          .from('investor_alert_notifications')
          .upsert({
            user_id: user.id,
            alert_id: alertId,
            is_read: true,
            read_at: new Date().toISOString(),
            delivery_method: 'platform',
            delivered_at: new Date().toISOString(),
          }, { onConflict: 'user_id,alert_id' });
      }

      setUnreadIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const upserts = alerts.map(alert => ({
        user_id: user.id,
        alert_id: alert.id,
        is_read: true,
        read_at: new Date().toISOString(),
        delivery_method: 'platform',
        delivered_at: new Date().toISOString(),
      }));

      if (upserts.length > 0) {
        await supabase
          .from('investor_alert_notifications')
          .upsert(upserts, { onConflict: 'user_id,alert_id' });
      }

      setUnreadIds(new Set());
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [alerts]);

  useEffect(() => {
    fetchAlerts();

    // Subscribe to realtime updates for new alerts
    const channel = supabase
      .channel('investor-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'investor_alerts',
      }, (payload) => {
        const newAlert = payload.new as InvestorAlert;
        setAlerts(prev => [newAlert, ...prev]);
        setUnreadIds(prev => new Set([...prev, newAlert.id]));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

  return {
    alerts,
    unreadCount: unreadIds.size,
    unreadIds,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchAlerts,
  };
}
