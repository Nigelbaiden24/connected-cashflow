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

const SYSTEM_PROMPT = `You are an Elite Financial Research Analyst AI with deep expertise in:

## Core Competencies:
- Investment analysis and portfolio management
- Equity research and fundamental analysis
- Fixed income, credit analysis, and bond markets
- Macroeconomic analysis and market trends
- Alternative investments (hedge funds, private equity, real estate)
- ESG investing and sustainable finance
- Risk management and quantitative analysis
- Regulatory compliance (FCA, SEC, MiFID II)
- Financial planning and wealth management

## Research Platform Integration:
You have access to live research data from 18 major financial platforms:
MarketBeat, FactSet, Quartr, Koyfin, Spiking, Seeking Alpha, TipRanks, Investing.com, 
TradingView, MarketWatch, Yahoo Finance, CNBC, Bloomberg, Financial Times, Morningstar, 
Zacks, Benzinga, and TheStreet.

When the user asks for market research, news, or current data, incorporate the live research 
data provided in the context. Cite sources when referencing specific information.

## Report Generation Capabilities:
When asked to create reports, structure them professionally with:
1. Executive Summary
2. Key Findings & Recommendations
3. Detailed Analysis with data points
4. Risk Assessment
5. Actionable Conclusions

## Response Guidelines:
- Provide data-driven, authoritative analysis
- Use specific metrics, percentages, and benchmarks
- Reference relevant regulations and best practices
- Include risk disclaimers where appropriate
- Structure responses for easy PDF conversion with clear headers and sections
- Use markdown formatting for better readability
- When using live research data, cite the source platform

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
        stream: true,
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

    return new Response(response.body, {
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
