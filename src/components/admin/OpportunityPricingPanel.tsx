import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, RefreshCw, Scale, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Categories on Opportunity Intelligence › Live Deal Alerts.
export const LIVE_DEAL_CATEGORIES: Record<string, string> = {
  real_estate: "Real Estate", land: "Land", rent_to_rent: "Rent to Rent", rent_to_sa: "Rent to SA",
  commodities: "Commodities", alternatives: "Alternatives", esg: "ESG & Impact", fractional_pe_vc: "Fractional PE/VC",
  private_market_platforms: "Private Markets", capital_protected_notes: "Capital-Protected Notes",
  thematics_packaged: "Thematics", copy_trading: "Copy Trading", royalties: "Royalties", businesses: "Businesses",
  mini_bonds: "Mini Bonds", timepieces: "Timepieces", fine_wine: "Fine Wine", art: "Art", collectibles: "Collectibles",
  luxury_assets: "Luxury Assets", entertainment_finance: "Entertainment Finance",
  insurance_investments: "Insurance-Based", sports_investments: "Sports",
};

type Row = { category: string; price: number | null; created_at: string; product_details: any };
type Basis = "source" | "estimate" | "benchmark" | "unpriced";

function basisOf(r: Row): Basis {
  const b = r.product_details?.price_basis ?? r.product_details?.price_estimate_basis ?? "";
  if (!r.price) return "unpriced";
  if (b === "source_stated" || b === "source_extracted") return "source";
  if (b === "ai_comparables" || b === "comparable_median") return "estimate";
  return "benchmark"; // category benchmarks and legacy unlabelled prices
}

/** Coverage per Live Deal Alert category and pricing quality, with re-pricing. */
export function OpportunityPricingPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("opportunity_products")
      .select("category,price,created_at,product_details").in("status", ["active", "draft"]).limit(5000);
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const stats = useMemo(() => {
    const per: Record<string, { total: number; fresh: number; source: number; estimate: number; benchmark: number; unpriced: number }> = {};
    const weekAgo = Date.now() - 7 * 86_400_000;
    for (const key of Object.keys(LIVE_DEAL_CATEGORIES)) per[key] = { total: 0, fresh: 0, source: 0, estimate: 0, benchmark: 0, unpriced: 0 };
    for (const r of rows) {
      const p = per[r.category];
      if (!p) continue;
      p.total++;
      if (new Date(r.created_at).getTime() > weekAgo) p.fresh++;
      p[basisOf(r)]++;
    }
    const all = Object.values(per).reduce((a, p) => ({
      total: a.total + p.total, source: a.source + p.source, estimate: a.estimate + p.estimate, benchmark: a.benchmark + p.benchmark, unpriced: a.unpriced + p.unpriced,
    }), { total: 0, source: 0, estimate: 0, benchmark: 0, unpriced: 0 });
    return { per, all, empty: Object.entries(per).filter(([, p]) => p.total === 0).map(([k]) => k) };
  }, [rows]);

  const needsPricing = stats.all.benchmark + stats.all.unpriced;

  const reprice = async () => {
    setConfirm(false);
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("opportunity-reprice", { body: { limit: 30 } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const by = (data as any)?.by_basis ?? {};
      toast.success(`Re-priced ${(data as any)?.processed ?? 0} deals: ${by.ai_comparables ?? 0} AI valuations, ${by.comparable_median ?? 0} comparable medians, ${by.source_stated ?? 0} source prices found. ${(data as any)?.remaining ?? 0} left.`);
      await load();
    } catch (e) {
      toast.error((e as Error).message || "Re-pricing failed");
    } finally {
      setBusy(false);
    }
  };

  const pct = (n: number) => (stats.all.total ? Math.round((n / stats.all.total) * 100) : 0);

  return (
    <Card className="rounded-3xl border-slate-200 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Scale className="h-5 w-5 text-cyan-600" /> Live Deal Alerts: coverage & pricing</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Prices stated on the source are used as given. Otherwise deals are valued against comparable source-priced deals (AI) and shown to investors as labelled estimates with a range.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
          <Button size="sm" onClick={() => setConfirm(true)} disabled={busy || needsPricing === 0}>
            {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
            Re-price next 30
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Source price", n: stats.all.source, tone: "text-emerald-600" },
          { label: "Valued estimate", n: stats.all.estimate, tone: "text-sky-600" },
          { label: "Flat benchmark / legacy", n: stats.all.benchmark, tone: "text-amber-600" },
          { label: "No price", n: stats.all.unpriced, tone: "text-rose-600" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border bg-slate-50/60 p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={`mt-1 text-2xl font-semibold tabular-nums ${k.tone}`}>{k.n}<span className="ml-1 text-xs font-normal text-muted-foreground">{pct(k.n)}%</span></p>
          </div>
        ))}
      </div>

      {stats.empty.length > 0 && !loading && (
        <p className="mt-4 text-sm text-amber-700">
          No live deals yet in: {stats.empty.map((k) => LIVE_DEAL_CATEGORIES[k]).join(", ")}.
        </p>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Object.entries(LIVE_DEAL_CATEGORIES).map(([key, label]) => {
          const p = stats.per[key];
          const priced = p.total ? Math.round(((p.source + p.estimate) / p.total) * 100) : 0;
          return (
            <div key={key} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{label}</p>
                <p className="text-[11px] text-muted-foreground">{p.total} live · {p.fresh} this week</p>
              </div>
              <Badge variant="outline" className={p.total === 0 ? "border-rose-200 text-rose-600" : priced >= 80 ? "border-emerald-200 text-emerald-700" : "border-amber-200 text-amber-700"}>
                {p.total === 0 ? "empty" : `${priced}% priced`}
              </Badge>
            </div>
          );
        })}
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Re-price up to 30 deals?</AlertDialogTitle>
            <AlertDialogDescription>
              {needsPricing} deals have a flat benchmark or no price. This values the next 30 against comparable source-priced deals,
              using a few AI calls (Gemini Pro) that count towards the daily AI budget. Prices change on the investor platform straight away, labelled as estimates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={reprice}>Re-price</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
