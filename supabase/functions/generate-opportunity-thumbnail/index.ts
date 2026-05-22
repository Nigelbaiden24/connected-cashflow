// Generates a bespoke 16:9 thumbnail for a pipeline_pending_items row using
// Lovable AI (google/gemini-2.5-flash-image), uploads it to the public `reports`
// storage bucket under `opportunity-thumbnails/`, and patches the row's
// enriched_payload.generated_thumbnail_url so the subsequent approve_pending_item
// RPC picks it up. Admin-only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const clean = (s: unknown, max = 240) =>
  String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

const decodeDataUrl = (url: string): { bytes: Uint8Array; ext: string; mime: string } | null => {
  const m = url.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!m) return null;
  const mime = m[1].toLowerCase();
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "png";
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, ext, mime };
};

function buildPrompt(opts: {
  title: string;
  summary?: string;
  category?: string;
  subCategory?: string;
  location?: string;
  industry?: string;
  tags?: string[];
}) {
  const tagText = (opts.tags ?? []).slice(0, 6).map(clean).filter(Boolean).join(", ");
  return `Create a bespoke 16:9 editorial thumbnail image for a FlowPulse institutional investment opportunity.

Opportunity title: ${clean(opts.title, 200)}
Category: ${clean(opts.category) || "Investment"}${opts.subCategory ? ` — ${clean(opts.subCategory)}` : ""}
${opts.industry ? `Industry: ${clean(opts.industry)}\n` : ""}${opts.location ? `Location: ${clean(opts.location)}\n` : ""}${tagText ? `Key themes: ${tagText}\n` : ""}Summary: ${clean(opts.summary, 600) || "Institutional investment opportunity"}

Requirements:
- 16:9 cinematic editorial photograph composition, sharp focus, no text or logos
- Subject MUST be visually specific to this exact opportunity — feature the real subject matter (e.g. a UK terrace house for UK property, a vineyard for agriculture, a downtown skyline for commercial real estate, a server rack for data infrastructure, a specific watch reference for timepieces, a coin/token visualisation for crypto, a factory floor for industrials, an oil rig for energy, a luxury vehicle for automotive)
- High-end magazine cover quality, dramatic but tasteful lighting, professional colour grading
- Avoid generic stock-photo finance imagery (no charts, no abstract glowing graphs, no generic handshake, no stock-ticker boards)
- No people's faces, no readable text, no watermarks, no brand logos`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error: "Missing bearer token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    // Verify caller is an admin
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId } as never);
    if (!isAdmin) {
      return new Response(JSON.stringify({ ok: false, error: "Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { item_id } = await req.json().catch(() => ({}));
    if (!item_id || typeof item_id !== "string") {
      return new Response(JSON.stringify({ ok: false, error: "item_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: row, error: rowErr } = await supabase
      .from("pipeline_pending_items")
      .select("id, title, summary, category, source, ai_tags, enriched_payload, raw_payload")
      .eq("id", item_id)
      .maybeSingle();
    if (rowErr || !row) {
      return new Response(JSON.stringify({ ok: false, error: rowErr?.message ?? "Item not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const enriched = (row.enriched_payload ?? row.raw_payload ?? {}) as Record<string, unknown>;
    const prompt = buildPrompt({
      title: row.title,
      summary: row.summary ?? (enriched.description as string) ?? (enriched.thesis as string),
      category: (enriched.category as string) ?? row.category ?? undefined,
      subCategory: (enriched.sub_category as string) ?? (enriched.subcategory as string) ?? undefined,
      location: (enriched.location as string) ?? (enriched.country as string) ?? undefined,
      industry: (enriched.industry as string) ?? (enriched.sector as string) ?? undefined,
      tags: row.ai_tags ?? [],
    });

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("[generate-opportunity-thumbnail] AI error", aiRes.status, txt.slice(0, 300));
      return new Response(JSON.stringify({ ok: false, error: `AI ${aiRes.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiJson = await aiRes.json();
    const imageUrl: string | undefined = aiJson?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      return new Response(JSON.stringify({ ok: false, error: "No image returned" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const decoded = decodeDataUrl(imageUrl);
    if (!decoded) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid image data" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const slug = (row.title || "opportunity")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "opportunity";
    const filePath = `opportunity-thumbnails/${slug}-${row.id.slice(0, 8)}.${decoded.ext}`;
    const { error: upErr } = await supabase.storage
      .from("reports")
      .upload(filePath, decoded.bytes, { contentType: decoded.mime, upsert: true });
    if (upErr) {
      console.error("[generate-opportunity-thumbnail] upload error", upErr);
      return new Response(JSON.stringify({ ok: false, error: upErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: pub } = supabase.storage.from("reports").getPublicUrl(filePath);
    const publicUrl = pub.publicUrl;

    // Patch enriched_payload so approve_pending_item picks up the new thumbnail.
    const nextEnriched = {
      ...enriched,
      generated_thumbnail_url: publicUrl,
      ai_thumbnail_url: publicUrl,
      thumbnail_url: publicUrl,
      image_url: publicUrl,
    };
    const { error: patchErr } = await supabase
      .from("pipeline_pending_items")
      .update({ enriched_payload: nextEnriched as never })
      .eq("id", row.id);
    if (patchErr) {
      console.error("[generate-opportunity-thumbnail] patch error", patchErr);
      return new Response(JSON.stringify({ ok: false, error: patchErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, thumbnail_url: publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[generate-opportunity-thumbnail]", e);
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
