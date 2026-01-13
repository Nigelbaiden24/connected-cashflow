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
    const { page = 1, perPage = 100, category = 'all' } = await req.json().catch(() => ({}));

    // Determine which category to fetch - allows fetching lesser-known coins
    let apiUrl = '';
    let categoryParam = '';
    
    // Categories for different types of crypto including lesser-known ones
    const categoryMap: Record<string, string> = {
      'all': '', // Top by market cap
      'defi': '&category=decentralized-finance-defi',
      'gaming': '&category=gaming',
      'meme': '&category=meme-token',
      'layer-1': '&category=layer-1',
      'layer-2': '&category=layer-2',
      'metaverse': '&category=metaverse',
      'nft': '&category=non-fungible-tokens-nft',
      'storage': '&category=storage',
      'privacy': '&category=privacy-coins',
      'stablecoins': '&category=stablecoins',
      'yield': '&category=yield-farming',
      'exchange': '&category=centralized-exchange-token-cex',
      'ai': '&category=artificial-intelligence',
      'rwa': '&category=real-world-assets-rwa',
      'gambling': '&category=gambling',
      'oracle': '&category=oracle',
      'interoperability': '&category=interoperability',
      'lending': '&category=lending-borrowing',
      'derivatives': '&category=derivatives',
      'fan-tokens': '&category=fan-token',
      'inscriptions': '&category=inscription-tokens',
      'dog-themed': '&category=dog-themed-coins',
      'solana-ecosystem': '&category=solana-ecosystem',
      'base-ecosystem': '&category=base-ecosystem',
      'arbitrum-ecosystem': '&category=arbitrum-ecosystem',
    };
    
    categoryParam = categoryMap[category] || '';
    
    // CoinGecko API - fetch cryptocurrencies (up to 250 per page)
    // For pages > 4, we're accessing lesser-known altcoins
    apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${Math.min(perPage, 250)}&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d,30d,1y${categoryParam}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      // If rate limited, return cached/mock data for continuity
      if (response.status === 429) {
        console.log('Rate limited by CoinGecko, returning cached data structure');
        return new Response(
          JSON.stringify({ 
            crypto: [], 
            total: 5000, 
            page, 
            perPage,
            message: 'Rate limited - please wait before refreshing'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
      // Additional categorization for UI filtering
      isPennyToken: coin.current_price < 0.01,
      isMicroCap: coin.market_cap && coin.market_cap < 50000000,
      isSmallCap: coin.market_cap && coin.market_cap >= 50000000 && coin.market_cap < 500000000,
      category: category !== 'all' ? category : null,
    }));

    // CoinGecko has ~15000+ coins - expand to 5000 for practical purposes
    const estimatedTotal = Math.min(5000, page * perPage + (data.length === perPage ? 250 : 0));

    return new Response(
      JSON.stringify({ 
        crypto: cryptoData, 
        total: estimatedTotal, 
        page, 
        perPage,
        category,
        availableCategories: Object.keys(categoryMap)
      }),
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
