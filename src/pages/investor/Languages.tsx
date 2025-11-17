import { LanguageSettings } from "@/components/settings/LanguageSettings";

export default function Languages() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Language Settings</h1>
        <p className="text-muted-foreground">
          Choose your preferred language for the investor platform interface
        </p>
      </div>
      <LanguageSettings />
    </div>
  );
}
