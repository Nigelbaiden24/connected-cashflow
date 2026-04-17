// Intel Ingest – Firecrawl
// Scrapes configured news/blog sources via Firecrawl /v2/search and stores
// raw event candidates in intel_events with status='new' for later AI validation.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

interface SearchHit {
  url: string;
  title?: string;
  description?: string;
  markdown?: string;
}

async function firecrawlSearch(apiKey: string, query: string, limit = 10): Promise<SearchHit[]> {
  const res = await fetch(`${FIRECRAWL_V2}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit,
      tbs: "qdr:w", // last week
      scrapeOptions: { formats: ["markdown"] },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Firecrawl search failed (${res.status}): ${JSON.stringify(data)}`);
  // v2 may return data.web[] or data.data[]
  const arr = data?.data?.web ?? data?.web ?? data?.data ?? [];
  return Array.isArray(arr) ? arr : [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const sourceKey: string | undefined = body.source_key;
    const customQuery: string | undefined = body.query;

    // Determine which sources to run
    let sources: any[] = [];
    if (sourceKey) {
      const { data } = await supabase.from("intel_sources").select("*").eq("source_key", sourceKey).limit(1);
      sources = data ?? [];
    } else {
      const { data } = await supabase
        .from("intel_sources")
        .select("*")
        .eq("enabled", true)
        .in("source_type", ["media", "blog", "newsletter"]);
      sources = data ?? [];
    }

    const results: any[] = [];

    for (const source of sources) {
      const cfg = source.config ?? {};
      const queries: string[] = customQuery
        ? [customQuery]
        : cfg.queries ?? [
            `site:${new URL(source.base_url ?? "https://example.com").hostname} funding round`,
            `site:${new URL(source.base_url ?? "https://example.com").hostname} raises`,
          ];

      for (const q of queries) {
        try {
          const hits = await firecrawlSearch(FIRECRAWL_API_KEY, q, 8);
          for (const hit of hits) {
            // Insert raw event – validation step will enrich
            const { error } = await supabase.from("intel_events").insert({
              event_type: "funding_round",
              event_subtype: "candidate",
              title: hit.title ?? hit.url,
              summary: hit.description ?? null,
              source_id: source.id,
              source_url: hit.url,
              signal_tier: "media_reported",
              confidence: "low",
              confidence_score: 0.3,
              raw_data: { hit, query: q },
              status: "new",
            });
            if (!error) results.push({ source: source.source_key, url: hit.url });
          }
        } catch (e) {
          console.error(`[${source.source_key}] query "${q}" failed:`, e);
        }
      }

      await supabase.from("intel_sources").update({ last_run_at: new Date().toISOString() }).eq("id", source.id);
    }

    return new Response(
      JSON.stringify({ success: true, ingested: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("intel-ingest-firecrawl error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
