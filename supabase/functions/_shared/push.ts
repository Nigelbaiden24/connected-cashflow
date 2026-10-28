// Push notification service (OneSignal) for FlowPulse client users.
// Users are addressed by their Supabase user id (OneSignal external_id, set by
// OneSignal.login in the app). Preferences in notification_preferences decide
// who receives which topic; every send is recorded in push_notification_logs.

export type PushTopic = "research" | "deals" | "portfolio" | "market" | "account" | "test" | "admin";

export interface PushMessage {
  title: string;
  body: string;
  topic: PushTopic;
  /** In-app route opened when the notification is tapped, e.g. /investor/stock-research?report=… */
  route?: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
}

export interface PushTarget {
  /** Specific users; omit to send to everyone interested in the topic. */
  userIds?: string[];
  /** For deals: only users following this category (or all categories). */
  dealCategory?: string;
  /** Skip preference checks (test notifications and admin broadcasts). */
  ignorePreferences?: boolean;
}

export interface PushResult {
  ok: boolean;
  recipients: number;      // devices OneSignal delivered to
  targeted: number;        // users we addressed
  skipped: number;         // users filtered out by their preferences
  notificationIds: string[];
  error?: string;
}

const SITE = (Deno.env.get("PUBLIC_SITE_URL") || "https://flowpulse.co.uk").replace(/\/$/, "");
const TOPIC_COLUMN: Partial<Record<PushTopic, string>> = {
  research: "research", deals: "deals", portfolio: "portfolio", market: "market", account: "account",
};
const TOPIC_DEFAULT: Partial<Record<PushTopic, boolean>> = { research: true, deals: true, portfolio: true, market: false, account: true };

function authHeader(key: string) {
  // OneSignal v2 REST keys use "Key …"; legacy keys use "Basic …".
  return key.startsWith("os_v2_") ? `Key ${key}` : `Basic ${key}`;
}

/** Users (from the given list, or all with an enabled device) who want this topic. */
async function resolveRecipients(sb: any, msg: PushMessage, target: PushTarget): Promise<{ users: string[]; skipped: number }> {
  let candidates = target.userIds ? [...new Set(target.userIds.filter(Boolean))] : null;
  if (!candidates) {
    const { data } = await sb.from("user_push_devices").select("user_id").eq("push_enabled", true).limit(50000);
    candidates = [...new Set(((data ?? []) as any[]).map((d) => d.user_id))];
  }
  if (target.ignorePreferences || !candidates.length) return { users: candidates, skipped: 0 };

  const prefs = new Map<string, any>();
  for (let i = 0; i < candidates.length; i += 500) {
    const { data } = await sb.from("notification_preferences").select("*").in("user_id", candidates.slice(i, i + 500));
    for (const p of data ?? []) prefs.set(p.user_id, p);
  }
  const col = TOPIC_COLUMN[msg.topic];
  const users = candidates.filter((uid) => {
    const p = prefs.get(uid);
    if (p && p.push_enabled === false) return false;
    if (col) {
      const on = p ? p[col] !== false : TOPIC_DEFAULT[msg.topic] !== false;
      if (!on) return false;
    }
    if (msg.topic === "deals" && target.dealCategory && p?.deal_categories?.length) {
      return p.deal_categories.includes(target.dealCategory);
    }
    return true;
  });
  return { users, skipped: candidates.length - users.length };
}

export async function sendPush(sb: any, msg: PushMessage, target: PushTarget = {}, sentBy: string | null = null): Promise<PushResult> {
  const appId = Deno.env.get("ONESIGNAL_APP_ID");
  const key = Deno.env.get("ONESIGNAL_REST_API_KEY");
  if (!appId || !key) return { ok: false, recipients: 0, targeted: 0, skipped: 0, notificationIds: [], error: "OneSignal is not configured" };

  const { users, skipped } = await resolveRecipients(sb, msg, target);
  const result: PushResult = { ok: true, recipients: 0, targeted: users.length, skipped, notificationIds: [] };
  if (!users.length) return result;

  const route = msg.route && msg.route.startsWith("/") ? msg.route : undefined;
  const errors: string[] = [];

  // OneSignal accepts up to 2,000 aliases per request.
  for (let i = 0; i < users.length; i += 2000) {
    const batch = users.slice(i, i + 2000);
    const payload: Record<string, unknown> = {
      app_id: appId,
      target_channel: "push",
      include_aliases: { external_id: batch },
      headings: { en: msg.title.slice(0, 120) },
      contents: { en: msg.body.slice(0, 400) },
      // The app opens `route` itself on tap; web browsers use web_url.
      data: { ...(msg.data ?? {}), topic: msg.topic, ...(route ? { route } : {}) },
      ...(route ? { web_url: `${SITE}${route}` } : {}),
      ...(msg.imageUrl ? { big_picture: msg.imageUrl, ios_attachments: { image: msg.imageUrl }, chrome_web_image: msg.imageUrl } : {}),
      ios_badgeType: "Increase",
      ios_badgeCount: 1,
      ttl: msg.topic === "market" ? 6 * 3600 : 3 * 86400,
      priority: msg.topic === "portfolio" || msg.topic === "test" ? 10 : 5,
    };
    try {
      const r = await fetch("https://api.onesignal.com/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeader(key) },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        errors.push(`OneSignal ${r.status}: ${JSON.stringify(j.errors ?? j).slice(0, 200)}`);
        continue;
      }
      if (j.id) result.notificationIds.push(j.id);
      result.recipients += Number(j.recipients ?? 0);
      // Users with no reachable device: OneSignal reports them as invalid aliases.
      // Not an error (they may only use the website); recorded for visibility.
      const invalid = j.errors?.invalid_aliases?.external_id;
      if (Array.isArray(invalid) && invalid.length) errors.push(`${invalid.length} user(s) had no reachable device`);
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  if (errors.length && result.notificationIds.length === 0 && errors.some((e) => e.startsWith("OneSignal"))) result.ok = false;
  if (errors.length) result.error = errors.join("; ").slice(0, 500);

  const base = {
    onesignal_id: result.notificationIds[0] ?? null,
    title: msg.title,
    message: msg.body,
    url: route ? `${SITE}${route}` : null,
    notification_type: msg.topic,
    target_type: target.userIds ? "individual" : "topic",
    target_user_ids: users.length <= 200 ? users : null,
    recipients_count: result.recipients,
    sent_by: sentBy,
  };
  try {
    const { error } = await sb.from("push_notification_logs").insert({ ...base, route: route ?? null, topic: msg.topic, error: result.error ?? null });
    // Before the push migration adds topic/route/error, log the original columns.
    if (error) await sb.from("push_notification_logs").insert(base);
  } catch (e) {
    console.warn("push log failed", e);
  }
  return result;
}
