import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map common crypto symbols to CoinGecko ids
const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin", XRP: "ripple",
  ADA: "cardano", AVAX: "avalanche-2", LINK: "chainlink", DOT: "polkadot", MATIC: "matic-network",
  DOGE: "dogecoin", LTC: "litecoin", TRX: "tron", ATOM: "cosmos", UNI: "uniswap",
  XLM: "stellar", ETC: "ethereum-classic", FIL: "filecoin", APT: "aptos", ARB: "arbitrum",
  OP: "optimism", NEAR: "near", ICP: "internet-computer", HBAR: "hedera-hashgraph", VET: "vechain",
  ALGO: "algorand", AAVE: "aave", MKR: "maker", SHIB: "shiba-inu", PEPE: "pepe",
  SUI: "sui", TON: "the-open-network", INJ: "injective-protocol", RNDR: "render-token", IMX: "immutable-x",
};

const RANGE_DAYS: Record<string, number> = {
  "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365, "2Y": 730, "5Y": 1825, "All": 3650,
};

async function fetchCryptoHistory(symbol: string, days: number) {
  const id = COINGECKO_IDS[symbol.toUpperCase()] || symbol.toLowerCase();
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=gbp&days=${days}`;
  const r = await fetch(url, { headers: { "accept": "application/json" } });
  if (!r.ok) throw new Error(`CoinGecko ${r.status}`);
  const j = await r.json();
  const prices: [number, number][] = j.prices || [];
  return prices.map(([ts, p]) => ({
    date: new Date(ts).toISOString().slice(0, 10),
    price: Number(p.toFixed(p < 1 ? 6 : 2)),
  }));
}

async function fetchStockHistory(symbol: string, days: number) {
  // Stooq supports US tickers via lowercase + .us
  const sym = symbol.toLowerCase().replace(/\./g, "-");
  // try .us first, then bare
  const candidates = [`${sym}.us`, sym];
  for (const s of candidates) {
    try {
      const url = `https://stooq.com/q/d/l/?s=${s}&i=d`;
      const r = await fetch(url);
      if (!r.ok) continue;
      const csv = await r.text();
      if (!csv || csv.startsWith("<") || csv.length < 50) continue;
      const lines = csv.trim().split("\n").slice(1); // skip header
      const rows = lines
        .map((l) => {
          const [date, _o, _h, _l, close] = l.split(",");
          const p = Number(close);
          return p && date ? { date, price: p } : null;
        })
        .filter(Boolean) as { date: string; price: number }[];
      if (!rows.length) continue;
      const sliced = rows.slice(-days);
      return sliced;
    } catch {
      continue;
    }
  }
  throw new Error(`Stooq: no data for ${symbol}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { symbol, assetType, range = "1Y" } = await req.json();
    if (!symbol) throw new Error("symbol required");
    const days = RANGE_DAYS[range] ?? 365;
    const isCrypto = (assetType || "").toLowerCase() === "crypto";
    const history = isCrypto
      ? await fetchCryptoHistory(symbol, days)
      : await fetchStockHistory(symbol, days);
    return new Response(JSON.stringify({ ok: true, symbol, range, history }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-asset-history:", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e), history: [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
