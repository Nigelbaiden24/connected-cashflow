import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockScreener } from "@/components/investor/StockScreener";
import { CompanyScreener } from "@/components/investor/CompanyScreener";
import { SectorScreener } from "@/components/investor/SectorScreener";
import { RiskScreener } from "@/components/investor/RiskScreener";
import { GrowthScreener } from "@/components/investor/GrowthScreener";
import { InsiderActivityScreener } from "@/components/investor/InsiderActivityScreener";
import { AIDiscoveryScreener } from "@/components/investor/AIDiscoveryScreener";
import { ViewModeToggle } from "@/components/showcase/ViewModeToggle";
import { ShowcaseDarkToggle } from "@/components/showcase/ShowcaseDarkToggle";
import { ContentShowcase, ShowcaseItem } from "@/components/showcase/ContentShowcase";
import { StarryBackground } from "@/components/showcase/StarryBackground";
import { Search, TrendingUp, BarChart3, Shield, Sprout, Users, Sparkles } from "lucide-react";

export default function FinanceScreenersDiscovery() {
  const [viewMode, setViewMode] = useState<string>("grid");

  const screenerItems: ShowcaseItem[] = [
    { id: "ai", title: "AI Discovery", description: "AI-powered investment discovery engine", icon: <Sparkles className="h-10 w-10" />, badges: [{ label: "AI Powered", className: "bg-primary text-primary-foreground" }] },
    { id: "stock", title: "Stock Screener", description: "Filter stocks by fundamentals and technicals", icon: <TrendingUp className="h-10 w-10" /> },
    { id: "company", title: "Company Screener", description: "Analyse companies across sectors", icon: <Search className="h-10 w-10" /> },
    { id: "sector", title: "Sector Screener", description: "Compare sectors and industries", icon: <BarChart3 className="h-10 w-10" /> },
    { id: "risk", title: "Risk Screener", description: "Assess risk metrics across assets", icon: <Shield className="h-10 w-10" /> },
    { id: "growth", title: "Growth Screener", description: "Identify high-growth opportunities", icon: <Sprout className="h-10 w-10" /> },
    { id: "insider", title: "Insider Activity", description: "Track insider buying and selling", icon: <Users className="h-10 w-10" /> },
  ];

  return (
    <StarryBackground className="min-h-screen">
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Screeners & Discovery</h1>
          <p className="text-muted-foreground mt-2">Find investment opportunities with advanced AI-powered screening tools</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle value={viewMode} onChange={setViewMode} options={["grid", "showcase"]} />
          <ShowcaseDarkToggle />
        </div>
      </div>

      {viewMode === "showcase" ? (
        <ContentShowcase items={screenerItems} emptyMessage="No screeners available" />
      ) : (
      <Tabs defaultValue="ai-discovery" className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="ai-discovery">AI Discovery</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="sector">Sector</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="insider">Insider</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-discovery">
          <AIDiscoveryScreener />
        </TabsContent>

        <TabsContent value="stock">
          <StockScreener />
        </TabsContent>

        <TabsContent value="company">
          <CompanyScreener />
        </TabsContent>

        <TabsContent value="sector">
          <SectorScreener />
        </TabsContent>

        <TabsContent value="risk">
          <RiskScreener />
        </TabsContent>

        <TabsContent value="growth">
          <GrowthScreener />
        </TabsContent>

        <TabsContent value="insider">
          <InsiderActivityScreener />
        </TabsContent>
      </Tabs>
      )}
    </div>
    </StarryBackground>
  );
}
