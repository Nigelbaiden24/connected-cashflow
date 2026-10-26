// Builds FlowPulse Research report pages from the analyst's structured output.
// The AI writes the analysis; everything that must be exact — the summary
// page, scenario/risk/catalyst tables, the numbered sources and the
// disclosures — is assembled here from data, so it is consistent on every
// report and citations can only point at sources that were really read.
// Pure module (no Deno APIs) so it can be unit-tested with Node.

export interface ReportSource {
  url: string;
  title?: string | null;
}

export interface KeyMetric {
  label: string;
  value: string;
  source?: number | null;
  basis?: "reported" | "estimate" | "calculated";
}

export interface Scenario {
  case: "bull" | "base" | "bear";
  probability?: number | null;
  summary: string;
  drivers?: string[];
}

export interface Risk {
  risk: string;
  likelihood?: "low" | "medium" | "high";
  impact?: "low" | "medium" | "high";
  mitigant?: string;
}

export interface Catalyst {
  event: string;
  timing?: string;
  direction?: "positive" | "negative" | "uncertain";
}

export interface AnalystReport {
  title: string;
  subtitle?: string;
  excerpt: string;
  stance: "Positive" | "Neutral" | "Cautious" | "Negative";
  conviction: number;
  horizon?: string;
  key_takeaways: string[];
  key_metrics: KeyMetric[];
  sections: Array<{ title: string; html: string }>;
  scenarios?: Scenario[];
  risks?: Risk[];
  catalysts?: Catalyst[];
  data_gaps?: string[];
  tags?: string[];
}

export interface ReportMeta {
  assetType: "stock" | "crypto";
  topic: string;
  ticker?: string;
  reportDate: string; // YYYY-MM-DD
}

export interface ReportPage {
  title: string;
  html: string;
}

export function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const ALLOWED_TAGS = new Set([
  "h2", "h3", "h4", "p", "ul", "ol", "li", "blockquote", "table", "thead", "tbody", "tr", "th", "td",
  "figure", "figcaption", "div", "span", "sup", "a", "strong", "em", "b", "i", "br", "hr", "small",
]);
const ALLOWED_CLASSES = new Set(["lede", "callout", "stat-grid", "stat", "label", "value", "data-table", "note", "fact", "estimate", "inference"]);

// Allow-list sanitiser for model-written HTML. Readers sanitise again with
// DOMPurify; this keeps stored reports clean for PDF export and email.
export function sanitizeHtml(html: string): string {
  let out = String(html ?? "");
  out = out.replace(/<(script|style|iframe|object|embed|link|meta|form|input|button|svg|math|noscript|template)\b[\s\S]*?(<\/\1\s*>|$)/gi, "");
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, tagRaw: string, attrs: string) => {
    const tag = tagRaw.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (full.startsWith("</")) return `</${tag}>`;
    const kept: string[] = [];
    const attrRe = /([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
    let m: RegExpExecArray | null;
    while ((m = attrRe.exec(attrs))) {
      const name = m[1].toLowerCase();
      const value = m[3] ?? m[4] ?? m[5] ?? "";
      if (name === "class") {
        const cls = value.split(/\s+/).filter((c) => ALLOWED_CLASSES.has(c));
        if (cls.length) kept.push(`class="${cls.join(" ")}"`);
      } else if (name === "href" && tag === "a" && /^https?:\/\//i.test(value.trim())) {
        kept.push(`href="${escapeHtml(value.trim())}"`, `target="_blank"`, `rel="noopener noreferrer"`);
      } else if ((name === "colspan" || name === "rowspan") && /^\d{1,2}$/.test(value)) {
        kept.push(`${name}="${value}"`);
      }
    }
    const selfClosing = tag === "br" || tag === "hr";
    return `<${tag}${kept.length ? " " + kept.join(" ") : ""}${selfClosing ? " /" : ""}>`;
  });
  return out.trim();
}

// Turns [n] / [n, m] markers into links to the real source list. Markers that
// point at a source that does not exist are removed, so a report can never
// cite something that was not read. Returns the html and the cited numbers.
export function linkCitations(html: string, sources: ReportSource[]): { html: string; cited: Set<number> } {
  const cited = new Set<number>();
  // Drop any links the model wrapped around markers itself; we rebuild them.
  let out = html.replace(/<sup>\s*<a[^>]*>\s*(\[[\d,\s]+\])\s*<\/a>\s*<\/sup>/g, "$1");
  out = out.replace(/\[(\d{1,3}(?:\s*,\s*\d{1,3})*)\]/g, (_m, list: string) => {
    const nums = list.split(",").map((n) => Number(n.trim())).filter((n) => n >= 1 && n <= sources.length);
    if (!nums.length) return "";
    return nums.map((n) => {
      cited.add(n);
      return `<sup class="cite"><a href="${escapeHtml(sources[n - 1].url)}" target="_blank" rel="noopener noreferrer">[${n}]</a></sup>`;
    }).join("");
  });
  return { html: out, cited };
}

