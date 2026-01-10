import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use Financial Modeling Prep API (free tier available) or Alpha Vantage
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'META', 'AMZN', 'JPM', 'V', 'JNJ'] } = await req.json();
    const ALPHA_VANTAGE_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');

    if (!ALPHA_VANTAGE_KEY) {
      throw new Error('ALPHA_VANTAGE_API_KEY not configured');
    }

    // Batch fetch for efficiency - Alpha Vantage has rate limits, so we'll process in parallel with some delay
    const stockData = await Promise.all(
      symbols.slice(0, 10).map(async (symbol: string, index: number) => {
        // Stagger requests slightly to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, index * 200));
        
        try {
          // Get quote data
          const quoteResponse = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
          );
          const quoteData = await quoteResponse.json();
          
          // Get overview data for additional info
          const overviewResponse = await fetch(
            `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
          );
          const overviewData = await overviewResponse.json();

          const quote = quoteData['Global Quote'] || {};
          
          return {
            symbol,
            name: overviewData.Name || symbol,
            description: overviewData.Description || null,
            exchange: overviewData.Exchange || null,
            sector: overviewData.Sector || null,
            industry: overviewData.Industry || null,
            currentPrice: parseFloat(quote['05. price'] || '0'),
            previousClose: parseFloat(quote['08. previous close'] || '0'),
            open: parseFloat(quote['02. open'] || '0'),
            high: parseFloat(quote['03. high'] || '0'),
            low: parseFloat(quote['04. low'] || '0'),
            volume: parseInt(quote['06. volume'] || '0'),
            change: parseFloat(quote['09. change'] || '0'),
            changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
            marketCap: overviewData.MarketCapitalization ? parseInt(overviewData.MarketCapitalization) : null,
            peRatio: parseFloat(overviewData.PERatio || '0'),
            pegRatio: parseFloat(overviewData.PEGRatio || '0'),
            beta: parseFloat(overviewData.Beta || '1'),
            eps: parseFloat(overviewData.EPS || '0'),
            dividendYield: parseFloat(overviewData.DividendYield || '0') * 100,
            dividendPerShare: parseFloat(overviewData.DividendPerShare || '0'),
            profitMargin: parseFloat(overviewData.ProfitMargin || '0') * 100,
            fiftyTwoWeekHigh: parseFloat(overviewData['52WeekHigh'] || '0'),
            fiftyTwoWeekLow: parseFloat(overviewData['52WeekLow'] || '0'),
            fiftyDayMA: parseFloat(overviewData['50DayMovingAverage'] || '0'),
            twoHundredDayMA: parseFloat(overviewData['200DayMovingAverage'] || '0'),
            analystTargetPrice: parseFloat(overviewData.AnalystTargetPrice || '0'),
            forwardPE: parseFloat(overviewData.ForwardPE || '0'),
            priceToBook: parseFloat(overviewData.PriceToBookRatio || '0'),
            priceToSales: parseFloat(overviewData.PriceToSalesRatioTTM || '0'),
            bookValue: parseFloat(overviewData.BookValue || '0'),
            revenuePerShare: parseFloat(overviewData.RevenuePerShareTTM || '0'),
            returnOnEquity: parseFloat(overviewData.ReturnOnEquityTTM || '0') * 100,
            returnOnAssets: parseFloat(overviewData.ReturnOnAssetsTTM || '0') * 100,
            lastUpdated: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return {
            symbol,
            name: symbol,
            currentPrice: 0,
            error: error.message,
          };
        }
      })
    );

    return new Response(
      JSON.stringify({ stocks: stockData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-stock-quotes:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
