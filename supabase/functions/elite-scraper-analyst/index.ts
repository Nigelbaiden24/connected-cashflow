import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { meteredFetch } from "../_shared/metered.ts";
import { requireAdmin } from "../_shared/guard.ts";

// Scraped pages repeat navigation, cookie banners and syndicated paragraphs.
// Dropping duplicates and capping the size keeps Gemini Pro costs in check.
const MAX_CONTEXT_CHARS = 90_000;
function compactScrape(raw: unknown): string {
  const seen = new Set<string>();
  const out: string[] = [];
  let size = 0;
  for (const para of String(raw ?? "").split(/\n{2,}/)) {
    const p = para.trim();
    if (p.length < 3) continue;
    const key = p.toLowerCase().replace(/\s+/g, " ").slice(0, 200);
    if (seen.has(key)) continue;
    seen.add(key);
    if (size + p.length > MAX_CONTEXT_CHARS) break;
    out.push(p);
    size += p.length + 2;
  }
  return out.join("\n\n");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const denied = await requireAdmin(req, corsHeaders);
  if (denied) return denied;

  try {
    const { mode, platform, scrapedData, categoryLabel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const platformLabel = platform === "investor" ? "FlowPulse Investor" : "FlowPulse Finance";

    let systemPrompt = "";
    let userPrompt = "";
    let model = "google/gemini-2.5-pro";

    if (mode === "explain") {
      systemPrompt = `You are a Managing Director-level institutional research analyst at a tier-1 firm (Goldman Sachs, BlackRock Investment Institute, Pitchbook caliber) writing for ${platformLabel}.

Your job: take the RAW scraped market intelligence and turn it into a sharp, numerically-grounded brief that a sophisticated PM, family office principal, or HNW investor can act on in 5 minutes.

Standards you MUST hit:
- Cite SPECIFIC figures from the data (prices, yields, valuations, raise sizes, multiples, %, dates) — never vague phrases like "strong performance".
- Name SPECIFIC companies, tickers, funds, sponsors, deals, geographies.
- Distinguish hard facts from your interpretation.
- Quantify upside and downside.
- If the source data is thin in one area, say so and lower confidence — never fabricate.
- Plain English, institutional rigour. No fluff, no hedging, no marketing tone.

Use these EXACT section headers (no markdown symbols, just the words on their own line):

WHAT THIS DATA IS
WHY IT MATTERS
KEY THEMES
NOTABLE OPPORTUNITIES
RISKS & CAVEATS
ACTIONABLE TAKEAWAYS
WHAT I'D WATCH NEXT

Target length: 700-1200 words. Use bullet sub-points within sections where helpful (use "•" character).`;
      userPrompt = `Category: ${categoryLabel || "General"}\n\nRAW SCRAPED DATA (multiple sources, opportunity-level articles included):\n\n${compactScrape(scrapedData)}`;
    } else if (mode === "report") {
      systemPrompt = `You are an institutional-grade financial research analyst producing reports for investment professionals (private equity, venture capital, M&A advisors, hedge funds, and corporate strategy teams) at ${platformLabel}.

Your task is to generate a highly structured, data-driven, insight-led report that meets the standards of firms such as PitchBook, AlphaSense, McKinsey, and Goldman Sachs.

REPORT REQUIREMENTS

1. STRUCTURE & FORMAT
- Multi-page report — minimum 5–7 substantive sections
- Each section body MUST be 300–500 words
- Clear section headers; formal, analytical, concise tone
- No generic filler, no surface-level commentary, no repetition

2. CONTENT DEPTH
- Prioritise insight over description
- Every section answers: "What does this mean for investors/operators?"
- Cover: key trends, market drivers, risks, opportunities, forward-looking outlook

3. EVIDENCE DISCIPLINE (non-negotiable — this report is published to paying clients)
- Use figures (percentages, growth rates, deal sizes, market sizing, multiples, yields, valuations) ONLY when they appear in the RAW SCRAPED DATA, and name the source in brackets, e.g. "(FT, 12 Oct)".
- Never invent numbers, deals, investors, tickers, ratings or price targets. Where the data is thin, say so plainly, give a directional view in words, label any estimate "est." and add the gap to data_gaps.
- Separate fact from view: "The data shows…" for facts; "We think…" for judgement.
- No chart or table placeholders in the text — charts and tables are built from the structured fields.

4. INVESTOR INTELLIGENCE LAYER
- Surface top investors / companies / deals
- Capital allocation patterns, strategic moves (acquisitions, expansions, exits)
- Always explain WHY each matters — second-order effects, signalling value

5. DIFFERENTIATION
- Avoid obvious or widely-circulated takes
- Include contrarian angles, second-order effects, hidden trends, dispersion within consensus
- Surface insights not easily found on mainstream platforms

6. OUTPUT STYLE
- Tone suitable for paying institutional clients
- Every paragraph adds new information — no recap, no padding
- Specific names, tickers, sponsors, geographies and dates from the data — never made up

7. CUSTOMISATION LOGIC — adapt sections to report type:
- Market report → trends, flows, outlook, dispersion
- Deal report → transactions, valuations, players, terms
- Company report → performance, strategy, positioning, moat
- Investor report → capital deployment, mandates, track record

8. MANDATORY FINAL SECTION — "Strategic Takeaways"
- Bullet-pointed, high-impact, decision-ready insights

PROCESS: First draft the report, then critically self-review and UPGRADE — sharpen insights, remove any generic statements, increase data specificity, raise authority of tone. Only output the improved final version.

Return STRICT JSON only (no markdown fences, no prose outside JSON) with this schema:
{
  "title": "string — punchy, specific, with a key figure",
  "subtitle": "string — supporting context with key number",
  "report_type": "Market|Deals|Company|Investor",
  "geography": "string",
  "time_period": "string",
  "sector": "string",
  "executive_summary": "string (350-500 words). Regime call, capital flows, valuation context, deal activity, what's changed. Sourced numbers and names only.",
  "key_metrics": [{"label":"string","value":"string","change":"string"}],
  "sections": [{"heading":"string","body":"string (300-500 words, paragraphs separated by \\n\\n, dense with sourced specifics)"}],
  "top_entities": [{"rank":number,"name":"string","category":"Investor|Company|Deal","detail":"string — specific figures","why_it_matters":"string (2-3 sentences)"}],
  "opportunities": [{"name":"string — specific deal/asset","thesis":"string (4-6 sentences with catalyst + horizon + second-order angle)","conviction":"High|Medium|Low","horizon":"string","entry":"string|null — only if stated in the data","target":"string|null — only if stated in the data","key_data":"string"}],
  "risks": [{"risk":"string — specific","severity":"High|Medium|Low","mitigation":"string","probability":"string","second_order":"string"}],
  "themes": ["5-8 cross-cutting themes — each non-obvious"],
  "contrarian_angles": ["3-5 contrarian or hidden-trend insights with reasoning"],
  "chart_data": {
    "sentiment": [{"label":"Bullish","value":number},{"label":"Neutral","value":number},{"label":"Bearish","value":number}],
    "category_distribution": [{"label":"string","value":number}],
    "conviction_breakdown": [{"label":"High","value":number},{"label":"Medium","value":number},{"label":"Low","value":number}]
  },
  "data_gaps": ["What could not be verified from the data, and what would sharpen this call"],
  "sources": [{"name":"string — publication or site","detail":"string — article/page and date if known"}],
  "strategic_takeaways": ["6-10 bullet-pointed, high-impact, decision-ready insights for PMs/operators"],
  "conclusion": "string (250-350 words). Synthesise the call, give 3 explicit next-step actions with timing."
}

Hard rules:
- sentiment & conviction_breakdown values sum to 100
- Provide 5-7 sections, 8-12 opportunities, 5-8 risks, 6-10 key_metrics, 6-10 category_distribution items, 10 top_entities
- Section bodies must each be 300-500 words
- No generic statements — every paragraph carries sourced specifics or a differentiated, reasoned view
- List in "sources" every publication you drew figures from`;
      userPrompt = `Platform: ${platformLabel}\nCategory / Topic: ${categoryLabel || "General"}\n\nINPUT PARAMETERS\n- Report topic: ${categoryLabel || "General market intelligence"}\n- Geography: infer from data (default: Global with UK/US emphasis)\n- Time period: trailing 90 days through forward 12 months\n- Sector: ${categoryLabel || "Cross-sector"}\n- Report type: infer best fit (Market / Deals / Company / Investor) from the data below\n\nRAW SCRAPED DATA (multiple sources, opportunity-level articles):\n\n${compactScrape(scrapedData)}\n\nDraft the institutional-grade JSON report, then self-review and upgrade per the process rules. Return ONLY the improved final JSON.`;
    } else {
      throw new Error("Invalid mode. Use 'explain' or 'report'.");
    }

    const response = await meteredFetch("elite-scraper-analyst", "https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        ...(mode === "report" ? { response_format: { type: "json_object" } } : {}),
      }),
    }, { cacheHours: 24 });

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to your workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    if (mode === "report") {
      let parsed;
      try { parsed = JSON.parse(content); } catch { parsed = { raw: content }; }
      return new Response(JSON.stringify({ report: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ explanation: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("elite-scraper-analyst error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
