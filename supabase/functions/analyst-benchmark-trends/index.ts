import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_AI_KEY = Deno.env.get("LOVABLE_API_KEY")!;

async function callAI(system: string, user: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_AI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Pull recent signals + market data context (last 7d)
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const [{ data: signals }, { data: opps }] = await Promise.all([
      supabase.from("analyst_signals").select("*").gte("created_at", since).limit(200),
      supabase.from("opportunity_products").select("title,category,sub_category,analyst_rating,overall_conviction_score,country").gte("created_at", since).limit(100),
    ]);

    const ctx = {
      signals: (signals || []).map((s: any) => ({
        title: s.title, source: s.source, tier: s.signal_tier,
        category: s.category, summary: s.summary, score: s.confidence_score,
      })),
      opportunities: opps || [],
      window: "rolling 7 days",
      generated_at: new Date().toISOString(),
    };

    const system = `You are FlowPulse's institutional cross-asset benchmarking analyst. Compare sectors, ETFs, funds, equities, growth vs value, regions, and retail vs institutional sentiment. Identify outperformers, underperformers, unusual capital flows, momentum shifts, and trend reversals. Output only valid JSON. Never publish absolute claims when data is thin — downgrade confidence_score (0-5 scale).`;

    const userPrompt = `Generate a benchmarking & trend report from this 7-day intelligence context. Return JSON with:
{
  "headline": "...",
  "executive_summary": "institutional-grade 3-5 paragraphs",
  "mobile_summary": "≤40 words",
  "push_summary": "≤140 chars",
  "full_commentary": "markdown analyst commentary explaining trends, flows, sentiment shifts",
  "rankings": {
    "sectors": [{"name":"","performance_pct":0,"rank":1,"trend":"up|down|flat"}],
    "etfs":    [{"ticker":"","name":"","performance_pct":0,"flow":"inflow|outflow"}],
    "funds":   [{"name":"","performance_pct":0,"category":""}],
    "equities":[{"ticker":"","name":"","performance_pct":0}],
    "regions": [{"name":"","performance_pct":0}]
  },
  "outperformers": [{"name":"","type":"sector|etf|fund|equity|region","reason":""}],
  "underperformers":[{"name":"","type":"","reason":""}],
  "capital_flows": [{"asset":"","direction":"in|out","magnitude":"large|medium|small","note":""}],
  "momentum_shifts":[{"asset":"","from":"","to":"","note":""}],
  "trend_reversals":[{"asset":"","prior_trend":"","new_trend":"","conviction":0}],
  "anomalies":     [{"asset":"","anomaly":"","severity":"low|medium|high","note":""}],
  "sector_analysis": {"leading":[],"lagging":[],"rotation_note":""},
  "regional_analysis": {"strongest":"","weakest":"","note":""},
  "growth_vs_value": {"leader":"growth|value","spread_pct":0,"note":""},
  "sentiment_analysis": {"retail":"bullish|bearish|neutral","institutional":"bullish|bearish|neutral","divergence_note":""},
  "sources": [{"label":"","note":""}],
  "confidence_score": 0
}

Context:\n${JSON.stringify(ctx).slice(0, 18000)}`;

    const ai = await callAI(system, userPrompt);

    const { data: inserted, error } = await supabase
      .from("analyst_benchmark_reports")
      .insert({
        headline: ai.headline || "Cross-Asset Benchmarking Report",
        executive_summary: ai.executive_summary,
        mobile_summary: ai.mobile_summary,
        push_summary: ai.push_summary,
        full_commentary: ai.full_commentary,
        rankings: ai.rankings || {},
        outperformers: ai.outperformers || [],
        underperformers: ai.underperformers || [],
        capital_flows: ai.capital_flows || [],
        momentum_shifts: ai.momentum_shifts || [],
        trend_reversals: ai.trend_reversals || [],
        anomalies: ai.anomalies || [],
        sector_analysis: ai.sector_analysis || {},
        regional_analysis: ai.regional_analysis || {},
        growth_vs_value: ai.growth_vs_value || {},
        sentiment_analysis: ai.sentiment_analysis || {},
        sources: ai.sources || [],
        confidence_score: Math.max(0, Math.min(5, Number(ai.confidence_score) || 3)),
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, report: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("benchmark-trends error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
