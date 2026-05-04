import { supabase } from "@/integrations/supabase/client";

/**
 * Stages a scraped item into `pipeline_pending_items` and immediately promotes
 * it via `approve_pending_item` — the same auto-upload flow used by the Data
 * Finder. Returns the new row id from the destination table on success.
 */
export interface AutoPromoteInput {
  source: string;                 // e.g. "financial-research"
  platform?: "finance" | "investor" | "both" | null;
  targetTable:
    | "opportunity_products"
    | "investor_finder_opportunities"
    | "opportunities"
    | "intel_events";
  title: string;
  summary?: string | null;
  category?: string | null;
  sourceUrl?: string | null;
  /** Anything from the scraper — price, images, sector, thesis, risks, etc.   */
  enriched: Record<string, unknown>;
  aiScore?: number;               // 0-5
  aiTags?: string[];
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function autoPromoteScrape(input: AutoPromoteInput): Promise<{
  ok: boolean;
  promotedId?: string;
  error?: string;
}> {
  try {
    const dedupBasis = `${input.source}::${input.sourceUrl ?? input.title.toLowerCase()}`;
    const dedup_hash = await sha256(dedupBasis);

    // Try to insert; if dedup_hash exists, fetch the existing pending row.
    let pendingId: string | null = null;
    const { data: ins, error: insErr } = await supabase
      .from("pipeline_pending_items")
      .insert({
        source: input.source,
        target_table: input.targetTable,
        target_platform: input.platform ?? null,
        dedup_hash,
        title: input.title.slice(0, 240),
        summary: input.summary ?? null,
        category: input.category ?? null,
        source_url: input.sourceUrl ?? null,
        raw_payload: input.enriched as never,
        enriched_payload: input.enriched as never,
        ai_tags: input.aiTags ?? [],
        ai_score: Math.max(0, Math.min(5, Number(input.aiScore ?? 3))),
      })
      .select("id")
      .single();

    if (insErr) {
      // Likely duplicate — fetch existing pending row
      const { data: existing } = await supabase
        .from("pipeline_pending_items")
        .select("id, status, promoted_id")
        .eq("dedup_hash", dedup_hash)
        .maybeSingle();
      if (!existing) return { ok: false, error: insErr.message };
      if (existing.status === "promoted" && existing.promoted_id) {
        return { ok: true, promotedId: existing.promoted_id };
      }
      pendingId = existing.id;
    } else {
      pendingId = ins.id;
    }

    if (!pendingId) return { ok: false, error: "No pending id" };

    const { data: rpc, error: rpcErr } = await supabase.rpc("approve_pending_item", {
      _item_id: pendingId,
      _target_table: input.targetTable,
      _platform: input.platform === "both" ? null : input.platform ?? null,
    });
    if (rpcErr) return { ok: false, error: rpcErr.message };
    const result = rpc as { ok: boolean; promoted_id?: string; error?: string } | null;
    if (!result?.ok) return { ok: false, error: result?.error ?? "Promotion failed" };
    return { ok: true, promotedId: result.promoted_id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
