// Re-prices live Opportunity Intelligence deals whose price did not come from
// their source (flat category benchmarks or missing prices). Admin only.
// Body: { category?: string, limit?: number (≤ 60), dry_run?: boolean }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { requireAdmin } from "../_shared/guard.ts";
import { loadComparables, priceOpportunities, pricingFields } from "../_shared/opportunityPricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const isSourcePriced = (d: any) => {
  const basis = d?.price_basis ?? d?.price_estimate_basis;
  return basis === "source_stated" || basis === "source_extracted";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const denied = await requireAdmin(req, corsHeaders);
  if (denied) return denied;

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit) || 30, 1), 60);
    const dryRun = body.dry_run === true;
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    let q = sb.from("opportunity_products")
      .select("id,title,category,sub_category,location,price,short_description,full_description,product_details,valuation,minimum_investment")
      .in("status", ["active", "draft"]).order("created_at", { ascending: false }).limit(800);
    if (typeof body.category === "string" && body.category) q = q.eq("category", body.category);
    const { data, error } = await q;
    if (error) throw error;

    // Not source-priced, and not already re-priced in the last 7 days.
    const weekAgo = Date.now() - 7 * 86_400_000;
    const todo = (data ?? []).filter((r: any) => {
      const d = r.product_details ?? {};
      if (isSourcePriced(d)) return false;
      if (d.priced_at && new Date(d.priced_at).getTime() > weekAgo && d.price_basis !== "category_benchmark") return false;
      return true;
    });
    const remainingBefore = todo.length;
    const batch = todo.slice(0, limit);

    const byCat = new Map<string, any[]>();
    batch.forEach((r: any) => byCat.set(r.category, [...(byCat.get(r.category) ?? []), r]));

    const results: any[] = [];
    for (const [cat, rows] of byCat) {
      const comps = await loadComparables(sb, cat);
      const priced = await priceOpportunities("opportunity-reprice", rows.map((r: any) => {
        const d = r.product_details ?? {};
        return {
          title: r.title, description: r.full_description ?? r.short_description, category: cat,
          sub_category: r.sub_category, location: r.location, source_url: d.source_url ?? null,
          source_price_text: [d.price_original, d.estimated_value, d.asking_price, d.minimum_investment, r.valuation, r.minimum_investment]
            .filter((v: unknown) => v !== undefined && v !== null && v !== "").join(" | ") || null,
          key_metrics: d.key_metrics ?? null,
        };
      }), comps);

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i], p = priced[i];
        results.push({ id: r.id, title: r.title, category: cat, old_price: r.price, new_price: p.price, basis: p.basis, confidence: p.confidence });
        if (dryRun) continue;
        const { error: upErr } = await sb.from("opportunity_products").update({
          price: p.price, price_currency: "GBP",
          product_details: { ...(r.product_details ?? {}), ...pricingFields(p) },
          updated_at: new Date().toISOString(),
        }).eq("id", r.id);
        if (upErr) results[results.length - 1].error = upErr.message;
      }
    }

    const summary = results.reduce((a: Record<string, number>, r) => ({ ...a, [r.basis]: (a[r.basis] ?? 0) + 1 }), {});
    return json({ ok: true, dry_run: dryRun, processed: results.length, remaining: Math.max(0, remainingBefore - results.length), by_basis: summary, results });
  } catch (e) {
    console.error("opportunity-reprice error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});
