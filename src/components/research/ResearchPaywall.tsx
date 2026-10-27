import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Check, FileText, Lock, ShieldCheck, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PreviewImage { page: number; width: number; height: number; data: string }

interface PreviewReport {
  title: string;
  ticker: string | null;
  asset_type: "stock" | "crypto";
  page_count: number | null;
  preview_images?: PreviewImage[];
}

/** Up to three real (pre-blurred) report pages, fanned like a dossier. */
function PageStack({ images, size = "card" }: { images: PreviewImage[]; size?: "card" | "hero" }) {
  const pages = images.slice(0, 3);
  const w = size === "hero" ? 232 : 168;
  const pose = [
    "z-[3] translate-x-0 rotate-0",
    "z-[2] -translate-x-[38%] translate-y-3 -rotate-[7deg] opacity-90 group-hover:-translate-x-[46%] group-hover:-rotate-[9deg]",
    "z-[1] translate-x-[38%] translate-y-3 rotate-[7deg] opacity-90 group-hover:translate-x-[46%] group-hover:rotate-[9deg]",
  ];
  return (
    <div className="relative flex items-center justify-center" style={{ width: w, aspectRatio: "794 / 1123" }}>
      {pages.map((img, i) => (
        <img
          key={img.page}
          src={img.data}
          alt=""
          draggable={false}
          className={`absolute inset-0 h-full w-full rounded-[3px] bg-white object-cover shadow-[0_24px_60px_-20px_rgba(2,6,23,0.9)] ring-1 ring-white/10 transition-transform duration-700 ease-out [filter:blur(1.5px)_saturate(0.95)] ${pose[i]}`}
        />
      ))}
    </div>
  );
}

/** Locked report card preview: real page screenshots behind frosted glass. */
export function LockedPagePreview({ report, images, onSignIn, children }: {
  report: PreviewReport; images: PreviewImage[]; onSignIn: () => void; children: ReactNode;
}) {
  const pages = report.page_count ?? images.length;
  return (
    <div className="relative h-80 overflow-hidden bg-[#070b16]">
      {/* Ambient light */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(99,102,241,0.28),transparent_60%),radial-gradient(80%_60%_at_100%_100%,rgba(245,158,11,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="absolute inset-0 flex items-start justify-center pt-6">
        {images.length ? (
          <PageStack images={images} />
        ) : (
          <div className="h-[300px] w-[318px] overflow-hidden rounded-md opacity-90">{children}</div>
        )}
      </div>

      {/* Frost towards the bottom so the lock panel reads cleanly */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070b16] via-[#070b16]/80 to-transparent" />

      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-40">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-[0_0_24px_-4px_rgba(245,158,11,0.7)]">
            <Lock className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300/90">Members only</p>
            <p className="truncate text-[13px] font-medium text-white">
              {pages > 1 ? `${pages}-page analyst dossier` : "Full analyst dossier"}
            </p>
          </div>
          <span className="pointer-events-auto relative z-40 flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-950 transition-colors group-hover:bg-amber-300">
            Unlock <ArrowRight className="h-3 w-3" />
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSignIn(); }}
          className="pointer-events-auto relative z-40 mt-2 w-full text-center text-[11px] text-slate-400 transition-colors hover:text-white"
        >
          Already a member? <span className="font-medium text-slate-200 underline-offset-2 hover:underline">Sign in</span>
        </button>
      </div>
    </div>
  );
}

const FEATURES = [
  "Full multi-page equity and digital-asset dossiers",
  "Quality, risk, valuation and ESG on a 0–5 conviction scale",
  "Scenarios, catalysts and risk frameworks with sources",
  "Download any report as a branded PDF",
];

/** The main unlock panel below the report grid. */
export function VaultPaywall({ assetLabel, reportCount, sample, onSignUp, onSignIn }: {
  assetLabel: string; reportCount: number; sample?: PreviewReport; onSignUp: () => void; onSignIn: () => void;
}) {
  return (
    <div className="mt-14 rounded-[28px] bg-gradient-to-br from-amber-300/60 via-white/10 to-indigo-400/50 p-px shadow-[0_40px_120px_-40px_rgba(15,23,42,0.6)]">
      <div className="relative overflow-hidden rounded-[27px] bg-[#070b16] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_0%_0%,rgba(99,102,241,0.25),transparent_60%),radial-gradient(50%_70%_at_100%_100%,rgba(245,158,11,0.18),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative grid items-center gap-10 p-8 md:p-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-amber-300">
              <Sparkles className="h-3 w-3" /> Research Vault access
            </div>
            <h3 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
              Read every {assetLabel} dossier
              <span className="block bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent">in full.</span>
            </h3>
            <p className="mt-4 max-w-lg leading-relaxed text-slate-300">
              {reportCount > 0 ? `${reportCount} analyst report${reportCount === 1 ? " is" : "s are"} waiting behind this screen. ` : ""}
              A free account opens the complete Research Vault.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={onSignUp}
                className="h-12 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 px-6 font-semibold text-slate-950 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.8)] hover:from-amber-200 hover:to-amber-400">
                Create free account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={onSignIn}
                className="h-12 rounded-xl border-white/15 bg-white/[0.04] px-6 text-white backdrop-blur hover:bg-white/10 hover:text-white">
                Sign in
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> MFA-protected accounts</span>
              <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-sky-400" /> Analyst-reviewed research</span>
              <span>No card required</span>
            </div>
          </div>

          <div className="group relative hidden h-[380px] items-center justify-center lg:flex">
            <div className="absolute h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
            {sample?.preview_images?.length ? (
              <>
                <PageStack images={sample.preview_images} size="hero" />
                <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#070b16]/80 px-4 py-2 text-xs text-slate-300 backdrop-blur-xl">
                  <Lock className="mr-1.5 inline h-3 w-3 text-amber-300" />
                  {sample.ticker ? `${sample.ticker} · ` : ""}{sample.page_count ?? sample.preview_images.length} pages, locked
                </div>
              </>
            ) : (
              <div className="relative flex h-40 w-40 items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <Lock className="h-14 w-14 text-amber-300" strokeWidth={1.5} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Slim glass bar that follows signed-out visitors once they scroll. */
export function PreviewBar({ onSignUp, onSignIn }: { onSignUp: () => void; onSignIn: () => void }) {
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (dismissed) return null;
  return (
    <div className={`fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition-all duration-500 ${shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
      <div className="flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-[#070b16]/90 py-2.5 pl-4 pr-2.5 text-white shadow-[0_20px_60px_-15px_rgba(2,6,23,0.8)] backdrop-blur-xl">
        <Lock className="h-4 w-4 shrink-0 text-amber-300" />
        <p className="min-w-0 flex-1 truncate text-sm text-slate-300">
          <span className="hidden sm:inline">You're previewing the Research Vault. </span>Unlock every report free.
        </p>
        <button onClick={onSignIn} className="hidden px-2 text-sm text-slate-300 transition-colors hover:text-white sm:block">Sign in</button>
        <Button size="sm" onClick={onSignUp} className="h-9 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 font-semibold text-slate-950 hover:from-amber-200 hover:to-amber-400">
          Create account
        </Button>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
