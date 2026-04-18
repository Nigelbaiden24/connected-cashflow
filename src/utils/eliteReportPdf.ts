import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "@/assets/flowpulse-logo.png";

export interface EliteReport {
  title: string;
  subtitle?: string;
  executive_summary?: string;
  key_metrics?: { label: string; value: string; change?: string }[];
  sections?: { heading: string; body: string }[];
  opportunities?: { name: string; thesis: string; conviction: string; horizon: string }[];
  risks?: { risk: string; severity: string; mitigation: string }[];
  chart_data?: {
    sentiment?: { label: string; value: number }[];
    category_distribution?: { label: string; value: number }[];
    conviction_breakdown?: { label: string; value: number }[];
  };
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

const palette = (platform: "finance" | "investor") =>
  platform === "investor"
    ? { primary: [124, 58, 237] as const, accent: [217, 70, 239] as const, soft: [243, 232, 255] as const }
    : { primary: [37, 99, 235] as const, accent: [14, 165, 233] as const, soft: [219, 234, 254] as const };

export const generateEliteReport = async (report: EliteReport, opts: Options): Promise<void> => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const colors = palette(opts.platform);
  const platformLabel = opts.platform === "investor" ? "FlowPulse Investor" : "FlowPulse Finance";

  const logoDataUrl = await loadImageDataURL(logo);

