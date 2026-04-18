import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are FlowPulse's enterprise solutions analyst. Your job is to explain — in clear, premium B2B sales language — how FlowPulse delivers institutional-grade enterprise data and capability for a specific category.

Output strict JSON matching this schema:
{
  "headline": "string (max 12 words, punchy value prop)",
  "intro": "string (2-3 sentences positioning the category)",
  "sections": [
    { "title": "string", "body": "string (2-4 sentences)" }
  ],   // exactly 4 sections covering: 1) What we deliver, 2) Data sources & methodology, 3) Who it's for, 4) Enterprise outcomes
  "capabilities": ["string", ...],  // 5-7 short bullet capabilities
  "dataPoints": [
    { "label": "string", "value": "string" }  // 4 metrics e.g. coverage, refresh rate, asset classes, accuracy
  ],
  "useCases": [
    { "title": "string", "description": "string (1-2 sentences)" }
  ]   // 3 use cases
}

Tone: institutional, confident, specific. No fluff, no emojis, no markdown.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category } = await req.json();
    if (!category) throw new Error("category is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Generate the enterprise data explainer for: "${category}". Focus on how FlowPulse provides institutional-grade ${category} capability to advisors, asset managers, family offices and institutional investors.`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "render_explainer",
                description: "Return the structured explainer payload",
                parameters: {
                  type: "object",
                  properties: {
                    headline: { type: "string" },
                    intro: { type: "string" },
                    sections: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          body: { type: "string" },
                        },
                        required: ["title", "body"],
                        additionalProperties: false,
                      },
                    },
                    capabilities: {
                      type: "array",
                      items: { type: "string" },
                    },
                    dataPoints: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          label: { type: "string" },
                          value: { type: "string" },
                        },
                        required: ["label", "value"],
                        additionalProperties: false,
                      },
                    },
                    useCases: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          description: { type: "string" },
                        },
                        required: ["title", "description"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: [
                    "headline",
                    "intro",
                    "sections",
                    "capabilities",
                    "dataPoints",
                    "useCases",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "render_explainer" },
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments
      ? JSON.parse(toolCall.function.arguments)
      : null;

    if (!args) throw new Error("No structured response from AI");

    return new Response(JSON.stringify({ explainer: args }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enterprise-category-explainer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
