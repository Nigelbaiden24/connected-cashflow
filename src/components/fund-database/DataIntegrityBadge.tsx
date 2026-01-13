import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock, Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { isVerifiedFund, isValidISINFormat, type DataQualityFlag } from '@/lib/fundDataIntegrity';

interface DataIntegrityBadgeProps {
  isin: string;
  showDetails?: boolean;
  className?: string;
}

export function DataIntegrityBadge({ isin, showDetails = false, className = '' }: DataIntegrityBadgeProps) {
  const isVerified = isVerifiedFund(isin);
  const isValidFormat = isValidISINFormat(isin);

  if (isVerified) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 ${className}`}
            >
              <CheckCircle2 className="h-3 w-3" />
              {showDetails && <span>Verified</span>}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Verified Real Fund</p>
            <p className="text-xs text-muted-foreground">ISIN verified against FCA register</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isValidFormat) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 ${className}`}
            >
              <Clock className="h-3 w-3" />
              {showDetails && <span>Pending</span>}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Verification Pending</p>
            <p className="text-xs text-muted-foreground">Valid ISIN format, awaiting confirmation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`bg-red-500/10 text-red-600 border-red-500/30 gap-1 ${className}`}
          >
            <AlertCircle className="h-3 w-3" />
            {showDetails && <span>Invalid</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Invalid ISIN</p>
          <p className="text-xs text-muted-foreground">This fund cannot be verified</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface DataQualityIndicatorProps {
  flags: DataQualityFlag[];
  className?: string;
}

export function DataQualityIndicator({ flags, className = '' }: DataQualityIndicatorProps) {
  if (flags.includes('verified')) {
    return (
      <div className={`flex items-center gap-1.5 text-emerald-600 ${className}`}>
        <Shield className="h-4 w-4" />
        <span className="text-xs font-medium">Real Fund Data</span>
      </div>
    );
  }

  if (flags.includes('simulated_performance') || flags.includes('simulated_nav_history')) {
    return (
      <div className={`flex items-center gap-1.5 text-amber-600 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-xs font-medium">Illustrative Data</span>
      </div>
    );
  }

  if (flags.includes('stale_data')) {
    return (
      <div className={`flex items-center gap-1.5 text-muted-foreground ${className}`}>
        <Clock className="h-4 w-4" />
        <span className="text-xs font-medium">Data may be outdated</span>
      </div>
    );
  }

  return null;
}

export function DataPendingLabel({ field, className = '' }: { field: string; className?: string }) {
  return (
    <span className={`text-xs text-muted-foreground italic ${className}`}>
      Data Pending
    </span>
  );
}
