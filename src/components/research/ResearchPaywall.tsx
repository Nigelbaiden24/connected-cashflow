import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, Check, CreditCard, FileText, Lock, ShieldCheck, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ReportFrontPage, type FrontPageReport } from "@/components/research/ReportFrontPage";
import { ANNUAL_PRICE, MONTHLY_PRICE_MONTHLY } from "@/lib/investorPlan";

export interface PreviewImage { page: number; width: number; height: number; data: string }

export type Viewer = { signed_in: boolean; can_read: boolean };

/** Frosted lock bar laid over the bottom of a locked report card. */
export function PaywallCardOverlay({ pages, signedIn }: { pages: number | null; signedIn: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-3 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-[0_0_24px_-6px_rgba(245,158,11,0.8)]">
          <Lock className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600">Subscriber research</p>
          <p className="truncate text-[13px] font-medium text-slate-900">{pages ? `${pages}-page analyst dossier` : "Full analyst dossier"}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors group-hover:bg-amber-500 group-hover:text-slate-950">
          {signedIn ? "Upgrade" : "Unlock"} <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

const INSIDE = (r: FrontPageReport) => [
  `${r.page_count ?? "Multi"}-page dossier, written and reviewed by the analyst desk`,
  "Conviction score with quality, risk, valuation and ESG breakdown",
  "Bull and bear scenarios, catalysts and key risks, with sources",
  "Download as a branded PDF",
];

/** Full preview of a locked report with the subscription offer. */
export function ReportPaywallDialog({ report, viewer, open, onOpenChange, onSignIn }: {
  report: FrontPageReport | null; viewer: Viewer; open: boolean; onOpenChange: (v: boolean) => void; onSignIn: () => void;
}) {
  const navigate = useNavigate();
  if (!report) return null;
  const subscribe = () => { onOpenChange(false); navigate(`/pricing?from=research&report=${report.id}`); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border-0 p-0 sm:rounded-3xl">
        <div className="grid md:grid-cols-[1.05fr_1fr]">
          <div className="relative order-2 bg-gradient-to-br from-slate-100 via-slate-50 to-amber-50/60 p-5 md:order-1 md:p-8">
            <div className="overflow-hidden rounded-2xl shadow-[0_30px_80px_-30px_rgba(15,23,42,0.55)] ring-1 ring-slate-900/5">
              <ReportFrontPage report={report} size="hero" blurFrom={68} />
            </div>
            <div className="absolute inset-x-5 bottom-5 flex items-center justify-center md:inset-x-8 md:bottom-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur">
                <Lock className="h-3.5 w-3.5 text-amber-300" /> The rest of this report is for subscribers
              </span>
            </div>
          </div>

          <div className="order-1 flex flex-col p-6 md:order-2 md:p-9">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
              <Sparkles className="h-3 w-3" /> FlowPulse Investor
            </div>
            <DialogTitle className="mt-4 text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
              Continue reading this report
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-slate-500">
              {viewer.signed_in
                ? "Your account doesn't include research yet. Subscribe to read every equity and digital asset dossier in full."
                : "Subscribe to FlowPulse Investor to read every equity and digital asset dossier in full."}
            </DialogDescription>

            <ul className="mt-6 space-y-3">
              {INSIDE(report).map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={subscribe} className="rounded-2xl border-2 border-amber-400 bg-amber-50/60 p-4 text-left transition hover:bg-amber-50">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Annual · best value</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">£{ANNUAL_PRICE.toLocaleString("en-GB")}<span className="text-sm font-medium text-slate-500">/yr</span></p>
                <p className="text-xs text-slate-500">≈ £{Math.round(ANNUAL_PRICE / 12)} a month</p>
              </button>
              <button onClick={subscribe} className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Monthly</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">£{MONTHLY_PRICE_MONTHLY}<span className="text-sm font-medium text-slate-500">/mo</span></p>
                <p className="text-xs text-slate-500">Cancel anytime</p>
              </button>
            </div>

            <Button size="lg" onClick={subscribe}
              className="mt-5 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 font-semibold text-slate-950 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.8)] hover:from-amber-300 hover:to-amber-400">
              Subscribe to read <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {!viewer.signed_in && (
              <button onClick={() => { onOpenChange(false); onSignIn(); }} className="mt-3 text-center text-sm text-slate-500 hover:text-slate-900">
                Already a subscriber? <span className="font-semibold text-slate-900 underline-offset-2 hover:underline">Sign in</span>
              </button>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-6 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> Secure checkout by Stripe</span>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> MFA-protected accounts</span>
              <span className="inline-flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5" /> Cancel anytime</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const FEATURES = [
  "Full multi-page equity and digital-asset dossiers",
  "Quality, risk, valuation and ESG on a 0–5 conviction scale",
  "Scenarios, catalysts and risk frameworks with sources",
  "Download any report as a branded PDF",
];

/** The main unlock panel below the report grid. */
export function VaultPaywall({ assetLabel, reportCount, sample, signedIn, onSubscribe, onSignIn }: {
  assetLabel: string; reportCount: number; sample?: FrontPageReport; signedIn: boolean; onSubscribe: () => void; onSignIn: () => void;
}) {
  return (
    <div className="mt-14 rounded-[28px] bg-gradient-to-br from-amber-300/70 via-white to-sky-300/60 p-px shadow-[0_40px_120px_-50px_rgba(15,23,42,0.45)]">
      <div className="relative overflow-hidden rounded-[27px] bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_0%_0%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(50%_70%_at_100%_100%,rgba(245,158,11,0.14),transparent_60%)]" />
        <div className="relative grid items-center gap-10 p-8 md:p-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <Sparkles className="h-3 w-3" /> Research Vault access
            </div>
            <h3 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight text-slate-900 md:text-4xl">
              Read every {assetLabel} dossier
              <span className="block bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">in full.</span>
            </h3>
            <p className="mt-4 max-w-lg leading-relaxed text-slate-600">
              {reportCount > 0 ? `${reportCount} analyst report${reportCount === 1 ? " is" : "s are"} in the vault. ` : ""}
              Subscribe to FlowPulse Investor from £{Math.round(ANNUAL_PRICE / 12)} a month (billed annually) to unlock them all.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={onSubscribe}
                className="h-12 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 font-semibold text-slate-950 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.8)] hover:from-amber-300 hover:to-amber-400">
                {signedIn ? "Upgrade to read" : "Subscribe"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {!signedIn && (
                <Button size="lg" variant="outline" onClick={onSignIn} className="h-12 rounded-xl border-slate-200 px-6">
                  Sign in
                </Button>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-slate-400" /> Secure checkout by Stripe</span>
              <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-slate-400" /> Analyst-reviewed research</span>
              <span>Cancel anytime</span>
            </div>
          </div>

          {sample && (
            <div className="relative hidden lg:block">
              <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-sky-200/50 to-amber-200/50 blur-2xl" />
              <div className="relative rotate-[1.5deg] overflow-hidden rounded-2xl shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)] ring-1 ring-slate-900/5">
                <ReportFrontPage report={sample} size="card" blurFrom={30} />
              </div>
              <div className="absolute -bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-4 py-2 text-xs text-white shadow-lg">
                <Lock className="mr-1.5 inline h-3 w-3 text-amber-300" /> {sample.page_count ?? "Full"} pages for subscribers
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Slim bar that follows non-subscribers once they scroll. */
export function PreviewBar({ signedIn, onSubscribe, onSignIn }: { signedIn: boolean; onSubscribe: () => void; onSignIn: () => void }) {
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
      <div className="flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 py-2.5 pl-4 pr-2.5 text-slate-900 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <Lock className="h-4 w-4 shrink-0 text-amber-500" />
        <p className="min-w-0 flex-1 truncate text-sm text-slate-600">
          <span className="hidden sm:inline">You're previewing the Research Vault. </span>Subscribe to read every report.
        </p>
        {!signedIn && <button onClick={onSignIn} className="hidden px-2 text-sm text-slate-500 transition-colors hover:text-slate-900 sm:block">Sign in</button>}
        <Button size="sm" onClick={onSubscribe} className="h-9 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 font-semibold text-slate-950 hover:from-amber-300 hover:to-amber-400">
          {signedIn ? "Upgrade" : "Subscribe"}
        </Button>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
