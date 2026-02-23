import { useState, useCallback, useEffect, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShowcaseItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  badges?: { label: string; className?: string }[];
  stats?: { label: string; value: string; className?: string }[];
  icon?: ReactNode;
  onClick?: () => void;
}

interface ContentShowcaseProps {
  items: ShowcaseItem[];
  onItemClick?: (item: ShowcaseItem) => void;
  emptyMessage?: string;
  renderCenterExtra?: (item: ShowcaseItem) => ReactNode;
}

export function ContentShowcase({ items, onItemClick, emptyMessage = "No items to display", renderCenterExtra }: ContentShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goLeft = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goRight = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goLeft();
      if (e.key === "ArrowRight") goRight();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goLeft, goRight]);

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const getItem = (offset: number) => {
    const idx = (activeIndex + offset + items.length) % items.length;
    return items[idx];
  };

  const visibleOffsets = [-3, -2, -1, 0, 1, 2, 3];
  const active = getItem(0);

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
          if (items.length <= Math.abs(offset)) return null;
          const item = getItem(offset);
          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);

          return (
            <div
              key={`${item.id}-${offset}`}
              onClick={() => {
                if (isCenter) {
                  onItemClick?.(item);
                  item.onClick?.();
                } else {
                  setActiveIndex((activeIndex + offset + items.length) % items.length);
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
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      {item.icon ? (
                        <div className={cn("text-primary/40", isCenter ? "scale-150" : "scale-100")}>
                          {item.icon}
                        </div>
                      ) : (
                        <div className={cn(
                          "rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold",
                          isCenter ? "h-16 w-16 text-2xl" : "h-8 w-8 text-sm"
                        )}>
                          {item.title.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Badges on center */}
                  {isCenter && item.badges && item.badges.length > 0 && (
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {item.badges.map((badge, i) => (
                        <Badge key={i} className={cn("text-xs", badge.className)}>
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Selection indicator */}
                  {isCenter && (
                    <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary z-10" />
                  )}
                </div>

                {/* Info — center card only */}
                {isCenter && (
                  <CardContent className="p-4 space-y-3 bg-gradient-to-b from-card to-card/95">
                    <div className="text-center space-y-1.5">
                      <h3 className="font-bold text-lg leading-tight line-clamp-2">{item.title}</h3>
                      {item.subtitle && (
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-sm text-muted-foreground text-center line-clamp-3">
                        {item.description}
                      </p>
                    )}

                    {/* Stats row */}
                    {item.stats && item.stats.length > 0 && (
                      <div className="flex items-center justify-center gap-4 text-sm">
                        {item.stats.map((stat, i) => (
                          <div key={i} className="text-center">
                            <span className={cn("font-bold", stat.className)}>{stat.value}</span>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {renderCenterExtra?.(item)}

                    <Button
                      className="w-full"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemClick?.(item);
                        item.onClick?.();
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
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {items.map((_, idx) => (
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
        {activeIndex + 1} / {items.length}
      </div>
    </div>
  );
}
