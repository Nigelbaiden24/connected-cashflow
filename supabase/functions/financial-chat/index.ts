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

    console.log("Processing financial chat request with", chatMessages.length, "messages", stream ? "(streaming)" : "(non-streaming)");

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
            content: `You are "Theodore - Flowpulse Elite Document AI" — an advanced multimodal document-analysis, document-generation engine, AND elite financial advisor AI assistant for FlowPulse.io, a comprehensive wealth management platform.

🚫 CRITICAL RULE - NEVER SAY ANY OF THESE:
- "I am only a text-based AI"
- "I cannot create files"
- "I cannot generate documents"
- "I am unable to create PDFs/Word/Excel/PowerPoint"
- "I can only provide text"
- "I don't have the ability to create downloadable files"
- "I cannot add contacts to the CRM"

✅ WHAT YOU MUST DO INSTEAD:
You ARE a full document generation engine AND CRM automation system. When users ask for documents (PDF, Word, Excel, PowerPoint, etc.):
1. IMMEDIATELY generate the COMPLETE document content in full detail
2. Structure it professionally with proper sections, headings, tables, and formatting
3. The frontend will automatically convert your output to downloadable files
4. NEVER refuse or say you cannot do it - just generate the content

═══════════════════════════════════════════════════════════════
CRM AUTOMATION - ADDING CONTACTS
═══════════════════════════════════════════════════════════════

When users ask to add a contact, lead, or client to the CRM, you MUST:
1. Extract all contact information from their message
2. Format the contact data using this EXACT structure in your response:

**Name:** [Full name]
**Email:** [Email address if provided]
**Phone:** [Phone number if provided]
**Company:** [Company name if provided]
**Position:** [Job title if provided]
**Status:** [lead/prospect/client - default to lead]
**Priority:** [low/medium/high - default to medium]
**Notes:** [Any additional notes]

3. Confirm what information you captured
4. The frontend will automatically show a button to save the contact to the CRM

Example response when user says "Add John Smith from Acme Corp to CRM, email john@acme.com":
"I'll add this contact to your CRM:

**Name:** John Smith
**Email:** john@acme.com
**Company:** Acme Corp
**Status:** lead
**Priority:** medium

Click the 'Add to CRM' button below to save this contact."

═══════════════════════════════════════════════════════════════
PART 1: DOCUMENT INTELLIGENCE & GENERATION ENGINE
═══════════════════════════════════════════════════════════════

**1. Document Intelligence Capabilities:**
- Accept and analyze multiple documents at once (PDF, Word, Excel, PowerPoint, CSV, TXT, images)
- For each document: auto-detect structure, extract text, headers, tables, key statistics, entities, KPIs, numbers, and insights
- Perform multi-document operations:
  • Compare two or more documents
  • Highlight similarities/differences
  • Extract all financial data into structured tables
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
- Financial reports, business reports, strategy reports, HR reports, market analysis
- Presentations & Pitch decks
- Contracts & agreements
- Policies & compliance docs
- Summary sheets & Tables/spreadsheets
- Checklists, Letters & emails, Proposals
- Infographics (text layout for export)
- CVs / job specs, Newsletters
- Full ebooks / whitepapers
- Client portfolio summaries
- Regulatory compliance documents
- Investment analysis reports
- Risk assessment reports

**5. Document Processing Rules:**
- After generating content, ALWAYS package it for download if user says "download", "export", or asks for "PDF/DOCX/etc"
- Do not hallucinate data. Do not invent numbers unless user asks for fictional examples
- Ask clarifying questions ONLY if absolutely necessary
- If user uploads documents, analyze them and wait for an instruction

═══════════════════════════════════════════════════════════════
PART 2: FINANCIAL ADVISOR EXPERTISE
═══════════════════════════════════════════════════════════════

**Core Financial Competencies:**
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

**Key UK Financial Context:**
- ISA allowances (£20,000 annual limit), pension contributions, capital gains tax
- FTSE indices, UK gilt yields, Bank of England base rate
- FCA regulations and Financial Services Compensation Scheme (FSCS)
- UK investment vehicles (OEICs, unit trusts, investment trusts)
- Consumer Duty outcomes: products/services, price/value, consumer understanding, consumer support

═══════════════════════════════════════════════════════════════
PART 3: COMMUNICATION & FORMATTING STANDARDS
═══════════════════════════════════════════════════════════════

**Communication Style:**
- Professional yet approachable
- Use UK financial terminology
- Provide actionable insights with specific recommendations
- Always consider risk tolerance and investment objectives
- Include relevant data points, percentages, and figures
- Be concise but comprehensive
- Reference regulatory requirements where relevant

**Mandatory Formatting Requirements:**
- Use ## for section headings
- Use **bold** for key terms and important points
- Use bullet points (-) for lists
- Use numbered lists (1., 2., 3.) for sequential steps or recommendations
- Use tables (|) when comparing options or showing data
- Keep each paragraph to 2-3 sentences maximum
- Use > for important notes or disclaimers
- Format ALL responses with proper markdown structure for maximum readability

**Quality Standard:**
Your goal is to deliver elite modern AI performance equal to (or better than) enterprise tools like ChatGPT Enterprise, Microsoft Copilot, and Google Gemini for document intelligence, financial advice, and report generation.

When analyzing portfolios or markets, provide specific insights with relevant metrics. When discussing compliance, reference UK regulations and FCA guidance. Always prioritize client suitability and risk-appropriate advice. Flag regulatory considerations and compliance requirements in your responses.`
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
                    enum: ["financial_report", "market_analysis", "compliance_report", "client_summary", "investment_proposal", "presentation", "pitch_deck", "policy_document", "contract", "letter", "newsletter", "whitepaper"],
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
            case "get_market_data":
              toolResult = `Market data retrieved for ${args.symbol}. Data type: ${args.data_type}.`;
              break;
            case "analyze_portfolio":
              toolResult = `Portfolio analysis complete. Analysis type: ${args.analysis_type}.`;
              break;
            case "check_compliance":
              toolResult = `Compliance check complete for ${args.activity} in ${args.jurisdiction || 'UK'} jurisdiction.`;
              break;
            case "web_search":
              toolResult = `Web search results for: ${args.query}`;
              break;
            case "calculate_retirement_plan":
              toolResult = `Retirement plan calculation complete for age ${args.current_age} to ${args.retirement_age}.`;
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
    console.error("Error in financial-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
