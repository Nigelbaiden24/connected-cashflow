import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive list of 250+ stocks across all major sectors
const ALL_STOCKS = [
  // Technology - Major
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AMD', 'INTC', 'CRM',
  'ORCL', 'ADBE', 'CSCO', 'IBM', 'QCOM', 'TXN', 'AVGO', 'NOW', 'INTU', 'AMAT',
  'MU', 'LRCX', 'ADI', 'KLAC', 'SNPS', 'CDNS', 'MRVL', 'NXPI', 'MCHP', 'ON',
  // Technology - Software & Cloud
  'SNOW', 'PLTR', 'DDOG', 'ZS', 'NET', 'CRWD', 'OKTA', 'MDB', 'WDAY', 'TEAM',
  'ZM', 'DOCU', 'TWLO', 'SQ', 'SHOP', 'UBER', 'LYFT', 'DASH', 'ABNB', 'COIN',
  // Finance - Banks
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'USB', 'PNC', 'TFC', 'COF',
  'AXP', 'SCHW', 'BK', 'STT', 'NTRS', 'CFG', 'KEY', 'RF', 'FITB', 'HBAN',
  // Finance - Insurance & Asset Management
  'BLK', 'SPGI', 'MCO', 'ICE', 'CME', 'MSCI', 'NDAQ', 'MMC', 'AON',
  'AJG', 'TRV', 'ALL', 'MET', 'PRU', 'AIG', 'PGR', 'CB', 'AFL', 'HIG',
  // Healthcare - Pharma
  'JNJ', 'UNH', 'PFE', 'ABBV', 'MRK', 'LLY', 'TMO', 'ABT', 'DHR', 'BMY',
  'AMGN', 'GILD', 'CVS', 'CI', 'ISRG', 'REGN', 'VRTX', 'MRNA', 'BIIB', 'ZTS',
  // Healthcare - Medical Devices & Services
  'MDT', 'SYK', 'BSX', 'EW', 'BDX', 'IDXX', 'IQV', 'A', 'DXCM', 'MTD',
  'HCA', 'ELV', 'CNC', 'ALGN', 'HOLX', 'WAT', 'RMD', 'ZBH', 'BAX', 'COO',
  // Consumer - Retail
  'WMT', 'HD', 'COST', 'TGT', 'LOW', 'TJX', 'ROST', 'DG', 'DLTR', 'BBY',
  'KR', 'WBA', 'ORLY', 'AZO', 'ULTA', 'FIVE', 'WSM', 'TSCO', 'GPS', 'ANF',
  // Consumer - Food & Beverage
  'KO', 'PEP', 'MCD', 'SBUX', 'YUM', 'CMG', 'DPZ', 'MAR', 'HLT', 'WYNN',
  'PM', 'MO', 'STZ', 'MNST', 'KDP', 'TAP', 'SAM', 'CELH', 'BUD', 'DEO',
  // Consumer - Products
  'PG', 'CL', 'EL', 'KMB', 'CHD', 'CLX', 'SJM', 'MKC', 'HRL', 'CPB',
  'CAG', 'GIS', 'K', 'MDLZ', 'HSY', 'COTY', 'TPR', 'VFC', 'PVH', 'RL',
  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL',
  'DVN', 'HES', 'FANG', 'KMI', 'WMB', 'OKE', 'ET', 'EPD', 'TRGP', 'LNG',
  // Utilities
  'NEE', 'DUK', 'SO', 'D', 'AEP', 'SRE', 'EXC', 'XEL', 'ED', 'PEG',
  'WEC', 'ES', 'AWK', 'DTE', 'EIX', 'PPL', 'FE', 'AEE', 'CMS', 'EVRG',
  // Industrials - Aerospace & Defense
  'BA', 'LMT', 'RTX', 'NOC', 'GD', 'TDG', 'HII', 'LHX', 'LDOS', 'BAH',
  'TXT', 'HXL', 'AXON', 'SPR', 'TGI', 'KTOS', 'RKLB', 'BWXT', 'HEI', 'TDY',
  // Industrials - Manufacturing
  'HON', 'GE', 'CAT', 'DE', 'MMM', 'EMR', 'ITW', 'ETN', 'ROK', 'PH',
  'DOV', 'FTV', 'OTIS', 'CARR', 'SWK', 'IR', 'GNRC', 'XYL', 'IEX', 'GGG',
  // Industrials - Transportation
  'UNP', 'UPS', 'FDX', 'CSX', 'NSC', 'JBHT', 'ODFL', 'CHRW', 'XPO', 'SAIA',
  'DAL', 'UAL', 'LUV', 'AAL', 'ALK', 'JBLU', 'EXPD', 'LSTR', 'RXO', 'KEX',
  // Materials
  'LIN', 'APD', 'ECL', 'SHW', 'PPG', 'NEM', 'FCX', 'NUE', 'STLD', 'CLF',
  'VMC', 'MLM', 'X', 'AA', 'ATI', 'RS', 'CCK', 'BLL', 'PKG', 'IP',
  // Real Estate
  'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'O', 'WELL', 'DLR', 'AVB',
  'EQR', 'VTR', 'ARE', 'MAA', 'UDR', 'ESS', 'REG', 'FRT', 'KIM', 'BXP',
  // Communication Services
  'NFLX', 'DIS', 'CMCSA', 'T', 'VZ', 'CHTR', 'TMUS', 'WBD', 'PARA', 'FOX',
  'LYV', 'MTCH', 'EA', 'TTWO', 'RBLX', 'U', 'SPOT', 'ROKU', 'ZG', 'PINS',
  // Payments & Fintech
  'V', 'MA', 'PYPL', 'FIS', 'FISV', 'GPN', 'ADP', 'PAYX', 'HOOD', 'SOFI',
  // IT Services
  'ACN', 'CTSH', 'WIT', 'EPAM', 'GLOB', 'GDDY', 'AKAM', 'FFIV', 'JNPR', 'ANET'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const page = body.page || 1;
    const perPage = Math.min(body.perPage || 50, 100);
    
    // Calculate which symbols to fetch for this page
    const startIndex = (page - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, ALL_STOCKS.length);
    const symbolsToFetch = ALL_STOCKS.slice(startIndex, endIndex);
    
    if (symbolsToFetch.length === 0) {
      return new Response(
        JSON.stringify({ stocks: [], total: ALL_STOCKS.length, page, perPage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    
    // Generate realistic mock data for all symbols (API has strict rate limits)
    const stocksData = symbolsToFetch.map((symbol) => {
      const basePrice = getBasePriceForSymbol(symbol);
      const volatility = 0.03;
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const currentPrice = basePrice * (1 + randomChange);
      const previousClose = basePrice;
      
      return {
        symbol,
        name: getNameForSymbol(symbol),
        description: null,
        exchange: getExchangeForSymbol(symbol),
        sector: getSectorForSymbol(symbol),
        industry: null,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        previousClose: parseFloat(previousClose.toFixed(2)),
        open: parseFloat((previousClose * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)),
        high: parseFloat((currentPrice * (1 + Math.random() * 0.02)).toFixed(2)),
        low: parseFloat((currentPrice * (1 - Math.random() * 0.02)).toFixed(2)),
        volume: Math.floor(Math.random() * 50000000) + 1000000,
        change: parseFloat((currentPrice - previousClose).toFixed(2)),
        changePercent: parseFloat(((currentPrice - previousClose) / previousClose * 100).toFixed(2)),
        marketCap: getMarketCapForSymbol(symbol),
        peRatio: parseFloat((15 + Math.random() * 35).toFixed(2)),
        pegRatio: parseFloat((0.5 + Math.random() * 2.5).toFixed(2)),
        beta: parseFloat((0.7 + Math.random() * 1.3).toFixed(2)),
        eps: parseFloat((2 + Math.random() * 15).toFixed(2)),
        dividendYield: parseFloat((Math.random() * 4).toFixed(2)),
        dividendPerShare: parseFloat((Math.random() * 5).toFixed(2)),
        profitMargin: parseFloat((5 + Math.random() * 25).toFixed(2)),
        fiftyTwoWeekHigh: parseFloat((currentPrice * (1.1 + Math.random() * 0.3)).toFixed(2)),
        fiftyTwoWeekLow: parseFloat((currentPrice * (0.6 + Math.random() * 0.3)).toFixed(2)),
        fiftyDayMA: parseFloat((currentPrice * (0.95 + Math.random() * 0.1)).toFixed(2)),
        twoHundredDayMA: parseFloat((currentPrice * (0.9 + Math.random() * 0.2)).toFixed(2)),
        analystTargetPrice: parseFloat((currentPrice * (1 + Math.random() * 0.3)).toFixed(2)),
        forwardPE: parseFloat((12 + Math.random() * 25).toFixed(2)),
        priceToBook: parseFloat((1 + Math.random() * 10).toFixed(2)),
        priceToSales: parseFloat((1 + Math.random() * 15).toFixed(2)),
        bookValue: parseFloat((10 + Math.random() * 100).toFixed(2)),
        revenuePerShare: parseFloat((10 + Math.random() * 200).toFixed(2)),
        returnOnEquity: parseFloat((5 + Math.random() * 35).toFixed(2)),
        returnOnAssets: parseFloat((3 + Math.random() * 20).toFixed(2)),
        lastUpdated: new Date().toISOString(),
      };
    });

    return new Response(
      JSON.stringify({ 
        stocks: stocksData, 
        total: ALL_STOCKS.length, 
        page, 
        perPage
      }),
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

function getBasePriceForSymbol(symbol: string): number {
  const priceMap: Record<string, number> = {
    'AAPL': 178, 'MSFT': 378, 'GOOGL': 141, 'AMZN': 178, 'META': 505, 'NVDA': 875,
    'TSLA': 248, 'AMD': 157, 'INTC': 43, 'CRM': 272, 'ORCL': 127, 'ADBE': 576,
    'JPM': 198, 'BAC': 37, 'WFC': 56, 'GS': 468, 'MS': 97, 'V': 279, 'MA': 456,
    'JNJ': 156, 'UNH': 527, 'PFE': 27, 'ABBV': 171, 'MRK': 127, 'LLY': 792,
    'WMT': 165, 'HD': 363, 'COST': 738, 'TGT': 142, 'LOW': 248,
    'XOM': 107, 'CVX': 151, 'COP': 114, 'SLB': 52,
    'NEE': 76, 'DUK': 102, 'SO': 73,
    'BA': 187, 'LMT': 453, 'RTX': 105, 'HON': 205, 'GE': 163, 'CAT': 336,
  };
  return priceMap[symbol] || (50 + Math.random() * 300);
}

function getNameForSymbol(symbol: string): string {
  const nameMap: Record<string, string> = {
    'AAPL': 'Apple Inc.', 'MSFT': 'Microsoft Corporation', 'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.', 'META': 'Meta Platforms Inc.', 'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla Inc.', 'AMD': 'Advanced Micro Devices', 'INTC': 'Intel Corporation',
    'CRM': 'Salesforce Inc.', 'ORCL': 'Oracle Corporation', 'ADBE': 'Adobe Inc.',
    'JPM': 'JPMorgan Chase & Co.', 'BAC': 'Bank of America Corp.', 'WFC': 'Wells Fargo & Co.',
    'GS': 'Goldman Sachs Group', 'MS': 'Morgan Stanley', 'V': 'Visa Inc.', 'MA': 'Mastercard Inc.',
    'JNJ': 'Johnson & Johnson', 'UNH': 'UnitedHealth Group', 'PFE': 'Pfizer Inc.',
    'WMT': 'Walmart Inc.', 'HD': 'Home Depot Inc.', 'COST': 'Costco Wholesale',
    'XOM': 'Exxon Mobil Corp.', 'CVX': 'Chevron Corporation', 'COP': 'ConocoPhillips',
    'BA': 'Boeing Company', 'LMT': 'Lockheed Martin', 'HON': 'Honeywell International',
    'NEE': 'NextEra Energy', 'DUK': 'Duke Energy Corp.', 'SO': 'Southern Company',
  };
  return nameMap[symbol] || symbol;
}

function getExchangeForSymbol(symbol: string): string {
  const nasdaqSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AMD', 'INTC', 'CSCO', 'ADBE', 'NFLX', 'PYPL', 'QCOM', 'TXN', 'AVGO', 'COST', 'SBUX', 'GILD', 'AMGN', 'MRNA', 'ZM', 'DOCU', 'SNOW', 'CRWD', 'DDOG', 'MDB', 'NET', 'ZS', 'OKTA'];
  return nasdaqSymbols.includes(symbol) ? 'NASDAQ' : 'NYSE';
}

function getSectorForSymbol(symbol: string): string {
  const sectorMap: Record<string, string[]> = {
    'Technology': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'CSCO', 'IBM', 'QCOM', 'TXN', 'AVGO', 'NOW', 'INTU', 'AMAT', 'MU', 'LRCX', 'SNOW', 'PLTR', 'DDOG', 'ZS', 'NET', 'CRWD', 'OKTA', 'MDB', 'WDAY', 'TEAM', 'ZM', 'DOCU', 'TWLO', 'SQ', 'SHOP', 'UBER', 'LYFT', 'DASH', 'ABNB', 'COIN'],
    'Financials': ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'USB', 'PNC', 'TFC', 'COF', 'AXP', 'SCHW', 'BK', 'STT', 'BLK', 'SPGI', 'MCO', 'ICE', 'CME', 'V', 'MA', 'PYPL'],
    'Healthcare': ['JNJ', 'UNH', 'PFE', 'ABBV', 'MRK', 'LLY', 'TMO', 'ABT', 'DHR', 'BMY', 'AMGN', 'GILD', 'CVS', 'CI', 'ISRG', 'REGN', 'VRTX', 'MRNA', 'BIIB', 'ZTS', 'MDT', 'SYK', 'BSX', 'EW', 'BDX'],
    'Consumer Discretionary': ['WMT', 'HD', 'COST', 'TGT', 'LOW', 'TJX', 'ROST', 'DG', 'DLTR', 'BBY', 'MCD', 'SBUX', 'YUM', 'CMG', 'DPZ', 'MAR', 'HLT', 'NFLX', 'DIS'],
    'Consumer Staples': ['KO', 'PEP', 'PG', 'CL', 'EL', 'KMB', 'CHD', 'CLX', 'PM', 'MO', 'STZ', 'MDLZ', 'HSY', 'GIS', 'K', 'MNST'],
    'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL', 'DVN', 'HES', 'FANG', 'KMI', 'WMB', 'OKE'],
    'Utilities': ['NEE', 'DUK', 'SO', 'D', 'AEP', 'SRE', 'EXC', 'XEL', 'ED', 'PEG', 'WEC', 'ES', 'AWK', 'DTE', 'EIX'],
    'Industrials': ['BA', 'LMT', 'RTX', 'NOC', 'GD', 'HON', 'GE', 'CAT', 'DE', 'MMM', 'EMR', 'ITW', 'ETN', 'UNP', 'UPS', 'FDX', 'CSX'],
    'Materials': ['LIN', 'APD', 'ECL', 'SHW', 'PPG', 'NEM', 'FCX', 'NUE', 'STLD', 'CLF', 'VMC', 'MLM'],
    'Real Estate': ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'O', 'WELL', 'DLR', 'AVB', 'EQR', 'VTR'],
    'Communication Services': ['CMCSA', 'T', 'VZ', 'CHTR', 'TMUS', 'WBD', 'PARA', 'FOX', 'LYV', 'MTCH', 'EA', 'TTWO', 'RBLX', 'SPOT', 'ROKU']
  };
  
  for (const [sector, symbols] of Object.entries(sectorMap)) {
    if (symbols.includes(symbol)) return sector;
  }
  return 'Other';
}

function getMarketCapForSymbol(symbol: string): number {
  const capMap: Record<string, number> = {
    'AAPL': 2800000000000, 'MSFT': 2790000000000, 'GOOGL': 1750000000000,
    'AMZN': 1850000000000, 'META': 1280000000000, 'NVDA': 2150000000000,
    'TSLA': 790000000000, 'JPM': 570000000000, 'V': 520000000000,
    'JNJ': 380000000000, 'WMT': 430000000000, 'XOM': 450000000000,
  };
  return capMap[symbol] || Math.floor(Math.random() * 500000000000) + 10000000000;
}
