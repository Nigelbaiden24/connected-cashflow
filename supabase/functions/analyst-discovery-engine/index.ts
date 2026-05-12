import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `You are an institutional equity discovery engine combining quant screening with qualitative research.

Surface high-conviction discoveries across FIVE buckets:
- undervalued: low P/E, P/B, EV/EBITDA vs sector; trading below intrinsic value
- breakout: technical momentum, golden crosses, base breakouts on volume
- high_growth: superior earnings/revenue growth, expanding margins
- defensive: low beta, stable earnings, recession-resilient sectors
- high_yield: sustainable dividend yield with healthy payout ratio

Generate 12-20 total discoveries (mix across buckets). Return STRICT JSON: { "discoveries": [...] }

Each discovery MUST include:
- symbol (string, ticker)
- asset_name (string)
- asset_type ("equity" | "etf" | "reit")
- discovery_bucket (one of: undervalued | breakout | high_growth | defensive | high_yield)
- sector (string)
- valuation_metrics: { pe_ratio, pb_ratio, ev_ebitda, peg_ratio, vs_sector_pct }
- momentum_metrics: { rsi_14, vs_50dma_pct, vs_200dma_pct, three_month_return_pct, breakout_signal: bool }
- dividend_metrics: { yield_pct, payout_ratio_pct, growth_5yr_pct, sustainability: "low"|"medium"|"high" }
- earnings_growth: { revenue_growth_yoy_pct, eps_growth_yoy_pct, forward_eps_growth_pct, margin_trend: "expanding"|"stable"|"contracting" }
- analyst_sentiment: { buy_pct, hold_pct, sell_pct, avg_price_target, upside_pct, sentiment: "bullish"|"neutral"|"bearish" }
- volatility_metrics: { beta, std_dev_pct, max_drawdown_1yr_pct }
- institutional_ownership: { ownership_pct, recent_change_pct, top_holders_count }
- sector_performance: { sector_ytd_pct, relative_strength: "leader"|"average"|"laggard" }
- thesis (2-3 institutional sentences)
- catalysts (array of 2-4 short bullets)
- risks (array of 2-4 short bullets)
- score (0-5, 1 decimal)
- conviction ("low"|"medium"|"high"|"very_high")

Use real, current institutional knowledge. Be diverse across sectors and buckets.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const focus: string | undefined = body.focus;

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const userPrompt = focus
      ? `Focus discoveries primarily on the "${focus}" bucket. Still include 2-3 diversifying ideas from other buckets. Return STRICT JSON only.`
      : `Generate balanced discoveries across all 5 buckets. Return STRICT JSON only.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ ok: false, error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ ok: false, error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiRes.text();
      throw new Error(`AI: ${aiRes.status} ${t}`);
    }

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const discoveries: any[] = Array.isArray(parsed.discoveries) ? parsed.discoveries : [];

    const validBuckets = new Set(["undervalued", "breakout", "high_growth", "defensive", "high_yield"]);

    const rows = discoveries.map((d) => ({
      symbol: String(d.symbol || "").toUpperCase().slice(0, 20),
      asset_name: d.asset_name || null,
      asset_type: d.asset_type || "equity",
      discovery_bucket: validBuckets.has(d.discovery_bucket) ? d.discovery_bucket : "undervalued",
      sector: d.sector || null,
      valuation_metrics: d.valuation_metrics ?? {},
      momentum_metrics: d.momentum_metrics ?? {},
      dividend_metrics: d.dividend_metrics ?? {},
      earnings_growth: d.earnings_growth ?? {},
      analyst_sentiment: d.analyst_sentiment ?? {},
      volatility_metrics: d.volatility_metrics ?? {},
      institutional_ownership: d.institutional_ownership ?? {},
      sector_performance: d.sector_performance ?? {},
      thesis: d.thesis || null,
      catalysts: Array.isArray(d.catalysts) ? d.catalysts : [],
      risks: Array.isArray(d.risks) ? d.risks : [],
      score: Math.max(0, Math.min(5, Number(d.score) || 3)),
      conviction: d.conviction || "medium",
      status: "active",
    })).filter((r) => r.symbol);

    let inserted: any[] = [];
    if (rows.length) {
      const { data, error } = await supabase.from("discovery_engine_results").insert(rows).select();
      if (error) throw error;
      inserted = data ?? [];
    }

    return new Response(JSON.stringify({ ok: true, count: inserted.length, discoveries: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String((e as any)?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
