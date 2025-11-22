import { useTranslation } from "@/contexts/TranslationContext";
import { useEffect, useState } from "react";

interface TranslatedTextProps {
  children: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function TranslatedText({ children, className, as: Component = "span" }: TranslatedTextProps) {
  const { t } = useTranslation();
  const [translated, setTranslated] = useState(children);

  useEffect(() => {
    setTranslated(t(children));

    const handleTranslationsLoaded = () => {
      setTranslated(t(children));
    };

    window.addEventListener("translationsloaded", handleTranslationsLoaded);
    window.addEventListener("languagechange", handleTranslationsLoaded);

    return () => {
      window.removeEventListener("translationsloaded", handleTranslationsLoaded);
      window.removeEventListener("languagechange", handleTranslationsLoaded);
    };
  }, [children, t]);

  return <Component className={className}>{translated}</Component>;
}
