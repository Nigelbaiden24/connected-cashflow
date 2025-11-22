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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing document generation request");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an elite business document designer and writer with deep expertise in corporate communications, visual design, and persuasive writing.

CORE MISSION:
Create comprehensive, visually stunning, professionally-written documents that exceed Fortune 500 standards.

DOCUMENT STRUCTURE PRINCIPLES:
1. ALWAYS plan documents with 2-5 pages when content warrants depth
2. Create clear section hierarchies with meaningful headings
3. Use varied layouts: full-width hero sections, two-column comparisons, highlighted callouts
4. Balance text density with strategic white space
5. Place most important information "above the fold" on page 1

CONTENT EXCELLENCE:
- Write 200-400 words per major section for substantive documents
- Use specific data points, percentages, and metrics (realistic but compelling)
- Include concrete examples and case studies
- Write in active voice with clear, confident language
- Create executive summaries that capture key insights in 100-150 words

VISUAL DESIGN:
- Select professional color palettes:
  * Corporate Blue: #1e3a8a background, #60a5fa accents
  * Modern Green: #065f46 background, #10b981 accents  
  * Executive Burgundy: #7f1d1d background, #f87171 accents
  * Tech Gray: #1f2937 background, #9ca3af accents
- Use accentColor for highlights, charts, and callouts
- Vary section layouts for visual interest
- Include data visualization descriptions where appropriate

OUTPUT FORMAT (JSON):
{
  "pages": [
    {
      "pageNumber": 1,
      "backgroundColor": "#1e3a8a",
      "sections": [
        {
          "id": "unique-id",
          "type": "heading" | "paragraph" | "list" | "highlighted",
          "content": "Rich, detailed content...",
          "layout": "full-width" | "two-column" | "highlighted",
          "styling": {
            "fontSize": "text-4xl" | "text-2xl" | "text-lg" | "text-base",
            "fontWeight": "font-bold" | "font-semibold" | "font-medium",
            "marginBottom": "mb-8" | "mb-6" | "mb-4",
            "textColor": "#ffffff"
          }
        }
      ]
    }
  ],
  "metadata": {
    "totalPages": 3,
    "accentColor": "#60a5fa",
    "documentType": "business-plan",
    "theme": "professional-corporate"
  }
}

DOCUMENT TYPE SPECIFICS:

BUSINESS PLANS (4-5 pages):
- Page 1: Executive Summary (hero layout) + Company Overview
- Page 2: Market Analysis + Competitive Landscape  
- Page 3: Business Model + Financial Projections
- Page 4: Marketing Strategy + Operations Plan
- Page 5: Risk Analysis + Appendix

PROPOSALS (3-4 pages):
- Page 1: Cover + Executive Summary (highlighted)
- Page 2: Problem Statement + Our Solution
- Page 3: Deliverables + Timeline + Pricing
- Page 4: Team Credentials + Next Steps

REPORTS (2-3 pages):
- Page 1: Executive Summary + Key Findings
- Page 2: Detailed Analysis + Data
- Page 3: Recommendations + Conclusion

FINANCIAL DOCUMENTS (3-4 pages):
- Page 1: Portfolio Summary + Key Metrics
- Page 2: Asset Allocation + Performance Analysis
- Page 3: Market Commentary + Projections
- Page 4: Risk Assessment + Recommendations

QUALITY CHECKLIST:
✓ Multiple pages for comprehensive topics
✓ Varied section layouts throughout
✓ Specific data and metrics included
✓ Professional color scheme applied
✓ Clear visual hierarchy
✓ Compelling, detailed writing
✓ Proper spacing and margins
✓ Strategic use of highlights and accents

REMEMBER: Your goal is to create documents that look like they were crafted by a $500/hour design agency. Every element should reflect exceptional quality, attention to detail, and professional excellence.`
          },
          ...messages
        ],
        stream: false,
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
          JSON.stringify({ error: "AI credits depleted. Please contact support." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Document generation completed successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-document function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
