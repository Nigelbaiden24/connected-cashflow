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
    const { messages, stream = false } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please contact support." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Processing business chat request with", messages.length, "messages", stream ? "(streaming)" : "(non-streaming)");

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
            content: `You are Atlas, an elite AI business strategist and operations expert for FlowPulse Business. You're designed to help businesses optimize operations, make data-driven decisions, and drive growth.

**Core Expertise:**
- Strategic Business Planning & Analysis
- Operations Management & Process Optimization
- Financial Analysis & Budgeting (P&L, Cash Flow, Forecasting)
- Project Management & Resource Allocation
- Team Performance & HR Strategy
- Marketing & Sales Strategy
- Risk Management & Compliance
- Technology & Digital Transformation
- Supply Chain & Logistics
- Customer Success & CRM Strategy

**Business Intelligence Capabilities:**
- SWOT Analysis and Competitive Intelligence
- KPI Tracking & Performance Metrics
- Market Research & Industry Analysis
- Business Model Innovation
- Growth Strategy & Scaling
- Cost Optimization & Efficiency
- Revenue Stream Analysis
- Customer Segmentation & Personas

**Communication Style:**
- Executive-level clarity and precision
- Data-driven insights with actionable recommendations
- Strategic thinking with tactical execution plans
- ROI-focused approach
- Risk-aware but opportunity-seeking
- Structured responses with clear markdown formatting
- Use headings (##), bullet points, numbered lists, and bold text
- Create tables for comparisons and data
- Provide specific metrics and benchmarks
- Keep paragraphs concise (2-3 sentences max)

**Key Frameworks You Use:**
- Porter's Five Forces for competitive analysis
- McKinsey 7S Framework for organizational effectiveness
- Balanced Scorecard for performance measurement
- OKRs (Objectives & Key Results) for goal setting
- Lean/Six Sigma for process improvement
- Agile methodologies for project management
- Customer Journey Mapping
- Business Model Canvas

**Response Format:**
ALWAYS format your responses using markdown:
- Use ## for main sections (e.g., ## Executive Summary, ## Analysis)
- Use **bold** for emphasis on key points
- Use bullet points (-) for lists
- Use numbered lists (1., 2., 3.) for sequential steps
- Use tables with | for comparisons
- Keep sections concise and scannable

Structure your responses with:
1. ## Executive Summary - Quick overview and key insights
2. ## Analysis - Deep dive with bullet points
3. ## Recommendations - Numbered action steps
4. ## Metrics & KPIs - Table or bullet list format
5. ## Next Steps - Clear timeline with numbered steps

Always consider:
- ROI and business impact
- Resource requirements
- Timeline and milestones
- Risk factors and mitigation
- Success metrics and KPIs

Be proactive in identifying opportunities, risks, and providing strategic guidance that drives business value.`
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: stream,
        tools: [
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for current business information, market data, competitor analysis, industry trends, or any real-time information. Use this to provide up-to-date insights.",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query to find business information"
                  }
                },
                required: ["query"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "analyze_business_metrics",
              description: "Analyze business metrics and KPIs to provide insights on performance, trends, and recommendations",
              parameters: {
                type: "object",
                properties: {
                  metric_type: {
                    type: "string",
                    enum: ["revenue", "profitability", "efficiency", "growth", "customer_metrics"],
                    description: "Type of business metric to analyze"
                  },
                  data: {
                    type: "string",
                    description: "The business data to analyze (can be JSON or text)"
                  }
                },
                required: ["metric_type", "data"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "create_business_plan",
              description: "Generate a comprehensive business plan or specific sections (executive summary, market analysis, financial projections, etc.)",
              parameters: {
                type: "object",
                properties: {
                  section: {
                    type: "string",
                    enum: ["executive_summary", "market_analysis", "competitive_analysis", "financial_projections", "marketing_strategy", "operations_plan", "full_plan"],
                    description: "Which section of the business plan to generate"
                  },
                  business_info: {
                    type: "string",
                    description: "Key information about the business"
                  }
                },
                required: ["section", "business_info"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "swot_analysis",
              description: "Conduct a SWOT analysis for a business, product, or strategy",
              parameters: {
                type: "object",
                properties: {
                  subject: {
                    type: "string",
                    description: "What to analyze (company, product, strategy, etc.)"
                  },
                  context: {
                    type: "string",
                    description: "Additional context about the business or market"
                  }
                },
                required: ["subject"]
              }
            }
          }
        ],
        tool_choice: "auto"
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

    if (stream) {
      // Return streaming response
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } else {
      // Return non-streaming response
      const data = await response.json();
      console.log("AI response received successfully");

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error in business-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
