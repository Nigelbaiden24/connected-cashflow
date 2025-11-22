import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AILeadScoringBadgeProps {
  score: number;
  conversionProbability?: number;
  size?: "sm" | "default" | "lg";
}

export function AILeadScoringBadge({ score, conversionProbability, size = "default" }: AILeadScoringBadgeProps) {
  const getScoreDetails = () => {
    if (score >= 75) {
      return {
        label: "Hot Lead",
        variant: "default" as const,
        icon: TrendingUp,
        color: "text-green-600 dark:text-green-400"
      };
    } else if (score >= 50) {
      return {
        label: "Warm Lead",
        variant: "secondary" as const,
        icon: Brain,
        color: "text-yellow-600 dark:text-yellow-400"
      };
    } else {
      return {
        label: "Cold Lead",
        variant: "outline" as const,
        icon: AlertTriangle,
        color: "text-muted-foreground"
      };
    }
  };

  const details = getScoreDetails();
  const Icon = details.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={details.variant} className={`${size === 'sm' ? 'text-xs' : ''} cursor-help`}>
            <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />
            {score}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="font-medium">{details.label}</div>
            <div className="text-xs">Lead Score: {score}/100</div>
            {conversionProbability !== undefined && (
              <div className="text-xs">
                Conversion: {(conversionProbability * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}