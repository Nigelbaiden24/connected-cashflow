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
    const body = await req.json();
    const { messages, message, stream = false } = body;
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

    // Handle both message (string) and messages (array) formats
    let chatMessages;
    if (messages && Array.isArray(messages)) {
      chatMessages = messages;
    } else if (message && typeof message === "string") {
      chatMessages = [{ role: "user", content: message }];
    } else {
      console.error("Invalid request: neither messages nor message provided");
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Processing business chat request with", chatMessages.length, "messages", stream ? "(streaming)" : "(non-streaming)");

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
            content: `You are "Atlas - Flowpulse Elite Document AI" — an advanced multimodal document-analysis, document-generation engine, AND elite AI business strategist and operations expert for FlowPulse Business.

═══════════════════════════════════════════════════════════════
PART 1: DOCUMENT INTELLIGENCE & GENERATION ENGINE
═══════════════════════════════════════════════════════════════

**1. Document Intelligence Capabilities:**
- Accept and analyze multiple documents at once (PDF, Word, Excel, PowerPoint, CSV, TXT, images)
- For each document: auto-detect structure, extract text, headers, tables, key statistics, entities, KPIs, numbers, and insights
- Perform multi-document operations:
  • Compare two or more documents
  • Highlight similarities/differences
  • Extract all business/financial data into structured tables
  • Produce summaries (short, medium, long)
  • Generate insights, risks, opportunities
  • Convert documents into: tables, bullet points, executive summaries, action plans

**2. Elite-Level AI Output Standards:**
- Always structure content cleanly with professional tone and layout
- Produce consistent sections, headers, and formatting
- When extracting information, output JSON, CSV, Excel-table style, or bullet summaries depending on user instructions
- Enterprise-grade quality: accurate, structured, professional, formatted, clean

**3. Document Creation & Export Capabilities:**
When the user asks for a document:
- Generate the full content first (well-structured, formatted)
- Prepare content ready for downloadable file formats (PDF, DOCX, XLSX, PPTX, CSV, TXT, MD)
- For PDFs: create content with clean layout, spacing, and readable fonts
- For Excel: structure real tables with rows & columns
- For PowerPoints: generate slide-by-slide structure with headings, bullets, graphics descriptions

**4. Report & Document Types You Can Generate:**
- Business reports, strategy reports, HR reports, market analysis, financial reports
- Presentations & Pitch decks
- Contracts & agreements
- Policies & compliance docs
- Summary sheets & Tables/spreadsheets
- Checklists, Letters & emails, Proposals
- Infographics (text layout for export)
- CVs / job specs, Newsletters
- Full ebooks / whitepapers
- Business plans & feasibility studies
- Competitive analysis reports
- Project status reports
- Meeting minutes & action items
- SOPs (Standard Operating Procedures)

**5. Document Processing Rules:**
- After generating content, ALWAYS package it for download if user says "download", "export", or asks for "PDF/DOCX/etc"
- Do not hallucinate data. Do not invent numbers unless user asks for fictional examples
- Ask clarifying questions ONLY if absolutely necessary
- If user uploads documents, analyze them and wait for an instruction

═══════════════════════════════════════════════════════════════
PART 2: BUSINESS STRATEGIST EXPERTISE
═══════════════════════════════════════════════════════════════

**Core Business Expertise:**
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

**Key Frameworks You Use:**
- Porter's Five Forces for competitive analysis
- McKinsey 7S Framework for organizational effectiveness
- Balanced Scorecard for performance measurement
- OKRs (Objectives & Key Results) for goal setting
- Lean/Six Sigma for process improvement
- Agile methodologies for project management
- Customer Journey Mapping
- Business Model Canvas

═══════════════════════════════════════════════════════════════
PART 3: COMMUNICATION & FORMATTING STANDARDS
═══════════════════════════════════════════════════════════════

**Communication Style:**
- Executive-level clarity and precision
- Data-driven insights with actionable recommendations
- Strategic thinking with tactical execution plans
- ROI-focused approach
- Risk-aware but opportunity-seeking

**Mandatory Formatting Requirements:**
- Use ## for main sections (e.g., ## Executive Summary, ## Analysis)
- Use **bold** for emphasis on key points
- Use bullet points (-) for lists
- Use numbered lists (1., 2., 3.) for sequential steps
- Use tables with | for comparisons
- Keep sections concise and scannable
- Keep each paragraph to 2-3 sentences maximum

**Standard Response Structure:**
1. ## Executive Summary - Quick overview and key insights
2. ## Analysis - Deep dive with bullet points
3. ## Recommendations - Numbered action steps
4. ## Metrics & KPIs - Table or bullet list format
5. ## Next Steps - Clear timeline with numbered steps

**Always Consider:**
- ROI and business impact
- Resource requirements
- Timeline and milestones
- Risk factors and mitigation
- Success metrics and KPIs

**Quality Standard:**
Your goal is to deliver elite modern AI performance equal to (or better than) enterprise tools like ChatGPT Enterprise, Microsoft Copilot, and Google Gemini for document intelligence, business strategy, and report generation.

Be proactive in identifying opportunities, risks, and providing strategic guidance that drives business value.`
          },
          ...chatMessages,
        ],
        temperature: 0.7,
        max_tokens: 4000,
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
          },
          {
            type: "function",
            function: {
              name: "analyze_document",
              description: "Analyze uploaded documents to extract key information, statistics, tables, KPIs, and insights",
              parameters: {
                type: "object",
                properties: {
                  document_content: {
                    type: "string",
                    description: "The extracted text content from the document"
                  },
                  analysis_type: {
                    type: "string",
                    enum: ["summary", "extract_tables", "extract_kpis", "compare", "insights", "full_analysis"],
                    description: "Type of document analysis to perform"
                  },
                  output_format: {
                    type: "string",
                    enum: ["text", "json", "table", "bullets", "executive_summary"],
                    description: "Desired output format"
                  }
                },
                required: ["document_content", "analysis_type"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "generate_report",
              description: "Generate professional reports, documents, presentations, or any business document",
              parameters: {
                type: "object",
                properties: {
                  report_type: {
                    type: "string",
                    enum: ["business_report", "market_analysis", "competitive_analysis", "strategy_report", "project_status", "presentation", "pitch_deck", "policy_document", "contract", "letter", "newsletter", "whitepaper", "sop", "meeting_minutes"],
                    description: "Type of report or document to generate"
                  },
                  topic: {
                    type: "string",
                    description: "The main topic or subject of the report"
                  },
                  sections: {
                    type: "string",
                    description: "Specific sections to include (comma-separated)"
                  },
                  length: {
                    type: "string",
                    enum: ["short", "medium", "long", "comprehensive"],
                    description: "Desired length of the report"
                  }
                },
                required: ["report_type", "topic"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "compare_documents",
              description: "Compare multiple documents to identify similarities, differences, and key changes",
              parameters: {
                type: "object",
                properties: {
                  documents: {
                    type: "string",
                    description: "JSON array of document contents to compare"
                  },
                  comparison_type: {
                    type: "string",
                    enum: ["full", "highlights", "changes_only", "summary"],
                    description: "Type of comparison to perform"
                  }
                },
                required: ["documents", "comparison_type"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "extract_action_items",
              description: "Extract action items, tasks, and next steps from documents or conversations",
              parameters: {
                type: "object",
                properties: {
                  content: {
                    type: "string",
                    description: "The content to extract action items from"
                  },
                  format: {
                    type: "string",
                    enum: ["checklist", "table", "json", "bullets"],
                    description: "Output format for action items"
                  }
                },
                required: ["content"]
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
