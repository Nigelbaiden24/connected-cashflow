// Runs due research scraper schedules. Triggered every 15 minutes by pg_cron.
//
// Two execution modes:
//  - orchestrator (default): find due schedules, advance their next_run_at
//    immediately, then fan out one child HTTP call per report. This prevents
//    one slow report from starving the whole queue or running over the
//    EdgeRuntime wall-time budget.
//  - worker ({ scheduleId, manualTopic, autopilotTopic }): generate ONE
//    report and exit. Each worker gets its own CPU budget so a long Gemini
//    call cannot kill its siblings.
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
  const fallback: AutopilotTopic[] = assetType === "crypto"
    ? [
        { topic: "Bitcoin macro outlook", ticker: "BTC" },
        { topic: "Ethereum L2 ecosystem", ticker: "ETH" },
        { topic: "Solana DeFi growth", ticker: "SOL" },
        { topic: "Small-cap AI token thesis (RNDR / FET / TAO)", ticker: "TAO" },
        { topic: "High-potential sub-$0.10 altcoin watchlist (DePIN + RWA)", ticker: "" },
        { topic: "Emerging Solana memecoin liquidity rotation", ticker: "" },
        { topic: "Micro-cap Layer-2 and modular blockchain plays", ticker: "" },
      ]
    : [
        { topic: "NVIDIA AI infrastructure thesis", ticker: "NVDA" },
        { topic: "Apple services growth", ticker: "AAPL" },
        { topic: "S&P 500 earnings momentum", ticker: "SPY" },
        { topic: "Russell 2000 small-cap rotation thesis", ticker: "IWM" },
        { topic: "High-potential US micro-cap biotech catalysts", ticker: "" },
        { topic: "Sub-$5 penny stock breakout watchlist (AI, uranium, lithium)", ticker: "" },
        { topic: "AIM / LSE small-cap UK value opportunities", ticker: "" },
      ];

  if (!apiKey) return fallback.slice(0, count);

  const { data: recent } = await admin
    .from("generated_research_reports")
    .select("title")
    .eq("asset_type", assetType)
    .order("created_at", { ascending: false })
    .limit(40);
  const recentTitles = (recent ?? []).map((r: any) => r.title).join("\n");

  const universeRule = assetType === "crypto"
    ? `Coverage MUST span the FULL digital-asset universe — not just majors. Across the ${count} picks, deliberately include a mix of: (a) mega-cap majors (BTC, ETH, SOL), (b) mid-cap L1/L2s and DeFi blue-chips, (c) small-cap and micro-cap tokens (sub-$500M market cap), (d) low-priced high-potential altcoins (sub-$0.10), (e) emerging narratives like DePIN, RWA, AI agents, restaking, Bitcoin L2s, memecoins with on-chain momentum, and brand-new launches on Solana / Base / Hyperliquid. Lesser-known, under-covered tokens are PREFERRED over repeating majors.`
    : `Coverage MUST span the FULL equity universe — not just mega-caps. Across the ${count} picks, deliberately include a mix of: (a) mega-cap leaders, (b) mid-caps with catalysts, (c) small-caps and micro-caps (sub-$2B), (d) penny stocks and sub-$5 high-potential names with concrete catalysts (clinical readouts, contract wins, short squeezes, breakouts), (e) under-followed AIM / LSE / TSX / Nasdaq small-caps, (f) emerging-sector plays (AI infra, uranium, lithium, defense, quantum, fusion, robotics, gene-editing). Lesser-known, under-covered tickers are PREFERRED over repeating mega-caps.`;

  const sys = `You are the head of research for an elite institutional ${assetType === "crypto" ? "digital-asset" : "equity"} desk that publishes BOTH blue-chip coverage AND high-alpha discovery research on overlooked, low-valuation, high-potential names. Pick the ${count} most timely, high-conviction research topics to publish today. Avoid topics already covered recently. Today is ${new Date().toISOString().slice(0,10)}.\n\n${universeRule}`;
  const user = `Recently covered (avoid repeating):\n${recentTitles || "(none)"}\n\nReturn ONLY valid JSON of the form {"topics":[{"topic":"...","ticker":"..."}]} with ${count} entries. Each topic must be a concrete, scrape-worthy research angle (specific company thesis, sector catalyst, macro pivot, on-chain trend, small-cap discovery, penny-stock setup, low-cap altcoin thesis, etc.), not a generic theme. Bias the mix toward under-covered, low-value, high-potential names per the coverage rule. Ticker optional but include it whenever the topic targets a specific instrument.`;

  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 25_000);
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        response_format: { type: "json_object" },
      }),
      signal: ctl.signal,
    });
    clearTimeout(t);
    if (!r.ok) throw new Error(`AI gateway ${r.status}`);
    const d = await r.json();
    const raw = d?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed?.topics) ? parsed.topics : [];
    const picks = list
      .filter((x: any) => x?.topic && typeof x.topic === "string")
      .slice(0, count)
      .map((x: any) => ({
        topic: String(x.topic).slice(0, 240),
        ticker: x.ticker ? String(x.ticker).slice(0, 16) : undefined,
      }));
    return picks.length ? picks : fallback.slice(0, count);
  } catch (e) {
    console.error("autopilot topic pick failed, using fallback:", (e as Error).message);
    return fallback.slice(0, count);
  }
}

const DAILY_CAP_PER_ASSET = 10;

