// Runs due research scraper schedules. Triggered every 15 minutes by pg_cron.
// For each enabled schedule whose next_run_at <= now(), generates a new
// multi-page research report (saved as draft) and advances next_run_at.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { runGeneration } from "../generate-research-report-ai/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: due, error } = await admin
      .from("research_scraper_schedules")
      .select("*")
      .eq("enabled", true)
      .lte("next_run_at", new Date().toISOString())
      .limit(10);
    if (error) throw error;

    const results: any[] = [];
    for (const s of due ?? []) {
      const startedAt = new Date();
      try {
        const r = await runGeneration({
          assetType: s.asset_type,
          topic: s.topic,
          ticker: s.ticker ?? "",
          extraUrls: s.extra_urls ?? [],
          createdBy: s.created_by,
          admin,
        });
        await admin.from("research_scraper_schedules").update({
          last_run_at: startedAt.toISOString(),
          last_run_status: "success",
          last_run_error: null,
          next_run_at: new Date(Date.now() + s.frequency_hours * 3600 * 1000).toISOString(),
        }).eq("id", s.id);
        results.push({ id: s.id, ok: true, ...r });
      } catch (e) {
        await admin.from("research_scraper_schedules").update({
          last_run_at: startedAt.toISOString(),
          last_run_status: "error",
          last_run_error: (e as Error).message.slice(0, 500),
          next_run_at: new Date(Date.now() + s.frequency_hours * 3600 * 1000).toISOString(),
        }).eq("id", s.id);
        results.push({ id: s.id, ok: false, error: (e as Error).message });
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("run-research-scraper-schedules error:", e);
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
