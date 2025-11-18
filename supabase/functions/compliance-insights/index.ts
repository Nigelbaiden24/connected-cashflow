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
    const { rules, checks, cases, documents } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert financial compliance analyst. Analyze compliance data and provide actionable insights in JSON format.

Your response must be valid JSON with this exact structure:
{
  "insights": [
    {
      "type": "risk" | "trend" | "suggestion" | "alert",
      "title": "Brief title",
      "description": "Detailed explanation",
      "confidence": number between 0-100,
      "action": "Recommended action",
      "severity": "low" | "medium" | "high" | "critical"
    }
  ],
  "summary": {
    "overallRisk": "low" | "medium" | "high",
    "keyFindings": ["finding1", "finding2", "finding3"],
    "recommendations": ["rec1", "rec2", "rec3"]
  }
}`;

    const userPrompt = `Analyze this compliance data and provide insights:

Rules: ${rules.length} total, ${rules.filter((r: any) => r.enabled).length} enabled
Recent Checks: ${checks.length} performed
- Passed: ${checks.filter((c: any) => c.status === 'pass').length}
- Failed: ${checks.filter((c: any) => c.status === 'fail').length}
- Warnings: ${checks.filter((c: any) => c.status === 'warning').length}

Cases: ${cases.length} total
- Open: ${cases.filter((c: any) => c.status === 'open').length}
- Under Review: ${cases.filter((c: any) => c.status === 'under_review').length}
- Resolved: ${cases.filter((c: any) => c.status === 'resolved').length}

Documents: ${documents.length} total
- Expiring Soon (< 30 days): ${documents.filter((d: any) => d.days_until_expiry && d.days_until_expiry < 30 && d.days_until_expiry > 0).length}
- Expired: ${documents.filter((d: any) => d.days_until_expiry && d.days_until_expiry < 0).length}

Provide 4-6 specific insights focusing on:
1. Risk patterns and trends
2. Document compliance issues
3. Case management efficiency
4. Regulatory adherence recommendations`;

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
    
    // Parse JSON from AI response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      // If AI returns markdown code blocks, extract JSON
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
    console.error("Compliance insights error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        insights: [],
        summary: {
          overallRisk: "unknown",
          keyFindings: [],
          recommendations: []
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
