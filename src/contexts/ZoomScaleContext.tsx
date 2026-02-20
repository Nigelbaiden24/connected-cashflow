import { createContext, useContext, useRef, MutableRefObject } from "react";

interface ZoomScaleContextValue {
  scaleRef: MutableRefObject<number>;
}

const ZoomScaleContext = createContext<ZoomScaleContextValue>({
  scaleRef: { current: 1 },
});

export function ZoomScaleProvider({
  scaleRef,
  children,
}: {
  scaleRef: MutableRefObject<number>;
  children: React.ReactNode;
}) {
  return (
    <ZoomScaleContext.Provider value={{ scaleRef }}>
      {children}
    </ZoomScaleContext.Provider>
  );
}

/**
 * Returns the current pinch-zoom scale (1 = 100%).
 * Read from a ref so it's always up-to-date without re-renders.
 */
export function useZoomScale(): number {
  const { scaleRef } = useContext(ZoomScaleContext);
  return scaleRef.current;
}

export function useZoomScaleRef(): MutableRefObject<number> {
  const { scaleRef } = useContext(ZoomScaleContext);
  return scaleRef;
}
