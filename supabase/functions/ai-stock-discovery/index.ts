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
    const { filters } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build filter description
    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => {
        const filterNames: Record<string, string> = {
          lowDebt: "Low debt-to-equity ratio (< 0.5)",
          strongMargins: "Strong profit margins (> 15%)",
          highGrowth: "High revenue growth (> 20% YoY)",
          undervalued: "Undervalued (P/E ratio < industry average)",
          strongCashFlow: "Strong free cash flow",
          dividendPaying: "Consistent dividend payment history",
          marketLeader: "Market leadership position",
          innovativeTech: "Strong innovation and R&D investment",
        };
        return filterNames[key] || key;
      });

    if (activeFilters.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please select at least one filter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert financial analyst and stock screener AI. Your role is to discover and recommend high-quality investment opportunities based on specific criteria.

When analyzing stocks, you should:
1. Focus on fundamental analysis
2. Consider both quantitative metrics and qualitative factors
3. Prioritize companies with sustainable competitive advantages
4. Evaluate management quality and corporate governance
5. Assess industry trends and market positioning

Return your recommendations in a structured JSON format.`;

    const userPrompt = `Discover 5-7 high-quality stock investment opportunities that match these criteria:

${activeFilters.map((f, i) => `${i + 1}. ${f}`).join("\n")}

For each stock, provide:
1. Ticker symbol (real, publicly traded companies)
2. Company name
3. Current price range (approximate)
4. AI confidence score (0-100)
5. Upside potential percentage
6. Number of matched criteria
7. Brief insight (1-2 sentences explaining why it matches)
8. Key metrics that support the recommendation

Format your response as a JSON array of objects with these exact fields:
{
  "symbol": "TICKER",
  "name": "Company Name",
  "price": "$XXX.XX",
  "aiScore": 85,
  "potential": "+25%",
  "matched": 6,
  "insight": "Brief explanation...",
  "keyMetrics": {
    "pe": 15.5,
    "growth": "22%",
    "margin": "18%"
  }
}

Focus on well-known, liquid stocks from various sectors. Be realistic with valuations and potential returns.`;

    console.log("Sending request to AI with filters:", activeFilters);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits depleted. Please add more credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    console.log("AI Response received");

    // Extract JSON from the response
    let discoveries = [];
    try {
      // Try to parse as direct JSON
      discoveries = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        discoveries = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON array in the text
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          discoveries = JSON.parse(arrayMatch[0]);
        }
      }
    }

    if (!Array.isArray(discoveries) || discoveries.length === 0) {
      console.error("Failed to parse discoveries:", content);
      throw new Error("Invalid response format from AI");
    }

    console.log(`Successfully discovered ${discoveries.length} opportunities`);

    return new Response(
      JSON.stringify({ 
        discoveries,
        filtersSummary: activeFilters.join(", "),
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-stock-discovery:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to discover opportunities" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});