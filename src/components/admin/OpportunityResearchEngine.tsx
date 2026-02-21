import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  Copy,
  Check,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Link2,
  ImageIcon,
  MapPin,
  DollarSign,
  AlertTriangle,
  Star,
  Database,
  Trash2,
  History,
  ChevronDown,
  ChevronUp,
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
    subCategories: [
      "Africa (Kenya, Ghana, Nigeria, Tanzania)",
      "South America (Colombia, Brazil, Peru)",
      "Southeast Asia (Philippines, Cambodia, Vietnam)",
      "Eastern Europe (Romania, Bulgaria, Georgia, Turkey)",
      "Southern Europe (Portugal, Spain, Greece)",
      "Caribbean & Central America",
      "Land Plots & Agricultural",
      "Development Projects",
    ],
  },
  businesses: {
    label: "Businesses/M&A",
    icon: Briefcase,
    subCategories: ["Startups", "Funding Rounds", "M&A Targets", "SMEs", "Franchises", "Established Businesses"],
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
  blockchain: {
    label: "Blockchain & Web3",
    icon: Zap,
    subCategories: ["DeFi Protocols", "Layer 2 Solutions", "Tokenized Assets (RWA)", "Blockchain Gaming", "DAOs", "Infrastructure"],
  },
};

type ResearchPhase = "idle" | "scraping" | "analyzing" | "complete" | "error";

interface SourceRecord {
  url: string;
  type: "search" | "scrape";
  query?: string;
  scrapedAt: string;
  status: "success" | "error";
  contentLength: number;
  error?: string;
}

interface ScrapedOpportunity {
  name: string;
  description: string;
  source_url: string;
  source_website: string;
  image_url: string;
  scraped_date: string;
  estimated_value: string;
  location: string;
  projected_returns: string;
  risk_level: string;
  analyst_rating: string;
  investment_thesis: string;
  key_metrics: Record<string, string>;
}

interface SourceMetadata {
  sources: SourceRecord[];
  searchResultUrls: string[];
  searchResults: { title: string; url: string; description: string; imageUrl?: string }[];
  researchDate: string;
  category: string;
  subCategory: string;
}

function parseOpportunities(text: string): ScrapedOpportunity[] {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsed)) return parsed;
    }
    // Try finding a raw JSON array
    const rawMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (rawMatch) {
      const parsed = JSON.parse(rawMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse opportunities JSON:", e);
  }
  return [];
}

function getMarketContext(text: string): string {
  const jsonIdx = text.indexOf("```json");
  if (jsonIdx > 0) return text.slice(0, jsonIdx).trim();
  const arrIdx = text.indexOf("[");
  if (arrIdx > 50) return text.slice(0, arrIdx).trim();
  return "";
}

const RISK_COLORS: Record<string, string> = {
  Low: "bg-green-100 text-green-800 border-green-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  High: "bg-red-100 text-red-800 border-red-200",
};

const RATING_COLORS: Record<string, string> = {
  "Strong Buy": "bg-emerald-100 text-emerald-800",
  Buy: "bg-green-100 text-green-800",
  Hold: "bg-amber-100 text-amber-800",
  Sell: "bg-red-100 text-red-800",
};

