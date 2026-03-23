/**
 * Event-based notification trigger functions.
 * Support sending to segments, filtered tags, or individual users.
 */

import { supabase } from "@/integrations/supabase/client";

interface NotificationPayload {
  title: string;
  message: string;
  url?: string;
  icon?: string;
  segment?: string;
  notification_type?: string;
  filters?: Array<{ field: string; key?: string; value: string; relation: string }>;
  target_user_ids?: string[];
  schedule?: string;
  sent_by?: string;
}

export async function sendPushNotification(payload: NotificationPayload) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.functions.invoke("send-push-notification", {
      body: { ...payload, sent_by: user?.id || payload.sent_by },
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Push notification send error:", err);
    throw err;
  }
}

export function usePushNotificationTriggers() {
  const newDealAdded = async (dealName: string, sector: string, dealUrl?: string) => {
    return sendPushNotification({
      title: "🔔 New Deal Alert",
      message: `${dealName} — ${sector} opportunity just listed`,
      url: dealUrl || "/finance/opportunities",
      notification_type: "deal",
      filters: [
        { field: "tag", key: "push_deals", value: "true", relation: "=" },
      ],
    });
  };

  const newReportPublished = async (reportTitle: string, reportUrl?: string) => {
    return sendPushNotification({
      title: "📊 New Report Published",
      message: `${reportTitle} is now available`,
      url: reportUrl || "/finance/reports",
      notification_type: "report",
      filters: [
        { field: "tag", key: "push_reports", value: "true", relation: "=" },
      ],
    });
  };

  const marketAlertTriggered = async (alertTitle: string, alertMessage: string, alertUrl?: string) => {
    return sendPushNotification({
      title: `⚡ ${alertTitle}`,
      message: alertMessage,
      url: alertUrl || "/finance/market-data",
      notification_type: "market",
      filters: [
        { field: "tag", key: "push_market_alerts", value: "true", relation: "=" },
      ],
    });
  };

  const sendToUsers = async (
    userIds: string[],
    title: string,
    message: string,
    opts?: { url?: string; type?: string; schedule?: string }
  ) => {
    return sendPushNotification({
      title,
      message,
      url: opts?.url,
      notification_type: opts?.type || "direct",
      target_user_ids: userIds,
      schedule: opts?.schedule,
    });
  };

  return { newDealAdded, newReportPublished, marketAlertTriggered, sendToUsers, sendPushNotification };
}
