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
    const { symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'JNJ', 'NVDA', 'META', 'AMZN'] } = await req.json();
    const ALPHA_VANTAGE_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');

    if (!ALPHA_VANTAGE_KEY) {
      throw new Error('ALPHA_VANTAGE_API_KEY not configured');
    }

    const investments = await Promise.all(
      symbols.map(async (symbol: string) => {
        try {
          // Fetch quote data
          const quoteResponse = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
          );
          const quoteData = await quoteResponse.json();
          
          // Fetch overview data
          const overviewResponse = await fetch(
            `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
          );
          const overviewData = await overviewResponse.json();

          const quote = quoteData['Global Quote'] || {};
          
          const price = parseFloat(quote['05. price'] || '0');
          const change = parseFloat(quote['09. change'] || '0');
          const changePercent = parseFloat(quote['10. change percent']?.replace('%', '') || '0');
          
          return {
            symbol,
            name: overviewData.Name || symbol,
            price,
            change,
            changePercent,
            marketCap: overviewData.MarketCapitalization || 'N/A',
            pe: parseFloat(overviewData.PERatio || '0'),
            dividend: parseFloat(overviewData.DividendYield || '0') * 100,
            beta: parseFloat(overviewData.Beta || '1'),
            rating: change >= 0 ? (changePercent > 2 ? 'Buy' : 'Hold') : 'Sell',
            risk: overviewData.Beta > 1.5 ? 'High' : overviewData.Beta > 1 ? 'Medium' : 'Low',
            sector: overviewData.Sector || 'Unknown',
            high52Week: parseFloat(quote['03. high'] || '0'),
            low52Week: parseFloat(quote['04. low'] || '0'),
            volume: parseInt(quote['06. volume'] || '0'),
          };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          // Return placeholder data if API fails
          return {
            symbol,
            name: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
            marketCap: 'N/A',
            pe: 0,
            dividend: 0,
            beta: 1,
            rating: 'Hold',
            risk: 'Medium',
            sector: 'Unknown',
            high52Week: 0,
            low52Week: 0,
            volume: 0,
          };
        }
      })
    );

    return new Response(
      JSON.stringify({ investments }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-market-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
