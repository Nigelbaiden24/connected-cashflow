import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { TranslatedText } from "@/components/TranslatedText";

const Settings = () => {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <TranslatedText as="h1" className="text-3xl font-bold">
          Settings
        </TranslatedText>
        <TranslatedText as="p" className="text-muted-foreground">
          Choose your preferred language for the platform
        </TranslatedText>
      </div>

      <LanguageSettings />
    </div>
  );
};

export default Settings;
