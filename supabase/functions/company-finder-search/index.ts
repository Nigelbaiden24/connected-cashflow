// Company Finder edge function — ELITE Sector Deep-Dive Company Intelligence
// Async pattern: returns search_id immediately, processes in background via EdgeRuntime.waitUntil.
// Client polls company_finder_searches.status for completion.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface SearchInput {
  sector: string;
  sub_criteria?: string;
  location?: string;
  brief?: string;
}

interface ExtractedCompany {
  company_name: string;
  website?: string | null;
  country?: string | null;
  sector?: string | null;
  tier?: string | null;
  role?: string | null;
  description?: string | null;
  key_signals?: string | null;
  source_url?: string | null;
  confidence?: "high" | "medium" | "low" | null;
  relevance_tag?: string | null;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function firecrawlSearch(query: string, apiKey: string, limit = 50) {
  try {
    const res = await fetch(`${FIRECRAWL_BASE}/search`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        limit,
        scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
      }),
    });
    if (!res.ok) {
      console.error("Firecrawl search failed:", query, res.status, await res.text().catch(() => ""));
      return [];
    }
    const data = await res.json();
    const results = data?.data?.web ?? data?.data ?? [];
    return Array.isArray(results) ? results : [];
  } catch (e) {
    console.error("Firecrawl exception for query", query, e);
    return [];
  }
}

function buildQueries(input: SearchInput): string[] {
  const sector = input.sector.trim();
  const sub = (input.sub_criteria || "").trim();
  const loc = (input.location || "").trim();
  const brief = (input.brief || "").trim();
  const locClause = loc ? ` ${loc}` : "";
  const queries: string[] = [];

  // Brief-driven (highest precision)
  if (brief) {
    queries.push(`${brief}${locClause} list of companies`);
    queries.push(`${brief}${locClause} suppliers directory`);
    queries.push(`top ${brief}${locClause} 2025 ranking`);
    queries.push(`leading ${brief}${locClause} private companies`);
    queries.push(`${brief}${locClause} site:linkedin.com/company`);
    queries.push(`${brief}${locClause} site:crunchbase.com/organization`);
    queries.push(`${brief}${locClause} small business directory`);
    queries.push(`${brief}${locClause} startup companies`);
  }
  // Sub-criteria driven
  if (sub) {
    queries.push(`${sector} ${sub}${locClause} companies list`);
    queries.push(`${sector} ${sub}${locClause} suppliers directory 2025`);
    queries.push(`top ${sector} ${sub} companies${locClause}`);
    queries.push(`${sector} ${sub}${locClause} market leaders`);
    queries.push(`${sector} ${sub}${locClause} SME small medium enterprise`);
    queries.push(`${sector} ${sub}${locClause} emerging startups`);
  }
  // Sector backbone — multi-segment coverage
  queries.push(`${sector}${locClause} leading companies directory 2025`);
  queries.push(`${sector}${locClause} industry players ranking`);
  queries.push(`${sector}${locClause} top private companies revenue`);
  queries.push(`${sector}${locClause} trade association member directory`);
  queries.push(`${sector}${locClause} largest enterprises 2025`);
  queries.push(`${sector}${locClause} mid-market companies list`);
  queries.push(`${sector}${locClause} small business owners directory`);
  queries.push(`${sector}${locClause} fastest growing companies 2025`);
  queries.push(`${sector}${locClause} startups raised funding 2024 2025`);
  queries.push(`${sector}${locClause} family-owned businesses`);
  queries.push(`${sector}${locClause} site:crunchbase.com`);
  queries.push(`${sector}${locClause} site:linkedin.com/company`);
  queries.push(`${sector}${locClause} site:dnb.com`);
  queries.push(`${sector}${locClause} site:owler.com`);
  queries.push(`${sector}${locClause} site:bloomberg.com/profile`);
  queries.push(`${sector}${locClause} site:zoominfo.com`);
  queries.push(`${sector}${locClause} chamber of commerce members`);
  queries.push(`${sector}${locClause} yellow pages business listing`);
  queries.push(`${sector}${locClause} regional business awards finalists`);
  queries.push(`${sector}${locClause} Inc 5000 Financial Times 1000`);

  // Tier-aware fallbacks for supply-chain heavy sectors
  if (/automotive|aerospace|manufactur|industrial|defen[sc]e|energy|chemical|pharma|construction|food|retail|tech|software/i.test(`${sector} ${sub} ${brief}`)) {
    queries.push(`${sector} OEM tier 1 tier 2 tier 3 suppliers${locClause}`);
    queries.push(`${sector} supply chain tier suppliers list${locClause}`);
    queries.push(`${sector}${locClause} component manufacturers directory`);
    queries.push(`${sector}${locClause} contract manufacturers list`);
    queries.push(`${sector}${locClause} independent specialists boutique firms`);
  }

  return [...new Set(queries.map((q) => q.trim()))].slice(0, 32);
}

