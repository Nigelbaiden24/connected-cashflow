import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PracticeMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "success" | "warning" | "primary";
  sparkline?: number[];
}

export function PracticeMetricCard({
  title,
  value,
  subtitle,
  icon,
  trend = "neutral",
  trendValue,
  variant = "default",
  sparkline,
}: PracticeMetricCardProps) {
  const variantClasses = {
    default: "bg-card border-border/50",
    success: "bg-gradient-to-br from-success/5 to-success/10 border-success/20",
    warning: "bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20",
    primary: "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20",
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group",
        variantClasses[variant]
      )}
    >
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Sparkline background if provided */}
      {sparkline && sparkline.length > 0 && (
        <div className="absolute bottom-0 right-0 w-24 h-12 opacity-20">
          <svg
            viewBox="0 0 100 50"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <polyline
              points={sparkline
                .map((value, i) => `${(i / (sparkline.length - 1)) * 100},${50 - value}`)
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={cn(
                trend === "up" ? "text-success" : 
                trend === "down" ? "text-destructive" : 
                "text-muted-foreground"
              )}
            />
          </svg>
        </div>
      )}

      <CardContent className="pt-6 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm">
              {icon}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          
          {(subtitle || trendValue) && (
            <div className="flex items-center gap-2 text-sm">
              {trend !== "neutral" && trendValue && (
                <span className={cn(
                  "flex items-center gap-1 font-medium",
                  trend === "up" ? "text-success" : "text-destructive"
                )}>
                  {trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trendValue}
                </span>
              )}
              {subtitle && (
                <span className="text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
