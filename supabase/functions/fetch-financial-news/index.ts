import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
  category: string;
}

// Financial news sources to scrape
const NEWS_SOURCES = [
  { url: 'https://www.reuters.com/business/', name: 'Reuters', category: 'business' },
  { url: 'https://www.cnbc.com/world/?region=world', name: 'CNBC', category: 'markets' },
  { url: 'https://www.bloomberg.com/markets', name: 'Bloomberg', category: 'markets' },
  { url: 'https://www.ft.com/markets', name: 'Financial Times', category: 'markets' },
  { url: 'https://www.coindesk.com/', name: 'CoinDesk', category: 'crypto' },
];

async function scrapeNewsWithFirecrawl(apiKey: string): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  
  const scrapePromises = NEWS_SOURCES.slice(0, 3).map(async (source) => {
    try {
      console.log(`Scraping ${source.name}...`);
      
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: source.url,
          formats: ['markdown', 'links'],
          onlyMainContent: true,
        }),
      });

      if (!response.ok) {
        console.error(`Failed to scrape ${source.name}:`, response.status);
        return [];
      }

      const data = await response.json();
      const markdown = data.data?.markdown || data.markdown || '';
      const links = data.data?.links || data.links || [];
      
      const headlines = extractHeadlines(markdown, links, source);
      return headlines;
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      return [];
    }
  });

  const results = await Promise.all(scrapePromises);
  results.forEach(sourceArticles => articles.push(...sourceArticles));
  
  return articles;
}

function extractHeadlines(markdown: string, links: string[], source: { name: string; url: string; category: string }): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const now = new Date();
  
  const lines = markdown.split('\n');
  const headlinePatterns = [
    /^#+\s*(.{20,150})$/,
    /^\*\*(.{20,150})\*\*$/,
    /^\[(.{20,150})\]\(([^)]+)\)/,
  ];

  let articleIndex = 0;
  for (const line of lines) {
    if (articleIndex >= 15) break;
    
    for (const pattern of headlinePatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const title = match[1].trim()
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '');
        
        if (title.length > 25 && 
            !title.toLowerCase().includes('menu') && 
            !title.toLowerCase().includes('subscribe') &&
            !title.toLowerCase().includes('sign in') &&
            !title.toLowerCase().includes('newsletter')) {
          
          const relatedLink = links.find(l => 
            l.includes(source.url.split('/')[2]) && 
            !l.includes('login') && 
            !l.includes('subscribe')
          ) || source.url;

          articles.push({
            title,
            description: title.substring(0, 120) + '...',
            url: relatedLink,
            image: getStockImage(source.category, articleIndex),
            publishedAt: new Date(now.getTime() - articleIndex * 45 * 60 * 1000).toISOString(),
            source: { name: source.name, url: source.url },
            category: source.category,
          });
          articleIndex++;
          break;
        }
      }
    }
  }
  
  return articles;
}

function getStockImage(category: string, index: number): string {
  const marketImages = [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1560221328-12fe60f83ab8?w=800&h=450&fit=crop',
  ];
  
  const cryptoImages = [
    'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=450&fit=crop',
  ];
  
  const businessImages = [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=800&h=450&fit=crop',
  ];

  if (category === 'crypto') {
    return cryptoImages[index % cryptoImages.length];
  } else if (category === 'markets') {
    return marketImages[index % marketImages.length];
  }
  return businessImages[index % businessImages.length];
}

