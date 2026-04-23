import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Optimized research URLs for each platform - targeting news/research content
const PLATFORM_RESEARCH_URLS: Record<string, string[]> = {
  workspace: ['https://workspace.google.com/marketplace/category/finance'],
  marketbeat: [
    'https://www.marketbeat.com/market-data/',
    'https://www.marketbeat.com/ratings/',
    'https://www.marketbeat.com/insider-trades/',
    'https://www.marketbeat.com/stocks/upgrades-downgrades/'
  ],
  factset: [
    'https://www.factset.com/insights',
    'https://www.factset.com/insights/market-insights',
    'https://insight.factset.com/'
  ],
  quartr: [
    'https://quartr.com/insights',
    'https://quartr.com/discover'
  ],
  koyfin: [
    'https://www.koyfin.com/news',
    'https://www.koyfin.com/market-news'
  ],
  aibase: [
    'https://www.aibase.com/news',
    'https://www.aibase.com/tools'
  ],
  spiking: [
    'https://spiking.com/blog',
    'https://spiking.com/whale-index'
  ],
  feedly: [
    'https://feedly.com/i/discover/sources/search/finance',
    'https://feedly.com/i/discover/sources/search/stocks'
  ],
  stocksplus: ['https://stocks.apple.com/news'],
  seekingalpha: [
    'https://seekingalpha.com/market-news',
    'https://seekingalpha.com/stock-ideas',
    'https://seekingalpha.com/dividends',
    'https://seekingalpha.com/earnings/earnings-news',
    'https://seekingalpha.com/market-outlook'
  ],
  tipranks: [
    'https://www.tipranks.com/news',
    'https://www.tipranks.com/analysts/top',
    'https://www.tipranks.com/stocks-to-buy',
    'https://www.tipranks.com/trending-stocks'
  ],
  investingcom: [
    'https://www.investing.com/news/stock-market-news',
    'https://www.investing.com/news/economy',
    'https://www.investing.com/analysis/',
    'https://www.investing.com/news/forex-news'
  ],
  tradingview: [
    'https://www.tradingview.com/markets/stocks-usa/market-movers-gainers/',
    'https://www.tradingview.com/markets/stocks-usa/market-movers-losers/',
    'https://www.tradingview.com/news/',
    'https://www.tradingview.com/ideas/'
  ],
  marketwatch: [
    'https://www.marketwatch.com/latest-news',
    'https://www.marketwatch.com/markets',
    'https://www.marketwatch.com/investing',
    'https://www.marketwatch.com/economy-politics'
  ],
  yahoofinance: [
    'https://finance.yahoo.com/topic/stock-market-news/',
    'https://finance.yahoo.com/topic/earnings/',
    'https://finance.yahoo.com/topic/economic-news/',
    'https://finance.yahoo.com/screener/predefined/most_actives',
    'https://finance.yahoo.com/screener/predefined/day_gainers'
  ],
  cnbc: [
    'https://www.cnbc.com/markets/',
    'https://www.cnbc.com/investing/',
    'https://www.cnbc.com/earnings/',
    'https://www.cnbc.com/economy/',
    'https://www.cnbc.com/finance/'
  ],
  bloomberg: [
    'https://www.bloomberg.com/markets',
    'https://www.bloomberg.com/markets/stocks',
    'https://www.bloomberg.com/technology',
    'https://www.bloomberg.com/economics'
  ],
  ft: [
    'https://www.ft.com/markets',
    'https://www.ft.com/companies',
    'https://www.ft.com/global-economy',
    'https://www.ft.com/markets/equities'
  ]
};

