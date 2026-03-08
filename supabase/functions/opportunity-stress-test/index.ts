import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { opportunity } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an elite institutional investment stress-test engine. Given an investment opportunity's parameters, you MUST return a JSON object (no markdown, no code fences, just raw JSON) with the following structure:

{
  "scenarios": [
    {
      "id": "string (unique slug)",
      "title": "string (short scenario name)",
      "description": "string (1-2 sentence explanation of the stress condition)",
      "trigger": "string (what causes this scenario)",
      "severity": "low" | "medium" | "high" | "critical",
      "probability": number (0-100, likelihood %),
      "metrics": {
        "original_irr": number,
        "stressed_irr": number,
        "irr_delta": number,
        "original_moic": number,
        "stressed_moic": number,
        "moic_delta": number,
        "original_return": number,
        "stressed_return": number,
        "return_delta": number,
        "cashflow_impact_pct": number,
        "recovery_months": number,
        "capital_at_risk_pct": number
      }
    }
  ],
  "overall_risk_score": number (1-100),
  "risk_rating": "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk",
  "worst_case_summary": "string (2-3 sentences describing the worst realistic outcome)",
  "mitigation_strategies": ["string array of 4-6 actionable risk mitigation strategies"],
  "stress_conclusion": "string (3-4 sentence professional conclusion)"
}

Generate exactly 6 scenarios covering these stress dimensions:
1. Exit delay (holding period extended 2-5 years)
2. Income/revenue decline (rental income, revenue, or yield drops 10-30%)
3. Market downturn (broader market crash affecting valuations)
4. Interest rate shock (rates rise 200-400bps)
5. Operational failure (management issues, cost overruns, vacancy)
6. Liquidity crisis (inability to exit, forced sale at discount)

Use the opportunity's actual numbers to calculate realistic stressed metrics. Be quantitatively rigorous - every number must be derivable from the inputs. IRR calculations should account for compounding effects properly.`;

    const userPrompt = `Stress test this investment opportunity:

Asset Type: ${opportunity.assetType || "Not specified"}
Investment Name: ${opportunity.name || "Not specified"}
Investment Amount: £${(opportunity.investmentAmount || 100000).toLocaleString()}
Expected Return/Yield: ${opportunity.expectedReturn || 12}%
Expected IRR: ${opportunity.expectedIRR || 14}%
Expected MOIC: ${opportunity.expectedMOIC || 2.0}x
Holding Period: ${opportunity.holdingPeriod || 5} years
Income Type: ${opportunity.incomeType || "Not specified"}
Annual Income/Cashflow: £${(opportunity.annualIncome || 0).toLocaleString()}
Leverage/Debt: ${opportunity.leverage || 0}%
Sector: ${opportunity.sector || "Not specified"}
Geography: ${opportunity.geography || "UK"}

Additional context: ${opportunity.additionalContext || "None provided"}

Generate the stress test analysis now.`;

    console.log("Opportunity stress test request:", { name: opportunity.name, assetType: opportunity.assetType });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the AI response, stripping any markdown fences
    let parsed;
    try {
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      throw new Error("Failed to parse stress test results");
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Opportunity stress test error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
