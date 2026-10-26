import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "@/assets/flowpulse-logo.png";

export interface EliteReport {
  title: string;
  subtitle?: string;
  report_type?: string;
  geography?: string;
  time_period?: string;
  sector?: string;
  executive_summary?: string;
  key_metrics?: { label: string; value: string; change?: string }[];
  sections?: { heading: string; body: string }[];
  top_entities?: { rank?: number; name: string; category?: string; detail?: string; why_it_matters?: string }[];
  opportunities?: { name: string; thesis: string; conviction: string; horizon: string; key_data?: string }[];
  risks?: { risk: string; severity: string; mitigation: string; probability?: string; second_order?: string }[];
  themes?: string[];
  contrarian_angles?: string[];
  chart_data?: {
    sentiment?: { label: string; value: number }[];
    category_distribution?: { label: string; value: number }[];
    conviction_breakdown?: { label: string; value: number }[];
  };
  data_gaps?: string[];
  strategic_takeaways?: string[];
  sources?: { name: string; detail?: string }[];
  conclusion?: string;
  raw?: string;
}

interface Options {
  platform: "finance" | "investor";
  categoryLabel?: string;
}

const loadImageDataURL = (src: string): Promise<string | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d"); if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

type RGB = [number, number, number];
const INK: RGB = [15, 23, 42];
const BODY: RGB = [51, 65, 85];
const MUTED: RGB = [100, 116, 139];
const RULE: RGB = [226, 232, 240];

const palette = (platform: "finance" | "investor"): { primary: RGB; accent: RGB; soft: RGB } =>
  platform === "investor"
    ? { primary: [76, 29, 149], accent: [168, 85, 247], soft: [245, 240, 255] }
    : { primary: [12, 35, 64], accent: [37, 99, 235], soft: [239, 246, 255] };

// jsPDF's built-in Helvetica only covers WinAnsi; map the usual offenders and
// drop anything else so text never renders as garbage.
const WINANSI_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
const pdfText = (value: unknown): string =>
  String(value ?? "")
    .replace(/\[INSERT [^\]]*\]/gi, "")
    .replace(/→/g, "->").replace(/←/g, "<-").replace(/≈/g, "~").replace(/≥/g, ">=").replace(/≤/g, "<=")
    .replace(/[↑▲]/g, "up ").replace(/[↓▼]/g, "down ").replace(/[  ]/g, " ")
    .split("")
    .filter((ch) => {
      const c = ch.charCodeAt(0);
      return c === 10 || (c >= 32 && c <= 126) || (c >= 160 && c <= 255) || WINANSI_EXTRA.includes(ch);
    })
    .join("")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const clean = <T,>(list: T[] | undefined, pick: (x: T) => unknown): T[] =>
  (list ?? []).filter((x) => x && pdfText(pick(x)).length > 0);