async function fireChild(payload: Record<string, unknown>) {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/run-research-scraper-schedules`;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  // Fire-and-forget. We intentionally do not await the response so the
  // orchestrator can return quickly. The child gets its own CPU/wall budget.
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anon}`,
      apikey: anon,
    },
    body: JSON.stringify(payload),
  }).catch((e) => console.error("child dispatch failed:", (e as Error).message));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    let body: any = {};
    try { body = await req.json(); } catch (_) { /* no body */ }

    // -------- WORKER MODE: generate ONE report and exit --------
    if (body?.scheduleId && (body?.manualTopic || body?.autopilotTopic)) {
      const { data: s, error } = await admin
        .from("research_scraper_schedules")
        .select("*")
        .eq("id", body.scheduleId)
        .maybeSingle();
      if (error || !s) throw error ?? new Error("schedule not found");

      const topic = body.autopilotTopic?.topic || body.manualTopic;
      const ticker = body.autopilotTopic?.ticker ?? s.ticker ?? "";
      console.log(`[worker ${s.id}] generating "${topic}" (${s.asset_type})`);

      // Retry up to 2 times. Niche crypto/penny-stock topics frequently get
      // a malformed-JSON response from the AI on the first try — a single
      // retry typically succeeds, which is why crypto previously trailed
      // stock in produced reports.
      const maxAttempts = 3;
      let lastErr: Error | null = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await runGeneration({
            assetType: s.asset_type,
            topic,
            ticker,
            extraUrls: s.extra_urls ?? [],
            createdBy: s.created_by,
            admin,
          });
          console.log(`[worker ${s.id}] success on attempt ${attempt}: ${topic}`);
          return new Response(JSON.stringify({ ok: true, topic, attempt }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (e) {
          lastErr = e as Error;
          console.warn(`[worker ${s.id}] attempt ${attempt}/${maxAttempts} failed: ${lastErr.message}`);
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 1500 * attempt));
          }
        }
      }
      console.error(`[worker ${s.id}] giving up after ${maxAttempts} attempts: ${lastErr?.message}`);
      await admin.from("research_scraper_schedules").update({
        last_run_status: "partial_error",
        last_run_error: `${topic}: ${lastErr?.message ?? "unknown"}`.slice(0, 500),
      }).eq("id", s.id);
      return new Response(JSON.stringify({ ok: false, error: lastErr?.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // -------- ORCHESTRATOR MODE: pick due schedules, fan out workers --------
    const forcedId: string | undefined = body?.scheduleId;
    const q = admin.from("research_scraper_schedules").select("*").eq("enabled", true);
    const { data: due, error } = forcedId
      ? await q.eq("id", forcedId).limit(1)
      : await q.lte("next_run_at", new Date().toISOString()).limit(10);
    if (error) throw error;
    const items = due ?? [];

    if (items.length === 0) {
      return new Response(JSON.stringify({ success: true, accepted: 0, message: "Nothing due." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Daily cap usage
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const todayCounts: Record<string, number> = { stock: 0, crypto: 0 };
    {
      const { data: recent } = await admin
        .from("generated_research_reports")
        .select("asset_type")
        .gte("created_at", since);
      for (const r of (recent ?? []) as any[]) {
        todayCounts[r.asset_type] = (todayCounts[r.asset_type] ?? 0) + 1;
      }
    }

    const dispatched: Array<{ scheduleId: string; topic: string }> = [];
    const now = new Date();

    for (const s of items) {
      const remaining = Math.max(0, DAILY_CAP_PER_ASSET - (todayCounts[s.asset_type] ?? 0));
      const nextRunAt = new Date(now.getTime() + (s.frequency_hours || 24) * 3600 * 1000).toISOString();

      // CRITICAL: advance schedule BEFORE heavy work so a failure can never
      // pin next_run_at in the past and freeze the queue.
      await admin.from("research_scraper_schedules").update({
        last_run_at: now.toISOString(),
        last_run_status: remaining === 0 ? "skipped_cap" : "dispatched",
        last_run_error: remaining === 0
          ? `Daily cap of ${DAILY_CAP_PER_ASSET} ${s.asset_type} reports reached`
          : null,
        next_run_at: nextRunAt,
      }).eq("id", s.id);

      if (remaining === 0) continue;

      const isAutopilot = (s.topic || "").startsWith(AUTOPILOT_TOKEN);
      if (isAutopilot) {
        const m = (s.topic as string).match(/__AUTOPILOT__(?::(\d+))?/);
        const requested = Math.min(5, Math.max(1, Number(m?.[1]) || 3));
        const count = Math.min(requested, remaining);
        let picks: AutopilotTopic[] = [];
        try {
          picks = await pickAutopilotTopics(s.asset_type, count, admin);
        } catch (e) {
          console.error(`[orchestrator ${s.id}] topic-pick failed:`, (e as Error).message);
        }
        for (const p of picks) {
          await fireChild({ scheduleId: s.id, autopilotTopic: p });
          dispatched.push({ scheduleId: s.id, topic: p.topic });
          // Tiny stagger so we don't hammer the gateway from one tick.
          await new Promise((r) => setTimeout(r, 150));
        }
      } else {
        await fireChild({ scheduleId: s.id, manualTopic: s.topic });
        dispatched.push({ scheduleId: s.id, topic: s.topic });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        accepted: items.length,
        dispatched: dispatched.length,
        items: dispatched,
        message: "Workers dispatched. Reports will appear in 1-3 minutes each.",
      }),
      { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("run-research-scraper-schedules error:", e);
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