const STANCE_NOTE: Record<AnalystReport["stance"], string> = {
  Positive: "The evidence reviewed supports a constructive view over the stated horizon.",
  Neutral: "The evidence reviewed is balanced; no strong directional view is taken.",
  Cautious: "The evidence reviewed points to elevated risk relative to the potential upside.",
  Negative: "The evidence reviewed points to a weak risk/reward over the stated horizon.",
};

function clampConviction(n: unknown): number {
  const v = Number(n);
  return Number.isFinite(v) ? Math.max(0, Math.min(5, Math.round(v * 10) / 10)) : 3;
}

function basisLabel(m: KeyMetric): string {
  if (m.basis === "estimate") return "Estimate";
  if (m.basis === "calculated") return "Calculated";
  return "Reported";
}

function metricSourceMarker(m: KeyMetric, sources: ReportSource[]): string {
  const n = Number(m.source);
  return Number.isInteger(n) && n >= 1 && n <= sources.length ? ` [${n}]` : "";
}

function summaryPage(r: AnalystReport, meta: ReportMeta, sources: ReportSource[]): ReportPage {
  const conviction = clampConviction(r.conviction);
  const metrics = (r.key_metrics ?? []).filter((m) => m?.label && m?.value).slice(0, 8);
  const takeaways = (r.key_takeaways ?? []).filter(Boolean).slice(0, 6);
  const asset = meta.ticker ? `${escapeHtml(meta.topic)} (${escapeHtml(meta.ticker)})` : escapeHtml(meta.topic);
  const html = [
    `<div class="stat-grid">`,
    `<div class="stat"><span class="label">Stance</span><span class="value">${escapeHtml(r.stance)}</span></div>`,
    `<div class="stat"><span class="label">Conviction</span><span class="value">${conviction.toFixed(1)} / 5</span></div>`,
    `<div class="stat"><span class="label">Horizon</span><span class="value">${escapeHtml(r.horizon || "12 months")}</span></div>`,
    `<div class="stat"><span class="label">Coverage</span><span class="value">${asset}</span></div>`,
    `</div>`,
    `<p class="lede">${escapeHtml(r.excerpt)}</p>`,
    `<p>${escapeHtml(STANCE_NOTE[r.stance] ?? STANCE_NOTE.Neutral)}</p>`,
    takeaways.length
      ? `<div class="callout"><h3>Key takeaways</h3><ul>${takeaways.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul></div>`
      : "",
    metrics.length
      ? `<h3>Key metrics</h3><table class="data-table"><thead><tr><th>Metric</th><th>Value</th><th>Basis</th></tr></thead><tbody>${
          metrics.map((m) => `<tr><td>${escapeHtml(m.label)}</td><td>${escapeHtml(m.value)}${metricSourceMarker(m, sources)}</td><td>${basisLabel(m)}</td></tr>`).join("")
        }</tbody></table>`
      : "",
  ].join("");
  return { title: "Executive Summary", html };
}

const CASE_LABEL = { bull: "Bull case", base: "Base case", bear: "Bear case" } as const;
const LEVEL = (v?: string) => (v ? v[0].toUpperCase() + v.slice(1) : "—");

