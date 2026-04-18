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

    if (mode === "explain") {
      systemPrompt = `You are an elite institutional research analyst for ${platformLabel}.
You explain raw scraped market intelligence in clear, plain English for a sophisticated but time-poor audience.
Structure your response with these EXACT sections (use these as headers, no markdown symbols):

WHAT THIS DATA IS
WHY IT MATTERS
KEY THEMES
NOTABLE OPPORTUNITIES
RISKS & CAVEATS
ACTIONABLE TAKEAWAYS

Be specific, cite numbers from the data when present, and avoid fluff. 350-600 words total.`;
      userPrompt = `Category: ${categoryLabel || "General"}\n\nScraped data to explain:\n\n${scrapedData}`;
    } else if (mode === "report") {
      systemPrompt = `You are an elite institutional research analyst producing a formal multi-section report for ${platformLabel}.
Return STRICT JSON only (no markdown, no prose outside JSON) with this schema:
{
  "title": "string",
  "subtitle": "string",
  "executive_summary": "string (150-250 words)",
  "key_metrics": [{"label":"string","value":"string","change":"string"}],
  "sections": [{"heading":"string","body":"string (200-400 words paragraphs separated by \\n\\n)"}],
  "opportunities": [{"name":"string","thesis":"string","conviction":"High|Medium|Low","horizon":"string"}],
  "risks": [{"risk":"string","severity":"High|Medium|Low","mitigation":"string"}],
  "chart_data": {
    "sentiment": [{"label":"Bullish","value":number},{"label":"Neutral","value":number},{"label":"Bearish","value":number}],
    "category_distribution": [{"label":"string","value":number}],
    "conviction_breakdown": [{"label":"High","value":number},{"label":"Medium","value":number},{"label":"Low","value":number}]
  },
  "conclusion": "string (100-200 words)"
}
Numbers in chart_data must sum sensibly (sentiment & conviction sum to 100). Provide 4-6 sections, 3-6 opportunities, 3-5 risks, 4-6 key_metrics, 4-8 category_distribution items.`;
      userPrompt = `Platform: ${platformLabel}\nCategory: ${categoryLabel || "General"}\n\nRaw scraped data:\n\n${scrapedData}\n\nProduce the JSON report now.`;
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
        model: "google/gemini-2.5-flash",
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
