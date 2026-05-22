// Runs due research scraper schedules. Triggered every 15 minutes by pg_cron.
// Supports two modes:
//  - manual schedule: topic provided by admin, generates one report per run
//  - AI autopilot:    topic === "__AUTOPILOT__" — Lovable AI picks 3 trending
//                     topics for the asset_type and drafts a report for each
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { runGeneration } from "../_shared/researchReportGenerator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AUTOPILOT_TOKEN = "__AUTOPILOT__";

interface AutopilotTopic {
  topic: string;
  ticker?: string;
}

async function pickAutopilotTopics(
  assetType: "stock" | "crypto",
  count: number,
  admin: ReturnType<typeof createClient>,
): Promise<AutopilotTopic[]> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    // Sensible fallback so autopilot still runs without AI
    return assetType === "crypto"
      ? [{ topic: "Bitcoin macro outlook", ticker: "BTC" }, { topic: "Ethereum L2 ecosystem", ticker: "ETH" }, { topic: "Solana DeFi growth", ticker: "SOL" }].slice(0, count)
      : [{ topic: "NVIDIA AI infrastructure thesis", ticker: "NVDA" }, { topic: "Apple services growth", ticker: "AAPL" }, { topic: "S&P 500 earnings momentum", ticker: "SPY" }].slice(0, count);
  }

  // Avoid duplicating very recent topics
  const { data: recent } = await admin
    .from("generated_research_reports")
    .select("title")
    .eq("asset_type", assetType)
    .order("created_at", { ascending: false })
    .limit(20);
  const recentTitles = (recent ?? []).map((r: any) => r.title).join("\n");

  const sys = `You are the head of research for an elite institutional ${assetType === "crypto" ? "digital-asset" : "equity"} desk. Pick the ${count} most timely, high-conviction research topics to publish today. Avoid topics already covered recently. Today is ${new Date().toISOString().slice(0,10)}.`;
  const user = `Recently covered (avoid repeating):\n${recentTitles || "(none)"}\n\nReturn ONLY valid JSON of the form {"topics":[{"topic":"...","ticker":"..."}]} with ${count} entries. Each topic must be a concrete, scrape-worthy research angle (company thesis, sector catalyst, macro pivot, on-chain trend, etc.), not a generic theme. Ticker optional.`;

  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) throw new Error(`AI gateway ${r.status}`);
    const d = await r.json();
    const raw = d?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed?.topics) ? parsed.topics : [];
    return list
      .filter((x: any) => x?.topic && typeof x.topic === "string")
      .slice(0, count)
      .map((x: any) => ({ topic: String(x.topic).slice(0, 240), ticker: x.ticker ? String(x.ticker).slice(0, 16) : undefined }));
  } catch (e) {
    console.error("autopilot topic pick failed:", e);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Allow forcing a specific schedule to run via { scheduleId }
    let body: any = {};
    try { body = await req.json(); } catch (_) { /* no body */ }
    const forcedId: string | undefined = body?.scheduleId;

    const q = admin
      .from("research_scraper_schedules")
      .select("*")
      .eq("enabled", true);
    const { data: due, error } = forcedId
      ? await q.eq("id", forcedId).limit(1)
      : await q.lte("next_run_at", new Date().toISOString()).limit(10);
    if (error) throw error;
    const items = due ?? [];

    // Long-running work: process in background so the HTTP caller doesn't time out.
    // pg_cron triggers don't care about the response body either.
    const processAll = async () => {
      for (const s of items) {
        const startedAt = new Date();
        try {
          const isAutopilot = (s.topic || "").startsWith(AUTOPILOT_TOKEN);
          if (isAutopilot) {
            const m = (s.topic as string).match(/__AUTOPILOT__(?::(\d+))?/);
            const count = Math.min(5, Math.max(1, Number(m?.[1]) || 3));
            const picks = await pickAutopilotTopics(s.asset_type, count, admin);
            for (const p of picks) {
              try {
                await runGeneration({
                  assetType: s.asset_type,
                  topic: p.topic,
                  ticker: p.ticker ?? "",
                  extraUrls: s.extra_urls ?? [],
                  createdBy: s.created_by,
                  admin,
                });
              } catch (inner) {
                console.error(`[autopilot] topic "${p.topic}" failed:`, (inner as Error).message);
              }
            }
            await admin.from("research_scraper_schedules").update({
              last_run_at: startedAt.toISOString(),
              last_run_status: "success",
              last_run_error: null,
              next_run_at: new Date(Date.now() + s.frequency_hours * 3600 * 1000).toISOString(),
            }).eq("id", s.id);
          } else {
            await runGeneration({
              assetType: s.asset_type,
              topic: s.topic,
              ticker: s.ticker ?? "",
              extraUrls: s.extra_urls ?? [],
              createdBy: s.created_by,
              admin,
            });
            await admin.from("research_scraper_schedules").update({
              last_run_at: startedAt.toISOString(),
              last_run_status: "success",
              last_run_error: null,
              next_run_at: new Date(Date.now() + s.frequency_hours * 3600 * 1000).toISOString(),
            }).eq("id", s.id);
          }
        } catch (e) {
          console.error(`[schedule ${s.id}] failed:`, (e as Error).message);
          await admin.from("research_scraper_schedules").update({
            last_run_at: startedAt.toISOString(),
            last_run_status: "error",
            last_run_error: (e as Error).message.slice(0, 500),
            next_run_at: new Date(Date.now() + s.frequency_hours * 3600 * 1000).toISOString(),
          }).eq("id", s.id);
        }
      }
    };

    // @ts-ignore EdgeRuntime is provided by Supabase edge runtime
    if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any)?.waitUntil) {
      // @ts-ignore
      (EdgeRuntime as any).waitUntil(processAll());
    } else {
      processAll().catch((e) => console.error("processAll error:", e));
    }

    return new Response(
      JSON.stringify({ success: true, accepted: items.length, message: "Autopilot started in background. New draft reports will appear in a minute or two." }),
      { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("run-research-scraper-schedules error:", e);
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
