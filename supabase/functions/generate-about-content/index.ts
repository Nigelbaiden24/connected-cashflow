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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a professional business content writer for FlowPulse, a leading enterprise software company. 
Write compelling, professional content that explains FlowPulse's mission and value proposition. 
Focus on: innovation, professionalism, efficiency, and how FlowPulse transforms professional workflows.
Keep the tone sophisticated but accessible. Write 3-4 paragraphs.`;

    const userPrompt = `Write an engaging overview of FlowPulse's mission and what makes it unique as a company offering three specialized platforms for financial advisors, business professionals, and investors.`;

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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded",
            content: "FlowPulse is revolutionizing professional services with three integrated platforms designed for financial advisors, business professionals, and investors. Our mission is to empower professionals with intelligent, integrated solutions that streamline workflows and drive better outcomes."
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "FlowPulse delivers enterprise-grade solutions across three specialized platforms.";

    return new Response(
      JSON.stringify({ content }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error generating content:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        content: "FlowPulse is revolutionizing professional services with three integrated platforms designed for financial advisors, business professionals, and investors. Our mission is to empower professionals with intelligent, integrated solutions that streamline workflows and drive better outcomes."
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
