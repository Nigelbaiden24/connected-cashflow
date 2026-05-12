import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_AI_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SEGMENTS = [
  "growth_investor",
  "dividend_investor",
  "etf_investor",
  "risk_on_trader",
  "long_term_holder",
  "income_focused",
];

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
  const d = await res.json();
  return JSON.parse(d.choices[0].message.content);
}

async function safeFetch(promise: Promise<any>) {
  try { const r = await promise; return r.data || []; } catch { return []; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const body = await req.json().catch(() => ({}));
    const targetUserId: string | undefined = body?.user_id;

    // Pull active investor users (cap 50 per run if no specific user)
    let userQuery = supabase.from("user_profiles").select("user_id,email,full_name,created_at").limit(50);
    if (targetUserId) userQuery = supabase.from("user_profiles").select("user_id,email,full_name,created_at").eq("user_id", targetUserId);
    const users = await safeFetch(userQuery);

    if (!users.length) {
      return new Response(JSON.stringify({ ok: true, processed: 0, note: "No users to segment." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const u of users) {
      const uid = u.user_id;

      // Behavioural signals
      const [watchlists, contacts, plans, settings] = await Promise.all([
        safeFetch(supabase.from("opportunity_products").select("title,category,sub_category,analyst_rating,price").limit(20)),
        safeFetch(supabase.from("crm_contacts").select("id").eq("user_id", uid).limit(5)),
        safeFetch(supabase.from("financial_plans").select("id,risk_profile,goal").eq("created_by", uid).limit(10)),
        safeFetch(supabase.from("user_settings").select("*").eq("user_id", uid).limit(1)),
      ]);

      const ctx = {
        user: { email: u.email, joined: u.created_at },
        engagement: {
          contacts_count: contacts.length,
          plans_count: plans.length,
          plan_risk_profiles: plans.map((p: any) => p.risk_profile).filter(Boolean),
          plan_goals: plans.map((p: any) => p.goal).filter(Boolean),
        },
        sample_universe: watchlists.slice(0, 10),
      };

      const system = `You are FlowPulse's behavioural investor profiler. Classify each user into one primary segment and up to 2 secondary segments from: ${SEGMENTS.join(", ")}. Generate personalized recommendations. Output strict JSON only. Use 0-5 scoring. Downgrade segment_confidence when behavioural data is sparse.`;

      const userPrompt = `Profile this user. Return JSON:
{
  "primary_segment": "one of [${SEGMENTS.join(", ")}]",
  "secondary_segments": ["..."],
  "segment_confidence": 0-5,
  "behavioural_signals": {"engagement_level":"low|medium|high","time_horizon_pref":"","preferred_categories":[],"risk_signals":[]},
  "risk_tolerance": "conservative|moderate|aggressive|speculative",
  "engagement_score": 0-5,
  "recommended_assets": [{"name":"","ticker":"","type":"equity|etf|fund|crypto|bond","rationale":""}],
  "recommended_portfolios": [{"name":"","allocation_note":"","fit_reason":""}],
  "recommended_content": [{"title":"","type":"article|video|webinar|guide","topic":""}],
  "recommended_alerts": [{"trigger":"","reason":""}],
  "recommended_watchlists": [{"name":"","theme":"","tickers":[]}],
  "summary": "2-3 sentence personality + recommendation summary"
}

Context:\n${JSON.stringify(ctx).slice(0, 8000)}`;

      try {
        const ai = await callAI(system, userPrompt);
        const row = {
          target_user_id: uid,
          primary_segment: SEGMENTS.includes(ai.primary_segment) ? ai.primary_segment : "long_term_holder",
          secondary_segments: Array.isArray(ai.secondary_segments) ? ai.secondary_segments.filter((s: string) => SEGMENTS.includes(s)) : [],
          segment_confidence: Math.max(0, Math.min(5, Number(ai.segment_confidence) || 3)),
          behavioural_signals: ai.behavioural_signals || {},
          risk_tolerance: ai.risk_tolerance || "moderate",
          engagement_score: Math.max(0, Math.min(5, Number(ai.engagement_score) || 0)),
          recommended_assets: ai.recommended_assets || [],
          recommended_portfolios: ai.recommended_portfolios || [],
          recommended_content: ai.recommended_content || [],
          recommended_alerts: ai.recommended_alerts || [],
          recommended_watchlists: ai.recommended_watchlists || [],
          summary: ai.summary || null,
          status: "active",
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("investor_segments")
          .upsert(row, { onConflict: "target_user_id" })
          .select()
          .single();
        if (error) throw error;
        results.push(data);
      } catch (e) {
        console.error("segment user failed", uid, e);
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, segments: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("investor-segments error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
