// Sends push notifications. Admins and other edge functions only.
//  - Targeted (preferred): { title, message, topic, route?, user_ids?, deal_category?, ignore_preferences? }
//    → users by id (or everyone interested in the topic), respecting preferences.
//  - Broadcast (admin screen): { title, message, url?, segment?, filters? } → OneSignal segments.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { identify } from "../_shared/guard.ts";
import { type PushTopic, sendPush } from "../_shared/push.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const TOPICS: PushTopic[] = ["research", "deals", "portfolio", "market", "account", "test", "admin"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const caller = await identify(req);
  if (caller.kind !== "admin" && caller.kind !== "internal") {
    return json({ error: caller.kind === "user" ? "Admin access required" : "Sign in as an admin to send notifications" }, caller.kind === "user" ? 403 : 401);
  }
  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body.title ?? "").trim(), message = String(body.message ?? "").trim();
    if (!title || !message) return json({ error: "title and message are required" }, 400);
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const sentBy = caller.kind === "admin" ? caller.userId : (body.sent_by ?? null);

    const userIds: string[] | undefined = Array.isArray(body.user_ids) ? body.user_ids : Array.isArray(body.target_user_ids) && body.target_user_ids.length ? body.target_user_ids : undefined;
    const topic: PushTopic | undefined = TOPICS.includes(body.topic) ? body.topic : undefined;

    if (topic || userIds) {
      const route = typeof body.route === "string" ? body.route : (typeof body.url === "string" && body.url.startsWith("/") ? body.url : undefined);
      const r = await sendPush(sb, { title, body: message, topic: topic ?? "admin", route, data: body.data ?? undefined, imageUrl: body.image_url ?? undefined },
        { userIds, dealCategory: body.deal_category ?? undefined, ignorePreferences: body.ignore_preferences === true || (!topic && !!userIds) }, sentBy);
      return json({ success: r.ok, id: r.notificationIds[0] ?? null, recipients: r.recipients, targeted: r.targeted, skipped: r.skipped, error: r.error }, r.ok ? 200 : 502);
    }

    // Broadcast to OneSignal segments/filters (admin push screen).
    const appId = Deno.env.get("ONESIGNAL_APP_ID"), key = Deno.env.get("ONESIGNAL_REST_API_KEY");
    if (!appId || !key) return json({ error: "OneSignal is not configured" }, 500);
    const payload: Record<string, unknown> = {
      app_id: appId,
      headings: { en: title },
      contents: { en: message },
      ...(body.url && { web_url: body.url, data: { route: String(body.url).replace(/^https?:\/\/[^/]+/, "") } }),
      ...(body.icon && { chrome_web_icon: body.icon }),
      ...(body.schedule && { send_after: body.schedule }),
      ...(Array.isArray(body.filters) && body.filters.length ? { filters: body.filters } : { included_segments: [body.segment || "Subscribed Users"] }),
    };
    const r = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: key.startsWith("os_v2_") ? `Key ${key}` : `Basic ${key}` },
      body: JSON.stringify(payload),
    });
    const result = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: "OneSignal API error", details: result }, r.status);
    await sb.from("push_notification_logs").insert({
      onesignal_id: result.id || null, title, message, url: body.url || null,
      notification_type: body.notification_type || "general", target_type: body.segment ? "segment" : "all",
      target_user_ids: null, recipients_count: result.recipients || 0, sent_by: sentBy,
    }).then(() => {}, () => {});
    return json({ success: true, id: result.id, recipients: result.recipients });
  } catch (err) {
    console.error("send-push-notification error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
