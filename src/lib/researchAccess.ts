// Research paywall on the client. The research API reports who may read full
// reports; until the updated API is deployed (older versions don't say), the
// same rule is applied here: admins and active FlowPulse Investor subscribers.
import { supabase } from "@/integrations/supabase/client";

export type Viewer = { signed_in: boolean; can_read: boolean };

export async function clientViewer(): Promise<Viewer> {
  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) return { signed_in: false, can_read: false };
  const db = supabase as any;
  const [role, sub] = await Promise.all([
    db.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle(),
    db.from("subscriptions").select("id").eq("user_id", uid)
      .in("status", ["active", "trialing", "past_due"]).gt("current_period_end", new Date().toISOString())
      .in("platform", ["investor", "both", "all"]).limit(1).maybeSingle(),
  ]);
  return { signed_in: true, can_read: !!role?.data || !!sub?.data };
}

export const resolveViewer = async (fromApi?: Viewer | null): Promise<Viewer> =>
  fromApi && typeof fromApi.can_read === "boolean" ? fromApi : clientViewer();

/** First sentence of an excerpt, capped (matches the API's teaser). */
export function teaserOf(excerpt: string | null | undefined): string | null {
  const text = String(excerpt ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return null;
  const first = text.match(/^.{40,220}?[.!?](\s|$)/)?.[0]?.trim() ?? text.slice(0, 160);
  return first.length > 170 ? `${first.slice(0, 160).replace(/\s+\S*$/, "")}…` : first;
}

/** Strips report content for viewers who can't read it (no-op for readers). */
export function applyPaywall<T extends Record<string, any>>(reports: T[], viewer: Viewer): T[] {
  if (viewer.can_read) return reports;
  return reports.map((r) => ({
    ...r,
    locked: true,
    teaser: r.teaser ?? teaserOf(r.excerpt),
    excerpt: null,
    first_page_html: "",
    html_content: "",
    pages: [],
  }));
}
