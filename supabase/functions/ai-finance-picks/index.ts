import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Mode = "picks" | "score_stocks" | "score_funds";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const mode: Mode = (body?.mode as Mode) || "picks";
    const count: number = Math.max(1, Math.min(20, Number(body?.count) || 5));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (mode === "score_stocks") return await scoreStocks(supabase, LOVABLE_API_KEY, count);
    if (mode === "score_funds") return await scoreFunds(supabase, LOVABLE_API_KEY, count);
    return await pickFeatured(supabase, LOVABLE_API_KEY, count);
  } catch (e) {
    console.error("ai-finance-picks error:", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function callAI(key: string, system: string, user: string) {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" },
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    if (r.status === 429) throw new Error("Rate limit exceeded");
    if (r.status === 402) throw new Error("AI credits exhausted");
    throw new Error(`AI gateway: ${t}`);
  }
  const data = await r.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
}

async function pickFeatured(supabase: any, key: string, count: number) {
  const [{ data: funds }, { data: assets }] = await Promise.all([
    supabase.from("fund_analyst_activity")
      .select("id, fund_name, isin, asset_class, fund_type, provider, one_year_return, three_year_return, five_year_return, overall_score, analyst_rating, investment_thesis, risks, strengths")
      .eq("status", "published").order("overall_score", { ascending: false, nullsFirst: false }).limit(40),
    supabase.from("stocks_crypto")
      .select("id, name, symbol, asset_type, sector, industry, current_price, market_cap, price_change_1y, price_change_30d, overall_score, analyst_rating, investment_thesis, risks, strengths")
      .eq("status", "published").order("overall_score", { ascending: false, nullsFirst: false }).limit(60),
  ]);

  const universe = [
    ...(funds ?? []).map((f: any) => ({
      kind: "fund", id: f.id, name: f.fund_name, symbol: f.isin,
      sector: f.asset_class ?? f.fund_type, provider: f.provider,
      return_1y: f.one_year_return, return_3y: f.three_year_return, return_5y: f.five_year_return,
      admin_score: f.overall_score, admin_rating: f.analyst_rating,
      thesis: f.investment_thesis, strengths: f.strengths, risks: f.risks,
    })),
    ...(assets ?? []).map((a: any) => ({
      kind: a.asset_type === "crypto" ? "crypto" : "stock", id: a.id, name: a.name, symbol: a.symbol,
      sector: a.sector ?? a.industry, market_cap: a.market_cap,
      return_30d: a.price_change_30d, return_1y: a.price_change_1y, current_price: a.current_price,
      admin_score: a.overall_score, admin_rating: a.analyst_rating,
      thesis: a.investment_thesis, strengths: a.strengths, risks: a.risks,
    })),
  ];

  if (universe.length === 0) {
    return new Response(JSON.stringify({ ok: false, error: "Finance universe is empty. Publish funds or stocks/crypto first." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const sys = `You are a senior multi-asset PM ranking strongest near-term opportunities on FlowPulse Finance. Pick ONLY from the supplied universe. Score conviction 1-10. Mix asset types where suitable. Strict JSON.`;
  const user = `Pick the TOP ${count} (no duplicates, no outside items). Universe (${universe.length}): ${JSON.stringify(universe).slice(0, 120000)}\n\nReturn JSON: {"picks":[{"id":"<id>","kind":"fund|stock|crypto","name":"...","symbol":"...","sector":"...","analyst_rating":"strong_buy|buy|hold","conviction_score":1-10,"investment_thesis":"3-5 sentences with specifics","key_catalysts":["...","..."],"risk_factors":["...","..."],"time_horizon":"short_term|medium_term|long_term","why_picked":"1-2 sentences explaining why this stood out vs other items in the universe"}]}`;

  const parsed = await callAI(key, sys, user);
  const allowed = new Set(universe.map((u) => u.id));
  const picks = (parsed.picks ?? []).filter((p: any) => p && allowed.has(p.id)).slice(0, count);
  return new Response(JSON.stringify({ ok: true, mode: "picks", picks, universe_size: universe.length }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function scoreStocks(supabase: any, key: string, count: number) {
  const { data: assets } = await supabase.from("stocks_crypto")
    .select("id, name, symbol, asset_type, sector, industry, current_price, market_cap, price_change_1y, price_change_30d, overall_score, analyst_rating, investment_thesis")
    .order("market_cap", { ascending: false, nullsFirst: false }).limit(150);

  if (!assets?.length) {
    return new Response(JSON.stringify({ ok: false, error: "No stocks/crypto in database" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const sys = `You are an elite multi-asset analyst. Re-score the supplied stocks & crypto using a strict 0-5 conviction scale, with detailed institutional-grade rationale. Pick ONLY from the supplied IDs. Strict JSON.`;
  const user = `From this universe of ${assets.length} stocks/crypto, pick the TOP ${count} highest-conviction names right now. Universe: ${JSON.stringify(assets).slice(0, 120000)}\n\nReturn JSON: {"scores":[{"id":"<id>","name":"...","symbol":"...","analyst_rating":"Gold|Silver|Bronze|Neutral|Negative","overall_score":0-5,"score_fundamentals":0-5,"score_technicals":0-5,"score_momentum":0-5,"score_risk":0-5,"investment_thesis":"3-5 sentences with specifics","strengths":"bullet list as text","risks":"bullet list as text","why_picked":"1-2 sentences explaining edge vs peers in this universe"}]}`;

  const parsed = await callAI(key, sys, user);
  const allowed = new Set(assets.map((a: any) => a.id));
  const scores = (parsed.scores ?? []).filter((s: any) => s && allowed.has(s.id)).slice(0, count);
  return new Response(JSON.stringify({ ok: true, mode: "score_stocks", scores, universe_size: assets.length }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function scoreFunds(supabase: any, key: string, count: number) {
  const { data: funds } = await supabase.from("fund_analyst_activity")
    .select("id, fund_name, isin, asset_class, fund_type, provider, one_year_return, three_year_return, five_year_return, ocf, aum, overall_score, analyst_rating, investment_thesis")
    .order("aum", { ascending: false, nullsFirst: false }).limit(120);

  if (!funds?.length) {
    return new Response(JSON.stringify({ ok: false, error: "No funds in database" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const sys = `You are an elite fund selection analyst (Morningstar / Citywire grade). Re-score funds on a strict 0-5 conviction scale with rigorous rationale. Pick ONLY from supplied IDs. Strict JSON.`;
  const user = `From this universe of ${funds.length} funds, pick the TOP ${count} highest-conviction. Universe: ${JSON.stringify(funds).slice(0, 120000)}\n\nReturn JSON: {"scores":[{"id":"<id>","fund_name":"...","isin":"...","analyst_rating":"Gold|Silver|Bronze|Neutral|Negative","overall_score":0-5,"score_fundamentals":0-5,"score_performance":0-5,"score_risk":0-5,"score_cost":0-5,"score_esg":0-5,"investment_thesis":"3-5 sentences","strengths":"bullet list as text","risks":"bullet list as text","why_picked":"1-2 sentences explaining edge vs peers"}]}`;

  const parsed = await callAI(key, sys, user);
  const allowed = new Set(funds.map((f: any) => f.id));
  const scores = (parsed.scores ?? []).filter((s: any) => s && allowed.has(s.id)).slice(0, count);
  return new Response(JSON.stringify({ ok: true, mode: "score_funds", scores, universe_size: funds.length }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
