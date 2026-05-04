// DM Finder edge function — Decision Maker Contact Intelligence
// Phase 1: Firecrawl search/scrape + Lovable AI extraction + pattern-based email permutation (marked Low confidence)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface SearchInput {
  full_name?: string;
  job_title: string;
  company_name: string;
  location?: string;
  sector?: string;
  website?: string;
}

function extractDomain(url: string): string {
  if (!url) return "";
  try {
    const withProto = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const host = new URL(withProto).hostname.toLowerCase().replace(/^www\./, "");
    return host;
  } catch {
    return url.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

interface ExtractedContact {
  full_name?: string | null;
  role?: string | null;
  company?: string | null;
  email?: string | null;
  email_confidence?: "high" | "medium" | "low" | null;
  email_source_url?: string | null;
  phone?: string | null;
  phone_confidence?: "high" | "medium" | "low" | null;
  phone_source_url?: string | null;
  linkedin_url?: string | null;
  relevance_tag?: string | null;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const slugify = (s: string) =>
  s.toLowerCase().replace(/ltd|limited|inc\.?|llc|plc|gmbh/gi, "").replace(/[^a-z0-9]+/g, "");

function guessEmailDomain(company: string): string {
  const slug = slugify(company);
  return slug ? `${slug}.com` : "";
}

function patternEmails(fullName: string, company: string, websiteDomain?: string): string[] {
  if (!fullName) return [];
  const parts = fullName.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return [];
  const first = parts[0].replace(/[^a-z]/g, "");
  const last = parts[parts.length - 1].replace(/[^a-z]/g, "");
  const domain = websiteDomain || guessEmailDomain(company);
  if (!first || !last || !domain) return [];
  return [
    `${first}.${last}@${domain}`,
    `${first}${last}@${domain}`,
    `${first[0]}${last}@${domain}`,
    `${first}@${domain}`,
  ];
}

async function firecrawlSearch(query: string, apiKey: string, limit = 15) {
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
    console.error("Firecrawl search exception:", query, e);
    return [];
  }
}

async function extractWithAI(
  input: SearchInput,
  pages: Array<{ url: string; title?: string; markdown?: string; description?: string }>,
  aiKey: string,
): Promise<ExtractedContact[]> {
  const corpus = pages
    .slice(0, 6)
    .map((p, i) => `### SOURCE ${i + 1}\nURL: ${p.url}\nTITLE: ${p.title ?? ""}\n\n${(p.markdown ?? p.description ?? "").slice(0, 3500)}`)
    .join("\n\n---\n\n");

  const system = `You are an OSINT contact-intelligence extractor. From the provided public web pages, extract decision-maker contacts matching the user's criteria.

STRICT RULES:
- Only extract publicly listed PROFESSIONAL/BUSINESS contact details (no personal mobiles, no home addresses).
- Each email/phone MUST include the source URL where it was published.
- email_confidence: "high" only when the email appears verbatim on an official company/source page. "medium" if from a reputable secondary source. Never "low" here — pattern guesses are added separately.
- Prefer the most senior/relevant person matching the requested role.
- relevance_tag: one of "decision_maker", "influencer", "gatekeeper", "advisor", "investor", or "unknown".
- Return [] if nothing credible found. Never invent emails or phones.`;

  const userPrompt = `Searching for:
- Name: ${input.full_name || "(any matching)"}
- Role/Title: ${input.job_title}
- Company: ${input.company_name}
- Location: ${input.location || "(any)"}
- Sector: ${input.sector || "(any)"}

Sources:
${corpus || "(no sources retrieved)"}`;

  try {
    const res = await fetch(AI_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_contacts",
              description: "Submit extracted decision-maker contacts.",
              parameters: {
                type: "object",
                properties: {
                  contacts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        full_name: { type: "string" },
                        role: { type: "string" },
                        company: { type: "string" },
                        email: { type: "string" },
                        email_confidence: { type: "string", enum: ["high", "medium"] },
                        email_source_url: { type: "string" },
                        phone: { type: "string" },
                        phone_confidence: { type: "string", enum: ["high", "medium"] },
                        phone_source_url: { type: "string" },
                        linkedin_url: { type: "string" },
                        relevance_tag: {
                          type: "string",
                          enum: ["decision_maker", "influencer", "gatekeeper", "advisor", "investor", "unknown"],
                        },
                      },
                    },
                  },
                },
                required: ["contacts"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_contacts" } },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      return [];
    }
    const data = await res.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return [];
    const parsed = typeof args === "string" ? JSON.parse(args) : args;
    return Array.isArray(parsed?.contacts) ? parsed.contacts : [];
  } catch (e) {
    console.error("AI extraction exception:", e);
    return [];
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

    // Auth: require admin
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
    if (!body?.job_title || !body?.company_name) {
      return json(400, { error: "job_title and company_name are required" });
    }

    // Create search record
    const { data: searchRow, error: searchErr } = await admin
      .from("dm_finder_searches")
      .insert({
        user_id: userId,
        full_name: body.full_name ?? null,
        job_title: body.job_title,
        company_name: body.company_name,
        location: body.location ?? null,
        sector: body.sector ?? null,
        status: "running",
      })
      .select()
      .single();
    if (searchErr || !searchRow) {
      console.error("Insert search failed:", searchErr);
      return json(500, { error: "Failed to create search" });
    }
    const searchId = searchRow.id;

    // Build queries
    const nameClause = body.full_name ? `"${body.full_name}" ` : "";
    const websiteDomain = body.website ? extractDomain(body.website) : "";
    const siteClause = websiteDomain ? `site:${websiteDomain} ` : "";
    const queries = [
      `${nameClause}"${body.job_title}" "${body.company_name}" email contact`,
      `"${body.company_name}" leadership team ${body.job_title}`,
      `"${body.company_name}" press release ${body.job_title}`,
      `site:linkedin.com/in ${nameClause}${body.job_title} ${body.company_name}`,
      ...(websiteDomain ? [
        `${siteClause}${body.job_title} contact`,
        `${siteClause}team OR leadership OR about`,
      ] : []),
    ];

    // Run searches in parallel
    const searchResults = await Promise.all(queries.map((q) => firecrawlSearch(q, FIRECRAWL_API_KEY, 5)));
    const allPages = searchResults.flat();

    // Dedupe by URL
    const seen = new Set<string>();
    const pages = allPages.filter((p: any) => {
      const u = p?.url;
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return true;
    });

    // Log sources
    if (pages.length) {
      await admin.from("dm_finder_sources").insert(
        pages.slice(0, 30).map((p: any) => ({
          search_id: searchId,
          url: p.url,
          source_type: "firecrawl_search",
          excerpt: (p.description ?? p.markdown ?? "").slice(0, 500),
        })),
      );
    }

    // AI extraction
    const extracted = await extractWithAI(body, pages, LOVABLE_API_KEY);

    // Pattern-based permutations (Low confidence) — add only if AI returned a name + we don't already have a high-confidence email
    const enriched: ExtractedContact[] = [...extracted];
    const baseName = body.full_name || extracted[0]?.full_name || "";
    if (baseName) {
      const hasVerified = extracted.some((c) => c.email && (c.email_confidence === "high" || c.email_confidence === "medium"));
      if (!hasVerified) {
        const perms = patternEmails(baseName, body.company_name, websiteDomain);
        for (const guess of perms) {
          enriched.push({
            full_name: baseName,
            role: body.job_title,
            company: body.company_name,
            email: guess,
            email_confidence: "low",
            email_source_url: null,
            relevance_tag: "unknown",
          });
        }
      }
    }

    // Persist contacts
    if (enriched.length) {
      const rows = enriched.slice(0, 25).map((c) => ({
        search_id: searchId,
        user_id: userId,
        full_name: c.full_name ?? null,
        role: c.role ?? null,
        company: c.company ?? body.company_name,
        email: c.email ?? null,
        email_confidence: c.email_confidence ?? null,
        email_source_url: c.email_source_url ?? null,
        phone: c.phone ?? null,
        phone_confidence: c.phone_confidence ?? null,
        phone_source_url: c.phone_source_url ?? null,
        linkedin_url: c.linkedin_url ?? null,
        relevance_tag: c.relevance_tag ?? null,
        is_inferred: c.email_confidence === "low",
      }));
      const { error: insErr } = await admin.from("dm_finder_contacts").insert(rows);
      if (insErr) console.error("Insert contacts failed:", insErr);
    }

    await admin
      .from("dm_finder_searches")
      .update({ status: "completed", results_count: enriched.length, completed_at: new Date().toISOString() })
      .eq("id", searchId);

    return json(200, { search_id: searchId, contacts: enriched, sources: pages.length });
  } catch (e) {
    console.error("dm-finder-search error:", e);
    return json(500, { error: e instanceof Error ? e.message : "Unknown error" });
  }
});
