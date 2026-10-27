import { BadgeCheck, ExternalLink, Info, Scale } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export interface PricedOpportunity {
  price: number | null;
  price_currency?: string | null;
  product_details?: any;
}

export type PriceSource = "listed" | "estimate" | "indicative" | "none";

const KIND_LABEL: Record<string, string> = {
  asking_price: "Asking price", minimum_investment: "Minimum investment", valuation: "Valuation",
  raise_target: "Raise target", unit_price: "Unit price",
};

export function priceInfo(o: PricedOpportunity) {
  const d = o.product_details ?? {};
  const basis: string = d.price_basis ?? d.price_estimate_basis ?? "";
  const source: PriceSource = !o.price ? "none"
    : basis === "source_stated" || basis === "source_extracted" ? "listed"
    : basis === "ai_comparables" || basis === "comparable_median" ? "estimate"
    : "indicative";
  return {
    source,
    low: Number(d.price_low) || null,
    high: Number(d.price_high) || null,
    kind: KIND_LABEL[d.price_kind] ?? null,
    confidence: typeof d.price_confidence === "number" ? d.price_confidence : null,
    rationale: (d.price_rationale as string) || null,
    original: (d.price_original as string) || null,
    pricedAt: (d.priced_at as string) || null,
    sourceUrl: (d.source_url as string) || null,
  };
}

export const money = (n: number, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: currency || "GBP", maximumFractionDigits: 0, notation: n >= 10_000_000 ? "compact" : "standard" }).format(n);

export function sourceHost(url: string | null | undefined) {
  if (!url) return null;
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
}

const confidenceLabel = (c: number | null) => c == null ? null : c >= 0.7 ? "High" : c >= 0.45 ? "Medium" : "Low";

/** Price with an honest label: listed on the source, or a FlowPulse estimate. */
export function OpportunityPrice({ opportunity, size = "md" }: { opportunity: PricedOpportunity; size?: "sm" | "md" | "lg" }) {
  const info = priceInfo(opportunity);
  const ccy = opportunity.price_currency || "GBP";
  if (info.source === "none") return <span className="text-sm text-muted-foreground">Price on request</span>;

  const value = money(opportunity.price!, ccy);
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-sm" : "text-lg";
  const range = info.low && info.high && info.high > info.low ? `${money(info.low, ccy)} – ${money(info.high, ccy)}` : null;

  if (info.source === "listed") {
    return (
      <div className="min-w-0">
        <div className={`${textSize} font-bold text-primary tabular-nums`}>{value}</div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400">
          <BadgeCheck className="h-3 w-3" /> {info.kind ?? "Listed price"}{info.original && size === "lg" ? ` · "${info.original}"` : ""}
        </div>
      </div>
    );
  }

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <button type="button" onClick={(e) => e.stopPropagation()} className="min-w-0 text-left">
          <div className={`${textSize} font-bold tabular-nums text-foreground/90`}>
            <span className="mr-0.5 text-muted-foreground">≈</span>{value}
          </div>
          <div className={`flex items-center gap-1 text-[11px] ${info.source === "estimate" ? "text-sky-700 dark:text-sky-400" : "text-amber-700 dark:text-amber-400"}`}>
            <Scale className="h-3 w-3" />
            {info.source === "estimate" ? "FlowPulse estimate" : "Indicative only"}
            {info.confidence != null && info.source === "estimate" && <span className="text-muted-foreground">· {confidenceLabel(info.confidence)} confidence</span>}
            <Info className="h-3 w-3 opacity-60" />
          </div>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 text-sm" onClick={(e) => e.stopPropagation()}>
        <p className="font-semibold">{info.source === "estimate" ? "How we estimated this" : "Indicative figure"}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          The source doesn't publish a price{info.kind ? ` (${info.kind.toLowerCase()})` : ""}.{" "}
          {info.source === "estimate"
            ? "FlowPulse valued it against comparable deals whose prices are published."
            : "This is a typical entry level for the asset class, not a valuation of this deal."}
        </p>
        {range && <p className="mt-2 text-xs"><span className="text-muted-foreground">Likely range:</span> <span className="font-medium">{range}</span></p>}
        {info.rationale && <p className="mt-2 text-xs leading-relaxed">{info.rationale}</p>}
        {info.confidence != null && (
          <div className="mt-2">
            <div className="flex justify-between text-[11px] text-muted-foreground"><span>Confidence</span><span>{Math.round(info.confidence * 100)}%</span></div>
            <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.round(info.confidence * 100)}%` }} /></div>
          </div>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">Always confirm the price with the provider before investing.</p>
      </HoverCardContent>
    </HoverCard>
  );
}

/** "Source: rightmove.co.uk ↗" link for publicly listed deals. */
export function SourceLink({ url, className = "" }: { url: string | null | undefined; className?: string }) {
  const host = sourceHost(url);
  if (!host || !url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow" onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary ${className}`}>
      <ExternalLink className="h-3 w-3" /> {host}
    </a>
  );
}
