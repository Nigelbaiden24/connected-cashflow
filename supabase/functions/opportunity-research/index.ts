import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORY_RESEARCH_SOURCES: Record<string, { queries: string[]; urls: string[] }> = {
  uk_property: {
    queries: [
      "UK property investment opportunities for sale 2025",
      "UK buy to let properties available high yield",
      "UK HMO commercial property investment listings current",
      "UK land for sale plots development investment 2025",
      "UK land auction lots agricultural woodland building plots",
      "cheap land for sale UK smallholding farm woodland investment",
      "UK parking spaces garage investment opportunities for sale",
      "UK commercial property land development sites for sale",
    ],
    urls: [
      "https://www.rightmove.co.uk/news/house-price-index/",
      "https://www.propertyinvestortoday.co.uk/",
      "https://www.gov.uk/government/collections/uk-house-price-index-reports",
      "https://www.landsale.co.uk/",
      "https://www.plotfinder.net/",
      "https://www.uklandandfarms.co.uk/",
      "https://www.landfor.sale/",
      "https://www.propertyauctionaction.co.uk/",
      "https://www.sdlauctions.co.uk/",
      "https://www.eigpropertyauctions.co.uk/",
      "https://www.zoopla.co.uk/for-sale/land/",
      "https://www.onthemarket.com/land-for-sale/",
    ],
  },
  vehicles: {
    queries: [
      "classic car investment opportunities for sale auction 2025",
      "luxury vehicle collectible car auction results latest",
      "rare cars appreciating value investment grade",
    ],
    urls: [
      "https://www.hagerty.co.uk/price-guide/",
      "https://www.bonhams.com/departments/MOT-CAR/",
    ],
  },
  overseas_property: {
    queries: [
      "Africa property investment opportunities land for sale 2025 Kenya Ghana Nigeria Tanzania",
      "South America real estate investment cheap land Colombia Brazil Peru Ecuador",
      "Southeast Asia property investment Philippines Cambodia Vietnam Thailand land plots",
      "Eastern Europe property investment Romania Bulgaria Georgia Turkey affordable",
      "Portugal Spain Greece property investment golden visa affordable 2025",
      "Caribbean property land investment Belize Costa Rica Panama opportunities",
      "emerging markets real estate investment high growth developing countries",
      "cheap land for sale Africa Asia South America investment grade plots",
      "overseas property investment risks developing countries economy analysis",
      "global real estate market emerging economies property forecast 2025",
    ],
    urls: [
      "https://www.globalpropertyguide.com/",
      "https://www.knightfrank.com/research",
      "https://www.numbeo.com/property-investment/",
      "https://www.worldbank.org/en/topic/realestate",
      "https://www.imf.org/en/Publications/WEO",
    ],
  },
  businesses: {
    queries: [
      "startup funding rounds 2025 series A series B investment opportunities",
      "UK businesses for sale acquisition M&A opportunities 2025",
      "venture capital deals startups raising funding now",
      "M&A targets mid-market acquisitions UK Europe 2025",
      "startup accelerator demo day companies seeking investment",
      "franchise investment opportunities UK high return",
      "profitable SME businesses for sale current listings",
      "angel investor deals seed funding startups 2025",
      "tech startup funding rounds open for investment",
      "private company acquisitions buyout opportunities current",
    ],
    urls: [
      "https://www.crunchbase.com/discover/funding_rounds",
      "https://techcrunch.com/category/venture/",
      "https://www.eu-startups.com/",
      "https://www.uktech.news/",
      "https://sifted.eu/",
      "https://www.businessesforsale.com/uk",
      "https://www.daltonsbusiness.com/",
      "https://pitchbook.com/news/reports",
      "https://news.crunchbase.com/venture/",
      "https://www.seedrs.com/invest",
    ],
  },
  stocks: {
    queries: [
      "best stocks to buy now UK analyst strong buy recommendations",
      "undervalued stocks investment opportunities FTSE",
      "US equities top picks analysts current",
    ],
    urls: [
      "https://www.hl.co.uk/shares/stock-market-summary/ftse-100",
      "https://www.marketbeat.com/market-data/",
    ],
  },
  crypto: {
    queries: [
      "cryptocurrency investment opportunities best coins 2025",
      "DeFi tokens high potential undervalued",
      "NFT digital asset investment opportunities current",
    ],
    urls: [
      "https://www.coindesk.com/markets/",
      "https://www.coingecko.com/en/global-charts",
    ],
  },
  private_equity: {
    queries: [
      "private equity investment opportunities deals 2025",
      "venture capital deals seeking investors UK",
      "growth equity buyout opportunities current",
    ],
    urls: [
      "https://www.bvca.co.uk/Research/Industry-Activity",
      "https://pitchbook.com/news/reports",
    ],
  },
  memorabilia: {
    queries: [
      "sports memorabilia investment lots for sale auction 2025",
      "collectibles signed items investment grade auction results",
      "rare memorabilia appreciating value current listings",
    ],
    urls: [
      "https://www.christies.com/results",
      "https://www.sothebys.com/en/results",
    ],
  },
  commodities: {
    queries: [
      "gold silver precious metals investment opportunities buy now",
      "commodities investment best opportunities current prices",
      "hard assets investment grade bullion coins",
    ],
    urls: [
      "https://www.gold.org/goldhub",
      "https://www.kitco.com/",
    ],
  },
  funds: {
    queries: [
      "best mutual funds ETFs to invest in 2025 top performers",
      "REIT investment opportunities UK high dividend",
      "hedge fund opportunities open to investors",
    ],
    urls: [
      "https://www.morningstar.co.uk/uk/screener/fund.aspx",
      "https://www.trustnet.com/",
    ],
  },
  blockchain: {
    queries: [
      "blockchain investment opportunities 2025 tokenized assets",
      "best DeFi protocols yield farming opportunities current",
      "web3 blockchain projects investment high potential 2025",
      "real world asset tokenization RWA blockchain opportunities",
      "blockchain gaming metaverse investment opportunities current",
      "layer 2 blockchain scaling solutions investment potential",
    ],
    urls: [
      "https://www.coindesk.com/business/",
      "https://defillama.com/",
      "https://dappradar.com/rankings",
      "https://www.theblock.co/latest",
      "https://messari.io/research",
    ],
  },
};

