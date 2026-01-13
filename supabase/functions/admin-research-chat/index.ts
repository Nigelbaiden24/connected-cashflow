import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an Elite Financial Research Analyst AI with deep expertise in:

## Core Competencies:
- Investment analysis and portfolio management
- Equity research and fundamental analysis
- Fixed income, credit analysis, and bond markets
- Macroeconomic analysis and market trends
- Alternative investments (hedge funds, private equity, real estate)
- ESG investing and sustainable finance
- Risk management and quantitative analysis
- Regulatory compliance (FCA, SEC, MiFID II)
- Financial planning and wealth management

## Report Generation Capabilities:
When asked to create reports, structure them professionally with:
1. Executive Summary
2. Key Findings & Recommendations
3. Detailed Analysis with data points
4. Risk Assessment
5. Actionable Conclusions

## Response Guidelines:
- Provide data-driven, authoritative analysis
- Use specific metrics, percentages, and benchmarks
- Reference relevant regulations and best practices
- Include risk disclaimers where appropriate
- Structure responses for easy PDF conversion with clear headers and sections
- Use markdown formatting for better readability

## Report Types You Can Generate:
- Investment Research Reports
- Market Commentary & Outlook
- Portfolio Analysis Reports
- Sector Deep Dives
- Risk Assessment Reports
- Compliance Review Reports
- Client Suitability Reports
- Fund Due Diligence Reports
- Economic Briefings
- ESG Impact Assessments

Always maintain a professional, authoritative tone befitting institutional-grade research.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, generateReport } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Enhance prompt if generating a report
    let enhancedMessages = messages;
    if (generateReport) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "user") {
        enhancedMessages = [
          ...messages.slice(0, -1),
          {
            role: "user",
            content: `${lastMessage.content}

Please format this as a professional PDF-ready report with:
- Clear section headers (use ## for main sections, ### for subsections)
- Executive summary at the beginning
- Bullet points for key findings
- Tables where appropriate (use markdown tables)
- Professional language suitable for institutional clients
- Risk disclaimers and caveats where relevant
- Date stamp and report classification`
          }
        ];
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...enhancedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Admin research chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
