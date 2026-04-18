import { useNavigate } from "react-router-dom";
import {
  Newspaper,
  BarChart3,
  Briefcase,
  Eye,
  Filter,
  Radar,
  Bell,
  Database,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export const ENTERPRISE_CATEGORIES = [
  { slug: "market-commentary", label: "Market Commentary", icon: Newspaper },
  { slug: "benchmarking", label: "Benchmarking", icon: BarChart3 },
  { slug: "model-portfolios", label: "Model Portfolios", icon: Briefcase },
  { slug: "watchlists", label: "Watchlists", icon: Eye },
  { slug: "screeners-discovery", label: "Screeners & Discovery", icon: Filter },
  { slug: "opportunity-intelligence", label: "Opportunity Intelligence", icon: Radar },
  { slug: "signals-alerts", label: "Signals & Alerts", icon: Bell },
  { slug: "fund-etf-database", label: "Fund & ETF Database", icon: Database },
  { slug: "learning-hub", label: "Learning Hub", icon: GraduationCap },
] as const;

export function EnterpriseDataStrip() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <section className="relative bg-gradient-to-b from-white via-blue-50/40 to-white py-12 md:py-16 border-y border-blue-100/60">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600 font-semibold mb-2">
            Enterprise Data Suite
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Institutional-grade capabilities, modular by design
          </h2>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 text-slate-700"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 text-slate-700"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div
            ref={scrollRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {ENTERPRISE_CATEGORIES.map(({ slug, label, icon: Icon }) => (
              <button
                key={slug}
                onClick={() => {
                  navigate(`/enterprise-data/${slug}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group flex-shrink-0 snap-start w-[150px] md:w-[170px] aspect-[5/4] rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all duration-300 p-4 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-[0_8px_30px_rgba(59,130,246,0.18)]"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/15 to-cyan-500/10 border border-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-semibold text-slate-800 text-center leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
