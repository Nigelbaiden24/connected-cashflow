import { supabase } from "@/integrations/supabase/client";

interface NotificationPayload {
  title: string;
  message: string;
  notification_type: string;
  severity?: 'info' | 'warning' | 'critical';
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
}

/**
 * Creates notifications for users on both platforms when admin uploads new content
 */
export async function createAdminUploadNotifications({
  platform,
  title,
  message,
  notification_type,
  entity_type,
  entity_id,
  action_url,
  targetUserId,
}: {
  platform: 'finance' | 'investor' | 'business';
  title: string;
  message: string;
  notification_type: string;
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  targetUserId?: string | null; // null or 'all' means all users
}) {
  try {
    // Determine which notification table to use based on platform
    if (platform === 'investor') {
      // For investor platform, create entries in investor_alerts table
      // which triggers notifications via investor_alert_notifications
      const alertData = {
        alert_type: notification_type,
        title,
        description: message,
        severity: 'info' as const,
        metadata: {
          entity_type,
          entity_id,
          action_url,
          is_admin_upload: true,
        },
        published_date: new Date().toISOString(),
      };

      const { data: alert, error: alertError } = await supabase
        .from('investor_alerts')
        .insert(alertData)
        .select()
        .single();

      if (alertError) {
        console.error('Error creating investor alert:', alertError);
        return { success: false, error: alertError };
      }

      // Create notification entries for target users
      if (targetUserId && targetUserId !== 'all') {
        await supabase.from('investor_alert_notifications').insert({
          user_id: targetUserId,
          alert_id: alert.id,
          delivery_method: 'platform',
          delivered_at: new Date().toISOString(),
        });
      } else {
        // Create for all users - fetch all user profiles
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id');

        if (profiles && profiles.length > 0) {
          const notifications = profiles.map((p) => ({
            user_id: p.user_id,
            alert_id: alert.id,
            delivery_method: 'platform',
            delivered_at: new Date().toISOString(),
          }));

          await supabase.from('investor_alert_notifications').insert(notifications);
        }
      }

      return { success: true, alertId: alert.id };
    } else {
      // For finance/business platform, use business_notifications table
      const notificationData: NotificationPayload = {
        title,
        message,
        notification_type,
        severity: 'info',
        entity_type,
        entity_id,
        action_url,
      };

      if (targetUserId && targetUserId !== 'all') {
        // Create notification for specific user
        const { error } = await supabase.from('business_notifications').insert({
          user_id: targetUserId,
          ...notificationData,
        });

        if (error) {
          console.error('Error creating business notification:', error);
          return { success: false, error };
        }
      } else {
        // Create for all users
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id');

        if (profiles && profiles.length > 0) {
          const notifications = profiles.map((p) => ({
            user_id: p.user_id,
            ...notificationData,
          }));

          const { error } = await supabase.from('business_notifications').insert(notifications);

          if (error) {
            console.error('Error creating business notifications:', error);
            return { success: false, error };
          }
        }
      }

      return { success: true };
    }
  } catch (error) {
    console.error('Error in createAdminUploadNotifications:', error);
    return { success: false, error };
  }
}

/**
 * Creates a notification when an opportunity is uploaded
 */
export async function createOpportunityNotification({
  opportunityId,
  title,
  category,
  subCategory,
}: {
  opportunityId: string;
  title: string;
  category: string;
  subCategory: string;
}) {
  return createAdminUploadNotifications({
    platform: 'investor',
    title: '🚀 New Deal Alert',
    message: `New ${subCategory} opportunity available: ${title}`,
    notification_type: 'deal_alert',
    entity_type: 'opportunity',
    entity_id: opportunityId,
    action_url: '/investor/opportunities',
    targetUserId: null, // Notify all users
  });
}

/**
 * Creates a notification when a report is uploaded
 */
export async function createReportNotification({
  reportId,
  title,
  reportType,
  platform,
  targetUserId,
}: {
  reportId: string;
  title: string;
  reportType: string;
  platform: 'finance' | 'investor' | 'business';
  targetUserId?: string | null;
}) {
  const actionUrl = platform === 'investor' 
    ? '/investor/reports' 
    : platform === 'finance' 
    ? '/finance/reports' 
    : '/business/reports';

  return createAdminUploadNotifications({
    platform,
    title: '📄 New Report Available',
    message: `New ${reportType} report: ${title}`,
    notification_type: 'new_report',
    entity_type: 'report',
    entity_id: reportId,
    action_url: actionUrl,
    targetUserId,
  });
}
