import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { SIMULATED_DATA_DISCLAIMER } from '@/lib/fundDataIntegrity';

interface DataIntegrityBannerProps {
  variant?: 'verified' | 'mixed' | 'info';
  className?: string;
}

export function DataIntegrityBanner({ variant = 'verified', className = '' }: DataIntegrityBannerProps) {
  if (variant === 'verified') {
    return (
      <Alert className={`border-emerald-500/30 bg-emerald-500/5 ${className}`}>
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-700 dark:text-emerald-400 font-semibold">
          Real Funds Only
        </AlertTitle>
        <AlertDescription className="text-emerald-600/80 dark:text-emerald-400/80 text-sm">
          All funds displayed have verified ISINs from FCA-registered providers. 
          Synthetic, placeholder, or AI-generated funds are not permitted.
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'mixed') {
    return (
      <Alert className={`border-amber-500/30 bg-amber-500/5 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700 dark:text-amber-400 font-semibold">
          Data Verification Notice
        </AlertTitle>
        <AlertDescription className="text-amber-600/80 dark:text-amber-400/80 text-sm">
          {SIMULATED_DATA_DISCLAIMER}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`border-blue-500/30 bg-blue-500/5 ${className}`}>
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-700 dark:text-blue-400 font-semibold">
        Fund Data Integrity
      </AlertTitle>
      <AlertDescription className="text-blue-600/80 dark:text-blue-400/80 text-sm">
        Only real, investable funds with verifiable identifiers are displayed. 
        Fields with missing real-world data are marked as "Data Pending".
      </AlertDescription>
    </Alert>
  );
}
