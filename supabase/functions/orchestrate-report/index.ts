import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODULE_PROMPTS: Record<string, string> = {
  "asset-research": `
## ASSET RESEARCH REPORT

Generate a comprehensive single-asset research report including:

### 1) Asset Overview
- Asset name, type, sector, region
- Purpose and structural role (descriptive only)

### 2) Summary Scores & Ratings
- Overall score (0-100)
- Risk score, quality score, valuation score, performance score
- Brief explanation of each score's meaning

### 3) Fundamental or Strategy Analysis
- Key return drivers
- Structural strengths and weaknesses
- Strategy or business consistency

### 4) Risk Profile
- Volatility and drawdown behaviour
- Liquidity and concentration risk
- Governance and regulatory considerations

### 5) Performance Diagnostics
- Historical performance context
- Risk-adjusted behaviour
- Peer-relative positioning

### 6) Valuation & Relative Positioning
- Historical valuation ranges
- Relative attractiveness vs peers
- Use probabilistic, non-directive language only

### 7) Scenario Behaviour
- Historical behaviour in market stress
- Inflationary environments
- Interest rate changes

### 8) Key Watchpoints
- Factors that could materially alter the asset profile
`,

  "weekly-risk": `
## WEEKLY RISK MONITOR

Generate a short-form risk monitoring report including:

### 1) Market Risk Environment Summary
- Current volatility regime
- Liquidity conditions
- Broad risk sentiment (descriptive only)

### 2) Asset-Level Risk Changes
- Assets with rising or falling risk scores
- Newly flagged risk signals

### 3) Volatility & Correlation Observations
- Unusual drawdowns
- Correlation shifts

### 4) Key Risk Drivers
- Macro, sector, or asset-specific factors
`,

  "monthly-quality": `
## MONTHLY ASSET QUALITY REVIEW

Generate a quality-focused review including:

### 1) Quality Framework Overview
- Definition of "quality" used by the platform

### 2) Improving Quality Signals
- Assets with rising quality scores
- Drivers of improvement

### 3) Deteriorating Quality Signals
- Governance, leverage, or execution concerns

### 4) Stability & Consistency Review
- Strategy drift
- Manager, leadership, or protocol changes

### 5) Cross-Asset Observations
- Sector or asset-class quality trends
`,

  "score-alerts": `
## SCORE CHANGE ALERTS

Generate an alert-style report including:

### 1) Summary of Material Score Changes
- Direction and magnitude of changes

### 2) What Changed and Why
- Data-driven explanations
- Analyst overrides clearly labelled

### 3) Risk & Quality Implications
- How the change affects the asset's profile

### 4) Confidence & Data Quality Notes
- Indicate confidence level of the signal
`,

  "thematic-insight": `
## THEMATIC INSIGHT NOTES

Generate a thematic research note including:

### 1) Theme Definition
- Clear explanation of the theme

### 2) Strategic Relevance
- Why the theme matters structurally or cyclically

### 3) Asset & Sector Exposure
- Assets or sectors exhibiting sensitivity

### 4) Risk Considerations
- Execution, regulatory, or adoption risks

### 5) Historical Context
- How similar themes behaved historically

### 6) Key Watchpoints
- Indicators or developments to monitor
`
};

const SYSTEM_PROMPT = `You are an Institutional Client-Facing Research Report Orchestration Engine.

Your role is to generate professional, FCA-safe financial research reports based on user-selected report modules.

You operate strictly as a research and information provider.
You do NOT provide investment advice, recommendations, suitability assessments, or calls to action.

========================
GLOBAL NON-NEGOTIABLE RULES
========================

- Content is informational research only
- No personalised language (e.g., "you should", "we recommend")
- No buy / sell / hold or allocation language
- No suitability statements
- No guarantees, certainty, or promotional tone
- Neutral, professional, institutional style
- Assume a financially literate or professional reader
- Use structured headings and concise bullet points
- Clearly distinguish model-driven outputs from analyst commentary
- Use phrases like "Analyst view", "Model indicates", "Historically observed", "May exhibit", "Relative to peers"

========================
OUTPUT FORMAT
========================

Return a valid JSON object with this structure:
{
  "title": "Report title",
  "generated_date": "YYYY-MM-DD",
  "modules": [
    {
      "module_id": "module identifier",
      "module_title": "Module Title",
      "sections": [
        {
          "heading": "Section Heading",
          "content": "Section content in markdown format"
        }
      ]
    }
  ],
  "disclaimer": "Standard FCA disclaimer text"
}

========================
MANDATORY DISCLAIMER
========================

Always include this disclaimer:
"This report is provided for informational and research purposes only and does not constitute investment advice, a recommendation, or an offer to buy or sell any financial instrument. The analysis is general in nature and does not consider the individual circumstances, objectives, or risk tolerance of any investor."`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { asset_name, asset_type, asset_id, selected_modules, existing_research, custom_context } = await req.json();

    if (!selected_modules || selected_modules.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one module must be selected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build module prompts in priority order
    const moduleOrder = ["asset-research", "weekly-risk", "monthly-quality", "score-alerts", "thematic-insight"];
    const orderedModules = moduleOrder.filter(m => selected_modules.includes(m));
    
    const moduleInstructions = orderedModules
      .map(moduleId => MODULE_PROMPTS[moduleId])
      .join("\n\n---\n\n");

    const userPrompt = `Generate a comprehensive research report for the following asset:

Asset Name: ${asset_name || "General Market"}
Asset Type: ${asset_type || "Multi-Asset"}
Asset ID: ${asset_id || "N/A"}

Selected Modules (in order):
${orderedModules.map((m, i) => `${i + 1}. ${m}`).join("\n")}

${existing_research ? `
Existing Research Data:
${JSON.stringify(existing_research, null, 2)}
` : ""}

${custom_context ? `
Additional Context:
${custom_context}
` : ""}

Module Instructions:
${moduleInstructions}

Generate the complete report following the specified format and all compliance rules. Ensure each module is complete and professionally written.`;

    console.log("Generating report for modules:", orderedModules);

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 8000,
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
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse JSON response
    let reportContent;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      reportContent = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback: structure the content as-is
      reportContent = {
        title: `Research Report: ${asset_name || "General Market"}`,
        generated_date: new Date().toISOString().split("T")[0],
        modules: orderedModules.map(moduleId => ({
          module_id: moduleId,
          module_title: moduleId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          sections: [{ heading: "Content", content }]
        })),
        disclaimer: "This report is provided for informational and research purposes only and does not constitute investment advice, a recommendation, or an offer to buy or sell any financial instrument."
      };
    }

    // Ensure disclaimer is present
    if (!reportContent.disclaimer) {
      reportContent.disclaimer = "This report is provided for informational and research purposes only and does not constitute investment advice, a recommendation, or an offer to buy or sell any financial instrument. The analysis is general in nature and does not consider the individual circumstances, objectives, or risk tolerance of any investor.";
    }

    // Save to database if we have Supabase access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    let reportId = null;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: savedReport, error: saveError } = await supabase
        .from("orchestrated_reports")
        .insert({
          report_title: reportContent.title,
          asset_id: asset_id,
          asset_name: asset_name,
          asset_type: asset_type,
          selected_modules: orderedModules,
          report_content: reportContent,
          status: "completed",
          generated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (saveError) {
        console.error("Failed to save report:", saveError);
      } else {
        reportId = savedReport?.id;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: reportContent,
        report_id: reportId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Report orchestration error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
