// Pricing for scraped investment opportunities.
//
// Order of evidence, strongest first:
//   1. A price stated on the source page (any currency → GBP at ECB rates).
//   2. An AI valuation that must reason from comparable FlowPulse deals whose
//      prices came from their sources, plus well-known public norms.
//   3. The median of comparable source-priced deals in the same category.
//   4. A category benchmark (lowest confidence, clearly labelled).
// Anything not stated on the source is stored as an estimate with a range,
// a confidence and a rationale, never as a quoted price.
import { meteredFetch } from "./metered.ts";

export type PriceKind = "asking_price" | "minimum_investment" | "valuation" | "raise_target" | "unit_price" | "unknown";
export type PriceBasis = "source_stated" | "ai_comparables" | "comparable_median" | "category_benchmark";

export interface PriceResult {
  price: number;               // GBP, the figure shown
  low: number;
  high: number;
  currency: "GBP";
  kind: PriceKind;
  basis: PriceBasis;
  is_estimate: boolean;
  confidence: number;          // 0–1
  rationale: string;
  original?: string;           // as written on the source
  comparables?: string[];      // ids/titles of comparables used
  priced_at: string;
}

export interface PricingInput {
  title: string;
  description?: string | null;
  category: string;
  sub_category?: string | null;
  location?: string | null;
  source_url?: string | null;
  source_price_text?: string | null; // e.g. estimated_value / price fields from the scraper
  key_metrics?: Record<string, unknown> | null;
}

export interface Comparable { id?: string; title: string; sub_category?: string | null; location?: string | null; price: number }

// Plausible GBP bands for the headline figure per category (entry ticket to
// whole-asset prices). Used to reject implausible estimates, not to price.
export const CATEGORY_BANDS: Record<string, [number, number]> = {
  real_estate: [20_000, 50_000_000], land: [5_000, 50_000_000], rent_to_rent: [1_000, 150_000],
  rent_to_sa: [2_000, 200_000], commodities: [100, 10_000_000], alternatives: [1_000, 25_000_000],
  esg: [10, 10_000_000], fractional_pe_vc: [10, 5_000_000], private_market_platforms: [500, 25_000_000],
  capital_protected_notes: [1_000, 10_000_000], thematics_packaged: [1, 1_000_000], copy_trading: [10, 1_000_000],
  royalties: [50, 50_000_000], businesses: [5_000, 500_000_000], mini_bonds: [100, 2_000_000],
  timepieces: [300, 25_000_000], fine_wine: [30, 10_000_000], art: [100, 250_000_000], collectibles: [10, 25_000_000],
  luxury_assets: [2_000, 300_000_000], entertainment_finance: [500, 100_000_000], insurance_investments: [500, 25_000_000],
  sports_investments: [100, 2_000_000_000],
};

// Last-resort benchmarks (typical entry ticket), only when nothing better exists.
export const CATEGORY_BENCHMARK_GBP: Record<string, number> = {
  real_estate: 450_000, land: 250_000, rent_to_rent: 15_000, rent_to_sa: 25_000, commodities: 25_000,
  alternatives: 50_000, esg: 25_000, fractional_pe_vc: 25_000, private_market_platforms: 50_000,
  capital_protected_notes: 100_000, thematics_packaged: 25_000, copy_trading: 5_000, royalties: 25_000,
  businesses: 850_000, mini_bonds: 10_000, timepieces: 28_000, fine_wine: 5_000, art: 35_000,
  collectibles: 8_000, luxury_assets: 150_000, entertainment_finance: 100_000, insurance_investments: 50_000,
  sports_investments: 50_000,
};

// ── FX (ECB reference rates via Frankfurter; static fallback) ───────────────
const FX_FALLBACK: Record<string, number> = { // units of currency per 1 GBP (approx.)
  GBP: 1, USD: 1.30, EUR: 1.17, CHF: 1.10, JPY: 195, AUD: 1.98, CAD: 1.80, NZD: 2.20, SGD: 1.72, HKD: 10.1,
  AED: 4.77, SAR: 4.87, QAR: 4.73, ZAR: 23.5, NGN: 2000, KES: 168, GHS: 16, EGP: 63, MAD: 12.9, INR: 109,
  CNY: 9.3, SEK: 13.8, NOK: 14.0, DKK: 8.7, PLN: 5.05, CZK: 29.4, HUF: 470, TRY: 44, BRL: 7.2, MXN: 24.5,
};
let fxCache: { at: number; rates: Record<string, number> } | null = null;

