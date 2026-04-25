import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { INVESTOR_CATEGORIES } from "./investmentCategories";
import { saveScrapeResult } from "@/hooks/useScrapeAutoSave";
import {
  Sparkles,
  FileText,
  Download,
  RefreshCw,
  Check,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Loader2,
  Zap,
  Copy,
  Link2,
  ExternalLink,
} from "lucide-react";

interface ScrapedData {
  platform: string;
  content: string;
  scrapedAt: string;
  status: "success" | "error" | "pending";
  error?: string;
  scrapedUrls?: string[];
  totalUrls?: number;
}

interface OpportunityCandidate {
  title: string;
  category?: string;
  asset?: string;
  thesis?: string;
  key_data?: string;
  confidence?: string;
  source_url?: string;
}

interface AIReport {
  summary: string;
  keyInsights: string[];
  marketSentiment: string;
  topStories: string[];
  recommendations: string[];
  opportunityCandidates: OpportunityCandidate[];
  generatedAt: string;
}

export function InvestorResearchScraper() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([]);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("categories");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleCopy = useCallback(async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const scrapeCategories = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Select at least one investment category");
      return;
    }
    setIsScraping(true);
    setActiveTab("results");

    const cats = INVESTOR_CATEGORIES.filter((c) => selectedCategories.includes(c.id));

    setScrapedData((prev) => [
      ...prev,
      ...cats.map((c) => ({
        platform: `${c.emoji} ${c.label}`,
        content: "",
        scrapedAt: new Date().toISOString(),
        status: "pending" as const,
      })),
    ]);

    for (const cat of cats) {
      try {
        const { data, error } = await supabase.functions.invoke(
          "financial-research-scraper",
          { body: { categoryKey: cat.id } }
        );
        if (error) throw error;

        setScrapedData((prev) =>
          prev.map((item) =>
            item.platform === `${cat.emoji} ${cat.label}`
              ? {
                  ...item,
                  content: data.content || "No content extracted",
                  status: data.success ? "success" : "error",
                  scrapedAt: new Date().toISOString(),
                  error: data.success ? undefined : data.error,
                  scrapedUrls: data.scrapedUrls || [],
                  totalUrls: data.totalUrls || 0,
                }
              : item
          )
        );

        if (data?.success) {
          toast.success(
            `${cat.label}: scraped ${data.scrapedUrls?.length || 0}/${data.totalUrls || 0} sources`
          );
          saveScrapeResult({
            source: "investor-research",
            platform: "investor",
            title: `${cat.label} sweep`,
            category: cat.label,
            payload: data,
            sources: data.scrapedUrls,
            opportunitiesCount: data.scrapedUrls?.length || 0,
            rawOutput: data.content,
          });
        }
      } catch (err) {
        setScrapedData((prev) =>
          prev.map((item) =>
            item.platform === `${cat.emoji} ${cat.label}`
              ? {
                  ...item,
                  status: "error",
                  error: err instanceof Error ? err.message : "Failed to scrape",
                }
              : item
          )
        );
      }
    }

    setIsScraping(false);
    toast.success("Investor category sweep complete");
  };

  const generateAIReport = async () => {
    const successful = scrapedData.filter((d) => d.status === "success");
    if (successful.length === 0) {
      toast.error("No scraped data available. Scrape categories first.");
      return;
    }
    setIsGenerating(true);
    setActiveTab("report");

    try {
      const { data, error } = await supabase.functions.invoke(
        "financial-research-scraper",
        {
          body: {
            action: "generate-report",
            scrapedData: successful,
            customPrompt: customPrompt || undefined,
          },
        }
      );
      if (error) throw error;

      setAiReport({
        summary: data.summary || "",
        keyInsights: data.keyInsights || [],
        marketSentiment: data.marketSentiment || "Neutral",
        topStories: data.topStories || [],
        recommendations: data.recommendations || [],
        opportunityCandidates: Array.isArray(data.opportunityCandidates)
          ? data.opportunityCandidates
          : [],
        generatedAt: new Date().toISOString(),
      });
      toast.success("AI Investor Report generated");
      saveScrapeResult({
        source: "investor-research",
        platform: "investor",
        title: `AI Investor Report — ${new Date().toLocaleDateString("en-GB")}`,
        category: "AI Investor Report",
        payload: data,
        opportunities: data.opportunityCandidates,
        opportunitiesCount: Array.isArray(data.opportunityCandidates) ? data.opportunityCandidates.length : 0,
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!aiReport) return;
    const text = `# FlowPulse Investor Research Report
Generated: ${new Date(aiReport.generatedAt).toLocaleString()}

## Executive Summary
${aiReport.summary}

## Market Sentiment
${aiReport.marketSentiment}

## Key Insights
${aiReport.keyInsights.map((i, n) => `${n + 1}. ${i}`).join("\n")}

## Top Stories
${aiReport.topStories.map((s, n) => `${n + 1}. ${s}`).join("\n")}

## Recommendations
${aiReport.recommendations.map((r, n) => `${n + 1}. ${r}`).join("\n")}

## Opportunity Candidates
${aiReport.opportunityCandidates
  .map(
    (o, n) =>
      `${n + 1}. ${o.title}${o.asset ? ` — ${o.asset}` : ""}${o.thesis ? `\n   Thesis: ${o.thesis}` : ""}${o.source_url ? `\n   Source: ${o.source_url}` : ""}`
  )
  .join("\n")}
`;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `investor-research-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <Check className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600 animate-pulse" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Investor Research Scraper
          </h2>
          <p className="text-muted-foreground mt-1">
            Sweep curated investor sources by asset class — extracts news, key data &
            opportunity candidates
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={scrapeCategories}
            disabled={isScraping || selectedCategories.length === 0}
            className="gap-2"
          >
            {isScraping ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Scraping...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Scrape Categories ({selectedCategories.length})
              </>
            )}
          </Button>
          <Button
            onClick={generateAIReport}
            disabled={
              isGenerating || scrapedData.filter((d) => d.status === "success").length === 0
            }
            variant="secondary"
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate AI Report
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories" className="gap-2">
            <TrendingUp className="h-4 w-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <BarChart3 className="h-4 w-4" /> Scraped Data
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-2">
            <FileText className="h-4 w-4" /> AI Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-lg">Investor Investment Categories</CardTitle>
                  <CardDescription>
                    16 investor-focused asset classes — from listed equities to copy trading
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedCategories(INVESTOR_CATEGORIES.map((c) => c.id))
                    }
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategories([])}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {INVESTOR_CATEGORIES.map((cat) => {
                  const checked = selectedCategories.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        checked
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox checked={checked} className="mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl leading-none">{cat.emoji}</span>
                            <span className="font-medium truncate">{cat.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {cat.description}
                          </p>
                          <Badge variant="outline" className="text-xs mt-2">
                            {cat.sources.length} sources
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Custom AI Analysis Prompt (Optional)
              </CardTitle>
              <CardDescription>
                Add specific instructions for the AI when generating the investor report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="E.g., Highlight retail-friendly opportunities, focus on UK ISA-eligible products, summarise yields..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {scrapedData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No scraped data yet. Select categories and click "Scrape Categories".
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[700px]">
              <div className="space-y-4 pr-4">
                {scrapedData.map((data, index) => (
                  <Card
                    key={index}
                    className={`
                      ${data.status === "success" ? "border-green-500/30 bg-green-50/30 dark:bg-green-950/10" : ""}
                      ${data.status === "error" ? "border-red-500/30 bg-red-50/30 dark:bg-red-950/10" : ""}
                      ${data.status === "pending" ? "border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10" : ""}
                    `}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getStatusIcon(data.status)}
                          {data.platform}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {data.scrapedUrls && data.scrapedUrls.length > 0 && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Link2 className="h-3 w-3" />
                              {data.scrapedUrls.length}/{data.totalUrls || 0} pages
                            </Badge>
                          )}
                          <Badge
                            variant={
                              data.status === "success"
                                ? "default"
                                : data.status === "error"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {data.status}
                          </Badge>
                          {data.status === "success" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => handleCopy(data.content, `cat-${index}`)}
                            >
                              {copiedId === `cat-${index}` ? (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {data.status === "error" && (
                        <p className="text-sm text-red-600">{data.error}</p>
                      )}
                      {data.status === "success" && (
                        <ScrollArea className="h-[260px] rounded border bg-muted/30 p-3">
                          <pre className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.content.slice(0, 8000)}
                            {data.content.length > 8000 ? "\n…" : ""}
                          </pre>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          {!aiReport ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No AI report yet. Scrape categories then click "Generate AI Report".
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle>Investor Research AI Report</CardTitle>
                    <CardDescription>
                      Generated {new Date(aiReport.generatedAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Button onClick={downloadReport} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="font-semibold mb-2">Executive Summary</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {aiReport.summary}
                  </p>
                </section>
                <section>
                  <h3 className="font-semibold mb-2">Market Sentiment</h3>
                  <Badge variant="outline">{aiReport.marketSentiment}</Badge>
                </section>
                {aiReport.keyInsights.length > 0 && (
                  <section>
                    <h3 className="font-semibold mb-2">Key Insights</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {aiReport.keyInsights.map((i, n) => (
                        <li key={n}>{i}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {aiReport.opportunityCandidates.length > 0 && (
                  <section>
                    <h3 className="font-semibold mb-2">Opportunity Candidates</h3>
                    <div className="space-y-2">
                      {aiReport.opportunityCandidates.map((o, n) => (
                        <div key={n} className="rounded border p-3 bg-muted/30">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="font-medium text-sm">{o.title}</div>
                            {o.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {o.confidence}
                              </Badge>
                            )}
                          </div>
                          {o.asset && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Asset: {o.asset}
                            </div>
                          )}
                          {o.thesis && (
                            <div className="text-xs mt-1">{o.thesis}</div>
                          )}
                          {o.key_data && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {o.key_data}
                            </div>
                          )}
                          {o.source_url && (
                            <a
                              href={o.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary inline-flex items-center gap-1 mt-1"
                            >
                              Source <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {aiReport.recommendations.length > 0 && (
                  <section>
                    <h3 className="font-semibold mb-2">Recommendations</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {aiReport.recommendations.map((r, n) => (
                        <li key={n}>{r}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
