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
    const { tasks, projects, workflows } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI business analyst for a project management platform. Analyze the provided data and generate actionable recommendations.

Your recommendations should:
- Be specific and actionable
- Prioritize based on urgency and impact
- Focus on optimization opportunities
- Identify risks and bottlenecks

Return a JSON array of recommendations with this structure:
{
  "recommendations": [
    {
      "type": "warning" | "suggestion" | "success",
      "title": "Brief title",
      "description": "Detailed recommendation",
      "actionLabel": "Action button text (optional)"
    }
  ]
}`;

    const userPrompt = `Analyze this business data and provide 3-5 smart recommendations:

Tasks: ${tasks.length} total
- Unassigned: ${tasks.filter((t: any) => !t.assigned_to && t.status !== 'completed').length}
- High Priority: ${tasks.filter((t: any) => t.priority === 'high' || t.priority === 'critical').length}
- Overdue: ${tasks.filter((t: any) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length}

Projects: ${projects.length} total
- At Risk: ${projects.filter((p: any) => p.health_status === 'at-risk' || p.health_status === 'behind').length}
- Over Budget: ${projects.filter((p: any) => p.actual_cost && p.budget && p.actual_cost > p.budget).length}

Workflows: ${workflows.length} total
- Inactive: ${workflows.filter((w: any) => {
  if (!w.last_run_at) return true;
  const daysSinceRun = (Date.now() - new Date(w.last_run_at).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceRun > 7;
}).length}
- Failed: ${workflows.filter((w: any) => w.failure_count && w.failure_count > 0).length}`;

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
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const recommendations = JSON.parse(content);

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("business-recommendations error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
