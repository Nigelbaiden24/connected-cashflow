// Investor Finder — Apollo.io-style enrichment scraper
// Uses Firecrawl /v2/search + /v2/scrape (with JSON extraction via Lovable AI)
// to pull rich investor profiles: firm, partners, emails, phones, LinkedIn,
// AUM, cheque sizes, sectors, stages, HQ address, portfolio companies.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface SearchHit {
  url: string;
  title?: string;
  description?: string;
  markdown?: string;
}

async function fcSearch(key: string, query: string, limit = 8): Promise<SearchHit[]> {
  const res = await fetch(`${FIRECRAWL_V2}/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      limit,
      tbs: "qdr:y",
      scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.warn("[fcSearch] failed", res.status, JSON.stringify(data).slice(0, 300));
    return [];
  }
  const arr = data?.data?.web ?? data?.web ?? data?.data ?? [];
  return Array.isArray(arr) ? arr : [];
}

async function fcScrape(key: string, url: string): Promise<{ markdown?: string; html?: string } | null> {
  try {
    const res = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 1500,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return null;
    return data?.data ?? data ?? null;
  } catch {
    return null;
  }
}

// Regex helpers — pull contact details directly from raw markdown so we always
// surface real phone numbers / emails when they exist on the page.
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /(\+?\d[\d\s\-().]{8,}\d)/g;
const LINKEDIN_RE = /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|company)\/[A-Za-z0-9_\-%./]+/gi;
const TWITTER_RE = /https?:\/\/(?:twitter|x)\.com\/[A-Za-z0-9_]+/gi;

function extractContacts(text: string) {
  const emails = Array.from(new Set((text.match(EMAIL_RE) ?? []).map(e => e.toLowerCase())))
    .filter(e => !e.includes("example.") && !e.includes("@sentry") && !e.includes("@wixpress"))
    .slice(0, 6);
  const phones = Array.from(new Set((text.match(PHONE_RE) ?? []).map(p => p.replace(/\s+/g, " ").trim())))
    .filter(p => p.replace(/\D/g, "").length >= 9 && p.replace(/\D/g, "").length <= 15)
    .slice(0, 4);
  const linkedin = Array.from(new Set(text.match(LINKEDIN_RE) ?? [])).slice(0, 6);
  const twitter = Array.from(new Set(text.match(TWITTER_RE) ?? [])).slice(0, 4);
  return { emails, phones, linkedin, twitter };
}

async function aiEnrich(apiKey: string, sourceUrl: string, markdown: string) {
  const prompt = `You are an Apollo.io-style data enrichment engine. Extract structured investor / firm intelligence from the page below.

SOURCE URL: ${sourceUrl}

Return ONLY valid JSON matching this schema (omit a field if unknown — never fabricate):
{
  "firm_name": string,
  "firm_type": "VC" | "Angel" | "Angel Network" | "PE" | "Family Office" | "Corporate VC" | "Accelerator" | "Other",
  "website": string,
  "headquarters": string,
  "address": string,
  "founded": string,
  "aum": string,
  "fund_size": string,
  "cheque_size": string,
  "stages": string[],
  "sectors": string[],
  "geographies": string[],
  "thesis": string,
  "team": [{ "name": string, "title": string, "email": string, "phone": string, "linkedin": string }],
  "general_emails": string[],
  "general_phones": string[],
  "linkedin": string,
  "twitter": string,
  "portfolio_companies": string[],
  "recent_investments": [{ "company": string, "round": string, "amount": string, "date": string }],
  "notable_exits": string[]
}

PAGE CONTENT (truncated):
${markdown.slice(0, 12000)}`;

  const res = await fetch(LOVABLE_AI, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You output strict JSON only — no commentary, no markdown fences." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    console.warn("[aiEnrich] AI failed", res.status, (await res.text()).slice(0, 200));
    return null;
  }
  const data = await res.json();
  const txt = data?.choices?.[0]?.message?.content ?? "{}";
  try { return JSON.parse(txt); } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY missing");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const body = await req.json().catch(() => ({}));
    const category: string = body.category ?? "investors";
    const query: string = body.query ?? "";
    const investorType: string = body.investorType ?? "All";
    const stage: string = body.stage ?? "All";
    const sector: string = body.sector ?? "All";
    const region: string = body.region ?? "UK";
    const maxResults: number = Math.min(Number(body.maxResults ?? 12), 20);

    // Build Apollo-grade search queries
    const filters = [
      investorType !== "All" ? investorType : "",
      sector !== "All" ? sector : "",
      stage !== "All" ? `${stage} stage` : "",
      region,
    ].filter(Boolean).join(" ");

    const baseQueries: Record<string, string[]> = {
      investors: [
        `${region} ${investorType !== "All" ? investorType : "venture capital"} firm "team" contact ${sector !== "All" ? sector : ""} ${query}`.trim(),
        `${region} ${sector !== "All" ? sector : "tech"} investors partners email "get in touch" ${query}`.trim(),
        `site:linkedin.com/company ${region} ${investorType !== "All" ? investorType : "venture"} ${sector !== "All" ? sector : ""}`.trim(),
        `${region} angel investor network ${sector !== "All" ? sector : ""} contact ${query}`.trim(),
      ],
      funding: [
        `${region} startup funding round ${sector !== "All" ? sector : ""} ${stage !== "All" ? stage : ""} ${query} 2025`.trim(),
        `${region} ${sector !== "All" ? sector : ""} raises announcement investors led ${query}`.trim(),
      ],
      buyouts: [
        `${region} ${sector !== "All" ? sector : ""} acquisition buyout ${query} 2025`.trim(),
        `${region} private equity ${sector !== "All" ? sector : ""} acquires ${query}`.trim(),
      ],
    };

    const queries = baseQueries[category] ?? baseQueries.investors;
    console.log("[investor-finder] queries", queries);

    // 1) Discover candidate URLs
    const hitsByUrl = new Map<string, SearchHit>();
    for (const q of queries) {
      const hits = await fcSearch(FIRECRAWL_API_KEY, q, 6);
      for (const h of hits) if (h.url && !hitsByUrl.has(h.url)) hitsByUrl.set(h.url, h);
      if (hitsByUrl.size >= maxResults * 2) break;
    }

    const candidates = Array.from(hitsByUrl.values()).slice(0, maxResults);
    console.log(`[investor-finder] ${candidates.length} candidate URLs`);

    // 2) Scrape + enrich each in parallel (capped concurrency)
    const enriched: any[] = [];
    const concurrency = 4;
    for (let i = 0; i < candidates.length; i += concurrency) {
      const batch = candidates.slice(i, i + concurrency);
      const out = await Promise.all(batch.map(async (hit) => {
        const md = hit.markdown ?? (await fcScrape(FIRECRAWL_API_KEY, hit.url))?.markdown ?? "";
        const text = `${hit.title ?? ""}\n${hit.description ?? ""}\n${md}`;
        const contactsRaw = extractContacts(text);
        const ai = md.length > 400 ? await aiEnrich(LOVABLE_API_KEY, hit.url, md) : null;

        const merged = {
          source_url: hit.url,
          source_title: hit.title ?? null,
          source_snippet: hit.description ?? null,
          firm_name: ai?.firm_name ?? hit.title ?? null,
          firm_type: ai?.firm_type ?? (investorType !== "All" ? investorType : null),
          website: ai?.website ?? null,
          headquarters: ai?.headquarters ?? null,
          address: ai?.address ?? null,
          founded: ai?.founded ?? null,
          aum: ai?.aum ?? null,
          fund_size: ai?.fund_size ?? null,
          cheque_size: ai?.cheque_size ?? null,
          stages: ai?.stages ?? (stage !== "All" ? [stage] : []),
          sectors: ai?.sectors ?? (sector !== "All" ? [sector] : []),
          geographies: ai?.geographies ?? [region],
          thesis: ai?.thesis ?? null,
          team: Array.isArray(ai?.team) ? ai.team : [],
          general_emails: Array.from(new Set([...(ai?.general_emails ?? []), ...contactsRaw.emails])).slice(0, 6),
          general_phones: Array.from(new Set([...(ai?.general_phones ?? []), ...contactsRaw.phones])).slice(0, 4),
          linkedin: ai?.linkedin ?? contactsRaw.linkedin[0] ?? null,
          twitter: ai?.twitter ?? contactsRaw.twitter[0] ?? null,
          all_linkedin_profiles: contactsRaw.linkedin,
          portfolio_companies: ai?.portfolio_companies ?? [],
          recent_investments: ai?.recent_investments ?? [],
          notable_exits: ai?.notable_exits ?? [],
          enriched_at: new Date().toISOString(),
        };
        return merged;
      }));
      enriched.push(...out.filter(Boolean));
    }

    // Rank: more contact data = higher score
    enriched.sort((a, b) => {
      const score = (x: any) =>
        (x.general_emails?.length ?? 0) * 3 +
        (x.general_phones?.length ?? 0) * 4 +
        (x.team?.length ?? 0) * 2 +
        (x.linkedin ? 2 : 0) +
        (x.aum ? 1 : 0) +
        (x.portfolio_companies?.length ?? 0);
      return score(b) - score(a);
    });

    return new Response(
      JSON.stringify({
        success: true,
        category,
        filters: { investorType, stage, sector, region, query },
        count: enriched.length,
        results: enriched,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[investor-finder-scraper] error", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
