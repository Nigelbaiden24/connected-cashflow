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

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [pendingTranslations, setPendingTranslations] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load language preference
    const loadLanguage = async () => {
      try {
        // Try to load from database first
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("user_profiles")
            .select("language")
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (data?.language) {
            setLanguageState(data.language);
            localStorage.setItem("preferredLanguage", data.language);
          } else {
            // Fallback to localStorage if no DB entry
            const stored = localStorage.getItem("preferredLanguage");
            if (stored && stored !== "en") {
              setLanguageState(stored);
            }
          }
        } else {
          // No user, check localStorage
          const stored = localStorage.getItem("preferredLanguage");
          if (stored && stored !== "en") {
            setLanguageState(stored);
          }
        }
      } catch (error) {
        console.error("Error loading language:", error);
        // Fallback to localStorage on error
        const stored = localStorage.getItem("preferredLanguage");
        if (stored && stored !== "en") {
          setLanguageState(stored);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = (lang: string) => {
    // Clear all cached translations for the old language
    if (translationCache[language]) {
      delete translationCache[language];
    }
    
    setLanguageState(lang);
    localStorage.setItem("preferredLanguage", lang);
    
    // Clear pending translations when language changes
    setPendingTranslations(new Set());
    
    // Trigger a re-render by forcing state update
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

    // Queue for translation
    if (!pendingTranslations.has(text)) {
      setPendingTranslations(prev => {
        const newSet = new Set(prev);
        newSet.add(text);
        
        // Batch translate after a short delay
        setTimeout(() => {
          translateBatch(Array.from(newSet));
          setPendingTranslations(new Set());
        }, 100);
        
        return newSet;
      });
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
