import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { TranslatedText } from "@/components/TranslatedText";

export default function Languages() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <TranslatedText as="h1" className="text-3xl font-bold mb-2">
          Language Settings
        </TranslatedText>
        <TranslatedText as="p" className="text-muted-foreground">
          Choose your preferred language for the investor platform interface
        </TranslatedText>
      </div>
      <LanguageSettings />
    </div>
  );
}
