import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const onChange = () => {
      const width = window.innerWidth;
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
    };
    
    const mqlMobile = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);
    const mqlTablet = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`);
    
    mqlMobile.addEventListener("change", onChange);
    mqlTablet.addEventListener("change", onChange);
    onChange();
    
    return () => {
      mqlMobile.removeEventListener("change", onChange);
      mqlTablet.removeEventListener("change", onChange);
    };
  }, []);

  return !!isTablet;
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  React.useEffect(() => {
    const onChange = () => {
      const width = window.innerWidth;
      if (width < MOBILE_BREAKPOINT) {
        setBreakpoint('mobile');
      } else if (width < TABLET_BREAKPOINT) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };
    
    window.addEventListener("resize", onChange);
    onChange();
    
    return () => window.removeEventListener("resize", onChange);
  }, []);

  return breakpoint;
}

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(hover: none)').matches
      );
    };
    checkTouch();
  }, []);

  return isTouch;
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const onChange = () => {
      if (window.screen?.orientation?.type) {
        setOrientation(
          window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape'
        );
      } else {
        setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
      }
    };

    window.addEventListener('orientationchange', onChange);
    window.addEventListener('resize', onChange);
    onChange();

    return () => {
      window.removeEventListener('orientationchange', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, []);

  return orientation;
}

export function useSafeArea() {
  const [safeArea, setSafeArea] = React.useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  React.useEffect(() => {
    const computeSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0', 10) || 
             parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10) ||
                parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10) ||
              parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10) ||
               parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)') || '0', 10),
      });
    };

    computeSafeArea();
    window.addEventListener('resize', computeSafeArea);
    return () => window.removeEventListener('resize', computeSafeArea);
  }, []);

  return safeArea;
}
