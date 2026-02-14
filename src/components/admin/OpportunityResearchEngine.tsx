import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Search,
  Loader2,
  Globe,
  Brain,
  Sparkles,
  TrendingUp,
  Building2,
  Briefcase,
  Gem,
  BarChart3,
  Zap,
  FileText,
} from "lucide-react";

const categoryConfig: Record<string, { label: string; icon: any; subCategories: string[] }> = {
  uk_property: {
    label: "UK Property",
    icon: Building2,
    subCategories: ["B2F", "B2L", "HMO", "R2R", "B2SA", "Commercial Property", "Land", "Parking Spaces"],
  },
  vehicles: {
    label: "Vehicles",
    icon: Briefcase,
    subCategories: ["Classic Cars", "Luxury Vehicles", "Motorcycles", "Commercial Vehicles"],
  },
  overseas_property: {
    label: "Overseas Property & Land",
    icon: Building2,
    subCategories: ["Residential Overseas", "Commercial Overseas", "Land Overseas", "Development Projects"],
  },
  businesses: {
    label: "Businesses",
    icon: Briefcase,
    subCategories: ["SMEs", "Startups", "Franchises", "Established Businesses"],
  },
  stocks: {
    label: "Stocks",
    icon: TrendingUp,
    subCategories: ["UK Equities", "US Equities", "International Equities", "Penny Stocks"],
  },
  crypto: {
    label: "Crypto & Digital Assets",
    icon: Gem,
    subCategories: ["Cryptocurrency", "NFTs", "Digital Tokens", "DeFi"],
  },
  private_equity: {
    label: "Private Equity",
    icon: Briefcase,
    subCategories: ["Growth Equity", "Buyouts", "Venture Capital", "Mezzanine"],
  },
  memorabilia: {
    label: "Memorabilia",
    icon: Gem,
    subCategories: ["Sports Memorabilia", "Entertainment", "Historical Items", "Signed Items"],
  },
  commodities: {
    label: "Commodities & Hard Assets",
    icon: BarChart3,
    subCategories: ["Gold", "Silver", "Precious Metals", "Raw Materials"],
  },
  funds: {
    label: "Funds",
    icon: Building2,
    subCategories: ["Mutual Funds", "ETFs", "Hedge Funds", "REITs"],
  },
};

type ResearchPhase = "idle" | "scraping" | "analyzing" | "complete" | "error";

export function OpportunityResearchEngine() {
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [phase, setPhase] = useState<ResearchPhase>("idle");
  const [aiOutput, setAiOutput] = useState("");
  const [activeView, setActiveView] = useState<"research" | "history">("research");
  const abortRef = useRef<AbortController | null>(null);

  const handleResearch = async () => {
    if (!category && !customQuery) {
      toast.error("Select a category or enter a custom query");
      return;
    }

    abortRef.current = new AbortController();
    setPhase("scraping");
    setAiOutput("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      toast.info("Scraping live data from multiple sources...");

      // Small delay to show scraping phase
      await new Promise((r) => setTimeout(r, 1500));
      setPhase("analyzing");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/opportunity-research`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category: category || "stocks",
            subCategory,
            customQuery: customQuery || undefined,
          }),
          signal: abortRef.current.signal,
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response stream");
      }

      // Parse SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              setAiOutput((prev) => prev + content);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      setPhase("complete");
      toast.success("Research complete!");
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Research error:", error);
      setPhase("error");
      toast.error(error.message || "Research failed");
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setPhase("idle");
    setAiOutput("");
  };

  const isRunning = phase === "scraping" || phase === "analyzing";
  const categoryData = category ? categoryConfig[category] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-6 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-7 w-7" />
              AI Research Engine
            </h2>
            <p className="text-white/80 mt-1">
              Deep research across live sources — scrapes, analyses, and generates investment briefs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-white/30 text-white bg-white/10">
              <Zap className="h-3 w-3 mr-1" />
              Firecrawl + AI
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white bg-white/10">
              10 Categories
            </Badge>
          </div>
        </div>
      </div>

      {/* Research Controls */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-purple-600" />
            Research Configuration
          </CardTitle>
          <CardDescription>
            Select a category to scrape live market data, or enter a custom research query
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Category */}
            <div className="space-y-2">
              <Label>Investment Category</Label>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v);
                  setSubCategory("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <cfg.icon className="h-4 w-4" />
                        {cfg.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub-Category */}
            <div className="space-y-2">
              <Label>Sub-Category (Optional)</Label>
              <Select value={subCategory} onValueChange={setSubCategory} disabled={!category}>
                <SelectTrigger>
                  <SelectValue placeholder="All sub-categories" />
                </SelectTrigger>
                <SelectContent>
                  {categoryData?.subCategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Query */}
            <div className="space-y-2">
              <Label>Custom Search Query</Label>
              <Input
                placeholder="e.g. REIT opportunities Manchester 2025"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Chips */}
          {category && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                <Globe className="h-3 w-3 mr-1" />
                Web Search × 3 queries
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <FileText className="h-3 w-3 mr-1" />
                Direct Scrape × {categoryConfig[category]?.subCategories ? "2-3 sources" : "0"}
              </Badge>
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                <Brain className="h-3 w-3 mr-1" />
                AI Analysis & Summary
              </Badge>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleResearch}
              disabled={isRunning || (!category && !customQuery)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {phase === "scraping" ? "Scraping Sources..." : "AI Analyzing..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Deep Research
                </>
              )}
            </Button>
            {isRunning && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            {phase === "complete" && (
              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                ✓ Research Complete
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {isRunning && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  {phase === "scraping" ? "Phase 1: Live Data Scraping" : "Phase 2: AI Analysis"}
                </h4>
                <p className="text-sm text-slate-500">
                  {phase === "scraping"
                    ? "Scraping web search results and financial data sources via Firecrawl..."
                    : "AI is analyzing scraped data and generating investment brief..."}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    phase === "scraping" ? "bg-purple-500 animate-pulse" : "bg-green-500"
                  }`}
                />
                <div
                  className={`h-3 w-3 rounded-full ${
                    phase === "analyzing" ? "bg-purple-500 animate-pulse" : "bg-slate-200"
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {aiOutput && (
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-green-50 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              AI Research Brief
              {category && (
                <Badge variant="secondary" className="ml-2">
                  {categoryConfig[category]?.label}
                  {subCategory && ` → ${subCategory}`}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Generated from live scraped data — use this to create a new opportunity listing below
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ScrollArea className="h-[600px]">
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-slate-900 prose-h2:text-lg prose-h2:border-b prose-h2:pb-2 prose-h2:border-slate-200 prose-h3:text-base prose-strong:text-slate-900 prose-li:text-slate-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiOutput}</ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
