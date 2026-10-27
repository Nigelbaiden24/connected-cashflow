import { format } from "date-fns";
import flowpulseLogo from "@/assets/flowpulse-logo.png";
import { ConvictionRing, coverPalette, scoreTone } from "@/components/research/ReportCover";

export interface FrontPageReport {
  id: string;
  title: string;
  ticker: string | null;
  asset_type: "stock" | "crypto";
  ai_score: number | null;
  ai_tags?: string[] | null;
  page_count: number | null;
  reading_time_minutes?: number | null;
  author_name?: string | null;
  report_date: string | null;
  promoted_at: string | null;
  created_at: string;
  first_page_title?: string | null;
  teaser?: string | null;
  preview_images?: Array<{ data: string }>;
}

// Placeholder line widths for the blurred body; no report text is used here.
const LINES = [96, 88, 92, 74, 95, 83, 90, 61, 94, 86, 79, 92, 68];

/**
 * The colourful front page of a research report, as shown behind the paywall:
 * the cover and the opening of the executive summary are readable, the rest
 * fades into blur. Only public metadata and a one-sentence teaser are used.
 */
export function ReportFrontPage({ report, size = "card", className = "", blurFrom }: {
  report: FrontPageReport; size?: "card" | "hero"; className?: string;
  /** Where (0–100 % of the height) the progressive blur starts; omit for none. */
  blurFrom?: number;
}) {
  const [from, to] = coverPalette(report.ticker || report.title || report.id);
  const hero = size === "hero";
  const tone = scoreTone(report.ai_score);
  const date = format(new Date(report.report_date ?? report.promoted_at ?? report.created_at), "d MMM yyyy");
  const mark = (report.ticker || report.title.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).map((w) => w[0]).join("").slice(0, 4)).toUpperCase();
  const preview = report.preview_images?.[0]?.data;

  return (
    <div className={`relative overflow-hidden bg-white ${hero ? "rounded-2xl" : ""} ${className}`}>
      {/* Cover */}
      <div className={`relative overflow-hidden text-white ${hero ? "px-9 pb-8 pt-7" : "px-5 pb-5 pt-4"}`}
        style={{ background: `radial-gradient(120% 120% at 85% 0%, ${to}cc, transparent 55%), linear-gradient(135deg, ${from} 0%, #0a1226 78%)` }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.09] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:22px_22px]" />
        <svg className="pointer-events-none absolute -right-16 -top-16 h-[150%] opacity-25" viewBox="0 0 200 200" aria-hidden="true">
          {[90, 70, 50, 30].map((r, i) => <circle key={r} cx="150" cy="50" r={r} fill="none" stroke={to} strokeOpacity={0.3 + i * 0.15} strokeWidth="0.8" />)}
        </svg>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`flex items-center justify-center rounded-md bg-white ${hero ? "h-7 w-7" : "h-5 w-5"}`}><img src={flowpulseLogo} alt="" className={hero ? "h-5" : "h-3.5"} /></span>
            <span className={`font-semibold uppercase tracking-[0.22em] text-white/85 ${hero ? "text-[11px]" : "text-[9px]"}`}>
              FlowPulse Research · {report.asset_type === "crypto" ? "Digital asset" : "Equity"}
            </span>
          </div>
          <span className={`text-white/60 ${hero ? "text-xs" : "text-[10px]"}`}>{date}</span>
        </div>
        <div className={`relative flex items-end justify-between gap-4 ${hero ? "mt-8" : "mt-4"}`}>
          <div className="min-w-0">
            <div className={`font-black leading-none tracking-tight text-white/95 ${hero ? "text-6xl" : "text-[2.1rem]"}`}>{mark}</div>
            <h3 className={`mt-2 font-semibold leading-snug text-white ${hero ? "text-2xl" : "line-clamp-2 text-[15px]"}`}>{report.title}</h3>
          </div>
          <div className="shrink-0 text-center">
            <ConvictionRing score={report.ai_score} size={hero ? 74 : 50} stroke={hero ? 6 : 4.5} />
            <div className={`mt-1 font-semibold ${tone.text} ${hero ? "text-[11px]" : "text-[9px]"}`}>{tone.label}</div>
          </div>
        </div>
        <div className={`relative flex flex-wrap items-center gap-1.5 ${hero ? "mt-5" : "mt-3"}`}>
          {(report.ai_tags ?? []).slice(0, hero ? 4 : 2).map((t) => (
            <span key={t} className={`rounded-full border border-white/15 bg-white/10 text-white/85 ${hero ? "px-2.5 py-0.5 text-[11px]" : "px-2 py-px text-[9px]"}`}>{t}</span>
          ))}
          <span className={`ml-auto text-white/65 ${hero ? "text-xs" : "text-[10px]"}`}>
            {report.page_count ?? "—"} pages{report.reading_time_minutes ? ` · ${report.reading_time_minutes} min` : ""}
          </span>
        </div>
      </div>

      {/* Opening of the report, fading into blur */}
      <div className={`relative ${hero ? "px-9 pb-10 pt-6" : "px-5 pb-6 pt-4"}`}>
        <p className={`font-semibold uppercase tracking-[0.18em] text-blue-600 ${hero ? "text-[11px]" : "text-[9px]"}`}>Section 1</p>
        <p className={`mt-1 font-bold text-slate-900 ${hero ? "text-xl" : "text-sm"}`}>{report.first_page_title || "Executive Summary & Key Takeaways"}</p>
        {report.teaser && (
          <p className={`mt-2 font-serif leading-relaxed text-slate-700 ${hero ? "text-[15px]" : "line-clamp-2 text-xs"}`}>{report.teaser}</p>
        )}
        <div className={`relative mt-3 ${hero ? "h-36" : "h-24"}`}>
          {preview ? (
            <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover object-top opacity-80 [filter:blur(3px)]" />
          ) : null}
          <div className="absolute inset-0 space-y-2.5 [filter:blur(2.6px)]">
            {LINES.slice(0, hero ? 8 : 6).map((w, i) => (
              <div key={i} className={`rounded-full ${i % 5 === 3 ? "bg-blue-200" : "bg-slate-300"} ${hero ? "h-2.5" : "h-1.5"}`} style={{ width: `${w}%`, opacity: 0.9 - i * 0.05 }} />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/40 to-white" />
        </div>
      </div>

      {/* Progressive frosted blur over the page: clear at the top, heavier further down. */}
      {blurFrom != null && (
        <>
          <div className="pointer-events-none absolute inset-0 backdrop-blur-[2px]"
            style={{ maskImage: `linear-gradient(to bottom, transparent ${blurFrom}%, black ${blurFrom + 12}%)`, WebkitMaskImage: `linear-gradient(to bottom, transparent ${blurFrom}%, black ${blurFrom + 12}%)` }} />
          <div className="pointer-events-none absolute inset-0 backdrop-blur-[5px]"
            style={{ maskImage: `linear-gradient(to bottom, transparent ${blurFrom + 14}%, black ${blurFrom + 34}%)`, WebkitMaskImage: `linear-gradient(to bottom, transparent ${blurFrom + 14}%, black ${blurFrom + 34}%)` }} />
        </>
      )}
    </div>
  );
}
