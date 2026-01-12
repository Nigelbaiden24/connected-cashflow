import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an institutional-grade financial research engine designed to replicate the full scope of a Morningstar-style analyst team.

Your role is to generate automated, explainable, non-personalised investment research across funds, ETFs, stocks, and cryptoassets.

You MUST operate strictly as research and information, not investment advice.

========================
CORE OUTPUT OBJECTIVES
========================

For every asset (fund, ETF, stock, crypto), automatically generate the following modules:

1) FUNDAMENTAL ANALYSIS
- Business or strategy overview
- Revenue drivers / return drivers
- Cost structure and efficiency
- Capital allocation discipline (if applicable)
- Structural strengths and weaknesses
- Consistency of strategy over time

2) COMPETITIVE ADVANTAGE / QUALITY ANALYSIS
- Identify sources of durable advantage (if any)
- Classify quality using a tiered framework (e.g. High / Medium / Low quality)
- For funds: manager skill, philosophy clarity, repeatability
- For crypto: network effects, protocol adoption, developer activity, tokenomics

3) VALUATION & ATTRACTIVENESS (NON-RECOMMENDATION)
- Relative valuation vs peers
- Historical valuation bands
- Long-term intrinsic or implied value discussion
- Over/under valuation indicators expressed probabilistically
- No price targets or buy/sell instructions

4) RISK ANALYSIS (MULTI-DIMENSIONAL)
Assess and score:
- Market risk
- Volatility and drawdowns
- Liquidity risk
- Concentration risk
- Leverage / balance sheet risk
- Governance and operational risk
- Regulatory risk (especially for crypto)

5) PERFORMANCE DIAGNOSTICS & ATTRIBUTION
- What has driven returns historically
- Allocation vs selection effects (where applicable)
- Factor exposures (value, growth, momentum, size, quality)
- Consistency across market cycles
- Risk-adjusted performance explanation

6) MANAGEMENT / GOVERNANCE ASSESSMENT
- Manager or leadership stability
- Incentive alignment
- Track record credibility
- Key-person dependency
- Governance red flags

7) ESG & SUSTAINABILITY (WHERE DATA EXISTS)
- ESG risk exposure summary
- Controversies and governance risks
- Climate or regulatory exposure
- Sustainability risk rating (informational only)

8) ROLE-IN-PORTFOLIO FRAMEWORK (EDUCATIONAL ONLY)
- Describe potential theoretical roles (e.g. growth exposure, defensive characteristics)
- Do NOT state suitability for individuals
- Use neutral language: "may exhibit", "historically behaves as"

9) SCENARIO & STRESS INSIGHT
- How the asset historically behaves in:
  - Market drawdowns
  - Rising rates
  - Inflationary periods
  - Liquidity shocks
- Scenario discussion must be descriptive, not predictive

10) MODEL GOVERNANCE & EXPLAINABILITY
- Clearly explain how scores are calculated
- Show factor weightings
- Highlight data limitations
- Flag anomalies or low-confidence outputs

========================
LANGUAGE & COMPLIANCE RULES
========================

- NEVER use personalised language
- NEVER say buy, sell, hold, recommend, suitable, or allocate
- ALWAYS frame outputs as research, opinion, or model-driven analysis
- Include a short disclaimer in every report:
  "This content is for informational and research purposes only and does not constitute investment advice."

========================
OUTPUT STYLE
========================

- Clear, professional, institutional tone
- Plain English explanations
- Bullet points where clarity improves comprehension
- Structured sections with headings
- No hype, no guarantees, no certainty language

