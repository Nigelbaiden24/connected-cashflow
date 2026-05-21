// Simple Firecrawl scrape proxy used by admin scraper UIs
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");

    const { url, formats } = await req.json();
    if (!url) throw new Error("url is required");

    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: formats ?? ["markdown"],
        onlyMainContent: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `Firecrawl ${res.status}`);

    const doc = data?.data ?? data;
    return new Response(
      JSON.stringify({
        success: true,
        markdown: doc?.markdown,
        html: doc?.html,
        metadata: doc?.metadata,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