function outlookPage(r: AnalystReport): ReportPage | null {
  const scenarios = (r.scenarios ?? []).filter((s) => s?.summary);
  const risks = (r.risks ?? []).filter((x) => x?.risk).slice(0, 8);
  const catalysts = (r.catalysts ?? []).filter((c) => c?.event).slice(0, 8);
  if (!scenarios.length && !risks.length && !catalysts.length) return null;
  const order = { bull: 0, base: 1, bear: 2 } as const;
  const parts: string[] = [];
  if (scenarios.length) {
    parts.push(
      `<h3>Scenario analysis</h3><table class="data-table"><thead><tr><th>Scenario</th><th>Probability</th><th>Outline</th><th>Key drivers</th></tr></thead><tbody>`,
      ...[...scenarios].sort((a, b) => (order[a.case] ?? 1) - (order[b.case] ?? 1)).map((s) => {
        const p = Number(s.probability);
        const prob = Number.isFinite(p) && p > 0 ? `${Math.round(p <= 1 ? p * 100 : p)}%` : "—";
        return `<tr><td><strong>${CASE_LABEL[s.case] ?? escapeHtml(s.case)}</strong></td><td>${prob}</td><td>${escapeHtml(s.summary)}</td><td>${
          (s.drivers ?? []).slice(0, 4).map(escapeHtml).join("; ") || "—"
        }</td></tr>`;
      }),
      `</tbody></table><p class="note">Probabilities are the analyst's subjective weighting, not forecasts.</p>`,
    );
  }
  if (catalysts.length) {
    parts.push(
      `<h3>Catalyst calendar</h3><table class="data-table"><thead><tr><th>Event</th><th>Expected timing</th><th>Likely direction</th></tr></thead><tbody>`,
      ...catalysts.map((c) => `<tr><td>${escapeHtml(c.event)}</td><td>${escapeHtml(c.timing || "Unconfirmed")}</td><td>${LEVEL(c.direction ?? "uncertain")}</td></tr>`),
      `</tbody></table>`,
    );
  }
  if (risks.length) {
    parts.push(
      `<h3>Risk matrix</h3><table class="data-table"><thead><tr><th>Risk</th><th>Likelihood</th><th>Impact</th><th>Mitigant / what to monitor</th></tr></thead><tbody>`,
      ...risks.map((x) => `<tr><td>${escapeHtml(x.risk)}</td><td>${LEVEL(x.likelihood)}</td><td>${LEVEL(x.impact)}</td><td>${escapeHtml(x.mitigant || "—")}</td></tr>`),
      `</tbody></table>`,
    );
  }
  return { title: "Scenarios, Catalysts & Risks", html: parts.join("") };
}

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

function sourcesPage(r: AnalystReport, meta: ReportMeta, sources: ReportSource[], cited: Set<number>): ReportPage {
  const list = sources.map((s, i) => {
    const n = i + 1;
    const label = escapeHtml(s.title || hostOf(s.url));
    return `<li${cited.has(n) ? "" : ' class="note"'}><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${label}</a> — ${escapeHtml(hostOf(s.url))}${cited.has(n) ? "" : " (consulted, not cited)"}</li>`;
  }).join("");
  const gaps = (r.data_gaps ?? []).filter(Boolean).slice(0, 8);
  const html = [
    `<h3>Sources</h3>`,
    sources.length ? `<ol>${list}</ol>` : `<p>No external sources could be retrieved for this report; it relies on general market knowledge and should be read as indicative only.</p>`,
    gaps.length ? `<h3>Data limitations</h3><ul>${gaps.map((g) => `<li>${escapeHtml(g)}</li>`).join("")}</ul>` : "",
    `<h3>Methodology</h3>`,
    `<p>FlowPulse Research gathered ${sources.length} public source${sources.length === 1 ? "" : "s"} on ${escapeHtml(meta.reportDate)} and produced this report with AI-assisted analysis under FlowPulse's research rules: figures must come from the cited sources or be labelled as estimates; facts, estimates and interpretation are kept separate; both bull and bear cases are presented. Monetary values are shown in GBP; foreign-currency figures are converted at a recent indicative rate.</p>`,
    `<h3>Important information</h3>`,
    `<p class="note">This report is general market research for information purposes only. It is not personal investment advice or a recommendation to buy or sell any ${meta.assetType === "crypto" ? "digital asset" : "security"}, and it does not take account of any individual's objectives or circumstances. The value of investments can fall as well as rise and you may get back less than you invest.${meta.assetType === "crypto" ? " Cryptoassets are high-risk and largely unregulated in the UK; you are unlikely to be protected if something goes wrong." : ""} Past performance is not a reliable indicator of future results. Information is believed accurate at the date shown but is not guaranteed.</p>`,
  ].join("");
  return { title: "Sources, Methodology & Disclosures", html };
}

export function composeReport(r: AnalystReport, meta: ReportMeta, sources: ReportSource[]): ReportPage[] {
  const allCited = new Set<number>();
  const cite = (html: string) => {
    const linked = linkCitations(sanitizeHtml(html), sources);
    linked.cited.forEach((n) => allCited.add(n));
    return linked.html;
  };

  const pages: ReportPage[] = [];
  const summary = summaryPage(r, meta, sources);
  pages.push({ title: summary.title, html: cite(summary.html) });

  for (const s of (r.sections ?? []).slice(0, 10)) {
    const html = cite(s?.html ?? "");
    if (html.replace(/<[^>]+>/g, "").trim().length < 40) continue;
    pages.push({ title: String(s.title ?? "Analysis").slice(0, 120), html });
  }

  const outlook = outlookPage(r);
  if (outlook) pages.push({ title: outlook.title, html: cite(outlook.html) });

  pages.push(sourcesPage(r, meta, sources, allCited));
  return pages;
}
