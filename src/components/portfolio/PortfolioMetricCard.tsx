import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortfolioMetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: number[];
  variant?: "default" | "success" | "warning" | "primary";
}

export function PortfolioMetricCard({
  title,
  value,
  change,
  changeLabel = "today",
  icon,
  trend,
  variant = "default",
}: PortfolioMetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  const variantClasses = {
    default: "bg-card border-border/50",
    success: "bg-gradient-to-br from-success/5 to-success/10 border-success/20",
    warning: "bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20",
    primary: "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20",
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        variantClasses[variant]
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="pt-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {icon && <div className="text-muted-foreground">{icon}</div>}
            </div>
          </div>
          
          {trend && (
            <div className="w-20 h-12 opacity-50">
              <svg
                viewBox="0 0 100 50"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <polyline
                  points={trend
                    .map((value, i) => `${(i / (trend.length - 1)) * 100},${50 - value}`)
                    .join(" ")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={isPositive ? "text-success" : "text-destructive"}
                />
              </svg>
            </div>
          )}
        </div>

        {change !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className={cn("font-medium", isPositive ? "text-success" : "text-destructive")}>
              {isPositive ? "+" : ""}
              {typeof change === "number" ? change.toFixed(2) : change}%
            </span>
            <span className="text-muted-foreground">{changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
