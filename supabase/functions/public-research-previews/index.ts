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
    const limit = Math.min(Math.max(Number(body.limit) || 60, 1), 60);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data, error } = await admin
      .from("generated_research_reports")
      .select("id, asset_type, title, ticker, excerpt, ai_score, ai_tags, reading_time_minutes, author_name, page_count, report_date, promoted_at, created_at, pages")
      .eq("status", "promoted")
      .in("asset_type", assetTypes.length ? assetTypes : ["stock", "crypto"])
      .order("promoted_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) throw error;

    const reports = (data ?? []).map((report: any) => {
      const pages = Array.isArray(report.pages) ? report.pages : [];
      const firstPage = pages[0] ?? {};
      return {
        id: report.id,
        asset_type: report.asset_type,
        title: report.title,
        ticker: report.ticker,
        excerpt: report.excerpt,
        ai_score: report.ai_score,
        ai_tags: report.ai_tags ?? [],
        reading_time_minutes: report.reading_time_minutes,
        author_name: report.author_name,
        page_count: report.page_count,
        report_date: report.report_date,
        promoted_at: report.promoted_at,
        created_at: report.created_at,
        first_page_title: firstPage.title ?? "Executive Summary & Key Takeaways",
        first_page_html: firstPage.html ?? report.excerpt ?? "",
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