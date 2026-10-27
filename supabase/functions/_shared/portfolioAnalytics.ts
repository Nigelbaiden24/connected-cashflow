// Portfolio parsing and analytics for analyst portfolio reviews.
// Pure module (no Deno or browser APIs): used by the investor upload screen,
// the admin review workspace and the portfolio-review-ai edge function.

export interface Holding {
  symbol?: string;
  name: string;
  isin?: string;
  quantity?: number;
  price?: number;
  value: number;
  currency?: string;
  asset_class?: string;
  sector?: string;
  region?: string;
}

export interface ParseResult {
  holdings: Holding[];
  warnings: string[];
  weightsOnly: boolean; // file had weights but no values
}

const HEADER_ALIASES: Record<keyof Holding | "weight", string[]> = {
  symbol: ["symbol", "ticker", "code", "epic", "instrument code", "stock code"],
  name: ["name", "description", "security", "holding", "instrument", "asset", "investment", "fund", "stock", "security name", "fund name"],
  isin: ["isin", "sedol", "cusip"],
  quantity: ["quantity", "qty", "shares", "units", "holding quantity", "no of units", "number of shares", "amount held"],
  price: ["price", "unit price", "last price", "current price", "market price", "close"],
  value: ["value", "market value", "current value", "valuation", "total value", "value (gbp)", "value gbp", "mkt value", "amount", "position value"],
  currency: ["currency", "ccy"],
  asset_class: ["asset class", "asset type", "type", "class", "category"],
  sector: ["sector", "industry"],
  region: ["region", "country", "geography", "market"],
  weight: ["weight", "weight %", "% of portfolio", "allocation", "allocation %", "%", "portfolio %", "percentage"],
};

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();

/** Parses "£1,234.50", "(12.5)", "12.5%", "1 234" etc. Returns NaN when not a number. */
export function parseNumber(raw: unknown): number {
  if (typeof raw === "number") return raw;
  let s = String(raw ?? "").trim();
  if (!s) return NaN;
  const negative = /^\(.*\)$/.test(s) || /^-/.test(s);
  s = s.replace(/[()£$€¥%,\s]|GBP|USD|EUR|GBX|p$/gi, "").replace(/^-/, "");
  const multiplier = /k$/i.test(s) ? 1e3 : /m$/i.test(s) ? 1e6 : /bn?$/i.test(s) ? 1e9 : 1;
  s = s.replace(/(k|m|bn?)$/i, "");
  if (!/^\d*\.?\d+$/.test(s)) return NaN;
  const n = Number(s) * multiplier;
  return negative ? -n : n;
}

function mapHeaders(headers: string[]): Partial<Record<keyof Holding | "weight", number>> {
  const map: Partial<Record<keyof Holding | "weight", number>> = {};
  const normalized = headers.map(norm);
  // Exact matches first, then "contains", so "market value" beats "value date".
  for (const pass of ["exact", "contains"] as const) {
    for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [keyof Holding | "weight", string[]][]) {
      if (map[field] !== undefined) continue;
      const idx = normalized.findIndex((h, i) =>
        !Object.values(map).includes(i) &&
        aliases.some((a) => (pass === "exact" ? h === a : h.includes(a) && !(field === "value" && /date/.test(h)))),
      );
      if (idx >= 0) map[field] = idx;
    }
  }
  return map;
}

