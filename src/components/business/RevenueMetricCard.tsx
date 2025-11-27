import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface RevenueMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  gradient?: string;
}

export function RevenueMetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  gradient = "from-primary/5 to-primary/10"
}: RevenueMetricCardProps) {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group bg-card">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none`} />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {trend && (
            <Badge 
              variant={trend.direction === "up" ? "default" : "destructive"} 
              className="gap-1 animate-fade-in"
            >
              {trend.direction === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