export async function gbpRates(): Promise<Record<string, number>> {
  if (fxCache && Date.now() - fxCache.at < 6 * 3600_000) return fxCache.rates;
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 4000);
    const r = await fetch("https://api.frankfurter.app/latest?from=GBP", { signal: ctl.signal });
    clearTimeout(t);
    if (r.ok) {
      const j = await r.json();
      const rates = { ...FX_FALLBACK, ...(j?.rates ?? {}), GBP: 1 };
      fxCache = { at: Date.now(), rates };
      return rates;
    }
  } catch { /* fall back */ }
  return FX_FALLBACK;
}

const SYMBOLS: Array<[RegExp, string]> = [
  [/£|\bgbp\b|\bpounds?\b/i, "GBP"], [/€|\beur\b|\beuros?\b/i, "EUR"], [/\bus\$|\busd\b|\$(?!\s*[a-z])/i, "USD"],
  [/\bchf\b/i, "CHF"], [/¥|\bjpy\b/i, "JPY"], [/\ba\$|\baud\b/i, "AUD"], [/\bc\$|\bcad\b/i, "CAD"], [/\bs\$|\bsgd\b/i, "SGD"],
  [/\baed\b|\bdirhams?\b/i, "AED"], [/\bsar\b|\briyals?\b/i, "SAR"], [/\bzar\b|\brand\b|\bR\s?\d/, "ZAR"], [/₦|\bngn\b|\bnaira\b/i, "NGN"],
  [/\bkes\b|\bksh\b/i, "KES"], [/\bghs\b|\bcedi/i, "GHS"], [/₹|\binr\b/i, "INR"], [/\bhkd\b/i, "HKD"],
];

function detectCurrency(text: string): string | null {
  for (const [re, code] of SYMBOLS) if (re.test(text)) return code;
  return null;
}

const MULT: Record<string, number> = { k: 1e3, thousand: 1e3, m: 1e6, mn: 1e6, mm: 1e6, million: 1e6, b: 1e9, bn: 1e9, billion: 1e9 };

/** Amounts in a string, e.g. "£250k – £300,000" → [250000, 300000]. */
export function parseAmounts(text: string): number[] {
  const out: number[] = [];
  const re = /(\d{1,3}(?:[,\s]\d{3})+|\d+(?:\.\d+)?)\s*(k|thousand|mn|mm|m|million|bn|b|billion)?\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const n = parseFloat(m[1].replace(/[,\s]/g, ""));
    if (!Number.isFinite(n)) continue;
    const mult = m[2] ? MULT[m[2].toLowerCase()] ?? 1 : 1;
    const v = n * mult;
    // Skip years, percentages and tiny numbers that aren't prices.
    const after = text.slice(re.lastIndex, re.lastIndex + 2);
    if (after.startsWith("%")) continue;
    if (!m[2] && n >= 1900 && n <= 2100 && !/[£$€]/.test(text.slice(Math.max(0, m.index - 2), m.index))) continue;
    if (v < 1) continue;
    out.push(v);
  }
  return out;
}

function kindFromText(text: string): PriceKind {
  const t = text.toLowerCase();
  if (/\b(min(imum)?\.?\s*(investment|ticket|subscription)|invest from|from\s+[£$€]|starting at|entry)\b/.test(t)) return "minimum_investment";
  if (/\b(raising|raise|target|funding round|seeking)\b/.test(t)) return "raise_target";
  if (/\b(valuation|valued at|pre-money|post-money|market cap)\b/.test(t)) return "valuation";
  if (/\b(per (bottle|case|share|unit|note|token))\b/.test(t)) return "unit_price";
  if (/\b(asking|guide price|offers? (over|in excess)|for sale|price)\b/.test(t)) return "asking_price";
  return "unknown";
}

/** A price stated in the source text, converted to GBP; null if none. */
export async function parseStatedPrice(text: string | null | undefined): Promise<PriceResult | null> {
  if (!text) return null;
  const clean = String(text).slice(0, 400);
  if (/\b(n\/a|not (disclosed|stated|available)|undisclosed|poa|price on application|tbc)\b/i.test(clean)) return null;
  const ccy = detectCurrency(clean);
  if (!ccy) return null; // a bare number isn't a price
  const amounts = parseAmounts(clean);
  if (!amounts.length) return null;
  const rates = await gbpRates();
  const rate = rates[ccy] ?? FX_FALLBACK[ccy];
  if (!rate) return null;
  // Two figures form a range only when written as one ("£250k – £300k", "£1m to £2m").
  const isRange = amounts.length > 1 && /\d\s*(k|m|mn|bn|million|billion)?\s*(-|–|—|to)\s*[£$€]?\s*\d/i.test(clean);
  const gbp = (isRange ? amounts.slice(0, 2) : amounts.slice(0, 1)).map((a) => a / rate);
  const low = Math.min(...gbp), high = Math.max(...gbp);
  const mid = gbp.length > 1 ? (low + high) / 2 : low;
  return {
    price: Math.round(mid), low: Math.round(low), high: Math.round(high), currency: "GBP",
    kind: kindFromText(clean), basis: "source_stated", is_estimate: false,
    confidence: 0.95, original: clean.slice(0, 120),
    rationale: ccy === "GBP" ? "Price stated on the source." : `Price stated on the source in ${ccy}, converted at ECB reference rates.`,
    priced_at: new Date().toISOString(),
  };
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN;
};

