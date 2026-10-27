// Drafts an analyst portfolio review (admin only). The draft is saved to
// portfolio_review_drafts for the analyst to edit; the client never sees it
// until the analyst delivers the review.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { meteredFetch } from "../_shared/metered.ts";
import { identify } from "../_shared/guard.ts";
import { type Holding, REVIEW_SECTIONS, analysePortfolio } from "../_shared/portfolioAnalytics.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const draftTool = {
  type: "function",
  function: {
    name: "draft_review",
    description: "Return the draft portfolio review.",
    parameters: {
      type: "object",
      properties: {
        headline: { type: "string", description: "One-line verdict, max 110 characters" },
        summary: { type: "string", description: "Executive summary, 120–200 words, plain English" },
        overall_rating: { type: "string", enum: ["Well aligned", "Broadly aligned", "Needs attention", "Misaligned"] },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              key: { type: "string", enum: REVIEW_SECTIONS.map((s) => s.key) },
              body: { type: "string", description: "Markdown, 150–350 words, may use bullet lists and short tables" },
            },
            required: ["key", "body"],
          },
        },
        considerations: {
          type: "array",
          description: "3–6 points for the client to consider, most important first",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              detail: { type: "string", description: "2–3 sentences" },
              priority: { type: "string", enum: ["high", "medium", "low"] },
            },
            required: ["title", "detail", "priority"],
          },
        },
        analyst_notes: { type: "string", description: "Internal notes for the analyst: data gaps, things to verify before delivery" },
      },
      required: ["headline", "summary", "overall_rating", "sections", "considerations"],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const caller = await identify(req);
  if (caller.kind !== "admin") return json({ error: "Admin access required" }, caller.kind === "user" ? 403 : 401);

  try {
    const { request_id } = await req.json().catch(() => ({}));
    if (!request_id) return json({ error: "request_id is required" }, 400);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: request, error } = await sb.from("portfolio_review_requests").select("*").eq("id", request_id).single();
    if (error || !request) return json({ error: "Review request not found" }, 404);

    // Fill missing sector / asset class from FlowPulse's stocks & crypto data.
    const holdings: Holding[] = Array.isArray(request.holdings) ? request.holdings : [];
    const symbols = [...new Set(holdings.map((h) => h.symbol).filter(Boolean))] as string[];
    const known = new Map<string, any>();
    if (symbols.length) {
      const { data } = await sb.from("stocks_crypto")
        .select("symbol,name,sector,industry,asset_type,overall_score,analyst_rating,price_change_1y,dividend_yield,pe_ratio,risks")
        .in("symbol", symbols.slice(0, 200));
      for (const d of data ?? []) known.set(String(d.symbol).toUpperCase(), d);
    }
    const enriched = holdings.map((h) => {
      const k = h.symbol ? known.get(h.symbol.toUpperCase()) : null;
      if (!k) return h;
      return {
        ...h,
        sector: h.sector || k.sector || k.industry || undefined,
        asset_class: h.asset_class || (k.asset_type === "crypto" ? "Crypto" : k.asset_type === "stock" ? "Equity" : k.asset_type) || undefined,
      };
    });
    const analytics = analysePortfolio(enriched);

    const coverage = analytics.positions.slice(0, 40).map((p) => {
      const k = p.symbol ? known.get(p.symbol.toUpperCase()) : null;
      return {
        name: p.name, symbol: p.symbol, weight_pct: +(p.weight * 100).toFixed(2), value: Math.round(p.value),
        currency: p.currency, asset_class: p.asset_class, sector: p.sector, region: p.region,
        flowpulse_data: k ? {
          score: k.overall_score, rating: k.analyst_rating, change_1y_pct: k.price_change_1y,
          dividend_yield: k.dividend_yield, pe: k.pe_ratio,
        } : null,
      };
    });

    const system = `You are a senior portfolio analyst at FlowPulse, a UK investment research firm, drafting a bespoke portfolio review that a human analyst will check, edit and sign before it reaches the client (an enterprise subscriber).

Standards:
- Write for an intelligent, busy investor: clear British English, specific, no jargon without explanation, no hype.
- Ground every statement in the client's stated objectives, the holdings data and the computed analytics provided. FlowPulse data is included for some holdings; use it where present and say when data is missing.
- Never invent prices, returns, fees, yields or ratings. If something (e.g. fund charges) is not in the data, say it should be checked rather than guessing, and list it in analyst_notes.
- This is general research, not a personal recommendation: describe what to consider ("you may wish to review…", "worth considering…"), never instruct ("sell X", "buy Y"), and never guarantee outcomes.
- Be balanced: note genuine strengths as well as risks.
Write one section per key: ${REVIEW_SECTIONS.map((s) => `${s.key} = ${s.title} (${s.hint})`).join("; ")}.`;

    const user = `CLIENT BRIEF
Objectives: ${request.objectives || "not stated"}
Risk profile: ${request.risk_profile || "not stated"}
Time horizon: ${request.time_horizon || "not stated"}
Income need: ${request.income_need || "not stated"}
Constraints / preferences: ${request.constraints || "none stated"}
Base currency: ${request.base_currency || "GBP"}

COMPUTED ANALYTICS
Total value: ${Math.round(analytics.total_value).toLocaleString("en-GB")} (${request.base_currency || "GBP"}; mixed currencies may not be converted)
Holdings: ${analytics.holdings_count}; effective number of holdings ${analytics.effective_holdings.toFixed(1)}; top 5 = ${(analytics.top5_weight * 100).toFixed(1)}%, top 10 = ${(analytics.top10_weight * 100).toFixed(1)}%
Asset classes: ${analytics.by_asset_class.map((b) => `${b.label} ${(b.weight * 100).toFixed(1)}%`).join(", ")}
Sectors: ${analytics.by_sector.slice(0, 10).map((b) => `${b.label} ${(b.weight * 100).toFixed(1)}%`).join(", ")}
Regions: ${analytics.by_region.map((b) => `${b.label} ${(b.weight * 100).toFixed(1)}%`).join(", ")}
Currencies: ${analytics.by_currency.map((b) => `${b.label} ${(b.weight * 100).toFixed(1)}%`).join(", ")}
Automatic flags: ${analytics.flags.join(" | ") || "none"}

HOLDINGS (largest first, up to 40)
${JSON.stringify(coverage)}`;

    const res = await meteredFetch("portfolio-review-ai", "https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        tools: [draftTool],
        tool_choice: { type: "function", function: { name: "draft_review" } },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return json({ error: res.status === 402 ? "AI budget or credits exhausted — see Admin › AI Usage." : `AI error ${res.status}: ${t.slice(0, 200)}` }, 502);
    }
    const data = await res.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let draft: any = null;
    try { draft = args ? JSON.parse(args) : null; } catch { draft = null; }
    if (!draft?.sections?.length) return json({ error: "The AI did not return a usable draft; try again." }, 502);

    // Normalise section order/titles to the house structure.
    const byKey = new Map((draft.sections as any[]).map((s) => [s.key, String(s.body ?? "")]));
    draft.sections = REVIEW_SECTIONS.map((s) => ({ key: s.key, title: s.title, body: byKey.get(s.key) ?? "" }));

    const { data: existing } = await sb.from("portfolio_review_drafts").select("working").eq("request_id", request_id).maybeSingle();
    const { error: upErr } = await sb.from("portfolio_review_drafts").upsert({
      request_id,
      analytics,
      ai_draft: draft,
      // Only seed the working copy if the analyst hasn't started editing.
      working: existing?.working ?? {
        headline: draft.headline, summary: draft.summary, overall_rating: draft.overall_rating,
        sections: draft.sections, considerations: draft.considerations ?? [],
      },
      internal_notes: draft.analyst_notes ?? null,
      updated_by: caller.userId,
      updated_at: new Date().toISOString(),
    });
    if (upErr) throw upErr;

    if (request.status === "submitted") {
      await sb.from("portfolio_review_requests").update({ status: "in_review", assigned_to: request.assigned_to ?? caller.userId, updated_at: new Date().toISOString() }).eq("id", request_id);
    }
    return json({ ok: true, draft, analytics, kept_working_copy: !!existing?.working });
  } catch (e) {
    console.error("portfolio-review-ai error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});
