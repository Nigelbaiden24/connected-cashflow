import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `You are an institutional real-time market alert engine.

Generate 8-15 high-conviction real-time investment alerts derived from recent analyst signals & briefs provided.

Each alert MUST cover ONE of these alert_category values:
- price_action | volume_spike | earnings_surprise | technical_breakout | insider_transaction | etf_flow | macro_event | options_activity | sentiment_shift

Each alert MUST be classified as ONE of:
- bullish | bearish | neutral | high_volatility | breaking_news

Return STRICT JSON: { "alerts": [ { ... } ] }

Each alert object MUST include:
- symbol (string, ticker)
- asset_name (string)
- asset_type ("equity" | "etf" | "crypto" | "fund" | "commodity" | "fx" | "macro")
- alert_category (one of above)
- classification (one of above)
- confidence_score (0-5 numeric, 1 decimal)
- urgency_rating ("low" | "medium" | "high" | "critical")
- catalyst_explanation (1-3 sentences explaining the trigger)
- actionable_summary (1 short sentence, decisive language)
- risk_disclaimer (1 short sentence reminding user this is not financial advice)
- signals (array of short tags e.g. ["RSI breakout", "above 50DMA"])
- expires_in_hours (numeric, 1-72)

Be specific, institutional, no fluff. Prioritise diverse categories & classifications.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Expire stale alerts
    await supabase
      .from("realtime_investment_alerts")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("expires_at", new Date().toISOString());

    // Pull recent context
    const since = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
    const [{ data: signals }, { data: briefs }] = await Promise.all([
      supabase.from("analyst_signals").select("*").gte("created_at", since).limit(100),
      supabase.from("analyst_briefs").select("title,category,thesis,catalyst,conviction,extended").gte("created_at", since).limit(40),
    ]);

    const context = JSON.stringify({ signals: signals ?? [], briefs: briefs ?? [] }).slice(0, 60000);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Recent market intelligence (3 days):\n${context}\n\nReturn STRICT JSON only.` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return new Response(JSON.stringify({ ok: false, error: `AI: ${aiRes.status} ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const alerts: any[] = Array.isArray(parsed.alerts) ? parsed.alerts : [];

    const rows = alerts.map((a) => {
      const hours = Math.max(1, Math.min(72, Number(a.expires_in_hours) || 24));
      return {
        symbol: String(a.symbol || "").slice(0, 20).toUpperCase(),
        asset_name: a.asset_name || null,
        asset_type: a.asset_type || null,
        alert_category: a.alert_category || "price_action",
        classification: a.classification || "neutral",
        confidence_score: Math.max(0, Math.min(5, Number(a.confidence_score) || 3)),
        urgency_rating: a.urgency_rating || "medium",
        catalyst_explanation: a.catalyst_explanation || null,
        actionable_summary: a.actionable_summary || null,
        risk_disclaimer: a.risk_disclaimer || "Not financial advice. Markets carry risk; do your own due diligence.",
        signals: Array.isArray(a.signals) ? a.signals : [],
        source_refs: [],
        status: "active",
        expires_at: new Date(Date.now() + hours * 3600 * 1000).toISOString(),
      };
    }).filter((r) => r.symbol);

    let inserted: any[] = [];
    if (rows.length) {
      const { data, error } = await supabase
        .from("realtime_investment_alerts")
        .insert(rows)
        .select();
      if (error) throw error;
      inserted = data ?? [];
    }

    return new Response(JSON.stringify({ ok: true, count: inserted.length, alerts: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
