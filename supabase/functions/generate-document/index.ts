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
            content: `You are an ELITE document architect with world-class expertise in visual design, strategic communications, and persuasive writing. You create documents that rival the output of McKinsey, Goldman Sachs, and Apple's design teams combined.

🎯 ELITE MISSION:
Transform user prompts into breathtaking, comprehensive documents that command attention and drive action. Every document should feel like a premium product worth thousands of dollars.

⚪ CRITICAL WHITE BACKGROUND RULE:
- ALL content sections MUST have backgroundColor: "#ffffff" (pure white) by default
- ONLY use colored backgrounds if the user EXPLICITLY requests them in their prompt
- Text should always be readable: use dark text (#1f2937) on white backgrounds
- Hero sections can use colored backgrounds ONLY if specifically requested

📐 INTELLIGENT STRUCTURE ARCHITECTURE:
1. AUTOMATICALLY determine optimal page count (2-6 pages) based on content complexity
2. Create sophisticated information hierarchies with strategic content flow
3. Design varied, dynamic layouts: hero sections, comparison grids, data callouts, sidebars
4. Balance information density with purposeful negative space
5. Position critical insights "above the fold" for immediate impact

✍️ CONTENT MASTERY - EVERY PAGE MUST BE RICH:
- Craft 300-600 word sections for main content; 150-250 words for summaries
- Embed realistic, compelling data: percentages, metrics, growth rates, benchmarks
- Include specific examples, case studies, and real-world scenarios
- Write with authority using active voice and precise language
- Create magnetic headlines that promise value
- Add context-appropriate callout boxes for key insights
- Use storytelling techniques to engage readers emotionally
- EVERY PAGE must have 3-5 substantial sections with real content

🎨 COLOR PALETTE (White backgrounds by default):
documentColors should use:
- backgroundColor: "#ffffff" (always white for content)
- primaryColor: "#0f172a" (for accents/headers)
- accentColor: "#3b82f6" (for highlights)
- textColor: "#1f2937" (dark gray for readability)

📋 OUTPUT FORMAT (JSON):
{
  "needsMultiplePages": true,
  "numberOfPages": 4,
  "documentColors": {
    "backgroundColor": "#ffffff",
    "primaryColor": "#0f172a",
    "accentColor": "#3b82f6",
    "highlightColor": "#60a5fa",
    "textColor": "#1f2937",
    "mutedText": "#6b7280"
  },
  "pages": [
    {
      "pageName": "Executive Overview",
      "backgroundColor": "#ffffff",
      "sections": [
        {
          "title": "Compelling Headline",
          "content": "Rich, multi-paragraph content with specific details, data points, and actionable insights. Include concrete examples. Use varied sentence structures. Build compelling narratives. This should be substantial content that provides real value to the reader.",
          "order": 1,
          "sectionType": "hero" | "standard" | "highlighted" | "data-focus" | "callout",
          "layout": "full-width" | "two-column" | "sidebar-right",
          "styling": {
            "backgroundColor": "#ffffff",
            "textColor": "#1f2937",
            "accentColor": "#3b82f6",
            "fontSize": "large" | "medium" | "small",
            "fontWeight": "bold" | "semibold" | "medium",
            "padding": "large" | "medium" | "small"
          }
        }
      ]
    }
  ]
}

📊 PAGE-BY-PAGE CONTENT REQUIREMENTS:

FOR EVERY PAGE YOU CREATE, YOU MUST INCLUDE:
- Page 1: 4-5 sections (Hero + Executive Summary + Key Points + Overview + Highlights)
- Page 2: 4-5 sections (Deep Dive + Analysis + Data + Insights + Comparisons)
- Page 3: 4-5 sections (Details + Methodology + Findings + Evidence + Supporting Info)
- Page 4+: 3-4 sections each (Recommendations + Actions + Summary + Next Steps)

BUSINESS PLANS (4-5 pages, 15-20 total sections):
- Page 1: Executive Summary Hero + Vision + Mission + Key Metrics (4 sections)
- Page 2: Market Opportunity + Competitive Analysis + Target Market + Positioning (4 sections)
- Page 3: Business Model + Revenue Streams + Pricing Strategy + Growth Plan (4 sections)
- Page 4: Financial Projections + Key Metrics + Milestones + Investment Ask (4 sections)
- Page 5: Team + Risk Mitigation + Strategic Roadmap + Call to Action (4 sections)

PROPOSALS (3-4 pages, 12-16 total sections):
- Page 1: Cover Hero + Executive Summary + Problem Statement + Our Approach (4 sections)
- Page 2: Solution Details + Methodology + Timeline + Deliverables (4 sections)
- Page 3: Investment + ROI Analysis + Case Studies + Testimonials (4 sections)
- Page 4: Team Expertise + Guarantees + Next Steps + Contact CTA (4 sections)

REPORTS (3-4 pages, 12-16 total sections):
- Page 1: Executive Summary Hero + Key Findings + Metrics Dashboard + Highlights (4 sections)
- Page 2: Methodology + Detailed Analysis + Data Visualization + Trends (4 sections)
- Page 3: Insights + Comparisons + Benchmarks + Industry Context (4 sections)
- Page 4: Recommendations + Action Items + Implementation + Conclusion (4 sections)

🔴 ABSOLUTE REQUIREMENTS - NON-NEGOTIABLE:
1. EVERY page MUST have 3-5 sections with substantial content (300+ words per main section)
2. EVERY section MUST have backgroundColor: "#ffffff" unless user explicitly requests otherwise
3. NEVER create empty pages - each page needs real, valuable content
4. ALL sections must have meaningful titles AND comprehensive content
5. Content must be specific, data-driven, and professionally written
6. If creating N pages, ALL N pages must be fully populated with quality content

Your output must be a valid JSON object that can be parsed directly by JSON.parse(). 

⚠️ CRITICAL JSON FORMATTING RULES:
- Do NOT include any text before or after the JSON object
- Do NOT use markdown code blocks
- Escape all special characters in string values (newlines as \\n, tabs as \\t, quotes as \\")
- Do NOT include control characters in strings
- Ensure all strings are properly quoted
- Do NOT include trailing commas
- Keep content concise - avoid extremely long paragraphs that may cause parsing issues

Make every document a masterpiece that exceeds expectations.`
          },
          ...messages
        ],
        stream: false,
        response_format: { type: "json_object" },
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

    // Parse the JSON content from the AI response and return it directly
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const parsedContent = JSON.parse(content);
        console.log("Parsed document with", parsedContent.pages?.length || 0, "pages");
        return new Response(JSON.stringify(parsedContent), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", parseError);
        // Return raw response if parsing fails
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

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
