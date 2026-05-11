import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const count: number = Math.max(3, Math.min(20, Number(body?.count) || 8));
    const promote: boolean = body?.promote !== false; // default true (auto-promote to platforms)
    const platform: string | null = body?.platform ?? null; // finance | investor | null=both

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Pull today's universe from stocks_crypto (finance/investor sidebar feed)
    const { data: dbUniverse } = await supabase
      .from("stocks_crypto")
      .select("id,symbol,name,asset_type,sector,industry,current_price,market_cap,price_change_24h,price_change_7d,price_change_30d,price_change_1y,logo_url,overall_score,analyst_rating")
      .order("market_cap", { ascending: false, nullsFirst: false })
      .limit(180);

    // Fallback curated universe so scans always run, even before admin publishes the live table
    const fallbackUniverse = [
      { symbol: "AAPL", name: "Apple Inc.", asset_type: "stock", sector: "Technology" },
      { symbol: "MSFT", name: "Microsoft Corporation", asset_type: "stock", sector: "Technology" },
      { symbol: "NVDA", name: "NVIDIA Corporation", asset_type: "stock", sector: "Semiconductors" },
      { symbol: "GOOGL", name: "Alphabet Inc.", asset_type: "stock", sector: "Technology" },
      { symbol: "AMZN", name: "Amazon.com Inc.", asset_type: "stock", sector: "Consumer Discretionary" },
      { symbol: "META", name: "Meta Platforms Inc.", asset_type: "stock", sector: "Technology" },
      { symbol: "TSLA", name: "Tesla Inc.", asset_type: "stock", sector: "Automotive" },
      { symbol: "BRK.B", name: "Berkshire Hathaway", asset_type: "stock", sector: "Financials" },
      { symbol: "JPM", name: "JPMorgan Chase", asset_type: "stock", sector: "Financials" },
      { symbol: "V", name: "Visa Inc.", asset_type: "stock", sector: "Financials" },
      { symbol: "UNH", name: "UnitedHealth Group", asset_type: "stock", sector: "Healthcare" },
      { symbol: "LLY", name: "Eli Lilly", asset_type: "stock", sector: "Pharmaceuticals" },
      { symbol: "XOM", name: "Exxon Mobil", asset_type: "stock", sector: "Energy" },
      { symbol: "AVGO", name: "Broadcom Inc.", asset_type: "stock", sector: "Semiconductors" },
      { symbol: "ASML", name: "ASML Holding", asset_type: "stock", sector: "Semiconductors" },
      { symbol: "TSM", name: "Taiwan Semiconductor", asset_type: "stock", sector: "Semiconductors" },
      { symbol: "COST", name: "Costco Wholesale", asset_type: "stock", sector: "Consumer Staples" },
      { symbol: "NFLX", name: "Netflix Inc.", asset_type: "stock", sector: "Communication Services" },
      { symbol: "AMD", name: "Advanced Micro Devices", asset_type: "stock", sector: "Semiconductors" },
      { symbol: "ORCL", name: "Oracle Corporation", asset_type: "stock", sector: "Technology" },
      { symbol: "BTC", name: "Bitcoin", asset_type: "crypto", sector: "Cryptocurrency" },
      { symbol: "ETH", name: "Ethereum", asset_type: "crypto", sector: "Cryptocurrency" },
      { symbol: "SOL", name: "Solana", asset_type: "crypto", sector: "Cryptocurrency" },
      { symbol: "BNB", name: "Binance Coin", asset_type: "crypto", sector: "Cryptocurrency" },
      { symbol: "XRP", name: "XRP", asset_type: "crypto", sector: "Cryptocurrency" },
      { symbol: "ADA", name: "Cardano", asset_type: "crypto", sector: "Cryptocurrency" },
      { symbol: "AVAX", name: "Avalanche", asset_type: "crypto", sector: "Cryptocurrency" },
      { symbol: "LINK", name: "Chainlink", asset_type: "crypto", sector: "Cryptocurrency" },
      { symbol: "DOT", name: "Polkadot", asset_type: "crypto", sector: "Cryptocurrency" },
      { symbol: "MATIC", name: "Polygon", asset_type: "crypto", sector: "Cryptocurrency" },
    ].map((x, i) => ({ id: `fallback-${i}-${x.symbol}`, ...x, logo_url: null, current_price: null, market_cap: null }));

    const universe = (dbUniverse && dbUniverse.length > 0) ? dbUniverse : fallbackUniverse;

    const sys = `You are an elite multi-asset analyst (institutional grade). Pick the top ${count} highest-conviction stocks and crypto from the supplied universe for TODAY. Judge PAST performance and FUTURE outlook with rigour. Score conviction strictly 0–5. Pick ONLY ids supplied. Output strict JSON.`;
    const user = `Universe (${universe.length}): ${JSON.stringify(universe).slice(0, 120000)}\n\nReturn JSON: {"picks":[{"id":"<id>","symbol":"...","name":"...","asset_type":"stock|crypto","activity_type":"ai_pick","headline":"<one-line catchy headline like a Bloomberg alert>","summary":"2-3 sentence punchy commentary","analyst_rating":"Gold|Silver|Bronze|Neutral|Negative","conviction_score":0-5,"past_performance":"1-2 sentences on recent track record (24h, 30d, 1y)","future_outlook":"2-3 sentences on near to mid term outlook with specifics","catalysts":["...","..."],"risks":["...","..."]}]}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      if (r.status === 429) throw new Error("Rate limit exceeded");
      if (r.status === 402) throw new Error("AI credits exhausted");
      throw new Error(`AI gateway: ${t}`);
    }
    const ai = await r.json();
    const parsed = JSON.parse(ai.choices?.[0]?.message?.content ?? "{}");
    const allowed = new Map(universe.map((u: any) => [u.id, u]));
    const picks: any[] = (parsed.picks ?? []).filter((p: any) => p && allowed.has(p.id)).slice(0, count);

    if (!picks.length) {
      return new Response(JSON.stringify({ ok: false, error: "AI returned no valid picks" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const today = new Date().toISOString().slice(0, 10);
    const rows = picks.map((p) => {
      const u: any = allowed.get(p.id);
      return {
        symbol: (p.symbol || u.symbol || "").toUpperCase(),
        name: p.name || u.name,
        asset_type: p.asset_type === "crypto" || u.asset_type === "crypto" ? "crypto" : "stock",
        logo_url: u.logo_url ?? null,
        activity_type: p.activity_type || "ai_pick",
        headline: p.headline || `${p.name || u.name}: AI conviction update`,
        summary: p.summary ?? null,
        analyst_rating: ["Gold","Silver","Bronze","Neutral","Negative"].includes(p.analyst_rating) ? p.analyst_rating : "Neutral",
        conviction_score: Math.max(0, Math.min(5, Number(p.conviction_score) || 3)),
        past_performance: p.past_performance ?? null,
        future_outlook: p.future_outlook ?? null,
        catalysts: Array.isArray(p.catalysts) ? p.catalysts : [],
        risks: Array.isArray(p.risks) ? p.risks : [],
        scan_date: today,
        source: "ai_scan",
        is_promoted: promote,
        platform,
        metadata: { stock_id: p.id, snapshot: u },
      };
    });

    const { data: inserted, error: insErr } = await supabase
      .from("stocks_crypto_analyst_activity")
      .insert(rows)
      .select("id, symbol, name, headline, conviction_score, analyst_rating, asset_type, scan_date, is_promoted");
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ ok: true, count: inserted?.length ?? 0, picks: inserted, universe_size: universe.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("stocks-crypto-elite-scan:", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
