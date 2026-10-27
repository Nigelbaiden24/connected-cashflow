import { useEffect, useMemo, useState } from "react";
import {
  Activity, BookOpen, ExternalLink, Flame, Newspaper, PanelRightClose, PanelRightOpen, Pin, TrendingDown, TrendingUp, X,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  type PulseItem, type Timeframe, TIMEFRAMES, changeOf, fmtPct, fmtPrice, timeAgo, useMarketPulse, usePulseConfig,
} from "@/lib/marketPulse";

const COLLAPSE_KEY = "fp_market_pulse_collapsed";
const TF_KEY = "fp_market_pulse_tf";
const TICKER_TF_KEY = "fp_market_ticker_tf";

function useStoredState<T extends string>(key: string, initial: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => { try { return (localStorage.getItem(key) as T) || initial; } catch { return initial; } });
  return [v, (next: T) => { setV(next); try { localStorage.setItem(key, next); } catch { /* ignore */ } }];
}

const tone = (v: number | null) => (v == null ? "text-muted-foreground" : v > 0 ? "text-emerald-600 dark:text-emerald-400" : v < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground");

function SectionTitle({ icon: Icon, children, aside }: { icon: React.ElementType; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Icon className="h-3.5 w-3.5" />{children}</h3>
      {aside}
    </div>
  );
}

function Movers({ movers, tf, setTf }: { movers: PulseItem[]; tf: Timeframe; setTf: (t: Timeframe) => void }) {
  const [asset, setAsset] = useState<"all" | "stock" | "crypto">("all");
  const list = movers.filter((m) => asset === "all" || (asset === "stock" ? m.asset_type !== "crypto" : m.asset_type === "crypto"))
    .filter((m) => changeOf(m, tf) != null);
  const sorted = [...list].sort((a, b) => changeOf(b, tf)! - changeOf(a, tf)!);
  const gainers = sorted.filter((m) => changeOf(m, tf)! > 0).slice(0, 4);
  const losers = sorted.filter((m) => changeOf(m, tf)! < 0).reverse().slice(0, 4);
  return (
    <section>
      <SectionTitle icon={Activity}>Top movers</SectionTitle>
      <div className="mb-2 flex gap-1">
        {TIMEFRAMES.map((t) => (
          <button key={t.key} onClick={() => setTf(t.key)} className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${tf === t.key ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>{t.label}</button>
        ))}
        <span className="flex-1" />
        {(["all", "stock", "crypto"] as const).map((a) => (
          <button key={a} onClick={() => setAsset(a)} className={`rounded-md px-1.5 py-0.5 text-[11px] capitalize transition ${asset === a ? "text-foreground underline underline-offset-4" : "text-muted-foreground hover:text-foreground"}`}>{a === "stock" ? "Stocks" : a}</button>
        ))}
      </div>
      {sorted.length === 0 ? (
        <p className="text-xs text-muted-foreground">No {tf.toUpperCase()} data yet.</p>
      ) : (
        <div className="space-y-0.5">
          {gainers.map((m) => <MoverRow key={m.id} m={m} tf={tf} />)}
          {gainers.length > 0 && losers.length > 0 && <div className="my-1 border-t border-dashed" />}
          {losers.map((m) => <MoverRow key={m.id} m={m} tf={tf} />)}
        </div>
      )}
    </section>
  );
}

function MoverRow({ m, tf }: { m: PulseItem; tf: Timeframe }) {
  const v = changeOf(m, tf);
  const row = (
    <div className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-muted/60">
      {m.image_url ? <img src={m.image_url} alt="" className="h-5 w-5 rounded-full" loading="lazy" /> :
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[8px] font-bold">{(m.symbol ?? "?").slice(0, 3)}</span>}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">{m.symbol} <span className="font-normal text-muted-foreground">{m.title !== m.symbol ? m.title : ""}</span></p>
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground">{fmtPrice(m.price, m.currency ?? "USD")}</span>
      <span className={`w-16 text-right text-xs font-semibold tabular-nums ${tone(v)}`}>{fmtPct(v)}</span>
    </div>
  );
  if (!m.why) return row;
  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger asChild><div className="cursor-help">{row}</div></HoverCardTrigger>
      <HoverCardContent side="left" className="w-72 text-xs">
        <p className="font-semibold">Why {m.symbol} is moving</p>
        <p className="mt-1 leading-relaxed text-muted-foreground">{m.why}</p>
        {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 inline-flex items-center gap-1 text-primary hover:underline">Read the story <ExternalLink className="h-3 w-3" /></a>}
      </HoverCardContent>
    </HoverCard>
  );
}

function PulseContent({ items, updatedAt }: { items: PulseItem[]; updatedAt: number }) {
  const [tf, setTf] = useStoredState<Timeframe>(TF_KEY, "1d");
  const news = items.filter((i) => i.kind === "news");
  const trending = items.filter((i) => i.kind === "trending");
  const reads = items.filter((i) => i.kind === "article");
  const movers = items.filter((i) => i.kind === "mover");
  const newest = items.reduce<string | null>((a, i) => (!a || (i.published_at ?? i.created_at) > a ? (i.published_at ?? i.created_at) : a), null);

  if (!items.length) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Market Pulse will appear here after the first refresh.</p>;
  }

  return (
    <div className="space-y-6">
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
        Updated {timeAgo(newest ?? new Date(updatedAt).toISOString())}
      </p>

      {trending.length > 0 && (
        <section>
          <SectionTitle icon={Flame}>Trending now & why</SectionTitle>
          <div className="space-y-2">
            {trending.map((t) => (
              <a key={t.id} href={t.url ?? undefined} target="_blank" rel="noopener noreferrer nofollow"
                className="group block rounded-xl border bg-gradient-to-br from-orange-500/[0.06] to-transparent p-3 transition hover:border-orange-300/60">
                <p className="flex items-start gap-1.5 text-sm font-semibold leading-snug">
                  {t.pinned && <Pin className="mt-0.5 h-3 w-3 shrink-0 text-orange-500" />}{t.title}
                </p>
                {t.why && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.why}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {(t.tags ?? []).map((s) => <span key={s} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">{s}</span>)}
                  <span className="ml-auto truncate text-[10px] text-muted-foreground">{t.source}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <Movers movers={movers} tf={tf} setTf={setTf} />

      {news.length > 0 && (
        <section>
          <SectionTitle icon={Newspaper}>Latest investment news</SectionTitle>
          <div className="divide-y">
            {news.map((n) => (
              <a key={n.id} href={n.url ?? undefined} target="_blank" rel="noopener noreferrer nofollow" className="group block py-2.5">
                <p className="line-clamp-2 text-[13px] font-medium leading-snug transition group-hover:text-primary">{n.title}</p>
                {n.summary && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.summary}</p>}
                <p className="mt-1 text-[10px] text-muted-foreground">{n.source} · {timeAgo(n.published_at)}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {reads.length > 0 && (
        <section>
          <SectionTitle icon={BookOpen}>Helpful reads</SectionTitle>
          <div className="space-y-1.5">
            {reads.map((r) => (
              <a key={r.id} href={r.url ?? undefined} target="_blank" rel="noopener noreferrer nofollow"
                className="group flex items-start gap-2 rounded-lg p-2 transition hover:bg-muted/60">
                <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[13px] font-medium leading-snug group-hover:text-primary">{r.title}</p>
                  {r.summary && <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{r.summary}</p>}
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{r.source}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
      <p className="pb-4 text-[10px] leading-relaxed text-muted-foreground">Links open publicly available third-party sources. News and summaries are for information only and are not investment advice.</p>
    </div>
  );
}

/** Right-hand Market Pulse panel (desktop) plus a floating button and sheet on smaller screens. */
export function MarketPulseSidebar() {
  const { data: cfg } = usePulseConfig();
  const { data: items = [], dataUpdatedAt, isError } = useMarketPulse();
  const [collapsed, setCollapsed] = useStoredState<"0" | "1">(COLLAPSE_KEY, "0");
  const [sheetOpen, setSheetOpen] = useState(false);
  if (cfg && !cfg.sidebar_enabled) return null;
  if (isError) return null; // e.g. before the migration is applied

  return (
    <>
      <aside className={`hidden xl:block shrink-0 border-l bg-background/70 backdrop-blur transition-[width] duration-300 ${collapsed === "1" ? "w-12" : "w-[340px]"}`}>
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex items-center justify-between border-b px-3 py-3">
            {collapsed !== "1" && <span className="text-sm font-semibold tracking-tight">Market Pulse</span>}
            <button onClick={() => setCollapsed(collapsed === "1" ? "0" : "1")} aria-label={collapsed === "1" ? "Open Market Pulse" : "Collapse Market Pulse"}
              className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              {collapsed === "1" ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
            </button>
          </div>
          {collapsed !== "1" && (
            <div className="flex-1 overflow-y-auto px-4 pb-16 pt-3">
              <PulseContent items={items} updatedAt={dataUpdatedAt} />
            </div>
          )}
        </div>
      </aside>

      <button onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-4 z-30 flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-xs font-semibold text-background shadow-lg md:bottom-16 xl:hidden">
        <Flame className="h-3.5 w-3.5 text-orange-400" /> Market Pulse
      </button>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[92vw] overflow-y-auto sm:max-w-md">
          <SheetHeader><SheetTitle>Market Pulse</SheetTitle></SheetHeader>
          <div className="mt-4"><PulseContent items={items} updatedAt={dataUpdatedAt} /></div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** Footer ticker of stock and crypto moves over a chosen timeframe. */
export function MarketTicker() {
  const { data: cfg } = usePulseConfig();
  const { data: items = [], isError } = useMarketPulse();
  const [tf, setTf] = useStoredState<Timeframe>(TICKER_TF_KEY, "1d");
  const [hidden, setHidden] = useState(false);
  const movers = useMemo(() => items.filter((i) => i.kind === "mover" && changeOf(i, tf) != null)
    .sort((a, b) => (a.asset_type === b.asset_type ? a.rank - b.rank : a.asset_type === "index" ? -1 : b.asset_type === "index" ? 1 : 0)), [items, tf]);
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);

  if (hidden || isError || (cfg && !cfg.ticker_enabled) || movers.length === 0) return null;
  const strip = (dup: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={dup}>
      {movers.map((m) => {
        const v = changeOf(m, tf);
        return (
          <span key={`${dup}-${m.id}`} title={m.why ?? undefined} className="flex items-center gap-1.5 whitespace-nowrap px-4 text-xs">
            <span className="font-semibold text-white">{m.symbol}</span>
            <span className="text-slate-400 tabular-nums">{fmtPrice(m.price, m.currency ?? "USD")}</span>
            <span className={`flex items-center gap-0.5 font-semibold tabular-nums ${v! >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {v! >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{fmtPct(v)}
            </span>
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 hidden h-9 items-center border-t border-white/10 bg-[#070b16]/95 text-white backdrop-blur md:flex">
      <div className="flex h-full shrink-0 items-center gap-0.5 border-r border-white/10 bg-[#070b16] px-2">
        {TIMEFRAMES.map((t) => (
          <button key={t.key} onClick={() => setTf(t.key)}
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${tf === t.key ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"}`}>{t.label}</button>
        ))}
      </div>
      <div className="fp-ticker-wrap relative flex-1 overflow-hidden">
        <div className={`flex w-max ${reduced ? "" : "fp-ticker-track"}`} style={{ ["--fp-ticker-dur" as any]: `${Math.max(30, movers.length * 4)}s` }}>
          {strip(false)}{!reduced && strip(true)}
        </div>
      </div>
      <button onClick={() => setHidden(true)} aria-label="Hide ticker" className="shrink-0 px-2 text-slate-500 hover:text-white"><X className="h-3.5 w-3.5" /></button>
      <style>{`@keyframes fp-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.fp-ticker-track { animation: fp-ticker var(--fp-ticker-dur) linear infinite; }
.fp-ticker-wrap:hover .fp-ticker-track { animation-play-state: paused; }`}</style>
    </div>
  );
}

