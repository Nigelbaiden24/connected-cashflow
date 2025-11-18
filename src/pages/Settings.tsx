import { LanguageSettings } from "@/components/settings/LanguageSettings";

const Settings = () => {
  return (
    <div className="flex-1 p-6 space-y-6 ml-64">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Choose your preferred language for the platform</p>
      </div>

      <LanguageSettings />
    </div>
  );
};

export default Settings;