  const drawHeader = (pageNum: number) => {
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageW, 36, "F");
    if (logoDataUrl) {
      try { doc.addImage(logoDataUrl, "PNG", margin, 6, 24, 24); } catch { /* ignore */ }
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("FlowPulse.io", margin + 30, 22);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(platformLabel, pageW - margin, 22, { align: "right" });
    doc.setTextColor(150, 150, 150); doc.setFontSize(8);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 18, { align: "right" });
    doc.text("Confidential — Institutional Research", margin, pageH - 18);
  };

  // ===== COVER PAGE =====
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageW, pageH, "F");
  // Accent diagonal band
  doc.setFillColor(...colors.accent);
  doc.triangle(0, pageH, pageW, pageH, pageW, pageH - 180, "F");

  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", pageW / 2 - 40, 110, 80, 80); } catch { /* ignore */ }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold"); doc.setFontSize(34);
  doc.text("FlowPulse.io", pageW / 2, 230, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(14);
  doc.text(platformLabel + " — Elite Research Report", pageW / 2, 256, { align: "center" });

  doc.setFont("helvetica", "bold"); doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(report.title || "Research Report", pageW - margin * 2);
  doc.text(titleLines, pageW / 2, 360, { align: "center" });

  if (report.subtitle) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(13);
    const subLines = doc.splitTextToSize(report.subtitle, pageW - margin * 2);
    doc.text(subLines, pageW / 2, 360 + titleLines.length * 26 + 14, { align: "center" });
  }

  doc.setFontSize(10);
  doc.text(
    new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
    pageW / 2, pageH - 80, { align: "center" }
  );
  if (opts.categoryLabel) doc.text(`Category: ${opts.categoryLabel}`, pageW / 2, pageH - 62, { align: "center" });

  // ===== CONTENT =====
  let pageNum = 2;
  doc.addPage(); drawHeader(pageNum);
  let y = 64;
  const contentW = pageW - margin * 2;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 40) {
      doc.addPage(); pageNum++; drawHeader(pageNum); y = 64;
    }
  };

  const sectionTitle = (text: string) => {
    ensureSpace(40);
    doc.setFillColor(...colors.soft);
    doc.rect(margin, y - 14, contentW, 22, "F");
    doc.setFillColor(...colors.primary);
    doc.rect(margin, y - 14, 4, 22, "F");
    doc.setTextColor(...colors.primary);
    doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text(text, margin + 12, y);
    y += 20;
  };

  const paragraph = (text: string, size = 10) => {
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal"); doc.setFontSize(size);
    const paras = text.split(/\n\n+/);
    paras.forEach((p, i) => {
      const lines = doc.splitTextToSize(p.trim(), contentW);
      lines.forEach((ln: string) => {
        ensureSpace(14);
        doc.text(ln, margin, y); y += 14;
      });
      if (i < paras.length - 1) y += 6;
    });
  };

  // Executive summary
  if (report.executive_summary) {
    sectionTitle("Executive Summary");
    paragraph(report.executive_summary);
    y += 8;
  }

  // Key metrics — colored cards
  if (report.key_metrics?.length) {
    sectionTitle("Key Metrics");
    const cardW = (contentW - 16) / 3;
    const cardH = 56;
    report.key_metrics.forEach((m, i) => {
      const col = i % 3;
      if (col === 0) ensureSpace(cardH + 10);
      const x = margin + col * (cardW + 8);
      doc.setFillColor(...colors.soft);
      doc.roundedRect(x, y, cardW, cardH, 6, 6, "F");
      doc.setTextColor(...colors.primary);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text(m.label.toUpperCase(), x + 10, y + 14, { maxWidth: cardW - 20 });
      doc.setFontSize(15); doc.setTextColor(20, 20, 20);
      doc.text(String(m.value), x + 10, y + 34, { maxWidth: cardW - 20 });
      if (m.change) {
        doc.setFontSize(8); doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.accent);
        doc.text(m.change, x + 10, y + 48, { maxWidth: cardW - 20 });
      }
      if (col === 2 || i === report.key_metrics!.length - 1) y += cardH + 10;
    });
    y += 4;
  }

  // Charts
  const drawBarChart = (title: string, data: { label: string; value: number }[]) => {
    if (!data?.length) return;
    const chartH = 140;
    ensureSpace(chartH + 40);
    sectionTitle(title);
    const barAreaY = y;
    const barAreaH = chartH;
    const max = Math.max(...data.map(d => d.value), 1);
    const barW = (contentW - 20) / data.length - 8;
    data.forEach((d, i) => {
      const h = (d.value / max) * (barAreaH - 30);
      const x = margin + 10 + i * (barW + 8);
      const by = barAreaY + (barAreaH - 20 - h);
      // gradient effect via two rects
      doc.setFillColor(...colors.primary);
      doc.rect(x, by, barW, h, "F");
      doc.setFillColor(...colors.accent);
      doc.rect(x, by, barW, Math.min(h, 6), "F");
      doc.setTextColor(40, 40, 40); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      doc.text(String(d.value), x + barW / 2, by - 3, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      const lbl = doc.splitTextToSize(d.label, barW + 6);
      doc.text(lbl[0], x + barW / 2, barAreaY + barAreaH - 6, { align: "center" });
    });
    y += barAreaH + 10;
  };

  const drawDonut = (title: string, data: { label: string; value: number }[]) => {
    if (!data?.length) return;
    ensureSpace(180);
    sectionTitle(title);
    const cx = margin + 90, cy = y + 70, rOuter = 60, rInner = 32;
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    let start = -Math.PI / 2;
    const segColors: [number, number, number][] = [
      colors.primary as unknown as [number, number, number],
      colors.accent as unknown as [number, number, number],
      [148, 163, 184], [251, 191, 36], [16, 185, 129], [239, 68, 68],
    ];
    data.forEach((d, i) => {
      const angle = (d.value / total) * Math.PI * 2;
      const steps = Math.max(8, Math.ceil((angle / (Math.PI * 2)) * 60));
      const c = segColors[i % segColors.length];
      doc.setFillColor(c[0], c[1], c[2]);
      // approximate pie slice with triangles
      for (let s = 0; s < steps; s++) {
        const a1 = start + (angle * s) / steps;
        const a2 = start + (angle * (s + 1)) / steps;
        doc.triangle(
          cx, cy,
          cx + Math.cos(a1) * rOuter, cy + Math.sin(a1) * rOuter,
          cx + Math.cos(a2) * rOuter, cy + Math.sin(a2) * rOuter,
          "F"
        );
      }
      start += angle;
    });
    // inner hole
    doc.setFillColor(255, 255, 255);
    doc.circle(cx, cy, rInner, "F");

    // legend
    let lx = cx + rOuter + 30, ly = cy - rOuter + 6;
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    data.forEach((d, i) => {
      const c = segColors[i % segColors.length];
      doc.setFillColor(c[0], c[1], c[2]);
      doc.rect(lx, ly - 7, 10, 10, "F");
      doc.setTextColor(40, 40, 40);
      const pct = ((d.value / total) * 100).toFixed(0);
      doc.text(`${d.label} — ${d.value} (${pct}%)`, lx + 16, ly);
      ly += 16;
    });
    y += 160;
  };

  if (report.chart_data) {
    if (report.chart_data.sentiment?.length) drawDonut("Sentiment Breakdown", report.chart_data.sentiment);
    if (report.chart_data.category_distribution?.length) drawBarChart("Category Distribution", report.chart_data.category_distribution);
    if (report.chart_data.conviction_breakdown?.length) drawDonut("Conviction Breakdown", report.chart_data.conviction_breakdown);
  }

  // Sections
  report.sections?.forEach(s => {
    sectionTitle(s.heading);
    paragraph(s.body);
    y += 6;
  });

  // Opportunities table
  if (report.opportunities?.length) {
    sectionTitle("Opportunities");
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Opportunity", "Thesis", "Conviction", "Horizon"]],
      body: report.opportunities.map(o => [o.name, o.thesis, o.conviction, o.horizon]),
      headStyles: { fillColor: [colors.primary[0], colors.primary[1], colors.primary[2]], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: 40 },
      alternateRowStyles: { fillColor: [colors.soft[0], colors.soft[1], colors.soft[2]] },
      didDrawPage: () => { drawHeader(doc.getNumberOfPages()); },
    });
    // @ts-expect-error lastAutoTable injected by autotable
    y = (doc.lastAutoTable?.finalY ?? y) + 14;
  }

  // Risks table
  if (report.risks?.length) {
    ensureSpace(60);
    sectionTitle("Risks & Mitigation");
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Risk", "Severity", "Mitigation"]],
      body: report.risks.map(r => [r.risk, r.severity, r.mitigation]),
      headStyles: { fillColor: [colors.accent[0], colors.accent[1], colors.accent[2]], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: 40 },
      alternateRowStyles: { fillColor: [colors.soft[0], colors.soft[1], colors.soft[2]] },
      didDrawPage: () => { drawHeader(doc.getNumberOfPages()); },
    });
    // @ts-expect-error lastAutoTable injected by autotable
    y = (doc.lastAutoTable?.finalY ?? y) + 14;
  }

  // Conclusion
  if (report.conclusion) {
    sectionTitle("Conclusion");
    paragraph(report.conclusion);
  }

  if (report.raw && !report.executive_summary) {
    sectionTitle("Report");
    paragraph(report.raw);
  }

  const filename = `FlowPulse_${opts.platform}_EliteReport_${Date.now()}.pdf`;
  doc.save(filename);
};