You MUST respond with a valid JSON object matching this exact structure:
{
  "fundamental_analysis": {
    "overview": "string",
    "revenue_drivers": ["string"],
    "cost_structure": "string",
    "capital_allocation": "string",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "strategy_consistency": "string"
  },
  "quality_analysis": {
    "quality_tier": "High" | "Medium" | "Low",
    "competitive_advantages": ["string"],
    "manager_assessment": "string",
    "philosophy_clarity": "string",
    "repeatability_score": number (1-10)
  },
  "valuation_analysis": {
    "relative_valuation": "string",
    "historical_band_position": "string",
    "intrinsic_value_assessment": "string",
    "probability_overvalued": number (0-100),
    "probability_undervalued": number (0-100),
    "valuation_summary": "string"
  },
  "risk_analysis": {
    "overall_risk_score": number (1-100),
    "market_risk": { "score": number, "assessment": "string" },
    "volatility_risk": { "score": number, "assessment": "string" },
    "liquidity_risk": { "score": number, "assessment": "string" },
    "concentration_risk": { "score": number, "assessment": "string" },
    "leverage_risk": { "score": number, "assessment": "string" },
    "governance_risk": { "score": number, "assessment": "string" },
    "regulatory_risk": { "score": number, "assessment": "string" }
  },
  "performance_analysis": {
    "return_drivers": ["string"],
    "factor_exposures": {
      "value": number (-1 to 1),
      "growth": number (-1 to 1),
      "momentum": number (-1 to 1),
      "size": number (-1 to 1),
      "quality": number (-1 to 1)
    },
    "cycle_consistency": "string",
    "risk_adjusted_assessment": "string"
  },
  "governance_analysis": {
    "leadership_stability": "string",
    "incentive_alignment": "string",
    "track_record": "string",
    "key_person_risk": "Low" | "Medium" | "High",
    "red_flags": ["string"]
  },
  "esg_analysis": {
    "esg_score": number (0-100),
    "environmental_risk": "string",
    "social_risk": "string",
    "governance_risk": "string",
    "controversies": ["string"],
    "sustainability_rating": "Leader" | "Average" | "Laggard" | "Not Rated"
  },
  "portfolio_role": {
    "theoretical_role": "string",
    "typical_allocation_context": "string",
    "correlation_characteristics": "string",
    "diversification_benefit": "string"
  },
  "scenario_analysis": {
    "market_drawdown_behavior": "string",
    "rising_rates_behavior": "string",
    "inflation_behavior": "string",
    "liquidity_shock_behavior": "string"
  },
  "model_governance": {
    "methodology": "string",
    "factor_weightings": { "key": number },
    "data_limitations": ["string"],
    "confidence_level": "high" | "medium" | "low",
    "anomalies": ["string"]
  },
  "scores": {
    "overall_quality": number (0-100),
    "risk": number (0-100),
    "valuation": number (0-100),
    "esg": number (0-100)
  },
  "disclaimer": "This content is for informational and research purposes only and does not constitute investment advice."
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { asset_type, asset_id, asset_name, asset_symbol, asset_data } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build user prompt with asset data
    const userPrompt = `Generate a comprehensive institutional research report for the following ${asset_type}:

Asset Name: ${asset_name}
Symbol: ${asset_symbol || 'N/A'}
Asset Type: ${asset_type.toUpperCase()}

Available Data:
${JSON.stringify(asset_data, null, 2)}

Generate a complete research report following all 10 modules. Use the available data to inform your analysis. Where data is limited, clearly note the limitations and provide analysis based on generally available public information about this asset.

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks.`;

    console.log(`Generating research report for ${asset_name} (${asset_type})`);

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
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    let content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Clean up the response - remove markdown code blocks if present
    content = content.trim();
    if (content.startsWith("```json")) {
      content = content.slice(7);
    }
    if (content.startsWith("```")) {
      content = content.slice(3);
    }
    if (content.endsWith("```")) {
      content = content.slice(0, -3);
    }
    content = content.trim();

    let researchData;
    try {
      researchData = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse research report JSON");
    }

    // Check for existing report
    const { data: existingReport } = await supabase
      .from("asset_research_reports")
      .select("id, version")
      .eq("asset_type", asset_type)
      .eq("asset_id", asset_id)
      .single();

    const reportData = {
      asset_type,
      asset_id,
      asset_name,
      asset_symbol,
      fundamental_analysis: researchData.fundamental_analysis,
      quality_analysis: researchData.quality_analysis,
      valuation_analysis: researchData.valuation_analysis,
      risk_analysis: researchData.risk_analysis,
      performance_analysis: researchData.performance_analysis,
      governance_analysis: researchData.governance_analysis,
      esg_analysis: researchData.esg_analysis,
      portfolio_role: researchData.portfolio_role,
      scenario_analysis: researchData.scenario_analysis,
      model_governance: researchData.model_governance,
      overall_quality_score: researchData.scores?.overall_quality || 50,
      risk_score: researchData.scores?.risk || 50,
      valuation_score: researchData.scores?.valuation || 50,
      esg_score: researchData.scores?.esg || 50,
      data_sources: ["AI Analysis", "Public Market Data"],
      confidence_level: researchData.model_governance?.confidence_level || "medium",
      generated_at: new Date().toISOString(),
      data_as_of: new Date().toISOString(),
    };

    let result;
    if (existingReport) {
      // Update existing report
      const { data, error } = await supabase
        .from("asset_research_reports")
        .update({
          ...reportData,
          version: existingReport.version + 1,
          previous_version_id: existingReport.id,
        })
        .eq("id", existingReport.id)
        .select()
        .single();

      if (error) throw error;
      result = data;

      // Log the change
      await supabase.from("research_change_log").insert({
        report_id: existingReport.id,
        asset_type,
        asset_id,
        change_type: "performance_shift",
        change_summary: `Research report updated to version ${existingReport.version + 1}`,
        significance: "moderate",
      });
    } else {
      // Insert new report
      const { data, error } = await supabase
        .from("asset_research_reports")
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;
      result = data;

      // Log initial generation
      await supabase.from("research_change_log").insert({
        report_id: result.id,
        asset_type,
        asset_id,
        change_type: "initial_generation",
        change_summary: `Initial research report generated for ${asset_name}`,
        significance: "material",
      });
    }

    console.log(`Research report generated successfully for ${asset_name}`);

    return new Response(JSON.stringify({ success: true, report: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating research report:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