function inBand(category: string, v: number) {
  const [lo, hi] = CATEGORY_BANDS[category] ?? [1, 5_000_000_000];
  return v >= lo && v <= hi;
}

function fallbackPrice(input: PricingInput, comps: Comparable[]): PriceResult {
  const sameSub = comps.filter((c) => input.sub_category && c.sub_category === input.sub_category);
  const pool = sameSub.length >= 3 ? sameSub : comps;
  if (pool.length >= 3) {
    const prices = pool.map((c) => c.price).sort((a, b) => a - b);
    const q = (p: number) => prices[Math.min(prices.length - 1, Math.max(0, Math.round(p * (prices.length - 1))))];
    return {
      price: Math.round(median(prices)), low: Math.round(q(0.25)), high: Math.round(q(0.75)), currency: "GBP",
      kind: "unknown", basis: "comparable_median", is_estimate: true, confidence: sameSub.length >= 3 ? 0.4 : 0.3,
      rationale: `Median of ${pool.length} comparable ${sameSub.length >= 3 ? input.sub_category : input.category.replace(/_/g, " ")} deals with source-stated prices (interquartile range shown).`,
      comparables: pool.slice(0, 8).map((c) => c.id ?? c.title), priced_at: new Date().toISOString(),
    };
  }
  const b = CATEGORY_BENCHMARK_GBP[input.category] ?? 50_000;
  return {
    price: b, low: Math.round(b * 0.4), high: Math.round(b * 2.5), currency: "GBP", kind: "unknown",
    basis: "category_benchmark", is_estimate: true, confidence: 0.15,
    rationale: "No price on the source and too few comparables; typical entry level for this asset class. Verify with the provider.",
    priced_at: new Date().toISOString(),
  };
}

const valuationTool = {
  type: "function",
  function: {
    name: "price_opportunities",
    description: "Return one valuation per opportunity.",
    parameters: {
      type: "object",
      properties: {
        valuations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              index: { type: "integer" },
              kind: { type: "string", enum: ["asking_price", "minimum_investment", "valuation", "raise_target", "unit_price", "unknown"] },
              low_gbp: { type: "number" },
              mid_gbp: { type: "number" },
              high_gbp: { type: "number" },
              confidence: { type: "number", description: "0–1. Below 0.35 means you are guessing." },
              method: { type: "string", enum: ["comparables", "platform_minimum", "unit_economics", "market_rate", "insufficient_evidence"] },
              rationale: { type: "string", description: "≤ 280 chars, cite the comparables or norms used" },
              comparables_used: { type: "array", items: { type: "integer" } },
            },
            required: ["index", "kind", "low_gbp", "mid_gbp", "high_gbp", "confidence", "method", "rationale"],
          },
        },
      },
      required: ["valuations"],
    },
  },
};

/**
 * Prices a batch of opportunities from one category. Never throws: anything
 * the AI can't price defensibly falls back to comparables or the benchmark.
 */
