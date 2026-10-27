import { memo } from "react";
import type { PromotedReport } from "@/lib/researchFeed";

// Deterministic palette per ticker/title so each report has a stable identity.
const PALETTES = [
  ["#1e3a8a", "#0ea5e9"], ["#312e81", "#8b5cf6"], ["#134e4a", "#14b8a6"], ["#7c2d12", "#f59e0b"],
  ["#1e293b", "#38bdf8"], ["#4c1d95", "#ec4899"], ["#064e3b", "#22c55e"], ["#0c4a6e", "#6366f1"],
];

export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

/** Stable two-colour palette for a report (by ticker, else title). */
export function coverPalette(key: string): [string, string] {
  const [from, to] = PALETTES[hash(key) % PALETTES.length];
  return [from, to];
}

export function scoreTone(score: number | null) {
  if (typeof score !== "number") return { ring: "#64748b", text: "text-slate-300", label: "Unrated" };
  if (score >= 4) return { ring: "#34d399", text: "text-emerald-300", label: "High conviction" };
  if (score >= 3) return { ring: "#fbbf24", text: "text-amber-300", label: "Moderate" };
  return { ring: "#fb7185", text: "text-rose-300", label: "Low conviction" };
}

/** Conviction gauge (0–5) drawn from the report's real score. */
export function ConvictionRing({ score, size = 56, stroke = 5, className = "" }: { score: number | null; size?: number; stroke?: number; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = typeof score === "number" ? Math.max(0, Math.min(5, score)) / 5 : 0;
  const tone = scoreTone(score);
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }} title={typeof score === "number" ? `${score.toFixed(1)} / 5 conviction` : "Not scored"}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone.ring} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${c * v} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-bold text-white tabular-nums" style={{ fontSize: size * 0.28 }}>{typeof score === "number" ? score.toFixed(1) : "–"}</span>
        {size >= 52 && <span className="mt-0.5 text-[8px] uppercase tracking-widest text-white/50">/ 5</span>}
      </div>
    </div>
  );
}

/** Lightweight generated cover (no network images). */
export const ReportCover = memo(function ReportCover({ report, className = "", size = "md", showRing = true }: {
  report: Pick<PromotedReport, "id" | "ticker" | "title" | "asset_type" | "ai_score" | "page_count" | "hero_image_url">;
  className?: string; size?: "sm" | "md" | "lg"; showRing?: boolean;
}) {
  const seed = hash(report.ticker || report.title || report.id);
  const [from, to] = PALETTES[seed % PALETTES.length];
  const mark = (report.ticker || report.title.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).map((w) => w[0]).join("").slice(0, 3)).toUpperCase();
  const angle = (seed % 360);
  const fontSize = size === "lg" ? "clamp(3rem, 7vw, 5.5rem)" : size === "sm" ? "1.6rem" : "2.75rem";

  return (
    <div className={`relative overflow-hidden bg-[#070b16] ${className}`}>
      {report.hero_image_url ? (
        <img src={report.hero_image_url} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-50" />
      ) : null}
      <div className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at ${20 + (seed % 60)}% 0%, ${to}55, transparent 60%), linear-gradient(${angle}deg, ${from}, #070b16 75%)` }} />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:22px_22px]" />
      {/* Concentric arcs: abstract, not data */}
      <svg className="absolute -right-10 -bottom-16 h-[140%] opacity-30" viewBox="0 0 200 200" aria-hidden="true">
        {[90, 70, 50, 30].map((r, i) => (
          <circle key={r} cx="150" cy="150" r={r} fill="none" stroke={to} strokeOpacity={0.25 + i * 0.15} strokeWidth="0.8" />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-end justify-between p-4">
        <span className="font-black tracking-tight text-white/90 [text-shadow:0_2px_30px_rgba(0,0,0,0.4)]" style={{ fontSize, lineHeight: 1 }}>{mark}</span>
        {showRing && size !== "sm" && <ConvictionRing score={report.ai_score} size={size === "lg" ? 76 : 52} stroke={size === "lg" ? 6 : 5} />}
      </div>
    </div>
  );
});
