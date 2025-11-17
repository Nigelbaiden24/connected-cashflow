import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseAIAnalystProps {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export const useAIAnalyst = ({ onDelta, onDone, onError }: UseAIAnalystProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const analyzeWithAI = async (
    query: string,
    analysisType: string,
    company?: string
  ) => {
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(
        `https://wlsmdcdfyudtvbnbqfmn.supabase.co/functions/v1/ai-analyst`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query, analysisType, company }),
        }
      );

      if (!response.ok || !response.body) {
        const error = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(error.error || "Failed to get AI analysis");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onDelta(content);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      onDone();
    } catch (error) {
      console.error("AI analyst error:", error);
      onError(error instanceof Error ? error.message : "Failed to analyze");
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeWithAI, isLoading };
};
