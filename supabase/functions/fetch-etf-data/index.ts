import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Popular ETFs to track
const DEFAULT_ETFS = [
  'SPY',   // S&P 500
  'QQQ',   // Nasdaq 100
  'IVV',   // iShares S&P 500
  'VTI',   // Vanguard Total Stock
  'VOO',   // Vanguard S&P 500
  'VEA',   // Vanguard FTSE Developed
  'VWO',   // Vanguard FTSE Emerging
  'AGG',   // iShares Core US Aggregate Bond
  'BND',   // Vanguard Total Bond
  'GLD',   // SPDR Gold
  'VNQ',   // Vanguard Real Estate
  'ARKK',  // ARK Innovation
  'XLK',   // Technology Select Sector
  'XLF',   // Financial Select Sector
  'XLE',   // Energy Select Sector
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols = DEFAULT_ETFS } = await req.json();
    const ALPHA_VANTAGE_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');

    if (!ALPHA_VANTAGE_KEY) {
      throw new Error('ALPHA_VANTAGE_API_KEY not configured');
    }

    const etfData = await Promise.all(
      symbols.slice(0, 15).map(async (symbol: string, index: number) => {
        await new Promise(resolve => setTimeout(resolve, index * 250));
        
        try {
          // Get quote data
          const quoteResponse = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
          );
          const quoteData = await quoteResponse.json();

          // Get ETF profile (using overview endpoint)
          const overviewResponse = await fetch(
            `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
          );
          const overviewData = await overviewResponse.json();

          const quote = quoteData['Global Quote'] || {};

          return {
            symbol,
            name: overviewData.Name || `${symbol} ETF`,
            description: overviewData.Description || null,
            assetType: overviewData.AssetType || 'ETF',
            exchange: overviewData.Exchange || null,
            sector: overviewData.Sector || null,
            currentPrice: parseFloat(quote['05. price'] || '0'),
            previousClose: parseFloat(quote['08. previous close'] || '0'),
            open: parseFloat(quote['02. open'] || '0'),
            high: parseFloat(quote['03. high'] || '0'),
            low: parseFloat(quote['04. low'] || '0'),
            volume: parseInt(quote['06. volume'] || '0'),
            change: parseFloat(quote['09. change'] || '0'),
            changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
            fiftyTwoWeekHigh: parseFloat(overviewData['52WeekHigh'] || '0'),
            fiftyTwoWeekLow: parseFloat(overviewData['52WeekLow'] || '0'),
            fiftyDayMA: parseFloat(overviewData['50DayMovingAverage'] || '0'),
            twoHundredDayMA: parseFloat(overviewData['200DayMovingAverage'] || '0'),
            beta: parseFloat(overviewData.Beta || '1'),
            dividendYield: parseFloat(overviewData.DividendYield || '0') * 100,
            lastUpdated: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Error fetching ETF data for ${symbol}:`, error);
          return {
            symbol,
            name: `${symbol} ETF`,
            currentPrice: 0,
            error: error.message,
          };
        }
      })
    );

    return new Response(
      JSON.stringify({ etfs: etfData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-etf-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
