/**
 * Event-based notification trigger functions.
 * These call the OneSignal REST API via an edge function to send
 * targeted push notifications to user segments.
 */

import { supabase } from "@/integrations/supabase/client";

interface NotificationPayload {
  title: string;
  message: string;
  url?: string;
  icon?: string;
  segment?: string;
  filters?: Array<{ field: string; key?: string; value: string; relation: string }>;
}

async function sendPushNotification(payload: NotificationPayload) {
  try {
    const { data, error } = await supabase.functions.invoke("send-push-notification", {
      body: payload,
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
      segment: "deal_alerts",
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
      segment: "report_alerts",
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
      segment: "market_alerts",
      filters: [
        { field: "tag", key: "push_market_alerts", value: "true", relation: "=" },
      ],
    });
  };

  return { newDealAdded, newReportPublished, marketAlertTriggered };
}
