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
    const assetTypes = requestedTypes.filter((t: unknown) => t === "stock" || t === "crypto");
    const limit = Math.min(Math.max(Number(body.limit) || 60, 1), 60);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Pull the same data the investor Stock/Crypto Research Reports tabs render.
    const { data, error } = await admin
      .from("asset_research_reports")
      .select(
        "id, asset_type, asset_id, asset_name, asset_symbol, overall_quality_score, risk_score, valuation_score, esg_score, confidence_level, quality_analysis, version, generated_at, data_as_of, created_at, updated_at"
      )
      .in("asset_type", assetTypes.length ? assetTypes : ["stock", "crypto"])
      .order("generated_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return new Response(JSON.stringify({ reports: data ?? [] }), {
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
