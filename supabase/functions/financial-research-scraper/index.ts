import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, platformName, action, scrapedData, customPrompt } = await req.json();

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
    .map(d => `### ${d.platform}\n${d.content?.slice(0, 3000) || 'No content'}`)
    .join('\n\n---\n\n');

  const systemPrompt = `You are an elite financial research analyst working for a top-tier investment firm. Your role is to synthesize information from multiple financial data sources and provide actionable intelligence.

Your analysis must be:
- Data-driven and objective
- Focused on actionable insights
- Clear about risks and opportunities
- Professional and concise

You will receive scraped content from various financial platforms. Analyze this data and provide a comprehensive report.`;

  const userPrompt = `Analyze the following scraped financial research data and provide a comprehensive report.

${customPrompt ? `SPECIAL INSTRUCTIONS: ${customPrompt}\n\n` : ''}

SCRAPED DATA:
${combinedContent}

Provide your analysis in the following JSON format:
{
  "summary": "A 2-3 paragraph executive summary of the key findings",
  "keyInsights": ["insight1", "insight2", "insight3", "insight4", "insight5"],
  "marketSentiment": "Bullish/Bearish/Neutral with brief explanation",
  "topStories": ["story1", "story2", "story3", "story4", "story5"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

Respond ONLY with valid JSON, no markdown formatting.`;

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
      // Fallback to a structured response
      parsedReport = {
        summary: content,
        keyInsights: ['Analysis completed - see summary for details'],
        marketSentiment: 'See summary for analysis',
        topStories: ['Multiple stories analyzed - see summary'],
        recommendations: ['Review the full summary for detailed recommendations'],
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
