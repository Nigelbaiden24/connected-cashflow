import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockScreener } from "@/components/investor/StockScreener";
import { CompanyScreener } from "@/components/investor/CompanyScreener";
import { SectorScreener } from "@/components/investor/SectorScreener";
import { RiskScreener } from "@/components/investor/RiskScreener";
import { GrowthScreener } from "@/components/investor/GrowthScreener";
import { InsiderActivityScreener } from "@/components/investor/InsiderActivityScreener";
import { AIDiscoveryScreener } from "@/components/investor/AIDiscoveryScreener";

export default function FinanceScreenersDiscovery() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Screeners & Discovery</h1>
        <p className="text-muted-foreground mt-2">Find investment opportunities with advanced AI-powered screening tools</p>
      </div>

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
    </div>
  );
}
