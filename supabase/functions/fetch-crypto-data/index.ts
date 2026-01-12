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
    const { page = 1, perPage = 100 } = await req.json().catch(() => ({}));

    // CoinGecko API - fetch top cryptocurrencies by market cap (up to 250 per page)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${Math.min(perPage, 250)}&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d,30d,1y`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    const cryptoData = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      volume24h: coin.total_volume,
      priceChange1h: coin.price_change_percentage_1h_in_currency,
      priceChange24h: coin.price_change_percentage_24h_in_currency,
      priceChange7d: coin.price_change_percentage_7d_in_currency,
      priceChange30d: coin.price_change_percentage_30d_in_currency,
      priceChange1y: coin.price_change_percentage_1y_in_currency,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      ath: coin.ath,
      athDate: coin.ath_date,
      athChangePercentage: coin.ath_change_percentage,
      atl: coin.atl,
      atlDate: coin.atl_date,
      atlChangePercentage: coin.atl_change_percentage,
      circulatingSupply: coin.circulating_supply,
      totalSupply: coin.total_supply,
      maxSupply: coin.max_supply,
      sparkline7d: coin.sparkline_in_7_days?.price || [],
      lastUpdated: coin.last_updated,
    }));

    // CoinGecko has ~15000+ coins, but we'll limit to first 1000 for practical purposes
    const estimatedTotal = Math.min(1000, page * perPage + (data.length === perPage ? 100 : 0));

    return new Response(
      JSON.stringify({ crypto: cryptoData, total: estimatedTotal, page, perPage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-crypto-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
