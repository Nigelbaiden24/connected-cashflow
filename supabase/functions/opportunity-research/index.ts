import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Research sources mapped to investment categories
const CATEGORY_RESEARCH_SOURCES: Record<string, { queries: string[]; urls: string[] }> = {
  uk_property: {
    queries: [
      "UK property investment market 2025 trends",
      "UK buy to let rental yields current",
      "UK real estate investment opportunities HMO commercial",
    ],
    urls: [
      "https://www.rightmove.co.uk/news/house-price-index/",
      "https://www.propertyinvestortoday.co.uk/",
      "https://www.gov.uk/government/collections/uk-house-price-index-reports",
    ],
  },
  vehicles: {
    queries: [
      "classic car investment market 2025 returns",
      "luxury vehicle investment appreciation trends",
      "collectible car auction results latest",
    ],
    urls: [
      "https://www.hagerty.co.uk/price-guide/",
      "https://www.bonhams.com/departments/MOT-CAR/",
    ],
  },
  overseas_property: {
    queries: [
      "overseas property investment best countries 2025",
      "international real estate investment returns",
      "emerging property markets global opportunities",
    ],
    urls: [
      "https://www.globalpropertyguide.com/",
      "https://www.knightfrank.com/research",
    ],
  },
  businesses: {
    queries: [
      "UK SME business acquisition opportunities 2025",
      "franchise investment returns UK",
      "startup investment trends venture capital",
    ],
    urls: [
      "https://www.businessesforsale.com/uk",
      "https://www.daltonsbusiness.com/",
    ],
  },
  stocks: {
    queries: [
      "UK equities investment opportunities FTSE analysis",
      "best stocks to buy UK 2025 analyst picks",
      "US equities market outlook current",
    ],
    urls: [
      "https://www.hl.co.uk/shares/stock-market-summary/ftse-100",
      "https://www.marketbeat.com/market-data/",
    ],
  },
  crypto: {
    queries: [
      "cryptocurrency investment opportunities 2025",
      "DeFi digital assets market trends",
      "NFT market analysis investment potential",
    ],
    urls: [
      "https://www.coindesk.com/markets/",
      "https://www.coingecko.com/en/global-charts",
    ],
  },
  private_equity: {
    queries: [
      "private equity investment opportunities 2025",
      "venture capital deals UK market",
      "growth equity buyout market trends",
    ],
    urls: [
      "https://www.bvca.co.uk/Research/Industry-Activity",
      "https://pitchbook.com/news/reports",
    ],
  },
  memorabilia: {
    queries: [
      "sports memorabilia investment market 2025",
      "collectibles auction results appreciation",
      "signed items investment returns historical",
    ],
    urls: [
      "https://www.christies.com/results",
      "https://www.sothebys.com/en/results",
    ],
  },
  commodities: {
    queries: [
      "gold silver precious metals investment 2025",
      "commodities market outlook current prices",
      "hard assets investment portfolio allocation",
    ],
    urls: [
      "https://www.gold.org/goldhub",
      "https://www.kitco.com/",
    ],
  },
  funds: {
    queries: [
      "best mutual funds ETFs 2025 performance",
      "REIT investment opportunities UK",
      "hedge fund market performance analysis",
    ],
    urls: [
      "https://www.morningstar.co.uk/uk/screener/fund.aspx",
      "https://www.trustnet.com/",
    ],
  },
};

async function scrapeUrl(url: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!response.ok) return "";

    const data = await response.json();
    const markdown = data.data?.markdown || data.markdown || "";
    return markdown.slice(0, 6000);
  } catch (error) {
    console.error(`Scrape error for ${url}:`, error);
    return "";
  }
}

async function searchWeb(query: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    if (!response.ok) return "";

    const data = await response.json();
    const results = data.data || [];
    return results
      .map((r: any) => {
        const title = r.title || "";
        const desc = r.description || "";
        const md = (r.markdown || "").slice(0, 2000);
        return `### ${title}\n${desc}\n${md}`;
      })
      .join("\n\n")
      .slice(0, 8000);
  } catch (error) {
    console.error(`Search error for "${query}":`, error);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, subCategory, customQuery } = await req.json();

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const sources = CATEGORY_RESEARCH_SOURCES[category];
    if (!sources && !customQuery) {
      throw new Error(`Unknown category: ${category}`);
    }

    console.log(`Researching: ${category} / ${subCategory || "all"}`);

    // Phase 1: Parallel scraping & searching
    const queries = customQuery
      ? [customQuery]
      : sources.queries.map((q) =>
          subCategory ? `${q} ${subCategory}` : q
        );
    const urls = sources?.urls || [];

    const [searchResults, scrapeResults] = await Promise.all([
      Promise.all(queries.map((q) => searchWeb(q, FIRECRAWL_API_KEY))),
      Promise.all(urls.slice(0, 3).map((u) => scrapeUrl(u, FIRECRAWL_API_KEY))),
    ]);

    const combinedResearch = [
      "## Web Search Results",
      ...searchResults.filter(Boolean),
      "## Direct Source Data",
      ...scrapeResults.filter(Boolean),
    ].join("\n\n");

    if (!combinedResearch || combinedResearch.length < 200) {
      return new Response(
        JSON.stringify({
          success: true,
          research: "Limited data available for this category. Try a custom search query.",
          summary: null,
          sourcesScraped: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Phase 2: AI summarisation
    const categoryLabel = category.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    const subLabel = subCategory || "General";

    const systemPrompt = `You are an investment research analyst at FlowPulse, an institutional-grade financial platform. Your task is to analyze raw scraped research data and produce a structured investment opportunity brief that an admin can use to create a new opportunity listing.

You must output a structured analysis in this exact format:

## Market Overview
Brief overview of the current market conditions for this asset class.

## Key Opportunities Identified
List 3-5 specific investment opportunities found in the research data, each with:
- **Opportunity Name**: Clear title
- **Estimated Value/Price Range**: If available
- **Location/Market**: Where
- **Projected Returns**: If available
- **Risk Level**: Low/Medium/High

## Market Data & Numbers
Key statistics, yields, prices, growth rates from the scraped data.

## Investment Thesis
Why this is a compelling area for investment right now.

## Risk Factors
Top risks to consider.

## Recommended Listing Details
Suggest how the admin should fill out the opportunity form:
- Suggested title
- Short description (2-3 sentences)
- Recommended analyst rating (Strong Buy/Buy/Hold/Sell)
- Suggested scores (1-5) for: Quality, Value, Liquidity, Risk, Transparency
- Key watchpoints

Be specific, data-driven, and cite numbers from the research where possible.`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Analyze the following live research data for the investment category: **${categoryLabel} — ${subLabel}**\n\n${combinedResearch.slice(0, 30000)}`,
            },
          ],
          stream: true,
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI analysis failed");
    }

    // Stream the AI response back
    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Opportunity research error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Research failed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
