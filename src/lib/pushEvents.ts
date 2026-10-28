// Tells the backend about events that should notify client users (admin actions).
// Fire-and-forget: a notification problem never blocks the admin's action.
import { supabase } from "@/integrations/supabase/client";

export type PushEvent =
  | { event: "report_published"; id: string }
  | { event: "reports_published"; ids: string[] }
  | { event: "deal_published"; id: string }
  | { event: "portfolio_review_delivered"; id: string }
  | { event: "portfolio_message"; id: string };

export function notifyEvent(e: PushEvent) {
  void supabase.functions.invoke("notify-event", { body: e }).then(({ error }) => {
    if (error) console.warn("[push] notify-event failed", e.event, error.message);
  });
}
