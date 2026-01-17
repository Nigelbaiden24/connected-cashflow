import { cn } from "@/lib/utils";

export interface EventCategory {
  id: string;
  label: string;
  color: string;
  borderColor: string;
  dotColor: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  { 
    id: "meeting", 
    label: "Meeting", 
    color: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    borderColor: "border-l-blue-500",
    dotColor: "bg-blue-500"
  },
  { 
    id: "presentation", 
    label: "Presentation", 
    color: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
    borderColor: "border-l-purple-500",
    dotColor: "bg-purple-500"
  },
  { 
    id: "deadline", 
    label: "Deadline", 
    color: "bg-red-500/20 text-red-700 dark:text-red-300",
    borderColor: "border-l-red-500",
    dotColor: "bg-red-500"
  },
  { 
    id: "call", 
    label: "Call", 
    color: "bg-green-500/20 text-green-700 dark:text-green-300",
    borderColor: "border-l-green-500",
    dotColor: "bg-green-500"
  },
  { 
    id: "review", 
    label: "Review", 
    color: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    borderColor: "border-l-amber-500",
    dotColor: "bg-amber-500"
  },
  { 
    id: "focus", 
    label: "Focus Time", 
    color: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
    borderColor: "border-l-cyan-500",
    dotColor: "bg-cyan-500"
  },
  { 
    id: "tentative", 
    label: "Tentative", 
    color: "bg-gray-400/20 text-gray-600 dark:text-gray-400",
    borderColor: "border-l-gray-400 border-dashed",
    dotColor: "bg-gray-400"
  },
  { 
    id: "out_of_office", 
    label: "Out of Office", 
    color: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
    borderColor: "border-l-pink-500",
    dotColor: "bg-pink-500"
  },
];

export const PROVIDER_CATEGORIES: EventCategory[] = [
  { 
    id: "google", 
    label: "Google Calendar", 
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    borderColor: "border-l-blue-600",
    dotColor: "bg-blue-600"
  },
  { 
    id: "outlook", 
    label: "Outlook", 
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    borderColor: "border-l-orange-500",
    dotColor: "bg-orange-500"
  },
];

export function getEventCategory(type: string, provider?: string): EventCategory {
  if (provider === 'google') {
    return PROVIDER_CATEGORIES.find(c => c.id === 'google')!;
  }
  if (provider === 'outlook') {
    return PROVIDER_CATEGORIES.find(c => c.id === 'outlook')!;
  }
  return EVENT_CATEGORIES.find(c => c.id === type) || EVENT_CATEGORIES[0];
}

export function getEventDotColor(type: string, provider?: string): string {
  const category = getEventCategory(type, provider);
  return category.dotColor;
}

interface CalendarColorLegendProps {
  showProviders?: boolean;
  compact?: boolean;
  className?: string;
}

export function CalendarColorLegend({ 
  showProviders = false, 
  compact = false,
  className 
}: CalendarColorLegendProps) {
  const categories = showProviders 
    ? [...EVENT_CATEGORIES.slice(0, 5), ...PROVIDER_CATEGORIES]
    : EVENT_CATEGORIES.slice(0, 6);

  return (
    <div className={cn(
      "flex flex-wrap gap-2",
      compact ? "gap-1.5" : "gap-3",
      className
    )}>
      {categories.map((category) => (
        <div 
          key={category.id}
          className={cn(
            "flex items-center gap-1.5",
            compact ? "text-xs" : "text-sm"
          )}
        >
          <span className={cn(
            "rounded-full",
            category.dotColor,
            compact ? "h-2 w-2" : "h-2.5 w-2.5"
          )} />
          <span className="text-muted-foreground">{category.label}</span>
        </div>
      ))}
    </div>
  );
}
