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
 * Creates in-app notifications for users when admin uploads new content.
 * All notifications route through the Finance platform (business_notifications table).
 */
export async function createAdminUploadNotifications({
  title,
  message,
  notification_type,
  entity_type,
  entity_id,
  action_url,
  targetUserId,
}: {
  title: string;
  message: string;
  notification_type: string;
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  targetUserId?: string | null;
}) {
  try {
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
      const { error } = await supabase.from('business_notifications').insert({
        user_id: targetUserId,
        ...notificationData,
      });

      if (error) {
        console.error('Error creating notification:', error);
        return { success: false, error };
      }
    } else {
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
          console.error('Error creating notifications:', error);
          return { success: false, error };
        }
      }
    }

    return { success: true };
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
    title: '🚀 New Deal Alert',
    message: `New ${subCategory} opportunity available: ${title}`,
    notification_type: 'deal_alert',
    entity_type: 'opportunity',
    entity_id: opportunityId,
    action_url: '/finance/opportunities',
    targetUserId: null,
  });
}

/**
 * Creates a notification when a report is uploaded
 */
export async function createReportNotification({
  reportId,
  title,
  reportType,
  targetUserId,
}: {
  reportId: string;
  title: string;
  reportType: string;
  targetUserId?: string | null;
}) {
  return createAdminUploadNotifications({
    title: '📄 New Report Available',
    message: `New ${reportType} report: ${title}`,
    notification_type: 'new_report',
    entity_type: 'report',
    entity_id: reportId,
    action_url: '/finance/reports',
    targetUserId,
  });
}
