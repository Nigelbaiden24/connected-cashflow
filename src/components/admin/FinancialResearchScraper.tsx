import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe,
  Sparkles,
  FileText,
  Download,
  RefreshCw,
  Check,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Newspaper,
  Loader2,
  ChevronDown,
  ExternalLink,
  DollarSign,
  Activity,
  Zap,
  Copy,
  Link2,
  CheckCircle2,
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
}

interface ParsedContent {
  headlines: string[];
  stockMentions: string[];
  keyNumbers: string[];
  summaryPoints: string[];
  sources: string[];
}

interface ScrapedData {
  platform: string;
  content: string;
  scrapedAt: string;
  status: 'success' | 'error' | 'pending';
  error?: string;
  parsedContent?: ParsedContent;
  scrapedUrls?: string[];
  totalUrls?: number;
}

interface AIReport {
  summary: string;
  keyInsights: string[];
  marketSentiment: string;
  topStories: string[];
  recommendations: string[];
  generatedAt: string;
}

// Parse scraped markdown content into structured data
function parseScrapedContent(content: string): ParsedContent {
  const headlines: string[] = [];
  const stockMentions: string[] = [];
  const keyNumbers: string[] = [];
  const summaryPoints: string[] = [];
  const sources: string[] = [];

  // Extract headlines (lines starting with # or bold text)
  const headlineMatches = content.match(/^#+\s+.+$|^\*\*[^*]+\*\*/gm) || [];
  headlineMatches.forEach(h => {
    const cleaned = h.replace(/^#+\s+/, '').replace(/\*\*/g, '').trim();
    if (cleaned.length > 10 && cleaned.length < 200 && !headlines.includes(cleaned)) {
      headlines.push(cleaned);
    }
  });

  // Extract stock tickers (common patterns like $AAPL, AAPL, etc.)
  const tickerMatches = content.match(/\$[A-Z]{1,5}\b|\b[A-Z]{2,5}\s+(?:stock|shares|Inc\.|Corp\.|Ltd\.)/g) || [];
  const uniqueTickers = [...new Set(tickerMatches.map(t => t.replace(/\s+(stock|shares|Inc\.|Corp\.|Ltd\.)/i, '').trim()))];
  stockMentions.push(...uniqueTickers.slice(0, 15));

  // Extract key numbers (percentages, dollar amounts, significant figures)
  const numberMatches = content.match(/[-+]?\d+\.?\d*%|\$\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:billion|million|trillion|B|M|T))?|\d+(?:,\d{3})+(?:\.\d+)?/gi) || [];
  const uniqueNumbers = [...new Set(numberMatches)].slice(0, 12);
  keyNumbers.push(...uniqueNumbers);

  // Extract source URLs
  const urlMatches = content.match(/### Source:\s*(https?:\/\/[^\s\n]+)/g) || [];
  urlMatches.forEach(u => {
    const url = u.replace('### Source:', '').trim();
    if (!sources.includes(url)) sources.push(url);
  });

  // Extract bullet points and key sentences
  const bulletMatches = content.match(/^[-•*]\s+.{20,150}$/gm) || [];
  bulletMatches.forEach(b => {
    const cleaned = b.replace(/^[-•*]\s+/, '').trim();
    if (!summaryPoints.includes(cleaned)) summaryPoints.push(cleaned);
  });

  // Also extract sentences with key financial terms
  const sentences = content.split(/[.!?]+/).filter(s => 
    s.length > 40 && s.length < 250 &&
    /(?:market|stock|invest|earnings|revenue|profit|growth|decline|analyst|forecast|upgrade|downgrade)/i.test(s)
  );
  sentences.slice(0, 8).forEach(s => {
    const cleaned = s.trim();
    if (!summaryPoints.includes(cleaned) && cleaned.length > 30) {
      summaryPoints.push(cleaned);
    }
  });

  return {
    headlines: headlines.slice(0, 10),
    stockMentions,
    keyNumbers,
    summaryPoints: summaryPoints.slice(0, 8),
    sources: sources.slice(0, 5),
  };
}

const PLATFORMS: Platform[] = [
  { id: "workspace", name: "Workspace", url: "https://workspace.google.com", category: "Productivity", description: "Collaborative workspace tools" },
  { id: "marketbeat", name: "MarketBeat", url: "https://www.marketbeat.com", category: "Stock Analysis", description: "Stock market research and analysis" },
  { id: "factset", name: "FactSet", url: "https://www.factset.com", category: "Financial Data", description: "Integrated financial information" },
  { id: "quartr", name: "Quartr", url: "https://www.quartr.com", category: "Earnings", description: "Earnings calls and investor presentations" },
  { id: "koyfin", name: "Koyfin", url: "https://www.koyfin.com", category: "Analytics", description: "Financial data analytics platform" },
  { id: "aibase", name: "AIBase", url: "https://www.aibase.com", category: "AI Research", description: "AI-powered financial research" },
  { id: "spiking", name: "Spiking", url: "https://www.spiking.com", category: "Whale Tracking", description: "Track institutional investors" },
  { id: "feedly", name: "Feedly", url: "https://feedly.com", category: "News Aggregator", description: "RSS and news aggregation" },
  { id: "stocksplus", name: "Stocks+", url: "https://stocks.apple.com", category: "Portfolio", description: "Portfolio tracking and news" },
  { id: "seekingalpha", name: "Seeking Alpha", url: "https://seekingalpha.com", category: "Research", description: "Crowdsourced financial research" },
  { id: "tipranks", name: "TipRanks", url: "https://www.tipranks.com", category: "Analyst Ratings", description: "Analyst ratings and rankings" },
  { id: "investingcom", name: "Investing.com", url: "https://www.investing.com", category: "Markets", description: "Global financial portal" },
  { id: "tradingview", name: "TradingView", url: "https://www.tradingview.com", category: "Charts", description: "Charting and social network" },
  { id: "marketwatch", name: "MarketWatch", url: "https://www.marketwatch.com", category: "News", description: "Financial news and data" },
  { id: "yahoofinance", name: "Yahoo Finance", url: "https://finance.yahoo.com", category: "Finance Portal", description: "Comprehensive financial data" },
  { id: "cnbc", name: "CNBC", url: "https://www.cnbc.com", category: "Business News", description: "Business and financial news" },
  { id: "bloomberg", name: "Bloomberg", url: "https://www.bloomberg.com", category: "Financial Media", description: "Global business and finance news" },
  { id: "ft", name: "Financial Times", url: "https://www.ft.com", category: "Business Journalism", description: "International business news" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Productivity": "bg-blue-100 text-blue-800",
  "Stock Analysis": "bg-green-100 text-green-800",
  "Financial Data": "bg-purple-100 text-purple-800",
  "Earnings": "bg-amber-100 text-amber-800",
  "Analytics": "bg-cyan-100 text-cyan-800",
  "AI Research": "bg-pink-100 text-pink-800",
  "Whale Tracking": "bg-indigo-100 text-indigo-800",
  "News Aggregator": "bg-orange-100 text-orange-800",
  "Portfolio": "bg-teal-100 text-teal-800",
  "Research": "bg-rose-100 text-rose-800",
  "Analyst Ratings": "bg-emerald-100 text-emerald-800",
  "Markets": "bg-violet-100 text-violet-800",
  "Charts": "bg-lime-100 text-lime-800",
  "News": "bg-red-100 text-red-800",
  "Finance Portal": "bg-sky-100 text-sky-800",
  "Business News": "bg-fuchsia-100 text-fuchsia-800",
  "Financial Media": "bg-slate-100 text-slate-800",
  "Business Journalism": "bg-stone-100 text-stone-800",
};

export function FinancialResearchScraper() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([]);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("platforms");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const selectAll = () => {
    setSelectedPlatforms(PLATFORMS.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedPlatforms([]);
  };

  const scrapePlatforms = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform to scrape");
      return;
    }

    setIsScrapingInProgress(true);
    setScrapedData([]);
    setActiveTab("results");

    const platformsToScrape = PLATFORMS.filter(p => selectedPlatforms.includes(p.id));

    // Initialize all as pending
    setScrapedData(platformsToScrape.map(p => ({
      platform: p.name,
      content: "",
      scrapedAt: new Date().toISOString(),
      status: 'pending' as const,
    })));

    // Scrape each platform using the scrapeAll option to get all research URLs
    for (const platform of platformsToScrape) {
      try {
        const { data, error } = await supabase.functions.invoke('financial-research-scraper', {
          body: { 
            platformName: platform.id, 
            scrapeAll: true  // This tells the backend to scrape all research URLs for the platform
          }
        });

        if (error) throw error;

        const urlCount = data.scrapedUrls?.length || 0;
        const totalUrls = data.totalUrls || 0;

        setScrapedData(prev => prev.map(item =>
          item.platform === platform.name
            ? {
                ...item,
                content: data.content || "No content extracted",
                status: data.success ? 'success' as const : 'error' as const,
                scrapedAt: new Date().toISOString(),
                error: data.success ? undefined : data.error,
                scrapedUrls: data.scrapedUrls || [],
                totalUrls: data.totalUrls || 0,
              }
            : item
        ));

        if (data.success) {
          toast.success(`${platform.name}: Scraped ${data.scrapedUrls?.length || 0}/${data.totalUrls || 0} research pages`);
        }
      } catch (error) {
        console.error(`Error scraping ${platform.name}:`, error);
        setScrapedData(prev => prev.map(item =>
          item.platform === platform.name
            ? {
                ...item,
                status: 'error' as const,
                error: error instanceof Error ? error.message : "Failed to scrape",
              }
            : item
        ));
      }
    }

    setIsScrapingInProgress(false);
    const successCount = scrapedData.filter(d => d.status === 'success').length;
    toast.success(`Scraping completed! ${successCount}/${platformsToScrape.length} platforms scraped successfully`);
  };

  const generateAIReport = async () => {
    const successfulScrapes = scrapedData.filter(d => d.status === 'success');
    if (successfulScrapes.length === 0) {
      toast.error("No scraped data available. Please scrape platforms first.");
      return;
    }

    setIsGeneratingReport(true);
    setActiveTab("report");

    try {
      const { data, error } = await supabase.functions.invoke('financial-research-scraper', {
        body: {
          action: 'generate-report',
          scrapedData: successfulScrapes,
          customPrompt: customPrompt || undefined,
        }
      });

      if (error) throw error;

      setAiReport({
        summary: data.summary || "No summary generated",
        keyInsights: data.keyInsights || [],
        marketSentiment: data.marketSentiment || "Neutral",
        topStories: data.topStories || [],
        recommendations: data.recommendations || [],
        generatedAt: new Date().toISOString(),
      });

      toast.success("AI Report generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate AI report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getReportText = () => {
    if (!aiReport) return "";
    const successfulScrapes = scrapedData.filter(d => d.status === 'success');
    const sourceSection = successfulScrapes.length > 0
      ? `\n## Data Sources & Provenance\n${successfulScrapes.map(d => {
          const urls = d.scrapedUrls?.map(u => `  - ${u}`).join('\n') || '  - No URLs recorded';
          return `### ${d.platform} (Scraped: ${new Date(d.scrapedAt).toLocaleString()})\n${urls}`;
        }).join('\n\n')}`
      : '';

    return `# Financial Research AI Report
Generated: ${new Date(aiReport.generatedAt).toLocaleString()}

## Executive Summary
${aiReport.summary}

## Market Sentiment
${aiReport.marketSentiment}

## Key Insights
${aiReport.keyInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

## Top Stories
${aiReport.topStories.map((story, i) => `${i + 1}. ${story}`).join('\n')}

## Recommendations
${aiReport.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
${sourceSection}

---
Report generated by FlowPulse AI Research Engine`.trim();
  };

  const downloadReport = () => {
    const reportText = getReportText();
    if (!reportText) return;

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-research-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600 animate-pulse" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Financial Research Scraper
          </h2>
          <p className="text-muted-foreground mt-1">
            Scrape and analyze data from top financial research platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={scrapePlatforms}
            disabled={isScrapingInProgress || selectedPlatforms.length === 0}
            className="gap-2"
          >
            {isScrapingInProgress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Scrape Selected ({selectedPlatforms.length})
              </>
            )}
          </Button>
          <Button
            onClick={generateAIReport}
            disabled={isGeneratingReport || scrapedData.filter(d => d.status === 'success').length === 0}
            variant="secondary"
            className="gap-2"
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate AI Report
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms" className="gap-2">
            <Globe className="h-4 w-4" />
            Platforms
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Scraped Data
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-2">
            <FileText className="h-4 w-4" />
            AI Report
          </TabsTrigger>
        </TabsList>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Select Platforms to Scrape</CardTitle>
                  <CardDescription>Choose financial research platforms for data extraction</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {PLATFORMS.map((platform) => (
                  <div
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all duration-200
                      ${selectedPlatforms.includes(platform.id)
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{platform.name}</span>
                        </div>
                        <Badge className={`${CATEGORY_COLORS[platform.category]} text-xs`}>
                          {platform.category}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {platform.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom AI Prompt */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Custom AI Analysis Prompt (Optional)
              </CardTitle>
              <CardDescription>
                Add specific instructions for the AI when generating the report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="E.g., Focus on tech sector trends, highlight any bearish signals, summarize crypto market movements..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {scrapedData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No scraped data yet. Select platforms and click "Scrape Selected" to begin.</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[700px]">
              <div className="space-y-4 pr-4">
                {scrapedData.map((data, index) => {
                  const parsed = data.status === 'success' ? parseScrapedContent(data.content) : null;
                  
                  return (
                    <Card key={index} className={`
                      ${data.status === 'success' ? 'border-green-500/30 bg-green-50/30 dark:bg-green-950/10' : ''}
                      ${data.status === 'error' ? 'border-red-500/30 bg-red-50/30 dark:bg-red-950/10' : ''}
                      ${data.status === 'pending' ? 'border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10' : ''}
                    `}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
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
                            {parsed && parsed.stockMentions.length > 0 && (
                              <Badge variant="outline" className="gap-1">
                                <Activity className="h-3 w-3" />
                                {parsed.stockMentions.length} tickers
                              </Badge>
                            )}
                            <Badge variant={data.status === 'success' ? 'default' : data.status === 'error' ? 'destructive' : 'secondary'}>
                              {data.status}
                            </Badge>
                            {data.status === 'success' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const copyText = [
                                    `## ${data.platform} — Scraped ${new Date(data.scrapedAt).toLocaleString()}`,
                                    parsed?.headlines.length ? `\n### Headlines\n${parsed.headlines.map(h => `- ${h}`).join('\n')}` : '',
                                    parsed?.keyNumbers.length ? `\n### Key Figures\n${parsed.keyNumbers.join(' | ')}` : '',
                                    parsed?.stockMentions.length ? `\n### Tickers\n${parsed.stockMentions.join(', ')}` : '',
                                    parsed?.summaryPoints.length ? `\n### Key Points\n${parsed.summaryPoints.map(p => `- ${p}`).join('\n')}` : '',
                                    data.scrapedUrls?.length ? `\n### Sources\n${data.scrapedUrls.map(u => `- ${u}`).join('\n')}` : '',
                                  ].filter(Boolean).join('\n');
                                  handleCopy(copyText, `platform-${index}`);
                                }}
                                className="h-7 px-2"
                              >
                                {copiedId === `platform-${index}` ? (
                                  <Check className="h-3.5 w-3.5 text-green-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        {data.scrapedAt && data.status === 'success' && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            Scraped at {new Date(data.scrapedAt).toLocaleString()}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {data.status === 'pending' && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Scraping research pages...
                          </div>
                        )}
                        {data.status === 'error' && (
                          <p className="text-red-600 text-sm">{data.error}</p>
                        )}
                        {data.status === 'success' && parsed && (
                          <div className="space-y-4">
                            {/* Source URLs */}
                            {data.scrapedUrls && data.scrapedUrls.length > 0 && (
                              <div className="space-y-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-800">
                                  <Globe className="h-4 w-4" />
                                  Data Sources ({data.scrapedUrls.length} pages scraped)
                                </h4>
                                <div className="space-y-1">
                                  {data.scrapedUrls.map((url, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-700 hover:underline truncate"
                                      >
                                        {url}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Stock Tickers */}
                            {parsed.stockMentions.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-primary" />
                                  Stock Mentions
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {parsed.stockMentions.map((ticker, i) => (
                                    <Badge key={i} variant="secondary" className="font-mono text-xs">
                                      {ticker}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Key Numbers */}
                            {parsed.keyNumbers.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-amber-500" />
                                  Key Figures
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {parsed.keyNumbers.map((num, i) => (
                                    <Badge key={i} variant="outline" className={`text-xs ${
                                      num.includes('-') ? 'text-red-600 border-red-200' :
                                      num.includes('+') ? 'text-green-600 border-green-200' :
                                      'text-foreground'
                                    }`}>
                                      {num}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Headlines */}
                            {parsed.headlines.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <Newspaper className="h-4 w-4 text-blue-500" />
                                  Headlines
                                </h4>
                                <ul className="space-y-1">
                                  {parsed.headlines.slice(0, 5).map((headline, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-primary font-semibold">•</span>
                                      {headline}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Key Points */}
                            {parsed.summaryPoints.length > 0 && (
                              <Collapsible>
                                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
                                  <ChevronDown className="h-4 w-4" />
                                  Key Research Points ({parsed.summaryPoints.length})
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2">
                                  <ul className="space-y-2 pl-4 border-l-2 border-primary/20">
                                    {parsed.summaryPoints.map((point, i) => (
                                      <li key={i} className="text-sm text-muted-foreground">
                                        {point}
                                      </li>
                                    ))}
                                  </ul>
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report" className="space-y-4">
          {!aiReport && !isGeneratingReport ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No report generated yet. Scrape platforms first, then click "Generate AI Report".</p>
              </CardContent>
            </Card>
          ) : isGeneratingReport ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-12 w-12 mx-auto text-primary mb-4 animate-spin" />
                <p className="text-muted-foreground">AI is analyzing the scraped data and generating your report...</p>
              </CardContent>
            </Card>
          ) : aiReport && (
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleCopy(getReportText(), 'report')}
                >
                  {copiedId === 'report' ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Report
                    </>
                  )}
                </Button>
                <Button onClick={downloadReport} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>

              {/* Executive Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-primary" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{aiReport.summary}</p>
                </CardContent>
              </Card>

              {/* Market Sentiment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Market Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={`
                    ${aiReport.marketSentiment.toLowerCase().includes('bullish') ? 'bg-green-100 text-green-800' : ''}
                    ${aiReport.marketSentiment.toLowerCase().includes('bearish') ? 'bg-red-100 text-red-800' : ''}
                    ${aiReport.marketSentiment.toLowerCase().includes('neutral') ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {aiReport.marketSentiment}
                  </Badge>
                </CardContent>
              </Card>

              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiReport.keyInsights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                        <span className="text-muted-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Top Stories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-primary" />
                    Top Stories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiReport.topStories.map((story, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary font-semibold">{i + 1}.</span>
                        <span className="text-muted-foreground">{story}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiReport.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                        <span className="text-primary font-semibold">{i + 1}.</span>
                        <span className="text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
