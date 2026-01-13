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
    
    if (!gnewsApiKey) {
      return new Response(
        JSON.stringify({ error: 'GNews API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { category = 'business' } = await req.json().catch(() => ({}));

    // Fetch news from GNews
    const gnewsArticles = await fetchGNewsArticles(gnewsApiKey);
    
    // Generate AI summary
    const aiSummary = await generateAINewsRoundup(gnewsArticles);

    // Combine and sort by date
    const allArticles = gnewsArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return new Response(
      JSON.stringify({
        articles: allArticles,
        aiSummary,
        lastUpdated: new Date().toISOString(),
        sources: ['GNews'],
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
