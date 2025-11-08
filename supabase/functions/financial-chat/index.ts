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

    console.log("Processing financial chat request with", messages.length, "messages", stream ? "(streaming)" : "(non-streaming)");

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
            content: `You are Theodore, an elite financial advisor AI assistant for FlowPulse.io, a comprehensive wealth management platform. Your expertise includes:

**Core Competencies:**
- Portfolio management and asset allocation strategies
- UK financial regulations (FCA compliance, ISAs, pensions, SIPP)
- Risk assessment and management
- Market analysis and investment research
- Tax-efficient investing strategies (UK specific)
- Retirement planning and wealth preservation
- ESG and sustainable investing
- Alternative investments (property, commodities, crypto)

**Regulatory Awareness:**
- FCA Consumer Duty requirements and fair value assessments
- SMCR (Senior Managers & Certification Regime) compliance
- MiFID II requirements for investor protection
- GDPR and data protection in financial services
- Anti-Money Laundering (AML) and KYC requirements
- Suitability and appropriateness assessments
- COBS (Conduct of Business Sourcebook) rules
- Financial promotions regulations
- Market abuse regulations (MAR)
- Provide disclaimers when discussing specific investment products

**Communication Style:**
- Professional yet approachable
- Use UK financial terminology
- Provide actionable insights with specific recommendations
- Always consider risk tolerance and investment objectives
- Include relevant data points, percentages, and figures
- Be concise but comprehensive
- Reference regulatory requirements where relevant
- Structure responses with clear headings and bullet points
- Use examples to illustrate complex concepts

**Key UK Financial Context:**
- ISA allowances (£20,000 annual limit), pension contributions, capital gains tax
- FTSE indices, UK gilt yields, Bank of England base rate
- FCA regulations and Financial Services Compensation Scheme (FSCS)
- UK investment vehicles (OEICs, unit trusts, investment trusts)
- Consumer Duty outcomes: products/services, price/value, consumer understanding, consumer support

When analyzing portfolios or markets, provide specific insights with relevant metrics. When discussing compliance, reference UK regulations and FCA guidance. Always prioritize client suitability and risk-appropriate advice. Flag regulatory considerations and compliance requirements in your responses.

Format your responses to be clear and actionable, with proper structure for readability.`
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
              name: "get_market_data",
              description: "Fetch real-time or historical market data for stocks, indices, currencies, or commodities. Use this to provide up-to-date market information.",
              parameters: {
                type: "object",
                properties: {
                  symbol: {
                    type: "string",
                    description: "The ticker symbol or market identifier (e.g., FTSE, AAPL, GBP/USD)"
                  },
                  data_type: {
                    type: "string",
                    enum: ["current_price", "historical", "fundamentals", "news"],
                    description: "Type of market data to fetch"
                  }
                },
                required: ["symbol", "data_type"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "analyze_portfolio",
              description: "Analyze a portfolio's performance, risk metrics, asset allocation, and provide optimization recommendations",
              parameters: {
                type: "object",
                properties: {
                  holdings: {
                    type: "string",
                    description: "Portfolio holdings data in JSON format"
                  },
                  analysis_type: {
                    type: "string",
                    enum: ["risk_assessment", "performance", "allocation", "optimization", "tax_efficiency"],
                    description: "Type of portfolio analysis to perform"
                  }
                },
                required: ["holdings", "analysis_type"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "check_compliance",
              description: "Check regulatory compliance requirements for financial activities, products, or advice",
              parameters: {
                type: "object",
                properties: {
                  activity: {
                    type: "string",
                    description: "The financial activity or product to check compliance for"
                  },
                  jurisdiction: {
                    type: "string",
                    enum: ["UK", "EU", "US"],
                    description: "Regulatory jurisdiction",
                    default: "UK"
                  }
                },
                required: ["activity"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for current financial news, market updates, regulatory changes, or any real-time information. Use this to provide up-to-date insights.",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query to find financial information"
                  }
                },
                required: ["query"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "calculate_retirement_plan",
              description: "Calculate retirement planning scenarios including required savings, projected income, and investment strategies",
              parameters: {
                type: "object",
                properties: {
                  current_age: {
                    type: "number",
                    description: "Current age of the client"
                  },
                  retirement_age: {
                    type: "number",
                    description: "Target retirement age"
                  },
                  current_savings: {
                    type: "number",
                    description: "Current retirement savings"
                  },
                  annual_income: {
                    type: "number",
                    description: "Current annual income"
                  },
                  desired_retirement_income: {
                    type: "number",
                    description: "Desired annual retirement income"
                  }
                },
                required: ["current_age", "retirement_age"]
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
    console.error("Error in financial-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
