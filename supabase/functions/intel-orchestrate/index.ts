// Intel Orchestrate – runs ingest then validate in sequence.
// Designed to be called manually from admin UI or via pg_cron.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const headers = {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
    };

    const ingestRes = await fetch(`${SUPABASE_URL}/functions/v1/intel-ingest-firecrawl`, {
      method: "POST", headers, body: "{}",
    });
    const ingest = await ingestRes.json();

    const validateRes = await fetch(`${SUPABASE_URL}/functions/v1/intel-validate`, {
      method: "POST", headers, body: JSON.stringify({ limit: 20 }),
    });
    const validate = await validateRes.json();

    return new Response(
      JSON.stringify({ success: true, ingest, validate }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
