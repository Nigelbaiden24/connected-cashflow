import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, Eye, Clock, FileText, Play } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface ContentItem {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  category?: string;
  created_at?: string | null;
  type: "research" | "commentary" | "portfolio" | "newsletter" | "learning" | "report";
  score?: number | null;
  extra?: string | null;
  route: string;
}

interface NetflixContentRowProps {
  title: string;
  icon: React.ReactNode;
  items: ContentItem[];
  accentColor?: string;
}

const typeConfig: Record<string, { gradient: string; badge: string }> = {
  research: { gradient: "from-blue-600/80 to-blue-900/90", badge: "Research" },
  commentary: { gradient: "from-emerald-600/80 to-emerald-900/90", badge: "Commentary" },
  portfolio: { gradient: "from-violet-600/80 to-violet-900/90", badge: "Portfolio" },
  newsletter: { gradient: "from-amber-600/80 to-amber-900/90", badge: "Newsletter" },
  learning: { gradient: "from-cyan-600/80 to-cyan-900/90", badge: "Learning" },
  report: { gradient: "from-rose-600/80 to-rose-900/90", badge: "Report" },
};

export function NetflixContentRow({ title, icon, items, accentColor = "primary" }: NetflixContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          {icon}
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <Badge variant="secondary" className="text-[10px] font-medium">{items.length}</Badge>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => scroll("left")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => scroll("right")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => {
          const config = typeConfig[item.type] || typeConfig.research;
          const isHovered = hoveredId === item.id;

          return (
            <Card
              key={item.id}
              className={`flex-shrink-0 w-[220px] snap-start cursor-pointer border-border/40 overflow-hidden transition-all duration-300 ${
                isHovered ? "scale-105 shadow-xl z-10 border-primary/40" : "hover:border-border/60"
              }`}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => navigate(item.route)}
            >
              {/* Thumbnail */}
              <div className={`relative h-[130px] bg-gradient-to-br ${config.gradient} flex items-center justify-center overflow-hidden`}>
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <FileText className="h-10 w-10 text-white/40" />
                )}

                {/* Overlay on hover */}
                <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <Eye className="h-4 w-4" /> View
                  </div>
                </div>

                {/* Score badge */}
                {item.score != null && item.score > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-[11px] font-bold text-white">{item.score}/10</span>
                  </div>
                )}

                {/* Type badge */}
                <Badge className="absolute bottom-2 left-2 text-[9px] bg-black/50 backdrop-blur-sm text-white border-none">
                  {config.badge}
                </Badge>
              </div>

              {/* Info */}
              <CardContent className="p-3 space-y-1.5">
                <h4 className="text-xs font-semibold leading-tight line-clamp-2">{item.title}</h4>
                {item.description && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
                  {item.category && <Badge variant="outline" className="text-[9px] h-4 px-1.5">{item.category}</Badge>}
                  {item.created_at && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
