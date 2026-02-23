import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, TrendingUp, MapPin, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpportunityProduct {
  id: string;
  title: string;
  short_description: string;
  category: string;
  sub_category: string;
  price: number;
  price_currency: string;
  location: string;
  country: string;
  thumbnail_url: string;
  analyst_rating: string;
  overall_conviction_score: number;
  status: string;
  featured: boolean;
  created_at: string;
}

interface ShowcaseProps {
  opportunities: OpportunityProduct[];
  categoryConfig: Record<string, { label: string; icon: any; color: string }>;
  detailBasePath: string;
}

const ratingColors: Record<string, string> = {
  Gold: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  Silver: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  Bronze: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  Neutral: "bg-slate-500/20 text-slate-600 border-slate-500/30",
  Negative: "bg-red-500/20 text-red-600 border-red-500/30",
};

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export function OpportunityShowcase({ opportunities, categoryConfig, detailBasePath }: ShowcaseProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const goLeft = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + opportunities.length) % opportunities.length);
  }, [opportunities.length]);

  const goRight = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % opportunities.length);
  }, [opportunities.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goLeft();
      if (e.key === "ArrowRight") goRight();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goLeft, goRight]);

  if (opportunities.length === 0) return null;

  const getItem = (offset: number) => {
    const idx = (activeIndex + offset + opportunities.length) % opportunities.length;
    return opportunities[idx];
  };

  const active = getItem(0);
  const config = categoryConfig[active.category as keyof typeof categoryConfig];
  const Icon = config?.icon;

  // Show up to 2 items on each side
  const visibleOffsets = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <div className="relative w-full py-8 select-none">
      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goLeft}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-accent hover:scale-110 transition-all duration-200"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={goRight}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-accent hover:scale-110 transition-all duration-200"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Carousel strip */}
      <div className="flex items-center justify-center gap-2 md:gap-4 px-16 md:px-24 min-h-[420px]">
        {visibleOffsets.map((offset) => {
          if (opportunities.length <= Math.abs(offset)) return null;
          const item = getItem(offset);
          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);
          const itemConfig = categoryConfig[item.category as keyof typeof categoryConfig];
          const ItemIcon = itemConfig?.icon;

          return (
            <div
              key={`${item.id}-${offset}`}
              onClick={() => {
                if (isCenter) {
                  navigate(`${detailBasePath}/${item.id}`);
                } else {
                  setActiveIndex((activeIndex + offset + opportunities.length) % opportunities.length);
                }
              }}
              className={cn(
                "flex-shrink-0 cursor-pointer transition-all duration-500 ease-out",
                isCenter
                  ? "w-[280px] md:w-[340px] scale-100 opacity-100 z-20"
                  : absOffset === 1
                  ? "w-[140px] md:w-[180px] scale-90 opacity-70 z-10"
                  : absOffset === 2
                  ? "w-[90px] md:w-[120px] scale-75 opacity-40 z-5 hidden sm:block"
                  : "w-[60px] md:w-[80px] scale-60 opacity-20 z-0 hidden lg:block"
              )}
            >
              <Card
                className={cn(
                  "overflow-hidden border transition-all duration-500",
                  isCenter
                    ? "border-primary/50 shadow-2xl shadow-primary/10 ring-2 ring-primary/20"
                    : "border-border/30 shadow-md hover:border-border/60"
                )}
              >
                {/* Thumbnail */}
                <div className={cn(
                  "relative overflow-hidden bg-muted",
                  isCenter ? "aspect-[4/3]" : "aspect-square"
                )}>
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                      {ItemIcon && <ItemIcon className={cn("text-muted-foreground/40", isCenter ? "h-16 w-16" : "h-8 w-8")} />}
                    </div>
                  )}

                  {/* Badges only on center */}
                  {isCenter && item.featured && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                      <Star className="h-3 w-3 mr-1" /> Featured
                    </Badge>
                  )}
                  {isCenter && item.analyst_rating && (
                    <Badge className={`absolute top-2 right-2 text-xs ${ratingColors[item.analyst_rating]}`}>
                      {item.analyst_rating}
                    </Badge>
                  )}

                  {/* Selection indicator on center */}
                  {isCenter && (
                    <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary z-10" />
                  )}
                </div>

                {/* Info — only on center card */}
                {isCenter && (
                  <CardContent className="p-4 space-y-3 bg-gradient-to-b from-card to-card/95">
                    <div className="text-center space-y-1.5">
                      <h3 className="font-bold text-lg leading-tight line-clamp-2">{item.title}</h3>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", itemConfig?.color)}>
                          {itemConfig?.label}
                        </Badge>
                        {item.sub_category && (
                          <span className="text-xs text-muted-foreground">{item.sub_category}</span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground text-center line-clamp-2">
                      {item.short_description}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center justify-center gap-4 text-sm">
                      {item.price && (
                        <span className="font-bold text-primary">
                          {formatPrice(item.price, item.price_currency)}
                        </span>
                      )}
                      {item.overall_conviction_score && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                          <span className="font-medium">{item.overall_conviction_score.toFixed(1)}/5</span>
                        </div>
                      )}
                    </div>

                    {item.location && (
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{item.location}</span>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`${detailBasePath}/${item.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </Button>
                  </CardContent>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      {opportunities.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {opportunities.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "rounded-full transition-all duration-300",
                idx === activeIndex
                  ? "w-8 h-2.5 bg-primary"
                  : "w-2.5 h-2.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="text-center mt-3 text-sm text-muted-foreground">
        {activeIndex + 1} / {opportunities.length}
      </div>
    </div>
  );
}
