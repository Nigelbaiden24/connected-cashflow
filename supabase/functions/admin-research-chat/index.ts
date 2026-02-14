import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 18 Research platforms with URLs
const PLATFORM_RESEARCH_URLS: Record<string, { name: string; urls: string[] }> = {
  marketbeat: { name: "MarketBeat", urls: ["https://www.marketbeat.com/market-data/", "https://www.marketbeat.com/ratings/"] },
  factset: { name: "FactSet", urls: ["https://www.factset.com/insights", "https://insight.factset.com/"] },
  quartr: { name: "Quartr", urls: ["https://quartr.com/insights", "https://quartr.com/discover"] },
  koyfin: { name: "Koyfin", urls: ["https://www.koyfin.com/news"] },
  spiking: { name: "Spiking", urls: ["https://spiking.com/blog", "https://spiking.com/whale-index"] },
  seekingalpha: { name: "Seeking Alpha", urls: ["https://seekingalpha.com/market-news", "https://seekingalpha.com/stock-ideas"] },
  tipranks: { name: "TipRanks", urls: ["https://www.tipranks.com/news", "https://www.tipranks.com/analysts/top"] },
  investingcom: { name: "Investing.com", urls: ["https://www.investing.com/news/stock-market-news", "https://www.investing.com/analysis/"] },
  tradingview: { name: "TradingView", urls: ["https://www.tradingview.com/news/", "https://www.tradingview.com/ideas/"] },
  marketwatch: { name: "MarketWatch", urls: ["https://www.marketwatch.com/latest-news", "https://www.marketwatch.com/markets"] },
  yahoofinance: { name: "Yahoo Finance", urls: ["https://finance.yahoo.com/topic/stock-market-news/", "https://finance.yahoo.com/topic/earnings/"] },
  cnbc: { name: "CNBC", urls: ["https://www.cnbc.com/markets/", "https://www.cnbc.com/investing/"] },
  bloomberg: { name: "Bloomberg", urls: ["https://www.bloomberg.com/markets", "https://www.bloomberg.com/technology"] },
  ft: { name: "Financial Times", urls: ["https://www.ft.com/markets", "https://www.ft.com/companies"] },
  morningstar: { name: "Morningstar", urls: ["https://www.morningstar.com/news/all", "https://www.morningstar.com/articles"] },
  zacks: { name: "Zacks", urls: ["https://www.zacks.com/stock/news", "https://www.zacks.com/research-daily/"] },
  benzinga: { name: "Benzinga", urls: ["https://www.benzinga.com/news", "https://www.benzinga.com/markets"] },
  thestreet: { name: "TheStreet", urls: ["https://www.thestreet.com/markets", "https://www.thestreet.com/investing"] },
};