// Curated investment-category sources (mirrors src/components/admin/investmentCategories.ts).
const INVESTMENT_CATEGORY_URLS: Record<string, string[]> = {
  "stocks-equities": [
    "https://www.marketwatch.com/markets",
    "https://finance.yahoo.com/topic/stock-market-news/",
    "https://www.cnbc.com/markets/",
    "https://seekingalpha.com/market-news",
    "https://www.investing.com/news/stock-market-news",
    "https://www.nasdaq.com/market-activity/ipos",
  ],
  "crypto-digital": [
    "https://www.coindesk.com/markets",
    "https://cointelegraph.com/category/markets",
    "https://www.theblock.co/latest",
    "https://decrypt.co/news",
    "https://messari.io/news",
    "https://coinmarketcap.com/headlines/news/",
  ],
  "real-estate": [
    "https://www.bisnow.com/national",
    "https://commercialobserver.com",
    "https://www.propertyweek.com",
    "https://www.costar.com/article",
    "https://www.globest.com",
    "https://reactnews.com",
  ],
  "fixed-income": [
    "https://www.reuters.com/markets/rates-bonds/",
    "https://www.ft.com/capital-markets",
    "https://www.bloomberg.com/markets/rates-bonds",
    "https://www.marketwatch.com/investing/bonds",
    "https://www.investing.com/rates-bonds/",
  ],
  "commodities": [
    "https://www.mining.com/news/",
    "https://oilprice.com/Latest-Energy-News/World-News/",
    "https://www.kitco.com/news/",
    "https://www.reuters.com/markets/commodities/",
    "https://www.agweb.com/markets",
  ],
  "fx": [
    "https://www.fxstreet.com/news",
    "https://www.dailyfx.com/market-news",
    "https://www.investing.com/news/forex-news",
    "https://www.reuters.com/markets/currencies/",
    "https://www.fxempire.com/news",
  ],
  "funds-etfs": [
    "https://www.morningstar.com/news",
    "https://www.etf.com/sections/news",
    "https://citywire.com/funds-insider/news",
    "https://www.trustnet.com/news",
    "https://www.ftadviser.com/investments.html",
  ],
  "alternatives": [
    "https://www.hfr.com/news",
    "https://www.institutionalinvestor.com/category/Alternatives",
    "https://news.artnet.com/market",
    "https://www.liv-ex.com/news-insights/",
    "https://robbreport.com/lifestyle/auctions/",
  ],
  "esg": [
    "https://www.esgtoday.com",
    "https://impactalpha.com/feed-2/",
    "https://www.responsible-investor.com",
    "https://www.greenbiz.com/topics/finance",
    "https://sustainablebrands.com/news_and_views",
  ],
  "private-equity": [
    "https://www.penews.com",
    "https://www.privateequitywire.co.uk/news/",
    "https://pitchbook.com/news",
    "https://www.buyoutsinsider.com",
    "https://realdeals.eu.com",
  ],
  "venture-capital": [
    "https://techcrunch.com/category/venture/",
    "https://news.crunchbase.com",
    "https://sifted.eu/news",
    "https://pitchbook.com/news/venture-capital",
    "https://venturebeat.com/category/venture/",
    "https://www.uktech.news/funding",
  ],
  "infrastructure": [
    "https://www.infrastructureinvestor.com",
    "https://ijglobal.com/news",
    "https://www.reuters.com/business/energy/",
    "https://www.powermag.com/news/",
    "https://www.datacenterdynamics.com/en/news/",
  ],
  "sme-acquisitions": [
    "https://www.bizbuysell.com/learning-center/",
    "https://www.axial.net/forum/",
    "https://www.dealstreetasia.com/category/sme",
    "https://www.insidermedia.com/news/national/all",
    "https://www.business-sale.com/insights",
  ],
  "distressed": [
    "https://www.debtwire.com/intelligence",
    "https://reorg.com/insights/",
    "https://restructuring-newswire.com",
    "https://distressed-debt-investing.com",
    "https://www.bloomberg.com/markets/fixed-income",
  ],
  "debt-lending": [
    "https://www.privatedebtinvestor.com",
    "https://www.withintelligence.com/altcredit/news",
    "https://www.creditflux.com",
    "https://www.globalcapital.com/loans",
    "https://www.reuters.com/markets/rates-bonds/",
  ],
  "fractional-pe-vc": [
    "https://www.crowdcube.com/explore",
    "https://www.seedrs.com/invest",
    "https://republic.com/invest",
    "https://www.angellist.com/syndicates",
    "https://wefunder.com/explore/all",
    "https://www.moonfare.com/insights",
  ],
  "private-market-platforms": [
    "https://forgeglobal.com/insights/",
    "https://equityzen.com/knowledge-center/",
    "https://www.hiive.com/insights",
    "https://www.nasdaqprivatemarket.com/insights/",
    "https://carta.com/blog/category/private-markets/",
  ],
  "derivatives": [
    "https://www.cmegroup.com/education/articles-and-reports.html",
    "https://www.cboe.com/insights/",
    "https://www.risk.net/derivatives",
    "https://www.optionsplay.com/blog/",
    "https://www.tastylive.com/news-insights",
  ],
  "capital-protected-notes": [
    "https://www.structuredretailproducts.com/news",
    "https://www.investmentweek.co.uk/category/structured-products",
    "https://www.ftadviser.com/investments/structured-products.html",
    "https://www.lowes.co.uk/news",
    "https://www.meteoram.com/news-insights/",
  ],
  "savings-cash-yield": [
    "https://www.moneysavingexpert.com/savings/",
    "https://moneyfacts.co.uk/news/savings/",
    "https://www.bankrate.com/banking/savings/",
    "https://www.nerdwallet.com/h/category/savings-accounts",
    "https://www.thisismoney.co.uk/money/saving/index.html",
  ],
  "pensions-tax-wrappers": [
    "https://www.hl.co.uk/news",
    "https://www.ajbell.co.uk/investment-articles",
    "https://www.ii.co.uk/analysis-commentary",
    "https://www.pensionsage.com/pa/news.php",
    "https://www.moneymarketing.co.uk/news/pensions/",
  ],
  "thematics-packaged": [
    "https://www.ark-invest.com/research",
    "https://www.globalxetfs.com/research/",
    "https://www.ishares.com/uk/individual/en/insights",
    "https://www.wisdomtree.eu/en-gb/blog",
    "https://www.etfstream.com/topic/thematic",
  ],
  "copy-trading": [
    "https://www.etoro.com/news-and-analysis/",
    "https://blog.zulutrade.com/",
    "https://blog.naga.com/",
    "https://pepperstone.com/en/learn-to-trade/social-trading/",
    "https://www.duplitrade.com/news/",
  ],
};