export async function priceOpportunities(fn: string, items: PricingInput[], comps: Comparable[]): Promise<PriceResult[]> {
  const out: Array<PriceResult | null> = await Promise.all(items.map(async (it) => {
    const metrics = it.key_metrics ? Object.entries(it.key_metrics)
      .filter(([k]) => /price|value|valuation|minimum|ticket|raise|cost|amount/i.test(k))
      .map(([k, v]) => `${k}: ${v}`).join("; ") : "";
    for (const text of [it.source_price_text, metrics]) {
      const stated = await parseStatedPrice(text);
      if (stated && inBand(it.category, stated.price)) return stated;
    }
    return null;
  }));

  const todo = items.map((it, i) => ({ it, i })).filter(({ i }) => !out[i]);
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (todo.length && key) {
    const compList = comps.slice(0, 25).map((c, j) => `${j}. ${c.title} | ${c.sub_category ?? ""} | ${c.location ?? ""} | £${Math.round(c.price).toLocaleString("en-GB")}`).join("\n");
    for (let b = 0; b < todo.length; b += 8) {
      const batch = todo.slice(b, b + 8);
      try {
        const res = await meteredFetch(fn, "https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            messages: [
              {
                role: "system",
                content: `You are a valuation analyst pricing publicly listed investment opportunities in GBP for FlowPulse.
Work like a professional valuer:
1. Decide what the headline figure means for THIS opportunity: whole-asset asking price, minimum investment, company valuation, raise target, or per-unit price.
2. Anchor on the numbered comparables (real deals with prices stated on their sources). Adjust for size, location, quality, stage and sub-category; say which you used.
3. Where comparables are thin, use well-established public norms (e.g. typical crowdfunding minimums, Liv-ex case prices, Chrono24 reference prices, regional £/sq ft, standard R2R set-up costs) only if you are confident they apply.
4. Give a realistic low/mid/high range. Widen the range when evidence is weak. Use confidence honestly: below 0.35 means insufficient evidence.
5. Never invent a specific listing price as fact. Output only through the tool.`,
              },
              {
                role: "user",
                content: `COMPARABLES (source-stated GBP prices):\n${compList || "none available"}\n\nOPPORTUNITIES TO PRICE:\n${batch.map(({ it }, k) =>
                  `#${k} [${it.category}${it.sub_category ? ` / ${it.sub_category}` : ""}] ${it.title}\nLocation: ${it.location || "unknown"}\n${(it.description || "").slice(0, 500)}${it.key_metrics ? `\nMetrics: ${JSON.stringify(it.key_metrics).slice(0, 400)}` : ""}`).join("\n\n")}`,
              },
            ],
            tools: [valuationTool],
            tool_choice: { type: "function", function: { name: "price_opportunities" } },
          }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
        const vals = (JSON.parse(args ?? "{}").valuations ?? []) as any[];
        for (const v of vals) {
          const slot = batch[Number(v.index)];
          if (!slot) continue;
          const mid = Number(v.mid_gbp), lo = Number(v.low_gbp), hi = Number(v.high_gbp), conf = Number(v.confidence);
          if (![mid, lo, hi, conf].every(Number.isFinite) || v.method === "insufficient_evidence" || conf < 0.35) continue;
          if (!inBand(slot.it.category, mid)) continue;
          const low = Math.min(lo, mid), high = Math.max(hi, mid);
          if (high / Math.max(low, 1) > 20) continue; // a range that wide isn't a price
          out[slot.i] = {
            price: Math.round(mid), low: Math.round(low), high: Math.round(high), currency: "GBP",
            kind: v.kind ?? "unknown", basis: "ai_comparables", is_estimate: true, confidence: Math.min(0.85, conf),
            rationale: String(v.rationale ?? "").slice(0, 300),
            comparables: (v.comparables_used ?? []).map((n: number) => comps[n]?.id ?? comps[n]?.title).filter(Boolean),
            priced_at: new Date().toISOString(),
          };
        }
      } catch (e) {
        console.warn("[pricing] AI valuation failed", e);
      }
    }
  }

  return out.map((r, i) => r ?? fallbackPrice(items[i], comps));
}

/** Source-priced comparables already on FlowPulse for a category. */
export async function loadComparables(sb: any, category: string, limit = 60): Promise<Comparable[]> {
  const { data } = await sb.from("opportunity_products")
    .select("id,title,sub_category,location,price,product_details")
    .eq("category", category).gt("price", 0).order("created_at", { ascending: false }).limit(limit * 3);
  return ((data ?? []) as any[])
    .filter((r) => {
      const d = r.product_details ?? {};
      const basis = d.price_basis ?? d.price_estimate_basis;
      return basis === "source_stated" || basis === "source_extracted";
    })
    .slice(0, limit)
    .map((r) => ({ id: r.id, title: r.title, sub_category: r.sub_category, location: r.location, price: Number(r.price) }));
}

/** Fields stored in enriched_payload / product_details. */
export function pricingFields(p: PriceResult) {
  return {
    price: p.price, price_currency: "GBP", currency: "GBP",
    price_low: p.low, price_high: p.high, price_kind: p.kind,
    price_basis: p.basis, price_estimate_basis: p.basis, price_is_estimated: p.is_estimate,
    price_confidence: Math.round(p.confidence * 100) / 100, price_rationale: p.rationale,
    price_original: p.original ?? null, price_comparables: p.comparables ?? [], priced_at: p.priced_at,
  };
}
