import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { count = 5 } = await req.json().catch(() => ({}));
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Universe = ONLY items listed on FlowPulse Finance sidebar tables
    const [{ data: funds }, { data: assets }] = await Promise.all([
      supabase.from("fund_analyst_activity")
        .select("id, fund_name, isin, asset_class, fund_type, provider, one_year_return, three_year_return, five_year_return, overall_score, analyst_rating, investment_thesis, risks, strengths")
        .eq("status", "published")
        .order("overall_score", { ascending: false, nullsFirst: false })
        .limit(40),
      supabase.from("stocks_crypto")
        .select("id, name, symbol, asset_type, sector, industry, current_price, market_cap, price_change_1y, price_change_30d, overall_score, analyst_rating, investment_thesis, risks, strengths")
        .eq("status", "published")
        .order("overall_score", { ascending: false, nullsFirst: false })
        .limit(60),
    ]);

    const universe = [
      ...(funds ?? []).map(f => ({
        kind: "fund",
        id: f.id, name: f.fund_name, symbol: f.isin,
        sector: f.asset_class ?? f.fund_type, provider: f.provider,
        return_1y: f.one_year_return, return_3y: f.three_year_return, return_5y: f.five_year_return,
        admin_score: f.overall_score, admin_rating: f.analyst_rating,
        thesis: f.investment_thesis, strengths: f.strengths, risks: f.risks,
      })),
      ...(assets ?? []).map(a => ({
        kind: a.asset_type === "crypto" ? "crypto" : "stock",
        id: a.id, name: a.name, symbol: a.symbol,
        sector: a.sector ?? a.industry, market_cap: a.market_cap,
        return_30d: a.price_change_30d, return_1y: a.price_change_1y, current_price: a.current_price,
        admin_score: a.overall_score, admin_rating: a.analyst_rating,
        thesis: a.investment_thesis, strengths: a.strengths, risks: a.risks,
      })),
    ];

    if (universe.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "Finance universe is empty. Publish funds or stocks/crypto in the admin first." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const systemPrompt = `You are a senior multi-asset PM ranking the strongest near-term opportunities on the FlowPulse Finance platform. You may ONLY pick from the supplied universe — never invent items. Score each pick on conviction 1-10 (10 = strongest). Mix asset types where suitable. Return strict JSON.`;

    const userPrompt = `Pick the TOP ${count} from this universe (no duplicates, no outside items). Universe (${universe.length} items): ${JSON.stringify(universe).slice(0, 120000)}

Return JSON: {"picks":[{"id":"<id from universe>","kind":"fund|stock|crypto","name":"...","symbol":"...","sector":"...","analyst_rating":"strong_buy|buy|hold","conviction_score":1-10,"investment_thesis":"3-5 sentences with specifics","key_catalysts":["...","..."],"risk_factors":["...","..."],"time_horizon":"short_term|medium_term|long_term"}]}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      if (r.status === 429) return new Response(JSON.stringify({ ok: false, error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (r.status === 402) return new Response(JSON.stringify({ ok: false, error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway: ${t}`);
    }
    const data = await r.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);
    const allowed = new Set(universe.map(u => u.id));
    const picks = (parsed.picks ?? []).filter((p: any) => p && allowed.has(p.id)).slice(0, count);

    return new Response(JSON.stringify({ ok: true, picks, universe_size: universe.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-finance-picks error:", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
