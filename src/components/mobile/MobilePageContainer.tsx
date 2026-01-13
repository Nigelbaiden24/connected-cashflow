import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobilePageContainerProps {
  children: ReactNode;
  className?: string;
  hasBottomNav?: boolean;
  hasStickyHeader?: boolean;
}

/**
 * Container component that handles mobile-specific spacing and safe areas.
 * Use this as the main wrapper for page content on mobile.
 */
export function MobilePageContainer({
  children,
  className,
  hasBottomNav = false,
  hasStickyHeader = true,
}: MobilePageContainerProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full",
        "md:pb-0", // No bottom padding on desktop
        hasBottomNav && "pb-20", // Account for bottom nav on mobile
        hasStickyHeader && "pt-0", // Header handles its own spacing
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileContentProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

/**
 * Content wrapper with proper padding for mobile screens.
 */
export function MobileContent({
  children,
  className,
  padded = true,
}: MobileContentProps) {
  return (
    <div
      className={cn(
        "w-full",
        padded && "px-4 py-4 md:px-6 md:py-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileSectionProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

/**
 * Section component for organizing content on mobile screens.
 */
export function MobileSection({
  children,
  title,
  className,
}: MobileSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      {title && (
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
