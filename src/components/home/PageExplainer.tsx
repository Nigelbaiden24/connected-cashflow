import type { ElementType, ReactNode } from "react";

export interface ExplainerPoint {
  icon: ElementType;
  title: string;
  text: string;
}

/** Short "what this is and why it helps" section shown above public listings. */
export function PageExplainer({ eyebrow, title, intro, points, note, accent = "amber" }: {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  points: ExplainerPoint[];
  note?: string;
  accent?: "amber" | "indigo";
}) {
  const tone = accent === "amber"
    ? { eyebrow: "text-amber-700 bg-amber-50 border-amber-200", icon: "text-amber-600 bg-amber-50 ring-amber-200" }
    : { eyebrow: "text-indigo-700 bg-indigo-50 border-indigo-200", icon: "text-indigo-600 bg-indigo-50 ring-indigo-200" };

  return (
    <section className="container mx-auto px-4 pb-12">
      <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur md:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${tone.eyebrow}`}>{eyebrow}</span>
          <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">{title}</h2>
          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-600">{intro}</div>
          {note && <p className="mt-5 text-xs leading-relaxed text-slate-400">{note}</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {points.map(({ icon: Icon, title: t, text }) => (
            <div key={t} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:border-slate-200 hover:bg-white">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${tone.icon}`}><Icon className="h-4 w-4" /></span>
              <p className="mt-3 text-sm font-semibold text-slate-900">{t}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
