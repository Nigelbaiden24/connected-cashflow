import { FeaturedAnalystPicksSection } from "@/components/market/FeaturedAnalystPicksSection";
import { TranslatedText } from "@/components/TranslatedText";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const FeaturedPicks = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <TranslatedText>Featured Analyst Picks</TranslatedText>
          </h1>
          <p className="text-muted-foreground">
            <TranslatedText>Weekly curated investment opportunities from our research team</TranslatedText>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <TranslatedText>This Week's Top Picks</TranslatedText>
          </CardTitle>
          <CardDescription>
            <TranslatedText>Our analysts have selected these opportunities based on fundamental analysis, technical indicators, and market conditions</TranslatedText>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeaturedAnalystPicksSection />
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturedPicks;
