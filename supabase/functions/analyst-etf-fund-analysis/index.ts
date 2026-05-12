import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `You are a senior fund research analyst at an institutional asset management firm.

Generate deep, accurate ETF/fund analysis for each ticker provided. Use realistic, current institutional knowledge.

Return STRICT JSON: { "analyses": [ { ... } ] }

Each analysis MUST include:
- ticker (string, uppercase)
- fund_name (string)
- fund_type ("etf" | "mutual_fund" | "index_fund" | "active_fund")
- asset_class (e.g. "Equity", "Fixed Income", "Multi-Asset", "Commodity")
- region (e.g. "US", "Global", "Europe", "EM")
- holdings_concentration: { top_10_pct: number, top_holdings: [{name, weight_pct}], concentration_risk: "low"|"medium"|"high" }
- sector_exposure: { sectors: [{sector, weight_pct}], dominant_sector: string }
- historical_performance: { ytd_pct, one_yr_pct, three_yr_annualised_pct, five_yr_annualised_pct, since_inception_pct, vs_benchmark_pct }
- fee_analysis: { expense_ratio_pct, vs_category_average, fee_grade: "low"|"average"|"high", commentary }
- fund_flows: { last_30d_net_flow_usd_m, last_90d_net_flow_usd_m, ytd_net_flow_usd_m, flow_trend: "inflow"|"outflow"|"neutral" }
- manager_performance: { manager_tenure_years, alpha_vs_benchmark_pct, information_ratio, manager_grade: "A"|"B"|"C"|"D" }
- volatility_metrics: { std_dev_3yr_pct, beta, sharpe_ratio, max_drawdown_pct, downside_capture_pct }
- summary (2-3 institutional-grade sentences)
- pros (array of 3-5 short bullets)
- cons (array of 3-5 short bullets)
- suitable_investor_types (array, e.g. ["Long-term holder", "Income investor"])
- comparative_analysis (2-3 sentences vs peers)
- trend_commentary (2-3 sentences on flow & momentum trends)
- overall_score (0-5, 1 decimal)

Be specific with numbers. Use realistic data based on widely-known fund characteristics.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const tickers: string[] = Array.isArray(body.tickers) && body.tickers.length
      ? body.tickers.map((t: string) => String(t).toUpperCase().trim()).filter(Boolean)
      : ["SPY", "QQQ", "VTI", "VXUS", "BND", "VWO", "ARKK", "SCHD", "VNQ", "GLD"];

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyse the following ETFs/funds: ${tickers.join(", ")}. Return STRICT JSON only.` },
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
    const analyses: any[] = Array.isArray(parsed.analyses) ? parsed.analyses : [];

    const rows = analyses.map((a) => ({
      ticker: String(a.ticker || "").toUpperCase().slice(0, 20),
      fund_name: a.fund_name || a.ticker || "Unknown",
      fund_type: a.fund_type || "etf",
      asset_class: a.asset_class || null,
      region: a.region || null,
      holdings_concentration: a.holdings_concentration ?? {},
      sector_exposure: a.sector_exposure ?? {},
      historical_performance: a.historical_performance ?? {},
      fee_analysis: a.fee_analysis ?? {},
      fund_flows: a.fund_flows ?? {},
      manager_performance: a.manager_performance ?? {},
      volatility_metrics: a.volatility_metrics ?? {},
      summary: a.summary || null,
      pros: Array.isArray(a.pros) ? a.pros : [],
      cons: Array.isArray(a.cons) ? a.cons : [],
      suitable_investor_types: Array.isArray(a.suitable_investor_types) ? a.suitable_investor_types : [],
      comparative_analysis: a.comparative_analysis || null,
      trend_commentary: a.trend_commentary || null,
      overall_score: Math.max(0, Math.min(5, Number(a.overall_score) || 3)),
      status: "active",
    })).filter((r) => r.ticker);

    let inserted: any[] = [];
    if (rows.length) {
      const { data, error } = await supabase.from("etf_fund_analyses").insert(rows).select();
      if (error) throw error;
      inserted = data ?? [];
    }

    return new Response(JSON.stringify({ ok: true, count: inserted.length, analyses: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String((e as any)?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
