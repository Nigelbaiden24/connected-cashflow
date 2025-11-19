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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate regulatory updates using AI
    const categories = ["sec", "crypto", "tax", "international"];
    const updates = [];

    for (const category of categories) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are a regulatory compliance expert. Generate realistic and informative regulatory updates for financial services.",
            },
            {
              role: "user",
              content: `Generate a recent regulatory update for the ${category} category. Include title, detailed summary (2-3 sentences), and full content (3-4 paragraphs) with actionable insights for investors. Make it relevant to current market conditions.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error(`AI API error for ${category}:`, response.status);
        continue;
      }

      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content || "";

      // Parse AI response
      const lines = content.split("\n").filter((line: string) => line.trim());
      const title = lines[0]?.replace(/^#*\s*/, "").replace(/^Title:\s*/i, "") || `${category.toUpperCase()} Regulatory Update`;
      const summary = lines[1]?.replace(/^Summary:\s*/i, "") || "Important regulatory update";
      const fullContent = lines.slice(2).join("\n\n") || content;

      updates.push({
        category,
        title,
        summary,
        content: fullContent,
        source: "AI Generated - Based on Industry Analysis",
        ai_generated: true,
      });
    }

    // Save to database
    const { data: savedUpdates, error: insertError } = await supabase
      .from("regulatory_updates")
      .insert(updates)
      .select();

    if (insertError) {
      console.error("Error saving updates:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      updates: savedUpdates,
      count: savedUpdates?.length || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Generate regulatory updates error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});