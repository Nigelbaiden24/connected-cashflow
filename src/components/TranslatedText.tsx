import { memo, useSyncExternalStore } from "react";
import { useTranslation } from "@/contexts/TranslationContext";

interface TranslatedTextProps {
  children: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

// Global revision counter that increments when translations load or language changes
let translationRevision = 0;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return translationRevision;
}

// Listen for translation events once globally (not per-instance)
if (typeof window !== "undefined") {
  const bump = () => {
    translationRevision++;
    listeners.forEach((cb) => cb());
  };
  window.addEventListener("translationsloaded", bump);
  window.addEventListener("languagechange", bump);
}

export const TranslatedText = memo(function TranslatedText({
  children,
  className,
  as: Component = "span",
}: TranslatedTextProps) {
  const { t } = useTranslation();
  // Subscribe to global revision so we re-render when translations arrive
  useSyncExternalStore(subscribe, getSnapshot);

  return <Component className={className}>{t(children)}</Component>;
});
