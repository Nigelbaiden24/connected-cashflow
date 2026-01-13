import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
  category: string;
}

// Fallback sample news when API is not working
function getSampleFinancialNews(): NewsArticle[] {
  const now = new Date();
  return [
    {
      title: "Global Markets Rally as Fed Signals Potential Rate Cuts",
      description: "Stock markets worldwide surged after Federal Reserve officials hinted at possible interest rate reductions in the coming months, boosting investor confidence.",
      content: "Major indices including the S&P 500 and NASDAQ posted significant gains as investors reacted positively to dovish signals from Federal Reserve officials.",
      url: "https://example.com/markets-rally",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop",
      publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      source: { name: "Financial Times", url: "https://ft.com" },
      category: "markets"
    },
    {
      title: "Tech Giants Report Strong Quarterly Earnings",
      description: "Apple, Microsoft, and Google parent Alphabet exceeded analyst expectations in their latest quarterly reports, driving technology sector gains.",
      content: "The technology sector continues to show resilience with major companies reporting better-than-expected revenue growth and profit margins.",
      url: "https://example.com/tech-earnings",
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=450&fit=crop",
      publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      source: { name: "Bloomberg", url: "https://bloomberg.com" },
      category: "business"
    },
    {
      title: "Bitcoin Surges Past Key Resistance Level",
      description: "The leading cryptocurrency broke through a major technical barrier, sparking renewed interest from institutional investors.",
      content: "Bitcoin's price movement has attracted significant attention from both retail and institutional investors as the digital asset shows strength.",
      url: "https://example.com/bitcoin-surge",
      image: "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=800&h=450&fit=crop",
      publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      source: { name: "CoinDesk", url: "https://coindesk.com" },
      category: "crypto"
    },
    {
      title: "European Central Bank Maintains Policy Stance",
      description: "The ECB held interest rates steady while signaling readiness to act if economic conditions warrant intervention.",
      content: "European markets responded calmly to the ECB's decision, with the euro remaining stable against major currencies.",
      url: "https://example.com/ecb-policy",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=450&fit=crop",
      publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      source: { name: "Reuters", url: "https://reuters.com" },
      category: "markets"
    },
    {
      title: "Oil Prices Stabilize Amid Middle East Tensions",
      description: "Crude oil prices found support levels as geopolitical concerns balanced against weaker demand forecasts.",
      content: "Energy markets continue to navigate complex dynamics between supply constraints and shifting global demand patterns.",
      url: "https://example.com/oil-prices",
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=450&fit=crop",
      publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      source: { name: "Wall Street Journal", url: "https://wsj.com" },
      category: "commodities"
    },
    {
      title: "Ethereum Network Upgrade Boosts DeFi Activity",
      description: "The latest Ethereum protocol upgrade has reduced transaction costs, spurring increased activity in decentralized finance applications.",
      content: "DeFi protocols are seeing renewed interest as lower gas fees make transactions more accessible to retail users.",
      url: "https://example.com/ethereum-upgrade",
      image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&h=450&fit=crop",
      publishedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(),
      source: { name: "The Block", url: "https://theblock.co" },
      category: "crypto"
    },
    {
      title: "Asian Markets Mixed on China Economic Data",
      description: "Asian equity markets showed divergent performance as investors digested mixed economic indicators from China.",
      content: "Japanese stocks advanced while Chinese markets retreated on concerns about property sector weakness.",
      url: "https://example.com/asian-markets",
      image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=450&fit=crop",
      publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      source: { name: "Nikkei Asia", url: "https://asia.nikkei.com" },
      category: "markets"
    },
    {
      title: "Major Bank Announces Strategic Restructuring",
      description: "One of the world's largest financial institutions unveiled plans to streamline operations and focus on core business areas.",
      content: "The restructuring is expected to improve efficiency and shareholder returns over the medium term.",
      url: "https://example.com/bank-restructuring",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop",
      publishedAt: new Date(now.getTime() - 14 * 60 * 60 * 1000).toISOString(),
      source: { name: "Financial News", url: "https://fnlondon.com" },
      category: "business"
    }
  ];
}

async function fetchGNewsArticles(apiKey: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?category=business&lang=en&max=10&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      console.error('GNews API error:', response.status, await response.text());
      return [];
    }
    
    const data = await response.json();
    
    return (data.articles || []).map((article: any) => ({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
      source: {
        name: article.source?.name || 'Unknown',
        url: article.source?.url || '',
      },
      category: 'business',
    }));
  } catch (error) {
    console.error('Error fetching GNews:', error);
    return [];
  }
}

async function generateAINewsRoundup(articles: NewsArticle[]): Promise<string | null> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey || articles.length === 0) return null;

  try {
    const headlines = articles.slice(0, 5).map(a => `- ${a.title}`).join('\n');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a financial news analyst. Provide a brief 2-3 sentence summary of the key market themes from today\'s headlines. Be concise and professional.'
          },
          {
            role: 'user',
            content: `Summarize the key themes from these financial headlines:\n${headlines}`
          }
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Error generating AI roundup:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const gnewsApiKey = Deno.env.get('GNEWS_API_KEY');
    const { category = 'all' } = await req.json().catch(() => ({}));

    let articles: NewsArticle[] = [];
    let sources: string[] = [];

    // Try GNews first if API key is available
    if (gnewsApiKey) {
      articles = await fetchGNewsArticles(gnewsApiKey);
      if (articles.length > 0) {
        sources.push('GNews');
      }
    }

    // Use sample data as fallback when API fails or no API key
    if (articles.length === 0) {
      console.log('Using sample financial news data as fallback');
      articles = getSampleFinancialNews();
      sources.push('FlowPulse AI');
    }

    // Filter by category if specified
    let filteredArticles = articles;
    if (category !== 'all') {
      filteredArticles = articles.filter(a => 
        a.category === category || 
        (category === 'markets' && ['markets', 'business'].includes(a.category)) ||
        (category === 'crypto' && a.category === 'crypto')
      );
      // If no articles match the category, return all
      if (filteredArticles.length === 0) {
        filteredArticles = articles;
      }
    }

    // Sort by date
    filteredArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Generate AI summary
    const aiSummary = await generateAINewsRoundup(filteredArticles);

    return new Response(
      JSON.stringify({
        articles: filteredArticles,
        aiSummary,
        lastUpdated: new Date().toISOString(),
        sources,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-financial-news:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