async function extractWithAI(
  input: SearchInput,
  pages: Array<{ url: string; title?: string; markdown?: string; description?: string }>,
  aiKey: string,
): Promise<ExtractedCompany[]> {
  if (!pages.length) return [];

  const system = `You are an ELITE B2B market-mapping analyst (Bain / McKinsey / PitchBook calibre). Your job: extract a comprehensive, structured list of REAL companies of ALL SIZES (small businesses, SMEs, mid-market, large enterprises, OEMs, startups, family-owned firms) that match the user's sector + criteria from the provided web sources.

STRICT RULES:
- Return only real, verifiable companies that appear in the provided sources OR are widely-known established players in this exact space.
- Each company MUST include a source_url (where it was mentioned, or its official site).
- confidence: "high" = explicitly listed in a credible source as matching; "medium" = inferred from strong context; "low" = speculative.
- For supply-chain/tier searches, set "tier" to one of: "OEM", "Tier 1", "Tier 2", "Tier 3", "Distributor", "Specialist", "SME", "Startup", "Other".
- "role": short description of what the company actually does (max 14 words).
- key_signals: 1-2 short evidence phrases (e.g. "Listed in SMMT supplier directory", "$2B revenue 2024", "Supplies BMW & VW").
- BE EXHAUSTIVE: pull EVERY credible company name from the corpus — small, medium and large. Aim for 40-80 matches per batch.
- Deduplicate by company name. Never invent companies.
- Return [] only if nothing credible found.`;

  const corpus = pages
    .slice(0, 22)
    .map((p, i) =>
      `### SOURCE ${i + 1}\nURL: ${p.url}\nTITLE: ${p.title ?? ""}\n\n${(p.markdown ?? p.description ?? "").slice(0, 4500)}`,
    )
    .join("\n\n---\n\n");

  const userPrompt = `Searching for companies matching:
- Sector: ${input.sector}
- Sub-criteria: ${input.sub_criteria || "(none)"}
- Location: ${input.location || "(any)"}
- Detailed brief: ${input.brief || "(none)"}

Sources:
${corpus}`;

  const callModel = async (model: string) => {
    const res = await fetch(AI_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_companies",
              description: "Submit extracted companies matching the search.",
              parameters: {
                type: "object",
                properties: {
                  companies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        company_name: { type: "string" },
                        website: { type: "string" },
                        country: { type: "string" },
                        sector: { type: "string" },
                        tier: { type: "string" },
                        role: { type: "string" },
                        description: { type: "string" },
                        key_signals: { type: "string" },
                        source_url: { type: "string" },
                        confidence: { type: "string", enum: ["high", "medium", "low"] },
                        relevance_tag: { type: "string" },
                      },
                      required: ["company_name"],
                    },
                  },
                },
                required: ["companies"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_companies" } },
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("AI gateway error:", model, res.status, txt);
      return null;
    }
    const data = await res.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return null;
    try {
      const parsed = typeof args === "string" ? JSON.parse(args) : args;
      return Array.isArray(parsed?.companies) ? (parsed.companies as ExtractedCompany[]) : [];
    } catch {
      return null;
    }
  };

  // Try Pro first for elite quality; fall back to flash on failure / rate-limit.
  const primary = await callModel("google/gemini-2.5-pro");
  if (primary && primary.length) return primary;
  const fallback = await callModel("google/gemini-2.5-flash");
  return fallback ?? [];
}