async function generateAINews(count: number): Promise<NewsArticle[]> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return [];

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are a financial news aggregator. Generate exactly ${count} realistic, timely financial news items.\nReturn ONLY a JSON array with this exact schema:\n[{"title":"...","description":"...","category":"markets|crypto|business","source":"Reuters|Bloomberg|CNBC|FT|WSJ|MarketWatch|CoinDesk"}]\nConstraints: title <= 110 chars, description <= 160 chars. Keep them unique and relevant.`,
          },
          {
            role: "user",
            content: `Generate exactly ${count} unique items. Return JSON only.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("AI news generation failed:", response.status, errorText);
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON array found in AI response:", content.slice(0, 400));
      return [];
    }

    const newsItems = JSON.parse(jsonMatch[0]);
    const now = new Date();

    console.log(`Generated ${Array.isArray(newsItems) ? newsItems.length : 0} AI news articles`);

    if (!Array.isArray(newsItems)) return [];

    return newsItems.map((item: any, index: number) => ({
      title: String(item.title ?? "").trim(),
      description: String(item.description ?? "").trim(),
      url: `https://www.${String(item.source ?? "news")
        .toLowerCase()
        .replace(/\s/g, "")
        .replace(/[^a-z]/g, "")}.com`,
      image: getStockImage(item.category || "business", index),
      publishedAt: new Date(now.getTime() - index * 20 * 60 * 1000).toISOString(),
      source: {
        name: item.source || "Financial News",
        url: `https://www.${String(item.source ?? "news").toLowerCase().replace(/\s/g, "")}.com`,
      },
      category: item.category || "business",
    }));
  } catch (error) {
    console.error("Error generating AI news:", error);
    return [];
  }
}

async function generateAINewsRoundup(articles: NewsArticle[]): Promise<string | null> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey || articles.length === 0) return null;

  try {
    const headlines = articles.slice(0, 8).map((a) => `- ${a.title}`).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are a financial news analyst. Provide a brief 3-4 sentence summary of the key market themes. Be concise and professional.",
          },
          {
            role: "user",
            content: `Summarize the key themes from these financial headlines:\n${headlines}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("AI roundup failed:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Error generating AI roundup:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const { category = 'all', limit = 90 } = await req.json().catch(() => ({}));

    let articles: NewsArticle[] = [];
    let sources: string[] = [];

    // Try Firecrawl scraping first
    if (firecrawlApiKey) {
      console.log('Attempting to scrape live news with Firecrawl...');
      articles = await scrapeNewsWithFirecrawl(firecrawlApiKey);
      if (articles.length > 0) {
        sources.push('Live Web Scraping');
      }
    }

    // Generate enough AI news to fill 10 pages (90 articles total)
    const targetCount = 90;
    const neededAINews = Math.max(0, targetCount - articles.length);
    
    if (neededAINews > 0) {
      console.log(`Generating ${neededAINews} AI news articles in batches...`);
      
      // Generate in smaller batches for reliability
      const batchSize = 15;
      const batches = Math.ceil(neededAINews / batchSize);
      
      for (let i = 0; i < batches; i++) {
        const batchCount = Math.min(batchSize, neededAINews - i * batchSize);
        console.log(`Batch ${i + 1}/${batches}: generating ${batchCount} articles...`);

        // Retry until we actually get the requested count (LLMs sometimes return fewer)
        const aiNews: NewsArticle[] = [];
        let attempts = 0;
        while (aiNews.length < batchCount && attempts < 3) {
          const remaining = batchCount - aiNews.length;
          const chunk = await generateAINews(remaining);
          aiNews.push(...chunk);
          attempts++;
        }

        // Offset timestamps for each batch
        aiNews.forEach((article, idx) => {
          const now = new Date();
          article.publishedAt = new Date(now.getTime() - (articles.length + idx) * 20 * 60 * 1000).toISOString();
        });

        articles.push(...aiNews);
        console.log(`Total articles so far: ${articles.length}`);
      }
      
      if (!sources.includes('FlowPulse AI')) {
        sources.push('FlowPulse AI');
      }
    }
    
    console.log(`Final article count: ${articles.length}`);

    // Filter by category if specified
    let filteredArticles = articles;
    if (category !== 'all') {
      filteredArticles = articles.filter(a => 
        a.category === category || 
        (category === 'markets' && ['markets', 'business'].includes(a.category)) ||
        (category === 'crypto' && a.category === 'crypto')
      );
      if (filteredArticles.length < 10) {
        filteredArticles = articles;
      }
    }

    // Remove duplicates by title (use full normalized title to avoid false-collisions)
    const seenTitles = new Set<string>();
    filteredArticles = filteredArticles.filter((a) => {
      const key = a.title
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[\u2018\u2019]/g, "'")
        .trim();
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    });

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
        totalCount: filteredArticles.length,
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
