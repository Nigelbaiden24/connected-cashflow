import { supabase } from "@/integrations/supabase/client";

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return "mobile";
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  return "desktop";
}

export async function logLoginActivity(
  userId: string,
  status: "success" | "failed" = "success",
  failureReason?: string
) {
  try {
    await supabase.from("login_activity").insert({
      user_id: userId,
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
      login_status: status,
      failure_reason: failureReason || null,
    } as any);
  } catch (error) {
    console.error("Failed to log login activity:", error);
  }
}

export async function logAuditEvent(
  action: string,
  resourceType: string,
  severity: string = "info",
  details?: Record<string, any>
) {
  try {
    await supabase.from("audit_logs").insert({
      action,
      resource_type: resourceType,
      severity,
      details: details || null,
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}