async function runDeepDive(
  searchId: string,
  userId: string,
  body: SearchInput,
  admin: ReturnType<typeof createClient>,
  firecrawlKey: string,
  aiKey: string,
) {
  try {
    const queries = buildQueries(body);
    console.log(`[company-finder] search ${searchId}: ${queries.length} queries dispatching in parallel`);

    const searchResults = await Promise.all(queries.map((q) => firecrawlSearch(q, firecrawlKey, 50)));
    const allPages = searchResults.flat();

    // Dedupe by URL
    const seen = new Set<string>();
    const pages = allPages.filter((p: any) => {
      const u = p?.url;
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return true;
    });
    console.log(`[company-finder] search ${searchId}: ${pages.length} unique sources`);

    const extracted = await extractWithAI(body, pages, aiKey);

    // Dedupe by normalised company name
    const byName = new Map<string, ExtractedCompany>();
    for (const c of extracted) {
      const key = (c.company_name || "").trim().toLowerCase();
      if (!key) continue;
      if (!byName.has(key)) byName.set(key, c);
    }
    const unique = [...byName.values()];

    if (unique.length) {
      const rows = unique.slice(0, 80).map((c) => ({
        search_id: searchId,
        user_id: userId,
        company_name: c.company_name,
        website: c.website ?? null,
        country: c.country ?? null,
        sector: c.sector ?? body.sector,
        tier: c.tier ?? null,
        role: c.role ?? null,
        description: c.description ?? null,
        key_signals: c.key_signals ?? null,
        source_url: c.source_url ?? null,
        confidence: c.confidence ?? null,
        relevance_tag: c.relevance_tag ?? null,
      }));
      const { error: insErr } = await admin.from("company_finder_results").insert(rows);
      if (insErr) console.error("Insert companies failed:", insErr);
    }

    await admin
      .from("company_finder_searches")
      .update({
        status: "completed",
        results_count: unique.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", searchId);
    console.log(`[company-finder] search ${searchId}: completed with ${unique.length} companies`);
  } catch (e) {
    console.error(`[company-finder] search ${searchId} failed:`, e);
    await admin
      .from("company_finder_searches")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", searchId);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!FIRECRAWL_API_KEY) return json(500, { error: "FIRECRAWL_API_KEY not configured" });
    if (!LOVABLE_API_KEY) return json(500, { error: "LOVABLE_API_KEY not configured" });

    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json(401, { error: "Unauthorized" });
    const userId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdminRow } = await admin.rpc("is_admin", { _user_id: userId });
    if (!isAdminRow) return json(403, { error: "Admin only" });

    const body = (await req.json()) as SearchInput;
    if (!body?.sector?.trim()) return json(400, { error: "sector is required" });

    const { data: searchRow, error: searchErr } = await admin
      .from("company_finder_searches")
      .insert({
        user_id: userId,
        sector: body.sector,
        sub_criteria: body.sub_criteria ?? null,
        location: body.location ?? null,
        brief: body.brief ?? null,
        status: "running",
      })
      .select()
      .single();
    if (searchErr || !searchRow) {
      console.error("Insert search failed:", searchErr);
      return json(500, { error: "Failed to create search" });
    }
    const searchId = searchRow.id as string;

    // Kick off elite deep-dive in background; return immediately so the client can poll.
    // @ts-ignore EdgeRuntime is Supabase-specific
    EdgeRuntime.waitUntil(runDeepDive(searchId, userId, body, admin, FIRECRAWL_API_KEY, LOVABLE_API_KEY));

    return json(202, { search_id: searchId, status: "running" });
  } catch (e) {
    console.error("company-finder-search error:", e);
    return json(500, { error: e instanceof Error ? e.message : "Unknown error" });
  }
});
