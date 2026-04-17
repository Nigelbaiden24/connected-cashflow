// Intel Validate – AI structuring & deduplication
// Takes recent intel_events with status='new', uses Lovable AI Gateway
// (tool-calling) to extract structured funding data, fuzzy-matches to
// intel_companies, and promotes events to status='validated'.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const extractTool = {
  type: "function",
  function: {
    name: "extract_funding_event",
    description: "Extract structured funding/deal data from a news article snippet.",
    parameters: {
      type: "object",
      properties: {
        is_funding_event: { type: "boolean", description: "True only if this clearly describes a funding round, acquisition, or material company event." },
        company_name: { type: "string" },
        company_country: { type: "string", description: "ISO country (e.g. UK, US) if known" },
        sector: { type: "string" },
        event_type: { type: "string", enum: ["funding_round", "acquisition", "ipo", "hiring_spike", "filing", "other"] },
        funding_stage: { type: "string", description: "e.g. Seed, Series A, Series B" },
        amount_value: { type: "number" },
        amount_currency: { type: "string", description: "ISO 4217 (USD, GBP, EUR)" },
        event_date: { type: "string", description: "YYYY-MM-DD if extractable" },
        investors: { type: "array", items: { type: "string" } },
        summary: { type: "string", description: "1-2 sentence neutral summary" },
        confidence: { type: "number", description: "0..1 — how confident this extraction is" },
      },
      required: ["is_funding_event", "confidence"],
    },
  },
};

function normalize(name: string): string {
  return name.toLowerCase().replace(/\b(ltd|limited|inc|llc|plc|corp|corporation|co)\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const limit: number = body.limit ?? 10;

    const { data: events, error } = await supabase
      .from("intel_events")
      .select("*")
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const processed: any[] = [];

    for (const ev of events ?? []) {
      const articleText = [
        ev.title,
        ev.summary,
        ev.raw_data?.hit?.markdown?.slice(0, 2500),
      ].filter(Boolean).join("\n\n");

      const aiRes = await fetch(AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You extract structured funding/deal events from news articles. Be conservative — set is_funding_event=false if uncertain." },
            { role: "user", content: articleText },
          ],
          tools: [extractTool],
          tool_choice: { type: "function", function: { name: "extract_funding_event" } },
        }),
      });

      if (aiRes.status === 429 || aiRes.status === 402) {
        console.warn("AI gateway limit hit, stopping batch");
        break;
      }

      const aiJson = await aiRes.json();
      const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        await supabase.from("intel_events").update({ status: "rejected", structured_data: { reason: "no_tool_call" } }).eq("id", ev.id);
        continue;
      }

      let parsed: any = {};
      try {
        parsed = JSON.parse(toolCall.function.arguments);
      } catch {
        await supabase.from("intel_events").update({ status: "rejected" }).eq("id", ev.id);
        continue;
      }

      if (!parsed.is_funding_event || (parsed.confidence ?? 0) < 0.4) {
        await supabase.from("intel_events").update({ status: "rejected", structured_data: parsed }).eq("id", ev.id);
        continue;
      }

      // Resolve / create company via fuzzy match
      let companyId: string | null = null;
      if (parsed.company_name) {
        const norm = normalize(parsed.company_name);
        const { data: existing } = await supabase
          .from("intel_companies")
          .select("id")
          .eq("normalized_name", norm)
          .maybeSingle();
        if (existing) {
          companyId = existing.id;
          await supabase.from("intel_companies").update({
            last_seen_at: new Date().toISOString(),
            sector: parsed.sector ?? undefined,
          }).eq("id", existing.id);
        } else {
          const { data: created } = await supabase.from("intel_companies").insert({
            name: parsed.company_name,
            normalized_name: norm,
            country: parsed.company_country ?? null,
            sector: parsed.sector ?? null,
            confidence_score: parsed.confidence,
          }).select("id").single();
          companyId = created?.id ?? null;
        }
      }

      await supabase.from("intel_events").update({
        company_id: companyId,
        event_type: parsed.event_type ?? ev.event_type,
        event_subtype: parsed.funding_stage ?? null,
        event_date: parsed.event_date ?? null,
        summary: parsed.summary ?? ev.summary,
        amount_value: parsed.amount_value ?? null,
        amount_currency: parsed.amount_currency ?? null,
        funding_stage: parsed.funding_stage ?? null,
        confidence: parsed.confidence > 0.75 ? "high" : parsed.confidence > 0.5 ? "medium" : "low",
        confidence_score: parsed.confidence,
        structured_data: parsed,
        status: "validated",
        updated_at: new Date().toISOString(),
      }).eq("id", ev.id);

      // High-signal alert
      if ((parsed.confidence ?? 0) >= 0.75 && parsed.amount_value) {
        await supabase.from("intel_alerts").insert({
          alert_type: "funding_round",
          severity: parsed.amount_value >= 10_000_000 ? "high" : "medium",
          title: `${parsed.company_name} – ${parsed.funding_stage ?? "funding"} ${parsed.amount_value.toLocaleString()} ${parsed.amount_currency ?? ""}`.trim(),
          description: parsed.summary,
          company_id: companyId,
          event_id: ev.id,
          status: "new",
        });
      }

      processed.push({ id: ev.id, company: parsed.company_name, confidence: parsed.confidence });
    }

    return new Response(
      JSON.stringify({ success: true, processed: processed.length, results: processed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("intel-validate error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