const CATEGORY_LABELS: Record<string, string> = {
  "stocks-equities": "Stocks & Equities",
  "crypto-digital": "Crypto & Digital Assets",
  "real-estate": "Real Estate",
  "fixed-income": "Fixed Income & Bonds",
  "commodities": "Commodities",
  "fx": "Foreign Exchange",
  "funds-etfs": "Funds & ETFs",
  "alternatives": "Alternative Investments",
  "esg": "ESG & Impact Investing",
  "private-equity": "Private Equity",
  "venture-capital": "Venture Capital",
  "infrastructure": "Infrastructure",
  "sme-acquisitions": "SME Acquisitions",
  "distressed": "Distressed Assets",
  "debt-lending": "Debt & Lending",
  "fractional-pe-vc": "Fractional Private Equity / VC",
  "private-market-platforms": "Private Market Platforms",
  "derivatives": "Derivatives",
  "capital-protected-notes": "Capital-Protected & Income Notes",
  "savings-cash-yield": "Savings, Cash & Yield Products",
  "pensions-tax-wrappers": "Pensions & Tax Wrappers",
  "thematics-packaged": "Thematics & Packaged Investing",
  "copy-trading": "Copy Trading",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, platformName, action, scrapedData, customPrompt, scrapeAll, categoryKey } = await req.json();

    // Sweep an entire investment category's curated sources
    if (categoryKey) {
      return await scrapeCategoryUrls(categoryKey);
    }

    // If scrapeAll is true, scrape all research URLs for the platform
    if (scrapeAll && platformName) {
      return await scrapeAllPlatformUrls(platformName);
    }

    // If action is generate-report, use AI to analyze scraped data
    if (action === 'generate-report') {
      return await generateAIReport(scrapedData, customPrompt);
    }

    // Otherwise, scrape the platform
    return await scrapePlatform(url, platformName);
  } catch (error) {
    console.error('Error in financial-research-scraper:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Firecrawl v2 search — discovers fresh, opportunity-level articles across the
// open web for a given category, then returns full markdown for each hit.
async function firecrawlCategorySearch(apiKey: string, categoryLabel: string, limit = 8) {
  const queries = [
    `${categoryLabel} investment opportunities this week`,
    `${categoryLabel} new deal OR funding round OR acquisition`,
    `${categoryLabel} top picks analyst rating price target`,
  ];
  const allHits: Array<{ url: string; title?: string; description?: string; markdown?: string }> = [];
  for (const q of queries) {
    try {
      const res = await fetch('https://api.firecrawl.dev/v2/search', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          limit,
          tbs: 'qdr:w',
          scrapeOptions: { formats: ['markdown'], onlyMainContent: true },
        }),
      });
      if (!res.ok) {
        console.warn(`[search] "${q}" failed ${res.status}`);
        continue;
      }
      const data = await res.json();
      const arr = data?.data?.web ?? data?.web ?? data?.data ?? [];
      if (Array.isArray(arr)) allHits.push(...arr);
    } catch (e) {
      console.warn(`[search] "${q}" error`, e);
    }
  }
  // Dedupe by URL
  const seen = new Set<string>();
  return allHits.filter((h) => {
    if (!h?.url || seen.has(h.url)) return false;
    seen.add(h.url);
    return true;
  });
}