export const generateEliteReport = async (report: EliteReport, opts: Options): Promise<void> => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 52;
  const contentW = pageW - margin * 2;
  const top = 72;
  const bottom = pageH - 56;
  const colors = palette(opts.platform);
  const platformLabel = opts.platform === "investor" ? "FlowPulse Investor" : "FlowPulse Finance";
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const title = pdfText(report.title) || "Research Report";
  const logoDataUrl = await loadImageDataURL(logo);

  const drawRunningHeader = () => {
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(1.2);
    doc.line(margin, 44, pageW - margin, 44);
    if (logoDataUrl) {
      try { doc.addImage(logoDataUrl, "PNG", margin, 22, 16, 16); } catch { /* ignore */ }
    }
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...colors.primary);
    doc.text("FLOWPULSE RESEARCH", margin + 22, 34);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED);
    const shortTitle = doc.splitTextToSize(title, contentW * 0.6)[0];
    doc.text(shortTitle, pageW - margin, 34, { align: "right" });
  };

  // ===== COVER =====
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.setFillColor(...colors.accent);
  doc.rect(0, pageH * 0.62, pageW, 4, "F");
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", margin, 72, 44, 44); } catch { /* ignore */ }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold"); doc.setFontSize(12);
  doc.text("FLOWPULSE RESEARCH", margin + 56, 92);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text(`${platformLabel} · Elite Research Report`, margin + 56, 108);

  doc.setFont("helvetica", "bold"); doc.setFontSize(28);
  const titleLines = doc.splitTextToSize(title, contentW);
  let cy = 230;
  doc.text(titleLines, margin, cy);
  cy += titleLines.length * 33 + 6;
  if (report.subtitle) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(13); doc.setTextColor(226, 232, 240);
    const sub = doc.splitTextToSize(pdfText(report.subtitle), contentW);
    doc.text(sub, margin, cy);
  }

  const meta: [string, string | undefined][] = [
    ["Report type", report.report_type],
    ["Sector", report.sector || opts.categoryLabel],
    ["Geography", report.geography],
    ["Period", report.time_period],
    ["Published", dateStr],
  ];
  let my = pageH * 0.62 + 34;
  doc.setFontSize(9);
  meta.filter(([, v]) => v && pdfText(v)).forEach(([k, v]) => {
    doc.setFont("helvetica", "normal"); doc.setTextColor(165, 180, 252);
    doc.text(k.toUpperCase(), margin, my);
    doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text(doc.splitTextToSize(pdfText(v), contentW - 110)[0], margin + 110, my);
    my += 18;
  });
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(203, 213, 225);
  doc.text(
    doc.splitTextToSize("For professional and sophisticated investors. General market research, not personal investment advice. See Methodology & Disclosures.", contentW),
    margin, pageH - 48,
  );

  // ===== CONTENTS (filled in at the end, once page numbers are known) =====
  doc.addPage();
  const contentsPage = doc.getNumberOfPages();
  const toc: { label: string; page: number }[] = [];

  // ===== BODY =====
  doc.addPage(); drawRunningHeader();
  let y = top;

  const newPage = () => { doc.addPage(); drawRunningHeader(); y = top; };
  const ensureSpace = (needed: number) => { if (y + needed > bottom) newPage(); };

  const sectionTitle = (text: string, inContents = true) => {
    ensureSpace(64);
    if (y > top) y += 10;
    if (inContents) toc.push({ label: pdfText(text), page: doc.getNumberOfPages() });
    doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(...colors.primary);
    doc.text(pdfText(text), margin, y);
    y += 8;
    doc.setDrawColor(...colors.accent); doc.setLineWidth(1.5);
    doc.line(margin, y, margin + 36, y);
    y += 18;
  };

  const subTitle = (text: string) => {
    ensureSpace(34);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...INK);
    doc.text(pdfText(text), margin, y);
    y += 16;
  };

  const paragraph = (text: string, size = 10.2) => {
    const body = pdfText(text);
    if (!body) return;
    doc.setFont("helvetica", "normal"); doc.setFontSize(size); doc.setTextColor(...BODY);
    const lh = size * 1.5;
    body.split(/\n\s*\n+/).forEach((p) => {
      const lines = doc.splitTextToSize(p.replace(/\s*\n\s*/g, " ").trim(), contentW);
      lines.forEach((ln: string) => { ensureSpace(lh); doc.text(ln, margin, y); y += lh; });
      y += 6;
    });
  };

  const bullets = (items: string[], size = 10.2) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(size); doc.setTextColor(...BODY);
    const lh = size * 1.45;
    items.map(pdfText).filter(Boolean).forEach((item) => {
      const lines = doc.splitTextToSize(item, contentW - 16);
      ensureSpace(lh * Math.min(lines.length, 3));
      doc.setTextColor(...colors.accent); doc.text("•", margin + 2, y);
      doc.setTextColor(...BODY);
      lines.forEach((ln: string, i: number) => { if (i) ensureSpace(lh); doc.text(ln, margin + 16, y); y += lh; });
      y += 3;
    });
    y += 4;
  };

  const table = (head: string[], body: (string | undefined)[][], widths?: number[]) => {
    ensureSpace(60);
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin, top: top, bottom: pageH - bottom },
      head: [head],
      body: body.map((r) => r.map((c) => pdfText(c) || "—")),
      theme: "plain",
      styles: { font: "helvetica", fontSize: 8.6, cellPadding: 5, textColor: BODY, lineColor: RULE, lineWidth: { bottom: 0.5 }, valign: "top" },
      headStyles: { fillColor: colors.primary, textColor: 255, fontStyle: "bold", fontSize: 8.4 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: widths ? Object.fromEntries(widths.map((w, i) => [i, { cellWidth: w }])) : undefined,
      didDrawPage: (d) => { if (d.pageNumber > 1 && doc.getNumberOfPages() > contentsPage) drawRunningHeader(); },
    });
    // @ts-expect-error lastAutoTable is injected by jspdf-autotable
    y = (doc.lastAutoTable?.finalY ?? y) + 16;
  };

  // Executive summary
  if (report.executive_summary) {
    sectionTitle("Executive Summary");
    paragraph(report.executive_summary, 10.6);
  }

  // Key metrics
  const metrics = clean(report.key_metrics, (m) => m.value).slice(0, 9);
  if (metrics.length) {
    sectionTitle("Key Metrics");
    const cols = 3, gap = 10;
    const cardW = (contentW - gap * (cols - 1)) / cols;
    const cardH = 62;
    metrics.forEach((m, i) => {
      const col = i % cols;
      if (col === 0) ensureSpace(cardH + gap);
      const x = margin + col * (cardW + gap);
      doc.setFillColor(...colors.soft);
      doc.roundedRect(x, y, cardW, cardH, 5, 5, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...MUTED);
      doc.text(doc.splitTextToSize(pdfText(m.label).toUpperCase(), cardW - 20)[0] ?? "", x + 10, y + 16);
      doc.setFontSize(14.5); doc.setTextColor(...INK);
      doc.text(doc.splitTextToSize(pdfText(m.value), cardW - 20)[0] ?? "", x + 10, y + 36);
      if (m.change) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...colors.accent);
        doc.text(doc.splitTextToSize(pdfText(m.change), cardW - 20)[0] ?? "", x + 10, y + 51);
      }
      if (col === cols - 1 || i === metrics.length - 1) y += cardH + gap;
    });
    y += 6;
  }

  // Charts
  const drawBarChart = (heading: string, data: { label: string; value: number }[]) => {
    const rows = data.filter((d) => Number.isFinite(Number(d.value))).slice(0, 10);
    if (!rows.length) return;
    subTitle(heading);
    const max = Math.max(...rows.map((d) => Number(d.value)), 1);
    const labelW = 150, barMax = contentW - labelW - 40, rowH = 18;
    ensureSpace(rows.length * rowH + 10);
    rows.forEach((d) => {
      const w = (Number(d.value) / max) * barMax;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.6); doc.setTextColor(...BODY);
      doc.text(doc.splitTextToSize(pdfText(d.label), labelW - 8)[0] ?? "", margin, y + 9);
      doc.setFillColor(...colors.accent);
      doc.rect(margin + labelW, y + 1, Math.max(w, 1.5), 11, "F");
      doc.setTextColor(...INK);
      doc.text(String(d.value), margin + labelW + w + 6, y + 10);
      y += rowH;
    });
    y += 10;
  };

  const drawSplit = (heading: string, data: { label: string; value: number }[]) => {
    const rows = data.filter((d) => Number(d.value) > 0);
    const total = rows.reduce((s, d) => s + Number(d.value), 0);
    if (!rows.length || !total) return;
    subTitle(heading);
    ensureSpace(46);
    const segColors: RGB[] = [colors.primary, colors.accent, [148, 163, 184], [245, 158, 11], [16, 185, 129], [239, 68, 68]];
    let x = margin;
    rows.forEach((d, i) => {
      const w = (Number(d.value) / total) * contentW;
      doc.setFillColor(...segColors[i % segColors.length]);
      doc.rect(x, y, w, 14, "F");
      x += w;
    });
    y += 26;
    let lx = margin;
    doc.setFontSize(8.6); doc.setFont("helvetica", "normal");
    rows.forEach((d, i) => {
      const label = `${pdfText(d.label)} ${Math.round((Number(d.value) / total) * 100)}%`;
      const w = doc.getTextWidth(label) + 26;
      if (lx + w > margin + contentW) { lx = margin; y += 14; }
      doc.setFillColor(...segColors[i % segColors.length]); doc.rect(lx, y - 7, 8, 8, "F");
      doc.setTextColor(...BODY); doc.text(label, lx + 12, y);
      lx += w;
    });
    y += 22;
  };

  const cd = report.chart_data;
  if (cd && (cd.sentiment?.length || cd.category_distribution?.length || cd.conviction_breakdown?.length)) {
    sectionTitle("Market Read-out");
    if (cd.sentiment?.length) drawSplit("Sentiment across the evidence", cd.sentiment);
    if (cd.conviction_breakdown?.length) drawSplit("Conviction across opportunities", cd.conviction_breakdown);
    if (cd.category_distribution?.length) drawBarChart("Coverage by category", cd.category_distribution);
  }

  // Analysis sections
  clean(report.sections, (s) => s.body).forEach((s) => {
    sectionTitle(s.heading || "Analysis");
    paragraph(s.body);
  });

  const entities = clean(report.top_entities, (e) => e.name).slice(0, 12);
  if (entities.length) {
    sectionTitle("Key Players");
    table(["#", "Name", "Type", "Detail", "Why it matters"],
      entities.map((e, i) => [String(e.rank ?? i + 1), e.name, e.category, e.detail, e.why_it_matters]),
      [22, 92, 52, 140, contentW - 306]);
  }

  const opps = clean(report.opportunities, (o) => o.name);
  if (opps.length) {
    sectionTitle("Opportunities");
    table(["Opportunity", "Thesis", "Conviction", "Horizon"],
      opps.map((o) => [o.name, [o.thesis, o.key_data ? `Key data: ${o.key_data}` : ""].filter(Boolean).join("\n"), o.conviction, o.horizon]),
      [100, contentW - 230, 62, 68]);
  }

  const risks = clean(report.risks, (r) => r.risk);
  if (risks.length) {
    sectionTitle("Risks & Mitigation");
    table(["Risk", "Severity", "Probability", "Mitigation / what to monitor"],
      risks.map((r) => [[r.risk, r.second_order ? `Second-order: ${r.second_order}` : ""].filter(Boolean).join("\n"), r.severity, r.probability, r.mitigation]),
      [contentW - 280, 56, 64, 160]);
  }

  if (report.themes?.length || report.contrarian_angles?.length) {
    sectionTitle("Themes & Contrarian Angles");
    if (report.themes?.length) { subTitle("Cross-cutting themes"); bullets(report.themes); }
    if (report.contrarian_angles?.length) { subTitle("Contrarian angles"); bullets(report.contrarian_angles); }
  }

  if (report.strategic_takeaways?.length) {
    sectionTitle("Strategic Takeaways");
    bullets(report.strategic_takeaways);
  }

  if (report.conclusion) {
    sectionTitle("Conclusion");
    paragraph(report.conclusion);
  }

  if (report.raw && !report.executive_summary) {
    sectionTitle("Report");
    paragraph(report.raw);
  }

  // Sources, limitations and disclosures
  sectionTitle("Sources, Methodology & Disclosures");
  const sources = clean(report.sources, (s) => s.name);
  if (sources.length) {
    subTitle("Sources");
    bullets(sources.map((s) => (s.detail ? `${s.name} — ${s.detail}` : s.name)), 9.4);
  }
  if (report.data_gaps?.length) {
    subTitle("Data limitations");
    bullets(report.data_gaps, 9.4);
  }
  subTitle("Methodology");
  paragraph(
    `This report was produced by FlowPulse Research on ${dateStr} from public market intelligence gathered by FlowPulse's research tools, analysed with AI assistance and reviewed against FlowPulse's research rules: figures must come from the gathered sources or be labelled as estimates, facts and opinion are kept separate, and both upside and downside cases are presented.`,
    9.4,
  );
  subTitle("Important information");
  paragraph(
    "This document is general market research for professional and sophisticated investors and is provided for information only. It is not personal investment advice or a recommendation to buy or sell any investment, and it does not take account of any individual's objectives, financial situation or needs. The value of investments and any income from them can fall as well as rise, and investors may get back less than they invest. Past performance is not a reliable indicator of future results. Information is believed accurate at the date of publication but is not guaranteed, and opinions may change without notice.",
    8.8,
  );

  // ===== CONTENTS PAGE =====
  doc.setPage(contentsPage);
  drawRunningHeader();
  let ty = top + 8;
  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(...colors.primary);
  doc.text("Contents", margin, ty);
  ty += 30;
  doc.setFontSize(10.5);
  toc.forEach((t, i) => {
    if (ty > bottom) return;
    doc.setFont("helvetica", "bold"); doc.setTextColor(...colors.accent);
    doc.text(String(i + 1).padStart(2, "0"), margin, ty);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...INK);
    const label = doc.splitTextToSize(t.label, contentW - 80)[0] ?? "";
    doc.text(label, margin + 28, ty);
    doc.setTextColor(...MUTED);
    doc.text(String(t.page), pageW - margin, ty, { align: "right" });
    doc.setDrawColor(...RULE); doc.setLineWidth(0.5);
    doc.line(margin + 28, ty + 7, pageW - margin, ty + 7);
    ty += 24;
  });

  // ===== FOOTERS =====
  const total = doc.getNumberOfPages();
  for (let p = 2; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(...RULE); doc.setLineWidth(0.5);
    doc.line(margin, pageH - 40, pageW - margin, pageH - 40);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...MUTED);
    doc.text(`FlowPulse Research · ${platformLabel} · Not personal investment advice`, margin, pageH - 28);
    doc.text(`Page ${p} of ${total}`, pageW - margin, pageH - 28, { align: "right" });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "report";
  doc.save(`FlowPulse_Research_${slug}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
