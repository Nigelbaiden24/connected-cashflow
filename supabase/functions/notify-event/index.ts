// Turns platform events into notifications for client users. Admins and other
// edge functions only. Each event is notified once (de-duplicated by route).
// Body: { event, id }
//   report_published       id = generated_research_reports.id   → users following research
//   reports_published      ids = [...]                          → one summary notification
//   deal_published         id = opportunity_products.id         → users following deals (and that category)
//   portfolio_review_delivered  id = portfolio_review_requests.id → the client
//   portfolio_message      id = portfolio_review_requests.id    → the client (analyst replied)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { identify } from "../_shared/guard.ts";
import { type PushMessage, type PushTarget, sendPush } from "../_shared/push.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const money = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0, notation: n >= 10_000_000 ? "compact" : "standard" }).format(n);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const caller = await identify(req);
  if (caller.kind !== "admin" && caller.kind !== "internal") return json({ error: "Admin access required" }, caller.kind === "user" ? 403 : 401);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const body = await req.json().catch(() => ({}));
  const sentBy = caller.kind === "admin" ? caller.userId : null;

  try {
    let msg: PushMessage | null = null;
    let target: PushTarget = {};
    let dedupe = true;

    switch (body.event) {
      case "report_published": {
        const { data: r } = await sb.from("generated_research_reports").select("id,title,ticker,asset_type,ai_score").eq("id", body.id).maybeSingle();
        if (!r) return json({ error: "Report not found" }, 404);
        const desk = r.asset_type === "crypto" ? "crypto" : "stock";
        msg = {
          topic: "research",
          title: `New ${desk === "crypto" ? "digital asset" : "equity"} research${r.ticker ? `: ${r.ticker}` : ""}`,
          body: `${r.title}${typeof r.ai_score === "number" ? ` · conviction ${Number(r.ai_score).toFixed(1)}/5` : ""}`,
          route: `/investor/${desk}-research?report=${r.id}`,
          data: { report_id: r.id },
        };
        break;
      }
      case "reports_published": {
        const ids: string[] = Array.isArray(body.ids) ? body.ids.slice(0, 50) : [];
        if (!ids.length) return json({ error: "ids required" }, 400);
        msg = { topic: "research", title: `${ids.length} new research reports`, body: "Fresh analyst dossiers have just been published.", route: "/investor/research" };
        dedupe = false;
        break;
      }
      case "deal_published": {
        const { data: d } = await sb.from("opportunity_products").select("id,title,category,price,location,product_details").eq("id", body.id).maybeSingle();
        if (!d) return json({ error: "Opportunity not found" }, 404);
        const basis = d.product_details?.price_basis ?? d.product_details?.price_estimate_basis;
        const price = d.price ? `${basis === "source_stated" || basis === "source_extracted" ? "" : "≈ "}${money(Number(d.price))}` : "";
        msg = {
          topic: "deals",
          title: "New investment opportunity",
          body: [d.title, price, d.location].filter(Boolean).join(" · "),
          route: `/investor/opportunities/${d.id}`,
          data: { product_id: d.id, category: d.category },
        };
        target = { dealCategory: d.category };
        break;
      }
      case "portfolio_review_delivered":
      case "portfolio_message": {
        const { data: p } = await sb.from("portfolio_review_requests").select("id,user_id,title").eq("id", body.id).maybeSingle();
        if (!p) return json({ error: "Review not found" }, 404);
        const delivered = body.event === "portfolio_review_delivered";
        msg = {
          topic: "portfolio",
          title: delivered ? "Your portfolio review is ready" : "New message from your analyst",
          body: delivered ? `${p.title}: your analyst's written review is ready to read.` : `About "${p.title}". Tap to read and reply.`,
          route: `/investor/portfolio-review?review=${p.id}`,
          data: { review_id: p.id },
        };
        target = { userIds: [p.user_id] };
        dedupe = delivered;
        break;
      }
      default:
        return json({ error: "Unknown event" }, 400);
    }

    if (dedupe && msg.route) {
      const { data: prior } = await sb.from("push_notification_logs").select("id").eq("url", `${(Deno.env.get("PUBLIC_SITE_URL") || "https://flowpulse.co.uk").replace(/\/$/, "")}${msg.route}`).limit(1);
      if (prior?.length) return json({ ok: true, skipped: "already notified" });
    }

    const r = await sendPush(sb, msg, target, sentBy);
    return json({ ok: r.ok, recipients: r.recipients, targeted: r.targeted, skipped: r.skipped, error: r.error }, r.ok ? 200 : 502);
  } catch (e) {
    console.error("notify-event error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});