async function scrapeCategoryUrls(categoryKey: string) {
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlApiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const urls = INVESTMENT_CATEGORY_URLS[categoryKey];
  const label = CATEGORY_LABELS[categoryKey] ?? categoryKey;
  if (!urls || urls.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: `No sources configured for category "${categoryKey}"` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`[category:${categoryKey}] deep-scraping ${urls.length} curated sources + web search`);

  let combinedContent = '';
  const scrapedUrls: string[] = [];
  const errors: string[] = [];
  const articleHits: Array<{ url: string; title?: string }> = [];

  // PHASE 1 – curated sources: scrape index page AND extract links to deep-scrape top stories
  for (const u of urls) {
    try {
      const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
        method: 'POST',
        headers: { Authorization: `Bearer ${firecrawlApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: u,
          formats: ['markdown', 'links'],
          onlyMainContent: true,
          waitFor: 3000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const root = data.data ?? data;
        const markdown: string = root?.markdown || '';
        const links: string[] = root?.links || [];
        if (markdown && markdown.length > 100) {
          combinedContent += `\n\n### Curated source: ${u}\n\n${markdown.slice(0, 8000)}`;
          scrapedUrls.push(u);
        }
        // Heuristically pick article-style links from the same domain
        try {
          const host = new URL(u).hostname.replace(/^www\./, '');
          const candidates = (Array.isArray(links) ? links : [])
            .filter((l) => typeof l === 'string')
            .filter((l) => {
              try {
                const lh = new URL(l).hostname.replace(/^www\./, '');
                if (lh !== host) return false;
                // Looks like article (has slug with hyphens or numeric date)
                return /[a-z0-9]-[a-z0-9]/i.test(new URL(l).pathname) && new URL(l).pathname.length > 20;
              } catch {
                return false;
              }
            })
            .slice(0, 4);
          candidates.forEach((c) => articleHits.push({ url: c }));
        } catch {}
      } else {
        errors.push(`Failed ${u}: ${response.status}`);
      }
    } catch (err) {
      errors.push(`Error ${u}: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  // PHASE 2 – web search for opportunity-grade articles (Firecrawl returns full markdown)
  try {
    const hits = await firecrawlCategorySearch(firecrawlApiKey, label, 6);
    console.log(`[category:${categoryKey}] search returned ${hits.length} hits`);
    for (const h of hits.slice(0, 12)) {
      const md = (h as any).markdown || (h as any).content || '';
      if (md && md.length > 300) {
        combinedContent += `\n\n### Article: ${h.title ?? h.url}\nURL: ${h.url}\n\n${md.slice(0, 9000)}`;
        scrapedUrls.push(h.url);
      } else {
        articleHits.push({ url: h.url, title: h.title });
      }
    }
  } catch (e) {
    errors.push(`Search phase failed: ${e instanceof Error ? e.message : 'unknown'}`);
  }

  // PHASE 3 – deep scrape any remaining article candidates that lack markdown
  const dedupeArticles = Array.from(new Map(articleHits.map((a) => [a.url, a])).values()).slice(0, 10);
  for (const art of dedupeArticles) {
    try {
      const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
        method: 'POST',
        headers: { Authorization: `Bearer ${firecrawlApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: art.url,
          formats: ['markdown'],
          onlyMainContent: true,
          waitFor: 2500,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const md = (data.data ?? data)?.markdown || '';
        if (md && md.length > 400) {
          combinedContent += `\n\n### Deep article: ${art.title ?? art.url}\nURL: ${art.url}\n\n${md.slice(0, 10000)}`;
          scrapedUrls.push(art.url);
        }
      }
    } catch (e) {
      // Non-fatal
    }
  }

  if (!combinedContent) {
    return new Response(
      JSON.stringify({ success: false, error: 'No content extracted', errors, category: categoryKey }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`[category:${categoryKey}] total chars: ${combinedContent.length} from ${scrapedUrls.length} sources`);

  return new Response(
    JSON.stringify({
      success: true,
      categoryKey,
      categoryLabel: label,
      platform: label, // compat with existing UI render path
      content: combinedContent,
      scrapedUrls: Array.from(new Set(scrapedUrls)),
      totalUrls: urls.length,
      errors: errors.length > 0 ? errors : undefined,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scrapeAllPlatformUrls(platformName: string) {
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
  
  if (!firecrawlApiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const platformKey = platformName.toLowerCase().replace(/[^a-z]/g, '');
  const urls = PLATFORM_RESEARCH_URLS[platformKey] || PLATFORM_RESEARCH_URLS[platformName];
  
  if (!urls || urls.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: `No research URLs configured for ${platformName}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Scraping ${urls.length} URLs for ${platformName}...`);
  
  let combinedContent = '';
  const scrapedUrls: string[] = [];
  const errors: string[] = [];

  for (const url of urls) {
    try {
      console.log(`Scraping: ${url}`);
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown'],
          onlyMainContent: true,
          waitFor: 3000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const markdown = data.data?.markdown || data.markdown || '';
        if (markdown && markdown.length > 100) {
          combinedContent += `\n\n### Source: ${url}\n\n${markdown.slice(0, 15000)}`;
          scrapedUrls.push(url);
        }
      } else {
        errors.push(`Failed to scrape ${url}: ${response.status}`);
      }
    } catch (error) {
      errors.push(`Error scraping ${url}: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  if (!combinedContent) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'No content extracted from any URL',
        errors,
        platform: platformName 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Successfully scraped ${scrapedUrls.length}/${urls.length} URLs for ${platformName}`);

  return new Response(
    JSON.stringify({
      success: true,
      platform: platformName,
      content: combinedContent,
      scrapedUrls,
      totalUrls: urls.length,
      errors: errors.length > 0 ? errors : undefined
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scrapePlatform(url: string, platformName: string) {
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
  
  if (!firecrawlApiKey) {
    console.error('FIRECRAWL_API_KEY not configured');
    return new Response(
      JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Scraping ${platformName}: ${url}`);

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Firecrawl API error for ${platformName}:`, data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error || `Failed to scrape ${platformName}`,
          platform: platformName 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully scraped ${platformName}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        platform: platformName,
        content: data.data?.markdown || data.markdown || 'No content extracted',
        metadata: data.data?.metadata || data.metadata || {},
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`Error scraping ${platformName}:`, error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape',
        platform: platformName 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function generateAIReport(scrapedData: any[], customPrompt?: string) {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'AI service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Combine all scraped content
  const combinedContent = scrapedData
    .map(d => `### ${d.platform}\n${d.content?.slice(0, 8000) || 'No content'}`)
    .join('\n\n---\n\n');

  const systemPrompt = `You are an elite financial research analyst working for a top-tier investment firm. Your role is to synthesize information from multiple financial data sources and provide actionable intelligence.

Your analysis must be:
- Data-driven and objective
- Focused on actionable insights
- Clear about risks and opportunities
- Professional and concise
- Include specific stock tickers when mentioned

You will receive scraped content from various financial platforms. Analyze this data and provide a comprehensive report.`;

  const userPrompt = `Analyze the following scraped financial research data and provide a comprehensive report.

${customPrompt ? `SPECIAL INSTRUCTIONS: ${customPrompt}\n\n` : ''}

SCRAPED DATA:
${combinedContent.slice(0, 80000)}

Provide your analysis in the following JSON format:
{
  "summary": "A 2-3 paragraph executive summary of the key findings, including market direction and notable movements",
  "keyInsights": ["insight1", "insight2", "insight3", "insight4", "insight5"],
  "marketSentiment": "Bullish/Bearish/Neutral with brief explanation and key drivers",
  "topStories": ["story1 with relevant tickers", "story2", "story3", "story4", "story5"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
  "opportunityCandidates": [
    {
      "title": "Concise opportunity name (e.g. 'Acme Corp Series B', 'Brent Crude long', 'XYZ Distressed Bond')",
      "category": "One of: Stocks & Equities | Crypto & Digital Assets | Real Estate | Fixed Income & Bonds | Commodities | Foreign Exchange | Funds & ETFs | Alternative Investments | ESG & Impact Investing | Private Equity | Venture Capital | Infrastructure | SME Acquisitions | Distressed Assets | Debt & Lending",
      "asset": "Ticker, fund name, property, or instrument identifier if available",
      "thesis": "1-2 sentence investment thesis",
      "key_data": "Headline number(s): price, yield, deal size, valuation, raise amount, etc.",
      "confidence": "high | medium | low",
      "source_url": "The most relevant source URL from the scraped data"
    }
  ]
}

Extract 3-8 opportunityCandidates where the source material genuinely surfaces an investable idea, deal, or actionable signal. If no genuine opportunities are present, return an empty array. Respond ONLY with valid JSON, no markdown formatting.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate AI report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ success: false, error: 'No content in AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let parsedReport;
    try {
      // Clean the response if it has markdown formatting
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      parsedReport = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      parsedReport = {
        summary: content,
        keyInsights: ['Analysis completed - see summary for details'],
        marketSentiment: 'See summary for analysis',
        topStories: ['Multiple stories analyzed - see summary'],
        recommendations: ['Review the full summary for detailed recommendations'],
        opportunityCandidates: [],
      };
    }

    console.log('AI report generated successfully');
    
    return new Response(
      JSON.stringify({
        success: true,
        ...parsedReport,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating AI report:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'AI generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
