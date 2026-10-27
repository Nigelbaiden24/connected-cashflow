import { forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  type Bucket, type PortfolioAnalytics, type PortfolioReview, REVIEW_DISCLAIMER, money, pct,
} from "@/lib/portfolioReviews";

interface Props {
  title: string;
  review: Partial<PortfolioReview>;
  analytics: PortfolioAnalytics;
  currency: string;
  clientName?: string | null;
  analystName?: string | null;
  deliveredAt?: string | null;
  brief?: { objectives?: string | null; risk_profile?: string | null; time_horizon?: string | null; income_need?: string | null };
}

const RATING_TONE: Record<string, string> = {
  "Well aligned": "#047857",
  "Broadly aligned": "#0f766e",
  "Needs attention": "#b45309",
  "Misaligned": "#b91c1c",
};

const PRIORITY_LABEL = { high: "High priority", medium: "Medium", low: "Low" } as const;

function Bars({ title, data }: { title: string; data: Bucket[] }) {
  const rows = data.slice(0, 8);
  if (!rows.length) return null;
  return (
    <div className="pr-bars">
      <h4>{title}</h4>
      {rows.map((b) => (
        <div key={b.label} className="pr-bar-row">
          <span className="pr-bar-label">{b.label}</span>
          <span className="pr-bar-track"><span className="pr-bar-fill" style={{ width: `${Math.max(1, b.weight * 100)}%` }} /></span>
          <span className="pr-bar-value">{pct(b.weight)}</span>
        </div>
      ))}
    </div>
  );
}

/** The client-facing review document (also used for the analyst preview and PDF). */
export const ReviewDocument = forwardRef<HTMLDivElement, Props>(function ReviewDocument(
  { title, review, analytics, currency, clientName, analystName, deliveredAt, brief }, ref,
) {
  const date = deliveredAt ? new Date(deliveredAt) : new Date();
  const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const tone = RATING_TONE[review.overall_rating ?? ""] ?? "#334155";
  const considerations = review.considerations ?? [];
  const sections = (review.sections ?? []).filter((s) => s.body?.trim());

  return (
    <div ref={ref} className="report-article pr-doc">
      <header className="pr-cover">
        <div className="pr-brand">FLOWPULSE · ANALYST PORTFOLIO REVIEW</div>
        <h2 className="pr-title">{review.headline || title}</h2>
        <div className="pr-meta">
          <span>{title}</span>
          {clientName && <span>Prepared for {clientName}</span>}
          <span>{dateStr}</span>
          {analystName && <span>Analyst: {analystName}</span>}
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat" style={{ background: tone }}><span className="label" style={{ color: "#e2e8f0" }}>Overall</span><span className="value">{review.overall_rating || "—"}</span></div>
        <div className="stat"><span className="label">Portfolio value</span><span className="value">{money(analytics.total_value, currency)}</span></div>
        <div className="stat"><span className="label">Holdings</span><span className="value">{analytics.holdings_count}</span></div>
        <div className="stat"><span className="label">Effective holdings</span><span className="value">{analytics.effective_holdings.toFixed(1)}</span></div>
        <div className="stat"><span className="label">Top 5 weight</span><span className="value">{pct(analytics.top5_weight)}</span></div>
      </div>

      {review.summary && (
        <>
          <h3>Executive summary</h3>
          <p className="lede">{review.summary}</p>
        </>
      )}

      {brief && (brief.objectives || brief.risk_profile) && (
        <div className="callout">
          <h3>Your brief</h3>
          <ul>
            {brief.objectives && <li><strong>Objectives:</strong> {brief.objectives}</li>}
            {brief.risk_profile && <li><strong>Risk profile:</strong> {brief.risk_profile[0].toUpperCase() + brief.risk_profile.slice(1)}</li>}
            {brief.time_horizon && <li><strong>Time horizon:</strong> {brief.time_horizon}</li>}
            {brief.income_need && <li><strong>Income need:</strong> {brief.income_need}</li>}
          </ul>
        </div>
      )}

      {considerations.length > 0 && (
        <>
          <h3>Key points to consider</h3>
          <table className="data-table">
            <thead><tr><th>Priority</th><th>Point</th><th>Detail</th></tr></thead>
            <tbody>
              {considerations.map((c, i) => (
                <tr key={i}><td>{PRIORITY_LABEL[c.priority] ?? c.priority}</td><td><strong>{c.title}</strong></td><td>{c.detail}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h3>Portfolio snapshot</h3>
      <div className="pr-bars-grid">
        <Bars title="Asset class" data={analytics.by_asset_class} />
        <Bars title="Sector" data={analytics.by_sector} />
        <Bars title="Region" data={analytics.by_region} />
        <Bars title="Currency" data={analytics.by_currency} />
      </div>

      <h3>Largest holdings</h3>
      <table className="data-table">
        <thead><tr><th>Holding</th><th>Value</th><th>Weight</th><th>Sector</th></tr></thead>
        <tbody>
          {analytics.positions.slice(0, 10).map((p, i) => (
            <tr key={i}>
              <td>{p.name}{p.symbol ? ` (${p.symbol})` : ""}</td>
              <td>{money(p.value, p.currency || currency)}</td>
              <td>{pct(p.weight)}</td>
              <td>{p.sector || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {sections.map((s) => (
        <section key={s.key}>
          <h3>{s.title}</h3>
          <ReactMarkdown>{s.body}</ReactMarkdown>
        </section>
      ))}

      <h3>Important information</h3>
      <p className="note">{REVIEW_DISCLAIMER}</p>
    </div>
  );
});

/** Saves the rendered review as an A4 PDF. */
export async function downloadReviewPdf(el: HTMLElement, fileName: string) {
  const html2pdf = (await import("html2pdf.js")).default as any;
  await html2pdf().from(el).set({
    margin: [12, 12, 14, 12],
    filename: fileName,
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".stat-grid", ".callout", ".pr-bars", "h3"] },
  }).save();
}