/** Turns spreadsheet rows (first row = headers) into holdings. */
export function parseHoldingRows(rows: unknown[][]): ParseResult {
  const warnings: string[] = [];
  const clean = rows.map((r) => (Array.isArray(r) ? r : [])).filter((r) => r.some((c) => String(c ?? "").trim() !== ""));
  if (clean.length < 2) return { holdings: [], warnings: ["The file needs a header row and at least one holding."], weightsOnly: false };

  // Some broker exports have title lines above the table: use the first row
  // that maps a name/symbol and a value/quantity/weight column.
  let headerRow = 0;
  let map = mapHeaders(clean[0].map(String));
  for (let i = 0; i < Math.min(10, clean.length - 1); i++) {
    const m = mapHeaders(clean[i].map(String));
    if ((m.name !== undefined || m.symbol !== undefined) && (m.value !== undefined || m.quantity !== undefined || m.weight !== undefined)) {
      headerRow = i; map = m; break;
    }
  }
  if (map.name === undefined && map.symbol === undefined) {
    return { holdings: [], warnings: ["Couldn't find a name or ticker column. Use headers such as Name, Ticker, Quantity, Price, Value."], weightsOnly: false };
  }

  const get = (row: unknown[], f: keyof Holding | "weight") => (map[f] === undefined ? "" : row[map[f]!]);
  const holdings: Holding[] = [];
  const weights: number[] = [];
  let skipped = 0;
  for (const row of clean.slice(headerRow + 1)) {
    const name = String(get(row, "name") || get(row, "symbol") || "").trim();
    if (!name || /^(total|sub ?total|grand total|cash total)\b/i.test(name)) continue;
    const quantity = parseNumber(get(row, "quantity"));
    const price = parseNumber(get(row, "price"));
    let value = parseNumber(get(row, "value"));
    if (!Number.isFinite(value) && Number.isFinite(quantity) && Number.isFinite(price)) value = quantity * price;
    const weight = parseNumber(get(row, "weight"));
    if (!Number.isFinite(value) && !Number.isFinite(weight)) { skipped++; continue; }
    const text = (f: keyof Holding) => String(get(row, f) ?? "").trim() || undefined;
    holdings.push({
      symbol: text("symbol")?.toUpperCase(),
      name,
      isin: text("isin")?.toUpperCase(),
      quantity: Number.isFinite(quantity) ? quantity : undefined,
      price: Number.isFinite(price) ? price : undefined,
      value: Number.isFinite(value) ? value : NaN,
      currency: text("currency")?.toUpperCase(),
      asset_class: text("asset_class"),
      sector: text("sector"),
      region: text("region"),
    });
    weights.push(Number.isFinite(weight) ? weight : NaN);
  }

  // Weights only (no values): use the weights as relative values.
  const weightsOnly = holdings.length > 0 && holdings.every((h) => !Number.isFinite(h.value));
  if (weightsOnly) holdings.forEach((h, i) => { h.value = weights[i]; });
  const usable = holdings.filter((h) => Number.isFinite(h.value) && h.value !== 0);
  if (skipped) warnings.push(`${skipped} row${skipped === 1 ? "" : "s"} skipped (no value, quantity × price or weight).`);
  if (holdings.length - usable.length) warnings.push(`${holdings.length - usable.length} row(s) without a usable value were left out.`);
  if (weightsOnly) warnings.push("The file has weights but no values; the review will work from weights only.");
  const currencies = new Set(usable.map((h) => h.currency).filter(Boolean));
  if (currencies.size > 1) warnings.push(`Values are in ${[...currencies].join(", ")}; the analyst will convert them to your base currency.`);
  return { holdings: usable, warnings, weightsOnly };
}

/** Parses pasted spreadsheet text (tab- or comma-separated). */
export function parseHoldingText(text: string): ParseResult {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim());
  const sep = lines.some((l) => l.includes("\t")) ? "\t" : ",";
  const rows = lines.map((l) => splitLine(l, sep));
  return parseHoldingRows(rows);
}

function splitLine(line: string, sep: string): string[] {
  if (sep === "\t") return line.split("\t");
  const out: string[] = [];
  let cur = "", quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (quoted && line[i + 1] === '"') { cur += '"'; i++; } else quoted = !quoted; }
    else if (c === sep && !quoted) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

// ── Analytics ──────────────────────────────────────────────────────────────
export interface Bucket { label: string; value: number; weight: number }

export interface PortfolioAnalytics {
  total_value: number;
  holdings_count: number;
  positions: Array<Holding & { weight: number }>;
  top5_weight: number;
  top10_weight: number;
  largest: { name: string; weight: number } | null;
  hhi: number;               // Herfindahl index, 0–1
  effective_holdings: number; // 1 / HHI
  by_asset_class: Bucket[];
  by_sector: Bucket[];
  by_region: Bucket[];
  by_currency: Bucket[];
  flags: string[];
}

const UNCLASSIFIED = "Unclassified";