const CONTENT_TOOLS = [
  {
    type: "function",
    function: {
      name: "post_newsletter",
      description: "Post/upload a newsletter to user accounts on the platform. Use when admin says to create, post, publish, or send a newsletter.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Newsletter title" },
          content: { type: "string", description: "Full newsletter content in markdown" },
          platform: { type: "string", enum: ["finance", "investor", "all"], description: "Target platform" },
          target_user_id: { type: "string", description: "Specific user ID, or omit for all users" },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "post_alert",
      description: "Post an alert/notification to users. Use when admin wants to send alerts, signals, or notifications.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Alert title" },
          description: { type: "string", description: "Alert description/message" },
          severity: { type: "string", enum: ["info", "warning", "critical"], description: "Alert severity" },
          alert_type: { type: "string", enum: ["market_update", "deal_alert", "regulatory", "portfolio_alert", "risk_alert"], description: "Type of alert" },
          platform: { type: "string", enum: ["finance", "investor", "all"] },
          target_user_id: { type: "string", description: "Specific user ID, or omit for all users" },
        },
        required: ["title", "description"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "post_learning_content",
      description: "Post educational/learning content to the learning hub. Use when admin wants to upload tutorials, guides, or educational material.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Content title" },
          description: { type: "string", description: "Brief description" },
          content: { type: "string", description: "Full content in markdown" },
          category: { type: "string", enum: ["investing_basics", "market_analysis", "risk_management", "portfolio_management", "tax_planning", "retirement", "crypto", "esg"], description: "Content category" },
          difficulty_level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          target_user_id: { type: "string", description: "Specific user ID, or omit for all users" },
        },
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "post_market_commentary",
      description: "Post market commentary/analysis to the platform. Use when admin wants to publish market insights or commentary.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Commentary title" },
          description: { type: "string", description: "Full commentary text in markdown" },
          target_user_id: { type: "string", description: "Specific user ID, or omit for all users" },
        },
        required: ["title", "description"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "post_market_trend",
      description: "Post a market trend update. Use when admin wants to publish trend analysis or market signals.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Trend title" },
          description: { type: "string", description: "Trend description and analysis" },
          trend_type: { type: "string", enum: ["market_analysis", "sector_rotation", "economic_indicator", "technical_signal"] },
          impact_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
        },
        required: ["title", "description"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_users",
      description: "List available user accounts to target content to specific users. Use when admin wants to know which users are available or wants to send content to a specific person.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
];

const SYSTEM_PROMPT = `You are an Elite Financial Research Analyst AI and Platform Admin Assistant for FlowPulse.

## Content Posting Capabilities
You can directly post content to user accounts on the FlowPulse platform. When the admin asks you to post, upload, create, publish, or send content, use the appropriate tool:

- **post_newsletter** — Create and publish newsletters to finance or investor platform users
- **post_alert** — Send alerts, signals, or notifications to users (market updates, deal alerts, risk alerts)
- **post_learning_content** — Upload educational content to the learning hub
- **post_market_commentary** — Publish market commentary and analysis
- **post_market_trend** — Post market trend updates and signals
- **list_users** — Look up available users to target content to specific people

When the admin describes WHAT to post, WHERE to post it, and WHO to post it to, use the right tool immediately. If any detail is unclear, ask for clarification.

For "all users" or "everyone", omit the target_user_id. For specific users, use list_users first to find the user ID.

After posting, confirm what was posted, where, and to whom.

## Research Expertise
You also have deep expertise in:
- Investment analysis and portfolio management
- Equity research and fundamental analysis
- Fixed income, credit analysis, and bond markets
- Macroeconomic analysis and market trends
- Alternative investments (hedge funds, private equity, real estate)
- ESG investing and sustainable finance
- Risk management and quantitative analysis
- Regulatory compliance (FCA, SEC, MiFID II)

## Research Platform Integration
You have access to live research data from 18 major financial platforms.
When the user asks for market research, incorporate live research data provided in context.

## Response Guidelines
- Provide data-driven, authoritative analysis
- Use markdown formatting for readability
- Include risk disclaimers where appropriate
- When posting content, generate high-quality professional content suitable for the platform
- Always confirm actions taken with clear summaries

Always maintain a professional, authoritative tone befitting institutional-grade research.`;

