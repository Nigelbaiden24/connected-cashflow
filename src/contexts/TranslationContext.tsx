import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (text: string) => string;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// In-memory cache for translations
const translationCache: Record<string, Record<string, string>> = {};

// Pending texts queue for batching requests
const pendingTexts: Set<string> = new Set();
let batchTimeout: number | null = null;

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fast path: check localStorage first, only hit DB if non-English
    const stored = localStorage.getItem("preferredLanguage");
    if (stored && stored !== "en") {
      setLanguageState(stored);
    }
    // Immediately unblock rendering - don't wait for DB
    setIsLoading(false);

    // Background sync from DB (non-blocking)
    const syncFromDB = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("user_profiles")
            .select("language")
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (data?.language && data.language !== language) {
            setLanguageState(data.language);
            localStorage.setItem("preferredLanguage", data.language);
          }
        }
      } catch {
        // Silent fail - localStorage is already applied
      }
    };

    // Defer DB call to after paint
    requestAnimationFrame(() => { syncFromDB(); });
  }, []);

  const setLanguage = (lang: string) => {
    // Clear all cached translations for the old language
    if (translationCache[language]) {
      delete translationCache[language];
    }
    
    setLanguageState(lang);
    localStorage.setItem("preferredLanguage", lang);
    
    // Notify listeners that language changed
    window.dispatchEvent(new Event("languagechange"));
  };

  const translateBatch = async (texts: string[]) => {
    if (language === "en") return;

    const uniqueTexts = Array.from(new Set(texts));
    const textsToTranslate = uniqueTexts.filter(
      text => !translationCache[language]?.[text]
    );

    if (textsToTranslate.length === 0) return;

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate-content", {
        body: { texts: textsToTranslate, targetLanguage: language },
      });

      if (error) throw error;

      if (data?.translations) {
        if (!translationCache[language]) {
          translationCache[language] = {};
        }

        textsToTranslate.forEach((text, index) => {
          translationCache[language][text] = data.translations[index];
        });

        // Force re-render
        window.dispatchEvent(new Event("translationsloaded"));
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const t = (text: string): string => {
    if (!text || language === "en") return text;

    // Return cached translation if available
    if (translationCache[language]?.[text]) {
      return translationCache[language][text];
    }

    // Queue for translation (batched to avoid rate limits)
    if (!pendingTexts.has(text)) {
      pendingTexts.add(text);
    }

    if (batchTimeout === null) {
      batchTimeout = window.setTimeout(() => {
        const textsToProcess = Array.from(pendingTexts);
        pendingTexts.clear();
        batchTimeout = null;
        translateBatch(textsToProcess);
      }, 150);
    }

    // Return original text while waiting for translation
    return text;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, isTranslating }}>
      {isLoading ? null : children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return context;
}
