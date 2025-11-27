import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TranslateRequest {
  texts: string[];
  targetLanguage: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese (Simplified)",
  ar: "Arabic",
  hi: "Hindi",
  tr: "Turkish",
  nl: "Dutch",
  pl: "Polish",
  sv: "Swedish",
  da: "Danish",
  fi: "Finnish",
  no: "Norwegian",
  cs: "Czech",
  tw: "Twi",
  yo: "Yoruba",
  ig: "Igbo",
  ha: "Hausa",
  sw: "Swahili",
  zu: "Zulu",
  xh: "Xhosa",
  am: "Amharic",
  so: "Somali",
  af: "Afrikaans",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts, targetLanguage }: TranslateRequest = await req.json();
    
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      throw new Error("Texts array is required");
    }

    if (!targetLanguage) {
      throw new Error("Target language is required");
    }

    // If target language is English, return original texts
    if (targetLanguage === "en") {
      return new Response(
        JSON.stringify({ translations: texts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

    // Use Lovable AI to translate
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the provided English texts to ${languageName}. Return ONLY a JSON array of translated strings in the exact same order as the input. Do not include any explanations or additional text. Maintain any HTML tags, placeholders like {variable}, or special formatting exactly as they appear.`
          },
          {
            role: "user",
            content: JSON.stringify(texts)
          }
        ],
        model: "google/gemini-2.5-flash",
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        console.error("AI translation rate limited");
        return new Response(
          JSON.stringify({ error: "AI translation rate limit exceeded. Please wait a moment and try again." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (aiResponse.status === 402) {
        console.error("AI translation payment required");
        return new Response(
          JSON.stringify({ error: "AI translation credits exhausted. Please top up your Lovable AI balance." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      throw new Error(`AI translation failed: ${aiResponse.status} ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    let translatedContent = aiData.choices[0].message.content;

    // Parse the response - it should be a JSON array
    try {
      // Remove markdown code blocks if present
      translatedContent = translatedContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const translations = JSON.parse(translatedContent);
      
      if (!Array.isArray(translations) || translations.length !== texts.length) {
        throw new Error("Invalid translation response format");
      }

      return new Response(
        JSON.stringify({ translations }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      console.error("Failed to parse translations:", translatedContent);
      throw new Error("Failed to parse translation response");
    }
  } catch (error: any) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);
