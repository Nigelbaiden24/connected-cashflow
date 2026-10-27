// Research reports for the public Reports page and the investor platform.
// Full report content is for subscribers only: admins, or users with an
// active Investor subscription. Everyone else gets the front-page details
// (title, ticker, conviction, tags), a one-sentence teaser and pre-blurred
// page screenshots, so the paywall can show enough to interest them.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

/** First sentence of the excerpt, capped, so it teases without giving the thesis away. */
function teaserOf(excerpt: string | null | undefined): string | null {
  const text = String(excerpt ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return null;
  const first = text.match(/^.{40,220}?[.!?](\s|$)/)?.[0]?.trim() ?? text.slice(0, 160);
  const capped = first.length > 170 ? `${first.slice(0, 160).replace(/\s+\S*$/, "")}…` : first;
  return capped;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const requestedTypes = Array.isArray(body.asset_types) ? body.asset_types : ["stock", "crypto"];
    const assetTypes = requestedTypes.filter((type: unknown) => type === "stock" || type === "crypto");
    // Lists are light (no page bodies), so the full archive can be returned.
    const limit = Math.min(Math.max(Number(body.limit) || 60, 1), 500);
    const includeFullReports = body.include_full === true;

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
    // Only a user session JWT carries a "sub"; anon/publishable keys don't.
    const looksLikeUser = (() => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return typeof payload?.sub === "string" && payload.sub.length > 0;
      } catch {
        return false;
      }
    })();

    // Who is asking, and may they read full reports?
    const viewerCheck: Promise<{ signed_in: boolean; can_read: boolean }> = (async () => {
      if (!looksLikeUser) return { signed_in: false, can_read: false };
      const { data } = await admin.auth.getUser(token).catch(() => ({ data: null as any }));
      const uid = data?.user?.id;
      if (!uid) return { signed_in: false, can_read: false };
      const [role, sub] = await Promise.all([
        admin.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle(),
        admin.from("subscriptions").select("id").eq("user_id", uid)
          .in("status", ["active", "trialing", "past_due"]).gt("current_period_end", new Date().toISOString())
          .in("platform", ["investor", "both", "all"]).limit(1).maybeSingle(),
      ]);
      return { signed_in: true, can_read: !!role.data || !!sub.data };
    })();

    const reportId = typeof body.report_id === "string" ? body.report_id.trim() : "";
    if (reportId) {
      const viewer = await viewerCheck;
      if (!viewer.can_read) {
        return json({
          error: viewer.signed_in ? "An active FlowPulse Investor subscription is required to read this report." : "Sign in with a FlowPulse Investor subscription to read this report.",
          code: viewer.signed_in ? "subscription_required" : "sign_in_required",
          viewer,
        }, viewer.signed_in ? 403 : 401);
      }
      const { data: report, error } = await admin
        .from("generated_research_reports")
        .select("id, title, asset_type, ticker, pages, html_content, author_name, report_date, ai_score, sources, hero_image_url, excerpt")
        .eq("id", reportId).eq("status", "promoted").maybeSingle();
      if (error) throw error;
      return json({ report, viewer });
    }

    // Subscribers get the first page (and full reports on request);
    // everyone else gets the paywall screenshots instead.
    const baseCols = "id, asset_type, title, slug, ticker, excerpt, ai_score, ai_tags, reading_time_minutes, author_name, page_count, report_date, promoted_at, created_at";
    const query = (cols: string) => admin
      .from("generated_research_reports")
      .select(cols)
      .eq("status", "promoted")
      .in("asset_type", assetTypes.length ? assetTypes : ["stock", "crypto"])
      .order("promoted_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    const viewer = await viewerCheck;
    const canRead = viewer.can_read;
    const includeFull = includeFullReports && canRead;
    const listSelect = includeFull
      ? `${baseCols}, hero_image_url, html_content, sources, pages`
      : canRead ? `${baseCols}, first_page:pages->0` : `${baseCols}, first_page_title:pages->0->>title, preview_images`;

    let { data, error } = await query(listSelect);
    if (error && /preview_images/.test(error.message)) ({ data, error } = await query(listSelect.replace(", preview_images", "")));
    if (error) throw error;

    const reports = (data ?? []).map((report: any) => {
      const pages = Array.isArray(report.pages) ? report.pages : [];
      const firstPage = report.first_page ?? pages[0] ?? {};
      return {
        id: report.id,
        asset_type: report.asset_type,
        title: report.title,
        slug: report.slug,
        ticker: report.ticker,
        excerpt: canRead ? report.excerpt : null,
        teaser: canRead ? null : teaserOf(report.excerpt),
        locked: !canRead,
        hero_image_url: includeFull ? report.hero_image_url : null,
        html_content: includeFull ? report.html_content : "",
        ai_score: report.ai_score,
        ai_tags: report.ai_tags ?? [],
        sources: includeFull ? (report.sources ?? []) : [],
        reading_time_minutes: report.reading_time_minutes,
        author_name: report.author_name,
        page_count: report.page_count,
        report_date: report.report_date,
        promoted_at: report.promoted_at,
        created_at: report.created_at,
        pages: includeFull ? pages : [],
        first_page_title: report.first_page_title ?? firstPage.title ?? "Executive Summary & Key Takeaways",
        first_page_html: canRead ? (firstPage.html ?? report.excerpt ?? "") : "",
        preview_images: !canRead && Array.isArray(report.preview_images) ? report.preview_images.slice(0, 3) : [],
      };
    });

    return json({ reports, viewer });
  } catch (error) {
    console.error("public-research-previews error:", error);
    return json({ error: (error as Error).message }, 500);
  }
});
