import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const requestedTypes = Array.isArray(body.asset_types) ? body.asset_types : ["stock", "crypto"];
    const assetTypes = requestedTypes.filter((type: unknown) => type === "stock" || type === "crypto");
    // Lists are light (no page bodies), so the full archive can be returned.
    const limit = Math.min(Math.max(Number(body.limit) || 60, 1), 500);
    const includeFullReports = body.include_full === true;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    // Only a user session JWT carries a "sub"; anon/publishable keys don't.
    // (Unverified here; getUser below does the real check.)
    const looksLikeUser = (() => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return typeof payload?.sub === "string" && payload.sub.length > 0;
      } catch {
        return false;
      }
    })();
    const authCheck = looksLikeUser
      ? admin.auth.getUser(token).then(({ data }) => !!data?.user).catch(() => false)
      : Promise.resolve(false);

    const reportId = typeof body.report_id === "string" ? body.report_id.trim() : "";
    if (reportId) {
      const isAuthed = await authCheck;
      if (!isAuthed) {
        return new Response(JSON.stringify({ error: "Sign in required" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: report, error: reportError } = await admin
        .from("generated_research_reports")
        .select("id, title, asset_type, ticker, pages, html_content, author_name, report_date, ai_score, sources, hero_image_url")
        .eq("id", reportId)
        .eq("status", "promoted")
        .maybeSingle();

      if (reportError) throw reportError;

      return new Response(JSON.stringify({ report }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const includeFull = includeFullReports && (await authCheck);
    const baseCols = "id, asset_type, title, slug, ticker, excerpt, ai_score, ai_tags, reading_time_minutes, author_name, page_count, report_date, promoted_at, created_at";
    // Only the first page is read for list views; signed-out callers also get
    // the pre-blurred paywall screenshots.
    const listSelect = includeFull
      ? `${baseCols}, hero_image_url, html_content, sources, pages`
      : `${baseCols}, first_page:pages->0${looksLikeUser ? "" : ", preview_images"}`;

    const query = (cols: string) => admin
      .from("generated_research_reports")
      .select(cols)
      .eq("status", "promoted")
      .in("asset_type", assetTypes.length ? assetTypes : ["stock", "crypto"])
      .order("promoted_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    // Runs alongside the auth check; falls back if preview_images isn't live yet.
    let [{ data, error }, isAuthed] = await Promise.all([query(listSelect), authCheck]);
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
        excerpt: isAuthed ? report.excerpt : null,
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
        first_page_title: firstPage.title ?? "Executive Summary & Key Takeaways",
        first_page_html: isAuthed ? (firstPage.html ?? report.excerpt ?? "") : "",
        preview_images: Array.isArray(report.preview_images) ? report.preview_images.slice(0, 3) : [],
      };
    });

    return new Response(JSON.stringify({ reports }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("public-research-previews error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});