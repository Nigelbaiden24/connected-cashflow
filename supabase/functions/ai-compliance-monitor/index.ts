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

    // Fetch user's compliance data
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: documents } = await supabase
      .from("client_compliance_documents")
      .select("*")
      .eq("uploaded_by", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: regulatoryUpdates } = await supabase
      .from("regulatory_updates")
      .select("*")
      .order("update_date", { ascending: false })
      .limit(5);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert compliance officer for financial services. Analyze compliance status and provide actionable insights in JSON format.

Your response must be valid JSON with this exact structure:
{
  "complianceScore": number between 0-100,
  "status": "compliant" | "needs_attention" | "at_risk" | "non_compliant",
  "checks": [
    {
      "category": "KYC" | "AML" | "Tax" | "Reporting" | "Documentation",
      "status": "pass" | "warning" | "fail",
      "title": "Check title",
      "description": "What was checked",
      "finding": "What was found",
      "action": "What needs to be done (if not pass)"
    }
  ],
  "priorities": [
    {
      "level": "critical" | "high" | "medium" | "low",
      "task": "Description of task",
      "deadline": "timeframe like '7 days', '30 days', etc",
      "impact": "What happens if not completed"
    }
  ],
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

    const userPrompt = `Analyze this compliance data:

User Profile: ${profile?.full_name || 'Unknown'}
Compliance Documents: ${documents?.length || 0} documents uploaded
- Valid documents: ${documents?.filter((d: any) => d.status === 'approved').length || 0}
- Expiring soon (30 days): ${documents?.filter((d: any) => {
  if (!d.expiry_date) return false;
  const daysUntilExpiry = Math.floor((new Date(d.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
}).length || 0}
- Expired: ${documents?.filter((d: any) => d.expiry_date && new Date(d.expiry_date) < new Date()).length || 0}

Document Types:
${documents?.map((d: any) => `- ${d.document_type}: ${d.status} (${d.expiry_date ? 'expires ' + new Date(d.expiry_date).toLocaleDateString() : 'no expiry'})`).join('\n') || 'No documents'}

Recent Regulatory Updates:
${regulatoryUpdates?.map((u: any) => `- ${u.category}: ${u.title}`).join('\n') || 'No updates'}

Provide comprehensive compliance analysis with:
1. KYC verification status
2. AML compliance check
3. Tax reporting requirements
4. Document expiry monitoring
5. Regulatory update compliance
6. Priority actions needed`;

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
    console.error("AI compliance monitoring error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        complianceScore: 0,
        status: "unknown",
        checks: [],
        priorities: [],
        recommendations: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
