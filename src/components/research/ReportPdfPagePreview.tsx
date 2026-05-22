import DOMPurify from "dompurify";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

export interface ReportPdfPreviewData {
  title: string;
  ticker: string | null;
  asset_type: "stock" | "crypto";
  report_date: string | null;
  promoted_at: string | null;
  created_at: string;
  page_count: number | null;
  first_page_title: string;
  first_page_html: string;
}

interface ReportPdfPagePreviewProps {
  report: ReportPdfPreviewData;
  blurred?: boolean;
}

export function ReportPdfPagePreview({ report, blurred = false }: ReportPdfPagePreviewProps) {
  const date = report.report_date ?? report.promoted_at ?? report.created_at;
  const dateLabel = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const sanitizedHtml = DOMPurify.sanitize(report.first_page_html ?? "", {
    ADD_ATTR: ["target", "rel"],
  });

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md bg-white shadow-[0_18px_50px_-18px_rgba(0,0,0,0.75)]">
      <style>{`
        .research-pdf-preview-article p { margin: 0 0 16px; }
        .research-pdf-preview-article .lede { font-size: 17px; line-height: 1.62; }
        .research-pdf-preview-article h2 { margin: 20px 0 10px; font-size: 21px; line-height: 1.2; color: #0c2340; }
        .research-pdf-preview-article h3 { margin: 18px 0 8px; font-size: 17px; line-height: 1.25; color: #1e3a5f; }
        .research-pdf-preview-article ul, .research-pdf-preview-article ol { margin: 12px 0 16px 22px; }
        .research-pdf-preview-article li { margin: 6px 0; }
        .research-pdf-preview-article strong { font-weight: 800; color: #0f172a; }
        .research-pdf-preview-article .callout { margin: 14px 0 0; border-left: 4px solid #3b82f6; border-radius: 4px; background: #eff6ff; padding: 22px 24px; }
        .research-pdf-preview-article .callout p:last-child { margin-bottom: 0; }
        .research-pdf-preview-article .stat-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 14px 0; }
        .research-pdf-preview-article .stat { border-radius: 4px; background: #f1f5f9; padding: 10px; font-family: Arial, sans-serif; }
        .research-pdf-preview-article .label { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: .12em; color: #64748b; }
        .research-pdf-preview-article .value { display: block; margin-top: 4px; font-size: 17px; font-weight: 800; color: #0c2340; }
        .research-pdf-preview-article table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12px; }
        .research-pdf-preview-article th, .research-pdf-preview-article td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
        .research-pdf-preview-article th { background: #0c2340; color: white; font-family: Arial, sans-serif; }
      `}</style>
      <div
        className={`pointer-events-none origin-top-left bg-white text-[#102033] transition-all duration-500 ${blurred ? "blur-[7px] saturate-75" : ""}`}
        style={{ width: 794, minHeight: 1123, transform: "scale(0.4)", transformOrigin: "top left" }}
      >
        <div className="flex min-h-[1123px] flex-col px-8 pb-8 pt-10">
          <header className="mb-8 border-b-2 border-[#0c2340] pb-3">
            <div className="flex items-start gap-4">
              <img src={flowpulseLogo} alt="" className="mt-1 h-8 w-8 object-contain" />
              <div className="min-w-0 flex-1">
                <div className="font-sans text-[18px] font-extrabold uppercase tracking-[0.12em] text-[#0c2340]">
                  FlowPulse Research
                </div>
                <div className="mt-1 truncate font-sans text-[10px] uppercase tracking-[0.35em] text-[#64748b]">
                  {report.title} · {dateLabel}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="mb-5 font-sans text-[12px] uppercase tracking-[0.35em] text-[#3b82f6]">Section 1</div>
            <h2 className="mb-6 font-serif text-[27px] leading-tight text-[#0f172a]">
              {report.first_page_title || "Executive Summary & Key Takeaways"}
            </h2>
            <article
              className="research-pdf-preview-article font-serif text-[16px] leading-[1.58] text-[#111827]"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </main>

          <footer className="mt-10 flex items-center justify-between border-t border-[#dbe4ef] pt-4 font-sans text-[11px] text-[#64748b]">
            <span>FlowPulse Research · Confidential</span>
            <span>Page 1 of {report.page_count ?? 1}</span>
          </footer>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}