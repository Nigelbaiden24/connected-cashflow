import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
      userPrompt = `Category: ${categoryLabel || "General"}\n\nRAW SCRAPED DATA (multiple sources, opportunity-level articles included):\n\n${(scrapedData || '').slice(0, 180000)}`;
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

3. DATA INTEGRATION
- Embed realistic, plausible data points throughout (percentages, growth rates, deal volumes, market sizing, multiples, yields, valuations)
- Cite figures from the source data where present; where the source is thin, use plausible directional estimates and flag confidence
- Embed chart placeholders inline within section bodies using EXACT syntax:
  [INSERT BAR CHART: X vs Y]
  [INSERT LINE GRAPH: Trend over time]
  [INSERT TABLE: Top entities]
- Each section should contain at least one chart/table placeholder where it adds analytical value

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
- Specific names, tickers, sponsors, geographies, dates throughout

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
  "executive_summary": "string (350-500 words). Regime call, capital flows, valuation context, deal activity, what's changed. Specific numbers and names throughout. Embed at least one chart placeholder.",
  "key_metrics": [{"label":"string","value":"string","change":"string"}],
  "sections": [{"heading":"string","body":"string (300-500 words STRICT, paragraphs separated by \\n\\n, dense with specifics, contains at least one [INSERT BAR CHART: ...] / [INSERT LINE GRAPH: ...] / [INSERT TABLE: ...] placeholder)"}],
  "top_entities": [{"rank":number,"name":"string","category":"Investor|Company|Deal","detail":"string — specific figures","why_it_matters":"string (2-3 sentences)"}],
  "opportunities": [{"name":"string — specific deal/asset","thesis":"string (4-6 sentences with catalyst + horizon + second-order angle)","conviction":"High|Medium|Low","horizon":"string","entry":"string|null","target":"string|null","key_data":"string"}],
  "risks": [{"risk":"string — specific","severity":"High|Medium|Low","mitigation":"string","probability":"string","second_order":"string"}],
  "themes": ["5-8 cross-cutting themes — each non-obvious"],
  "contrarian_angles": ["3-5 contrarian or hidden-trend insights with reasoning"],
  "chart_data": {
    "sentiment": [{"label":"Bullish","value":number},{"label":"Neutral","value":number},{"label":"Bearish","value":number}],
    "category_distribution": [{"label":"string","value":number}],
    "conviction_breakdown": [{"label":"High","value":number},{"label":"Medium","value":number},{"label":"Low","value":number}]
  },
  "data_gaps": ["What additional data would sharpen this call"],
  "strategic_takeaways": ["6-10 bullet-pointed, high-impact, decision-ready insights for PMs/operators"],
  "conclusion": "string (250-350 words). Synthesise the call, give 3 explicit next-step actions with timing."
}

Hard rules:
- sentiment & conviction_breakdown values sum to 100
- Provide 5-7 sections, 8-12 opportunities, 5-8 risks, 6-10 key_metrics, 6-10 category_distribution items, 10 top_entities
- Section bodies must each be 300-500 words AND include at least one chart/table placeholder
- No generic statements — every sentence carries a specific data point, name, or differentiated view`;
      userPrompt = `Platform: ${platformLabel}\nCategory / Topic: ${categoryLabel || "General"}\n\nINPUT PARAMETERS\n- Report topic: ${categoryLabel || "General market intelligence"}\n- Geography: infer from data (default: Global with UK/US emphasis)\n- Time period: trailing 90 days through forward 12 months\n- Sector: ${categoryLabel || "Cross-sector"}\n- Report type: infer best fit (Market / Deals / Company / Investor) from the data below\n\nRAW SCRAPED DATA (multiple sources, opportunity-level articles):\n\n${(scrapedData || '').slice(0, 180000)}\n\nDraft the institutional-grade JSON report, then self-review and upgrade per the process rules. Return ONLY the improved final JSON.`;
    } else {
      throw new Error("Invalid mode. Use 'explain' or 'report'.");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
    });

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
