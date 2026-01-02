import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, Medal } from "lucide-react";
import type { FundRatings } from "@/types/fund";

interface StarRatingProps {
  rating: 1 | 2 | 3 | 4 | 5;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ rating, showLabel = false, size = 'sm' }: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                className={`${sizeClasses[size]} ${
                  s <= rating 
                    ? 'text-amber-500 fill-amber-500' 
                    : 'text-muted-foreground/20'
                }`}
              />
            ))}
            {showLabel && (
              <span className="ml-1 text-xs text-muted-foreground">{rating}★</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <p className="font-medium">Morningstar Star Rating: {rating}/5</p>
            <p className="text-muted-foreground">
              {rating === 5 ? 'Top 10% in category' :
               rating === 4 ? 'Next 22.5% in category' :
               rating === 3 ? 'Middle 35% in category' :
               rating === 2 ? 'Next 22.5% in category' :
               'Bottom 10% in category'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface AnalystRatingBadgeProps {
  rating: 'Gold' | 'Silver' | 'Bronze' | 'Neutral' | 'Negative';
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function AnalystRatingBadge({ rating, showIcon = true, size = 'sm' }: AnalystRatingBadgeProps) {
  const styles: Record<string, string> = {
    'Gold': 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 border-amber-500/40 shadow-amber-500/10',
    'Silver': 'bg-gradient-to-r from-slate-400/20 to-gray-400/20 text-slate-600 border-slate-400/40 shadow-slate-500/10',
    'Bronze': 'bg-gradient-to-r from-orange-600/20 to-amber-700/20 text-orange-700 border-orange-600/40 shadow-orange-500/10',
    'Neutral': 'bg-muted text-muted-foreground border-border',
    'Negative': 'bg-red-500/15 text-red-600 border-red-500/40 shadow-red-500/10'
  };

  const icons: Record<string, string> = {
    'Gold': '🥇',
    'Silver': '🥈',
    'Bronze': '🥉',
    'Neutral': '',
    'Negative': '⚠️'
  };

  const descriptions: Record<string, string> = {
    'Gold': 'Best-in-class fund with strong conviction in future outperformance',
    'Silver': 'High conviction in future risk-adjusted outperformance',
    'Bronze': 'Above average prospects for risk-adjusted outperformance',
    'Neutral': 'Unlikely to deliver meaningful outperformance vs peers',
    'Negative': 'Serious concerns about ability to deliver value to investors'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${styles[rating]} border ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'} font-semibold shadow-sm`}
          >
            {showIcon && icons[rating] && <span className="mr-1">{icons[rating]}</span>}
            {rating}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px]">
          <div className="space-y-1 text-xs">
            <p className="font-medium">Analyst Rating: {rating}</p>
            <p className="text-muted-foreground">{descriptions[rating]}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface PillarRatingProps {
  ratings: FundRatings;
  compact?: boolean;
}

export function PillarRatings({ ratings, compact = true }: PillarRatingProps) {
  const pillars = [
    { key: 'peopleRating', label: 'People', short: 'P' },
    { key: 'processRating', label: 'Process', short: 'Pr' },
    { key: 'parentRating', label: 'Parent', short: 'Pa' },
    { key: 'performanceRating', label: 'Performance', short: 'Pe' },
    { key: 'priceRating', label: 'Price', short: '$' }
  ] as const;

  const getColor = (value?: string) => {
    if (value === 'High' || value === 'Above Average') return 'bg-emerald-500';
    if (value === 'Average') return 'bg-muted-foreground/50';
    if (value === 'Below Average' || value === 'Low') return 'bg-amber-500';
    return 'bg-muted-foreground/20';
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex gap-0.5">
              {pillars.map((pillar) => (
                <div 
                  key={pillar.key}
                  className={`w-2 h-2 rounded-full ${getColor(ratings[pillar.key])}`}
                />
              ))}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1.5 text-xs">
              <p className="font-medium mb-2">Pillar Ratings</p>
              {pillars.map((pillar) => (
                <div key={pillar.key} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{pillar.label}:</span>
                  <span className="font-medium">{ratings[pillar.key] || 'Not rated'}</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-1">
      {pillars.map((pillar) => (
        <TooltipProvider key={pillar.key}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center gap-0.5">
                <div className={`w-3 h-3 rounded-full ${getColor(ratings[pillar.key])}`} />
                <span className="text-[9px] text-muted-foreground">{pillar.short}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{pillar.label}: {ratings[pillar.key] || 'Not rated'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}

interface FundRatingsSummaryProps {
  ratings?: FundRatings;
  layout?: 'horizontal' | 'vertical';
}

export function FundRatingsSummary({ ratings, layout = 'horizontal' }: FundRatingsSummaryProps) {
  if (!ratings) {
    return (
      <span className="text-xs text-muted-foreground italic">Not rated</span>
    );
  }

  if (layout === 'vertical') {
    return (
      <div className="space-y-2">
        {ratings.starRating && (
          <div className="flex items-center gap-2">
            <StarRating rating={ratings.starRating} />
          </div>
        )}
        {ratings.analystRating && (
          <AnalystRatingBadge rating={ratings.analystRating} />
        )}
        {(ratings.peopleRating || ratings.processRating) && (
          <PillarRatings ratings={ratings} />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {ratings.starRating && <StarRating rating={ratings.starRating} />}
      {ratings.analystRating && <AnalystRatingBadge rating={ratings.analystRating} size="sm" />}
      {(ratings.peopleRating || ratings.processRating) && (
        <PillarRatings ratings={ratings} compact />
      )}
    </div>
  );
}
