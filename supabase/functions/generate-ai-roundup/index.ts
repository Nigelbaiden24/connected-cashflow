import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not set');
    }

    const systemPrompt = `You are a financial AI analyst creating a weekly market roundup for sophisticated investors. Focus on:
- Key market movements (stocks, bonds, commodities, crypto)
- Central bank decisions and monetary policy updates
- Sector rotations and emerging trends
- Geopolitical events impacting markets
- Earnings highlights and economic data releases
- Technical analysis and momentum indicators
- Risk factors and opportunities for the week ahead

Format the roundup in clear sections with actionable insights. Use professional financial language but keep it engaging.`;

    const userPrompt = "Generate a comprehensive weekly market roundup for this week, covering all major financial markets, key datapoints, and what investors should watch.";

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 402) {
        throw new Error('Credits depleted. Please contact support.');
      }
      
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || 'Unable to generate roundup at this time.';

    return new Response(
      JSON.stringify({ content }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating AI roundup:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate AI roundup',
        content: 'Unable to generate AI roundup at this time. Please try again later.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});