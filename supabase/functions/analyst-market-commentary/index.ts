// Generates institutional-grade daily market commentary using AI gateway,
// drawing context from recent analyst_signals + scraped raw signals.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const MASTER_PERSONA = `You are FlowPulse Analyst AI — a hybrid buy-side / macro / equity / ETF / journalist desk.
Voice: Bloomberg / Goldman Sachs / Morningstar — authoritative, readable, never fabricated.
All currency GBP-default for UK audience. Separate facts vs estimates vs sentiment vs assumptions.
Never publish directly to production — output enters admin approval queue.`;

async function aiTool(systemPrompt: string, userPrompt: string, tool: any) {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: `${MASTER_PERSONA}\n\n---\n\nTASK:\n${systemPrompt}` },
        { role: "user", content: userPrompt },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: tool.function.name } },
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    if (resp.status === 429) throw new Error("Rate limited — please try again shortly.");
    if (resp.status === 402) throw new Error("AI credits exhausted — top up at Settings → Workspace → Usage.");
    throw new Error(`AI ${resp.status}: ${t.slice(0, 200)}`);
  }
  const data = await resp.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  return args ? JSON.parse(args) : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Pull last 24h of classified signals as context
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: signals } = await sb
      .from("analyst_signals")
      .select("category, sectors, regions, tickers, sentiment, urgency, summary, raw_signal_id")
      .gte("created_at", cutoff)
      .order("urgency", { ascending: false })
      .limit(80);

    const { data: raws } = await sb
      .from("analyst_raw_signals")
      .select("source, source_url, title")
      .gte("fetched_at", cutoff)
      .limit(40);

    const signalText = (signals || [])
      .map((s, i) => `[${i + 1}] ${s.category} | ${s.regions?.join(",") || "global"} | ${s.tickers?.join(",") || ""} | sent=${s.sentiment} urg=${s.urgency} — ${s.summary}`)
      .join("\n");
    const sources = (raws || []).map((r) => ({ source: r.source, url: r.source_url, title: r.title }));

    const result = await aiTool(
      `Generate institutional-grade daily market commentary covering global market movements, major indices (FTSE 100, S&P 500, NASDAQ, DAX, Nikkei, Hang Seng), interest rates (BoE, Fed, ECB, BoJ), inflation prints, central bank activity, commodities (oil, gold, gas, copper), crypto (BTC, ETH), geopolitical developments, sector rotation, and earnings sentiment.

Explain WHY markets moved, WHICH sectors benefited, WHERE institutional money is flowing, MAJOR RISKS ahead, and EXPECTED implications.

Output executive summary, mobile summary (≤40 words), full analyst commentary (multi-paragraph institutional voice), retail-friendly breakdown (plain English, ≤120 words), and a push notification summary (≤140 chars).

If signal coverage is thin, downgrade confidence_score and explicitly note data limitations. Never invent prices or specific figures unless present in the evidence.`,
      `EVIDENCE — last 24h classified signals:\n${signalText || "(no recent signals available — produce commentary noting data sparsity)"}\n\nProduce the commentary.`,
      {
        type: "function",
        function: {
          name: "generate_market_commentary",
          description: "Structured daily institutional market commentary",
          parameters: {
            type: "object",
            properties: {
              headline: { type: "string", description: "Bloomberg-style 60-90 char headline" },
              executive_summary: { type: "string", description: "3-5 sentence executive summary" },
              mobile_summary: { type: "string", description: "≤40 word mobile summary" },
              analyst_commentary: { type: "string", description: "Multi-paragraph institutional analyst commentary in markdown" },
              retail_breakdown: { type: "string", description: "≤120 word plain-English retail explanation" },
              push_summary: { type: "string", description: "≤140 char push notification text" },
              sections: {
                type: "object",
                properties: {
                  indices: { type: "string" },
                  interest_rates: { type: "string" },
                  inflation: { type: "string" },
                  central_banks: { type: "string" },
                  commodities: { type: "string" },
                  crypto: { type: "string" },
                  geopolitics: { type: "string" },
                  sector_rotation: { type: "string" },
                  earnings_sentiment: { type: "string" },
                },
                required: ["indices", "interest_rates", "inflation", "central_banks", "commodities", "crypto", "geopolitics", "sector_rotation", "earnings_sentiment"],
                additionalProperties: false,
              },
              why_moved: { type: "string", description: "Why markets moved today" },
              beneficiary_sectors: { type: "string", description: "Which sectors benefited" },
              institutional_flows: { type: "string", description: "Where institutional money is flowing" },
              risks_ahead: { type: "string", description: "Major risks ahead" },
              market_implications: { type: "string", description: "Expected market implications" },
              confidence_score: { type: "integer", minimum: 0, maximum: 100 },
            },
            required: ["headline", "executive_summary", "mobile_summary", "analyst_commentary", "retail_breakdown", "push_summary", "sections", "why_moved", "beneficiary_sectors", "institutional_flows", "risks_ahead", "market_implications", "confidence_score"],
            additionalProperties: false,
          },
        },
      }
    );

    if (!result) throw new Error("AI returned empty commentary");

    const { data: inserted, error } = await sb
      .from("analyst_market_commentary")
      .insert({
        headline: result.headline,
        executive_summary: result.executive_summary,
        mobile_summary: result.mobile_summary,
        analyst_commentary: result.analyst_commentary,
        retail_breakdown: result.retail_breakdown,
        push_summary: result.push_summary,
        sections: result.sections,
        why_moved: result.why_moved,
        beneficiary_sectors: result.beneficiary_sectors,
        institutional_flows: result.institutional_flows,
        risks_ahead: result.risks_ahead,
        market_implications: result.market_implications,
        confidence_score: result.confidence_score,
        sources,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, id: inserted.id, signals_used: signals?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("market-commentary err", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
