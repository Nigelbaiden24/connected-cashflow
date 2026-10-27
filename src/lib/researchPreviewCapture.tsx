// Captures paywall screenshots of research reports for signed-out visitors.
// Pages are rendered with the real report template, then shrunk and blurred
// before encoding, so the stored image can't be read even at full zoom.
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import { ReportPdfPagePreview, type ReportPdfPreviewData } from "@/components/research/ReportPdfPagePreview";

import type { PreviewImage } from "@/components/research/ResearchPaywall";

export type { PreviewImage };

interface CaptureSource extends Omit<ReportPdfPreviewData, "first_page_title" | "first_page_html"> {
  id: string;
  pages: Array<{ title: string; html: string }> | null;
  html_content?: string | null;
}

const PAGE_W = 794;
const PAGE_H = 1123;
const OUT_W = 220;             // stored width: body text ends up ~4 px tall
const OUT_H = Math.round(OUT_W * PAGE_H / PAGE_W);
const MAX_PAGES = 3;

const db = supabase as any; // preview_images is not in the generated types yet

function waitForImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll("img"));
  return Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
}

/** Shrinks then re-enlarges through a tiny canvas, so detail is lost for good, then softens it. */
function obscure(source: HTMLCanvasElement): string {
  const tiny = document.createElement("canvas");
  tiny.width = Math.round(OUT_W / 2.2);
  tiny.height = Math.round(OUT_H / 2.2);
  const t = tiny.getContext("2d")!;
  t.imageSmoothingEnabled = true;
  t.imageSmoothingQuality = "high";
  t.drawImage(source, 0, 0, tiny.width, tiny.height);

  const out = document.createElement("canvas");
  out.width = OUT_W;
  out.height = OUT_H;
  const o = out.getContext("2d")!;
  o.imageSmoothingEnabled = true;
  o.imageSmoothingQuality = "high";
  if ("filter" in o) o.filter = "blur(1.2px)";
  o.drawImage(tiny, 0, 0, OUT_W, OUT_H);
  const webp = out.toDataURL("image/webp", 0.72);
  return webp.startsWith("data:image/webp") ? webp : out.toDataURL("image/jpeg", 0.72);
}

export async function captureReportPreviews(report: CaptureSource): Promise<PreviewImage[]> {
  const pages = report.pages?.length ? report.pages : [{ title: report.title, html: report.html_content ?? "" }];
  const { default: html2canvas } = await import("html2canvas");

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, { position: "fixed", left: "-12000px", top: "0", width: `${PAGE_W}px`, height: `${PAGE_H}px`, overflow: "hidden", pointerEvents: "none" });
  document.body.appendChild(host);
  const root = createRoot(host);
  const out: PreviewImage[] = [];
  try {
    for (let i = 0; i < Math.min(MAX_PAGES, pages.length); i++) {
      flushSync(() => root.render(
        <div style={{ width: PAGE_W, height: PAGE_H }}>
          <ReportPdfPagePreview
            report={{ ...report, first_page_title: pages[i].title, first_page_html: pages[i].html }}
            pageNumber={i + 1} scale={1} bare
          />
        </div>,
      ));
      await waitForImages(host);
      const canvas = await html2canvas(host, { scale: 0.6, width: PAGE_W, height: PAGE_H, backgroundColor: "#ffffff", useCORS: true, logging: false });
      out.push({ page: i + 1, width: OUT_W, height: OUT_H, data: obscure(canvas) });
    }
  } finally {
    root.unmount();
    host.remove();
  }
  return out;
}

/** Captures and stores previews for the given reports; returns how many were saved. */
export async function refreshReportPreviews(ids: string[], onProgress?: (done: number, total: number) => void): Promise<number> {
  let saved = 0;
  for (let i = 0; i < ids.length; i++) {
    const { data: r } = await db.from("generated_research_reports")
      .select("id,title,ticker,asset_type,report_date,promoted_at,created_at,page_count,pages,html_content")
      .eq("id", ids[i]).maybeSingle();
    if (r) {
      try {
        const images = await captureReportPreviews(r);
        const { error } = await db.from("generated_research_reports")
          .update({ preview_images: images, preview_images_at: new Date().toISOString() }).eq("id", r.id);
        if (!error) saved++;
        else console.warn("preview save failed", error.message);
      } catch (e) {
        console.warn("preview capture failed", r.id, e);
      }
    }
    onProgress?.(i + 1, ids.length);
  }
  return saved;
}

/** Promoted reports that have no previews yet (empty if the column isn't live yet). */
export async function reportsMissingPreviews(assetType: "stock" | "crypto"): Promise<string[]> {
  const { data, error } = await db.from("generated_research_reports").select("id,preview_images")
    .eq("status", "promoted").eq("asset_type", assetType).limit(200);
  if (error) return [];
  return (data ?? []).filter((r: any) => !Array.isArray(r.preview_images) || r.preview_images.length === 0).map((r: any) => r.id);
}