export function OpportunityResearchEngine() {
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [phase, setPhase] = useState<ResearchPhase>("idle");
  const [aiOutput, setAiOutput] = useState("");
  const [sourceMetadata, setSourceMetadata] = useState<SourceMetadata | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scrapeHistory, setScrapeHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const opportunities = phase === "complete" ? parseOpportunities(aiOutput) : [];
  const marketContext = phase === "complete" ? getMarketContext(aiOutput) : "";

  // Load scrape history
  const loadScrapeHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_scrape_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setScrapeHistory(data || []);
    } catch (err) {
      console.error("Failed to load scrape history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScrapeHistory();
  }, [loadScrapeHistory]);

  // Save scrape to database
  const saveScrapeToDb = useCallback(async (
    cat: string,
    subCat: string,
    query: string,
    sources: any,
    opps: ScrapedOpportunity[],
    rawOutput: string,
    context: string
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase
        .from('admin_scrape_history')
        .insert({
          user_id: session?.user?.id,
          category: cat,
          sub_category: subCat || null,
          custom_query: query || null,
          sources: sources || [],
          opportunities: opps as any,
          opportunities_count: opps.length,
          raw_output: rawOutput,
          market_context: context,
          status: 'complete',
        });
      if (error) throw error;
      toast.success("Scrape saved to database");
      loadScrapeHistory();
    } catch (err) {
      console.error("Failed to save scrape:", err);
      toast.error("Failed to save scrape to database");
    }
  }, [loadScrapeHistory]);

  const deleteScrapeRecord = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_scrape_history')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success("Scrape record deleted");
      setScrapeHistory(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      toast.error("Failed to delete record");
    }
  }, []);

  const handleCopy = useCallback(async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
      toast.success("Copied to clipboard — paste into Opportunity Upload");
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const copyOpportunityForUpload = useCallback((opp: ScrapedOpportunity) => {
    const text = `OPPORTUNITY: ${opp.name}
Description: ${opp.description}
Value: ${opp.estimated_value}
Location: ${opp.location}
Projected Returns: ${opp.projected_returns}
Risk Level: ${opp.risk_level}
Analyst Rating: ${opp.analyst_rating}
Investment Thesis: ${opp.investment_thesis}
Source: ${opp.source_website} — ${opp.source_url}
Scraped: ${opp.scraped_date}
Image: ${opp.image_url || "N/A"}
${opp.key_metrics ? `Metrics: ${JSON.stringify(opp.key_metrics)}` : ""}`;
    handleCopy(text, opp.name);
  }, [handleCopy]);

  const handleDownload = useCallback(() => {
    if (!aiOutput) return;
    const header = `# FlowPulse Opportunity Research\n**Category:** ${sourceMetadata?.category || category}\n**Date:** ${sourceMetadata?.researchDate || new Date().toISOString()}\n\n---\n\n`;
    const blob = new Blob([header + aiOutput], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowpulse-opportunities-${category || 'custom'}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  }, [aiOutput, sourceMetadata, category]);

  const handleResearch = async () => {
    if (!category && !customQuery) {
      toast.error("Select a category or enter a custom query");
      return;
    }

    abortRef.current = new AbortController();
    setPhase("scraping");
    setAiOutput("");
    setSourceMetadata(null);
    let accumulatedOutput = "";
    let capturedSourceMeta: SourceMetadata | null = null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      toast.info("Scraping live data from multiple sources...");
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

      if (!response.body) throw new Error("No response stream");

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
            if (parsed.type === "source_metadata") {
              capturedSourceMeta = parsed as SourceMetadata;
              setSourceMetadata(parsed as SourceMetadata);
              continue;
            }
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulatedOutput += content;
              setAiOutput((prev) => prev + content);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      setPhase("complete");
      // Auto-save the scrape to database
      const finalOpps = parseOpportunities(accumulatedOutput);
      const finalContext = getMarketContext(accumulatedOutput);
      saveScrapeToDb(category, subCategory, customQuery, capturedSourceMeta?.sources, finalOpps, accumulatedOutput, finalContext);
      toast.success("Research complete — individual opportunities found!");
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
    setSourceMetadata(null);
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
              AI Opportunity Scraper
            </h2>
            <p className="text-white/80 mt-1">
              Finds individual investment opportunities from across the web with full source attribution and images
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-white/30 text-white bg-white/10">
              <Zap className="h-3 w-3 mr-1" />
              Firecrawl + AI
            </Badge>
          </div>
        </div>
      </div>

      {/* Research Controls */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-purple-600" />
            Search for Opportunities
          </CardTitle>
          <CardDescription>
            Select a category to scrape individual investment opportunities from multiple web sources
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
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

            <div className="space-y-2">
              <Label>Custom Search Query</Label>
              <Input
                placeholder="e.g. REIT opportunities Manchester 2025"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleResearch}
              disabled={isRunning || (!category && !customQuery)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {phase === "scraping" ? "Scraping Sources..." : "Finding Opportunities..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Find Opportunities
                </>
              )}
            </Button>
            {isRunning && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            {phase === "complete" && opportunities.length > 0 && (
              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                ✓ {opportunities.length} Opportunities Found
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {isRunning && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  {phase === "scraping" ? "Phase 1: Scraping Web Sources" : "Phase 2: Extracting Individual Opportunities"}
                </h4>
                <p className="text-sm text-slate-500">
                  {phase === "scraping"
                    ? "Searching and scraping financial data sources via Firecrawl..."
                    : "AI is identifying specific investment opportunities with source attribution..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source Attribution Panel */}
      {sourceMetadata && (
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-transparent">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Link2 className="h-5 w-5 text-blue-600" />
              Data Sources & Provenance
              <Badge variant="secondary" className="ml-2">
                {sourceMetadata.sources.filter(s => s.status === "success").length}/{sourceMetadata.sources.length} successful
              </Badge>
            </CardTitle>
            <CardDescription>
              Research conducted on {new Date(sourceMetadata.researchDate).toLocaleString()} — {sourceMetadata.category} {sourceMetadata.subCategory !== "General" ? `→ ${sourceMetadata.subCategory}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="grid gap-2">
              {sourceMetadata.sources.map((source, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                    source.status === "success"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {source.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      {source.type === "search" ? (
                        <span className="font-medium">Search: "{source.query}"</span>
                      ) : (
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline truncate block">
                          {source.url}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <Badge variant="outline" className="text-xs">{source.type}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(source.scrapedAt).toLocaleTimeString()}
                    </span>
                    {source.error && <span className="text-xs text-red-600">{source.error}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Context */}
      {marketContext && phase === "complete" && (
        <Card className="border-slate-200">
          <CardContent className="py-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{marketContext}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Opportunity Cards */}
      {opportunities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Scraped Opportunities ({opportunities.length})
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download All
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {opportunities.map((opp, i) => (
              <Card key={i} className="border-slate-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                {/* Image */}
                {opp.image_url && (
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <img
                      src={opp.image_url}
                      alt={opp.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {opp.risk_level && (
                        <Badge className={`text-xs ${RISK_COLORS[opp.risk_level] || "bg-slate-100 text-slate-800"}`}>
                          {opp.risk_level} Risk
                        </Badge>
                      )}
                      {opp.analyst_rating && (
                        <Badge className={`text-xs ${RATING_COLORS[opp.analyst_rating] || "bg-slate-100 text-slate-800"}`}>
                          {opp.analyst_rating}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* No image fallback badges */}
                {!opp.image_url && (
                  <div className="flex gap-1 px-4 pt-4">
                    {opp.risk_level && (
                      <Badge className={`text-xs ${RISK_COLORS[opp.risk_level] || "bg-slate-100 text-slate-800"}`}>
                        {opp.risk_level} Risk
                      </Badge>
                    )}
                    {opp.analyst_rating && (
                      <Badge className={`text-xs ${RATING_COLORS[opp.analyst_rating] || "bg-slate-100 text-slate-800"}`}>
                        {opp.analyst_rating}
                      </Badge>
                    )}
                  </div>
                )}

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 leading-tight">{opp.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{opp.description}</p>
                  </div>

                  {/* Key details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {opp.estimated_value && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <DollarSign className="h-3.5 w-3.5 text-green-600" />
                        <span className="truncate">{opp.estimated_value}</span>
                      </div>
                    )}
                    {opp.location && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" />
                        <span className="truncate">{opp.location}</span>
                      </div>
                    )}
                    {opp.projected_returns && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="truncate">{opp.projected_returns}</span>
                      </div>
                    )}
                    {opp.scraped_date && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="truncate">{opp.scraped_date}</span>
                      </div>
                    )}
                  </div>

                  {/* Investment thesis */}
                  {opp.investment_thesis && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-md p-2.5">
                      <p className="text-xs font-semibold text-indigo-800 mb-0.5 flex items-center gap-1">
                        <Star className="h-3 w-3" /> Investment Thesis
                      </p>
                      <p className="text-xs text-indigo-700">{opp.investment_thesis}</p>
                    </div>
                  )}

                  {/* Key metrics */}
                  {opp.key_metrics && Object.keys(opp.key_metrics).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(opp.key_metrics).map(([k, v]) => (
                        <Badge key={k} variant="outline" className="text-[10px] py-0">
                          {k}: {v}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Separator />

                  {/* Source attribution */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Globe className="h-3 w-3" /> Source
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-700">{opp.source_website}</p>
                        {opp.source_url && (
                          <a
                            href={opp.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-600 hover:underline truncate block"
                          >
                            {opp.source_url}
                          </a>
                        )}
                      </div>
                      <a
                        href={opp.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 ml-2"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 hover:text-blue-600" />
                      </a>
                    </div>
                  </div>

                  {/* Copy button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    onClick={() => copyOpportunityForUpload(opp)}
                  >
                    {copiedId === opp.name ? (
                      <>
                        <Check className="h-3 w-3 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy for Opportunity Upload
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Raw AI output (fallback if no structured opportunities parsed) */}
      {aiOutput && phase === "complete" && opportunities.length === 0 && (
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-600" />
              Raw Research Output
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ScrollArea className="h-[500px]">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiOutput}</ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Scrape History Database Section */}
      <Card className="border-border shadow-lg">
        <CardHeader className="border-b cursor-pointer" onClick={() => setShowHistory(!showHistory)}>
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Scrape Database
              <Badge variant="secondary">{scrapeHistory.length} records</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); loadScrapeHistory(); }}>
                <History className="h-4 w-4" />
              </Button>
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardTitle>
          <CardDescription>All previous scrapes saved with date, source, category, and opportunities</CardDescription>
        </CardHeader>
        {showHistory && (
          <CardContent className="pt-4">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : scrapeHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No scrape history yet. Run a search to start building your database.</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {scrapeHistory.map((record) => {
                    const isExpanded = expandedHistoryId === record.id;
                    const recordOpps = Array.isArray(record.opportunities) ? record.opportunities : [];
                    return (
                      <div key={record.id} className="border rounded-lg overflow-hidden">
                        <div
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setExpandedHistoryId(isExpanded ? null : record.id)}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {record.category?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                                </Badge>
                                {record.sub_category && (
                                  <Badge variant="secondary" className="text-xs shrink-0">{record.sub_category}</Badge>
                                )}
                                <Badge className="text-xs shrink-0 bg-green-100 text-green-800 border-green-200">
                                  {record.opportunities_count || recordOpps.length} opportunities
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(record.created_at).toLocaleString()}</span>
                                {record.custom_query && (
                                  <span className="truncate max-w-[200px]">• Query: "{record.custom_query}"</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteScrapeRecord(record.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t p-4 space-y-3 bg-muted/20">
                            {/* Sources */}
                            {record.sources && Array.isArray(record.sources) && record.sources.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                                  <Link2 className="h-3 w-3" /> Sources ({record.sources.filter((s: any) => s.status === "success").length}/{record.sources.length} successful)
                                </p>
                                <div className="grid gap-1">
                                  {record.sources.map((src: any, si: number) => (
                                    <div key={si} className={`flex items-center gap-2 text-xs p-1.5 rounded ${src.status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                                      {src.status === "success" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                      <span className="truncate">{src.type === "search" ? `Search: "${src.query}"` : src.url}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Opportunities list */}
                            {recordOpps.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" /> Opportunities ({recordOpps.length})
                                </p>
                                <div className="grid gap-2 md:grid-cols-2">
                                  {recordOpps.map((opp: any, oi: number) => (
                                    <div key={oi} className="border rounded-md p-3 text-sm space-y-1 bg-background">
                                      <p className="font-semibold text-foreground">{opp.name}</p>
                                      <p className="text-xs text-muted-foreground line-clamp-2">{opp.description}</p>
                                      <div className="flex flex-wrap gap-1">
                                        {opp.estimated_value && <Badge variant="outline" className="text-[10px]">{opp.estimated_value}</Badge>}
                                        {opp.location && <Badge variant="outline" className="text-[10px]">{opp.location}</Badge>}
                                        {opp.risk_level && <Badge variant="outline" className="text-[10px]">{opp.risk_level} Risk</Badge>}
                                        {opp.funding_stage && <Badge variant="outline" className="text-[10px]">{opp.funding_stage}</Badge>}
                                      </div>
                                      {opp.source_url && (
                                        <a href={opp.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline flex items-center gap-1">
                                          <ExternalLink className="h-2.5 w-2.5" /> {opp.source_website || opp.source_url}
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Market context */}
                            {record.market_context && (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Market Context</p>
                                <p className="text-xs text-muted-foreground">{record.market_context.slice(0, 500)}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