interface SourceRecord {
  url: string;
  type: "search" | "scrape";
  query?: string;
  scrapedAt: string;
  status: "success" | "error";
  contentLength: number;
  error?: string;
}

interface SearchResultItem {
  title: string;
  url: string;
  description: string;
  imageUrl?: string;
}

async function scrapeUrl(url: string, apiKey: string): Promise<{ content: string; source: SourceRecord }> {
  const source: SourceRecord = {
    url,
    type: "scrape",
    scrapedAt: new Date().toISOString(),
    status: "error",
    contentLength: 0,
  };
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown", "links"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!response.ok) {
      source.error = `HTTP ${response.status}`;
      return { content: "", source };
    }

    const data = await response.json();
    const markdown = data.data?.markdown || data.markdown || "";
    const content = markdown.slice(0, 6000);
    source.status = "success";
    source.contentLength = content.length;
    return { content, source };
  } catch (error) {
    console.error(`Scrape error for ${url}:`, error);
    source.error = error instanceof Error ? error.message : "Unknown error";
    return { content: "", source };
  }
}

async function searchWeb(query: string, apiKey: string): Promise<{ content: string; source: SourceRecord; results: SearchResultItem[] }> {
  const source: SourceRecord = {
    url: "https://api.firecrawl.dev/v1/search",
    type: "search",
    query,
    scrapedAt: new Date().toISOString(),
    status: "error",
    contentLength: 0,
  };
  const results: SearchResultItem[] = [];
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: 10,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    if (!response.ok) {
      source.error = `HTTP ${response.status}`;
      return { content: "", source, results };
    }

    const data = await response.json();
    const rawResults = data.data || [];
    const content = rawResults
      .map((r: any) => {
        const title = r.title || "";
        const desc = r.description || "";
        const md = (r.markdown || "").slice(0, 2000);
        const rUrl = r.url || r.sourceURL || "";
        // Extract any og:image or first image from metadata
        const imageUrl = r.metadata?.ogImage || r.metadata?.image || r.screenshot || "";
        
        results.push({ title, url: rUrl, description: desc, imageUrl });
        return `### ${title}\n**Source:** ${rUrl}\n${desc}\n${md}`;
      })
      .join("\n\n")
      .slice(0, 8000);

    source.status = "success";
    source.contentLength = content.length;
    return { content, source, results };
  } catch (error) {
    console.error(`Search error for "${query}":`, error);
    source.error = error instanceof Error ? error.message : "Unknown error";
    return { content: "", source, results };
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

    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const sources = CATEGORY_RESEARCH_SOURCES[category];
    if (!sources && !customQuery) throw new Error(`Unknown category: ${category}`);

    console.log(`Researching: ${category} / ${subCategory || "all"}`);

    const queries = customQuery
      ? [customQuery]
      : sources.queries.map((q) => subCategory ? `${q} ${subCategory}` : q);
    const urls = sources?.urls || [];

    const [searchResults, scrapeResults] = await Promise.all([
      Promise.all(queries.map((q) => searchWeb(q, FIRECRAWL_API_KEY))),
      Promise.all(urls.slice(0, 8).map((u) => scrapeUrl(u, FIRECRAWL_API_KEY))),
    ]);

    const allSources: SourceRecord[] = [];
    const allSearchResults: SearchResultItem[] = [];

    searchResults.forEach((r) => {
      allSources.push(r.source);
      allSearchResults.push(...r.results);
    });
    scrapeResults.forEach((r) => {
      allSources.push(r.source);
    });

    const combinedResearch = [
      "## Web Search Results",
      ...searchResults.map((r) => r.content).filter(Boolean),
      "## Direct Source Data",
      ...scrapeResults.map((r) => r.content).filter(Boolean),
    ].join("\n\n");

    if (!combinedResearch || combinedResearch.length < 200) {
      return new Response(
        JSON.stringify({
          success: true,
          research: "Limited data available for this category. Try a custom search query.",
          summary: null,
          sourcesScraped: 0,
          sourceLog: allSources,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const categoryLabel = category.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    const subLabel = subCategory || "General";

    const sourceListForAI = allSources
      .filter((s) => s.status === "success")
      .map((s) => s.type === "search" ? `Search: "${s.query}"` : `Direct: ${s.url}`)
      .join("\n");

    // Build a reference list of search result URLs with images for the AI
    const searchResultReference = allSearchResults
      .filter(r => r.url)
      .map(r => `- Title: ${r.title} | URL: ${r.url} | Image: ${r.imageUrl || "none"} | Desc: ${r.description?.slice(0, 100)}`)
      .join("\n");

    const isOverseasProperty = category === "overseas_property";
    const isBusinessMA = category === "businesses";

    const economicAnalysisInstructions = isOverseasProperty ? `

CRITICAL ADDITIONAL INSTRUCTIONS FOR OVERSEAS PROPERTY & LAND:
You MUST perform a thorough economic and risk analysis for EACH opportunity's country. For every opportunity, include in the description and key_metrics:

1. **Country Economic Assessment**: GDP growth rate, inflation rate, currency stability, political stability index
2. **Property Market Analysis**: Average property price trends (rising/falling/stable), rental yield averages, foreign ownership laws and restrictions
3. **Risk Factors**: Currency devaluation risk, political instability, corruption index, rule of law strength, land ownership rights for foreigners
4. **Growth Catalysts**: Infrastructure development plans, tourism growth, urbanisation rate, foreign direct investment trends
5. **Realistic ROI Calculation**: Factor in local taxes, maintenance costs, management fees, currency exchange risk, and realistic rental income
6. **News & Evidence**: Reference recent news articles, economic reports, or data that support or challenge the investment case

In the "investment_thesis" field, provide a BALANCED view — both the bull case AND the bear case.
In "key_metrics", ALWAYS include: "gdp_growth", "inflation_rate", "currency_risk" (Low/Medium/High), "political_stability" (score or rating), "foreign_ownership" (Allowed/Restricted/Prohibited), "rental_yield_avg", "price_trend" (Rising/Stable/Falling), "economic_outlook" (Positive/Neutral/Negative).

Focus on developing nations in Africa (Kenya, Ghana, Nigeria, Tanzania, Rwanda, South Africa), Asia (Philippines, Cambodia, Vietnam, Thailand, Indonesia, Sri Lanka), South America (Colombia, Brazil, Peru, Ecuador, Mexico), Eastern Europe (Romania, Bulgaria, Georgia, Turkey, Montenegro), and affordable Southern Europe (Portugal, Spain, Greece).

Be HONEST about risks — many developing markets have serious risks. Flag any red flags clearly.
` : isBusinessMA ? `

CRITICAL ADDITIONAL INSTRUCTIONS FOR BUSINESSES/M&A:
You are an enterprise-grade M&A and startup intelligence analyst. You MUST find REAL, ACTIVE startups, funding rounds, investors, and industry events. For each opportunity include:

1. **Company/Deal Profile**: Real company name, founding year, team size, headquarters location, website
2. **Funding Stage**: Pre-seed, Seed, Series A/B/C/D+, Growth, M&A, IPO track
3. **Financial Metrics**: Revenue (ARR/MRR if SaaS), valuation, funding raised to date, burn rate if available
4. **Sector & Industry**: Primary sector (FinTech, HealthTech, PropTech, AI/ML, CleanTech, EdTech, etc.)
5. **Growth Signals**: User growth, revenue growth rate, market expansion, key partnerships, notable customers
6. **Investor Profile**: Lead investors, notable angels, VC firms involved, follow-on potential
7. **M&A Indicators**: Strategic fit signals, acquirer interest, comparable exit multiples in sector
8. **Event Context**: Demo days, pitch competitions, accelerator cohorts if applicable

In "key_metrics", ALWAYS include: "sector", "funding_stage", "revenue" (or "pre-revenue"), "valuation" (if known), "total_raised", "team_size", "growth_rate", "investor_names", "founded_year".
In "investment_thesis", include the strategic rationale — why this is compelling NOW, competitive moat, and risks.
In "risk_level", factor in: market timing, competition, regulatory risk, team experience, and capital efficiency.

Focus on REAL companies with verifiable data from Crunchbase, TechCrunch, PitchBook, Sifted, EU-Startups, Seedrs, etc.
Do NOT invent companies. If data is limited, say so honestly.
` : "";

    const systemPrompt = `You are an investment research analyst at FlowPulse, an institutional-grade financial platform. Your task is to analyze raw scraped research data and identify INDIVIDUAL, SPECIFIC investment opportunities that an admin can list on the platform.

CRITICAL INSTRUCTION: You must output INDIVIDUAL opportunities — each one a distinct, real investment opportunity found in the data. NOT a general market overview.
${economicAnalysisInstructions}
After your analysis, you MUST output a JSON block wrapped in \`\`\`json ... \`\`\` containing an array of individual opportunities. Each opportunity must have:

\`\`\`json
[
  {
    "name": "Specific opportunity name/title",
    "description": "2-3 sentence description of this specific opportunity${isOverseasProperty ? ' including country economic context and recent supporting news' : ''}",
    "source_url": "The exact URL where this opportunity was found",
    "source_website": "Name of the website (e.g. Rightmove, Seeking Alpha)",
    "image_url": "URL of an image related to this opportunity if available, or empty string",
    "scraped_date": "${new Date().toISOString().split('T')[0]}",
    "estimated_value": "Price or value range (e.g. £250,000 - £300,000)",
    "location": "Country and specific location${isOverseasProperty ? ' (MUST include country name)' : ''}",
    "projected_returns": "Expected returns${isOverseasProperty ? ' factoring in currency risk and local costs' : ''}",
    "risk_level": "Low/Medium/High",
    "analyst_rating": "Strong Buy/Buy/Hold/Sell",
    "investment_thesis": "${isOverseasProperty ? 'Bull case AND bear case with economic reasoning' : '1-2 sentence thesis for why this is compelling'}",
    "key_metrics": { ${isOverseasProperty ? '"gdp_growth": "X%", "inflation_rate": "X%", "currency_risk": "Low/Medium/High", "political_stability": "rating", "foreign_ownership": "status", "rental_yield_avg": "X%", "price_trend": "Rising/Stable/Falling", "economic_outlook": "Positive/Neutral/Negative"' : '"any": "relevant metrics like yield, P/E, etc."'} }
  }
]
\`\`\`

RULES:
1. Find at least 20 SPECIFIC individual opportunities from the scraped data (aim for 20-30)
2. Each must have a real source_url — the ACTUAL page where you found this data
3. Use image URLs from the search results reference where available
4. Be specific — real names, real prices, real locations from the data
5. Before the JSON block, write a brief Market Context section (3-4 sentences max)
6. Cite the source website name for every opportunity

Here are the search result URLs and images found during scraping — use these as source_urls and image_urls:
${searchResultReference}`;

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
              content: `Find individual investment opportunities from this scraped data for: **${categoryLabel} — ${subLabel}**

Research conducted on: ${new Date().toISOString()}

Sources used:
${sourceListForAI}

---

${combinedResearch.slice(0, 30000)}`,
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

    const encoder = new TextEncoder();
    const sourceMetaEvent = `data: ${JSON.stringify({
      type: "source_metadata",
      sources: allSources,
      searchResults: allSearchResults.slice(0, 30),
      searchResultUrls: allSearchResults.filter(r => r.url).map(r => r.url).slice(0, 30),
      researchDate: new Date().toISOString(),
      category: categoryLabel,
      subCategory: subLabel,
    })}\n\n`;

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    (async () => {
      await writer.write(encoder.encode(sourceMetaEvent));
      const reader = aiResponse.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
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
