import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, Globe, Building2, Brain, Zap, Briefcase } from "lucide-react";
import { FinancialResearchScraper } from "./FinancialResearchScraper";
import { CompaniesHouseScraper } from "@/components/crm/CompaniesHouseScraper";
import { UKInvestorScanner } from "./UKInvestorScanner";
import { OpportunityResearchEngine } from "./OpportunityResearchEngine";
import { AIAutoScanner } from "./AIAutoScanner";

type AdminPlatform = "finance" | "investor";

const STORAGE_KEY = "admin-platform";

export function FlowPulseScraperHub() {
  const [platform, setPlatform] = useState<AdminPlatform>(() => {
    if (typeof window === "undefined") return "finance";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "investor" ? "investor" : "finance";
  });

  // Keep in sync if user switches platform from sidebar
  useEffect(() => {
    const handler = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setPlatform(stored === "investor" ? "investor" : "finance");
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 800);
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }, []);

  const isFinance = platform === "finance";

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-lg bg-white overflow-hidden">
        <CardHeader
          className={`border-b border-slate-100 bg-gradient-to-r ${
            isFinance
              ? "from-blue-50 via-cyan-50 to-transparent"
              : "from-violet-50 via-fuchsia-50 to-transparent"
          }`}
        >
          <CardTitle className="flex items-center gap-3 text-slate-900">
            <div
              className={`p-2.5 rounded-xl bg-gradient-to-br shadow-md ${
                isFinance ? "from-blue-600 to-cyan-600" : "from-violet-600 to-fuchsia-600"
              }`}
            >
              <Radar className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">FlowPulse Scraper</div>
              <div className="text-xs font-normal text-slate-500 mt-0.5">
                {isFinance
                  ? "Finance — Research, company & investor data scraping"
                  : "Investor — Opportunity, deal-flow & investor intelligence scraping"}
              </div>
            </div>
          </CardTitle>
          <CardDescription className="text-slate-500 pt-2">
            All scraper tools for the {isFinance ? "FlowPulse Finance" : "FlowPulse Investor"} platform, consolidated in one place.
          </CardDescription>
        </CardHeader>
      </Card>

      {isFinance ? (
        <Tabs defaultValue="financial-research" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="financial-research" className="gap-2">
              <Globe className="h-4 w-4" />
              Financial Research
            </TabsTrigger>
            <TabsTrigger value="companies-house" className="gap-2">
              <Building2 className="h-4 w-4" />
              Companies House
            </TabsTrigger>
            <TabsTrigger value="uk-investors" className="gap-2">
              <Briefcase className="h-4 w-4" />
              UK Investors
            </TabsTrigger>
          </TabsList>
          <TabsContent value="financial-research" className="mt-6">
            <FinancialResearchScraper />
          </TabsContent>
          <TabsContent value="companies-house" className="mt-6">
            <CompaniesHouseScraper />
          </TabsContent>
          <TabsContent value="uk-investors" className="mt-6">
            <UKInvestorScanner />
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="opportunity-engine" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="opportunity-engine" className="gap-2">
              <Brain className="h-4 w-4" />
              Opportunity Engine
            </TabsTrigger>
            <TabsTrigger value="ai-scanner" className="gap-2">
              <Zap className="h-4 w-4" />
              AI Auto Scanner
            </TabsTrigger>
            <TabsTrigger value="uk-investors" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Investor Finder
            </TabsTrigger>
          </TabsList>
          <TabsContent value="opportunity-engine" className="mt-6">
            <OpportunityResearchEngine />
          </TabsContent>
          <TabsContent value="ai-scanner" className="mt-6">
            <AIAutoScanner />
          </TabsContent>
          <TabsContent value="uk-investors" className="mt-6">
            <UKInvestorScanner />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
