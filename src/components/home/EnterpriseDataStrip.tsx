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
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 md:py-16 border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-400/80 font-semibold mb-2">
            Enterprise Data Suite
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Institutional-grade capabilities, modular by design
          </h2>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
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
                className="group flex-shrink-0 snap-start w-[150px] md:w-[170px] aspect-[5/4] rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-white/10 hover:border-blue-400/50 hover:from-blue-950/40 hover:to-slate-900 transition-all duration-300 p-4 flex flex-col items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5 text-blue-300" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-semibold text-white text-center leading-tight">
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
