// Sends a test notification to the caller's own devices (any signed-in user).
// Limited to one test a minute per user.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { identify } from "../_shared/guard.ts";
import { sendPush } from "../_shared/push.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const caller = await identify(req);
  if (caller.kind !== "user" && caller.kind !== "admin") return json({ error: "Sign in to send a test notification" }, 401);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: recent } = await sb.from("push_notification_logs").select("id")
    .eq("notification_type", "test").contains("target_user_ids", [caller.userId])
    .gt("created_at", new Date(Date.now() - 60_000).toISOString()).limit(1);
  if (recent?.length) return json({ error: "Please wait a minute before sending another test." }, 429);

  const { count: devices } = await sb.from("user_push_devices").select("id", { count: "exact", head: true })
    .eq("user_id", caller.userId).eq("push_enabled", true);

  const r = await sendPush(sb, {
    title: "FlowPulse test notification",
    body: "Notifications are working on this device. Tap to open your notification settings.",
    topic: "test",
    route: "/investor/notifications",
  }, { userIds: [caller.userId], ignorePreferences: true }, caller.userId);

  return json({
    ok: r.ok && r.recipients > 0,
    delivered_to: r.recipients,
    registered_devices: devices ?? 0,
    message: r.recipients > 0
      ? `Sent to ${r.recipients} device${r.recipients === 1 ? "" : "s"}.`
      : "No device is subscribed yet. Open the app, allow notifications, then try again.",
    error: r.error,
  }, r.ok ? 200 : 502);
});
