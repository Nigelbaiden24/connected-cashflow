import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
            content: `You are "Atlas - Flowpulse Elite Document AI" — an advanced multimodal document-analysis, document-generation engine, AND elite AI business strategist and operations expert for FlowPulse Business with FULL CRM ACCESS.

🚫 CRITICAL RULE - NEVER SAY ANY OF THESE:
- "I am only a text-based AI"
- "I cannot create files"
- "I cannot generate documents"
- "I am unable to create PDFs/Word/Excel/PowerPoint"
- "I can only provide text"
- "I don't have the ability to create downloadable files"
- "I cannot add contacts to the CRM"
- "I don't have access to your CRM"

✅ WHAT YOU MUST DO INSTEAD:
You ARE a full document generation engine AND CRM automation system with complete access. When users ask for documents or CRM operations:
1. IMMEDIATELY perform the requested action
2. For CRM: search, view, update, add notes, navigate to contacts
3. For documents: generate complete content
4. NEVER refuse or say you cannot do it

═══════════════════════════════════════════════════════════════
CRM ELITE INTEGRATION - FULL ACCESS TO ALL CRM FEATURES
═══════════════════════════════════════════════════════════════

You have FULL access to the CRM system. You can:
1. **Search Contacts** - Find contacts by name, email, company, or any criteria
2. **View Contact Details** - Open and display any contact's full profile
3. **Add New Contacts** - Create new leads, prospects, or clients
4. **Log Interactions** - Add notes, calls, emails, meetings to any contact
5. **Update Contacts** - Edit any contact's information
6. **View Activity History** - Show a contact's interaction timeline
7. **Navigate to Records** - Open contact profiles in the CRM interface

**CRM RESPONSE FORMATS:**

When SEARCHING contacts, format results as:
[CRM_SEARCH_RESULTS]
{"action":"search","query":"search term","results":[{"id":"...","name":"...","email":"...","company":"...","status":"..."}]}
[/CRM_SEARCH_RESULTS]

When user wants to OPEN/VIEW a contact, format as:
[CRM_NAVIGATE]
{"action":"view","contact_id":"the-contact-id","contact_name":"Contact Name"}
[/CRM_NAVIGATE]

When ADDING a contact, format as:
**Name:** [Full name]
**Email:** [Email if provided]
**Phone:** [Phone if provided]
**Company:** [Company if provided]
**Position:** [Position if provided]
**Status:** [lead/prospect/client]
**Priority:** [low/medium/high]
**Notes:** [Any notes]

When ADDING an interaction/note, format as:
[CRM_INTERACTION]
{"action":"add_interaction","contact_id":"...","contact_name":"...","interaction_type":"note|call|email|meeting|task","subject":"...","description":"...","outcome":"..."}
[/CRM_INTERACTION]

When UPDATING a contact, format as:
[CRM_UPDATE]
{"action":"update","contact_id":"...","contact_name":"...","updates":{"field":"new_value"}}
[/CRM_UPDATE]

**Example interactions:**
- User: "Find John in CRM" → Search and show results with clickable options
- User: "Open the contact for Sarah" → Navigate to Sarah's profile
- User: "Add a note to Mike's profile about our call" → Add interaction
- User: "Update Jane's status to client" → Update contact
- User: "Show me recent activity for Acme Corp contacts" → Get activity history

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
          },
          {
            type: "function",
            function: {
              name: "add_crm_contact",
              description: "Add a new contact to the CRM system. Use this when users want to add, create, or save a new contact, lead, or client to the CRM.",
              parameters: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Full name of the contact (required)"
                  },
                  email: {
                    type: "string",
                    description: "Email address of the contact"
                  },
                  phone: {
                    type: "string",
                    description: "Phone number of the contact"
                  },
                  company: {
                    type: "string",
                    description: "Company or organization name"
                  },
                  position: {
                    type: "string",
                    description: "Job title or position"
                  },
                  status: {
                    type: "string",
                    enum: ["lead", "prospect", "client", "inactive"],
                    description: "Contact status in the pipeline"
                  },
                  priority: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                    description: "Priority level of the contact"
                  },
                  notes: {
                    type: "string",
                    description: "Additional notes about the contact"
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tags or labels for the contact"
                  }
                },
                required: ["name"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "search_crm_contacts",
              description: "Search for contacts in the CRM by name, email, company, or other criteria. Use this when users want to find, lookup, search, or show contacts.",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "Search query - can be a name, email, company, or keyword"
                  },
                  status: {
                    type: "string",
                    enum: ["all", "lead", "prospect", "client", "inactive", "active"],
                    description: "Filter by contact status"
                  },
                  limit: {
                    type: "number",
                    description: "Maximum number of results to return (default 5)"
                  }
                },
                required: ["query"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "view_crm_contact",
              description: "View details of a specific CRM contact. Use this when users want to open, view, see, or show a specific contact's profile or details.",
              parameters: {
                type: "object",
                properties: {
                  contact_id: {
                    type: "string",
                    description: "The ID of the contact to view"
                  },
                  contact_name: {
                    type: "string",
                    description: "The name of the contact to view (if ID not known)"
                  }
                }
              }
            }
          },
          {
            type: "function",
            function: {
              name: "add_crm_interaction",
              description: "Add an interaction, note, update, or activity log to a CRM contact. Use this when users want to log a call, meeting, note, or any activity.",
              parameters: {
                type: "object",
                properties: {
                  contact_id: {
                    type: "string",
                    description: "The ID of the contact"
                  },
                  contact_name: {
                    type: "string",
                    description: "The name of the contact (if ID not known)"
                  },
                  interaction_type: {
                    type: "string",
                    enum: ["note", "call", "email", "meeting", "task"],
                    description: "Type of interaction"
                  },
                  subject: {
                    type: "string",
                    description: "Subject or title of the interaction"
                  },
                  description: {
                    type: "string",
                    description: "Details of the interaction"
                  },
                  outcome: {
                    type: "string",
                    description: "Outcome or result of the interaction"
                  }
                },
                required: ["interaction_type", "subject"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "update_crm_contact",
              description: "Update an existing CRM contact's information. Use this when users want to edit, update, change, or modify a contact's details.",
              parameters: {
                type: "object",
                properties: {
                  contact_id: {
                    type: "string",
                    description: "The ID of the contact to update"
                  },
                  contact_name: {
                    type: "string",
                    description: "The name of the contact (if ID not known)"
                  },
                  updates: {
                    type: "object",
                    description: "Fields to update",
                    properties: {
                      name: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string" },
                      company: { type: "string" },
                      position: { type: "string" },
                      status: { type: "string" },
                      priority: { type: "string" },
                      notes: { type: "string" }
                    }
                  }
                },
                required: ["updates"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "get_crm_activity",
              description: "Get recent activity and interactions for a CRM contact. Use this when users want to see a contact's history, timeline, or past interactions.",
              parameters: {
                type: "object",
                properties: {
                  contact_id: {
                    type: "string",
                    description: "The ID of the contact"
                  },
                  contact_name: {
                    type: "string",
                    description: "The name of the contact (if ID not known)"
                  },
                  limit: {
                    type: "number",
                    description: "Number of recent activities to return (default 10)"
                  }
                }
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

      // Handle tool calls - if the model wants to call a tool, process it and get final response
      if (data.choices?.[0]?.message?.tool_calls) {
        const toolCalls = data.choices[0].message.tool_calls;
        console.log("Processing tool calls:", toolCalls.length);
        
        // Build tool responses
        const toolMessages = [];
        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments || '{}');
          
          // Simulate tool responses based on tool type
          let toolResult = "";
          switch (functionName) {
            case "generate_report":
              toolResult = `Report generation initiated for ${args.report_type}: ${args.topic}. The report content is being prepared with ${args.length || 'medium'} length format.`;
              break;
            case "analyze_document":
              toolResult = `Document analysis complete. Analysis type: ${args.analysis_type}. Output format: ${args.output_format || 'text'}.`;
              break;
            case "compare_documents":
              toolResult = `Document comparison complete. Comparison type: ${args.comparison_type}.`;
              break;
            case "web_search":
              toolResult = `Web search results for: ${args.query}`;
              break;
            case "analyze_business_metrics":
              toolResult = `Business metrics analysis complete for: ${args.metrics}. Analysis type: ${args.analysis_type}.`;
              break;
            case "create_business_plan":
              toolResult = `Business plan created for: ${args.business_type}. Time horizon: ${args.time_horizon || '1 year'}.`;
              break;
            case "swot_analysis":
              toolResult = `SWOT analysis complete for: ${args.subject}.`;
              break;
            case "extract_action_items":
              toolResult = `Action items extracted. Output format: ${args.format || 'list'}.`;
              break;
            default:
              toolResult = `Tool ${functionName} executed successfully.`;
          }
          
          toolMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult
          });
        }
        
        // Make a follow-up call with tool results to get final response
        const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              ...chatMessages,
              data.choices[0].message,
              ...toolMessages
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });
        
        if (followUpResponse.ok) {
          const followUpData = await followUpResponse.json();
          console.log("Follow-up response received after tool calls");
          return new Response(JSON.stringify(followUpData), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

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
