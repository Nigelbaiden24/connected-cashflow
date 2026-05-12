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
    headers: { Authorization: `Bearer ${LOVABLE_AI_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const since = new Date(Date.now() - 3 * 86400000).toISOString();

    const [{ data: signals }, { data: briefs }] = await Promise.all([
      supabase.from("analyst_signals").select("*").gte("created_at", since).limit(150),
      supabase.from("analyst_briefs").select("title,category,thesis,catalyst,extended").gte("created_at", since).limit(60),
    ]);

    const ctx = {
      signals: (signals || []).map((s: any) => ({
        title: s.title, source: s.source, category: s.category,
        tier: s.signal_tier, summary: s.summary, score: s.confidence_score,
      })),
      briefs: briefs || [],
      window: "rolling 3 days",
      generated_at: new Date().toISOString(),
    };

    const system = `You are FlowPulse's institutional watchlist curator. Identify 8-15 high-conviction tickers/assets to add to a dynamic watchlist based on volatility spikes, unusual volume, earnings activity, technical breakouts, insider trades, social sentiment, institutional accumulation, and macro catalysts. Output strict JSON only. Use 0-5 scoring scales. Downgrade confidence when data is thin.`;

    const userPrompt = `Generate dynamic watchlist entries from this 3-day intelligence context. Return JSON:
{
  "entries": [
    {
      "symbol": "AAPL",
      "asset_name": "Apple Inc.",
      "asset_type": "equity|etf|crypto|commodity|fund",
      "trigger_type": "volatility_spike|unusual_volume|earnings|technical_breakout|insider_trading|social_sentiment|institutional_accumulation|macro_catalyst",
      "watchlist_reason": "1-2 sentences why on the list",
      "entry_risk_level": "low|medium|high|extreme",
      "momentum_score": 0,
      "catalyst_summary": "what catalyst drives the watch",
      "support_resistance": "key support/resistance with levels",
      "alert_urgency_score": 0,
      "signals": ["short bullets of evidence"],
      "confidence_score": 0,
      "expires_in_days": 7
    }
  ]
}

Context:\n${JSON.stringify(ctx).slice(0, 16000)}`;

    const ai = await callAI(system, userPrompt);
    const entries = Array.isArray(ai.entries) ? ai.entries : [];

    const rows = entries.map((e: any) => {
      const days = Number(e.expires_in_days) || 7;
      return {
        symbol: String(e.symbol || "").toUpperCase().slice(0, 20),
        asset_name: e.asset_name || null,
        asset_type: e.asset_type || "equity",
        trigger_type: e.trigger_type || "macro_catalyst",
        watchlist_reason: e.watchlist_reason || null,
        entry_risk_level: e.entry_risk_level || "medium",
        momentum_score: Math.max(0, Math.min(5, Number(e.momentum_score) || 0)),
        catalyst_summary: e.catalyst_summary || null,
        support_resistance: e.support_resistance || null,
        alert_urgency_score: Math.max(0, Math.min(5, Number(e.alert_urgency_score) || 0)),
        signals: Array.isArray(e.signals) ? e.signals : [],
        confidence_score: Math.max(0, Math.min(5, Number(e.confidence_score) || 3)),
        status: "active",
        expires_at: new Date(Date.now() + days * 86400000).toISOString(),
      };
    }).filter((r: any) => r.symbol);

    let inserted: any[] = [];
    if (rows.length) {
      const { data, error } = await supabase
        .from("analyst_dynamic_watchlist").insert(rows).select();
      if (error) throw error;
      inserted = data || [];
    }

    // Auto-expire stale
    await supabase.from("analyst_dynamic_watchlist")
      .update({ status: "expired" })
      .lt("expires_at", new Date().toISOString())
      .eq("status", "active");

    return new Response(JSON.stringify({ ok: true, count: inserted.length, entries: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dynamic-watchlist error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