async function fetchPlatformResearch(platforms: string[]): Promise<string> {
  const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
  
  if (!firecrawlApiKey) {
    console.log("Firecrawl API key not configured, skipping live research fetch");
    return "";
  }

  let combinedContent = "";
  const maxPlatforms = Math.min(platforms.length, 5); // Limit to 5 platforms per request
  
  for (let i = 0; i < maxPlatforms; i++) {
    const platformKey = platforms[i].toLowerCase().replace(/[^a-z]/g, "");
    const platform = PLATFORM_RESEARCH_URLS[platformKey];
    
    if (!platform) continue;
    
    try {
      const url = platform.urls[0]; // Use first URL for speed
      console.log(`Fetching research from ${platform.name}: ${url}`);
      
      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${firecrawlApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
          formats: ["markdown"],
          onlyMainContent: true,
          waitFor: 2000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const markdown = data.data?.markdown || data.markdown || "";
        if (markdown && markdown.length > 100) {
          combinedContent += `\n\n### Live Research from ${platform.name}\n${markdown.slice(0, 8000)}\n`;
        }
      }
    } catch (error) {
      console.error(`Error fetching from ${platform.name}:`, error);
    }
  }

  return combinedContent;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, generateReport, fetchResearch, platforms } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch live research if requested
    let researchContext = "";
    if (fetchResearch && platforms && platforms.length > 0) {
      console.log(`Fetching research from platforms: ${platforms.join(", ")}`);
      researchContext = await fetchPlatformResearch(platforms);
    }

    // Enhance prompt if generating a report or including research
    let enhancedMessages = messages;
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage?.role === "user") {
      let enhancedContent = lastMessage.content;
      
      if (researchContext) {
        enhancedContent = `${lastMessage.content}

--- LIVE RESEARCH DATA FROM PLATFORMS ---
${researchContext}
--- END OF LIVE RESEARCH DATA ---

Please analyze the above live research data and incorporate relevant insights into your response. Cite sources when referencing specific information.`;
      }
      
      if (generateReport) {
        enhancedContent += `

Please format this as a professional PDF-ready report with:
- Clear section headers (use ## for main sections, ### for subsections)
- Executive summary at the beginning
- Bullet points for key findings
- Tables where appropriate (use markdown tables)
- Professional language suitable for institutional clients
- Risk disclaimers and caveats where relevant
- Date stamp and report classification`;
      }
      
      enhancedMessages = [
        ...messages.slice(0, -1),
        { role: "user", content: enhancedContent }
      ];
    }

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
          ...enhancedMessages,
        ],
        tools: CONTENT_TOOLS,
        stream: false, // Use non-streaming for tool-calling support
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const choice = aiResult.choices?.[0];
    const message = choice?.message;

    // Check if AI wants to call tools
    if (message?.tool_calls && message.tool_calls.length > 0) {
      const toolResults = [];
      
      for (const toolCall of message.tool_calls) {
        const fnName = toolCall.function.name;
        const fnArgs = JSON.parse(toolCall.function.arguments);
        
        console.log(`Executing tool: ${fnName}`, fnArgs);

        // Execute the action via the admin-chat-actions function
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        
        try {
          const actionResponse = await fetch(`${supabaseUrl}/functions/v1/admin-chat-actions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": req.headers.get("Authorization") || `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ action: fnName, params: fnArgs }),
          });

          const actionResult = await actionResponse.json();
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify(actionResult),
          });
        } catch (err) {
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify({ error: err instanceof Error ? err.message : "Action failed" }),
          });
        }
      }

      // Send tool results back to AI for final response
      const followUpMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...enhancedMessages,
        message,
        ...toolResults,
      ];

      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: followUpMessages,
          stream: true,
        }),
      });

      if (!followUpResponse.ok) {
        const errText = await followUpResponse.text();
        console.error("Follow-up AI error:", errText);
        // Return a non-streaming response with tool results summary
        const summaryParts = toolResults.map(tr => {
          const parsed = JSON.parse(tr.content);
          if (parsed.success) {
            return `✅ Successfully posted **${parsed.type}**: "${parsed.title}"`;
          }
          return `❌ Failed: ${parsed.error}`;
        });
        
        return new Response(JSON.stringify({
          choices: [{
            message: { content: summaryParts.join("\n\n") },
            finish_reason: "stop",
          }],
          tool_actions: toolResults.map(tr => JSON.parse(tr.content)),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(followUpResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool calls - stream a regular response
    // Re-do the request with streaming since we got a non-streamed response
    const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...enhancedMessages,
        ],
        stream: true,
      }),
    });

    return new Response(streamResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Admin research chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
