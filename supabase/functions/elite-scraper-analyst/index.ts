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
      systemPrompt = `You are a Managing Director-level institutional research analyst producing a formal multi-section research note for ${platformLabel}. Output is read by PMs, family offices and allocators.

Standards: cite specific numbers, names, tickers, dates from source data. Quantify everything. Distinguish facts from interpretation. Never fabricate — if data is thin, lower confidence.

Return STRICT JSON only (no markdown, no prose outside JSON) with this schema:
{
  "title": "string — punchy, specific (e.g. 'AI Capex Cycle: Picks & Shovels Re-rate as Hyperscaler Spend Hits $310B')",
  "subtitle": "string — supporting context with key number",
  "executive_summary": "string (300-450 words). Open with regime call. Cover capital flows, valuation context, deal activity, what's changed. Cite numbers and names throughout.",
  "key_metrics": [{"label":"string","value":"string","change":"string"}],
  "sections": [{"heading":"string","body":"string (300-600 words, paragraphs separated by \\n\\n, dense with specifics)"}],
  "opportunities": [{"name":"string — specific deal/asset","thesis":"string (3-5 sentences with catalyst + horizon)","conviction":"High|Medium|Low","horizon":"string","entry":"string|null","target":"string|null","key_data":"string"}],
  "risks": [{"risk":"string — specific","severity":"High|Medium|Low","mitigation":"string","probability":"string"}],
  "themes": ["4-8 cross-cutting themes"],
  "chart_data": {
    "sentiment": [{"label":"Bullish","value":number},{"label":"Neutral","value":number},{"label":"Bearish","value":number}],
    "category_distribution": [{"label":"string","value":number}],
    "conviction_breakdown": [{"label":"High","value":number},{"label":"Medium","value":number},{"label":"Low","value":number}]
  },
  "data_gaps": ["What additional data would sharpen this call"],
  "conclusion": "string (180-280 words). Synthesise the call, give 3 explicit next-step actions."
}

Numbers in chart_data: sentiment & conviction sum to 100. Provide 5-7 sections, 5-10 opportunities, 4-7 risks, 5-8 key_metrics, 5-10 category_distribution items.`;
      userPrompt = `Platform: ${platformLabel}\nCategory: ${categoryLabel || "General"}\n\nRAW SCRAPED DATA (multiple sources, opportunity-level articles):\n\n${(scrapedData || '').slice(0, 180000)}\n\nProduce the institutional-grade JSON report now.`;
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
