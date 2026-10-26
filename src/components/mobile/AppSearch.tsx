import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MobileSearchOverlay } from "./MobileSearchOverlay";

interface Result {
  id: string;
  title: string;
  description?: string;
  category?: string;
  path?: string;
}

type Area = "investor" | "finance";

// Screens a user can jump to. Kept short and to the screens people use most.
const PAGES: Record<Area, { title: string; path: string; keywords: string }[]> = {
  investor: [
    { title: "Dashboard", path: "/investor/dashboard", keywords: "home overview" },
    { title: "Research", path: "/investor/research", keywords: "reports analysis" },
    { title: "Stock research", path: "/investor/stock-research", keywords: "equities shares" },
    { title: "Crypto research", path: "/investor/crypto-research", keywords: "bitcoin digital assets" },
    { title: "Opportunities", path: "/investor/opportunities", keywords: "deals alternatives private" },
    { title: "Stocks & crypto database", path: "/investor/stocks-crypto", keywords: "tickers coins" },
    { title: "Market commentary", path: "/investor/commentary", keywords: "markets news" },
    { title: "Watchlists", path: "/investor/watchlists", keywords: "follow track" },
    { title: "Alerts", path: "/investor/alerts", keywords: "notifications signals" },
    { title: "AI Analyst", path: "/investor/ai-analyst", keywords: "chat assistant ask" },
    { title: "Fund database", path: "/investor/fund-database", keywords: "etf funds" },
    { title: "Screeners", path: "/investor/screeners", keywords: "filter screen" },
    { title: "Deal flow", path: "/investor/deal-flow", keywords: "funding rounds startups" },
    { title: "Newsletters", path: "/investor/newsletters", keywords: "email digest" },
    { title: "Learning", path: "/investor/learning", keywords: "education courses" },
    { title: "Portfolios", path: "/investor/portfolios", keywords: "model holdings" },
  ],
  finance: [
    { title: "Dashboard", path: "/dashboard", keywords: "home overview" },
    { title: "Clients", path: "/clients", keywords: "crm households" },
    { title: "Financial planning", path: "/financial-planning", keywords: "plans cashflow" },
    { title: "Reports", path: "/finance/reports", keywords: "research" },
    { title: "Opportunities", path: "/finance/opportunities", keywords: "deals" },
    { title: "Fund database", path: "/finance/fund-database", keywords: "etf funds" },
    { title: "Market commentary", path: "/finance/commentary", keywords: "markets news" },
    { title: "AI Analyst", path: "/finance/ai-analyst", keywords: "chat assistant" },
    { title: "Compliance", path: "/compliance", keywords: "regulation consumer duty" },
    { title: "Calendar", path: "/calendar", keywords: "meetings diary" },
    { title: "Settings", path: "/settings", keywords: "account profile security" },
  ],
};

const RECENT_KEY = (area: Area) => `fp-recent-search-${area}`;

const readRecent = (area: Area): string[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY(area)) ?? "[]"); } catch { return []; }
};

const clean = (q: string) => q.replace(/[%,()*]/g, " ").trim();

async function search(area: Area, q: string): Promise<Result[]> {
  const term = q.toLowerCase();
  const pages: Result[] = PAGES[area]
    .filter((p) => `${p.title} ${p.keywords}`.toLowerCase().includes(term))
    .map((p) => ({ id: `page:${p.path}`, title: p.title, category: "Go to", path: p.path }));

  const like = `%${clean(q)}%`;
  const [opps, assets] = await Promise.all([
    supabase.from("opportunity_products").select("id,title,category,location")
      .or(`title.ilike.${like},category.ilike.${like}`).limit(5),
    supabase.from("stocks_crypto").select("id,symbol,name,asset_type")
      .or(`symbol.ilike.${like},name.ilike.${like}`).limit(5),
  ]);

  const oppPath = (id: string) => (area === "investor" ? `/investor/opportunities/${id}` : "/finance/opportunities");
  const assetPath = area === "investor" ? "/investor/stocks-crypto" : "/finance/stocks-crypto";
  return [
    ...pages,
    ...(assets.data ?? []).map((a: any) => ({
      id: `asset:${a.id}`, title: `${a.symbol} · ${a.name}`, category: a.asset_type === "crypto" ? "Crypto" : "Stock", path: assetPath,
    })),
    ...(opps.data ?? []).map((o: any) => ({
      id: `opp:${o.id}`, title: o.title, description: [o.category, o.location].filter(Boolean).join(" · "), category: "Opportunity", path: oppPath(o.id),
    })),
  ];
}

interface Props {
  area: Area;
  isOpen: boolean;
  onClose: () => void;
  placeholder: string;
}

export function AppSearchOverlay({ area, isOpen, onClose, placeholder }: Props) {
  const navigate = useNavigate();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => readRecent(area));
  const seq = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const lastQuery = useRef("");

  useEffect(() => () => clearTimeout(timer.current), []);

  const onSearch = (q: string) => {
    lastQuery.current = q;
    clearTimeout(timer.current);
    if (q.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const id = ++seq.current;
    timer.current = setTimeout(async () => {
      try {
        const r = await search(area, q.trim());
        if (id === seq.current) setResults(r);
      } catch {
        if (id === seq.current) setResults([]);
      } finally {
        if (id === seq.current) setLoading(false);
      }
    }, 250);
  };

  const remember = (q: string) => {
    const next = [q, ...recent.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 6);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY(area), JSON.stringify(next)); } catch { /* storage unavailable */ }
  };

  return (
    <MobileSearchOverlay
      isOpen={isOpen}
      onClose={onClose}
      placeholder={placeholder}
      onSearch={onSearch}
      results={results}
      isLoading={loading}
      recentSearches={recent}
      onSelectResult={(r) => {
        if (lastQuery.current.trim()) remember(lastQuery.current.trim());
        onClose();
        if (r.path) navigate(r.path);
      }}
    />
  );
}
