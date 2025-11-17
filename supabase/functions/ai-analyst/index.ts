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
    const { query, analysisType, company } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = query;

    // Set system prompt based on analysis type
    switch (analysisType) {
      case "company-qa":
        systemPrompt = `You are a financial analyst AI assistant specialized in providing detailed insights about companies. 
        Provide comprehensive, accurate, and actionable analysis. Include specific metrics, historical context, and market positioning when relevant.`;
        break;
      case "trends":
        systemPrompt = `You are a market trends analyst. Analyze current market trends, sector performance, and emerging patterns. 
        Provide data-driven insights with specific examples and quantifiable metrics. Focus on actionable trend analysis.`;
        userPrompt = company ? `Analyze current trends for ${company}: ${query}` : query;
        break;
      case "research-summary":
        systemPrompt = `You are a research analyst creating executive summaries. Generate comprehensive research summaries that cover:
        - Key business metrics and financial performance
        - Market position and competitive advantages
        - Growth prospects and risks
        - Recent developments and strategic initiatives
        Keep summaries concise but informative (300-500 words).`;
        userPrompt = company ? `Generate a comprehensive research summary for ${company}` : query;
        break;
      case "qa-filings":
        systemPrompt = `You are a financial document analyst specialized in SEC filings and earnings calls. 
        Provide detailed answers based on standard financial reporting practices. Include relevant sections, metrics, and context.
        If discussing earnings, mention revenue, EPS, guidance, and key strategic points.`;
        userPrompt = company ? `Regarding ${company}'s filings and earnings: ${query}` : query;
        break;
      case "swot":
        systemPrompt = `You are a strategic analyst creating SWOT (Strengths, Weaknesses, Opportunities, Threats) analyses.
        Provide a detailed SWOT analysis with:
        - 4-5 key points for each category
        - Specific examples and evidence
        - Market context and competitive positioning
        Format as clear sections with bullet points.`;
        userPrompt = company ? `Generate a comprehensive SWOT analysis for ${company}` : query;
        break;
      case "valuation":
        systemPrompt = `You are a valuation analyst providing commentary on company valuations.
        Include analysis of:
        - Current valuation metrics (P/E, P/S, EV/EBITDA, etc.)
        - Comparison to industry peers
        - Growth expectations vs. valuation
        - Key value drivers and risks
        Provide balanced perspective with both bullish and bearish considerations.`;
        userPrompt = company ? `Provide valuation commentary for ${company}` : query;
        break;
      default:
        systemPrompt = `You are an expert financial analyst and investment advisor. 
        Provide detailed, accurate, and actionable insights. Use specific examples and data when possible.`;
    }

    console.log("AI Analyst request:", { analysisType, company, query: query.substring(0, 100) });

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
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI analyst error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