function bucket(positions: Array<Holding & { weight: number }>, key: keyof Holding, total: number): Bucket[] {
  const m = new Map<string, number>();
  for (const p of positions) {
    const label = String(p[key] ?? "").trim() || UNCLASSIFIED;
    m.set(label, (m.get(label) ?? 0) + p.value);
  }
  return [...m.entries()]
    .map(([label, value]) => ({ label, value, weight: total ? value / total : 0 }))
    .sort((a, b) => b.value - a.value);
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function analysePortfolio(holdings: Holding[]): PortfolioAnalytics {
  const valid = holdings.filter((h) => Number.isFinite(h.value) && h.value > 0);
  const total = valid.reduce((s, h) => s + h.value, 0);
  const positions = valid
    .map((h) => ({ ...h, weight: total ? h.value / total : 0 }))
    .sort((a, b) => b.weight - a.weight);
  const hhi = positions.reduce((s, p) => s + p.weight * p.weight, 0);
  const sumTop = (n: number) => positions.slice(0, n).reduce((s, p) => s + p.weight, 0);
  const by_asset_class = bucket(positions, "asset_class", total);
  const by_sector = bucket(positions, "sector", total);
  const by_region = bucket(positions, "region", total);
  const by_currency = bucket(positions, "currency", total);

  const flags: string[] = [];
  const big = positions.filter((p) => p.weight > 0.1);
  if (big.length) flags.push(`${big.length} position${big.length === 1 ? "" : "s"} above 10% (largest ${positions[0].name}, ${pct(positions[0].weight)}).`);
  if (positions.length >= 10 && sumTop(10) > 0.6) flags.push(`Top 10 holdings make up ${pct(sumTop(10))} of the portfolio.`);
  const topSector = by_sector.find((b) => b.label !== UNCLASSIFIED);
  if (topSector && topSector.weight > 0.4) flags.push(`${topSector.label} is ${pct(topSector.weight)} of the portfolio.`);
  const crypto = by_asset_class.filter((b) => /crypto|digital/i.test(b.label)).reduce((s, b) => s + b.weight, 0);
  if (crypto > 0.1) flags.push(`Crypto exposure is ${pct(crypto)}.`);
  const unclassified = by_sector.find((b) => b.label === UNCLASSIFIED)?.weight ?? 0;
  if (unclassified > 0.25) flags.push(`${pct(unclassified)} of the portfolio has no sector data yet.`);
  if (positions.length > 0 && positions.length < 8) flags.push(`Only ${positions.length} holdings: limited diversification.`);

  return {
    total_value: total,
    holdings_count: positions.length,
    positions,
    top5_weight: sumTop(5),
    top10_weight: sumTop(10),
    largest: positions[0] ? { name: positions[0].name, weight: positions[0].weight } : null,
    hhi,
    effective_holdings: hhi > 0 ? 1 / hhi : 0,
    by_asset_class, by_sector, by_region, by_currency,
    flags,
  };
}

// ── Delivered review shape ─────────────────────────────────────────────────
export interface ReviewSection { key: string; title: string; body: string } // body is markdown

export interface PortfolioReview {
  headline: string;
  summary: string;
  overall_rating: "Well aligned" | "Broadly aligned" | "Needs attention" | "Misaligned";
  sections: ReviewSection[];
  considerations: Array<{ title: string; detail: string; priority: "high" | "medium" | "low" }>;
  analytics?: PortfolioAnalytics;
}

export const REVIEW_SECTIONS: Array<{ key: string; title: string; hint: string }> = [
  { key: "alignment", title: "Alignment with your objectives", hint: "How well the portfolio fits the stated objectives, risk profile, horizon and income need." },
  { key: "allocation", title: "Asset allocation & diversification", hint: "Asset-class, regional and currency mix; concentration and effective number of holdings." },
  { key: "holdings", title: "Holdings review", hint: "Strengths and watch-points of the largest and most material positions." },
  { key: "risk", title: "Risk assessment", hint: "Concentration, sector, currency, liquidity and drawdown risks; what could go wrong." },
  { key: "costs_income", title: "Costs & income", hint: "Fund charges where known, income yield and its sustainability, tax-wrapper notes." },
  { key: "outlook", title: "Market context", hint: "Relevant market and macro backdrop for this mix of assets." },
];

export const REVIEW_DISCLAIMER =
  "This review is general investment research prepared by a FlowPulse analyst from the information you provided. It is not a personal recommendation or regulated financial advice, and it does not take account of your full financial circumstances. Consider speaking to an authorised financial adviser before making investment decisions. The value of investments can fall as well as rise and you may get back less than you invest.";
