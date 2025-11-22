import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's portfolio and risk data
    const { data: portfolio } = await supabase
      .from("user_portfolios")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: holdings } = await supabase
      .from("portfolio_holdings")
      .select("*")
      .eq("user_id", user.id);

    const { data: riskReports } = await supabase
      .from("risk_assessment_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert financial risk analyst. Analyze portfolio risk data and provide actionable insights in JSON format.

Your response must be valid JSON with this exact structure:
{
  "riskScore": number between 0-10,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "insights": [
    {
      "type": "risk" | "opportunity" | "warning" | "recommendation",
      "title": "Brief title",
      "description": "Detailed explanation",
      "priority": "low" | "medium" | "high" | "critical",
      "actionable": true/false,
      "action": "Specific action to take (if actionable)"
    }
  ],
  "keyMetrics": {
    "volatility": "description",
    "concentration": "description",
    "diversification": "description",
    "marketExposure": "description"
  },
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

    const userPrompt = `Analyze this portfolio risk data:

Portfolio Value: ${portfolio?.total_value || 0}
Number of Holdings: ${holdings?.length || 0}
Recent Risk Reports: ${riskReports?.length || 0}

Holdings Summary:
${holdings?.map((h: any) => `- ${h.symbol}: ${h.quantity} shares, Value: $${h.current_value}`).join('\n') || 'No holdings'}

Recent Risk Assessments:
${riskReports?.map((r: any) => `- ${r.report_type}: ${r.summary}`).join('\n') || 'No recent assessments'}

Provide 4-6 specific insights focusing on:
1. Portfolio concentration risks
2. Market exposure and volatility
3. Diversification opportunities
4. Risk mitigation strategies`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI risk analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        riskScore: 0,
        riskLevel: "unknown",
        insights: [],
        keyMetrics: {},
        recommendations: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
